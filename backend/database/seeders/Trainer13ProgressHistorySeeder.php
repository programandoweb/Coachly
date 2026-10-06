<?php

namespace Database\Seeders;

use App\Models\FitMuscleGroup;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * Genera 3 meses de histórico realista (rutinas, sesiones, series y mediciones)
 * para 3 clientes demo del entrenador #13, pensado para probar la vista de
 * progreso por grupo muscular. Es repetible: primero borra todo lo que ya
 * exista para ese entrenador y luego lo vuelve a crear desde cero.
 *
 * Ejecutar con:
 *   php artisan db:seed --class=Database\\Seeders\\Trainer13ProgressHistorySeeder
 */
class Trainer13ProgressHistorySeeder extends Seeder
{
    private const TRAINER_ID = 13;

    private User $trainer;
    private Carbon $today;
    private Carbon $start;
    private array $zoneIds = [];

    public function run(): void
    {
        $trainer = User::query()->find(self::TRAINER_ID);

        if (! $trainer || $trainer->role !== User::ROLE_TRAINER) {
            $this->command?->error('El usuario #'.self::TRAINER_ID.' no existe o no es un entrenador. Nada fue modificado.');

            return;
        }

        $this->trainer = $trainer;
        $this->today = Carbon::now();
        $this->start = $this->today->copy()->subMonths(3)->startOfDay();
        $this->zoneIds = FitMuscleGroup::query()->pluck('id', 'slug')->all();

        DB::transaction(function (): void {
            $this->wipeExistingData();

            $clients = [
                $this->createClient(
                    name: 'Juliana Restrepo Gómez',
                    email: 'juliana.restrepo.demo@migo.fit',
                    whatsapp: '3011234501',
                    gender: 'Femenino',
                    birthDate: '1996-04-12',
                    goal: 'Pérdida de grasa y tonificación general',
                    weight: 66.5,
                    height: 165,
                    experience: 'Intermedio',
                    strength: 1.00,
                    trend: 'CUT',
                ),
                $this->createClient(
                    name: 'Santiago Osorio Bedoya',
                    email: 'santiago.osorio.demo@migo.fit',
                    whatsapp: '3011234502',
                    gender: 'Masculino',
                    birthDate: '1993-08-27',
                    goal: 'Hipertrofia y aumento de fuerza',
                    weight: 79.0,
                    height: 177,
                    experience: 'Intermedio',
                    strength: 1.20,
                    trend: 'BULK',
                ),
                $this->createClient(
                    name: 'Valentina Zapata Correa',
                    email: 'valentina.zapata.demo@migo.fit',
                    whatsapp: '3011234503',
                    gender: 'Femenino',
                    birthDate: '1999-01-15',
                    goal: 'Recomposición corporal',
                    weight: 60.0,
                    height: 160,
                    experience: 'Principiante',
                    strength: 0.82,
                    trend: 'RECOMP',
                ),
            ];

            foreach ($clients as $client) {
                $this->seedClientHistory($client);
            }
        });

        $this->command?->info('Histórico de 3 meses generado para 3 clientes del entrenador #'.self::TRAINER_ID.'.');
    }

