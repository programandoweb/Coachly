'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, getLocalUser } from '@/lib/auth';
import type { UserRow } from '@/lib/api/types';

type Role = 'TRAINER' | 'CLIENT' | 'ANY';

/**
 * Reemplaza los antiguos requireUser/requireTrainer/requireClient de servidor.
 * Verifica la sesión contra Laravel (fit/auth/me) y redirige si no corresponde.
 */
export function useAuthGuard(role: Role = 'ANY') {
  const router = useRouter();
  const [user, setUser] = useState<UserRow | null>(() => getLocalUser());
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let active = true;

    (async () => {
      const current = await getCurrentUser().catch(() => null);
      if (!active) return;

      if (!current) {
        router.replace('/login');
        return;
      }

      if (role === 'TRAINER' && (current.role !== 'TRAINER' || !current.trainer_id)) {
        router.replace('/mis-rutinas');
        return;
      }

      if (role === 'CLIENT' && (current.role !== 'CLIENT' || !current.client_id)) {
        router.replace('/dashboard');
        return;
      }

      setUser(current);
      setChecking(false);
    })();

    return () => {
      active = false;
    };
  }, [role, router]);

  return { user, checking };
}
