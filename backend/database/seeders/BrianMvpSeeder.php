<?php

namespace Database\Seeders;

use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class BrianMvpSeeder extends Seeder
{
    private User $trainer;
    private CarbonImmutable $today;
    private array $exerciseIds = [];

    public function run(): void
    {
        $this->today = CarbonImmutable::today();

        DB::transaction(function (): void {
            $this->trainer = User::query()->updateOrCreate(
                ['email' => 'bryanhenao12@gmail.com'],
                [
                    'name' => 'Bryan Henao',
                    'whatsapp' => '3005550101',
                    'password' => Hash::make('password'),
                    'role' => User::ROLE_TRAINER,
                    'is_active' => true,
                ]
            );

            $this->trainer = User::query()->updateOrCreate(
                ['email' => 'lic.jorgemendez@gmail.com'],
                [
                    'name' => 'Jorge Méndez',
                    'whatsapp' => '3115000926',
                    'password' => Hash::make('password'),
                    'role' => User::ROLE_TRAINER,
                    'is_active' => true,
                ]
            );

            // Hace el seeder repetible sin afectar datos pertenecientes a otros entrenadores.
            DB::table('fit_notifications')->where('user_id', $this->trainer->id)->delete();
            DB::table('fit_clients')->where('trainer_id', $this->trainer->id)->delete();
            DB::table('fit_exercises')->where('trainer_id', $this->trainer->id)->delete();

            $this->seedExerciseLibrary();
            $clients = $this->seedClients();

            $this->seedCamila($clients['camila']);
            $this->seedAndres($clients['andres']);
            $this->seedLaura($clients['laura']);
            $this->seedMateo($clients['mateo']);
            $this->seedTrainerNotifications($clients);
        });
    }

    private function seedExerciseLibrary(): void
    {
        $exercises = [
            ['Press de banca con barra', 'Pecho', 'Barra y banco', 'Empuje horizontal', 'Intermedio'],
            ['Press inclinado con mancuernas', 'Pecho', 'Mancuernas', 'Empuje horizontal', 'Intermedio'],
            ['Remo sentado en polea', 'Espalda', 'Polea', 'Tracción horizontal', 'Inicial'],
            ['Jalón al pecho', 'Espalda', 'Polea', 'Tracción vertical', 'Inicial'],
            ['Sentadilla con barra', 'Pierna', 'Barra y rack', 'Dominante de rodilla', 'Intermedio'],
            ['Prensa inclinada', 'Pierna', 'Máquina', 'Dominante de rodilla', 'Inicial'],
            ['Peso muerto rumano', 'Femoral', 'Barra', 'Bisagra de cadera', 'Intermedio'],
            ['Hip thrust', 'Glúteo', 'Barra y banco', 'Extensión de cadera', 'Inicial'],
            ['Elevación lateral', 'Hombro', 'Mancuernas', 'Abducción de hombro', 'Inicial'],
            ['Press militar', 'Hombro', 'Mancuernas', 'Empuje vertical', 'Intermedio'],
            ['Curl de bíceps', 'Bíceps', 'Mancuernas', 'Flexión de codo', 'Inicial'],
            ['Extensión de tríceps', 'Tríceps', 'Polea', 'Extensión de codo', 'Inicial'],
            ['Plancha frontal', 'Core', 'Peso corporal', 'Anti-extensión', 'Inicial'],
            ['Caminata inclinada', 'Cardio', 'Caminadora', 'Cardiovascular', 'Inicial'],
        ];

        foreach ($exercises as [$name, $muscle, $equipment, $pattern, $difficulty]) {
            $id = DB::table('fit_exercises')->insertGetId([
                'trainer_id' => $this->trainer->id,
                'name' => $name,
                'slug' => Str::slug($name),
                'muscle_group' => $muscle,
                'equipment' => $equipment,
                'movement_pattern' => $pattern,
                'difficulty' => $difficulty,
                'instructions' => 'Mantener técnica controlada, rango de movimiento cómodo y detener ante dolor agudo.',
                'is_unilateral' => false,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            $this->exerciseIds[$name] = $id;
        }

        DB::table('fit_exercise_alternatives')->insert([
            ['exercise_id' => $this->exerciseIds['Sentadilla con barra'], 'alternative_exercise_id' => $this->exerciseIds['Prensa inclinada'], 'reason' => 'Alternativa cuando no hay rack disponible.', 'created_at' => now(), 'updated_at' => now()],
            ['exercise_id' => $this->exerciseIds['Press de banca con barra'], 'alternative_exercise_id' => $this->exerciseIds['Press inclinado con mancuernas'], 'reason' => 'Alternativa con mancuernas o menor carga absoluta.', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    private function seedClients(): array
    {
        return [
            'camila' => $this->createClient('Camila Torres', 'camila@migo.fit', '3005550201', 'Pérdida de grasa y tonificación', 68.4, 164, 'Intermedio', 'Lunes, martes, jueves y sábado', true),
            'andres' => $this->createClient('Andrés Ramírez', 'andres@migo.fit', '3005550202', 'Hipertrofia y aumento de fuerza', 82.6, 178, 'Intermedio', 'Lunes, miércoles, viernes y sábado', true),
            'laura' => $this->createClient('Laura Gómez', 'laura@migo.fit', '3005550203', 'Retomar actividad y mejorar condición física', 61.8, 160, 'Principiante', 'Martes, jueves y sábado', true, 'Molestia ocasional en rodilla derecha; evitar impactos altos.'),
            'mateo' => $this->createClient('Mateo Salazar', null, '3005550204', 'Ganancia de masa muscular', 74.0, 175, 'Principiante', 'Por definir', false),
        ];
    }

    private function createClient(string $name, ?string $email, string $whatsapp, string $goal, float $weight, float $height, string $experience, string $days, bool $access, ?string $injuries = null): int
    {
        $userId = null;
        if ($email !== null) {
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
            $userId = $user->id;
        }

        return DB::table('fit_clients')->insertGetId([
            'trainer_id' => $this->trainer->id,
            'user_id' => $userId,
            'name' => $name,
            'whatsapp' => $whatsapp,
            'email' => $email,
            'birth_date' => match ($name) {
                'Camila Torres' => '1994-05-18',
                'Andrés Ramírez' => '1991-09-08',
                'Laura Gómez' => '1997-02-24',
                default => '1998-11-12',
            },
            'gender' => in_array($name, ['Camila Torres', 'Laura Gómez'], true) ? 'Femenino' : 'Masculino',
            'goal' => $goal,
            'weight_kg' => $weight,
            'height_cm' => $height,
            'health_survey' => 'Apto para actividad física. Cuestionario PAR-Q revisado por el entrenador.',
            'injuries' => $injuries,
            'medical_conditions' => 'Sin condiciones relevantes reportadas.',
            'medications' => 'No reporta.',
            'training_experience' => $experience,
            'available_days' => $days,
            'notes' => $access ? 'Cliente activo del programa MVP.' : 'Prospecto pendiente de valoración inicial.',
            'access_enabled' => $access,
            'created_at' => $this->today->subMonths(4),
            'updated_at' => now(),
        ]);
    }

    private function seedCamila(int $clientId): void
    {
        $routineA = $this->createRoutine($clientId, 'Camila · Tren inferior y glúteo', 'Mejorar fuerza del tren inferior y gasto energético.', 'Intermedio', [
            ['Sentadilla con barra', 4, '8-10', 90, 42.5], ['Hip thrust', 4, '10-12', 90, 65], ['Peso muerto rumano', 3, '10', 90, 40], ['Elevación lateral', 3, '15', 45, 6],
        ]);
        $routineB = $this->createRoutine($clientId, 'Camila · Torso metabólico', 'Mantener masa muscular durante etapa de definición.', 'Intermedio', [
            ['Press inclinado con mancuernas', 3, '10-12', 75, 12], ['Remo sentado en polea', 4, '10-12', 75, 35], ['Jalón al pecho', 3, '12', 60, 32], ['Caminata inclinada', 1, '20 min', 0, null],
        ]);
        $this->createPlan($clientId, 'Definición sostenible · 8 semanas', 'Reducir grasa manteniendo rendimiento.', 8, [$routineA, $routineB], 4, 1);
        $this->measurements($clientId, 68.4, 74.5, 91, 98, 29.4, -0.45);
        $this->checkins($clientId, 68.4, [82, 88, 91, 86], [8, 8, 9, 8]);
        $this->sessions($clientId, $routineA, 10, 42.5, 9);
        $this->sessions($clientId, $routineB, 8, 35, 11);
        $this->personalRecord($clientId, 'Hip thrust', 82.5, 'kg', 18);
        $this->award($clientId, 'FIRST_WORKOUT'); $this->award($clientId, 'TEN_WORKOUTS'); $this->award($clientId, 'FIRST_PR');
        $this->conversation($clientId, 'Excelente consistencia esta semana. Mantén el RIR objetivo y prioriza el descanso.', 'Gracias Brian, me he sentido con más energía y ya noto progreso.');
    }

    private function seedAndres(int $clientId): void
    {
        $push = $this->createRoutine($clientId, 'Andrés · Empuje', 'Hipertrofia de pecho, hombros y tríceps.', 'Intermedio', [
            ['Press de banca con barra', 4, '6-8', 120, 72.5], ['Press militar', 3, '8-10', 90, 22], ['Elevación lateral', 4, '12-15', 45, 9], ['Extensión de tríceps', 3, '12', 60, 30],
        ]);
        $pull = $this->createRoutine($clientId, 'Andrés · Tirón', 'Hipertrofia de espalda y bíceps.', 'Intermedio', [
            ['Jalón al pecho', 4, '8-10', 90, 55], ['Remo sentado en polea', 4, '10', 90, 58], ['Peso muerto rumano', 3, '8', 120, 75], ['Curl de bíceps', 3, '10-12', 60, 14],
        ]);
        $this->createPlan($clientId, 'Hipertrofia progresiva · 12 semanas', 'Aumentar masa muscular mediante doble progresión.', 12, [$push, $pull], 4, 2);
        $this->measurements($clientId, 82.6, 86, 104, 100, 18.2, 0.35);
        $this->checkins($clientId, 82.6, [75, 80, 78, 84], [7, 7, 8, 8]);
        $this->sessions($clientId, $push, 12, 72.5, 7);
        $this->sessions($clientId, $pull, 11, 58, 9);
        $this->personalRecord($clientId, 'Press de banca con barra', 91.3, 'kg', 11);
        $this->award($clientId, 'FIRST_WORKOUT'); $this->award($clientId, 'TEN_WORKOUTS'); $this->award($clientId, 'FIRST_PR'); $this->award($clientId, 'MONTH_COMPLETE');
        $this->conversation($clientId, 'Nuevo récord estimado en press banca. La próxima semana subiremos 2,5 kg.', 'Perfecto. La última serie fue dura, pero mantuve un RIR cercano a 1.');
    }

    private function seedLaura(int $clientId): void
    {
        $full = $this->createRoutine($clientId, 'Laura · Adaptación full body', 'Recuperar fuerza y confianza sin impacto.', 'Principiante', [
            ['Prensa inclinada', 3, '12', 75, 45], ['Hip thrust', 3, '12', 75, 35], ['Remo sentado en polea', 3, '12', 60, 22], ['Press inclinado con mancuernas', 3, '12', 60, 7], ['Plancha frontal', 3, '25 seg', 45, null],
        ]);
        $this->createPlan($clientId, 'Regreso progresivo · 6 semanas', 'Mejorar adherencia y tolerancia al esfuerzo.', 6, [$full], 3, 2);
        $this->measurements($clientId, 61.8, 72, 88, 94, 31.5, -0.12);
        $this->checkins($clientId, 61.8, [67, 58, 72, 63], [6, 5, 7, 6], true);
        $this->sessions($clientId, $full, 5, 45, 12);
        $this->award($clientId, 'FIRST_WORKOUT');
        $this->conversation($clientId, 'Vi el reporte de molestia en rodilla. Mantendremos prensa con rango cómodo y sin impactos.', 'Gracias. Hoy la molestia fue 3/10 y pude completar la sesión.');
    }

    private function seedMateo(int $clientId): void
    {
        DB::table('fit_measurements')->insert([
            'client_id' => $clientId, 'weight_kg' => 74, 'height_cm' => 175, 'waist_cm' => 82, 'chest_cm' => 96,
            'hip_cm' => 94, 'body_fat' => 20.5, 'notes' => 'Valoración inicial pendiente de habilitar acceso.',
            'measured_at' => $this->today->subDays(2), 'created_at' => now(), 'updated_at' => now(),
        ]);
    }

    private function createRoutine(int $clientId, string $title, string $objective, string $level, array $items): array
    {
        $routineId = DB::table('fit_routines')->insertGetId([
            'trainer_id' => $this->trainer->id, 'client_id' => $clientId, 'title' => $title, 'objective' => $objective,
            'level' => $level, 'notes' => 'RIR objetivo 2; progresar cuando complete el máximo de repeticiones con técnica.',
            'share_token' => Str::random(64), 'is_published' => true, 'created_at' => $this->today->subMonths(2), 'updated_at' => now(),
        ]);

        $routineExercises = [];
        foreach ($items as $index => [$name, $sets, $reps, $rest, $weight]) {
            $routineExercises[] = DB::table('fit_routine_exercises')->insertGetId([
                'routine_id' => $routineId, 'exercise_id' => $this->exerciseIds[$name] ?? null, 'name' => $name,
                'muscle_group' => null, 'sets' => $sets, 'reps' => $reps, 'rest_seconds' => $rest ?: null,
                'target_weight_kg' => $weight, 'tempo' => '3-1-1', 'method' => 'Series convencionales',
                'notes' => 'Registrar peso, repeticiones y RIR.', 'sort_order' => $index + 1,
                'progression_type' => 'DOUBLE_PROGRESSION', 'weight_increment' => 2.5,
                'minimum_reps' => (int) $reps, 'maximum_reps' => max((int) $reps, (int) $reps + 2), 'target_rir' => 2, 'target_rpe' => 8,
                'created_at' => now(), 'updated_at' => now(),
            ]);
        }

        return ['id' => $routineId, 'exercises' => $routineExercises, 'items' => $items];
    }

    private function createPlan(int $clientId, string $name, string $objective, int $weeks, array $routines, int $daysPerWeek, int $startWeekOffset): void
    {
        $start = $this->today->startOfWeek()->subWeeks($startWeekOffset);
        $planId = DB::table('fit_training_plans')->insertGetId([
            'trainer_id' => $this->trainer->id, 'client_id' => $clientId, 'name' => $name, 'objective' => $objective,
            'starts_at' => $start, 'ends_at' => $start->addWeeks($weeks)->subDay(), 'status' => 'ACTIVE', 'weeks' => $weeks,
            'created_at' => now(), 'updated_at' => now(),
        ]);

        $weekdays = array_slice([1, 3, 5, 6], 0, $daysPerWeek);
        for ($week = 1; $week <= $weeks; $week++) {
            foreach ($weekdays as $position => $weekday) {
                $scheduled = $start->addWeeks($week - 1)->startOfWeek()->addDays($weekday - 1);
                $routine = $routines[$position % count($routines)];
                $status = $scheduled->isPast() ? 'COMPLETED' : ($scheduled->isToday() ? 'SCHEDULED' : 'SCHEDULED');
                DB::table('fit_training_days')->insert([
                    'plan_id' => $planId, 'routine_id' => $routine['id'], 'week_number' => $week, 'weekday' => $weekday,
                    'scheduled_for' => $scheduled, 'title' => 'Sesión '.($position + 1), 'is_deload' => $week === $weeks,
                    'status' => $status, 'created_at' => now(), 'updated_at' => now(),
                ]);
            }
        }
    }

    private function measurements(int $clientId, float $currentWeight, float $waist, float $chest, float $hip, float $fat, float $weeklyWeightDelta): void
    {
        for ($i = 8; $i >= 0; $i -= 2) {
            $progress = (8 - $i) / 2;
            DB::table('fit_measurements')->insert([
                'client_id' => $clientId,
                'weight_kg' => round($currentWeight - ($weeklyWeightDelta * $i), 2), 'height_cm' => null,
                'waist_cm' => round($waist + ($weeklyWeightDelta < 0 ? $i * .35 : -$i * .08), 2),
                'chest_cm' => round($chest - ($weeklyWeightDelta > 0 ? $i * .16 : 0), 2), 'hip_cm' => $hip,
                'body_fat' => round($fat + ($weeklyWeightDelta < 0 ? $i * .18 : -$i * .05), 2),
                'notes' => $i === 0 ? 'Medición más reciente.' : 'Control quincenal.',
                'measured_at' => $this->today->subWeeks($i), 'created_at' => now(), 'updated_at' => now(),
            ]);
        }
    }

    private function checkins(int $clientId, float $weight, array $adherence, array $energy, bool $painAlert = false): void
    {
        foreach ($adherence as $index => $percent) {
            $weeksAgo = count($adherence) - 1 - $index;
            DB::table('fit_checkins')->insert([
                'client_id' => $clientId, 'trainer_id' => $this->trainer->id, 'week_of' => $this->today->startOfWeek()->subWeeks($weeksAgo),
                'weight_kg' => $weight + ($weeksAgo * .18), 'sleep_quality' => $painAlert && $weeksAgo === 0 ? 5 : 7,
                'energy_level' => $energy[$index], 'stress_level' => $painAlert && $weeksAgo === 0 ? 8 : 5,
                'hunger_level' => 5, 'soreness_level' => $painAlert && $weeksAgo === 0 ? 7 : 4,
                'pain_level' => $painAlert && $weeksAgo === 0 ? 6 : 1, 'adherence_percent' => $percent,
                'comments' => $painAlert && $weeksAgo === 0 ? 'Molestia moderada en rodilla derecha al bajar escaleras.' : 'Semana completada sin novedades importantes.',
                'trainer_feedback' => $weeksAgo === 0 ? 'Revisado por Brian. Ajustes definidos para la siguiente semana.' : null,
                'created_at' => now(), 'updated_at' => now(),
            ]);
        }
    }

    private function sessions(int $clientId, array $routine, int $count, float $baseWeight, int $baseReps): void
    {
        for ($i = $count; $i >= 1; $i--) {
            $started = $this->today->subDays($i * 3)->setTime(18, 0);
            $sessionId = DB::table('fit_workout_sessions')->insertGetId([
                'routine_id' => $routine['id'], 'client_id' => $clientId, 'trainer_id' => $this->trainer->id,
                'started_by' => DB::table('fit_clients')->where('id', $clientId)->value('user_id') ?: $this->trainer->id,
                'started_at' => $started, 'ended_at' => $started->addMinutes(62), 'duration_seconds' => 3720,
                'status' => 'COMPLETED', 'energy_level' => 8, 'difficulty' => 8, 'sleep_quality' => 7, 'mood' => 8, 'soreness' => 4,
                'session_notes' => 'Sesión completada según planificación.', 'scheduled_for' => $started->toDateString(), 'created_at' => now(), 'updated_at' => now(),
            ]);

            foreach (array_slice($routine['exercises'], 0, 2) as $exerciseIndex => $routineExerciseId) {
                $exerciseName = $routine['items'][$exerciseIndex][0];
                $sets = min(3, $routine['items'][$exerciseIndex][1]);
                $lastSets = [];
                $totalVolume = 0;
                for ($set = 1; $set <= $sets; $set++) {
                    $weight = round($baseWeight - max(0, $i - 3) * .5 + $exerciseIndex * 2, 2);
                    $reps = max(5, $baseReps - ($set === $sets ? 1 : 0));
                    $volume = $weight * $reps;
                    $totalVolume += $volume;
                    $lastSets[] = ['set' => $set, 'weight_kg' => $weight, 'reps' => $reps];
                    DB::table('fit_workout_session_results')->insert([
                        'workout_session_id' => $sessionId, 'routine_id' => $routine['id'], 'client_id' => $clientId,
                        'exercise_id' => $routineExerciseId, 'exercise_key' => Str::slug($exerciseName), 'exercise_name' => $exerciseName,
                        'set_number' => $set, 'weight_kg' => $weight, 'reps_done' => $reps, 'volume_score' => $volume,
                        'completed_at' => $started->addMinutes(15 + $set * 3), 'rir' => $set === $sets ? 1 : 2, 'rpe' => $set === $sets ? 9 : 8,
                        'pain_level' => 0, 'to_failure' => false, 'notes' => null, 'created_at' => now(), 'updated_at' => now(),
                    ]);
                }

                DB::table('fit_client_exercise_scores')->updateOrInsert(
                    ['client_id' => $clientId, 'exercise_key' => Str::slug($exerciseName)],
                    ['exercise_name' => $exerciseName, 'last_workout_session_id' => $sessionId, 'total_volume' => $totalVolume,
                     'best_weight_kg' => $baseWeight, 'best_reps' => $baseReps, 'estimated_one_rep_max' => round($baseWeight * (1 + $baseReps / 30), 2),
                     'completed_sets' => $sets, 'last_sets' => json_encode($lastSets), 'performed_at' => $started,
                     'created_at' => now(), 'updated_at' => now()]
                );
            }
        }
    }

    private function personalRecord(int $clientId, string $exerciseName, float $value, string $unit, int $daysAgo): void
    {
        DB::table('fit_personal_records')->insert([
            'client_id' => $clientId, 'exercise_id' => $this->exerciseIds[$exerciseName] ?? null, 'exercise_name' => $exerciseName,
            'record_type' => 'ESTIMATED_1RM', 'value' => $value, 'unit' => $unit, 'achieved_at' => $this->today->subDays($daysAgo),
            'created_at' => now(), 'updated_at' => now(),
        ]);
    }

    private function award(int $clientId, string $code): void
    {
        $achievementId = DB::table('fit_achievements')->where('code', $code)->value('id');
        if ($achievementId) {
            DB::table('fit_client_achievements')->insert([
                'client_id' => $clientId, 'achievement_id' => $achievementId, 'earned_at' => $this->today->subDays(($clientId % 20) + 3),
                'meta' => json_encode(['source' => 'brian_mvp_seeder']), 'created_at' => now(), 'updated_at' => now(),
            ]);
        }
    }

    private function conversation(int $clientId, string $trainerMessage, string $clientMessage): void
    {
        $clientUserId = DB::table('fit_clients')->where('id', $clientId)->value('user_id');
        DB::table('fit_messages')->insert([
            ['trainer_id' => $this->trainer->id, 'client_id' => $clientId, 'sender_user_id' => $this->trainer->id, 'message' => $trainerMessage, 'read_at' => now(), 'created_at' => now()->subDay(), 'updated_at' => now()->subDay()],
            ['trainer_id' => $this->trainer->id, 'client_id' => $clientId, 'sender_user_id' => $clientUserId ?: $this->trainer->id, 'message' => $clientMessage, 'read_at' => null, 'created_at' => now()->subHours(12), 'updated_at' => now()->subHours(12)],
        ]);
    }

    private function seedTrainerNotifications(array $clients): void
    {
        $notifications = [
            ['ALERT', 'Laura reportó dolor', 'Dolor 6/10 en rodilla derecha. Revisa su check-in.', ['client_id' => $clients['laura']]],
            ['PERSONAL_RECORD', 'Nuevo récord de Andrés', 'Andrés mejoró su 1RM estimado en press banca.', ['client_id' => $clients['andres']]],
            ['CHECKIN', 'Check-in de Camila recibido', 'Adherencia semanal del 86%.', ['client_id' => $clients['camila']]],
            ['LEAD', 'Valoración pendiente', 'Mateo aún no tiene acceso habilitado ni plan asignado.', ['client_id' => $clients['mateo']]],
        ];
        foreach ($notifications as [$type, $title, $body, $data]) {
            DB::table('fit_notifications')->insert([
                'user_id' => $this->trainer->id, 'type' => $type, 'title' => $title, 'body' => $body,
                'data' => json_encode($data), 'read_at' => null, 'created_at' => now(), 'updated_at' => now(),
            ]);
        }
    }
}
