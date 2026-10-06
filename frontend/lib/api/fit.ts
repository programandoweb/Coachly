import { LaravelApiError } from './errors';
import { browserLaravelApi } from './client';
import type {
  ClientDetail,
  ClientPortal,
  ClientRow,
  ExerciseHistoryResponse,
  ExerciseRow,
  MeasurementRow,
  MuscleGroupRow,
  MuscleRow,
  RoutineDetail,
  RoutineRow,
  UserRow,
  WorkoutSetLogRow,
  WorkoutSessionRow
} from './types';

async function nullOnNotFound<T>(request: Promise<T>): Promise<T | null> {
  try {
    return await request;
  } catch (error) {
    if (error instanceof LaravelApiError && error.status === 404) return null;
    throw error;
  }
}

export async function login(whatsapp: string, password: string) {
  return browserLaravelApi<{
    user: UserRow;
    access_token: string;
    token_type: string;
    expires_in: number;
  }>('POST', 'fit/auth/login', {
    skipToken: true,
    body: { whatsapp, password }
  });
}

export async function forgotPassword(identifier: string) {
  return browserLaravelApi<{ message: string }>('POST', 'fit/auth/forgot-password', {
    skipToken: true,
    body: { identifier }
  });
}

export async function resetPassword(params: {
  token: string;
  email: string;
  password: string;
  password_confirmation: string;
}) {
  return browserLaravelApi<{ message: string }>('POST', 'fit/auth/reset-password', {
    skipToken: true,
    body: params
  });
}

export async function listMuscleGroups() {
  const response = await browserLaravelApi<{ muscle_groups: MuscleGroupRow[] }>('GET', 'fit/muscle-groups');
  return response.muscle_groups;
}

export async function getMuscleGroup(id: number) {
  const response = await browserLaravelApi<{ muscle_group: MuscleGroupRow }>('GET', `fit/muscle-groups/${id}`);
  return response.muscle_group;
}

export async function updateMuscleGroup(
  id: number,
  params: { description?: string | null; image?: File | null; removeImage?: boolean }
) {
  const formData = new FormData();
  formData.set('_method', 'PUT');
  if (params.description !== undefined) formData.set('description', params.description ?? '');
  if (params.image) formData.set('image', params.image);
  if (params.removeImage) formData.set('remove_image', '1');

  return browserLaravelApi<{ muscle_group: MuscleGroupRow }>('POST', `fit/muscle-groups/${id}`, {
    body: formData
  });
}

export async function listMuscles(muscleGroupId: number) {
  const response = await browserLaravelApi<{ muscles: MuscleRow[] }>('GET', `fit/muscle-groups/${muscleGroupId}/muscles`);
  return response.muscles;
}

export async function updateMuscle(
  id: number,
  params: { description?: string | null; image?: File | null; removeImage?: boolean }
) {
  const formData = new FormData();
  formData.set('_method', 'PUT');
  if (params.description !== undefined) formData.set('description', params.description ?? '');
  if (params.image) formData.set('image', params.image);
  if (params.removeImage) formData.set('remove_image', '1');

  return browserLaravelApi<{ muscle: MuscleRow }>('POST', `fit/muscles/${id}`, {
    body: formData
  });
}

export async function changePassword(params: {
  current_password: string;
  password: string;
  password_confirmation: string;
}) {
  return browserLaravelApi<{ message: string }>('PUT', 'fit/auth/password', {
    body: params
  });
}

export async function logout() {
  return browserLaravelApi<void>('POST', 'fit/auth/logout');
}

export async function currentUser() {
  return browserLaravelApi<{ user: UserRow }>('GET', 'fit/auth/me');
}

export async function getTrainerDashboard(_trainerId?: number) {
  return browserLaravelApi<{
    clients: number;
    routines: number;
    exercises: number;
    lastClients: ClientRow[];
    lastRoutines: RoutineRow[];
  }>('GET', 'fit/dashboard');
}

export async function listClients(_trainerId?: number) {
  return (await browserLaravelApi<{ clients: ClientRow[] }>('GET', 'fit/clients')).clients;
}

export async function listClientsBasic(_trainerId?: number) {
  return (await browserLaravelApi<{ clients: ClientRow[] }>('GET', 'fit/clients/basic')).clients;
}

