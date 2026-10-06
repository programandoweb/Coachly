'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { useLaravelApi } from '@/hooks/useLaravelApi';
import { apiErrorMessage } from '@/lib/api/errors';
import { buildWhatsAppAccessUrl, isPlaceholderEmail } from '@/lib/whatsappShare';

interface NewClientDrawerProps {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

function optionalText(formData: FormData, key: string): string | null {
  const value = String(formData.get(key) || '').trim();
  return value || null;
}

function optionalNumber(formData: FormData, key: string): number | null {
  const value = String(formData.get(key) || '').trim();
  if (!value) return null;
  const parsed = Number(value.replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : null;
}

interface CreatedClientInfo {
  name: string;
  whatsapp: string;
  email: string | null;
  password: string;
  accessEnabled: boolean;
}

export default function NewClientDrawer({ open, onClose, onCreated }: NewClientDrawerProps) {
  const api = useLaravelApi();
  const formRef = useRef<HTMLFormElement | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [createdClient, setCreatedClient] = useState<CreatedClientInfo | null>(null);

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
    if (!open) setCreatedClient(null);
  }, [open]);

  function handleFinish() {
    setCreatedClient(null);
    onClose();
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get('name') || '').trim();
    const whatsapp = String(formData.get('whatsapp') || '').trim();

    if (!name || !whatsapp) {
      setError('Nombre y WhatsApp son obligatorios.');
      return;
    }

    const email = optionalText(formData, 'email');
    const password = String(formData.get('password') || '').trim() || 'password';
    const accessEnabled = formData.get('accessEnabled') === 'on';

    setSubmitting(true);
    setError('');

