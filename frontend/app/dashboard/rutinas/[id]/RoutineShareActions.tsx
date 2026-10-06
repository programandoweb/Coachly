'use client';

import { useState } from 'react';

type RoutineShareActionsProps = {
  shareUrl: string;
  whatsappHref?: string | null;
};

export default function RoutineShareActions({ shareUrl, whatsappHref }: RoutineShareActionsProps) {
  const [copied, setCopied] = useState(false);

  async function copyToClipboard() {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <div className="routine-share-actions" aria-label="Compartir rutina">
      <button
        type="button"
        className={`routine-icon-button${copied ? ' is-success' : ''}`}
        onClick={copyToClipboard}
        aria-label={copied ? 'Enlace copiado' : 'Copiar enlace de la rutina'}
        title={copied ? 'Copiado' : 'Copiar enlace'}
      >
        {copied ? (
          <span aria-hidden="true">✓</span>
        ) : (
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M8 8.5A3.5 3.5 0 0 1 11.5 5h5A3.5 3.5 0 0 1 20 8.5v5a3.5 3.5 0 0 1-3.5 3.5h-1.1v-2h1.1c.83 0 1.5-.67 1.5-1.5v-5c0-.83-.67-1.5-1.5-1.5h-5c-.83 0-1.5.67-1.5 1.5v1.1H8v-1.1Z" />
            <path d="M4 10.5A3.5 3.5 0 0 1 7.5 7h5A3.5 3.5 0 0 1 16 10.5v5A3.5 3.5 0 0 1 12.5 19h-5A3.5 3.5 0 0 1 4 15.5v-5Zm3.5-1c-.83 0-1.5.67-1.5 1.5v5c0 .83.67 1.5 1.5 1.5h5c.83 0 1.5-.67 1.5-1.5v-5c0-.83-.67-1.5-1.5-1.5h-5Z" />
          </svg>
        )}
      </button>

      {whatsappHref ? (
        <a
          className="routine-icon-button whatsapp"
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Compartir rutina por WhatsApp"
          title="Enviar por WhatsApp"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M12 3.25a8.5 8.5 0 0 0-7.2 13.01L4 20.75l4.6-1.15A8.5 8.5 0 1 0 12 3.25Zm0 1.9a6.6 6.6 0 0 1 0 13.2 6.52 6.52 0 0 1-3.15-.8l-.32-.17-1.95.49.5-1.86-.22-.34A6.6 6.6 0 0 1 12 5.15Zm-2.1 3.37c-.16 0-.42.06-.64.31-.22.25-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.66 2.66 4.12 3.62 2.04.8 2.46.64 2.9.6.44-.04 1.42-.58 1.62-1.14.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.28-.24-.12-1.42-.7-1.64-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06-.24-.12-1.01-.37-1.93-1.18-.71-.63-1.19-1.41-1.33-1.65-.14-.24-.01-.37.11-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.19-.46-.39-.4-.54-.41h-.5Z" />
          </svg>
        </a>
      ) : null}
    </div>
  );
}
