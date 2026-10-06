'use client';

import Link from 'next/link';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import DashboardMenu from './DashboardMenu';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { checking } = useAuthGuard('TRAINER');
  if (checking) return null;

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="container topbar-inner">
          <Link href="/dashboard" className="brand" aria-label="Coachly">
            <span className="brand-mark">C</span>
            <span>Coachly</span>
          </Link>
          <DashboardMenu />
        </div>
      </header>
      <main className="container">{children}</main>
    </div>
  );
}