    try {
      await api.post('fit/clients', {
        name,
        whatsapp,
        email,
        password,
        access_enabled: accessEnabled,
        birth_date: optionalText(formData, 'birthDate'),
        gender: optionalText(formData, 'gender'),
        goal: optionalText(formData, 'goal'),
        weight_kg: optionalNumber(formData, 'weightKg'),
        height_cm: optionalNumber(formData, 'heightCm'),
        health_survey: optionalText(formData, 'healthSurvey'),
        injuries: optionalText(formData, 'injuries'),
        medical_conditions: optionalText(formData, 'medicalConditions'),
        medications: optionalText(formData, 'medications'),
        training_experience: optionalText(formData, 'trainingExperience'),
        available_days: optionalText(formData, 'availableDays'),
        notes: optionalText(formData, 'notes')
      });

      formRef.current?.reset();
      onCreated?.();

      if (accessEnabled) {
        setCreatedClient({ name, whatsapp, email, password, accessEnabled });
      } else {
        onClose();
      }
    } catch (requestError) {
      setError(apiErrorMessage(requestError, 'No fue posible guardar el cliente.'));
    } finally {
      setSubmitting(false);
    }
  }

  const placeholderEmail = isPlaceholderEmail(createdClient?.email ?? null);

  return (
    <AnimatePresence>
      {open ? (
        <div className="routine-drawer-layer" role="presentation">
          <motion.button className="routine-drawer-backdrop" type="button" aria-label="Cerrar formulario" onClick={() => !submitting && (createdClient ? handleFinish() : onClose())} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
          <motion.aside className="routine-drawer client-create-drawer" role="dialog" aria-modal="true" aria-labelledby="client-drawer-title" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', stiffness: 340, damping: 34 }}>
            {createdClient ? (
              <>
                <header className="routine-drawer-header">
                  <div>
                    <div className="eyebrow">CRM fitness</div>
                    <h2 id="client-drawer-title">Cliente creado</h2>
                    <p className="muted">Comparte el acceso a la app con {createdClient.name}.</p>
                  </div>
                  <button className="routine-drawer-close" type="button" onClick={handleFinish} aria-label="Cerrar drawer">×</button>
                </header>

                <div className="form-grid routine-drawer-form">
                  <div className="card" style={{ padding: 16, boxShadow: 'none' }}>
                    <p style={{ margin: '0 0 8px', fontWeight: 900 }}>Datos de acceso</p>
                    <p className="muted" style={{ margin: '0 0 4px' }}>WhatsApp (usuario): <strong>{createdClient.whatsapp}</strong></p>
                    <p className="muted" style={{ margin: 0 }}>Contraseña: <strong>{createdClient.password}</strong></p>
                  </div>

                  {placeholderEmail ? (
                    <div className="error-box" style={{ background: 'transparent' }}>
                      No se enviará un correo de bienvenida. Comparte los datos por WhatsApp; el cliente debe iniciar sesión con su número de WhatsApp.
                    </div>
                  ) : (
                    <p className="muted">Ya enviamos un correo de bienvenida a {createdClient.email}. El cliente debe iniciar sesión con su número de WhatsApp; también puedes compartirle los datos por WhatsApp.</p>
                  )}

                  <div className="routine-drawer-actions">
                    <button className="btn btn-soft" type="button" onClick={handleFinish}>Cerrar</button>
                    <a
                      className="btn btn-primary"
                      href={buildWhatsAppAccessUrl(createdClient)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Compartir acceso por WhatsApp
                    </a>
                  </div>
                </div>
              </>
            ) : (
              <>
                <header className="routine-drawer-header">
                  <div>
                    <div className="eyebrow">CRM fitness</div>
                    <h2 id="client-drawer-title">Nuevo cliente</h2>
                    <p className="muted">Registra sus datos, salud y acceso a las rutinas.</p>
                  </div>
                  <button className="routine-drawer-close" type="button" onClick={onClose} aria-label="Cerrar drawer" disabled={submitting}>×</button>
                </header>

                <form ref={formRef} onSubmit={handleSubmit} className="form-grid routine-drawer-form">
                  {error ? <div className="error-box">{error}</div> : null}
                  <div className="form-grid two"><div className="field"><label>Nombre *</label><input className="input" name="name" placeholder="Nombre del cliente" required autoFocus /></div><div className="field"><label>WhatsApp *</label><input className="input" name="whatsapp" placeholder="+57..." required /></div></div>
                  <div className="form-grid two"><div className="field"><label>Correo opcional</label><input className="input" name="email" type="email" placeholder="cliente@email.com" /></div><div className="field"><label>Fecha nacimiento</label><input className="input" name="birthDate" type="date" /></div></div>
                  <div className="form-grid three"><div className="field"><label>Peso kg</label><input className="input" name="weightKg" inputMode="decimal" placeholder="78" /></div><div className="field"><label>Talla cm</label><input className="input" name="heightCm" inputMode="decimal" placeholder="174" /></div><div className="field"><label>Genero</label><select className="select" name="gender" defaultValue=""><option value="">Sin indicar</option><option value="Masculino">Masculino</option><option value="Femenino">Femenino</option><option value="Otro">Otro</option></select></div></div>
                  <div className="field"><label>Objetivo</label><input className="input" name="goal" placeholder="Bajar grasa, hipertrofia, fuerza..." /></div>
                  <div className="field"><label>Encuesta de salud breve</label><textarea className="textarea" name="healthSurvey" placeholder="Dolores, lesiones, restricciones, habitos, antecedentes relevantes..." /></div>
                  <div className="form-grid two"><div className="field"><label>Lesiones</label><input className="input" name="injuries" placeholder="Rodilla, espalda, hombro..." /></div><div className="field"><label>Condiciones medicas</label><input className="input" name="medicalConditions" placeholder="Hipertension, diabetes..." /></div></div>
                  <div className="form-grid two"><div className="field"><label>Medicamentos</label><input className="input" name="medications" placeholder="Opcional" /></div><div className="field"><label>Experiencia</label><select className="select" name="trainingExperience" defaultValue="Principiante"><option>Principiante</option><option>Intermedio</option><option>Avanzado</option></select></div></div>
                  <div className="field"><label>Dias disponibles</label><input className="input" name="availableDays" placeholder="Lunes, miercoles, viernes" /></div>
                  <div className="field"><label>Notas internas</label><textarea className="textarea" name="notes" placeholder="Notas solo visibles para el entrenador" /></div>
                  <div className="card" style={{ padding: 16, boxShadow: 'none' }}><label style={{ display: 'flex', gap: 10, alignItems: 'center', fontWeight: 900 }}><input name="accessEnabled" type="checkbox" defaultChecked />Crear acceso para que el cliente vea sus rutinas</label><p className="muted" style={{ margin: '8px 0 0' }}>Puede entrar con su correo o WhatsApp. Clave inicial sugerida: password.</p><div className="field" style={{ marginTop: 12 }}><label>Clave inicial</label><input className="input" name="password" defaultValue="password" /></div></div>
                  <div className="routine-drawer-actions"><button className="btn btn-soft" type="button" onClick={onClose} disabled={submitting}>Cancelar</button><button className="btn btn-primary" type="submit" disabled={submitting}>{submitting ? 'Guardando...' : 'Guardar cliente'}</button></div>
                </form>
              </>
            )}
          </motion.aside>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
