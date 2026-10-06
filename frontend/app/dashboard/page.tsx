'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { listClients } from '@/lib/api/fit';
import { apiErrorMessage } from '@/lib/api/errors';
import DashboardClientsList from './DashboardClientsList';

type DashboardClient = {
  id: number;
  name: string;
  whatsapp: string;
  goal: string | null;
  email: string | null;
  access_enabled: number;
  created_at: string;
  updated_at: string;
};

export default function DashboardPage() {
  const { user, checking } = useAuthGuard('TRAINER');
  const [clients, setClients] = useState<DashboardClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const reload = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const rows = await listClients(Number(user.trainer_id));
      setClients(
        rows.map((client) => ({
          id: Number(client.id),
          name: String(client.name || 'Cliente'),
          whatsapp: client.whatsapp,
          goal: client.goal ?? null,
          email: client.email ?? null,
          access_enabled: Number(client.access_enabled ?? 0),
          created_at: client.created_at,
          updated_at: client.updated_at
        }))
      );
      setError('');
    } catch (cause) {
      setError(apiErrorMessage(cause, 'No fue posible cargar los clientes.'));
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (checking || !user) return;
    reload();
  }, [checking, user, reload]);

  if (checking || loading) return null;
  if (error) return <div className="error-box">{error}</div>;

  return <DashboardClientsList clients={clients} onClientCreated={reload} />;
}
