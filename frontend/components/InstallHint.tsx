'use client';

import { useEffect, useState } from 'react';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

export function InstallHint() {
  const [event, setEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setEvent(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (!event || hidden) return null;

  return (
    <div className="install-card">
      <div>
        <strong>Instala Coachly</strong>
        <p>Gestiona tus rutinas y clientes como app desde el celular.</p>
      </div>
      <button
        type="button"
        className="btn btn-primary"
        onClick={async () => {
          await event.prompt();
          setHidden(true);
        }}
      >
        Instalar
      </button>
    </div>
  );
}
