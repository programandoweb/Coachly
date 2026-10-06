'use client';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  deleteLibraryExercise,
  getPlatformOverview,
  listAchievements,
  listCheckins,
  listClientsBasic,
  listExerciseLibrary,
  listMuscleGroups,
  listMuscles,
  listTrainingPlans
} from '@/lib/api/fit';
import { apiErrorMessage } from '@/lib/api/errors';
import type { ClientRow, MuscleRow } from '@/lib/api/types';
import PlanDrawer from './PlanDrawer';
import ExerciseDrawer from './ExerciseDrawer';

type Tab = 'resumen' | 'planes' | 'ejercicios' | 'checkins' | 'logros';

const LABELS: Record<Tab, string> = {
  resumen: 'Resumen',
  planes: 'Planes',
  ejercicios: 'Ejercicios',
  checkins: 'Check-ins',
  logros: 'Logros'
};

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

function PlusIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function ChatRow({
  title,
  subtitle,
  onDelete,
  deleting
}: {
  title: string;
  subtitle: string;
  onDelete?: () => void;
  deleting?: boolean;
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, x: -14, scale: 0.98 },
        visible: { opacity: 1, x: 0, scale: 1 }
      }}
      transition={{ type: 'spring', stiffness: 340, damping: 30 }}
      className="client-chat-item"
    >
      <div className="client-chat-row" style={{ cursor: 'default' }}>
        <span className="client-chat-avatar" aria-hidden="true">
          {title.slice(0, 2).toUpperCase()}
        </span>
        <span className="client-chat-content">
          <span className="client-chat-top">
            <strong>{title}</strong>
          </span>
          <span className="client-chat-bottom">
            <span className="client-chat-preview">{subtitle}</span>
          </span>
        </span>
      </div>

      {onDelete ? (
        <button
          type="button"
          className="client-chat-delete"
          disabled={deleting}
          onClick={onDelete}
          aria-label={`Eliminar ${title}`}
          title="Eliminar"
        >
          {deleting ? <span className="client-chat-delete-spinner" aria-hidden="true" /> : <TrashIcon />}
        </button>
      ) : null}
    </motion.div>
  );
}

function ChatList({ children, empty }: { children: React.ReactNode; empty: boolean }) {
  return (
    <motion.div
      className="client-chat-list"
      initial="hidden"
      animate="visible"
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.05, delayChildren: 0.06 } } }}
    >
      {children}
      {empty ? (
        <motion.div className="client-chat-empty" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          Aún no hay elementos registrados.
        </motion.div>
      ) : null}
    </motion.div>
  );
}

