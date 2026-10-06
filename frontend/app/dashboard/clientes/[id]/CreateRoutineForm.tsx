'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { useLaravelApi } from '@/hooks/useLaravelApi';
import { listMuscleGroups } from '@/lib/api/fit';
import { apiErrorMessage } from '@/lib/api/errors';
import type { MuscleGroupRow, RoutineRow } from '@/lib/api/types';

export default function CreateRoutineForm({
  clientId,
  clientName,
  onCreated
}: {
  clientId: number;
  clientName: string;
  onCreated?: () => void;
}) {
  const api = useLaravelApi();
  const titleInputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [muscleGroups, setMuscleGroups] = useState<MuscleGroupRow[]>([]);
  const [muscleGroupsLoading, setMuscleGroupsLoading] = useState(false);
  const [muscleGroupId, setMuscleGroupId] = useState('');

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !submitting) setOpen(false);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, submitting]);

  useEffect(() => {
    if (!open) return;
    setMuscleGroupId('');
    setMuscleGroupsLoading(true);
    listMuscleGroups()
      .then(setMuscleGroups)
      .catch((cause) => setError(apiErrorMessage(cause, 'No fue posible cargar los grupos musculares.')))
      .finally(() => setMuscleGroupsLoading(false));
  }, [open]);

  useEffect(() => {
    if (muscleGroupId) window.setTimeout(() => titleInputRef.current?.focus(), 80);
  }, [muscleGroupId]);

  function closeDrawer() {
    if (submitting) return;
    setOpen(false);
    setError('');
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    const form = event.currentTarget;
    const data = new FormData(form);

    try {
      const response = await api.post<{ routine: RoutineRow }>(`fit/clients/${clientId}/routines`, {
        muscle_group_id: muscleGroupId ? Number(muscleGroupId) : null,
        title: String(data.get('title') || '').trim(),
        objective: String(data.get('objective') || '').trim() || null,
        level: String(data.get('level') || '').trim() || null,
        notes: String(data.get('notes') || '').trim() || null
      });

      if (Number(response.routine.client_id) !== clientId) {
        throw new Error('La rutina no quedó asignada al cliente seleccionado.');
      }

      form.reset();
      setMuscleGroupId('');
      setOpen(false);
      onCreated?.();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No fue posible crear la rutina.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <button className="btn btn-primary create-routine-trigger" type="button" onClick={() => setOpen(true)}>
        <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
        Crear rutina
      </button>

      {open ? (
        <div className="routine-drawer-layer" role="presentation">
          <button className="routine-drawer-backdrop" type="button" aria-label="Cerrar formulario" onClick={closeDrawer} />
          <aside className="routine-drawer" role="dialog" aria-modal="true" aria-labelledby="routine-drawer-title">
            <header className="routine-drawer-header">
              <div>
                <div className="eyebrow">Nueva rutina</div>
                <h2 id="routine-drawer-title">Crear rutina</h2>
                <p className="muted">Asignada a {clientName}</p>
              </div>
              <button className="routine-drawer-close" type="button" onClick={closeDrawer} aria-label="Cerrar drawer" disabled={submitting}>
                <svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </header>

            <form onSubmit={handleSubmit} className="form-grid routine-drawer-form">
              <div className="field">
                <label htmlFor="routine-muscle-group">Grupo muscular</label>
                <select
                  id="routine-muscle-group"
                  className="select"
                  name="muscle_group_id"
                  value={muscleGroupId}
                  onChange={(event) => setMuscleGroupId(event.target.value)}
                  disabled={muscleGroupsLoading}
                  required
                >
                  <option value="">{muscleGroupsLoading ? 'Cargando...' : 'Selecciona un grupo muscular'}</option>
                  {muscleGroups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>
              </div>

              {muscleGroupId ? (
                <>
                  <div className="field">
                    <label htmlFor="routine-title">Nombre de la rutina</label>
                    <input ref={titleInputRef} id="routine-title" className="input" name="title" placeholder="Push Pull Legs Semana 1" required />
                  </div>

                  <div className="form-grid two">
                    <div className="field">
                      <label htmlFor="routine-objective">Objetivo</label>
                      <input id="routine-objective" className="input" name="objective" placeholder="Hipertrofia" />
                    </div>
                    <div className="field">
                      <label htmlFor="routine-level">Nivel</label>
                      <input id="routine-level" className="input" name="level" placeholder="Intermedio" />
                    </div>
                  </div>

                  <div className="field">
                    <label htmlFor="routine-notes">Notas</label>
                    <textarea id="routine-notes" className="textarea" name="notes" placeholder="Indicaciones, restricciones, calentamiento..." />
                  </div>
                </>
              ) : null}

              {error ? <div className="error-box">{error}</div> : null}

              <div className="routine-drawer-actions">
                <button className="btn" type="button" onClick={closeDrawer} disabled={submitting}>Cancelar</button>
                <button className="btn btn-blue" type="submit" disabled={submitting}>
                  {submitting ? 'Creando...' : 'Crear rutina'}
                </button>
              </div>
            </form>
          </aside>
        </div>
      ) : null}
    </>
  );
}
