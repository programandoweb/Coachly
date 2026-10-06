'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { resetPassword } from '@/lib/api/fit';
import { apiErrorMessage } from '@/lib/api/errors';
import styles from '../login/LoginPage.module.css';

function LockIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="10" width="16" height="11" rx="3" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function EyeIcon({ visible }: { visible: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="19" height="19" fill="none" aria-hidden="true">
      <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="12" cy="12" r="2.7" stroke="currentColor" strokeWidth="1.7" />
      {!visible ? <path d="m4 4 16 16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /> : null}
    </svg>
  );
}

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';

  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const missingParams = !token || !email;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting || missingParams) return;

    const formData = new FormData(event.currentTarget);
    const password = String(formData.get('password') || '').trim();
    const passwordConfirmation = String(formData.get('password_confirmation') || '').trim();

    if (password !== passwordConfirmation) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const response = await resetPassword({
        token,
        email,
        password,
        password_confirmation: passwordConfirmation
      });
      setSuccess(response.message || 'Contraseña actualizada correctamente.');
      setTimeout(() => router.replace('/login'), 1800);
    } catch (cause) {
      setError(apiErrorMessage(cause, 'No fue posible actualizar la contraseña.'));
      setSubmitting(false);
    }
  }

  return (
    <main className={styles.page}>
      <section className={styles.card} aria-label="Restablecer contraseña">
        <div className={styles.content}>
          <div className={styles.brand}>
            <span className={styles.brandMark}>C</span>
            <span>Coachly</span>
          </div>

          <div className={styles.copy}>
            <p className={styles.eyebrow}>Recupera tu acceso</p>
            <h1 className={styles.title}>Crea una nueva contraseña</h1>
            <p className={styles.subtitle}>Ingresa y confirma tu nueva contraseña para continuar.</p>
          </div>

          {error ? <div className={styles.error}>{error}</div> : null}
          {success ? <div className={styles.success}>{success}</div> : null}

          {missingParams ? (
            <p className={styles.error}>
              El enlace no es válido o está incompleto. Solicita un nuevo enlace de recuperación.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.field}>
                <LockIcon />
                <input
                  className={`${styles.input} ${styles.passwordInput}`}
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Nueva contraseña"
                  aria-label="Nueva contraseña"
                  minLength={8}
                  required
                />
                <button
                  className={styles.passwordToggle}
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  <EyeIcon visible={showPassword} />
                </button>
              </div>

              <div className={styles.field}>
                <LockIcon />
                <input
                  className={styles.input}
                  id="password_confirmation"
                  name="password_confirmation"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Confirma tu nueva contraseña"
                  aria-label="Confirma tu nueva contraseña"
                  minLength={8}
                  required
                />
              </div>

              <button className={styles.submit} type="submit" disabled={submitting}>
                {submitting ? 'Guardando…' : 'Cambiar contraseña'}
              </button>
            </form>
          )}

          <button
            className={styles.secondaryAction}
            type="button"
            onClick={() => router.replace('/login')}
          >
            Volver a iniciar sesión
          </button>
        </div>
      </section>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
