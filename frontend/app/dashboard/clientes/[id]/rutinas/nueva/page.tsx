'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { getClientDetail } from '@/lib/api/fit';
import { apiErrorMessage } from '@/lib/api/errors';
import type { ClientRow } from '@/lib/api/types';
import ClientSubMenu from '../../ClientSubMenu';
import CreateRoutineForm from '../../CreateRoutineForm';

export default function NewClientRoutinePage() {
  const { user, checking } = useAuthGuard('TRAINER');
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const clientId = Number(params.id);

  const [client, setClient] = useState<ClientRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (checking || !user) return;

    let active = true;
    setLoading(true);

    getClientDetail(clientId, Number(user.trainer_id))
      .then((detail) => {
        if (!active) return;
        if (!detail) {
          setNotFound(true);
          return;
        }
        setClient(detail.client);
      })
      .catch((cause) => {
        if (active) setError(apiErrorMessage(cause, 'No fue posible cargar el cliente.'));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [checking, user, clientId]);

  if (checking || loading) return null;
  if (error) return <div className="error-box">{error}</div>;
  if (notFound || !client) return <div className="error-box">Cliente no encontrado.</div>;

  return (
    <>
      <section className="page-head client-page-head">
        <div>
          <div className="eyebrow">Nueva rutina</div>
          <h1 className="h1">{client.name}</h1>
          <p className="subtitle">Crea una rutina y dejala asignada a este cliente.</p>
        </div>
        <ClientSubMenu clientId={client.id} />
      </section>

      <section className="client-form-route-shell">
        <CreateRoutineForm
          clientId={client.id}
          clientName={client.name}
          onCreated={() => router.push(`/dashboard/clientes/${client.id}`)}
        />
      </section>
    </>
  );
}
