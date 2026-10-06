'use client';

import { useEffect, useState } from 'react';
import { getClientPortal } from '@/lib/api/fit';
import { apiErrorMessage } from '@/lib/api/errors';
import type { ClientPortal } from '@/lib/api/types';
import ClientRoutinesList from '../dashboard/clientes/[id]/ClientRoutinesList';

export default function MyRoutinesPage() {
  const [portal, setPortal] = useState<ClientPortal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    getClientPortal()
      .then((result) => {
        if (active) setPortal(result);
      })
      .catch((cause) => {
        if (active) setError(apiErrorMessage(cause, 'No fue posible cargar tus rutinas.'));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  if (loading) return null;
  if (error) return <div className="error-box">{error}</div>;
  if (!portal) return null;

  const { client, routines } = portal;
  const list = routines.map(({ routine, exercises }) => ({
    id: Number(routine.id),
    title: String(routine.title || 'Rutina'),
    objective: routine.objective ?? null,
    level: routine.level ?? null,
    notes: routine.notes ?? null,
    created_at: routine.created_at ?? null,
    updated_at: routine.updated_at ?? null,
    exercises_count: exercises.length
  }));

  return (
    <>
      <section className="page-head client-page-head">
        <div>
          <div className="eyebrow">Zona del cliente</div>
          <h1 className="h1">{client.name}</h1>
          <p className="subtitle">{client.goal || 'Sin objetivo definido'}{client.trainer_name ? ` · Entrenador: ${client.trainer_name}` : ''}</p>
        </div>
      </section>

      <section className="grid metrics client-detail-metrics">
        <article className="metric-card"><div className="metric-label">Peso</div><div className="metric-value">{client.weight_kg ? `${client.weight_kg}` : '-'}</div><p className="muted">kg</p></article>
        <article className="metric-card"><div className="metric-label">Talla</div><div className="metric-value">{client.height_cm ? `${client.height_cm}` : '-'}</div><p className="muted">cm</p></article>
        <article className="metric-card"><div className="metric-label">Rutinas</div><div className="metric-value">{routines.length}</div><p className="muted">asignadas</p></article>
      </section>

      <section className="client-routines-title">
        <div>
          <div className="eyebrow">Rutinas</div>
          <h2>Tus rutinas</h2>
        </div>
      </section>

      <ClientRoutinesList routines={list} basePath="/mis-rutinas" />
    </>
  );
}
