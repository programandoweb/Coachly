<?php

namespace App\Services;

use App\Models\FitClientExerciseScore;
use App\Models\FitRoutine;
use App\Models\FitWorkoutSession;
use App\Models\FitWorkoutSessionResult;
use App\Models\FitWorkoutSet;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Cierra un entrenamiento activo: guarda el snapshot de resultados/puntajes
 * y limpia las series temporales. Se usa tanto cuando el atleta toca
 * "Finalizar entrenamiento" como cuando el sistema cierra automáticamente
 * una sesión que quedó abierta (ver AutoCloseStaleWorkoutSessions).
 */
class WorkoutSessionFinisher
{
    public function finish(FitWorkoutSession $session, FitRoutine $routine, ?Carbon $endedAt = null): FitWorkoutSession
    {
        return DB::transaction(function () use ($session, $routine, $endedAt): FitWorkoutSession {
            $resolvedEndedAt = $endedAt ?? $this->resolveEndedAt($session, $routine);

            $session->forceFill([
                'ended_at' => $resolvedEndedAt,
                'duration_seconds' => max(0, $session->started_at->diffInSeconds($resolvedEndedAt)),
            ])->save();

            $this->snapshotWorkoutResults($session, $routine);

            return $session->fresh();
        });
    }

    /**
     * Cuando cerramos una sesion abandonada (no fue el atleta quien tocó
     * "Finalizar"), usamos el momento de la última serie registrada como
     * hora de cierre en vez de "ahora", para no inflar la duración con
     * horas en las que el celular estuvo simplemente bloqueado.
     */
    private function resolveEndedAt(FitWorkoutSession $session, FitRoutine $routine): Carbon
    {
        $lastCompletedAt = FitWorkoutSet::query()
            ->where('routine_id', $routine->id)
            ->where('client_id', $routine->client_id)
            ->max('completed_at');

        if ($lastCompletedAt) {
            return Carbon::parse($lastCompletedAt);
        }

        return $session->started_at->copy();
    }

    private function snapshotWorkoutResults(FitWorkoutSession $session, FitRoutine $routine): void
    {
        $sets = FitWorkoutSet::query()
            ->where('routine_id', $routine->id)
            ->where('client_id', $routine->client_id)
            ->with('exercise:id,name,muscle_group')
            ->orderBy('exercise_id')
            ->orderBy('set_number')
            ->get();

        foreach ($sets->groupBy('exercise_id') as $exerciseSets) {
            $exercise = $exerciseSets->first()?->exercise;
            if (! $exercise) {
                continue;
            }

            $exerciseKey = Str::slug(Str::lower(trim($exercise->name)));
            $lastSets = [];
            $totalVolume = 0.0;
            $bestWeight = null;
            $bestReps = null;
            $estimatedOneRepMax = null;

            foreach ($exerciseSets as $set) {
                $weight = $set->weight_kg !== null ? (float) $set->weight_kg : null;
                $reps = $set->reps_done !== null ? (int) $set->reps_done : null;
                $volume = ($weight ?? 0) * ($reps ?? 0);
                $estimate = ($weight !== null && $reps !== null && $reps > 0)
                    ? $weight * (1 + ($reps / 30))
                    : null;

                FitWorkoutSessionResult::query()->updateOrCreate([
                    'workout_session_id' => $session->id,
                    'exercise_id' => $exercise->id,
                    'set_number' => $set->set_number,
                ], [
                    'routine_id' => $routine->id,
                    'client_id' => $routine->client_id,
                    'exercise_key' => $exerciseKey,
                    'exercise_name' => $exercise->name,
                    'muscle_group' => $exercise->muscle_group,
                    'weight_kg' => $weight,
                    'reps_done' => $reps,
                    'volume_score' => round($volume, 2),
                    'completed_at' => $set->completed_at,
                ]);

                $lastSets[] = [
                    'set_number' => (int) $set->set_number,
                    'weight_kg' => $weight,
                    'reps_done' => $reps,
                ];
                $totalVolume += $volume;
                $bestWeight = $weight !== null ? max($bestWeight ?? $weight, $weight) : $bestWeight;
                $bestReps = $reps !== null ? max($bestReps ?? $reps, $reps) : $bestReps;
                $estimatedOneRepMax = $estimate !== null
                    ? max($estimatedOneRepMax ?? $estimate, $estimate)
                    : $estimatedOneRepMax;
            }

            FitClientExerciseScore::query()->updateOrCreate([
                'client_id' => $routine->client_id,
                'exercise_key' => $exerciseKey,
            ], [
                'exercise_name' => $exercise->name,
                'last_workout_session_id' => $session->id,
                'total_volume' => round($totalVolume, 2),
                'best_weight_kg' => $bestWeight,
                'best_reps' => $bestReps,
                'estimated_one_rep_max' => $estimatedOneRepMax !== null ? round($estimatedOneRepMax, 2) : null,
                'completed_sets' => count($lastSets),
                'last_sets' => $lastSets,
                'performed_at' => $session->ended_at,
            ]);
        }

        FitWorkoutSet::query()
            ->where('routine_id', $routine->id)
            ->where('client_id', $routine->client_id)
            ->delete();
    }
}
