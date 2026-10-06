'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { updateMuscleGroup } from '@/lib/api/fit';
import { apiErrorMessage } from '@/lib/api/errors';
import type { MuscleGroupRow } from '@/lib/api/types';

interface MuscleGroupDrawerProps {
  open: boolean;
  muscleGroup: MuscleGroupRow | null;
  onClose: () => void;
  onSaved?: () => void;
}

export default function MuscleGroupDrawer({ open, muscleGroup, onClose, onSaved }: MuscleGroupDrawerProps) {
  const formRef = useRef<HTMLFormElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [removeImage, setRemoveImage] = useState(false);

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
    setRemoveImage(false);
    setImagePreview(muscleGroup?.image_url ?? null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    formRef.current?.reset();
  }, [open, muscleGroup]);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] || null;
    setRemoveImage(false);
    setImagePreview(file ? URL.createObjectURL(file) : muscleGroup?.image_url ?? null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting || !muscleGroup) return;

    const formData = new FormData(event.currentTarget);
    const description = String(formData.get('description') || '').trim();
    const image = fileInputRef.current?.files?.[0] || null;

    setSubmitting(true);
    setError('');

    try {
      await updateMuscleGroup(muscleGroup.id, {
        description: description || null,
        image,
        removeImage
      });

      formRef.current?.reset();
      onClose();
      onSaved?.();
    } catch (cause) {
      setError(apiErrorMessage(cause, 'No fue posible guardar el grupo muscular.'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AnimatePresence>
      {open && muscleGroup ? (
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
            aria-labelledby="muscle-group-drawer-title"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 340, damping: 34 }}
          >
            <header className="routine-drawer-header">
              <div>
                <div className="eyebrow">BIBLIOTECA</div>
                <h2 id="muscle-group-drawer-title">Editar &quot;{muscleGroup.name}&quot;</h2>
                <p className="muted">Solo puedes actualizar la descripción y la foto de referencia.</p>
              </div>
              <button className="routine-drawer-close" type="button" onClick={onClose} aria-label="Cerrar drawer" disabled={submitting}>
                ×
              </button>
            </header>

            <form ref={formRef} onSubmit={handleSubmit} className="form-grid routine-drawer-form">
              {error ? <div className="error-box">{error}</div> : null}

              <div className="field">
                <label>Descripción</label>
                <textarea
                  className="textarea"
                  name="description"
                  placeholder="Detalles o notas sobre el grupo muscular"
                  defaultValue={muscleGroup.description || ''}
                  autoFocus
                />
              </div>

              <div className="field">
                <label>Foto</label>
                <input ref={fileInputRef} className="input" type="file" accept="image/*" onChange={handleFileChange} />
              </div>

              {imagePreview ? (
                <div className="card" style={{ padding: 16, boxShadow: 'none', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <img
                    src={imagePreview}
                    alt="Vista previa"
                    style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 10 }}
                  />
                  <button
                    type="button"
                    className="btn btn-soft"
                    onClick={() => {
                      setImagePreview(null);
                      setRemoveImage(true);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                  >
                    Quitar imagen
                  </button>
                </div>
              ) : null}

              <div className="routine-drawer-actions">
                <button className="btn btn-soft" type="button" onClick={onClose} disabled={submitting}>
                  Cancelar
                </button>
                <button className="btn btn-primary" type="submit" disabled={submitting}>
                  {submitting ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </form>
          </motion.aside>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