export async function createClient(data: {
  name: string;
  whatsapp: string;
  email: string | null;
  password: string;
  accessEnabled: boolean;
  birthDate: string | null;
  gender: string | null;
  goal: string | null;
  weightKg: number | null;
  heightCm: number | null;
  healthSurvey: string | null;
  injuries: string | null;
  medicalConditions: string | null;
  medications: string | null;
  trainingExperience: string | null;
  availableDays: string | null;
  notes: string | null;
}) {
  const response = await browserLaravelApi<{ client: ClientRow }>('POST', 'fit/clients', {
    body: {
      name: data.name,
      whatsapp: data.whatsapp,
      email: data.email,
      password: data.password,
      access_enabled: data.accessEnabled,
      birth_date: data.birthDate,
      gender: data.gender,
      goal: data.goal,
      weight_kg: data.weightKg,
      height_cm: data.heightCm,
      health_survey: data.healthSurvey,
      injuries: data.injuries,
      medical_conditions: data.medicalConditions,
      medications: data.medications,
      training_experience: data.trainingExperience,
      available_days: data.availableDays,
      notes: data.notes
    }
  });
  return Number(response.client.id);
}

export async function getClientDetail(clientId: number, _trainerId?: number) {
  return nullOnNotFound(browserLaravelApi<ClientDetail>('GET', `fit/clients/${clientId}`));
}

export async function getClientExerciseHistory(clientId: number, filters?: { from?: string; to?: string }) {
  const query = new URLSearchParams();
  if (filters?.from) query.set('from', filters.from);
  if (filters?.to) query.set('to', filters.to);
  const suffix = query.toString() ? `?${query.toString()}` : '';
  return browserLaravelApi<ExerciseHistoryResponse>('GET', `fit/clients/${clientId}/exercise-history${suffix}`);
}

export async function updateClient(data: Partial<ClientRow> & { id: number }) {
  return (await browserLaravelApi<{ client: ClientRow }>('PUT', `fit/clients/${data.id}`, {
    body: {
      name: data.name,
      whatsapp: data.whatsapp,
      email: data.email,
      birth_date: data.birth_date,
      gender: data.gender,
      goal: data.goal,
      weight_kg: data.weight_kg,
      height_cm: data.height_cm,
      health_survey: data.health_survey,
      injuries: data.injuries,
      medical_conditions: data.medical_conditions,
      medications: data.medications,
      training_experience: data.training_experience,
      available_days: data.available_days,
      notes: data.notes
    }
  })).client;
}

export async function deleteClient(clientId: number) {
  await browserLaravelApi<{ message: string }>('DELETE', `fit/clients/${clientId}`);
}

export async function shareClientAccess(clientId: number) {
  return browserLaravelApi<{ client: ClientRow }>(
    'POST',
    `fit/clients/${clientId}/share-access`
  );
}

export async function setClientActive(clientId: number, isActive: boolean) {
  return (await browserLaravelApi<{ client: ClientRow }>('PUT', `fit/clients/${clientId}/active`, {
    body: { is_active: isActive }
  })).client;
}

export async function addMeasurement(data: {
  clientId: number;
  weightKg: number | null;
  heightCm: number | null;
  waistCm: number | null;
  chestCm: number | null;
  hipCm: number | null;
  bodyFat: number | null;
  notes: string | null;
}) {
  return (await browserLaravelApi<{ measurement: MeasurementRow }>('POST', `fit/clients/${data.clientId}/measurements`, {
    body: {
      weight_kg: data.weightKg,
      height_cm: data.heightCm,
      waist_cm: data.waistCm,
      chest_cm: data.chestCm,
      hip_cm: data.hipCm,
      body_fat: data.bodyFat,
      notes: data.notes
    }
  })).measurement;
}

export async function listRoutines(_trainerId?: number) {
  return (await browserLaravelApi<{ routines: RoutineRow[] }>('GET', 'fit/routines')).routines;
}

export async function createRoutine(data: {
  clientId: number | null;
  muscleGroupId?: number | null;
  title: string;
  objective: string | null;
  level: string | null;
  notes: string | null;
}) {
  const response = await browserLaravelApi<{ routine: RoutineRow }>('POST', 'fit/routines', {
    body: {
      client_id: data.clientId,
      muscle_group_id: data.muscleGroupId ?? null,
      title: data.title,
      objective: data.objective,
      level: data.level,
      notes: data.notes
    }
  });
  return Number(response.routine.id);
}

export async function createRoutineForClient(data: {
  clientId: number;
  muscleGroupId?: number | null;
  title: string;
  objective: string | null;
  level: string | null;
  notes: string | null;
}) {
  const response = await browserLaravelApi<{ routine: RoutineRow }>('POST', `fit/clients/${data.clientId}/routines`, {
    body: {
      muscle_group_id: data.muscleGroupId ?? null,
      title: data.title,
      objective: data.objective,
      level: data.level,
      notes: data.notes
    }
  });

  if (Number(response.routine.client_id) !== data.clientId) {
    throw new LaravelApiError('Laravel creó la rutina sin asignarla al cliente solicitado.', 500);
  }

  return Number(response.routine.id);
}

