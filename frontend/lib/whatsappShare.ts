export const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || 'https://app.brycoach.pro').trim().replace(/\/+$/, '');

export const APP_HOST = (() => {
  try {
    return new URL(APP_URL).host.replace(/^www\./, '').toLowerCase();
  } catch {
    return 'app.brycoach.pro';
  }
})();

export function isPlaceholderEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return email.trim().toLowerCase().endsWith(`@${APP_HOST}`);
}

export interface WhatsAppAccessInfo {
  name: string;
  whatsapp: string;
  email: string | null;
}

export function buildWhatsAppAccessUrl(info: WhatsAppAccessInfo): string {
  const digits = info.whatsapp.replace(/\D/g, '');
  const lines = [
    `¡Hola ${info.name}! 🎉`,
    '',
    'Ya tenemos tu cuenta lista en Bry Fit para que sigas tus rutinas, mediciones y progreso desde la app.',
    '',
    'Para ingresar, inicia sesión con tu número de WhatsApp y la contraseña que se te asignó al crear tu perfil:',
    '',
    `📱 WhatsApp: ${info.whatsapp}`,
    '🔑 Contraseña: la que se te asignó',
    `🔗 Ingresa aquí: ${APP_URL}/login`,
    '',
    '¡Nos vemos en tu próximo entrenamiento! 💪'
  ];

  const text = encodeURIComponent(lines.join('\n'));
  return `https://wa.me/${digits}?text=${text}`;
}

export function openWhatsAppAccessMessage(info: WhatsAppAccessInfo): void {
  if (typeof window === 'undefined') return;
  window.open(buildWhatsAppAccessUrl(info), '_blank', 'noopener,noreferrer');
}
