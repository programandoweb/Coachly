'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { getClientDetail } from '@/lib/api/fit';
import { apiErrorMessage } from '@/lib/api/errors';
import type { ClientRow } from '@/lib/api/types';
import ClientSubMenu from '../ClientSubMenu';
import ClientDataForm from '../ClientDataForm';

export default function ClientDataPage() {
  const { user, checking } = useAuthGuard('TRAINER');
  const params = useParams<{ id: string }>();
  const clientId = Number(params.id);

  const [client, setClient] = useState<ClientRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState('');

  const reload = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const detail = await getClientDetail(clientId, Number(user.trainer_id));
      if (!detail) {
        setNotFound(true);
        return;
      }
      setClient(detail.client);
      setNotFound(false);
    } catch (cause) {
      setError(apiErrorMessage(cause, 'No fue posible cargar el cliente.'));
    } finally {
      setLoading(false);
    }
  }, [user, clientId]);

  useEffect(() => {
    if (checking || !user) return;
    reload();
  }, [checking, user, reload]);

  if (checking || loading) return null;
  if (error) return <div className="error-box">{error}</div>;
  if (notFound || !client) return <div className="error-box">Cliente no encontrado.</div>;

  return (
    <>
      <section className="page-head client-page-head">
        <div>
          <div className="eyebrow">Datos de cliente</div>
          <h1 className="h1">{client.name}</h1>
          <p className="subtitle">Edita la ficha, encuesta y datos base.</p>
        </div>
        <ClientSubMenu clientId={client.id} />
      </section>

      <section className="client-form-route-shell">
        <ClientDataForm client={client} onSaved={reload} />
      </section>
    </>
  );
}
