'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { forgotPassword, login } from '@/lib/api/fit';
import { setSession, getSessionUser } from '@/lib/session';
import { apiErrorMessage } from '@/lib/api/errors';
import styles from './LoginPage.module.css';

function UserIcon() {
  return <svg className={styles.icon} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20 21a8 8 0 0 0-16 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /><circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="1.8" /></svg>;
}
function LockIcon() {
  return <svg className={styles.icon} viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="4" y="10" width="16" height="11" rx="3" stroke="currentColor" strokeWidth="1.8" /><path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>;
}
function EyeIcon({ visible }: { visible: boolean }) {
  return <svg viewBox="0 0 24 24" width="19" height="19" fill="none" aria-hidden="true"><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" stroke="currentColor" strokeWidth="1.7" /><circle cx="12" cy="12" r="2.7" stroke="currentColor" strokeWidth="1.7" />{!visible ? <path d="m4 4 16 16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /> : null}</svg>;
}

export default function LoginPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [recovering, setRecovering] = useState(false);
  const [recoveryMode, setRecoveryMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const session = getSessionUser();
    if (session) router.replace(session.role === 'CLIENT' ? '/mis-rutinas' : '/dashboard');
  }, [router]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    const formData = new FormData(event.currentTarget);
    const whatsapp = String(formData.get('whatsapp') || '').trim();
    const password = String(formData.get('password') || '').trim();
    setSubmitting(true); setError(''); setSuccess('');
    try {
      const response = await login(whatsapp, password);
      setSession(response.user, response.access_token, response.expires_in);
      router.replace(response.user.role === 'CLIENT' ? '/mis-rutinas' : '/dashboard');
    } catch (cause) {
      setError(apiErrorMessage(cause, 'No fue posible iniciar sesión.'));
      setSubmitting(false);
    }
  }

  async function handleRecovery(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (recovering) return;
    const identifier = String(new FormData(event.currentTarget).get('recovery_identifier') || '').trim();
    setRecovering(true); setError(''); setSuccess('');
    try {
      const response = await forgotPassword(identifier);
      setSuccess(response.message || 'Si la cuenta existe, recibirás las instrucciones para cambiar la contraseña.');
    } catch (cause) {
      setError(apiErrorMessage(cause, 'No fue posible procesar la solicitud.'));
    } finally { setRecovering(false); }
  }

  return (
    <main className={styles.page}>
      <section className={styles.card} aria-label="Acceso a Coachly">
        <div className={styles.content}>
          <div className={styles.brand}><span className={styles.brandMark}>C</span><span>Coachly</span></div>
          <div className={styles.copy}>
            <p className={styles.eyebrow}>{recoveryMode ? 'Recupera tu acceso' : 'Tu negocio fitness, en control'}</p>
            <h1 className={styles.title}>{recoveryMode ? 'Cambia tu contraseña' : 'Entrena mejor. Gestiona mejor.'}</h1>
            <p className={styles.subtitle}>{recoveryMode ? 'Ingresa tu correo electrónico o username para recibir las instrucciones.' : 'Clientes, rutinas, progreso y seguimiento desde una sola plataforma.'}</p>
          </div>
          {error ? <div className={styles.error}>{error}</div> : null}
          {success ? <div className={styles.success}>{success}</div> : null}
          {recoveryMode ? (
            <form onSubmit={handleRecovery} className={styles.form}>
              <div className={styles.field}><UserIcon /><input className={styles.input} id="recovery_identifier" name="recovery_identifier" type="text" autoComplete="username" placeholder="Correo electrónico o username" aria-label="Correo electrónico o username" required /></div>
              <button className={styles.submit} type="submit" disabled={recovering}>{recovering ? 'Procesando…' : 'Enviar instrucciones'}</button>
              <button className={styles.secondaryAction} type="button" onClick={() => { setRecoveryMode(false); setError(''); setSuccess(''); }}>Volver a iniciar sesión</button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.field}><UserIcon /><input className={styles.input} id="whatsapp" name="whatsapp" type="tel" inputMode="tel" autoComplete="username" placeholder="WhatsApp" aria-label="WhatsApp" required /></div>
              <div className={styles.field}><LockIcon /><input className={`${styles.input} ${styles.passwordInput}`} id="password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="Contraseña" aria-label="Contraseña" required /><button className={styles.passwordToggle} type="button" onClick={() => setShowPassword(v => !v)} aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}><EyeIcon visible={showPassword} /></button></div>
              <button className={styles.forgotPassword} type="button" onClick={() => { setRecoveryMode(true); setError(''); setSuccess(''); }}>¿Olvidaste tu contraseña?</button>
              <button className={styles.submit} type="submit" disabled={submitting}>{submitting ? 'Ingresando…' : 'Entrar a Coachly'}</button>
            </form>
          )}
          <p className={styles.helper}>Coachly · Clientes · Rutinas · Progreso</p>
        </div>
      </section>
    </main>
  );
}
