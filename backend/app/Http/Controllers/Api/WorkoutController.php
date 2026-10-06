<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Concerns\AuthorizesFitAccess;
use App\Http\Controllers\Controller;
use App\Models\FitClient;
use App\Models\FitClientExerciseScore;
use App\Models\FitRoutineExercise;
use App\Models\FitWorkoutSession;
use App\Models\FitWorkoutSet;
use App\Models\User;
use App\Services\WorkoutSessionFinisher;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Throwable;

class WorkoutController extends Controller
{
    use AuthorizesFitAccess;

    public function session(Request $request, int $routine): JsonResponse
    {
        $model = $this->accessibleRoutine($routine);
        $validated = $request->validate([
            'action' => ['required', 'string', Rule::in(['start', 'finish'])],
        ]);

        if ($validated['action'] === 'start' && ! $model->exercises()->exists()) {
            throw ValidationException::withMessages([
                'routine' => ['La rutina debe tener al menos un ejercicio para iniciar el entrenamiento.'],
            ]);
        }

        $session = DB::transaction(function () use ($model, $validated): FitWorkoutSession {
            $active = FitWorkoutSession::query()
                ->where('routine_id', $model->id)
                ->whereNull('ended_at')
                ->lockForUpdate()
                ->latest('started_at')
                ->first();

            if ($validated['action'] === 'start') {
                if ($active && ! $active->started_at->isToday()) {
                    // Quedó activa de un día anterior (nunca se tocó "Finalizar"): la
                    // cerramos con los datos que ya tenía antes de arrancar una nueva.
                    app(WorkoutSessionFinisher::class)->finish($active, $model);
                    $active = null;
                }

                if ($active) {
                    return $active;
                }

                return FitWorkoutSession::query()->create([
                    'routine_id' => $model->id,
                    'client_id' => $model->client_id,
                    'trainer_id' => $model->trainer_id,
                    'started_by' => auth('api')->id(),
                    'started_at' => now(),
                ]);
            }

            if (! $active) {
                throw ValidationException::withMessages([
                    'workout_session' => ['No existe un entrenamiento activo para finalizar.'],
                ]);
            }

            return app(WorkoutSessionFinisher::class)->finish($active, $model, now());
        });

        return response()->json([
            'message' => $session->ended_at ? 'Entrenamiento finalizado correctamente.' : 'Entrenamiento iniciado correctamente.',
            'data' => [
                'workout_session' => $this->sessionPayload($session),
                'exercise_scores' => $session->ended_at ? $this->exerciseScoresPayload($model->id, $model->client_id) : [],
            ],
        ]);
    }

    public function upsert(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'exercise_id' => ['required', 'integer', 'exists:fit_routine_exercises,id'],
            'set_number' => ['required', 'integer', 'min:1', 'max:100'],
            'weight_kg' => ['nullable', 'numeric', 'min:0', 'max:999.99'],
            'reps_done' => ['nullable', 'integer', 'min:0', 'max:10000'],
            'share_token' => ['nullable', 'string', 'max:100'],
            'completed' => ['sometimes', 'boolean'],
        ]);

        $exercise = FitRoutineExercise::query()->with('routine')->findOrFail((int) $validated['exercise_id']);
        $routine = $exercise->routine;

        if (! $routine->client_id) {
            throw ValidationException::withMessages(['routine' => ['La rutina debe estar asignada a un cliente.']]);
        }

        if ((int) $validated['set_number'] > (int) $exercise->sets) {
            throw ValidationException::withMessages(['set_number' => ['La serie supera las series configuradas.']]);
        }

        if (! $this->authorized($routine->trainer_id, $routine->client_id, $routine->share_token, $routine->is_published, $validated['share_token'] ?? null)) {
            throw new AuthorizationException('No tienes permiso para registrar esta serie.');
        }

        $completed = (bool) ($validated['completed'] ?? true);
        $result = DB::transaction(function () use ($routine, $exercise, $validated, $completed): array {
            $identity = [
                'routine_id' => $routine->id,
                'client_id' => $routine->client_id,
                'exercise_id' => $exercise->id,
                'set_number' => (int) $validated['set_number'],
            ];

            if (! $completed) {
                FitWorkoutSet::query()->where($identity)->delete();
                return ['completed' => false, 'completed_at' => null];
            }

            $set = FitWorkoutSet::query()->updateOrCreate($identity, [
                'weight_kg' => $validated['weight_kg'] ?? null,
                'reps_done' => $validated['reps_done'] ?? null,
                'completed_at' => now(),
            ]);

            return ['completed' => true, 'completed_at' => $set->completed_at?->toISOString()];
        });

        return response()->json(['message' => 'Progreso actualizado.', 'data' => $result]);
    }


    private function exerciseScoresPayload(int $routineId, ?int $clientId): array
    {
        if (! $clientId) {
            return [];
        }

        $exercises = FitRoutineExercise::query()->where('routine_id', $routineId)->get(['id', 'name']);
        $keys = $exercises->map(fn (FitRoutineExercise $exercise): string => Str::slug(Str::lower(trim($exercise->name))))->unique()->values();
        $scores = FitClientExerciseScore::query()
            ->where('client_id', $clientId)
            ->whereIn('exercise_key', $keys)
            ->get()
            ->keyBy('exercise_key');

        return $exercises->mapWithKeys(function (FitRoutineExercise $exercise) use ($scores): array {
            $key = Str::slug(Str::lower(trim($exercise->name)));
            $score = $scores->get($key);
            if (! $score) {
                return [];
            }

            return [(string) $exercise->id => [
                'exercise_name' => $score->exercise_name,
                'total_volume' => $score->total_volume,
                'best_weight_kg' => $score->best_weight_kg,
                'best_reps' => $score->best_reps,
                'estimated_one_rep_max' => $score->estimated_one_rep_max,
                'completed_sets' => $score->completed_sets,
                'last_sets' => $score->last_sets ?? [],
                'performed_at' => $score->performed_at?->toISOString(),
            ]];
        })->all();
    }

    private function sessionPayload(FitWorkoutSession $session): array
    {
        return [
            'id' => $session->id,
            'routine_id' => $session->routine_id,
            'client_id' => $session->client_id,
            'trainer_id' => $session->trainer_id,
            'started_by' => $session->started_by,
            'started_at' => $session->started_at?->toISOString(),
            'ended_at' => $session->ended_at?->toISOString(),
            'duration_seconds' => $session->duration_seconds,
            'is_active' => $session->ended_at === null,
        ];
    }

    private function authorized(int $trainerId, int $clientId, string $expectedToken, bool $published, ?string $shareToken): bool
    {
        if ($published && is_string($shareToken) && $shareToken !== '' && hash_equals($expectedToken, $shareToken)) {
            return true;
        }

        try {
            /** @var User|null $user */
            $user = auth('api')->user();
        } catch (Throwable) {
            $user = null;
        }

        if (! $user) {
            return false;
        }

        if ($user->role === User::ROLE_TRAINER && $user->id === $trainerId) {
            return true;
        }

        return $user->role === User::ROLE_CLIENT
            && FitClient::query()
                ->whereKey($clientId)
                ->where('user_id', $user->id)
                ->where('access_enabled', true)
                ->exists();
    }
}
