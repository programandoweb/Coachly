<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Concerns\AuthorizesFitAccess;
use App\Http\Controllers\Controller;
use App\Mail\ClientWelcomeMail;
use App\Models\FitClient;
use App\Models\FitClientExerciseScore;
use App\Models\FitMeasurement;
use App\Models\FitRoutine;
use App\Models\FitWorkoutSessionResult;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class ClientController extends Controller
{
    use AuthorizesFitAccess;

    public function index(): JsonResponse
    {
        $trainer = $this->trainerUser();
        $clients = FitClient::query()
            ->where('trainer_id', $trainer->id)
            ->withCount(['routines', 'measurements'])
            ->latest()
            ->get()
            ->map(fn (FitClient $client): array => $this->clientPayload($client))
            ->all();

        return response()->json(['data' => ['clients' => $clients]]);
    }

    public function basic(): JsonResponse
    {
        $trainer = $this->trainerUser();
        $clients = FitClient::query()
            ->where('trainer_id', $trainer->id)
            ->orderBy('name')
            ->get()
            ->map(fn (FitClient $client): array => $this->clientPayload($client))
            ->all();

        return response()->json(['data' => ['clients' => $clients]]);
    }

    public function store(Request $request): JsonResponse
    {
        $trainer = $this->trainerUser();
        $validated = $request->validate($this->storeRules(), $this->uniqueMessages());

        $client = DB::transaction(function () use ($trainer, $validated): FitClient {
            $accessEnabled = (bool) ($validated['access_enabled'] ?? false);
            $user = null;

            if ($accessEnabled) {
                $user = User::query()->create([
                    'name' => $validated['name'],
                    'email' => $validated['email'] ?? null,
                    'whatsapp' => $validated['whatsapp'],
                    'password' => Hash::make((string) $validated['password']),
                    'role' => User::ROLE_CLIENT,
                    'is_active' => true,
                ]);
            }

            return FitClient::query()->create([
                'trainer_id' => $trainer->id,
                'user_id' => $user?->id,
                'name' => $validated['name'],
                'whatsapp' => $validated['whatsapp'],
                'email' => $validated['email'] ?? null,
                'birth_date' => $validated['birth_date'] ?? null,
                'gender' => $validated['gender'] ?? null,
                'goal' => $validated['goal'] ?? null,
                'weight_kg' => $validated['weight_kg'] ?? null,
                'height_cm' => $validated['height_cm'] ?? null,
                'health_survey' => $validated['health_survey'] ?? null,
                'injuries' => $validated['injuries'] ?? null,
                'medical_conditions' => $validated['medical_conditions'] ?? null,
                'medications' => $validated['medications'] ?? null,
                'training_experience' => $validated['training_experience'] ?? null,
                'available_days' => $validated['available_days'] ?? null,
                'notes' => $validated['notes'] ?? null,
                'access_enabled' => $accessEnabled,
            ]);
        });

        if ($client->access_enabled && $client->email && ! $this->isPlaceholderEmail($client->email)) {
            try {
                Mail::to($client->email)->send(
                    new ClientWelcomeMail($client, $trainer, $validated['password'] ?? null)
                );
            } catch (\Throwable $exception) {
                Log::warning('No fue posible enviar el correo de bienvenida al cliente.', [
                    'client_id' => $client->id,
                    'error' => $exception->getMessage(),
                ]);
            }
        }

        return response()->json([
            'message' => 'Cliente creado.',
            'data' => ['client' => $this->clientPayload($client)],
        ], 201);
    }

    public function shareAccess(int $client): JsonResponse
    {
        $profile = $this->ownedClient($client);

        if (! $profile->user_id) {
            return response()->json([
                'message' => 'Este cliente no tiene acceso habilitado a la app.',
            ], 422);
        }

        return response()->json([
            'message' => 'Acceso listo para compartir.',
            'data' => ['client' => $this->clientPayload($profile)],
        ]);
    }

    public function setActive(Request $request, int $client): JsonResponse
    {
        $profile = $this->ownedClient($client);
        $validated = $request->validate(['is_active' => ['required', 'boolean']]);

        if (! $profile->user_id) {
            return response()->json(['message' => 'Este cliente no tiene acceso habilitado a la app.'], 422);
        }

        User::query()->whereKey($profile->user_id)->update(['is_active' => (bool) $validated['is_active']]);

        return response()->json([
            'message' => $validated['is_active'] ? 'Perfil activado.' : 'Perfil desactivado.',
            'data' => ['client' => $this->clientPayload($profile->fresh())],
        ]);
    }

    public function show(int $client): JsonResponse
    {
        $profile = $this->ownedClient($client);
        $profile->load([
            'routines' => fn ($query) => $query->latest(),
            'measurements' => fn ($query) => $query->latest('measured_at'),
        ]);

        return response()->json(['data' => [
            'client' => $this->clientPayload($profile),
            'routines' => $profile->routines->map(fn ($routine): array => RoutineController::routinePayload($routine))->all(),
            'measurements' => $profile->measurements->map(fn ($measurement): array => $measurement->toArray())->all(),
        ]]);
    }

    public function update(Request $request, int $client): JsonResponse
    {
        $profile = $this->ownedClient($client);
        $validated = $request->validate($this->updateRules($profile), $this->uniqueMessages());

        DB::transaction(function () use ($profile, $validated): void {
            $profile->fill($validated)->save();

            if ($profile->user_id) {
                User::query()->whereKey($profile->user_id)->update([
                    'name' => $profile->name,
                    'email' => $profile->email,
                    'whatsapp' => $profile->whatsapp,
                ]);
            }
        });

        return response()->json([
            'message' => 'Cliente actualizado.',
            'data' => ['client' => $this->clientPayload($profile->fresh())],
        ]);
    }

    public function destroy(int $client): JsonResponse
    {
        $profile = $this->ownedClient($client);

        DB::transaction(function () use ($profile): void {
            $routineIds = FitRoutine::query()->where('client_id', $profile->id)->pluck('id');
            if ($routineIds->isNotEmpty()) {
                DB::table('fit_workout_sets')->whereIn('routine_id', $routineIds)->delete();
                DB::table('fit_workout_sessions')->whereIn('routine_id', $routineIds)->delete();
                DB::table('fit_routine_exercises')->whereIn('routine_id', $routineIds)->delete();
                FitRoutine::query()->whereIn('id', $routineIds)->delete();
            }

            FitClientExerciseScore::query()->where('client_id', $profile->id)->delete();
            $profile->measurements()->delete();

            $userId = $profile->user_id;
            $profile->delete();

            if ($userId) {
                User::query()->whereKey($userId)->delete();
            }
        });

        return response()->json(['message' => 'Cliente eliminado.']);
    }

    public function storeMeasurement(Request $request, int $client): JsonResponse
    {
        $profile = $this->ownedClient($client);
        $validated = $request->validate([
            'weight_kg' => ['nullable', 'numeric', 'min:0', 'max:999.99'],
            'height_cm' => ['nullable', 'numeric', 'min:0', 'max:999.99'],
            'neck_cm' => ['nullable', 'numeric', 'min:0', 'max:999.99'],
            'shoulders_cm' => ['nullable', 'numeric', 'min:0', 'max:999.99'],
            'waist_cm' => ['nullable', 'numeric', 'min:0', 'max:999.99'],
            'chest_cm' => ['nullable', 'numeric', 'min:0', 'max:999.99'],
            'left_arm_cm' => ['nullable', 'numeric', 'min:0', 'max:999.99'],
            'right_arm_cm' => ['nullable', 'numeric', 'min:0', 'max:999.99'],
            'left_forearm_cm' => ['nullable', 'numeric', 'min:0', 'max:999.99'],
            'right_forearm_cm' => ['nullable', 'numeric', 'min:0', 'max:999.99'],
            'hip_cm' => ['nullable', 'numeric', 'min:0', 'max:999.99'],
            'left_thigh_cm' => ['nullable', 'numeric', 'min:0', 'max:999.99'],
            'right_thigh_cm' => ['nullable', 'numeric', 'min:0', 'max:999.99'],
            'left_calf_cm' => ['nullable', 'numeric', 'min:0', 'max:999.99'],
            'right_calf_cm' => ['nullable', 'numeric', 'min:0', 'max:999.99'],
            'body_fat' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'muscle_mass_percentage' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'triceps_skinfold_mm' => ['nullable', 'numeric', 'min:0', 'max:999.99'],
            'subscapular_skinfold_mm' => ['nullable', 'numeric', 'min:0', 'max:999.99'],
            'suprailiac_skinfold_mm' => ['nullable', 'numeric', 'min:0', 'max:999.99'],
            'abdominal_skinfold_mm' => ['nullable', 'numeric', 'min:0', 'max:999.99'],
            'thigh_skinfold_mm' => ['nullable', 'numeric', 'min:0', 'max:999.99'],
            'calf_skinfold_mm' => ['nullable', 'numeric', 'min:0', 'max:999.99'],
            'relaxed_arm_cm' => ['nullable', 'numeric', 'min:0', 'max:999.99'],
            'contracted_arm_cm' => ['nullable', 'numeric', 'min:0', 'max:999.99'],
            'thorax_cm' => ['nullable', 'numeric', 'min:0', 'max:999.99'],
            'thigh_cm' => ['nullable', 'numeric', 'min:0', 'max:999.99'],
            'calf_cm' => ['nullable', 'numeric', 'min:0', 'max:999.99'],
            'notes' => ['nullable', 'string'],
        ]);

        $measurement = DB::transaction(function () use ($profile, $validated): FitMeasurement {
            $measurement = $profile->measurements()->create([
                ...$validated,
                'measured_at' => now(),
            ]);

            $profile->update(array_filter([
                'weight_kg' => $validated['weight_kg'] ?? null,
                'height_cm' => $validated['height_cm'] ?? null,
            ], static fn ($value): bool => $value !== null));

            return $measurement;
        });

        return response()->json([
            'message' => 'Medición registrada.',
            'data' => ['measurement' => $measurement->toArray()],
        ], 201);
    }

    public function exerciseHistory(Request $request, int $client): JsonResponse
    {
        $profile = $this->ownedClient($client);

        $validated = $request->validate([
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date'],
        ]);

        $query = FitWorkoutSessionResult::query()
            ->where('client_id', $profile->id)
            ->whereNotNull('completed_at')
            ->orderByDesc('completed_at');

        if (! empty($validated['from'])) {
            $query->where('completed_at', '>=', Carbon::parse($validated['from'])->startOfDay());
        }

        if (! empty($validated['to'])) {
            $query->where('completed_at', '<=', Carbon::parse($validated['to'])->endOfDay());
        }

        $rows = $query->get();

        $groups = [];
        foreach ($rows as $row) {
            $muscleGroup = $row->muscle_group ?: 'Sin grupo muscular';
            $dateKey = $row->completed_at->toDateString();

            $groups[$muscleGroup] ??= [];
            $groups[$muscleGroup][$row->exercise_key] ??= [
                'exercise_key' => $row->exercise_key,
                'exercise_name' => $row->exercise_name,
                'sessions' => [],
            ];
            $groups[$muscleGroup][$row->exercise_key]['sessions'][$dateKey] ??= [
                'date' => $dateKey,
                'sets' => [],
            ];
            $groups[$muscleGroup][$row->exercise_key]['sessions'][$dateKey]['sets'][] = [
                'set_number' => (int) $row->set_number,
                'weight_kg' => $row->weight_kg,
                'reps_done' => $row->reps_done,
            ];
        }

        $muscleGroups = [];
        foreach ($groups as $muscleGroup => $exercises) {
            $exerciseList = [];

            foreach ($exercises as $exercise) {
                $sessions = array_values($exercise['sessions']);
                usort($sessions, fn (array $a, array $b): int => strcmp($b['date'], $a['date']));

                foreach ($sessions as &$session) {
                    usort($session['sets'], fn (array $a, array $b): int => $a['set_number'] <=> $b['set_number']);
                    $session['max_weight'] = collect($session['sets'])->max('weight_kg');
                    $session['total_volume'] = round(collect($session['sets'])->sum(
                        fn (array $set): float => (float) ($set['weight_kg'] ?? 0) * (int) ($set['reps_done'] ?? 0)
                    ), 2);
                }
                unset($session);

                $exercise['sessions'] = $sessions;
                $exerciseList[] = $exercise;
            }

            usort($exerciseList, fn (array $a, array $b): int => strcmp($a['exercise_name'], $b['exercise_name']));

            $muscleGroups[] = [
                'muscle_group' => $muscleGroup,
                'exercises' => $exerciseList,
            ];
        }

        usort($muscleGroups, fn (array $a, array $b): int => strcmp($a['muscle_group'], $b['muscle_group']));

        return response()->json(['data' => ['muscle_groups' => $muscleGroups]]);
    }

    private function storeRules(): array
    {
        $accessEnabled = request()->boolean('access_enabled');

        return [
            'name' => ['required', 'string', 'max:255'],
            'whatsapp' => ['required', 'string', 'max:40', Rule::unique('fit_clients', 'whatsapp'), Rule::unique('users', 'whatsapp')],
            'email' => ['nullable', 'email', 'max:255', Rule::unique('fit_clients', 'email'), Rule::unique('users', 'email')],
            'password' => [Rule::requiredIf($accessEnabled), 'nullable', 'string', 'min:8', 'max:255'],
            'access_enabled' => ['sometimes', 'boolean'],
            ...$this->profileRules(),
        ];
    }

    private function updateRules(FitClient $client): array
    {
        return [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'whatsapp' => [
                'sometimes', 'required', 'string', 'max:40',
                Rule::unique('fit_clients', 'whatsapp')->ignore($client->id),
                Rule::unique('users', 'whatsapp')->ignore($client->user_id),
            ],
            'email' => [
                'nullable', 'email', 'max:255',
                Rule::unique('fit_clients', 'email')->ignore($client->id),
                Rule::unique('users', 'email')->ignore($client->user_id),
            ],
            ...$this->profileRules(),
        ];
    }

    private function isPlaceholderEmail(string $email): bool
    {
        $frontendHost = parse_url((string) config('fit.frontend_url'), PHP_URL_HOST) ?: 'brycoach.pro';

        return str_ends_with(strtolower(trim($email)), '@'.strtolower($frontendHost));
    }

    private function uniqueMessages(): array
    {
        return [
            'whatsapp.unique' => 'Este número de WhatsApp ya está registrado.',
            'email.unique' => 'Este correo ya está registrado.',
        ];
    }

    private function profileRules(): array
    {
        return [
            'birth_date' => ['nullable', 'date'],
            'gender' => ['nullable', 'string', 'max:50'],
            'goal' => ['nullable', 'string', 'max:255'],
            'weight_kg' => ['nullable', 'numeric', 'min:0', 'max:999.99'],
            'height_cm' => ['nullable', 'numeric', 'min:0', 'max:999.99'],
            'health_survey' => ['nullable', 'string'],
            'injuries' => ['nullable', 'string'],
            'medical_conditions' => ['nullable', 'string'],
            'medications' => ['nullable', 'string'],
            'training_experience' => ['nullable', 'string'],
            'available_days' => ['nullable', 'string'],
            'notes' => ['nullable', 'string'],
        ];
    }

    private function clientPayload(FitClient $client): array
    {
        $payload = $client->toArray();
        $payload['access_enabled'] = $client->access_enabled ? 1 : 0;
        $payload['is_active'] = $client->user_id ? ($client->user?->is_active ? 1 : 0) : 1;
        $payload['trainer_name'] = $client->relationLoaded('trainer') ? $client->trainer?->name : null;
        if (isset($client->routines_count)) {
            $payload['routines_count'] = (int) $client->routines_count;
        }
        if (isset($client->measurements_count)) {
            $payload['measurements_count'] = (int) $client->measurements_count;
        }
        unset($payload['trainer'], $payload['user'], $payload['routines'], $payload['measurements']);

        return $payload;
    }
}
