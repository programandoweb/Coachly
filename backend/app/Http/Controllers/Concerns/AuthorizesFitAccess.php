<?php

namespace App\Http\Controllers\Concerns;

use App\Models\FitClient;
use App\Models\FitRoutine;
use App\Models\User;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

trait AuthorizesFitAccess
{
    protected function authenticatedUser(): User
    {
        /** @var User|null $user */
        $user = auth('api')->user();

        if (! $user) {
            throw new AccessDeniedHttpException('No autenticado.');
        }

        return $user;
    }

    protected function trainerUser(): User
    {
        $user = $this->authenticatedUser();

        if ($user->role !== User::ROLE_TRAINER) {
            throw new AccessDeniedHttpException('Acceso exclusivo para entrenadores.');
        }

        return $user;
    }

    protected function clientProfile(): FitClient
    {
        $user = $this->authenticatedUser();

        if ($user->role !== User::ROLE_CLIENT) {
            throw new AccessDeniedHttpException('Acceso exclusivo para clientes.');
        }

        return FitClient::query()
            ->where('user_id', $user->id)
            ->where('access_enabled', true)
            ->firstOrFail();
    }

    protected function ownedClient(int $clientId): FitClient
    {
        $trainer = $this->trainerUser();
        $client = FitClient::query()
            ->whereKey($clientId)
            ->where('trainer_id', $trainer->id)
            ->first();

        if (! $client) {
            throw (new ModelNotFoundException())->setModel(FitClient::class, [$clientId]);
        }

        return $client;
    }

    protected function ownedRoutine(int $routineId): FitRoutine
    {
        $trainer = $this->trainerUser();
        $routine = FitRoutine::query()
            ->whereKey($routineId)
            ->where('trainer_id', $trainer->id)
            ->first();

        if (! $routine) {
            throw (new ModelNotFoundException())->setModel(FitRoutine::class, [$routineId]);
        }

        return $routine;
    }

    /** Rutina del entrenador dueño, o del propio cliente; nunca de otro cliente. */
    protected function accessibleRoutine(int $routineId): FitRoutine
    {
        $user = $this->authenticatedUser();

        if ($user->role !== User::ROLE_CLIENT) {
            return $this->ownedRoutine($routineId);
        }

        $client = $this->clientProfile();
        $routine = FitRoutine::query()
            ->whereKey($routineId)
            ->where('client_id', $client->id)
            ->first();

        if (! $routine) {
            throw (new ModelNotFoundException())->setModel(FitRoutine::class, [$routineId]);
        }

        return $routine;
    }
}
