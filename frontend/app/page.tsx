'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSessionUser } from '@/lib/session';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const session = getSessionUser();
    if (!session) {
      router.replace('/login');
      return;
    }
    router.replace(session.role === 'CLIENT' ? '/mis-rutinas' : '/dashboard');
  }, [router]);

  return null;
}
