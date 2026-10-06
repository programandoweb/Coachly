'use client';

import Link from 'next/link';
import { motion, type PanInfo } from 'motion/react';
import { useEffect, useState } from 'react';
import NewClientDrawer from './NewClientDrawer';
import { deleteClient, shareClientAccess } from '@/lib/api/fit';
import { apiErrorMessage } from '@/lib/api/errors';
import { openWhatsAppAccessMessage } from '@/lib/whatsappShare';
import type { ClientRow } from '@/lib/api/types';

type DashboardClient = Pick<
  ClientRow,
  | 'id'
  | 'name'
  | 'whatsapp'
  | 'goal'
  | 'email'
  | 'access_enabled'
  | 'created_at'
  | 'updated_at'
>;

const SWIPE_REVEAL_WIDTH = 76;

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'C';
}

function formatClientTime(value?: string | null) {
  if (!value) return '';

  const date = new Date(value.replace(' ', 'T'));
  if (Number.isNaN(date.getTime())) return '';

  return date.toLocaleTimeString('es-CO', {
    hour: 'numeric',
    minute: '2-digit'
  });
}

function getPreview(client: DashboardClient) {
  if (client.goal) return client.goal;
  if (client.email) return client.email;
  return client.whatsapp || 'Cliente registrado';
}

function TrashIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M12.04 2c-5.5 0-9.96 4.46-9.96 9.96 0 1.76.46 3.47 1.34 4.98L2 22l5.2-1.36a9.94 9.94 0 0 0 4.84 1.24h.01c5.5 0 9.96-4.46 9.96-9.96S17.54 2 12.04 2Zm0 18.2h-.01a8.24 8.24 0 0 1-4.2-1.15l-.3-.18-3.09.81.82-3.01-.2-.31a8.24 8.24 0 0 1-1.26-4.4c0-4.56 3.71-8.27 8.27-8.27 2.21 0 4.28.86 5.84 2.42a8.2 8.2 0 0 1 2.42 5.85c0 4.56-3.71 8.24-8.27 8.24Zm4.52-6.18c-.25-.12-1.47-.72-1.7-.8-.23-.08-.4-.12-.56.13-.17.25-.65.8-.79.96-.15.17-.29.19-.54.06-.25-.12-1.04-.38-1.98-1.22-.73-.65-1.22-1.46-1.37-1.7-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.15.16-.25.24-.42.08-.17.04-.31-.02-.44-.06-.12-.56-1.36-.77-1.86-.2-.49-.41-.42-.56-.43-.14-.01-.31-.01-.48-.01-.17 0-.44.06-.67.31-.23.25-.87.85-.87 2.08s.9 2.42 1.02 2.58c.12.17 1.77 2.7 4.28 3.79.6.26 1.06.41 1.43.53.6.19 1.14.16 1.57.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.15-1.18-.06-.1-.23-.16-.48-.28Z" />
    </svg>
  );
}

function useIsMobile(breakpoint = 700) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const query = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const update = () => setIsMobile(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, [breakpoint]);

  return isMobile;
}

function ClientRowItem({
  client,
  isMobile,
  isDeleting,
  isSharing,
  onDelete,
  onShare
}: {
  client: DashboardClient;
  isMobile: boolean;
  isDeleting: boolean;
  isSharing: boolean;
  onDelete: (client: DashboardClient) => void;
  onShare: (client: DashboardClient) => void;
}) {
  const [swipeOpen, setSwipeOpen] = useState(false);
  const hasAccess = Boolean(client.access_enabled);
  const revealWidth = hasAccess ? SWIPE_REVEAL_WIDTH * 2 : SWIPE_REVEAL_WIDTH;

  useEffect(() => {
    if (!isMobile) setSwipeOpen(false);
  }, [isMobile]);

  function handleDragEnd(_event: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) {
    if (info.offset.x < -32 || info.velocity.x < -350) {
      setSwipeOpen(true);
    } else if (info.offset.x > 32 || info.velocity.x > 350) {
      setSwipeOpen(false);
    }
  }

  const shareButton = hasAccess ? (
    <button
      type="button"
      className="client-chat-share"
      disabled={isSharing}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onShare(client);
      }}
      aria-label={`Compartir acceso con ${client.name} por WhatsApp`}
      title="Compartir acceso por WhatsApp"
    >
      {isSharing ? <span className="client-chat-delete-spinner" aria-hidden="true" /> : <WhatsAppIcon />}
    </button>
  ) : null;

  const rowContent = (
    <>
      <span className="client-chat-avatar" aria-hidden="true">{getInitials(client.name)}</span>

      <span className="client-chat-content">
        <span className="client-chat-top">
          <strong>{client.name}</strong>
          <time dateTime={client.updated_at || client.created_at}>{formatClientTime(client.updated_at || client.created_at)}</time>
        </span>

        <span className="client-chat-bottom">
          <span className="client-chat-preview">
            <span className="client-chat-checks" aria-hidden="true">✓✓</span>
            {getPreview(client)}
          </span>
        </span>
      </span>
    </>
  );

  if (!isMobile) {
    return (
      <motion.div
        variants={{
          hidden: { opacity: 0, x: -14, scale: 0.98 },
          visible: { opacity: 1, x: 0, scale: 1 }
        }}
        transition={{ type: 'spring', stiffness: 340, damping: 30 }}
        className="client-chat-item"
      >
        <Link href={`/dashboard/clientes/${client.id}`} className="client-chat-row">
          {rowContent}
        </Link>

        {shareButton}

        <button
          type="button"
          className="client-chat-delete"
          disabled={isDeleting}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onDelete(client);
          }}
          aria-label={`Eliminar a ${client.name}`}
          title="Eliminar cliente"
        >
          {isDeleting ? <span className="client-chat-delete-spinner" aria-hidden="true" /> : <TrashIcon />}
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, x: -14, scale: 0.98 },
        visible: { opacity: 1, x: 0, scale: 1 }
      }}
      transition={{ type: 'spring', stiffness: 340, damping: 30 }}
      className="client-swipe-wrap"
    >
      <div className="client-swipe-actions" aria-hidden={!swipeOpen}>
        {hasAccess ? (
          <button
            type="button"
            className="client-swipe-share-btn"
            disabled={isSharing}
            onClick={() => {
              setSwipeOpen(false);
              onShare(client);
            }}
            aria-label={`Compartir acceso con ${client.name} por WhatsApp`}
          >
            {isSharing ? <span className="client-chat-delete-spinner" aria-hidden="true" /> : <WhatsAppIcon />}
          </button>
        ) : null}
        <button
          type="button"
          className="client-swipe-delete-btn"
          disabled={isDeleting}
          onClick={() => {
            setSwipeOpen(false);
            onDelete(client);
          }}
          aria-label={`Eliminar a ${client.name}`}
        >
          {isDeleting ? <span className="client-chat-delete-spinner" aria-hidden="true" /> : <TrashIcon />}
        </button>
      </div>

      <motion.div
        className="client-swipe-content"
        drag="x"
        dragDirectionLock
        dragConstraints={{ left: -revealWidth, right: 0 }}
        dragElastic={0.03}
        dragMomentum={false}
        animate={{ x: swipeOpen ? -revealWidth : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 42 }}
        onDragEnd={handleDragEnd}
      >
        <Link
          href={`/dashboard/clientes/${client.id}`}
          className="client-chat-row"
          onClick={(event) => {
            if (swipeOpen) {
              event.preventDefault();
              setSwipeOpen(false);
            }
          }}
        >
          {rowContent}
        </Link>
      </motion.div>
    </motion.div>
  );
}

