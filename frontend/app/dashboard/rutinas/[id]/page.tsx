'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { getRoutineDetail, getWorkoutReportForRoutine } from '@/lib/api/fit';
import { apiErrorMessage } from '@/lib/api/errors';
import { WorkoutTracker } from '@/components/WorkoutTracker';
import type { ExerciseRow, RoutineDetail, WorkoutSetLogRow } from '@/lib/api/types';
import AddExerciseModal from './AddExerciseModal';
import RoutineBackButton from './RoutineBackButton';
import RoutineShareActions from './RoutineShareActions';

function getShareUrl(token: string) {
  const base = process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : '');
  return `${base}/r/${token}`;
}

function getWhatsAppShareHref(phone: string | null | undefined, message: string) {
  let digits = String(phone || '').replace(/\D/g, '');
  if (!digits) return null;
  if (digits.length === 10 && digits.startsWith('3')) digits = `57${digits}`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export default function RoutineDetailPage() {
  const { user, checking } = useAuthGuard('TRAINER');
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const routineId = Number(params.id);

  const [detail, setDetail] = useState<RoutineDetail | null>(null);
  const [logs, setLogs] = useState<WorkoutSetLogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState('');
  const [createExerciseOpen, setCreateExerciseOpen] = useState(searchParams.get('exercise') === '1');
  const [editingExercise, setEditingExercise] = useState<ExerciseRow | null>(null);

  const reload = useCallback(async (options?: { silent?: boolean }) => {
    if (!user) return;
    if (!options?.silent) setLoading(true);
    try {
      const result = await getRoutineDetail(routineId, Number(user.trainer_id));
      if (!result) {
        setNotFound(true);
        return;
      }
      setDetail(result);
      const workoutLogs = await getWorkoutReportForRoutine(result.routine.id, result.routine.client_id);
      setLogs(workoutLogs);
      setNotFound(false);
    } catch (cause) {
      setError(apiErrorMessage(cause, 'No fue posible cargar la rutina.'));
    } finally {
      if (!options?.silent) setLoading(false);
    }
  }, [user, routineId]);

  const reloadSilently = useCallback(() => reload({ silent: true }), [reload]);

  useEffect(() => {
    if (checking || !user) return;
    reload();
  }, [checking, user, reload]);

  useEffect(() => {
    if (searchParams.get('exercise') === '1') {
      setCreateExerciseOpen(true);
    }
  }, [searchParams]);

  if (checking || loading) return null;
  if (error) return <div className="error-box">{error}</div>;
  if (notFound || !detail || !user) return <div className="error-box">Rutina no encontrada.</div>;

  const { routine, exercises, workout_session } = detail;
  const shareUrl = getShareUrl(routine.share_token);
  const whatsappHref = getWhatsAppShareHref(
    routine.client_whatsapp,
    `Hola ${routine.client_name || ''}, te comparto tu rutina ${routine.title}: ${shareUrl}`
  );

  return (
    <>
      <section className="routine-page-head">
        <div className="routine-head-actions-row">
          <RoutineBackButton />
          <div className="routine-head-actions" aria-label="Gestionar rutina">
            <span>Gestionar rutina</span>
            <button
              type="button"
              className="routine-icon-button add"
              onClick={() => {
                setEditingExercise(null);
                setCreateExerciseOpen(true);
              }}
              aria-label="Agregar ejercicio"
              title="Agregar ejercicio"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M11 5a1 1 0 0 1 2 0v6h6a1 1 0 1 1 0 2h-6v6a1 1 0 1 1-2 0v-6H5a1 1 0 1 1 0-2h6V5Z" />
              </svg>
            </button>
            <RoutineShareActions shareUrl={shareUrl} whatsappHref={whatsappHref} />
            <AddExerciseModal
              routineId={routine.id}
              open={createExerciseOpen || Boolean(editingExercise)}
              exercise={editingExercise}
              onOpenChange={(nextOpen) => {
                if (!nextOpen) {
                  setCreateExerciseOpen(false);
                  setEditingExercise(null);
                }
              }}
              onSaved={reload}
            />
          </div>
        </div>

        <div className="routine-title-block">
          <div className="eyebrow">Constructor de rutina</div>
          <h1 className="h1">{routine.title}</h1>
          <p className="subtitle">{routine.client_name || 'Plantilla general'} · {routine.objective || 'Sin objetivo'} · {routine.level || 'Sin nivel'}</p>
          {routine.notes ? <p className="routine-inline-note"><strong>Notas:</strong> {routine.notes}</p> : null}
        </div>
      </section>

      <section className="routine-tracker-card">
        <WorkoutTracker
          exercises={exercises}
          initialLogs={logs}
          timerStorageKey={`routine:${routine.id}:user:${user.id}`}
          routineId={routine.id}
          initialWorkoutSession={workout_session || null}
          readOnlyMessage={!routine.client_id ? 'Esta rutina es una plantilla general. Asignala a un cliente para registrar entrenamiento.' : undefined}
          onExerciseDeleted={reloadSilently}
          onExerciseUpdated={reloadSilently}
          onExerciseClick={(exercise) => {
            setCreateExerciseOpen(false);
            setEditingExercise(exercise);
          }}
        />
      </section>
    </>
  );
}
