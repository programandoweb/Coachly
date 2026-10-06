'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { createLibraryExercise } from '@/lib/api/fit';
import { apiErrorMessage } from '@/lib/api/errors';
import type { MuscleRow } from '@/lib/api/types';

interface ExerciseDrawerProps {
  open: boolean;
  muscles: MuscleRow[];
  onClose: () => void;
  onSaved?: () => void;
}

export default function ExerciseDrawer({ open, muscles, onClose, onSaved }: ExerciseDrawerProps) {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !submitting) onClose();
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose, submitting]);

  useEffect(() => {
    if (!open) return;
    setError('');
    formRef.current?.reset();
  }, [open]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get('name') || '').trim();

    if (!name) {
      setError('El nombre del ejercicio es obligatorio.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await createLibraryExercise({
        name,
        muscle_group: String(formData.get('muscle_group') || '').trim() || null,
        equipment: String(formData.get('equipment') || '').trim() || null
      });

      formRef.current?.reset();
      onClose();
      onSaved?.();
    } catch (cause) {
      setError(apiErrorMessage(cause, 'No fue posible crear el ejercicio.'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AnimatePresence>
      {open ? (
        <div className="routine-drawer-layer" role="presentation">
          <motion.button
            className="routine-drawer-backdrop"
            type="button"
            aria-label="Cerrar formulario"
            onClick={() => !submitting && onClose()}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.aside
            className="routine-drawer client-create-drawer"
            role="dialog"
            aria-modal="true"
            aria-labelledby="exercise-drawer-title"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 340, damping: 34 }}
          >
            <header className="routine-drawer-header">
              <div>
                <div className="eyebrow">Biblioteca</div>
                <h2 id="exercise-drawer-title">Nuevo ejercicio</h2>
                <p className="muted">Agrega un ejercicio a tu biblioteca de entrenamiento.</p>
              </div>
              <button className="routine-drawer-close" type="button" onClick={onClose} aria-label="Cerrar drawer" disabled={submitting}>
                ×
              </button>
            </header>

            <form ref={formRef} onSubmit={handleSubmit} className="form-grid routine-drawer-form">
              {error ? <div className="error-box">{error}</div> : null}

              <div className="field">
                <label>Nombre *</label>
                <input className="input" name="name" placeholder="Press de banca" required autoFocus />
              </div>

              <div className="field">
                <label>Grupo muscular</label>
                <input className="input" name="muscle_group" placeholder="Pecho, Espalda, Cuádriceps..." list="muscle-suggestions" />
                <datalist id="muscle-suggestions">
                  {muscles.map((muscle) => (
                    <option key={muscle.id} value={muscle.name} />
                  ))}
                </datalist>
              </div>

              <div className="field">
                <label>Equipo</label>
                <input className="input" name="equipment" placeholder="Barra, mancuernas, máquina..." />
              </div>

              <div className="routine-drawer-actions">
                <button className="btn btn-soft" type="button" onClick={onClose} disabled={submitting}>
                  Cancelar
                </button>
                <button className="btn btn-primary" type="submit" disabled={submitting}>
                  {submitting ? 'Agregando...' : 'Agregar ejercicio'}
                </button>
              </div>
            </form>
          </motion.aside>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