export default function DashboardClientsList({
  clients,
  onClientCreated
}: {
  clients: DashboardClient[];
  onClientCreated?: () => void;
}) {
  const [isClientDrawerOpen, setIsClientDrawerOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [removedIds, setRemovedIds] = useState<number[]>([]);
  const [deleteError, setDeleteError] = useState('');
  const [sharingId, setSharingId] = useState<number | null>(null);
  const [shareError, setShareError] = useState('');
  const isMobile = useIsMobile();

  async function handleDelete(client: DashboardClient) {
    if (deletingId) return;
    if (!window.confirm(`¿Eliminar a "${client.name}"? Se borrarán sus rutinas y mediciones. Esta acción no se puede deshacer.`)) return;

    setDeletingId(client.id);
    setDeleteError('');
    try {
      await deleteClient(client.id);
      setRemovedIds((prev) => [...prev, client.id]);
      onClientCreated?.();
    } catch (cause) {
      setDeleteError(apiErrorMessage(cause, 'No fue posible eliminar el cliente.'));
    } finally {
      setDeletingId(null);
    }
  }

  async function handleShare(client: DashboardClient) {
    if (sharingId) return;
    setSharingId(client.id);
    setShareError('');
    try {
      const result = await shareClientAccess(client.id);
      openWhatsAppAccessMessage({
        name: client.name,
        whatsapp: client.whatsapp,
        email: result.client.email ?? client.email
      });
    } catch (cause) {
      setShareError(apiErrorMessage(cause, 'No fue posible compartir el acceso.'));
    } finally {
      setSharingId(null);
    }
  }

  const visibleClients = clients.filter((client) => !removedIds.includes(client.id));

  return (
    <>
    <motion.section
      className="dashboard-client-list-shell"
      aria-label="Clientes"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 28 }}
    >
      <header className="dashboard-clients-head">
        <div>
          <div className="eyebrow">Clientes</div>
          <h1 className="dashboard-clients-title">Tus clientes</h1>
          <p className="muted dashboard-clients-subtitle">Administra sus datos, mediciones y rutinas desde un solo lugar.</p>
        </div>

        <button className="btn btn-primary create-routine-trigger" type="button" onClick={() => setIsClientDrawerOpen(true)}>
          <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Agregar cliente
        </button>
      </header>

      {deleteError ? <div className="error-box">{deleteError}</div> : null}
      {shareError ? <div className="error-box">{shareError}</div> : null}

      <motion.div
        className="client-chat-list"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: {
            transition: {
              staggerChildren: 0.055,
              delayChildren: 0.08
            }
          }
        }}
      >
        {visibleClients.map((client) => (
          <ClientRowItem
            key={client.id}
            client={client}
            isMobile={isMobile}
            isDeleting={deletingId === client.id}
            isSharing={sharingId === client.id}
            onDelete={handleDelete}
            onShare={handleShare}
          />
        ))}

        {!visibleClients.length ? (
          <motion.div
            className="client-chat-empty"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 28, delay: 0.1 }}
          >
            Aún no hay clientes registrados.
          </motion.div>
        ) : null}
      </motion.div>
    </motion.section>

      <NewClientDrawer
        open={isClientDrawerOpen}
        onClose={() => setIsClientDrawerOpen(false)}
        onCreated={onClientCreated}
      />
    </>
  );
}
