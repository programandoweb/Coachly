<?php

namespace App\Console\Commands;

use App\Models\FitWorkoutSession;
use App\Services\WorkoutSessionFinisher;
use Illuminate\Console\Command;

/**
 * Cierra los entrenamientos que quedaron activos (el atleta nunca tocó
 * "Finalizar entrenamiento"). Se programa a las 23:00 en bootstrap/app.php,
 * y además corre como respaldo cada vez que el entrenador abre una rutina
 * con una sesión vieja pendiente (ver RoutineController::latestWorkoutSession).
 */
class AutoCloseStaleWorkoutSessions extends Command
{
    protected $signature = 'workouts:auto-close';

    protected $description = 'Cierra automáticamente los entrenamientos activos que quedaron sin finalizar.';

    public function handle(WorkoutSessionFinisher $finisher): int
    {
        $sessions = FitWorkoutSession::query()
            ->whereNull('ended_at')
            ->with('routine')
            ->get();

        $closed = 0;

        foreach ($sessions as $session) {
            $routine = $session->routine;
            if (! $routine || ! $routine->client_id) {
                continue;
            }

            $finisher->finish($session, $routine);
            $closed++;
        }

        $this->info("Entrenamientos cerrados automáticamente: {$closed}");

        return self::SUCCESS;
    }
}
