'use client';

import { useEffect, useState } from 'react';

const SPLASH_DURATION_MS = 1500;
const EXIT_ANIMATION_MS = 420;

export function AppSplashScreen() {
  const [visible, setVisible] = useState(true);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const exitTimer = window.setTimeout(() => setLeaving(true), SPLASH_DURATION_MS);
    const removeTimer = window.setTimeout(() => setVisible(false), SPLASH_DURATION_MS + EXIT_ANIMATION_MS);
    return () => {
      window.clearTimeout(exitTimer);
      window.clearTimeout(removeTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div className={`app-splash${leaving ? ' app-splash--leaving' : ''}`} role="status" aria-label="Cargando Coachly">
      <div className="app-splash__shade" aria-hidden="true" />
      <div className="app-splash__brand">
        <span className="app-splash__mark">C</span>
        <strong>Coachly</strong>
        <small>Train. Manage. Grow.</small>
        <span className="app-splash__loader" aria-hidden="true" />
      </div>
    </div>
  );
}
