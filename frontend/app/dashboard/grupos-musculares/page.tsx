'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { useCallback, useEffect, useState } from 'react';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { listMuscleGroups } from '@/lib/api/fit';
import { apiErrorMessage } from '@/lib/api/errors';
import type { MuscleGroupRow } from '@/lib/api/types';

function getInitials(name: string) {
  return (
    name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'G'
  );
}

export default function MuscleGroupsPage() {
  const { user, checking } = useAuthGuard('TRAINER');
  const [items, setItems] = useState<MuscleGroupRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await listMuscleGroups();
      setItems(rows);
      setError('');
    } catch (cause) {
      setError(apiErrorMessage(cause, 'No fue posible cargar los grupos musculares.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (checking || !user) return;
    reload();
  }, [checking, user, reload]);

  if (checking) return null;

  return (
    <motion.section
      className="dashboard-client-list-shell"
      aria-label="Grupos musculares"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 28 }}
    >
      <header className="dashboard-clients-head">
        <div>
          <div className="eyebrow">Biblioteca</div>
          <h1 className="dashboard-clients-title">Grupos musculares</h1>
          <p className="muted dashboard-clients-subtitle">Las tres zonas del cuerpo. Ingresa a cada una para ver sus músculos.</p>
        </div>
      </header>

      {error ? <div className="error-box">{error}</div> : null}

      <motion.div
        className="client-chat-list"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.055, delayChildren: 0.08 } }
        }}
      >
        {!loading &&
          items.map((item) => (
            <motion.div
              key={item.id}
              variants={{
                hidden: { opacity: 0, x: -14, scale: 0.98 },
                visible: { opacity: 1, x: 0, scale: 1 }
              }}
              transition={{ type: 'spring', stiffness: 340, damping: 30 }}
              className="client-chat-item"
            >
              <Link href={`/dashboard/grupos-musculares/${item.id}`} className="client-chat-row">
                <span className="client-chat-avatar" aria-hidden="true">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt=""
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '999px' }}
                    />
                  ) : (
                    getInitials(item.name)
                  )}
                </span>

                <span className="client-chat-content">
                  <span className="client-chat-top">
                    <strong>{item.name}</strong>
                  </span>
                  <span className="client-chat-bottom">
                    <span className="client-chat-preview">
                      {item.description || 'Sin descripción'} · {item.muscles_count ?? 0} músculos
                    </span>
                  </span>
                </span>
              </Link>
            </motion.div>
          ))}

        {!loading && !items.length ? (
          <motion.div
            className="client-chat-empty"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 28, delay: 0.1 }}
          >
            Aún no hay grupos musculares registrados.
          </motion.div>
        ) : null}
      </motion.div>
    </motion.section>
  );
}
