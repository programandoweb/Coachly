'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { createTrainingPlan } from '@/lib/api/fit';
import { apiErrorMessage } from '@/lib/api/errors';
import type { ClientRow } from '@/lib/api/types';

interface PlanDrawerProps {
  open: boolean;
  clients: ClientRow[];
  onClose: () => void;
  onSaved?: () => void;
}

export default function PlanDrawer({ open, clients, onClose, onSaved }: PlanDrawerProps) {
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
    const clientId = String(formData.get('client_id') || '').trim();
    const name = String(formData.get('name') || '').trim();
    const startsAt = String(formData.get('starts_at') || '').trim();

    if (!clientId || !name || !startsAt) {
      setError('Cliente, nombre y fecha de inicio son obligatorios.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await createTrainingPlan({
        client_id: Number(clientId),
        name,
        objective: String(formData.get('objective') || '').trim() || null,
        starts_at: startsAt,
        weeks: Number(formData.get('weeks') || 8)
      });

      formRef.current?.reset();
      onClose();
      onSaved?.();
    } catch (cause) {
      setError(apiErrorMessage(cause, 'No fue posible crear el plan.'));
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
            aria-labelledby="plan-drawer-title"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 340, damping: 34 }}
          >
            <header className="routine-drawer-header">
              <div>
                <div className="eyebrow">Planificación</div>
                <h2 id="plan-drawer-title">Nuevo plan</h2>
                <p className="muted">Programa un plan de entrenamiento por semanas para un cliente.</p>
              </div>
              <button className="routine-drawer-close" type="button" onClick={onClose} aria-label="Cerrar drawer" disabled={submitting}>
                ×
              </button>
            </header>

            <form ref={formRef} onSubmit={handleSubmit} className="form-grid routine-drawer-form">
              {error ? <div className="error-box">{error}</div> : null}

              <div className="field">
                <label>Cliente *</label>
                <select className="select" name="client_id" defaultValue="" required autoFocus>
                  <option value="" disabled>Selecciona un cliente</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label>Nombre del plan *</label>
                <input className="input" name="name" placeholder="Bloque de fuerza · 8 semanas" required />
              </div>

              <div className="field">
                <label>Objetivo</label>
                <input className="input" name="objective" placeholder="Fuerza, hipertrofia, pérdida de grasa" />
              </div>

              <div className="form-grid two">
                <div className="field">
                  <label>Fecha de inicio *</label>
                  <input className="input" name="starts_at" type="date" required />
                </div>
                <div className="field">
                  <label>Semanas</label>
                  <input className="input" name="weeks" type="number" min={1} max={52} defaultValue={8} />
                </div>
              </div>

              <div className="routine-drawer-actions">
                <button className="btn btn-soft" type="button" onClick={onClose} disabled={submitting}>
                  Cancelar
                </button>
                <button className="btn btn-primary" type="submit" disabled={submitting}>
                  {submitting ? 'Creando...' : 'Crear plan'}
                </button>
              </div>
            </form>
          </motion.aside>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
