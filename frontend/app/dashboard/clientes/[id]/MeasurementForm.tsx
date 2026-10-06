'use client';

import { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react';
import { useLaravelApi } from '@/hooks/useLaravelApi';
import { apiErrorMessage } from '@/lib/api/errors';

function optionalNumber(formData: FormData, key: string): number | null {
  const value = String(formData.get(key) || '').trim();
  if (!value) return null;
  const parsed = Number(value.replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : null;
}

function optionalText(formData: FormData, key: string): string | null {
  const value = String(formData.get(key) || '').trim();
  return value || null;
}

function maskDecimalInput(event: ChangeEvent<HTMLInputElement>) {
  const input = event.target;
  let value = input.value.replace(/[^0-9,]/g, '');
  const firstComma = value.indexOf(',');
  if (firstComma !== -1) {
    value = value.slice(0, firstComma + 1) + value.slice(firstComma + 1).replace(/,/g, '');
  }
  input.value = value;
}

function MeasurementInput({
  name,
  label,
  unit = 'cm',
  example = '12,5'
}: {
  name: string;
  label: string;
  unit?: string;
  example?: string;
}) {
  return (
    <div className="field">
      <label htmlFor={`measurement-${name}`}>{label}</label>
      <div className="measurement-input-wrap">
        <input
          id={`measurement-${name}`}
          className="input"
          name={name}
          type="text"
          inputMode="decimal"
          pattern="[0-9]+([.,][0-9]+)?"
          placeholder={`Ej: ${example}`}
          onChange={maskDecimalInput}
        />
        <span>{unit}</span>
      </div>
    </div>
  );
}

export default function MeasurementForm({
  clientId,
  clientName,
  onSaved
}: {
  clientId: number;
  clientName: string;
  onSaved?: () => void;
}) {
  const api = useLaravelApi();
  const firstInputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.setTimeout(() => firstInputRef.current?.focus(), 80);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !submitting) setOpen(false);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, submitting]);

  function closeDrawer() {
    if (submitting) return;
    setOpen(false);
    setError('');
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    const form = event.currentTarget;
    const formData = new FormData(form);
    setSubmitting(true);
    setError('');

    try {
      await api.post(`fit/clients/${clientId}/measurements`, {
        weight_kg: optionalNumber(formData, 'weightKg'),
        height_cm: optionalNumber(formData, 'heightCm'),
        body_fat: optionalNumber(formData, 'bodyFat'),
        muscle_mass_percentage: optionalNumber(formData, 'muscleMassPercentage'),
        triceps_skinfold_mm: optionalNumber(formData, 'tricepsSkinfoldMm'),
        subscapular_skinfold_mm: optionalNumber(formData, 'subscapularSkinfoldMm'),
        suprailiac_skinfold_mm: optionalNumber(formData, 'suprailiacSkinfoldMm'),
        abdominal_skinfold_mm: optionalNumber(formData, 'abdominalSkinfoldMm'),
        thigh_skinfold_mm: optionalNumber(formData, 'thighSkinfoldMm'),
        calf_skinfold_mm: optionalNumber(formData, 'calfSkinfoldMm'),
        relaxed_arm_cm: optionalNumber(formData, 'relaxedArmCm'),
        contracted_arm_cm: optionalNumber(formData, 'contractedArmCm'),
        thorax_cm: optionalNumber(formData, 'thoraxCm'),
        waist_cm: optionalNumber(formData, 'waistCm'),
        hip_cm: optionalNumber(formData, 'hipCm'),
        thigh_cm: optionalNumber(formData, 'thighCm'),
        calf_cm: optionalNumber(formData, 'calfCm'),
        notes: optionalText(formData, 'notes')
      });

      form.reset();
      setOpen(false);
      onSaved?.();
    } catch (cause) {
      setError(apiErrorMessage(cause, 'No fue posible guardar la medición antropométrica.'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <button className="btn btn-primary measurement-create-trigger" type="button" onClick={() => setOpen(true)}>
        <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
        Crear medición
      </button>

      {open ? (
        <div className="routine-drawer-layer" role="presentation">
          <button className="routine-drawer-backdrop" type="button" aria-label="Cerrar formulario" onClick={closeDrawer} />
          <aside className="routine-drawer measurement-drawer" role="dialog" aria-modal="true" aria-labelledby="measurement-drawer-title">
            <header className="routine-drawer-header">
              <div>
                <div className="eyebrow">Evaluación física</div>
                <h2 id="measurement-drawer-title">Medidas antropométricas</h2>
                <p className="muted">Registro corporal de {clientName}</p>
              </div>
              <button className="routine-drawer-close" type="button" onClick={closeDrawer} aria-label="Cerrar drawer" disabled={submitting}>
                <svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </header>

            <form onSubmit={handleSubmit} className="form-grid routine-drawer-form measurement-form">
              <section className="measurement-section">
                <div className="measurement-section-head">
                  <span>01</span>
                  <div><strong>Datos generales</strong><small>Composición corporal principal</small></div>
                </div>
                <div className="form-grid two">
                  <div className="field">
                    <label htmlFor="measurement-weightKg">Peso</label>
                    <div className="measurement-input-wrap">
                      <input ref={firstInputRef} id="measurement-weightKg" className="input" name="weightKg" type="text" inputMode="decimal" pattern="[0-9]+([.,][0-9]+)?" placeholder="Ej: 75,5" onChange={maskDecimalInput} />
                      <span>kg</span>
                    </div>
                  </div>
                  <MeasurementInput name="heightCm" label="Talla" example="172,0" />
                  <MeasurementInput name="bodyFat" label="Grasa corporal" unit="%" example="18,5" />
                  <MeasurementInput name="muscleMassPercentage" label="Masa muscular" unit="%" example="42,0" />
                </div>
              </section>

              <section className="measurement-section">
                <div className="measurement-section-head">
                  <span>02</span>
                  <div><strong>Pliegues cutáneos</strong><small>Mediciones expresadas en milímetros</small></div>
                </div>
                <div className="form-grid two">
                  <MeasurementInput name="tricepsSkinfoldMm" label="Tríceps" unit="mm" example="12,0" />
                  <MeasurementInput name="subscapularSkinfoldMm" label="Subescapular" unit="mm" example="15,0" />
                  <MeasurementInput name="suprailiacSkinfoldMm" label="Suprailíaco" unit="mm" example="14,0" />
                  <MeasurementInput name="abdominalSkinfoldMm" label="Abdominal" unit="mm" example="20,0" />
                  <MeasurementInput name="thighSkinfoldMm" label="Muslo" unit="mm" example="18,0" />
                  <MeasurementInput name="calfSkinfoldMm" label="Pantorrilla" unit="mm" example="10,0" />
                </div>
              </section>

              <section className="measurement-section">
                <div className="measurement-section-head">
                  <span>03</span>
                  <div><strong>Perímetros corporales</strong><small>Mediciones expresadas en centímetros</small></div>
                </div>
                <div className="form-grid two">
                  <MeasurementInput name="relaxedArmCm" label="Brazo relajado" example="30,0" />
                  <MeasurementInput name="contractedArmCm" label="Brazo contraído" example="32,5" />
                  <MeasurementInput name="thoraxCm" label="Tórax" example="95,0" />
                  <MeasurementInput name="waistCm" label="Cintura" example="80,0" />
                  <MeasurementInput name="hipCm" label="Cadera" example="98,0" />
                  <MeasurementInput name="thighCm" label="Muslo" example="55,0" />
                  <MeasurementInput name="calfCm" label="Pantorrilla" example="36,0" />
                </div>
              </section>

              <div className="field">
                <label htmlFor="measurement-notes">Observaciones del control</label>
                <textarea id="measurement-notes" className="textarea" name="notes" placeholder="Condiciones de la medición, evolución o recomendaciones..." />
              </div>

              {error ? <div className="error-box">{error}</div> : null}

              <div className="routine-drawer-actions">
                <button className="btn" type="button" onClick={closeDrawer} disabled={submitting}>Cancelar</button>
                <button className="btn btn-primary" type="submit" disabled={submitting}>
                  {submitting ? 'Guardando...' : 'Guardar medición'}
                </button>
              </div>
            </form>
          </aside>
        </div>
      ) : null}
    </>
  );
}
