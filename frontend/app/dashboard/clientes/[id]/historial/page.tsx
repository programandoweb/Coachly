'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { getClientDetail, getClientExerciseHistory } from '@/lib/api/fit';
import { apiErrorMessage } from '@/lib/api/errors';
import type { ClientRow, ExerciseHistoryResponse, MuscleGroupHistory } from '@/lib/api/types';
import ClientSubMenu from '../ClientSubMenu';

type RangePreset = '30' | '90' | '180' | 'all' | 'custom';

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function presetRange(preset: RangePreset): { from: string; to: string } | null {
  if (preset === 'all' || preset === 'custom') return null;
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - Number(preset));
  return { from: isoDate(from), to: isoDate(to) };
}

function formatDateLabel(dateStr: string) {
  const date = new Date(`${dateStr}T00:00:00`);
  const formatted = new Intl.DateTimeFormat('es-CO', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }).format(date);
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

function weightLabel(value: number | null) {
  return value != null ? `${value} kg` : 'sin peso';
}

function deltaLabel(current: number | null, previous: number | null) {
  if (current == null || previous == null) return null;
  const diff = Math.round((current - previous) * 100) / 100;
  if (diff === 0) return { text: 'Igual que la vez anterior', tone: 'neutral' as const };
  const tone = diff > 0 ? ('up' as const) : ('down' as const);
  const text = diff > 0 ? `+${diff} kg vs. anterior` : `${diff} kg vs. anterior`;
  return { text, tone };
}

function ExerciseHistoryCard({ exercise }: { exercise: MuscleGroupHistory['exercises'][number] }) {
  const [open, setOpen] = useState(false);
  const latest = exercise.sessions[0];

  return (
    <article className={`history-exercise-card ${open ? 'open' : ''}`}>
      <button type="button" className="history-exercise-toggle" onClick={() => setOpen((current) => !current)} aria-expanded={open}>
        <div>
          <strong>{exercise.exercise_name}</strong>
          <small>
            {exercise.sessions.length} {exercise.sessions.length === 1 ? 'registro' : 'registros'}
            {latest ? ` · última vez ${weightLabel(latest.max_weight)}` : ''}
          </small>
        </div>
        <span className="history-exercise-chevron" aria-hidden="true">{open ? '▲' : '▼'}</span>
      </button>

      {open ? (
        <div className="history-session-list">
          {exercise.sessions.map((session, index) => {
            const previous = exercise.sessions[index + 1];
            const delta = deltaLabel(session.max_weight, previous?.max_weight ?? null);
            return (
              <div className="history-session-card" key={session.date}>
                <div className="history-session-head">
                  <strong>{formatDateLabel(session.date)}</strong>
                  {delta ? <span className={`history-delta ${delta.tone}`}>{delta.text}</span> : null}
                </div>
                <div className="history-set-grid">
                  {session.sets.map((set) => (
                    <div className="history-set-chip" key={set.set_number}>
                      <span>Serie {set.set_number}</span>
                      <strong>{weightLabel(set.weight_kg)}</strong>
                      <small>{set.reps_done != null ? `${set.reps_done} reps` : 'sin reps'}</small>
                    </div>
                  ))}
                </div>
                <p className="history-session-summary">
                  Máximo: {weightLabel(session.max_weight)} · Volumen: {session.total_volume}
                </p>
              </div>
            );
          })}
        </div>
      ) : null}
    </article>
  );
}

function MuscleGroupSection({ group }: { group: MuscleGroupHistory }) {
  const [open, setOpen] = useState(true);

  return (
    <section className={`history-muscle-group ${open ? 'open' : ''}`}>
      <button type="button" className="history-muscle-group-toggle" onClick={() => setOpen((current) => !current)} aria-expanded={open}>
        <div>
          <span className="eyebrow">Grupo muscular</span>
          <h2>{group.muscle_group}</h2>
        </div>
        <span className="history-exercise-chevron" aria-hidden="true">{open ? '▲' : '▼'}</span>
      </button>

      {open ? (
        <div className="history-exercise-list">
          {group.exercises.map((exercise) => (
            <ExerciseHistoryCard exercise={exercise} key={exercise.exercise_key} />
          ))}
        </div>
      ) : null}
    </section>
  );
}

