'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { useCallback, useEffect, useState } from 'react';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { listClientsBasic, listRoutines, deleteRoutine } from '@/lib/api/fit';
import { apiErrorMessage } from '@/lib/api/errors';
import type { ClientRow, RoutineRow } from '@/lib/api/types';
import RoutineDrawer from './RoutineDrawer';

function getInitials(name: string) {
  return (
    name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'R'
  );
}

function TrashIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  );
}

export default function RoutinesPage() {
  const { user, checking } = useAuthGuard('TRAINER');

  const [clients, setClients] = useState<ClientRow[]>([]);
  const [routines, setRoutines] = useState<RoutineRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const reload = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [clientRows, routineRows] = await Promise.all([
        listClientsBasic(Number(user.trainer_id)),
        listRoutines(Number(user.trainer_id))
      ]);
      setClients(clientRows);
      setRoutines(routineRows);
      setLoadError('');
    } catch (cause) {
      setLoadError(apiErrorMessage(cause, 'No fue posible cargar las rutinas.'));
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (checking || !user) return;
    reload();
  }, [checking, user, reload]);

  async function handleDelete(routine: RoutineRow) {
    if (deletingId) return;
    if (!window.confirm(`¿Eliminar la rutina "${routine.title}"? Esta acción no se puede deshacer.`)) return;

    setDeletingId(routine.id);
    setLoadError('');
    try {
      await deleteRoutine(routine.id);
      setRoutines((prev) => prev.filter((row) => row.id !== routine.id));
    } catch (cause) {
      setLoadError(apiErrorMessage(cause, 'No fue posible eliminar la rutina.'));
    } finally {
      setDeletingId(null);
    }
  }

  if (checking || loading) return null;

  return (
    <>
      <motion.section
        className="dashboard-client-list-shell"
        aria-label="Rutinas"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 28 }}
      >
        <header className="dashboard-clients-head">
          <div>
            <div className="eyebrow">Programación</div>
            <h1 className="dashboard-clients-title">Rutinas</h1>
            <p className="muted dashboard-clients-subtitle">
              Crea rutinas generales o personalizadas por cliente. Cada rutina genera una URL pública para compartir.
            </p>
          </div>

          <button className="btn btn-primary create-routine-trigger" type="button" onClick={() => setIsDrawerOpen(true)}>
            <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Agregar rutina
          </button>
        </header>

        {loadError ? <div className="error-box">{loadError}</div> : null}

        <motion.div
          className="client-chat-list"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.055, delayChildren: 0.08 } }
          }}
        >
          {routines.map((routine) => (
            <motion.div
              key={routine.id}
              variants={{
                hidden: { opacity: 0, x: -14, scale: 0.98 },
                visible: { opacity: 1, x: 0, scale: 1 }
              }}
              transition={{ type: 'spring', stiffness: 340, damping: 30 }}
              className="client-chat-item"
            >
              <Link href={`/dashboard/rutinas/${routine.id}`} className="client-chat-row">
                <span className="client-chat-avatar" aria-hidden="true">{getInitials(routine.title)}</span>

                <span className="client-chat-content">
                  <span className="client-chat-top">
                    <strong>{routine.title}</strong>
                  </span>
                  <span className="client-chat-bottom">
                    <span className="client-chat-preview">
                      {routine.client_name || 'Plantilla general'} · {routine.exercises_count || 0} ejercicios
                      {routine.level ? ` · ${routine.level}` : ''}
                    </span>
                  </span>
                </span>
              </Link>

              <button
                type="button"
                className="client-chat-delete"
                disabled={deletingId === routine.id}
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  handleDelete(routine);
                }}
                aria-label={`Eliminar ${routine.title}`}
                title="Eliminar rutina"
              >
                {deletingId === routine.id ? <span className="client-chat-delete-spinner" aria-hidden="true" /> : <TrashIcon />}
              </button>
            </motion.div>
          ))}

          {!routines.length ? (
            <motion.div
              className="client-chat-empty"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 280, damping: 28, delay: 0.1 }}
            >
              Aún no hay rutinas creadas.
            </motion.div>
          ) : null}
        </motion.div>
      </motion.section>

      <RoutineDrawer open={isDrawerOpen} clients={clients} onClose={() => setIsDrawerOpen(false)} />
    </>
  );
}
