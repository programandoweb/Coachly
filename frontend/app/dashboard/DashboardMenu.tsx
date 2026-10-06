'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'motion/react';
import { logout } from '@/lib/api/fit';
import { clearSession } from '@/lib/session';

function DashboardNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="nav" aria-label="Navegación principal">
      <Link href="/dashboard" aria-current={pathname === '/dashboard' ? 'page' : undefined} onClick={onNavigate}>Home</Link>
      <Link href="/dashboard/rutinas" aria-current={pathname === '/dashboard/rutinas' ? 'page' : undefined} onClick={onNavigate}>Rutinas</Link>
      <Link href="/dashboard/grupos-musculares" aria-current={pathname.startsWith('/dashboard/grupos-musculares') ? 'page' : undefined} onClick={onNavigate}>Grupos Musculares</Link>
      <Link href="/dashboard/gestion" aria-current={pathname.startsWith('/dashboard/gestion') ? 'page' : undefined} onClick={onNavigate}>Gestión</Link>
    </nav>
  );
}

function LogoutForm({ onSubmit }: { onSubmit?: () => void }) {
  const router = useRouter();
  const pathname = usePathname();

  async function handleLogout(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit?.();
    try {
      await logout();
    } catch {
      // El token local se elimina incluso si Laravel ya lo invalidó o expiró.
    }
    clearSession();
    router.replace('/login');
  }

  return (
    <div className="dashboard-logout">
      <Link
        href="/dashboard/cambiar-contrasena"
        className="btn btn-blue"
        aria-current={pathname === '/dashboard/cambiar-contrasena' ? 'page' : undefined}
        onClick={onSubmit}
      >
        Cambiar contraseña
      </Link>
      <form onSubmit={handleLogout}>
        <button className="btn btn-soft" type="submit">Cerrar sesión</button>
      </form>
    </div>
  );
}

export default function DashboardMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const pathname = usePathname();

  const closeMenu = () => setIsOpen(false);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!menuRef.current) return;
      if (!(event.target instanceof Node)) return;

      if (!menuRef.current.contains(event.target)) {
        closeMenu();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeMenu();
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="dashboard-menu" ref={menuRef}>
      <div className="dashboard-menu-panel dashboard-menu-panel-desktop">
        <DashboardNav />
        <LogoutForm />
      </div>

      <button
        type="button"
        className={`hamburger-btn${isOpen ? ' is-open' : ''}`}
        aria-label={isOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'}
        aria-expanded={isOpen}
        aria-controls="dashboard-mobile-menu-panel"
        onClick={() => setIsOpen((current) => !current)}
      >
        <motion.span
          animate={isOpen ? { y: 7, rotate: 45 } : { y: 0, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 520, damping: 34 }}
        />
        <motion.span
          animate={isOpen ? { opacity: 0, x: -7 } : { opacity: 1, x: 0 }}
          transition={{ duration: 0.16 }}
        />
        <motion.span
          animate={isOpen ? { y: -7, rotate: -45 } : { y: 0, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 520, damping: 34 }}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.button
              key="dashboard-menu-backdrop"
              type="button"
              aria-label="Cerrar menú"
              className="dashboard-menu-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={closeMenu}
            />

            <motion.div
              key="dashboard-mobile-menu-panel"
              id="dashboard-mobile-menu-panel"
              className="dashboard-menu-panel dashboard-menu-panel-mobile"
              initial={{ opacity: 0, y: -12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 420, damping: 32 }}
            >
              <DashboardNav onNavigate={closeMenu} />
              <LogoutForm onSubmit={closeMenu} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