    private function wipeExistingData(): void
    {
        $clientIds = DB::table('fit_clients')->where('trainer_id', self::TRAINER_ID)->pluck('id');
        $routineIds = DB::table('fit_routines')->where('trainer_id', self::TRAINER_ID)->pluck('id');
        $planIds = DB::table('fit_training_plans')->where('trainer_id', self::TRAINER_ID)->pluck('id');
        $clientUserIds = DB::table('fit_clients')
            ->where('trainer_id', self::TRAINER_ID)
            ->whereNotNull('user_id')
            ->pluck('user_id');

        DB::table('fit_workout_session_results')->whereIn('client_id', $clientIds)->delete();
        DB::table('fit_workout_sets')->whereIn('client_id', $clientIds)->delete();
        DB::table('fit_workout_sessions')->whereIn('client_id', $clientIds)->delete();
        DB::table('fit_client_exercise_scores')->whereIn('client_id', $clientIds)->delete();
        DB::table('fit_measurements')->whereIn('client_id', $clientIds)->delete();
        DB::table('fit_checkins')->whereIn('client_id', $clientIds)->delete();
        DB::table('fit_personal_records')->whereIn('client_id', $clientIds)->delete();
        DB::table('fit_client_achievements')->whereIn('client_id', $clientIds)->delete();
        DB::table('fit_messages')->whereIn('client_id', $clientIds)->delete();
        DB::table('fit_progress_photos')->whereIn('client_id', $clientIds)->delete();
        DB::table('fit_training_days')->whereIn('plan_id', $planIds)->delete();
        DB::table('fit_training_plans')->where('trainer_id', self::TRAINER_ID)->delete();
        DB::table('fit_routine_exercises')->whereIn('routine_id', $routineIds)->delete();
        DB::table('fit_routines')->where('trainer_id', self::TRAINER_ID)->delete();
        DB::table('fit_notifications')->where('user_id', self::TRAINER_ID)->delete();
        DB::table('fit_clients')->where('trainer_id', self::TRAINER_ID)->delete();

        if ($clientUserIds->isNotEmpty()) {
            User::query()->whereIn('id', $clientUserIds)->where('role', User::ROLE_CLIENT)->delete();
        }
    }

    private function createClient(
        string $name,
        string $email,
        string $whatsapp,
        string $gender,
        string $birthDate,
        string $goal,
        float $weight,
        float $height,
        string $experience,
        float $strength,
        string $trend,
    ): array {
        $user = User::query()->updateOrCreate(
            ['email' => $email],
            [
                'name' => $name,
                'whatsapp' => $whatsapp,
                'password' => Hash::make('AtletaMvp2026!'),
                'role' => User::ROLE_CLIENT,
                'is_active' => true,
            ]
        );

        $clientId = DB::table('fit_clients')->insertGetId([
            'trainer_id' => self::TRAINER_ID,
            'user_id' => $user->id,
            'name' => $name,
            'whatsapp' => $whatsapp,
            'email' => $email,
            'birth_date' => $birthDate,
            'gender' => $gender,
            'goal' => $goal,
            'weight_kg' => $weight,
            'height_cm' => $height,
            'health_survey' => 'Apto para actividad física. Cuestionario PAR-Q revisado por el entrenador.',
            'injuries' => null,
            'medical_conditions' => 'Sin condiciones relevantes reportadas.',
            'medications' => 'No reporta.',
            'training_experience' => $experience,
            'available_days' => 'Lunes a viernes',
            'notes' => 'Cliente demo generado para evaluar el histórico de progreso (últimos 3 meses).',
            'access_enabled' => true,
            'created_at' => $this->start->copy()->subDays(3),
            'updated_at' => now(),
        ]);

        return [
            'id' => $clientId,
            'user_id' => $user->id,
            'name' => $name,
            'weight' => $weight,
            'height' => $height,
            'strength' => $strength,
            'trend' => $trend,
            'adherence' => random_int(80, 93),
        ];
    }

