'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { changePassword } from '@/lib/api/fit';
import { apiErrorMessage } from '@/lib/api/errors';

export default function ChangePasswordPage() {
  const { checking } = useAuthGuard();
  const router = useRouter();
  const formRef = useRef<HTMLFormElement | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    const formData = new FormData(event.currentTarget);
    const currentPassword = String(formData.get('current_password') || '').trim();
    const password = String(formData.get('password') || '').trim();
    const passwordConfirmation = String(formData.get('password_confirmation') || '').trim();

    if (!currentPassword || !password || !passwordConfirmation) {
      setError('Completa todos los campos.');
      return;
    }

    if (password !== passwordConfirmation) {
      setError('Las contraseñas nuevas no coinciden.');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const response = await changePassword({
        current_password: currentPassword,
        password,
        password_confirmation: passwordConfirmation
      });
      setSuccess(response.message || 'Contraseña actualizada correctamente.');
      formRef.current?.reset();
    } catch (cause) {
      setError(apiErrorMessage(cause, 'No fue posible cambiar la contraseña.'));
    } finally {
      setSubmitting(false);
    }
  }

  if (checking) return null;

  return (
    <>
      <section className="page-head">
        <div>
          <div className="eyebrow">Cuenta</div>
          <h1 className="h1">Cambiar contraseña</h1>
          <p className="subtitle">Ingresa tu contraseña actual y define una nueva.</p>
        </div>
      </section>

      <section className="grid two">
        <div className="form-card">
          <h2>Nueva contraseña</h2>
          <form ref={formRef} onSubmit={handleSubmit} className="form-grid">
            {error ? <div className="error-box">{error}</div> : null}
            {success ? <div className="success-box">{success}</div> : null}

            <div className="field">
              <label>Contraseña actual *</label>
              <input className="input" name="current_password" type="password" autoComplete="current-password" required autoFocus />
            </div>

            <div className="field">
              <label>Nueva contraseña *</label>
              <input className="input" name="password" type="password" autoComplete="new-password" minLength={8} required />
            </div>

            <div className="field">
              <label>Confirma la nueva contraseña *</label>
              <input className="input" name="password_confirmation" type="password" autoComplete="new-password" minLength={8} required />
            </div>

            <div className="form-grid two">
              <button className="btn btn-soft" type="button" onClick={() => router.back()} disabled={submitting}>
                Cancelar
              </button>
              <button className="btn btn-blue" type="submit" disabled={submitting}>
                {submitting ? 'Guardando...' : 'Cambiar contraseña'}
              </button>
            </div>
          </form>
        </div>
      </section>
    </>
  );
}
