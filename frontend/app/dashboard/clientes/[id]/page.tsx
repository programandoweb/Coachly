'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { getClientDetail } from '@/lib/api/fit';
import { apiErrorMessage } from '@/lib/api/errors';
import type { ClientDetail } from '@/lib/api/types';
import ClientSubMenu from './ClientSubMenu';
import ClientRoutinesList from './ClientRoutinesList';
import CreateRoutineForm from './CreateRoutineForm';

export default function ClientDetailPage() {
  const { user, checking } = useAuthGuard('TRAINER');
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const clientId = Number(params.id);

  const [detail, setDetail] = useState<ClientDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState('');

  const reload = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const result = await getClientDetail(clientId, Number(user.trainer_id));
      if (!result) {
        setNotFound(true);
        return;
      }
      setDetail(result);
      setNotFound(false);
    } catch (cause) {
      setError(apiErrorMessage(cause, 'No fue posible cargar el cliente.'));
    } finally {
      setLoading(false);
    }
  }, [user, clientId]);

  useEffect(() => {
    if (checking || !user) return;
    reload();
  }, [checking, user, reload]);

  if (checking || loading) return null;
  if (error) return <div className="error-box">{error}</div>;
  if (notFound || !detail) return <div className="error-box">Cliente no encontrado.</div>;

  const { client, routines } = detail;
  const queryError = searchParams.get('error');
  const createdAt = client.created_at
    ? new Intl.DateTimeFormat('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(client.created_at))
    : 'Sin fecha';

  const plainRoutines = routines.map((routine) => ({
    id: Number(routine.id),
    title: String(routine.title || 'Rutina'),
    objective: routine.objective ?? null,
    level: routine.level ?? null,
    notes: routine.notes ?? null,
    created_at: routine.created_at ?? null,
    updated_at: routine.updated_at ?? null,
    exercises_count: Number(routine.exercises_count || 0)
  }));

  return (
    <>
      <section className="page-head client-page-head">
        <div>
          <div className="eyebrow">Ficha de cliente</div>
          <h1 className="h1">{client.name}</h1>
          <p className="subtitle">{client.goal || 'Sin objetivo definido'} · Creado el {createdAt}</p>
        </div>
        <ClientSubMenu clientId={client.id} />
      </section>

      <section className="grid metrics client-detail-metrics">
        <article className="metric-card"><div className="metric-label">Peso</div><div className="metric-value">{client.weight_kg ? `${client.weight_kg}` : '-'}</div><p className="muted">kg</p></article>
        <article className="metric-card"><div className="metric-label">Talla</div><div className="metric-value">{client.height_cm ? `${client.height_cm}` : '-'}</div><p className="muted">cm</p></article>
        <article className="metric-card"><div className="metric-label">Rutinas</div><div className="metric-value">{routines.length}</div><p className="muted">asignadas</p></article>
      </section>

      {queryError ? <div className="error-box">{queryError}</div> : null}

      <section className="client-routines-title">
        <div>
          <div className="eyebrow">Rutinas</div>
          <h2>Rutinas asignadas</h2>
        </div>
        <CreateRoutineForm clientId={client.id} clientName={client.name} onCreated={reload} />
      </section>

      <ClientRoutinesList routines={plainRoutines} />
    </>
  );
}
