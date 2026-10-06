'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { addExercise, updateExercise } from '@/lib/api/fit';
import { apiErrorMessage } from '@/lib/api/errors';
import type { ExerciseRow } from '@/lib/api/types';

type AddExerciseModalProps = {
  routineId: number;
  open: boolean;
  exercise?: ExerciseRow | null;
  onOpenChange: (open: boolean) => void;
  onSaved?: () => void;
};

export default function AddExerciseModal({ routineId, open, exercise = null, onOpenChange, onSaved }: AddExerciseModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const isEditMode = Boolean(exercise);

  function closeDrawer() {
    onOpenChange(false);

    const url = new URL(window.location.href);
    if (url.searchParams.has('exercise')) {
      url.searchParams.delete('exercise');
      window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
    }
  }

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') closeDrawer();
    }

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = String(formData.get('name') || '').trim();

    if (!name) {
      setError('El ejercicio es obligatorio.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const sets = Number(formData.get('sets')) || 3;
      const restSeconds = Math.max(0, Number(formData.get('restSeconds')) || 0) || null;
      const payload = {
        routineId,
        name,
        muscleGroup: String(formData.get('muscleGroup') || '').trim() || null,
        sets,
        reps: String(formData.get('reps') || '').trim() || '10',
        restSeconds,
        targetWeightKg: (() => {
          const value = String(formData.get('targetWeightKg') || '').trim();
          if (!value) return null;
          const parsed = Number(value.replace(',', '.'));
          return Number.isFinite(parsed) ? parsed : null;
        })(),
        tempo: String(formData.get('tempo') || '').trim() || null,
        method: String(formData.get('method') || '').trim() || null,
        notes: String(formData.get('notes') || '').trim() || null
      };

      if (exercise) {
        await updateExercise({
          ...payload,
          exerciseId: exercise.id
        });
      } else {
        await addExercise(payload);
      }

      closeDrawer();
      onSaved?.();
    } catch (cause) {
      setError(apiErrorMessage(cause, isEditMode ? 'No fue posible actualizar el ejercicio.' : 'No fue posible guardar el ejercicio.'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="routine-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-exercise-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <button type="button" className="routine-modal-dismiss" aria-label="Cerrar modal" onClick={closeDrawer} />

          <motion.div
            className="routine-modal-card"
            key={exercise?.id ?? 'new'}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.24, ease: 'easeOut' }}
          >
            <div className="routine-modal-head">
              <div>
                <span className="pill blue">{isEditMode ? 'Editar ejercicio' : 'Nuevo ejercicio'}</span>
                <h2 id="add-exercise-title">{isEditMode ? 'Actualizar ejercicio' : 'Agregar a la rutina'}</h2>
                <p className="muted">
                  {isEditMode
                    ? 'Ajusta los detalles del ejercicio y conserva el seguimiento.'
                    : 'Define lo esencial. Luego puedes seguir agregando mas ejercicios.'}
                </p>
              </div>
              <button type="button" className="routine-modal-close" onClick={closeDrawer} aria-label="Cerrar">
                Ã—
              </button>
            </div>

            <form onSubmit={handleSubmit} className="form-grid routine-exercise-form">
              {error ? <div className="error-box">{error}</div> : null}
              <div className="form-grid two">
                <div className="field">
                  <label>Ejercicio</label>
                  <input className="input" name="name" placeholder="Press banca" required defaultValue={exercise?.name ?? ''} />
                </div>
                <div className="field">
                  <label>Grupo muscular</label>
                  <input className="input" name="muscleGroup" placeholder="Pecho" defaultValue={exercise?.muscle_group ?? ''} />
                </div>
              </div>
              <div className="form-grid three">
                <div className="field">
                  <label>Series</label>
                  <input className="input" name="sets" type="number" defaultValue={exercise?.sets ?? 3} min={1} />
                </div>
                <div className="field">
                  <label>Reps</label>
                  <input className="input" name="reps" defaultValue={exercise?.reps ?? '10'} placeholder="8-12" />
                </div>
                <div className="field">
                  <label>Descanso (segundos)</label>
                  <input className="input" name="restSeconds" type="number" defaultValue={exercise?.rest_seconds ?? 120} min={0} step={1} placeholder="120" />
                  <small className="muted">Este tiempo activa el reloj al chulear cada serie.</small>
                </div>
              </div>
              <div className="form-grid two">
                <div className="field">
                  <label>Peso objetivo kg</label>
                  <input className="input" name="targetWeightKg" inputMode="decimal" placeholder="40" defaultValue={exercise?.target_weight_kg ?? ''} />
                </div>
                <div className="field">
                  <label>Tempo</label>
                  <input className="input" name="tempo" placeholder="3-1-1" defaultValue={exercise?.tempo ?? ''} />
                </div>
              </div>
              <div className="field">
                <label>Método <span className="muted">(opcional)</span></label>
                <select className="select" name="method" defaultValue={exercise?.method ?? ''}>
                  <option value="">Sin método específico</option>
                  <option value="Rest pause">Rest pause</option>
                  <option value="Drop set">Drop set</option>
                  <option value="Pirámide truncada">Pirámide truncada</option>
                  <option value="Parciales en elongación">Parciales en elongación</option>
                </select>
              </div>
              <div className="field">
                <label>Notas tecnicas</label>
                <textarea className="textarea" name="notes" placeholder="Rango, tecnica, RPE, molestias permitidas..." defaultValue={exercise?.notes ?? ''} />
              </div>
              <button className="btn btn-primary full" type="submit" disabled={submitting}>
                {submitting ? 'Guardando...' : isEditMode ? 'Guardar cambios' : 'Guardar ejercicio'}
              </button>
            </form>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