export default function ClientHistoryPage() {
  const { user, checking } = useAuthGuard('TRAINER');
  const params = useParams<{ id: string }>();
  const clientId = Number(params.id);

  const [client, setClient] = useState<ClientRow | null>(null);
  const [history, setHistory] = useState<ExerciseHistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [preset, setPreset] = useState<RangePreset>('90');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [activeMuscleGroup, setActiveMuscleGroup] = useState<string>('all');

  const range = useMemo(() => {
    if (preset === 'custom') {
      return { from: customFrom || undefined, to: customTo || undefined };
    }
    return presetRange(preset) || {};
  }, [preset, customFrom, customTo]);

  const reload = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      const [clientDetail, historyResult] = await Promise.all([
        getClientDetail(clientId, Number(user.trainer_id)),
        getClientExerciseHistory(clientId, range)
      ]);
      if (clientDetail) setClient(clientDetail.client);
      setHistory(historyResult);
    } catch (cause) {
      setError(apiErrorMessage(cause, 'No fue posible cargar el historial.'));
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, clientId, range.from, range.to]);

  useEffect(() => {
    if (checking || !user) return;
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checking, user, range.from, range.to]);

  if (checking || (loading && !history)) return null;
  if (error && !history) return <div className="error-box">{error}</div>;
  if (!client) return <div className="error-box">Cliente no encontrado.</div>;

  const muscleGroups = history?.muscle_groups || [];
  const filteredGroups = activeMuscleGroup === 'all'
    ? muscleGroups
    : muscleGroups.filter((group) => group.muscle_group === activeMuscleGroup);
  const totalRecords = muscleGroups.reduce((total, group) => total + group.exercises.reduce((sum, ex) => sum + ex.sessions.length, 0), 0);

  return (
    <>
      <section className="page-head client-page-head">
        <div>
          <div className="eyebrow">Progreso del atleta</div>
          <h1 className="h1">Historial de {client.name}</h1>
          <p className="subtitle">Evolución de peso y repeticiones por músculo y ejercicio.</p>
        </div>
        <ClientSubMenu clientId={client.id} />
      </section>

      <section className="history-filter-bar">
        <div className="history-filter-presets" role="group" aria-label="Rango de fechas">
          {([
            ['30', 'Últimos 30 días'],
            ['90', 'Últimos 90 días'],
            ['180', 'Últimos 6 meses'],
            ['all', 'Todo']
          ] as Array<[RangePreset, string]>).map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={`history-preset-btn ${preset === value ? 'active' : ''}`}
              onClick={() => setPreset(value)}
            >
              {label}
            </button>
          ))}
          <button
            type="button"
            className={`history-preset-btn ${preset === 'custom' ? 'active' : ''}`}
            onClick={() => setPreset('custom')}
          >
            Rango personalizado
          </button>
        </div>

        {preset === 'custom' ? (
          <div className="history-custom-range">
            <div className="field">
              <label htmlFor="history-from">Desde</label>
              <input id="history-from" className="input" type="date" value={customFrom} onChange={(event) => setCustomFrom(event.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="history-to">Hasta</label>
              <input id="history-to" className="input" type="date" value={customTo} onChange={(event) => setCustomTo(event.target.value)} />
            </div>
          </div>
        ) : null}

        {muscleGroups.length > 0 ? (
          <div className="history-muscle-tabs" role="tablist" aria-label="Filtrar por grupo muscular">
            <button
              type="button"
              className={`history-tab-chip ${activeMuscleGroup === 'all' ? 'active' : ''}`}
              onClick={() => setActiveMuscleGroup('all')}
            >
              Todos
            </button>
            {muscleGroups.map((group) => (
              <button
                key={group.muscle_group}
                type="button"
                className={`history-tab-chip ${activeMuscleGroup === group.muscle_group ? 'active' : ''}`}
                onClick={() => setActiveMuscleGroup(group.muscle_group)}
              >
                {group.muscle_group}
              </button>
            ))}
          </div>
        ) : null}
      </section>

      {error ? <div className="error-box">{error}</div> : null}

      <section className="history-content">
        {loading ? <p className="muted">Actualizando...</p> : null}
        {!loading && totalRecords === 0 ? (
          <div className="measurement-empty-state">
            <span>📈</span>
            <h2>Aún no hay entrenamientos completados</h2>
            <p>Cuando el atleta finalice entrenamientos, el progreso por músculo y ejercicio aparecerá aquí.</p>
          </div>
        ) : (
          filteredGroups.map((group) => <MuscleGroupSection group={group} key={group.muscle_group} />)
        )}
      </section>
    </>
  );
}