export default function GestionPage() {
  const [tab, setTab] = useState<Tab>('resumen');

  const [data, setData] = useState<any>({});
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [muscles, setMuscles] = useState<MuscleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isPlanDrawerOpen, setIsPlanDrawerOpen] = useState(false);
  const [isExerciseDrawerOpen, setIsExerciseDrawerOpen] = useState(false);
  const [deletingExerciseId, setDeletingExerciseId] = useState<number | null>(null);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const [overview, plans, exercises, checkins, achievements, clientRows, muscleGroupRows] = await Promise.all([
        getPlatformOverview(),
        listTrainingPlans(),
        listExerciseLibrary(),
        listCheckins(),
        listAchievements(),
        listClientsBasic(),
        listMuscleGroups()
      ]);
      const muscleLists = await Promise.all(muscleGroupRows.map((zone) => listMuscles(zone.id)));
      setData({ overview, plans, exercises, checkins, achievements });
      setClients(clientRows);
      setMuscles(muscleLists.flat());
    } catch (e) {
      setError(apiErrorMessage(e, 'No fue posible cargar la plataforma'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function handleDeleteExercise(id: number, name: string) {
    if (deletingExerciseId) return;
    if (!window.confirm(`¿Eliminar el ejercicio "${name}"? Esta acción no se puede deshacer.`)) return;

    setDeletingExerciseId(id);
    setError('');
    try {
      await deleteLibraryExercise(id);
      setData((current: any) => ({
        ...current,
        exercises: { exercises: (current.exercises?.exercises || []).filter((x: any) => x.id !== id) }
      }));
    } catch (cause) {
      setError(apiErrorMessage(cause, 'No fue posible eliminar el ejercicio.'));
    } finally {
      setDeletingExerciseId(null);
    }
  }

  const overview = data.overview || {};
  const plans = data.plans?.plans || [];
  const exercises = data.exercises?.exercises || [];
  const checkins = data.checkins?.checkins || [];
  const achievements = data.achievements?.achievements || [];

  const headerAction =
    tab === 'planes' ? (
      <button className="btn btn-primary create-routine-trigger" type="button" onClick={() => setIsPlanDrawerOpen(true)}>
        <PlusIcon />
        Agregar plan
      </button>
    ) : tab === 'ejercicios' ? (
      <button className="btn btn-primary create-routine-trigger" type="button" onClick={() => setIsExerciseDrawerOpen(true)}>
        <PlusIcon />
        Agregar ejercicio
      </button>
    ) : null;

  return (
    <section>
      <header className="dashboard-clients-head">
        <div>
          <span className="eyebrow">EXPANSIÓN DEL PRODUCTO</span>
          <h1 className="dashboard-clients-title">Centro de gestión</h1>
          <p className="muted dashboard-clients-subtitle">Planificación, biblioteca, seguimiento y adherencia de tus clientes.</p>
        </div>
        {headerAction}
      </header>

      <nav className="gestion-submenu-tabs" aria-label="Secciones de gestión">
        {(Object.keys(LABELS) as Tab[]).map((x) => (
          <button
            key={x}
            type="button"
            className={`gestion-tab-btn${tab === x ? ' is-active' : ''}`}
            onClick={() => setTab(x)}
          >
            {LABELS[x]}
          </button>
        ))}
      </nav>

      {error ? <div className="error-box">{error}</div> : null}

      {loading ? (
        <div className="panel">Cargando…</div>
      ) : (
        <>
          {tab === 'resumen' && (
            <>
              <section className="grid metrics">
                <article className="metric-card"><div className="metric-label">Planes activos</div><div className="metric-value">{overview.plans || 0}</div></article>
                <article className="metric-card"><div className="metric-label">Programados esta semana</div><div className="metric-value">{overview.scheduled_this_week || 0}</div></article>
                <article className="metric-card"><div className="metric-label">Check-ins pendientes</div><div className="metric-value">{overview.checkins_pending || 0}</div></article>
                <article className="metric-card"><div className="metric-label">Mensajes sin leer</div><div className="metric-value">{overview.unread_messages || 0}</div></article>
              </section>

              <article className="panel" style={{ marginTop: 18 }}>
                <h2>Alertas de seguimiento</h2>
                {(overview.alerts || []).length === 0 ? (
                  <p className="muted">Sin alertas críticas.</p>
                ) : (
                  (overview.alerts || []).map((x: any) => (
                    <p key={x.id} className="muted">
                      Cliente #{x.client_id}: dolor {x.pain_level ?? '-'}, energía {x.energy_level ?? '-'}, adherencia {x.adherence_percent ?? '-'}%
                    </p>
                  ))
                )}
              </article>
            </>
          )}

          {tab === 'planes' && (
            <ChatList empty={plans.length === 0}>
              {plans.map((p: any) => (
                <ChatRow key={p.id} title={p.name} subtitle={`${p.client_name} · ${p.weeks} semanas · ${p.status}`} />
              ))}
            </ChatList>
          )}

          {tab === 'ejercicios' && (
            <ChatList empty={exercises.length === 0}>
              {exercises.map((e: any) => (
                <ChatRow
                  key={e.id}
                  title={e.name}
                  subtitle={`${e.muscle_group || 'General'} · ${e.equipment || 'Sin equipo definido'}`}
                  onDelete={() => handleDeleteExercise(e.id, e.name)}
                  deleting={deletingExerciseId === e.id}
                />
              ))}
            </ChatList>
          )}

          {tab === 'checkins' && (
            <ChatList empty={checkins.length === 0}>
              {checkins.map((x: any) => (
                <ChatRow
                  key={x.id}
                  title={`${x.client_name} · ${x.week_of}`}
                  subtitle={`Energía ${x.energy_level ?? '-'}/10 · Dolor ${x.pain_level ?? '-'}/10 · Adherencia ${x.adherence_percent ?? '-'}%`}
                />
              ))}
            </ChatList>
          )}

          {tab === 'logros' && (
            <ChatList empty={achievements.length === 0}>
              {achievements.map((x: any) => (
                <ChatRow key={x.id} title={`${x.icon} ${x.name}`} subtitle={`${x.client_name} · ${x.earned_at}`} />
              ))}
            </ChatList>
          )}
        </>
      )}

      <PlanDrawer open={isPlanDrawerOpen} clients={clients} onClose={() => setIsPlanDrawerOpen(false)} onSaved={load} />
      <ExerciseDrawer open={isExerciseDrawerOpen} muscles={muscles} onClose={() => setIsExerciseDrawerOpen(false)} onSaved={load} />
    </section>
  );
}
