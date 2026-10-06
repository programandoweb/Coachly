'use client';

import { useState } from 'react';
import { useLaravelApi } from '@/hooks/useLaravelApi';
import { apiErrorMessage } from '@/lib/api/errors';
import { setClientActive } from '@/lib/api/fit';
import type { ClientRow } from '@/lib/api/types';

function toDateInput(date?: string | null) {
  if (!date) return '';
  return String(date).slice(0, 10);
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

export default function ClientDataForm({ client, onSaved }: { client: ClientRow; onSaved?: () => void }) {
  const api = useLaravelApi();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [isActive, setIsActive] = useState(client.is_active !== 0);
  const [toggling, setToggling] = useState(false);
  const hasAccess = Boolean(client.access_enabled);

  async function handleToggleActive() {
    if (toggling) return;
    const next = !isActive;
    if (!next && !window.confirm(`¿Desactivar a "${client.name}"? No podrá iniciar sesión hasta que lo actives de nuevo.`)) return;

    setToggling(true);
    setError('');
    try {
      const updated = await setClientActive(client.id, next);
      setIsActive(updated.is_active !== 0);
      onSaved?.();
    } catch (cause) {
      setError(apiErrorMessage(cause, 'No fue posible cambiar el estado del perfil.'));
    } finally {
      setToggling(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    const formData = new FormData(event.currentTarget);
    setSubmitting(true);
    setError('');
    setSaved(false);

    try {
      await api.put(`fit/clients/${client.id}`, {
        name: String(formData.get('name') || '').trim() || client.name,
        whatsapp: String(formData.get('whatsapp') || '').trim() || client.whatsapp,
        email: optionalText(formData, 'email'),
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

      setSaved(true);
      onSaved?.();
    } catch (cause) {
      setError(apiErrorMessage(cause, 'No fue posible actualizar la ficha.'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="form-card">
      <h2>Datos y encuesta</h2>
      <form onSubmit={handleSubmit} className="form-grid">
        {error ? <div className="error-box">{error}</div> : null}
        {hasAccess ? (
          <div className="field" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {isActive ? <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></> : <><path d="M18 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="11" cy="7" r="4" /><path d="m17 8 5 5M22 8l-5 5" /></>}
              </svg>
              <span>
                <strong>{isActive ? 'Perfil activo' : 'Perfil desactivado'}</strong>
                <span className="muted" style={{ display: 'block', fontSize: 13 }}>
                  {isActive ? 'El cliente puede iniciar sesión.' : 'El cliente no puede iniciar sesión.'}
                </span>
              </span>
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={isActive}
              aria-label="Activar o desactivar perfil"
              disabled={toggling}
              onClick={handleToggleActive}
              style={{
                width: 48, height: 28, borderRadius: 14, border: 0, padding: 3, cursor: 'pointer', flexShrink: 0,
                background: isActive ? '#22c55e' : '#6b7280', transition: 'background .2s', opacity: toggling ? 0.6 : 1
              }}
            >
              <span style={{ display: 'block', width: 22, height: 22, borderRadius: '50%', background: '#fff', transform: `translateX(${isActive ? 20 : 0}px)`, transition: 'transform .2s' }} />
            </button>
          </div>
        ) : null}
        {saved ? <div className="badge"><span className="dot" /> Ficha actualizada</div> : null}
        <div className="form-grid two">
          <div className="field"><label>Nombre</label><input className="input" name="name" defaultValue={client.name} /></div>
          <div className="field"><label>WhatsApp</label><input className="input" name="whatsapp" defaultValue={client.whatsapp} /></div>
        </div>
        <div className="form-grid two">
          <div className="field"><label>Correo</label><input className="input" name="email" type="email" defaultValue={client.email || ''} /></div>
          <div className="field"><label>Fecha nacimiento</label><input className="input" name="birthDate" type="date" defaultValue={toDateInput(client.birth_date)} /></div>
        </div>
        <div className="form-grid three">
          <div className="field"><label>Peso kg</label><input className="input" name="weightKg" defaultValue={client.weight_kg || ''} /></div>
          <div className="field"><label>Talla cm</label><input className="input" name="heightCm" defaultValue={client.height_cm || ''} /></div>
          <div className="field"><label>Genero</label><input className="input" name="gender" defaultValue={client.gender || ''} /></div>
        </div>
        <div className="field"><label>Objetivo</label><input className="input" name="goal" defaultValue={client.goal || ''} /></div>
        <div className="field"><label>Encuesta de salud</label><textarea className="textarea" name="healthSurvey" defaultValue={client.health_survey || ''} /></div>
        <div className="form-grid two">
          <div className="field"><label>Lesiones</label><input className="input" name="injuries" defaultValue={client.injuries || ''} /></div>
          <div className="field"><label>Condiciones medicas</label><input className="input" name="medicalConditions" defaultValue={client.medical_conditions || ''} /></div>
        </div>
        <div className="form-grid two">
          <div className="field"><label>Medicamentos</label><input className="input" name="medications" defaultValue={client.medications || ''} /></div>
          <div className="field"><label>Experiencia</label><input className="input" name="trainingExperience" defaultValue={client.training_experience || ''} /></div>
        </div>
        <div className="field"><label>Dias disponibles</label><input className="input" name="availableDays" defaultValue={client.available_days || ''} /></div>
        <div className="field"><label>Notas internas</label><textarea className="textarea" name="notes" defaultValue={client.notes || ''} /></div>
        <button className="btn btn-primary full" type="submit" disabled={submitting}>
          {submitting ? 'Actualizando...' : 'Actualizar ficha'}
        </button>
      </form>
    </div>
  );
}
