export type UserRow = {
  id: number;
  name: string;
  email: string | null;
  whatsapp: string | null;
  role: 'TRAINER' | 'CLIENT';
  is_active: number;
  trainer_id?: number | null;
  client_id?: number | null;
};

export type ClientRow = {
  id: number;
  trainer_id: number;
  user_id: number | null;
  name: string;
  whatsapp: string;
  email: string | null;
  birth_date: string | null;
  gender: string | null;
  goal: string | null;
  weight_kg: number | null;
  height_cm: number | null;
  health_survey: string | null;
  injuries: string | null;
  medical_conditions: string | null;
  medications: string | null;
  training_experience: string | null;
  available_days: string | null;
  notes: string | null;
  access_enabled: number;
  is_active?: number;
  created_at: string;
  updated_at: string;
  trainer_name?: string | null;
  routines_count?: number;
  measurements_count?: number;
};

export type MuscleGroupRow = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  image_path: string | null;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  muscles_count?: number;
};

export type MuscleRow = {
  id: number;
  muscle_group_id: number;
  name: string;
  slug: string;
  description: string | null;
  image_path: string | null;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type RoutineRow = {
  id: number;
  trainer_id: number;
  client_id: number | null;
  muscle_group_id: number | null;
  muscle_group_name?: string | null;
  title: string;
  objective: string | null;
  level: string | null;
  notes: string | null;
  share_token: string;
  is_published: number;
  created_at: string;
  updated_at: string;
  client_name?: string | null;
  client_whatsapp?: string | null;
  exercises_count?: number;
  trainer_name?: string | null;
};


export type ExerciseScoreRow = {
  exercise_name: string;
  total_volume: number;
  best_weight_kg: number | null;
  best_reps: number | null;
  estimated_one_rep_max: number | null;
  completed_sets: number;
  last_sets: Array<{
    set_number: number;
    weight_kg: number | null;
    reps_done: number | null;
  }>;
  performed_at: string | null;
};

export type ExerciseRow = {
  id: number;
  routine_id: number;
  name: string;
  muscle_group: string | null;
  sets: number;
  reps: string;
  rest_seconds: number | null;
  rest_seconds_overrides?: Record<string, number> | null;
  target_weight_kg: number | null;
  tempo: string | null;
  method: string | null;
  notes: string | null;
  sort_order: number;
  last_score?: ExerciseScoreRow | null;
};

export type MeasurementRow = {
  id: number;
  client_id: number;
  weight_kg: number | null;
  height_cm: number | null;
  neck_cm: number | null;
  shoulders_cm: number | null;
  waist_cm: number | null;
  chest_cm: number | null;
  left_arm_cm: number | null;
  right_arm_cm: number | null;
  left_forearm_cm: number | null;
  right_forearm_cm: number | null;
  hip_cm: number | null;
  left_thigh_cm: number | null;
  right_thigh_cm: number | null;
  left_calf_cm: number | null;
  right_calf_cm: number | null;
  body_fat: number | null;
  muscle_mass_percentage: number | null;
  triceps_skinfold_mm: number | null;
  subscapular_skinfold_mm: number | null;
  suprailiac_skinfold_mm: number | null;
  abdominal_skinfold_mm: number | null;
  thigh_skinfold_mm: number | null;
  calf_skinfold_mm: number | null;
  relaxed_arm_cm: number | null;
  contracted_arm_cm: number | null;
  thorax_cm: number | null;
  thigh_cm: number | null;
  calf_cm: number | null;
  notes: string | null;
  measured_at: string;
};

export type WorkoutSetLogRow = {
  id: number;
  routine_id: number;
  client_id: number;
  exercise_id: number;
  set_number: number;
  weight_kg: number | null;
  reps_done: number | null;
  completed_at: string;
  exercise_name?: string;
};


export type WorkoutSessionRow = {
  id: number;
  routine_id: number;
  client_id: number | null;
  trainer_id: number;
  started_by: number;
  started_at: string;
  ended_at: string | null;
  duration_seconds: number | null;
  is_active: boolean;
};

export type RoutineDetail = {
  routine: RoutineRow;
  exercises: ExerciseRow[];
  logs?: WorkoutSetLogRow[];
  workout_session?: WorkoutSessionRow | null;
};

export type ClientDetail = {
  client: ClientRow;
  routines: RoutineRow[];
  measurements: MeasurementRow[];
};

export type ExerciseHistorySet = {
  set_number: number;
  weight_kg: number | null;
  reps_done: number | null;
};

export type ExerciseHistorySession = {
  date: string;
  sets: ExerciseHistorySet[];
  max_weight: number | null;
  total_volume: number;
};

export type ExerciseHistoryItem = {
  exercise_key: string;
  exercise_name: string;
  sessions: ExerciseHistorySession[];
};

export type MuscleGroupHistory = {
  muscle_group: string;
  exercises: ExerciseHistoryItem[];
};

export type ExerciseHistoryResponse = {
  muscle_groups: MuscleGroupHistory[];
};

export type ClientPortal = {
  client: ClientRow;
  routines: Array<RoutineDetail & { logs: WorkoutSetLogRow[] }>;
  measurements: MeasurementRow[];
};
