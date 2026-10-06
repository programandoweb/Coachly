<?php

namespace Tests\Feature;

use App\Models\FitClient;
use App\Models\FitRoutine;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FitApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_health_login_and_authenticated_dashboard(): void
    {
        $this->getJson('/api/v1/health')->assertOk()->assertJsonPath('status', 'ok');

        $login = $this->postJson('/api/v1/fit/auth/login', [
            'whatsapp' => '3115000926',
            'password' => 'password',
        ])->assertOk()->assertJsonPath('data.user.role', 'TRAINER');

        $token = $login->json('data.access_token');
        $this->withToken($token)
            ->getJson('/api/v1/fit/dashboard')
            ->assertOk()
            ->assertJsonStructure(['data' => ['clients', 'routines', 'exercises', 'lastClients', 'lastRoutines']]);
    }

    public function test_full_client_routine_and_workout_flow(): void
    {
        $token = $this->postJson('/api/v1/fit/auth/login', [
            'whatsapp' => '3115000926',
            'password' => 'password',
        ])->json('data.access_token');

        $clientId = $this->withToken($token)->postJson('/api/v1/fit/clients', [
            'name' => 'Integración Real',
            'whatsapp' => '3001234567',
            'email' => 'integracion@example.com',
            'password' => 'password',
            'access_enabled' => true,
        ])->assertCreated()->json('data.client.id');

        $routineId = $this->withToken($token)->postJson('/api/v1/fit/routines', [
            'client_id' => $clientId,
            'title' => 'Rutina API',
            'objective' => 'Probar conexión completa',
        ])->assertCreated()->json('data.routine.id');

        $exerciseId = $this->withToken($token)->postJson("/api/v1/fit/routines/{$routineId}/exercises", [
            'name' => 'Prensa',
            'sets' => 3,
            'reps' => '12',
            'rest_seconds' => 60,
        ])->assertCreated()->json('data.exercise.id');

        $shareToken = FitRoutine::query()->findOrFail($routineId)->share_token;

        $this->putJson('/api/v1/fit/workout-sets', [
            'exercise_id' => $exerciseId,
            'set_number' => 1,
            'weight_kg' => 40,
            'reps_done' => 12,
            'share_token' => $shareToken,
            'completed' => true,
        ])->assertOk()->assertJsonPath('data.completed', true);

        $this->getJson("/api/v1/fit/public/routines/{$shareToken}")
            ->assertOk()
            ->assertJsonPath('data.logs.0.exercise_id', $exerciseId);

        $clientToken = $this->postJson('/api/v1/fit/auth/login', [
            'whatsapp' => '300 123-4567',
            'password' => 'password',
        ])->assertOk()->json('data.access_token');

        $this->withToken($clientToken)
            ->getJson('/api/v1/fit/client/portal')
            ->assertOk()
            ->assertJsonPath('data.client.id', $clientId);

        $this->assertDatabaseHas('fit_workout_sets', [
            'routine_id' => $routineId,
            'client_id' => $clientId,
            'exercise_id' => $exerciseId,
            'set_number' => 1,
        ]);
        $this->assertDatabaseHas('fit_clients', ['id' => $clientId, 'trainer_id' => FitClient::findOrFail($clientId)->trainer_id]);
    }
}
