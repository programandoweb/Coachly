'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { getRoutineDetail, getWorkoutReportForRoutine } from '@/lib/api/fit';
import { apiErrorMessage } from '@/lib/api/errors';
import { WorkoutTracker } from '@/components/WorkoutTracker';
import type { RoutineDetail, WorkoutSetLogRow } from '@/lib/api/types';

export default function ClientRoutinePage() {
  const { user } = useAuthGuard('CLIENT');
  const params = useParams<{ id: string }>();
  const routineId = Number(params.id);

  const [detail, setDetail] = useState<RoutineDetail | null>(null);
  const [logs, setLogs] = useState<WorkoutSetLogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const result = await getRoutineDetail(routineId);
      if (!result) {
        setNotFound(true);
        return;
      }
      setDetail(result);
      setLogs(await getWorkoutReportForRoutine(result.routine.id, result.routine.client_id));
    } catch (cause) {
      setError(apiErrorMessage(cause, 'No fue posible cargar la rutina.'));
    } finally {
      setLoading(false);
    }
  }, [routineId]);

  useEffect(() => {
    if (!user) return;
    load();
  }, [user, load]);

  if (loading || !user) return null;
  if (error) return <div className="error-box">{error}</div>;
  if (notFound || !detail) return <div className="error-box">Rutina no encontrada.</div>;

  const { routine, exercises, workout_session } = detail;

  return (
    <>
      <section className="routine-page-head">
        <div className="routine-head-actions-row">
          <Link href="/mis-rutinas" className="btn btn-soft">Volver</Link>
        </div>
        <div className="routine-title-block">
          <div className="eyebrow">Tu rutina</div>
          <h1 className="h1">{routine.title}</h1>
          <p className="subtitle">{routine.objective || 'Sin objetivo'} · {routine.level || 'Sin nivel'}</p>
          {routine.notes ? <p className="routine-inline-note"><strong>Notas:</strong> {routine.notes}</p> : null}
        </div>
      </section>

      <section className="routine-tracker-card">
        <WorkoutTracker
          exercises={exercises}
          initialLogs={logs}
          timerStorageKey={`routine:${routine.id}:user:${user.id}`}
          routineId={routine.id}
          clientMode
          initialWorkoutSession={workout_session || null}
        />
      </section>
    </>
  );
}
