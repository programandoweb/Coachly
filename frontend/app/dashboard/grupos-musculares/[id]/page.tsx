'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { getMuscleGroup, listMuscles } from '@/lib/api/fit';
import { apiErrorMessage } from '@/lib/api/errors';
import type { MuscleGroupRow, MuscleRow } from '@/lib/api/types';
import MuscleGroupDrawer from '../MuscleGroupDrawer';
import MuscleDrawer from '../MuscleDrawer';

function getInitials(name: string) {
  return (
    name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'M'
  );
}

export default function MuscleGroupDetailPage() {
  const { user, checking } = useAuthGuard('TRAINER');
  const params = useParams<{ id: string }>();
  const id = Number(params.id);

  const [zone, setZone] = useState<MuscleGroupRow | null>(null);
  const [muscles, setMuscles] = useState<MuscleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isZoneDrawerOpen, setIsZoneDrawerOpen] = useState(false);
  const [editingMuscle, setEditingMuscle] = useState<MuscleRow | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const [zoneRow, muscleRows] = await Promise.all([getMuscleGroup(id), listMuscles(id)]);
      setZone(zoneRow);
      setMuscles(muscleRows);
      setError('');
    } catch (cause) {
      setError(apiErrorMessage(cause, 'No fue posible cargar el grupo muscular.'));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (checking || !user || !Number.isFinite(id)) return;
    reload();
  }, [checking, user, id, reload]);

  if (checking || loading) return null;

  return (
    <>
      <Link href="/dashboard/grupos-musculares" className="muted" style={{ display: 'inline-block', marginBottom: 12 }}>
        ← Volver a grupos musculares
      </Link>

      {error ? <div className="error-box">{error}</div> : null}

      {zone ? (
        <div className="panel" style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start', marginBottom: 24 }}>
          {zone.image_url ? (
            <img
              src={zone.image_url}
              alt={zone.name}
              style={{ width: 140, height: 140, objectFit: 'cover', borderRadius: 16, flexShrink: 0 }}
            />
          ) : (
            <div
              style={{
                width: 140,
                height: 140,
                borderRadius: 16,
                flexShrink: 0,
                background: 'rgba(255,255,255,0.08)',
                display: 'grid',
                placeItems: 'center',
                color: 'var(--muted)'
              }}
            >
              Sin foto
            </div>
          )}

          <div style={{ flex: 1, minWidth: 240 }}>
            <span className="eyebrow">Biblioteca</span>
            <h1 className="h1">{zone.name}</h1>
            <p className="subtitle">{zone.description || 'Sin descripción.'}</p>

            <div className="fit-row" style={{ gap: 10, marginTop: 20 }}>
              <button type="button" className="btn btn-primary" onClick={() => setIsZoneDrawerOpen(true)}>
                Editar
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <h2 style={{ margin: '0 0 12px' }}>Músculos de esta zona</h2>

      <motion.div
        className="client-chat-list"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.05, delayChildren: 0.06 } }
        }}
      >
        {muscles.map((muscle) => (
          <motion.div
            key={muscle.id}
            variants={{
              hidden: { opacity: 0, x: -14, scale: 0.98 },
              visible: { opacity: 1, x: 0, scale: 1 }
            }}
            transition={{ type: 'spring', stiffness: 340, damping: 30 }}
            className="client-chat-item"
          >
            <button
              type="button"
              className="client-chat-row"
              style={{ textAlign: 'left', width: '100%', border: 0, background: 'transparent', font: 'inherit', color: 'inherit', cursor: 'pointer' }}
              onClick={() => setEditingMuscle(muscle)}
            >
              <span className="client-chat-avatar" aria-hidden="true">
                {muscle.image_url ? (
                  <img
                    src={muscle.image_url}
                    alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '999px' }}
                  />
                ) : (
                  getInitials(muscle.name)
                )}
              </span>

              <span className="client-chat-content">
                <span className="client-chat-top">
                  <strong>{muscle.name}</strong>
                </span>
                <span className="client-chat-bottom">
                  <span className="client-chat-preview">{muscle.description || 'Sin descripción'}</span>
                </span>
              </span>
            </button>
          </motion.div>
        ))}

        {!muscles.length ? (
          <motion.div className="client-chat-empty" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            Aún no hay músculos registrados en esta zona.
          </motion.div>
        ) : null}
      </motion.div>

      <MuscleGroupDrawer open={isZoneDrawerOpen} muscleGroup={zone} onClose={() => setIsZoneDrawerOpen(false)} onSaved={reload} />
      <MuscleDrawer open={Boolean(editingMuscle)} muscle={editingMuscle} onClose={() => setEditingMuscle(null)} onSaved={reload} />
    </>
  );
}