    /**
     * Plantilla de un split de 5 días, cada uno con un grupo muscular
     * dominante distinto, para poder medir progreso por grupo muscular.
     */
    private function dayTemplates(): array
    {
        return [
            [
                'title' => 'Empuje · Pecho, hombro y tríceps',
                'objective' => 'Fuerza e hipertrofia en el tren superior de empuje.',
                'level' => 'Intermedio',
                'zone' => 'parte-superior-del-cuerpo',
                'exercises' => [
                    ['Press de banca con barra', 'Pecho', 4, 8, 10, 90, 40, 1.25],
                    ['Press militar con mancuernas', 'Hombros', 3, 9, 11, 75, 12, 0.5],
                    ['Extensión de tríceps en polea', 'Tríceps', 3, 12, 15, 60, 20, 0.75],
                ],
            ],
            [
                'title' => 'Tracción · Espalda y bíceps',
                'objective' => 'Fuerza e hipertrofia en el tren superior de tracción.',
                'level' => 'Intermedio',
                'zone' => 'parte-superior-del-cuerpo',
                'exercises' => [
                    ['Jalón al pecho en polea', 'Espalda', 4, 8, 10, 90, 45, 1.25],
                    ['Remo con barra', 'Espalda', 4, 8, 10, 90, 40, 1.25],
                    ['Curl de bíceps con barra', 'Bíceps', 3, 10, 12, 60, 15, 0.5],
                ],
            ],
            [
                'title' => 'Pierna · Cuádriceps, isquiotibiales y glúteo',
                'objective' => 'Fuerza e hipertrofia del tren inferior.',
                'level' => 'Intermedio',
                'zone' => 'parte-inferior',
                'exercises' => [
                    ['Sentadilla con barra', 'Cuádriceps', 4, 8, 10, 120, 45, 1.5],
                    ['Peso muerto rumano', 'Isquiotibiales', 3, 10, 12, 100, 40, 1.25],
                    ['Hip thrust con barra', 'Glúteos', 4, 10, 12, 90, 50, 1.5],
                ],
            ],
            [
                'title' => 'Hombro y core',
                'objective' => 'Volumen de hombro y estabilidad de core.',
                'level' => 'Intermedio',
                'zone' => null,
                'exercises' => [
                    ['Elevación lateral con mancuernas', 'Hombros', 4, 12, 15, 45, 7, 0.25],
                    ['Press militar con barra', 'Hombros', 3, 8, 10, 90, 25, 0.75],
                    ['Plancha frontal', 'Abdomen', 3, 30, 45, 45, null, 1.5],
                ],
            ],
            [
                'title' => 'Brazo y pantorrilla',
                'objective' => 'Accesorios de brazo y pantorrilla.',
                'level' => 'Intermedio',
                'zone' => null,
                'exercises' => [
                    ['Curl martillo con mancuernas', 'Bíceps', 3, 10, 12, 60, 10, 0.4],
                    ['Extensión de tríceps en polea', 'Tríceps', 3, 12, 15, 60, 18, 0.5],
                    ['Elevación de talones en máquina', 'Pantorrillas', 4, 15, 20, 45, 40, 1.0],
                ],
            ],
        ];
    }

    private function seedClientHistory(array $client): void
    {
        $routines = [];
        foreach ($this->dayTemplates() as $template) {
            $routines[] = $this->createRoutine($client, $template);
        }

        $this->seedSessions($client, $routines);
        $this->seedMeasurements($client);
    }

