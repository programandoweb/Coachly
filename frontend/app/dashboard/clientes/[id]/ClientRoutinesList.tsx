'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import type { RoutineRow } from '@/lib/api/types';

type ClientRoutine = Pick<
  RoutineRow,
  | 'id'
  | 'title'
  | 'objective'
  | 'level'
  | 'notes'
  | 'created_at'
  | 'updated_at'
  | 'exercises_count'
>;

function getInitials(title: string) {
  return title
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'R';
}

function formatRoutineTime(value?: string | null) {
  if (!value) return '';

  const date = new Date(value.replace(' ', 'T'));
  if (Number.isNaN(date.getTime())) return '';

  return date.toLocaleTimeString('es-CO', {
    hour: 'numeric',
    minute: '2-digit'
  });
}

function getPreview(routine: ClientRoutine) {
  if (routine.objective && routine.level) return `${routine.objective} · ${routine.level}`;
  if (routine.objective) return routine.objective;
  if (routine.level) return routine.level;
  return routine.notes || 'Rutina asignada';
}

export default function ClientRoutinesList({ routines, basePath = '/dashboard/rutinas' }: { routines: ClientRoutine[]; basePath?: string }) {
  return (
    <motion.section
      className="dashboard-client-list-shell client-routines-shell"
      aria-label="Rutinas asignadas"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 28 }}
    >
      <motion.div
        className="client-chat-list"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: {
            transition: {
              staggerChildren: 0.055,
              delayChildren: 0.08
            }
          }
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
          >
            <Link href={`${basePath}/${routine.id}`} className="client-chat-row routine-chat-row">
              <span className="client-chat-avatar routine-chat-avatar" aria-hidden="true">{getInitials(routine.title)}</span>

              <span className="client-chat-content">
                <span className="client-chat-top">
                  <strong>{routine.title}</strong>
                  <time dateTime={routine.updated_at || routine.created_at}>{formatRoutineTime(routine.updated_at || routine.created_at)}</time>
                </span>

                <span className="client-chat-bottom">
                  <span className="client-chat-preview">
                    <span className="client-chat-checks" aria-hidden="true">✓✓</span>
                    {getPreview(routine)}
                  </span>

                  <span className="client-chat-badges">
                    <span>{routine.exercises_count || 0} ejercicios</span>
                  </span>
                </span>
              </span>
            </Link>
          </motion.div>
        ))}

        {!routines.length ? (
          <motion.div
            className="client-chat-empty"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 28, delay: 0.1 }}
          >
            Este cliente aun no tiene rutinas asignadas.
          </motion.div>
        ) : null}
      </motion.div>
    </motion.section>
  );
}
