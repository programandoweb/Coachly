'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createRoutine } from '@/lib/api/fit';
import { apiErrorMessage } from '@/lib/api/errors';
import type { ClientRow } from '@/lib/api/types';

interface RoutineDrawerProps {
  open: boolean;
  clients: ClientRow[];
  onClose: () => void;
}

export default function RoutineDrawer({ open, clients, onClose }: RoutineDrawerProps) {
  const router = useRouter();
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
    const title = String(formData.get('title') || '').trim();

    if (!title) {
      setError('El nombre de la rutina es obligatorio.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const rawClientId = String(formData.get('clientId') || '').trim();
      const routineId = await createRoutine({
        clientId: rawClientId ? Number(rawClientId) : null,
        title,
        objective: String(formData.get('objective') || '').trim() || null,
        level: String(formData.get('level') || '').trim() || null,
        notes: String(formData.get('notes') || '').trim() || null
      });

      formRef.current?.reset();
      onClose();
      router.push(`/dashboard/rutinas/${routineId}`);
    } catch (cause) {
      setError(apiErrorMessage(cause, 'No fue posible crear la rutina.'));
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
            aria-labelledby="routine-drawer-title"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 340, damping: 34 }}
          >
            <header className="routine-drawer-header">
              <div>
                <div className="eyebrow">Programación</div>
                <h2 id="routine-drawer-title">Nueva rutina</h2>
                <p className="muted">Crea una rutina general o personalizada por cliente.</p>
              </div>
              <button className="routine-drawer-close" type="button" onClick={onClose} aria-label="Cerrar drawer" disabled={submitting}>
                ×
              </button>
            </header>

            <form ref={formRef} onSubmit={handleSubmit} className="form-grid routine-drawer-form">
              {error ? <div className="error-box">{error}</div> : null}

              <div className="field">
                <label>Nombre *</label>
                <input className="input" name="title" placeholder="Full Body Semana 1" required autoFocus />
              </div>

              <div className="field">
                <label>Cliente asignado</label>
                <select className="select" name="clientId" defaultValue="">
                  <option value="">Rutina general / plantilla</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-grid two">
                <div className="field">
                  <label>Objetivo</label>
                  <input className="input" name="objective" placeholder="Fuerza, hipertrofia, pérdida de grasa" />
                </div>
                <div className="field">
                  <label>Nivel</label>
                  <input className="input" name="level" placeholder="Principiante" />
                </div>
              </div>

              <div className="field">
                <label>Notas</label>
                <textarea className="textarea" name="notes" placeholder="Calentamiento, restricciones, recomendaciones" />
              </div>

              <div className="routine-drawer-actions">
                <button className="btn btn-soft" type="button" onClick={onClose} disabled={submitting}>
                  Cancelar
                </button>
                <button className="btn btn-primary" type="submit" disabled={submitting}>
                  {submitting ? 'Creando...' : 'Crear y agregar ejercicios'}
                </button>
              </div>
            </form>
          </motion.aside>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
