'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { logout } from '@/lib/api/fit';
import { clearSession } from '@/lib/session';
import { InstallHint } from '@/components/InstallHint';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { checking } = useAuthGuard('CLIENT');
  const router = useRouter();

  async function handleLogout() {
    try {
      await logout();
    } catch {
      // El token local se elimina incluso si Laravel ya lo invalidó o expiró.
    }
    clearSession();
    router.replace('/login');
  }

  if (checking) return null;

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="container topbar-inner">
          <Link href="/mis-rutinas" className="brand">
            <span className="brand-mark">C</span>
            <span>Coachly</span>
          </Link>
          <button className="btn btn-soft" type="button" onClick={handleLogout}>Salir</button>
        </div>
      </header>
      <main className="container">{children}</main>
      <InstallHint />
    </div>
  );
}