export async function getRoutineDetail(routineId: number, _trainerId?: number) {
  return nullOnNotFound(browserLaravelApi<RoutineDetail>('GET', `fit/routines/${routineId}`));
}

export async function deleteRoutine(routineId: number) {
  await browserLaravelApi<{ message: string }>('DELETE', `fit/routines/${routineId}`);
}

export async function deleteExercise(routineId: number, exerciseId: number) {
  await browserLaravelApi<{ message: string }>('DELETE', `fit/routines/${routineId}/exercises/${exerciseId}`);
}

export async function moveExercise(routineId: number, exerciseId: number, direction: 'up' | 'down') {
  return (
    await browserLaravelApi<{ exercises: ExerciseRow[] }>('PUT', `fit/routines/${routineId}/exercises/${exerciseId}/move`, {
      body: { direction }
    })
  ).exercises;
}

export async function addExercise(data: {
  routineId: number;
  name: string;
  muscleGroup: string | null;
  sets: number;
  reps: string;
  restSeconds: number | null;
  targetWeightKg: number | null;
  tempo: string | null;
  method: string | null;
  notes: string | null;
}) {
  return (await browserLaravelApi<{ exercise: ExerciseRow }>('POST', `fit/routines/${data.routineId}/exercises`, {
    body: {
      name: data.name,
      muscle_group: data.muscleGroup,
      sets: data.sets,
      reps: data.reps,
      rest_seconds: data.restSeconds,
      target_weight_kg: data.targetWeightKg,
      tempo: data.tempo,
      method: data.method,
      notes: data.notes
    }
  })).exercise;
}

export async function updateExercise(data: {
  routineId: number;
  exerciseId: number;
  name: string;
  muscleGroup: string | null;
  sets: number;
  reps: string;
  restSeconds: number | null;
  restSecondsOverrides?: Record<string, number> | null;
  targetWeightKg: number | null;
  tempo: string | null;
  method: string | null;
  notes: string | null;
}) {
  return (await browserLaravelApi<{ exercise: ExerciseRow }>('PUT', `fit/routines/${data.routineId}/exercises/${data.exerciseId}`, {
    body: {
      name: data.name,
      muscle_group: data.muscleGroup,
      sets: data.sets,
      reps: data.reps,
      rest_seconds: data.restSeconds,
      ...(data.restSecondsOverrides !== undefined ? { rest_seconds_overrides: data.restSecondsOverrides } : {}),
      target_weight_kg: data.targetWeightKg,
      tempo: data.tempo,
      method: data.method,
      notes: data.notes
    }
  })).exercise;
}

export async function getRoutineByToken(token: string) {
  return nullOnNotFound(browserLaravelApi<RoutineDetail & { logs: WorkoutSetLogRow[] }>(
    'GET',
    `fit/public/routines/${encodeURIComponent(token)}`,
    { skipToken: true }
  ));
}

export async function getClientPortal(_clientId?: number) {
  return browserLaravelApi<ClientPortal>('GET', 'fit/client/portal');
}

export async function getWorkoutReportForRoutine(routineId: number, _clientId?: number | null) {
  return (await browserLaravelApi<{ logs: WorkoutSetLogRow[] }>('GET', `fit/routines/${routineId}/workout-report`)).logs;
}

export async function updateWorkoutSession(routineId: number, action: 'start' | 'finish') {
  return (await browserLaravelApi<{ workout_session: WorkoutSessionRow }>('PUT', `fit/routines/${routineId}/workout-session`, {
    body: { action }
  })).workout_session;
}

export async function getPlatformOverview() {
  return browserLaravelApi<any>('GET', 'fit/platform/overview');
}
export async function listExerciseLibrary(search = '') {
  return browserLaravelApi<any>('GET', `fit/exercises${search ? `?search=${encodeURIComponent(search)}` : ''}`);
}
export async function createLibraryExercise(body: Record<string, unknown>) {
  return browserLaravelApi<any>('POST', 'fit/exercises', { body });
}
export async function deleteLibraryExercise(exerciseId: number) {
  return browserLaravelApi<{ message: string }>('DELETE', `fit/exercises/${exerciseId}`);
}
export async function listTrainingPlans() {
  return browserLaravelApi<any>('GET', 'fit/plans');
}
export async function createTrainingPlan(body: Record<string, unknown>) {
  return browserLaravelApi<any>('POST', 'fit/plans', { body });
}
export async function listCheckins() {
  return browserLaravelApi<any>('GET', 'fit/checkins');
}
export async function saveCheckin(body: Record<string, unknown>) {
  return browserLaravelApi<any>('POST', 'fit/checkins', { body });
}
export async function listAchievements() {
  return browserLaravelApi<any>('GET', 'fit/achievements');
}
