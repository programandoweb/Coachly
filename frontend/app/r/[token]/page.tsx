'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getRoutineByToken } from '@/lib/api/fit';
import { apiErrorMessage } from '@/lib/api/errors';
import { InstallHint } from '@/components/InstallHint';
import { WorkoutTracker } from '@/components/WorkoutTracker';
import type { RoutineDetail, WorkoutSetLogRow } from '@/lib/api/types';

export default function PublicRoutinePage() {
  const params = useParams<{ token: string }>();
  const [detail, setDetail] = useState<(RoutineDetail & { logs: WorkoutSetLogRow[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);

    getRoutineByToken(params.token)
      .then((result) => {
        if (!active) return;
        if (!result) {
          setNotFound(true);
          return;
        }
        setDetail(result);
      })
      .catch((cause) => {
        if (active) setError(apiErrorMessage(cause, 'No fue posible cargar la rutina.'));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [params.token]);

  if (loading) return null;
  if (error) return <div className="error-box">{error}</div>;
  if (notFound || !detail) {
    return (
      <main className="public-shell container">
        <div className="table-card">
          <h2>Rutina no encontrada</h2>
          <p className="muted">El enlace no es válido o ya expiró.</p>
        </div>
      </main>
    );
  }

  const { routine, exercises, logs } = detail;

  return (
    <main className="public-shell container">
      <section className="public-routine">
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center', marginBottom: 20 }}>
          <Link href="/" className="brand"><span className="brand-mark">C</span><span>Coachly</span></Link>
          <Link href="/login" className="btn btn-soft">Entrar</Link>
        </div>

        <article className="hero-card" style={{ marginBottom: 18 }}>
          <span className="badge"><span className="dot" /> Rutina compartida</span>
          <h1 className="hero-title" style={{ marginTop: 32 }}>{routine.title}</h1>
          <p className="hero-text">
            {routine.objective || 'Rutina preparada por el entrenador.'}
            {routine.client_name ? ` Cliente: ${routine.client_name}.` : ''}
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 20 }}>
            <span className="pill">{routine.level || 'Nivel libre'}</span>
            <span className="pill blue">{exercises.length} ejercicios</span>
            <span className="pill dark">Entrenador: {routine.trainer_name}</span>
          </div>
        </article>

        {routine.notes ? <div className="card" style={{ marginBottom: 18 }}><h3>Indicaciones</h3><p>{routine.notes}</p></div> : null}

        <article className="table-card">
          <h2>Ejercicios</h2>
          <div className="exercise-list">
            {exercises.map((exercise, index) => (
              <div className="exercise-item" key={exercise.id}>
                <div className="exercise-number">{index + 1}</div>
                <div>
                  <strong>{exercise.name}</strong>
                  <p className="muted" style={{ margin: '5px 0 0' }}>
                    {exercise.muscle_group || 'General'} · {exercise.sets} series x {exercise.reps} · descanso {exercise.rest_seconds || '-'}s{exercise.method ? ` · ${exercise.method}` : ''}
                    {exercise.target_weight_kg ? ` · ${exercise.target_weight_kg} kg objetivo` : ''}
                  </p>
                  {exercise.notes ? <p className="muted" style={{ margin: '6px 0 0' }}>{exercise.notes}</p> : null}
                </div>
                <span className="pill">{exercise.tempo || 'Normal'}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="table-card" style={{ marginTop: 18 }}>
          <WorkoutTracker
            exercises={exercises}
            initialLogs={logs}
            timerStorageKey={`routine:${routine.id}:shared-user:${routine.client_id || routine.share_token}`}
            shareToken={routine.share_token}
            readOnlyMessage={!routine.client_id ? 'Esta rutina es una plantilla general. Asignala a un cliente para registrar series.' : undefined}
          />
        </article>
      </section>
      <InstallHint />
    </main>
  );
}
