<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Concerns\AuthorizesFitAccess;
use App\Http\Controllers\Controller;
use App\Models\FitClient;
use App\Models\FitClientExerciseScore;
use App\Models\FitRoutine;
use App\Models\FitRoutineExercise;
use App\Models\FitWorkoutSet;
use App\Services\WorkoutSessionFinisher;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class RoutineController extends Controller
{
    use AuthorizesFitAccess;

    public function dashboard(): JsonResponse
    {
        $trainer = $this->trainerUser();
        $clientsQuery = FitClient::query()->where('trainer_id', $trainer->id);
        $routinesQuery = FitRoutine::query()->where('trainer_id', $trainer->id);

        return response()->json(['data' => [
            'clients' => (clone $clientsQuery)->count(),
            'routines' => (clone $routinesQuery)->count(),
            'exercises' => FitRoutineExercise::query()->whereHas('routine', fn ($query) => $query->where('trainer_id', $trainer->id))->count(),
            'lastClients' => (clone $clientsQuery)->latest()->limit(5)->get()->map(fn ($client) => $client->toArray())->all(),
            'lastRoutines' => (clone $routinesQuery)->with(['client:id,name,whatsapp', 'muscleGroup:id,name'])->latest()->limit(5)->get()->map(fn ($routine) => self::routinePayload($routine))->all(),
        ]]);
    }

    public function index(): JsonResponse
    {
        $trainer = $this->trainerUser();
        $routines = FitRoutine::query()
            ->where('trainer_id', $trainer->id)
            ->with(['client:id,name,whatsapp', 'muscleGroup:id,name'])
            ->withCount('exercises')
            ->latest()
            ->get()
            ->map(fn ($routine): array => self::routinePayload($routine))
            ->all();

        return response()->json(['data' => ['routines' => $routines]]);
    }

    public function store(Request $request): JsonResponse
    {
        $trainer = $this->trainerUser();
        $validated = $request->validate([
            'client_id' => ['nullable', 'integer', 'exists:fit_clients,id'],
            ...$this->routineRules(),
        ]);

        $clientId = isset($validated['client_id']) ? (int) $validated['client_id'] : null;
        if ($clientId !== null) {
            $this->ownedClient($clientId);
        }

        return $this->createdRoutineResponse(
            $this->createRoutine($trainer->id, $clientId, $validated)
        );
    }

    public function storeForClient(Request $request, int $client): JsonResponse
    {
        $trainer = $this->trainerUser();
        $profile = $this->ownedClient($client);
        $validated = $request->validate($this->routineRules());

        return $this->createdRoutineResponse(
            $this->createRoutine($trainer->id, $profile->id, $validated)
        );
    }

    public function show(int $routine): JsonResponse
    {
        $model = $this->accessibleRoutine($routine);
        $model->load(['client:id,name,whatsapp', 'muscleGroup:id,name', 'exercises']);

        return response()->json(['data' => [
            'routine' => self::routinePayload($model),
            'exercises' => $this->exercisePayloads($model),
            'workout_session' => $this->latestWorkoutSession($model),
        ]]);
    }

    public function storeExercise(Request $request, int $routine): JsonResponse
    {
        $model = $this->ownedRoutine($routine);
        $validated = $request->validate($this->exerciseRules());

        $exercise = $model->exercises()->create([
            ...$validated,
            'sort_order' => ((int) $model->exercises()->max('sort_order')) + 1,
        ]);

        return response()->json([
            'message' => 'Ejercicio agregado.',
            'data' => ['exercise' => $this->exercisePayload($exercise, $model->client_id)],
        ], 201);
    }

    public function updateExercise(Request $request, int $routine, int $exercise): JsonResponse
    {
        $model = $this->ownedRoutine($routine);
        $exerciseModel = $model->exercises()->whereKey($exercise)->first();

        if (! $exerciseModel) {
            throw (new ModelNotFoundException())->setModel(FitRoutineExercise::class, [$exercise]);
        }

        $validated = $request->validate($this->exerciseRules());
        $oldKey = Str::slug(Str::lower(trim($exerciseModel->name)));
        $newKey = Str::slug(Str::lower(trim($validated['name'])));

        DB::transaction(function () use ($model, $exerciseModel, $validated, $oldKey, $newKey): void {
            $exerciseModel->update($validated);

            if ($oldKey !== $newKey && $model->client_id) {
                DB::table('fit_client_exercise_scores')
                    ->where('client_id', $model->client_id)
                    ->where('exercise_key', $oldKey)
                    ->update([
                        'exercise_key' => $newKey,
                        'exercise_name' => $validated['name'],
                        'updated_at' => now(),
                    ]);
            }

            if ($oldKey !== $newKey) {
                DB::table('fit_workout_session_results')
                    ->where('routine_id', $model->id)
                    ->where('exercise_id', $exerciseModel->id)
                    ->update([
                        'exercise_key' => $newKey,
                        'exercise_name' => $validated['name'],
                        'updated_at' => now(),
                    ]);
            }
        });

        $exerciseModel->refresh();

        return response()->json([
            'message' => 'Ejercicio actualizado.',
            'data' => ['exercise' => $this->exercisePayload($exerciseModel, $model->client_id)],
        ]);
    }

    public function destroy(int $routine): JsonResponse
    {
        $model = $this->ownedRoutine($routine);

        DB::transaction(function () use ($model): void {
            DB::table('fit_workout_sets')->where('routine_id', $model->id)->delete();
            DB::table('fit_workout_sessions')->where('routine_id', $model->id)->delete();
            $model->exercises()->delete();
            $model->delete();
        });

        return response()->json(['message' => 'Rutina eliminada.']);
    }

    public function destroyExercise(int $routine, int $exercise): JsonResponse
    {
        $model = $this->ownedRoutine($routine);
        $exerciseModel = $model->exercises()->whereKey($exercise)->first();

        if (! $exerciseModel) {
            throw (new ModelNotFoundException())->setModel(FitRoutineExercise::class, [$exercise]);
        }

        DB::transaction(function () use ($model, $exerciseModel): void {
            DB::table('fit_workout_sets')
                ->where('routine_id', $model->id)
                ->where('exercise_id', $exerciseModel->id)
                ->delete();
            $exerciseModel->delete();
        });

        return response()->json(['message' => 'Ejercicio eliminado.']);
    }

    public function moveExercise(Request $request, int $routine, int $exercise): JsonResponse
    {
        $model = $this->ownedRoutine($routine);
        $validated = $request->validate([
            'direction' => ['required', 'in:up,down'],
        ]);

        $ordered = $model->exercises()->get()->values();
        $index = $ordered->search(fn (FitRoutineExercise $item): bool => $item->id === $exercise);

        if ($index === false) {
            throw (new ModelNotFoundException())->setModel(FitRoutineExercise::class, [$exercise]);
        }

        $targetIndex = $validated['direction'] === 'up' ? $index - 1 : $index + 1;

        if ($targetIndex >= 0 && $targetIndex < $ordered->count()) {
            $items = $ordered->all();
            [$items[$index], $items[$targetIndex]] = [$items[$targetIndex], $items[$index]];

            DB::transaction(function () use ($items): void {
                foreach ($items as $position => $item) {
                    $item->update(['sort_order' => $position + 1]);
                }
            });
        }

        return response()->json([
            'message' => 'Orden actualizado.',
            'data' => ['exercises' => $this->exercisePayloads($model)],
        ]);
    }

    public function workoutReport(int $routine): JsonResponse
    {
        $model = $this->accessibleRoutine($routine);

        return response()->json(['data' => ['logs' => $this->logs($model)]]);
    }

    public function publicShow(string $token): JsonResponse
    {
        $routine = FitRoutine::query()
            ->where('share_token', $token)
            ->where('is_published', true)
            ->with(['trainer:id,name', 'client:id,name,whatsapp', 'exercises'])
            ->first();

        if (! $routine) {
            throw (new ModelNotFoundException())->setModel(FitRoutine::class, [$token]);
        }

        $payload = self::routinePayload($routine);
        $payload['trainer_name'] = $routine->trainer?->name;

        return response()->json(['data' => [
            'routine' => $payload,
            'exercises' => $this->exercisePayloads($routine),
            'logs' => $this->logs($routine),
        ]]);
    }

    public function clientPortal(): JsonResponse
    {
        $client = $this->clientProfile();
        $client->load([
            'trainer:id,name',
            'measurements' => fn ($query) => $query->latest('measured_at')->limit(3),
        ]);

        $routines = FitRoutine::query()
            ->where('client_id', $client->id)
            ->with('exercises')
            ->latest()
            ->get()
            ->map(fn (FitRoutine $routine): array => [
                'routine' => self::routinePayload($routine),
                'exercises' => $this->exercisePayloads($routine),
                'logs' => $this->logs($routine),
            ])->all();

        $clientPayload = $client->toArray();
        $clientPayload['trainer_name'] = $client->trainer?->name;
        $clientPayload['access_enabled'] = $client->access_enabled ? 1 : 0;
        unset($clientPayload['trainer'], $clientPayload['measurements']);

        return response()->json(['data' => [
            'client' => $clientPayload,
            'routines' => $routines,
            'measurements' => $client->measurements->map(fn ($measurement) => $measurement->toArray())->all(),
        ]]);
    }


    private function exercisePayloads(FitRoutine $routine): array
    {
        $exercises = $routine->relationLoaded('exercises')
            ? $routine->exercises
            : $routine->exercises()->get();

        if (! $routine->client_id || $exercises->isEmpty()) {
            return $exercises->map(fn (FitRoutineExercise $exercise): array => $exercise->toArray())->all();
        }

        $keys = $exercises
            ->map(fn (FitRoutineExercise $exercise): string => Str::slug(Str::lower(trim($exercise->name))))
            ->unique()
            ->values();
        $scores = FitClientExerciseScore::query()
            ->where('client_id', $routine->client_id)
            ->whereIn('exercise_key', $keys)
            ->get()
            ->keyBy('exercise_key');

        return $exercises->map(function (FitRoutineExercise $exercise) use ($scores): array {
            $payload = $exercise->toArray();
            $score = $scores->get(Str::slug(Str::lower(trim($exercise->name))));
            $payload['last_score'] = $score ? $this->scorePayload($score) : null;
            return $payload;
        })->all();
    }

    private function exercisePayload(FitRoutineExercise $exercise, ?int $clientId): array
    {
        $payload = $exercise->toArray();
        if (! $clientId) {
            $payload['last_score'] = null;
            return $payload;
        }

        $score = FitClientExerciseScore::query()
            ->where('client_id', $clientId)
            ->where('exercise_key', Str::slug(Str::lower(trim($exercise->name))))
            ->first();
        $payload['last_score'] = $score ? $this->scorePayload($score) : null;
        return $payload;
    }

    private function exerciseRules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'muscle_group' => ['nullable', 'string', 'max:255'],
            'sets' => ['required', 'integer', 'min:1', 'max:100'],
            'reps' => ['required', 'string', 'max:60'],
            'rest_seconds' => ['nullable', 'integer', 'min:0', 'max:3600'],
            'rest_seconds_overrides' => ['nullable', 'array'],
            'rest_seconds_overrides.*' => ['nullable', 'integer', 'min:0', 'max:3600'],
            'target_weight_kg' => ['nullable', 'numeric', 'min:0', 'max:999.99'],
            'tempo' => ['nullable', 'string', 'max:80'],
            'method' => ['nullable', 'string', 'max:120'],
            'notes' => ['nullable', 'string'],
        ];
    }

    private function scorePayload(FitClientExerciseScore $score): array
    {
        return [
            'exercise_name' => $score->exercise_name,
            'total_volume' => $score->total_volume,
            'best_weight_kg' => $score->best_weight_kg,
            'best_reps' => $score->best_reps,
            'estimated_one_rep_max' => $score->estimated_one_rep_max,
            'completed_sets' => $score->completed_sets,
            'last_sets' => $score->last_sets ?? [],
            'performed_at' => $score->performed_at?->toISOString(),
        ];
    }

    private function routineRules(): array
    {
        return [
            'muscle_group_id' => ['nullable', 'integer', 'exists:fit_muscle_groups,id'],
            'title' => ['required', 'string', 'max:255'],
            'objective' => ['nullable', 'string'],
            'level' => ['nullable', 'string', 'max:80'],
            'notes' => ['nullable', 'string'],
        ];
    }

    private function createRoutine(int $trainerId, ?int $clientId, array $validated): FitRoutine
    {
        return FitRoutine::query()->create([
            'trainer_id' => $trainerId,
            'client_id' => $clientId,
            'muscle_group_id' => $validated['muscle_group_id'] ?? null,
            'title' => $validated['title'],
            'objective' => $validated['objective'] ?? null,
            'level' => $validated['level'] ?? null,
            'notes' => $validated['notes'] ?? null,
            'share_token' => Str::random(64),
            'is_published' => true,
        ]);
    }

    private function createdRoutineResponse(FitRoutine $routine): JsonResponse
    {
        $routine->loadMissing(['client:id,name,whatsapp', 'muscleGroup:id,name']);

        return response()->json([
            'message' => $routine->client_id ? 'Rutina creada y asignada correctamente.' : 'Rutina general creada correctamente.',
            'data' => ['routine' => self::routinePayload($routine)],
        ], 201);
    }

    public static function routinePayload(FitRoutine $routine): array
    {
        $payload = $routine->toArray();
        $payload['is_published'] = $routine->is_published ? 1 : 0;
        $payload['client_name'] = $routine->relationLoaded('client') ? $routine->client?->name : null;
        $payload['client_whatsapp'] = $routine->relationLoaded('client') ? $routine->client?->whatsapp : null;
        $payload['muscle_group_name'] = $routine->relationLoaded('muscleGroup') ? $routine->muscleGroup?->name : null;
        if (isset($routine->exercises_count)) {
            $payload['exercises_count'] = (int) $routine->exercises_count;
        }
        unset($payload['client'], $payload['trainer'], $payload['exercises'], $payload['workout_sets'], $payload['muscle_group']);

        return $payload;
    }

    private function latestWorkoutSession(FitRoutine $routine): ?array
    {
        $session = $routine->workoutSessions()->first();

        if (! $session) {
            return null;
        }

        // Si quedó activa de un día anterior (el atleta nunca tocó "Finalizar"),
        // la cerramos aquí mismo al abrir la rutina, sin esperar al cron de las 23:00.
        if ($session->ended_at === null && $routine->client_id && ! $session->started_at->isToday()) {
            $session = app(WorkoutSessionFinisher::class)->finish($session, $routine);
        }

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

    private function logs(FitRoutine $routine): array
    {
        if (! $routine->client_id) {
            return [];
        }

        return FitWorkoutSet::query()
            ->where('routine_id', $routine->id)
            ->where('client_id', $routine->client_id)
            ->with('exercise:id,name')
            ->orderBy('exercise_id')
            ->orderBy('set_number')
            ->get()
            ->map(function (FitWorkoutSet $set): array {
                $payload = $set->toArray();
                $payload['exercise_name'] = $set->exercise?->name;
                unset($payload['exercise']);
                return $payload;
            })->all();
    }
}
