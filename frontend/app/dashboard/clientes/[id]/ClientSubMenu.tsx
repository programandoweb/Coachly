'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'motion/react';
import BackButton from './BackButton';

type ClientSubMenuProps = {
  clientId: number;
};

function getClientMenuItems(clientId: number) {
  return [
    {
      href: `/dashboard/clientes/${clientId}`,
      title: 'Rutinas asignadas',
      description: 'Ver los planes activos del cliente.'
    },
    {
      href: `/dashboard/clientes/${clientId}/datos`,
      title: 'Datos y encuesta',
      description: 'Editar ficha, contacto y salud.'
    },
    {
      href: `/dashboard/clientes/${clientId}/mediciones`,
      title: 'Mediciones',
      description: 'Registrar peso, medidas y avances.'
    },
    {
      href: `/dashboard/clientes/${clientId}/historial`,
      title: 'Historial',
      description: 'Progreso de peso y reps por músculo.'
    },
    {
      href: `/dashboard/clientes/${clientId}/rutinas/nueva`,
      title: 'Nueva rutina',
      description: 'Crear y asignar un plan nuevo.'
    }
  ];
}

export default function ClientSubMenu({ clientId }: ClientSubMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const menuItems = getClientMenuItems(clientId);

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsOpen(false);
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <nav className="client-submenu" aria-label="Menu de cliente">
      <div className="client-actions-left">
        <BackButton />
      </div>

      <div className="client-actions-menu" ref={menuRef}>
        <span className="client-actions-label">Gestionar cliente</span>

        <button
          type="button"
          className={`client-menu-button${isOpen ? ' is-open' : ''}`}
          aria-label="Abrir opciones del cliente"
          aria-expanded={isOpen}
          aria-haspopup="menu"
          onClick={() => setIsOpen((current) => !current)}
        >
          <motion.span animate={isOpen ? { y: 7, rotate: 45 } : { y: 0, rotate: 0 }} transition={{ duration: 0.18 }} />
          <motion.span animate={isOpen ? { opacity: 0, x: -5 } : { opacity: 1, x: 0 }} transition={{ duration: 0.16 }} />
          <motion.span animate={isOpen ? { y: -7, rotate: -45 } : { y: 0, rotate: 0 }} transition={{ duration: 0.18 }} />
        </button>

        <AnimatePresence>
          {isOpen ? (
            <motion.div
              className="client-menu-dropdown"
              role="menu"
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 420, damping: 32 }}
            >
              <div className="client-menu-header">
                <strong>Acciones rapidas</strong>
                <small>Elige que quieres revisar o editar.</small>
              </div>

              {menuItems.map((item, index) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.035, duration: 0.16 }}
                >
                  <Link
                    role="menuitem"
                    className={`client-menu-link${pathname === item.href ? ' is-active' : ''}`}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                  >
                    <span>
                      <strong>{item.title}</strong>
                      <small>{item.description}</small>
                    </span>
                    <span className="client-menu-arrow" aria-hidden="true">→</span>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </nav>
  );
}