    private function createRoutine(array $client, array $template): array
    {
        $routineId = DB::table('fit_routines')->insertGetId([
            'trainer_id' => self::TRAINER_ID,
            'client_id' => $client['id'],
            'muscle_group_id' => $template['zone'] ? ($this->zoneIds[$template['zone']] ?? null) : null,
            'title' => $client['name'].' · '.$template['title'],
            'objective' => $template['objective'],
            'level' => $template['level'],
            'notes' => 'Registrar peso, repeticiones y sensación de esfuerzo (RIR) en cada serie.',
            'share_token' => Str::random(64),
            'is_published' => true,
            'created_at' => $this->start->copy()->subDay(),
            'updated_at' => now(),
        ]);

        $exercises = [];
        foreach ($template['exercises'] as $index => $definition) {
            [$name, $muscleGroup, $sets, $minReps, $maxReps, $rest, $baseWeight, $weeklyIncrement] = $definition;
            $timed = $baseWeight === null;

            $exerciseId = DB::table('fit_routine_exercises')->insertGetId([
                'routine_id' => $routineId,
                'name' => $name,
                'muscle_group' => $muscleGroup,
                'sets' => $sets,
                'reps' => $timed ? "{$minReps}-{$maxReps} seg" : "{$minReps}-{$maxReps}",
                'rest_seconds' => $rest,
                'target_weight_kg' => $timed ? null : round($baseWeight * $client['strength'], 1),
                'tempo' => $timed ? null : '3-1-1',
                'method' => 'Series convencionales',
                'notes' => null,
                'sort_order' => $index + 1,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $exercises[] = [
                'id' => $exerciseId,
                'name' => $name,
                'muscle_group' => $muscleGroup,
                'sets' => $sets,
                'min_reps' => $minReps,
                'max_reps' => $maxReps,
                'base_weight' => $baseWeight,
                'weekly_increment' => $weeklyIncrement,
                'timed' => $timed,
            ];
        }

        return [
            'id' => $routineId,
            'title' => $template['title'],
            'exercises' => $exercises,
        ];
    }

    private function seedSessions(array $client, array $routines): void
    {
        $cursor = $this->start->copy();

        while ($cursor->lessThanOrEqualTo($this->today)) {
            $weekday = $cursor->dayOfWeekIso; // 1 = lunes ... 7 = domingo

            if ($weekday >= 1 && $weekday <= 5) {
                $routine = $routines[$weekday - 1];
                $weeksElapsed = (int) floor($this->start->diffInDays($cursor) / 7);

                if (random_int(1, 100) <= $client['adherence']) {
                    $this->seedSession($client, $routine, $cursor->copy(), $weeksElapsed);
                }
            }

            $cursor->addDay();
        }
    }

    private function seedSession(array $client, array $routine, Carbon $date, int $weeksElapsed): void
    {
        $startedAt = $date->copy()->setTime(18, random_int(0, 45));
        $durationMinutes = random_int(48, 70);
        $endedAt = $startedAt->copy()->addMinutes($durationMinutes);

        $sessionId = DB::table('fit_workout_sessions')->insertGetId([
            'routine_id' => $routine['id'],
            'client_id' => $client['id'],
            'trainer_id' => self::TRAINER_ID,
            'started_by' => $client['user_id'] ?: self::TRAINER_ID,
            'started_at' => $startedAt,
            'ended_at' => $endedAt,
            'duration_seconds' => $durationMinutes * 60,
            'status' => 'COMPLETED',
            'energy_level' => random_int(6, 9),
            'difficulty' => random_int(6, 9),
            'sleep_quality' => random_int(6, 8),
            'mood' => random_int(6, 9),
            'soreness' => random_int(2, 5),
            'session_notes' => null,
            'scheduled_for' => $date->toDateString(),
            'created_at' => $startedAt,
            'updated_at' => $endedAt,
        ]);

        $resultRows = [];
        $minuteOffset = 5;

        foreach ($routine['exercises'] as $exercise) {
            $exerciseKey = Str::slug($exercise['name']);
            $lastSets = [];
            $totalVolume = 0.0;
            $bestWeight = null;
            $bestReps = null;
            $estimatedOneRepMax = null;

            for ($setNumber = 1; $setNumber <= $exercise['sets']; $setNumber++) {
                $completedAt = $startedAt->copy()->addMinutes($minuteOffset);
                $minuteOffset += random_int(2, 4);
                $isLastSet = $setNumber === $exercise['sets'];

                if ($exercise['timed']) {
                    $weight = null;
                    $reps = $this->progressedTimedValue($exercise, $weeksElapsed);
                } else {
                    $weight = $this->progressedWeight($exercise, $client['strength'], $weeksElapsed);
                    $reps = $this->repsForSet($exercise, $setNumber, $isLastSet);
                }

                $volume = ($weight ?? 0) * ($reps ?? 0);
                $estimate = ($weight !== null && $reps !== null && $reps > 0)
                    ? $weight * (1 + ($reps / 30))
                    : null;

                $resultRows[] = [
                    'workout_session_id' => $sessionId,
                    'routine_id' => $routine['id'],
                    'client_id' => $client['id'],
                    'exercise_id' => $exercise['id'],
                    'exercise_key' => $exerciseKey,
                    'exercise_name' => $exercise['name'],
                    'muscle_group' => $exercise['muscle_group'],
                    'set_number' => $setNumber,
                    'weight_kg' => $weight,
                    'reps_done' => $reps,
                    'volume_score' => round($volume, 2),
                    'completed_at' => $completedAt,
                    'rir' => $isLastSet ? 1 : 2,
                    'rpe' => $isLastSet ? 9 : 8,
                    'pain_level' => 0,
                    'to_failure' => $isLastSet && random_int(1, 100) <= 20,
                    'notes' => null,
                    'created_at' => $completedAt,
                    'updated_at' => $completedAt,
                ];

                $lastSets[] = ['set_number' => $setNumber, 'weight_kg' => $weight, 'reps_done' => $reps];
                $totalVolume += $volume;
                $bestWeight = $weight !== null ? max($bestWeight ?? $weight, $weight) : $bestWeight;
                $bestReps = $reps !== null ? max($bestReps ?? $reps, $reps) : $bestReps;
                $estimatedOneRepMax = $estimate !== null ? max($estimatedOneRepMax ?? $estimate, $estimate) : $estimatedOneRepMax;
            }

            DB::table('fit_client_exercise_scores')->updateOrInsert(
                ['client_id' => $client['id'], 'exercise_key' => $exerciseKey],
                [
                    'exercise_name' => $exercise['name'],
                    'last_workout_session_id' => $sessionId,
                    'total_volume' => round($totalVolume, 2),
                    'best_weight_kg' => $bestWeight,
                    'best_reps' => $bestReps,
                    'estimated_one_rep_max' => $estimatedOneRepMax !== null ? round($estimatedOneRepMax, 2) : null,
                    'completed_sets' => count($lastSets),
                    'last_sets' => json_encode($lastSets),
                    'performed_at' => $endedAt,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }

        foreach (array_chunk($resultRows, 200) as $chunk) {
            DB::table('fit_workout_session_results')->insert($chunk);
        }
    }

    private function progressedWeight(array $exercise, float $strength, int $weeksElapsed): float
    {
        $base = $exercise['base_weight'] * $strength;
        $increment = $exercise['weekly_increment'] * $strength * $weeksElapsed;
        $jitter = 1 + (random_int(-3, 3) / 100);
        $value = ($base + $increment) * $jitter;

        return round($value * 2) / 2; // redondeo a 0.5 kg, típico de mancuernas/discos.
    }

    private function progressedTimedValue(array $exercise, int $weeksElapsed): int
    {
        $base = $exercise['min_reps'];
        $increment = $exercise['weekly_increment'] * $weeksElapsed;
        $jitter = random_int(-2, 3);

        return max($exercise['min_reps'], (int) round($base + $increment + $jitter));
    }

    private function repsForSet(array $exercise, int $setNumber, bool $isLastSet): int
    {
        $reps = $isLastSet ? $exercise['min_reps'] : $exercise['max_reps'];

        return max(1, $reps + random_int(-1, 1));
    }

    private function seedMeasurements(array $client): void
    {
        $weeksSpan = (int) $this->start->diffInWeeks($this->today);
        $checkpoints = range($weeksSpan, 0, -2);

        [$weeklyWeightDelta, $waistDelta, $bodyFatDelta, $limbDelta] = match ($client['trend']) {
            'CUT' => [-0.18, -0.25, -0.20, 0.03],
            'BULK' => [0.15, 0.05, -0.05, 0.08],
            default => [-0.03, -0.12, -0.15, 0.05],
        };

        foreach ($checkpoints as $weeksAgo) {
            $progressWeeks = $weeksSpan - $weeksAgo;
            $measuredAt = $this->today->copy()->subWeeks($weeksAgo);

            $weight = round($client['weight'] - ($weeklyWeightDelta * $weeksAgo), 2);
            $waist = round(80 + ($client['weight'] * 0.08) + ($waistDelta * $progressWeeks), 2);
            $chest = round(88 + ($client['weight'] * 0.10) + ($limbDelta * $progressWeeks * 0.5), 2);
            $hip = round(92 + ($client['weight'] * 0.06), 2);
            $arm = round(26 + ($client['strength'] * 4) + ($limbDelta * $progressWeeks), 2);
            $thigh = round(50 + ($client['strength'] * 5) + ($limbDelta * $progressWeeks), 2);
            $bodyFat = round(max(10, 24 + ($bodyFatDelta * $progressWeeks)), 2);

            DB::table('fit_measurements')->insert([
                'client_id' => $client['id'],
                'weight_kg' => $weight,
                'height_cm' => $client['height'],
                'waist_cm' => $waist,
                'chest_cm' => $chest,
                'hip_cm' => $hip,
                'left_arm_cm' => $arm,
                'right_arm_cm' => $arm,
                'left_thigh_cm' => $thigh,
                'right_thigh_cm' => $thigh,
                'body_fat' => $bodyFat,
                'notes' => $weeksAgo === 0 ? 'Medición más reciente.' : 'Control quincenal.',
                'measured_at' => $measuredAt,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
