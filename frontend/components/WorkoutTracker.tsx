'use client';

import { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { useLaravelApi } from '@/hooks/useLaravelApi';
import { apiErrorMessage } from '@/lib/api/errors';
import { deleteExercise, moveExercise, updateExercise } from '@/lib/api/fit';
import type { ExerciseRow, ExerciseScoreRow, WorkoutSessionRow, WorkoutSetLogRow } from '@/lib/api/types';

type Props = {
  exercises: ExerciseRow[];
  initialLogs?: WorkoutSetLogRow[];
  shareToken?: string;
  readOnlyMessage?: string;
  timerStorageKey: string;
  routineId?: number;
  clientMode?: boolean;
  initialWorkoutSession?: WorkoutSessionRow | null;
  onExerciseDeleted?: () => void;
  onExerciseUpdated?: () => void;
  onExerciseClick?: (exercise: ExerciseRow) => void;
};

type DoneMap = Record<string, { weightKg: number | null; repsDone: number | null; completedAt: string }>;

type WorkoutSummary = {
  durationSeconds: number;
  completedAt: string;
  exercises: Array<{
    name: string;
    sets: Array<{ setNumber: number; weightKg: number | null; repsDone: number | null }>;
  }>;
};

function key(exerciseId: number, setNumber: number) {
  return `${exerciseId}:${setNumber}`;
}

function parseNumber(value: string) {
  if (!value.trim()) return null;
  const parsed = Number(value.replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : null;
}

function formatClock(seconds: number) {
  const min = Math.floor(seconds / 60).toString().padStart(2, '0');
  const sec = Math.max(0, seconds % 60).toString().padStart(2, '0');
  return `${min}:${sec}`;
}

function formatWorkoutClock(seconds: number) {
  const hours = Math.floor(seconds / 3600).toString().padStart(2, '0');
  const minutes = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
  const secs = Math.max(0, seconds % 60).toString().padStart(2, '0');
  return `${hours}:${minutes}:${secs}`;
}

function methodForSet(method: string | null, setNumber: number, totalSets: number) {
  const normalizedMethod = method?.trim();

  if (!normalizedMethod) return 'Serie convencional';
  if (normalizedMethod === 'Parciales en elongación') return normalizedMethod;

  return setNumber === totalSets ? normalizedMethod : 'Serie convencional';
}

export function WorkoutTracker({ exercises, initialLogs = [], shareToken, readOnlyMessage, routineId, clientMode = false, initialWorkoutSession = null, onExerciseDeleted, onExerciseUpdated, onExerciseClick }: Props) {
  const api = useLaravelApi();
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [restSeconds, setRestSeconds] = useState(0);
  const [deletingExerciseId, setDeletingExerciseId] = useState<number | null>(null);
  const [updatingExerciseId, setUpdatingExerciseId] = useState<number | null>(null);
  const [openMenuExerciseId, setOpenMenuExerciseId] = useState<number | null>(null);
  const [reorderingExerciseId, setReorderingExerciseId] = useState<number | null>(null);
  const [movingExerciseId, setMovingExerciseId] = useState<number | null>(null);
  const [deleteExerciseError, setDeleteExerciseError] = useState('');
  const [restEditorExerciseId, setRestEditorExerciseId] = useState<number | null>(null);
  const [savingRestKey, setSavingRestKey] = useState<string | null>(null);
  // Valor optimista mientras el PUT a rest_seconds_overrides está en vuelo o recién
  // confirmado: evita que el cronómetro use el dato viejo del prop `exercises` antes
  // de que termine el reload silencioso, y que el input "salte" hacia atrás.
  const [pendingRestOverrides, setPendingRestOverrides] = useState<Record<string, number | null>>({});
  const [restDrafts, setRestDrafts] = useState<Record<string, string>>({});

  function effectiveRestSeconds(exercise: ExerciseRow, setNumber: number) {
    const restKey = key(exercise.id, setNumber);
    if (restKey in pendingRestOverrides) {
      const pending = pendingRestOverrides[restKey];
      return pending != null ? pending : Number(exercise.rest_seconds || 120);
    }
    const override = exercise.rest_seconds_overrides?.[String(setNumber)];
    return override != null ? override : Number(exercise.rest_seconds || 120);
  }

  function adjustRestSeconds(exercise: ExerciseRow, setNumber: number, delta: number) {
    const current = effectiveRestSeconds(exercise, setNumber);
    const next = Math.max(0, current + delta);
    const restKey = key(exercise.id, setNumber);
    setRestDrafts((current) => {
      const draft = { ...current };
      delete draft[restKey];
      return draft;
    });
    handleSetRestChange(exercise, setNumber, String(next));
  }

  async function handleSetRestChange(exercise: ExerciseRow, setNumber: number, rawValue: string) {
    if (!routineId) return;

    const trimmed = rawValue.trim();
    const parsed = trimmed === '' ? null : Number(trimmed);
    const seconds = parsed !== null && Number.isFinite(parsed) ? Math.max(0, Math.round(parsed)) : null;

    // Partimos del último estado conocido (confirmado + optimista) en vez de solo
    // `exercise.rest_seconds_overrides`: si el usuario dio varios clics seguidos en
    // +/- (uno por serie o repetidos en la misma), ese prop puede seguir desactualizado
    // porque el guardado anterior aún no volvió del servidor. Partir del prop viejo
    // borraba el cambio recién confirmado al enviar el siguiente PUT.
    const overrides: Record<string, number> = { ...(exercise.rest_seconds_overrides || {}) };
    const pendingPrefix = `${exercise.id}:`;
    Object.entries(pendingRestOverrides).forEach(([pendingKey, value]) => {
      if (!pendingKey.startsWith(pendingPrefix)) return;
      const pendingSetNumber = pendingKey.slice(pendingPrefix.length);
      if (value == null) delete overrides[pendingSetNumber];
      else overrides[pendingSetNumber] = value;
    });
    if (seconds === null) {
      delete overrides[String(setNumber)];
    } else {
      overrides[String(setNumber)] = seconds;
    }

    const restKey = key(exercise.id, setNumber);
    setPendingRestOverrides((current) => ({ ...current, [restKey]: seconds }));
    setSavingRestKey(restKey);
    setDeleteExerciseError('');
    try {
      await updateExercise({
        routineId,
        exerciseId: exercise.id,
        name: exercise.name,
        muscleGroup: exercise.muscle_group,
        sets: Number(exercise.sets),
        reps: exercise.reps,
        restSeconds: exercise.rest_seconds,
        restSecondsOverrides: overrides,
        targetWeightKg: exercise.target_weight_kg,
        tempo: exercise.tempo,
        method: exercise.method,
        notes: exercise.notes
      });
      onExerciseUpdated?.();
    } catch (cause) {
      // Solo revertimos el valor optimista si falló: si tuvo éxito lo dejamos puesto,
      // el reload silencioso terminará de sincronizar el prop `exercises` en segundo
      // plano sin que el cronómetro o el input parpadeen de vuelta al valor viejo.
      setPendingRestOverrides((current) => {
        const next = { ...current };
        delete next[restKey];
        return next;
      });
      setDeleteExerciseError(apiErrorMessage(cause, 'No fue posible actualizar el descanso de la serie.'));
    } finally {
      setSavingRestKey(null);
    }
  }

  async function handleDeleteExercise(exercise: ExerciseRow) {
    if (!routineId || deletingExerciseId) return;
    if (!window.confirm(`¿Eliminar el ejercicio "${exercise.name}"?`)) return;

    setDeletingExerciseId(exercise.id);
    setDeleteExerciseError('');
    try {
      await deleteExercise(routineId, exercise.id);
      onExerciseDeleted?.();
    } catch (cause) {
      setDeleteExerciseError(apiErrorMessage(cause, 'No fue posible eliminar el ejercicio.'));
    } finally {
      setDeletingExerciseId(null);
    }
  }

  function toggleExerciseMenu(exerciseId: number) {
    setOpenMenuExerciseId((current) => (current === exerciseId ? null : exerciseId));
    setReorderingExerciseId(null);
  }

  function closeExerciseMenu() {
    setOpenMenuExerciseId(null);
    setReorderingExerciseId(null);
  }

  async function handleMoveExercise(exercise: ExerciseRow, direction: 'up' | 'down') {
    if (!routineId || movingExerciseId) return;

    setMovingExerciseId(exercise.id);
    setDeleteExerciseError('');
    try {
      await moveExercise(routineId, exercise.id, direction);
      onExerciseUpdated?.();
    } catch (cause) {
      setDeleteExerciseError(apiErrorMessage(cause, 'No fue posible reordenar el ejercicio.'));
    } finally {
      setMovingExerciseId(null);
    }
  }

  async function handleAddSet(exercise: ExerciseRow) {
    if (!routineId || updatingExerciseId) return;

    setUpdatingExerciseId(exercise.id);
    setDeleteExerciseError('');

    try {
      await updateExercise({
        routineId,
        exerciseId: exercise.id,
        name: exercise.name,
        muscleGroup: exercise.muscle_group,
        sets: Number(exercise.sets) + 1,
        reps: exercise.reps,
        restSeconds: exercise.rest_seconds,
        targetWeightKg: exercise.target_weight_kg,
        tempo: exercise.tempo,
        method: exercise.method,
        notes: exercise.notes
      });
      onExerciseUpdated?.();
    } catch (cause) {
      setDeleteExerciseError(apiErrorMessage(cause, 'No fue posible agregar la serie.'));
    } finally {
      setUpdatingExerciseId(null);
    }
  }

  async function handleRemoveSet(exercise: ExerciseRow) {
    if (!routineId || updatingExerciseId) return;
    if (Number(exercise.sets) <= 1) return;

    setUpdatingExerciseId(exercise.id);
    setDeleteExerciseError('');

    try {
      await updateExercise({
        routineId,
        exerciseId: exercise.id,
        name: exercise.name,
        muscleGroup: exercise.muscle_group,
        sets: Number(exercise.sets) - 1,
        reps: exercise.reps,
        restSeconds: exercise.rest_seconds,
        targetWeightKg: exercise.target_weight_kg,
        tempo: exercise.tempo,
        method: exercise.method,
        notes: exercise.notes
      });
      onExerciseUpdated?.();
    } catch (cause) {
      setDeleteExerciseError(apiErrorMessage(cause, 'No fue posible quitar la serie.'));
    } finally {
      setUpdatingExerciseId(null);
    }
  }

  const [workoutSession, setWorkoutSession] = useState<WorkoutSessionRow | null>(initialWorkoutSession);
  const [workoutSeconds, setWorkoutSeconds] = useState(() => {
    if (!initialWorkoutSession?.is_active) return 0;
    return Math.max(0, Math.floor((Date.now() - new Date(initialWorkoutSession.started_at).getTime()) / 1000));
  });
  const [sessionPending, setSessionPending] = useState(false);
  const [workoutSummary, setWorkoutSummary] = useState<WorkoutSummary | null>(null);
  const [sharePending, setSharePending] = useState(false);
  const [exerciseScores, setExerciseScores] = useState<Record<string, ExerciseScoreRow>>(() => {
    const scores: Record<string, ExerciseScoreRow> = {};
    exercises.forEach((exercise) => {
      if (exercise.last_score) scores[String(exercise.id)] = exercise.last_score;
    });
    return scores;
  });
  const [activeRest, setActiveRest] = useState<string | null>(null);
  const restIntervalRef = useRef<number | null>(null);
  const restEndAtRef = useRef<number | null>(null);
  const restEndAudioRef = useRef<HTMLAudioElement | null>(null);
  const audioUnlockedRef = useRef(false);

  useEffect(() => {
    const audio = new Audio('/sound/campana-3.mp3');
    audio.preload = 'auto';
    restEndAudioRef.current = audio;
  }, []);

  // Los navegadores solo permiten reproducir audio por JS tras un gesto del usuario.
  // "Desbloqueamos" el elemento una sola vez (reproducir + pausar en silencio) para
  // que luego el sonido del fin de descanso suene sin pedir permiso cada vez.
  function unlockRestEndAudio() {
    if (audioUnlockedRef.current) return;
    const audio = restEndAudioRef.current;
    if (!audio) return;

    audio
      .play()
      .then(() => {
        audio.pause();
        audio.currentTime = 0;
        audioUnlockedRef.current = true;
      })
      .catch(() => {
        // Se reintentará desbloquear en el próximo gesto del usuario.
      });
  }

  function playRestEndSound() {
    const audio = restEndAudioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    audio.play().catch(() => {
      // Si el navegador aún bloquea la reproducción, se ignora silenciosamente.
    });
  }
  const [done, setDone] = useState<DoneMap>(() => {
    const map: DoneMap = {};
    initialLogs.forEach((log) => {
      map[key(Number(log.exercise_id), Number(log.set_number))] = {
        weightKg: log.weight_kg,
        repsDone: log.reps_done,
        completedAt: log.completed_at
      };
    });
    return map;
  });
  const [values, setValues] = useState<Record<string, { weight: string; reps: string }>>(() => {
    const data: Record<string, { weight: string; reps: string }> = {};
    exercises.forEach((exercise) => {
      for (let set = 1; set <= Number(exercise.sets); set += 1) {
        const existing = initialLogs.find((log) => Number(log.exercise_id) === Number(exercise.id) && Number(log.set_number) === set);
        const previous = exercise.last_score?.last_sets?.find((item) => Number(item.set_number) === set);
        data[key(Number(exercise.id), set)] = {
          weight: existing?.weight_kg != null ? String(existing.weight_kg) : '0',
          reps: existing?.reps_done != null
            ? String(existing.reps_done)
            : previous?.reps_done != null
              ? String(previous.reps_done)
              : String(exercise.reps || '')
        };
      }
    });
    return data;
  });

  useEffect(() => {
    const nextScores: Record<string, ExerciseScoreRow> = {};
    exercises.forEach((exercise) => {
      if (exercise.last_score) nextScores[String(exercise.id)] = exercise.last_score;
    });
    setExerciseScores(nextScores);

    setDone((current) => {
      const next: DoneMap = {};
      exercises.forEach((exercise) => {
        for (let set = 1; set <= Number(exercise.sets); set += 1) {
          const rowKey = key(Number(exercise.id), set);
          if (current[rowKey]) next[rowKey] = current[rowKey];
        }
      });
      return next;
    });

    setValues((current) => {
      const next: Record<string, { weight: string; reps: string }> = {};
      exercises.forEach((exercise) => {
        for (let set = 1; set <= Number(exercise.sets); set += 1) {
          const rowKey = key(Number(exercise.id), set);
          const existing = initialLogs.find((log) => Number(log.exercise_id) === Number(exercise.id) && Number(log.set_number) === set);
          const previous = exercise.last_score?.last_sets?.find((item) => Number(item.set_number) === set);
          next[rowKey] = current[rowKey] || {
            weight: existing?.weight_kg != null ? String(existing.weight_kg) : '0',
            reps: existing?.reps_done != null
              ? String(existing.reps_done)
              : previous?.reps_done != null
                ? String(previous.reps_done)
                : String(exercise.reps || '')
          };
        }
      });
      return next;
    });
  }, [exercises, initialLogs]);

  const totalSets = useMemo(() => exercises.reduce((acc, exercise) => acc + Number(exercise.sets || 0), 0), [exercises]);
  const completedSets = Object.keys(done).length;
  const workoutCompleted = totalSets > 0 && completedSets >= totalSets;

  function buildWorkoutSummary(): WorkoutSummary {
    return {
      durationSeconds: workoutSeconds,
      completedAt: new Date().toISOString(),
      exercises: exercises.map((exercise) => ({
        name: exercise.name,
        sets: Array.from({ length: Number(exercise.sets) }).map((_, index) => {
          const setNumber = index + 1;
          const rowKey = key(Number(exercise.id), setNumber);
          const completed = done[rowKey];
          const rowValues = values[rowKey] || { weight: '', reps: '' };
          return {
            setNumber,
            weightKg: completed?.weightKg ?? parseNumber(rowValues.weight),
            repsDone: completed?.repsDone ?? parseNumber(rowValues.reps)
          };
        })
      }))
    };
  }

  function workoutSummaryText(summary: WorkoutSummary) {
    const completedDate = new Intl.DateTimeFormat('es-CO', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(new Date(summary.completedAt));
    const lines = [
      '🏋️ Entrenamiento finalizado',
      `Fecha: ${completedDate}`,
      `Duración: ${formatWorkoutClock(summary.durationSeconds)}`,
      '',
      ...summary.exercises.flatMap((exercise) => [
        exercise.name,
        ...exercise.sets.map((set) => {
          const weight = set.weightKg != null ? `${set.weightKg} kg` : 'sin peso';
          const reps = set.repsDone != null ? `${set.repsDone} reps` : 'sin reps';
          return `• Serie ${set.setNumber}: ${weight} × ${reps}`;
        }),
        ''
      ]),
      'Completado en BryFit.'
    ];
    return lines.join('\n').trim();
  }

  async function shareWorkoutSummary() {
    if (!workoutSummary || sharePending) return;
    const text = workoutSummaryText(workoutSummary);
    setSharePending(true);
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Resumen de entrenamiento BryFit', text });
        return;
      }
      await navigator.clipboard.writeText(text);
      window.alert('Resumen copiado. Ya puedes pegarlo en WhatsApp.');
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      try {
        await navigator.clipboard.writeText(text);
        window.alert('Resumen copiado. Ya puedes pegarlo en WhatsApp.');
      } catch {
        window.alert('No fue posible compartir el resumen.');
      }
    } finally {
      setSharePending(false);
    }
  }

  function updateValue(rowKey: string, field: 'weight' | 'reps', value: string) {
    setValues((current) => ({ ...current, [rowKey]: { ...(current[rowKey] || { weight: '', reps: '' }), [field]: value } }));
  }

  useEffect(() => {
    return () => {
      if (restIntervalRef.current) window.clearInterval(restIntervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (!workoutSession) {
      setWorkoutSeconds(0);
      return;
    }

    const updateClock = () => {
      if (workoutSession.is_active) {
        const startedAt = new Date(workoutSession.started_at).getTime();
        setWorkoutSeconds(Math.max(0, Math.floor((Date.now() - startedAt) / 1000)));
        return;
      }

      setWorkoutSeconds(0);
    };

    updateClock();
    if (!workoutSession.is_active) return;

    const interval = window.setInterval(updateClock, 1000);
    return () => window.clearInterval(interval);
  }, [workoutSession]);

  async function toggleWorkoutSession() {
    if (!routineId || exercises.length === 0 || sessionPending) return;
    if (workoutSession?.is_active && !workoutCompleted) return;

    unlockRestEndAudio();
    setSessionPending(true);
    try {
      const finishing = Boolean(workoutSession?.is_active);
      const result = await api.put<{
        workout_session: WorkoutSessionRow;
        exercise_scores?: Record<string, ExerciseScoreRow>;
      }>(`fit/routines/${routineId}/workout-session`, {
        action: finishing ? 'finish' : 'start'
      });
      setWorkoutSession(result.workout_session);

      if (!finishing) {
        setDone({});
        setValues((current) => {
          const next = { ...current };
          exercises.forEach((exercise) => {
            for (let set = 1; set <= Number(exercise.sets); set += 1) {
              const rowKey = key(Number(exercise.id), set);
              next[rowKey] = {
                weight: '0',
                reps: next[rowKey]?.reps || String(exercise.reps || '')
              };
            }
          });
          return next;
        });
      }

      if (finishing) {
        const summary = buildWorkoutSummary();
        const nextScores = result.exercise_scores || {};
        setWorkoutSummary(summary);
        setExerciseScores((current) => ({ ...current, ...nextScores }));
        setDone({});
        stopRest();
        setValues((current) => {
          const next = { ...current };
          exercises.forEach((exercise) => {
            const score = nextScores[String(exercise.id)];
            for (let set = 1; set <= Number(exercise.sets); set += 1) {
              const previous = score?.last_sets?.find((item) => Number(item.set_number) === set);
              const rowKey = key(Number(exercise.id), set);
              next[rowKey] = {
                weight: '0',
                reps: previous?.reps_done != null ? String(previous.reps_done) : (next[rowKey]?.reps || String(exercise.reps || ''))
              };
            }
          });
          return next;
        });
      }
    } catch (error) {
      window.alert(apiErrorMessage(error, 'No fue posible actualizar el entrenamiento.'));
    } finally {
      setSessionPending(false);
    }
  }

  function stopRest() {
    if (restIntervalRef.current) window.clearInterval(restIntervalRef.current);
    restIntervalRef.current = null;
    restEndAtRef.current = null;
    setActiveRest(null);
    setRestSeconds(0);
  }

  function startRest(label: string, seconds = 120) {
    stopRest();
    if (seconds <= 0) return;
    setActiveRest(label);
    setRestSeconds(seconds);
    const endAt = Date.now() + seconds * 1000;
    restEndAtRef.current = endAt;

    const tick = () => {
      const endsAt = restEndAtRef.current;
      if (!endsAt) return;
      const remaining = Math.ceil((endsAt - Date.now()) / 1000);
      if (remaining <= 0) {
        stopRest();
        playRestEndSound();
        return;
      }
      setRestSeconds(remaining);
    };

    restIntervalRef.current = window.setInterval(tick, 1000);
  }

  // Al bloquear la pantalla el navegador pausa los setInterval; al desbloquear,
  // recalculamos el restante contra el timestamp real en vez de confiar en los ticks perdidos.
  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState !== 'visible') return;
      const endsAt = restEndAtRef.current;
      if (!endsAt) return;
      const remaining = Math.ceil((endsAt - Date.now()) / 1000);
      if (remaining <= 0) {
        stopRest();
        playRestEndSound();
      } else {
        setRestSeconds(remaining);
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  function toggleDone(exercise: ExerciseRow, setNumber: number) {
    if (readOnlyMessage) return;
    unlockRestEndAudio();
    const rowKey = key(Number(exercise.id), setNumber);
    const isDone = Boolean(done[rowKey]);
    const rowValues = values[rowKey] || { weight: '', reps: '' };
    setPendingKey(rowKey);
    startTransition(async () => {
      try {
        const result = await api.put<{ completed: boolean; completed_at: string | null }>('fit/workout-sets', {
          exercise_id: Number(exercise.id),
          set_number: setNumber,
          weight_kg: parseNumber(rowValues.weight),
          reps_done: parseNumber(rowValues.reps),
          share_token: shareToken || null,
          completed: !isDone
        });

        if (isDone) {
          setDone((current) => {
            const next = { ...current };
            delete next[rowKey];
            return next;
          });
          stopRest();
        } else {
          setDone((current) => ({
            ...current,
            [rowKey]: {
              weightKg: parseNumber(rowValues.weight),
              repsDone: parseNumber(rowValues.reps),
              completedAt: result.completed_at || new Date().toISOString()
            }
          }));
          startRest(`${exercise.name} · serie ${setNumber + 1 <= Number(exercise.sets) ? setNumber + 1 : 'final'}`, effectiveRestSeconds(exercise, setNumber));
        }
      } catch (error) {
        window.alert(apiErrorMessage(error, 'No fue posible actualizar la serie.'));
      } finally {
        setPendingKey(null);
      }
    });
  }

  return (
    <div className="workout-tracker">
      {exercises.length > 0 ? (
        <div className={`workout-global-timer ${workoutSession && !workoutSession.is_active ? 'completed' : ''}`} role="timer" aria-live="polite">
          <span>{workoutSession?.is_active ? 'Entrenamiento en curso' : 'Cronómetro global'}</span>
          <strong>{formatWorkoutClock(workoutSeconds)}</strong>
          {routineId ? (
            <button
              type="button"
              className={`btn ${workoutSession?.is_active ? 'btn-danger' : 'btn-primary'} workout-session-button`}
              onClick={toggleWorkoutSession}
              disabled={sessionPending || isPending || Boolean(workoutSession?.is_active && !workoutCompleted)}
              title={workoutSession?.is_active && !workoutCompleted ? 'Completa todas las series antes de finalizar.' : undefined}
            >
              {sessionPending
                ? 'Procesando...'
                : workoutSession?.is_active
                  ? 'Finalizar entrenamiento'
                  : 'Iniciar cronómetro'}
            </button>
          ) : null}
        </div>
      ) : null}
      <div className="tracker-head">
        <div className="tracker-summary">
          <span className="pill blue">Reporte</span>
          <div>
            <h2>Registro por series</h2>
            <p className="muted">Marca el chulo al completar cada serie.</p>
            {readOnlyMessage ? <p className="muted">{readOnlyMessage}</p> : null}
          </div>
        </div>
        <div className="tracker-progress">
          <strong>{completedSets}/{totalSets}</strong>
          <span>completadas</span>
        </div>
      </div>

      <div className="set-report-list">
        {deleteExerciseError ? <div className="error-box">{deleteExerciseError}</div> : null}
        {exercises.map((exercise, exerciseIndex) => (
          <div className="set-report-exercise-block" key={exercise.id}>
            <div className="set-report-card">
            <div className="set-report-title">
              <div className="exercise-number">{exerciseIndex + 1}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                  {onExerciseClick ? (
                    <button
                      type="button"
                      className="set-report-exercise-trigger"
                      onClick={() => onExerciseClick(exercise)}
                      title="Editar ejercicio"
                      aria-label={`Editar ejercicio ${exercise.name}`}
                    >
                      <strong>{exercise.name}</strong>
                    </button>
                  ) : (
                    <strong>{exercise.name}</strong>
                  )}
                  {routineId && !clientMode ? (
                    <div className="exercise-menu-wrap">
                      <button
                        type="button"
                        className="exercise-menu-button"
                        aria-label={`Opciones de ${exercise.name}`}
                        aria-haspopup="menu"
                        aria-expanded={openMenuExerciseId === exercise.id}
                        onClick={() => toggleExerciseMenu(exercise.id)}
                      >
                        <span aria-hidden="true">...</span>
                      </button>
                      {openMenuExerciseId === exercise.id && reorderingExerciseId === exercise.id ? (
                        <div className="exercise-menu" role="menu" aria-label={`Reordenar ${exercise.name}`}>
                          <button
                            type="button"
                            className="exercise-menu-item"
                            role="menuitem"
                            disabled={exerciseIndex === 0 || movingExerciseId === exercise.id}
                            onClick={() => handleMoveExercise(exercise, 'up')}
                          >
                            <span className="exercise-menu-icon" aria-hidden="true">↑</span>
                            <span>Mover arriba</span>
                          </button>
                          <button
                            type="button"
                            className="exercise-menu-item"
                            role="menuitem"
                            disabled={exerciseIndex === exercises.length - 1 || movingExerciseId === exercise.id}
                            onClick={() => handleMoveExercise(exercise, 'down')}
                          >
                            <span className="exercise-menu-icon" aria-hidden="true">↓</span>
                            <span>Mover abajo</span>
                          </button>
                          <button type="button" className="exercise-menu-item" role="menuitem" onClick={closeExerciseMenu}>
                            <span>Listo</span>
                          </button>
                        </div>
                      ) : openMenuExerciseId === exercise.id ? (
                        <div className="exercise-menu" role="menu" aria-label={`Opciones de ${exercise.name}`}>
                          <button
                            type="button"
                            className="exercise-menu-item danger"
                            role="menuitem"
                            disabled={deletingExerciseId === exercise.id}
                            onClick={() => {
                              closeExerciseMenu();
                              handleDeleteExercise(exercise);
                            }}
                          >
                            <span className="exercise-menu-icon" aria-hidden="true">🗑</span>
                            <span>{deletingExerciseId === exercise.id ? 'Eliminando...' : 'Borrar'}</span>
                          </button>
                          <button
                            type="button"
                            className="exercise-menu-item"
                            role="menuitem"
                            onClick={() => setReorderingExerciseId(exercise.id)}
                          >
                            <span className="exercise-menu-icon" aria-hidden="true">↕</span>
                            <span>Reordenar</span>
                          </button>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </div>
                <p className="muted">{exercise.sets} series · objetivo {exercise.reps} reps {exercise.target_weight_kg ? `· ${exercise.target_weight_kg} kg` : ''} {exercise.rest_seconds ? `· descanso ${formatClock(Number(exercise.rest_seconds))}` : ''}</p>
                {exercise.method ? <p className="muted"><strong>Método:</strong> {exercise.method}</p> : null}
                {exerciseScores[String(exercise.id)] ? (
                  <p className="muted exercise-last-score">
                    <strong>Último score:</strong>{' '}
                    {exerciseScores[String(exercise.id)].best_weight_kg != null
                      ? `${exerciseScores[String(exercise.id)].best_weight_kg} kg`
                      : 'Sin peso'}
                    {exerciseScores[String(exercise.id)].best_reps != null
                      ? ` × ${exerciseScores[String(exercise.id)].best_reps} reps`
                      : ''}
                    {` · volumen ${exerciseScores[String(exercise.id)].total_volume}`}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="set-report-table">
              <div className="set-report-row header">
                <span>Serie</span>
                <span>Peso anterior</span>
                <span>Peso actual</span>
                <span>Reps</span>
                <span>Método</span>
                <span>Hecho</span>
              </div>
              {Array.from({ length: Number(exercise.sets) }).map((_, index) => {
                const setNumber = index + 1;
                const rowKey = key(Number(exercise.id), setNumber);
                const isDone = Boolean(done[rowKey]);
                const previousSet = exerciseScores[String(exercise.id)]?.last_sets?.find(
                  (item) => Number(item.set_number) === setNumber
                );
                const previousWeight = previousSet?.weight_kg ?? 0;
                return (
                  <div className={`set-report-row ${isDone ? 'done' : ''}`} key={rowKey}>
                    <span className="set-number">{setNumber}</span>
                    <input
                      className="input compact previous-weight"
                      value={String(previousWeight)}
                      readOnly
                      aria-label={`Peso anterior de la serie ${setNumber}`}
                      title="Peso registrado en el entrenamiento anterior"
                    />
                    <input
                      className="input compact"
                      inputMode="decimal"
                      value={values[rowKey]?.weight ?? '0'}
                      onChange={(event) => updateValue(rowKey, 'weight', event.target.value)}
                      placeholder="kg"
                      disabled={Boolean(readOnlyMessage)}
                    />
                    <input
                      className="input compact"
                      inputMode="numeric"
                      value={values[rowKey]?.reps || ''}
                      onChange={(event) => updateValue(rowKey, 'reps', event.target.value)}
                      placeholder="reps"
                      disabled={Boolean(readOnlyMessage)}
                    />
                    {(() => {
                      const setMethod = methodForSet(exercise.method, setNumber, Number(exercise.sets));
                      return (
                        <span className="set-method" title={setMethod}>
                          {setMethod}
                        </span>
                      );
                    })()}
                    <button
                      className={`check-btn ${isDone ? 'checked' : ''}`}
                      type="button"
                      onClick={() => toggleDone(exercise, setNumber)}
                      disabled={Boolean(readOnlyMessage) || (isPending && pendingKey === rowKey)}
                      aria-label={`${isDone ? 'Desmarcar' : 'Marcar'} serie ${setNumber} de ${exercise.name}`}
                    >
                      {pendingKey === rowKey ? '...' : '✓'}
                    </button>
                  </div>
                );
              })}
            </div>
            {routineId && !clientMode ? (
              <div className="rest-editor">
                <button
                  type="button"
                  className="rest-editor-toggle"
                  onClick={() => setRestEditorExerciseId((current) => (current === exercise.id ? null : exercise.id))}
                  aria-expanded={restEditorExerciseId === exercise.id}
                >
                  <span aria-hidden="true">⏱</span>
                  {restEditorExerciseId === exercise.id ? 'Ocultar descanso por serie' : 'Personalizar descanso por serie'}
                </button>
                {restEditorExerciseId === exercise.id ? (
                  <div className="rest-editor-grid">
                    {Array.from({ length: Number(exercise.sets) }).map((_, index) => {
                      const setNumber = index + 1;
                      const restKey = key(exercise.id, setNumber);
                      return (
                        <div className="rest-editor-item" key={restKey}>
                          <span>Serie {setNumber}</span>
                          <div className="rest-editor-stepper">
                            <button
                              type="button"
                              className="rest-editor-stepper-btn"
                              aria-label={`Restar 10 segundos a la serie ${setNumber}`}
                              disabled={savingRestKey === restKey}
                              onClick={() => adjustRestSeconds(exercise, setNumber, -10)}
                            >
                              −
                            </button>
                            <input
                              className="input compact rest-editor-stepper-input"
                              type="number"
                              min={0}
                              step={1}
                              inputMode="numeric"
                              value={restDrafts[restKey] ?? String(effectiveRestSeconds(exercise, setNumber))}
                              disabled={savingRestKey === restKey}
                              onChange={(event) => {
                                const value = event.target.value;
                                setRestDrafts((current) => ({ ...current, [restKey]: value }));
                              }}
                              onBlur={(event) => {
                                const value = event.target.value;
                                setRestDrafts((current) => {
                                  const next = { ...current };
                                  delete next[restKey];
                                  return next;
                                });
                                if (Number(value) === effectiveRestSeconds(exercise, setNumber)) return;
                                handleSetRestChange(exercise, setNumber, value);
                              }}
                            />
                            <button
                              type="button"
                              className="rest-editor-stepper-btn"
                              aria-label={`Sumar 10 segundos a la serie ${setNumber}`}
                              disabled={savingRestKey === restKey}
                              onClick={() => adjustRestSeconds(exercise, setNumber, 10)}
                            >
                              +
                            </button>
                          </div>
                          <small>seg</small>
                        </div>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            ) : null}
            {routineId && !clientMode ? (
              <div className="set-report-add-set-row">
                <button
                  type="button"
                  className="btn btn-soft set-report-add-set-btn"
                  onClick={() => handleRemoveSet(exercise)}
                  disabled={updatingExerciseId === exercise.id || deletingExerciseId === exercise.id || Number(exercise.sets) <= 1}
                  title="Quitar la última serie de este ejercicio"
                >
                  {updatingExerciseId === exercise.id ? 'Quitando...' : 'Quitar serie'}
                </button>
                <button
                  type="button"
                  className="btn btn-soft set-report-add-set-btn"
                  onClick={() => handleAddSet(exercise)}
                  disabled={updatingExerciseId === exercise.id || deletingExerciseId === exercise.id}
                  title="Agregar una serie más a este ejercicio"
                >
                  {updatingExerciseId === exercise.id ? 'Agregando...' : 'Agregar serie'}
                </button>
              </div>
            ) : null}
          </div>
          </div>
        ))}
      </div>

      {restSeconds > 0 ? (
        <div className="rest-timer" role="timer" aria-live="polite">
          <button
            type="button"
            className="rest-timer-close"
            onClick={stopRest}
            aria-label="Cerrar cronómetro de descanso"
            title="Omitir este descanso"
          >
            ×
          </button>
          <span>Descanso</span>
          <strong>{formatClock(restSeconds)}</strong>
          <small>{activeRest ? `Próxima: ${activeRest}` : 'Prepara la siguiente serie'}</small>
        </div>
      ) : null}


      {workoutSummary ? (
        <div className="workout-summary-backdrop" role="presentation">
          <section className="workout-summary-modal" role="dialog" aria-modal="true" aria-labelledby="workout-summary-title">
            <button
              type="button"
              className="workout-summary-close"
              onClick={() => setWorkoutSummary(null)}
              aria-label="Cerrar resumen"
            >
              ×
            </button>
            <span className="eyebrow">Entrenamiento completado</span>
            <h2 id="workout-summary-title">Resumen de lo realizado</h2>

            <div className="workout-summary-stats">
              <div>
                <span>Duración</span>
                <strong>{formatWorkoutClock(workoutSummary.durationSeconds)}</strong>
              </div>
              <div>
                <span>Series</span>
                <strong>{workoutSummary.exercises.reduce((total, exercise) => total + exercise.sets.length, 0)}</strong>
              </div>
              <div>
                <span>Ejercicios</span>
                <strong>{workoutSummary.exercises.length}</strong>
              </div>
            </div>

            <div className="workout-summary-list">
              {workoutSummary.exercises.map((exercise) => (
                <article key={exercise.name}>
                  <strong>{exercise.name}</strong>
                  <ul>
                    {exercise.sets.map((set) => (
                      <li key={`${exercise.name}:${set.setNumber}`}>
                        Serie {set.setNumber}: {set.weightKg != null ? `${set.weightKg} kg` : 'sin peso'} × {set.repsDone != null ? `${set.repsDone} reps` : 'sin reps'}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>

            <button type="button" className="btn btn-primary workout-summary-share" onClick={shareWorkoutSummary} disabled={sharePending}>
              {sharePending ? 'Preparando...' : 'Compartir por WhatsApp'}
            </button>
            <p className="workout-summary-note">Se comparte únicamente el texto del resumen mediante el menú de compartir del dispositivo.</p>
          </section>
        </div>
      ) : null}
    </div>
  );
}
