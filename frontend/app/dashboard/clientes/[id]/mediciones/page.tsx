'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { getClientDetail } from '@/lib/api/fit';
import { apiErrorMessage } from '@/lib/api/errors';
import type { ClientDetail, MeasurementRow } from '@/lib/api/types';
import ClientSubMenu from '../ClientSubMenu';
import MeasurementForm from '../MeasurementForm';

function value(value: number | null | undefined, unit: string) {
  return value === null || value === undefined ? '—' : `${value} ${unit}`;
}

function MeasurementGroup({ title, items }: { title: string; items: Array<[string, string]> }) {
  return (
    <section className="measurement-record-group">
      <h3>{title}</h3>
      <div className="measurement-record-grid">
        {items.map(([label, content]) => (
          <div key={label}><span>{label}</span><strong>{content}</strong></div>
        ))}
      </div>
    </section>
  );
}

function MeasurementSummary({ measurement }: { measurement: MeasurementRow }) {
  return (
    <article className="measurement-record-card">
      <header>
        <div>
          <span className="eyebrow">Control antropométrico</span>
          <strong>{new Date(measurement.measured_at).toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })}</strong>
        </div>
        <span className="measurement-record-weight">{value(measurement.weight_kg, 'kg')}</span>
      </header>

      <MeasurementGroup title="Datos generales" items={[
        ['Peso', value(measurement.weight_kg, 'kg')],
        ['Talla', value(measurement.height_cm, 'cm')],
        ['Grasa corporal', value(measurement.body_fat, '%')],
        ['Masa muscular', value(measurement.muscle_mass_percentage, '%')]
      ]} />

      <MeasurementGroup title="Pliegues cutáneos" items={[
        ['Tríceps', value(measurement.triceps_skinfold_mm, 'mm')],
        ['Subescapular', value(measurement.subscapular_skinfold_mm, 'mm')],
        ['Suprailíaco', value(measurement.suprailiac_skinfold_mm, 'mm')],
        ['Abdominal', value(measurement.abdominal_skinfold_mm, 'mm')],
        ['Muslo', value(measurement.thigh_skinfold_mm, 'mm')],
        ['Pantorrilla', value(measurement.calf_skinfold_mm, 'mm')]
      ]} />

      <MeasurementGroup title="Perímetros corporales" items={[
        ['Brazo relajado', value(measurement.relaxed_arm_cm, 'cm')],
        ['Brazo contraído', value(measurement.contracted_arm_cm, 'cm')],
        ['Tórax', value(measurement.thorax_cm, 'cm')],
        ['Cintura', value(measurement.waist_cm, 'cm')],
        ['Cadera', value(measurement.hip_cm, 'cm')],
        ['Muslo', value(measurement.thigh_cm, 'cm')],
        ['Pantorrilla', value(measurement.calf_cm, 'cm')]
      ]} />

      {measurement.notes ? <p className="measurement-record-notes">{measurement.notes}</p> : null}
    </article>
  );
}

export default function ClientMeasurementsPage() {
  const { user, checking } = useAuthGuard('TRAINER');
  const params = useParams<{ id: string }>();
  const clientId = Number(params.id);

  const [detail, setDetail] = useState<ClientDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState('');

  const reload = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const result = await getClientDetail(clientId, Number(user.trainer_id));
      if (!result) {
        setNotFound(true);
        return;
      }
      setDetail(result);
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
  if (notFound || !detail) return <div className="error-box">Cliente no encontrado.</div>;

  const { client, measurements } = detail;

  return (
    <>
      <section className="page-head client-page-head measurement-page-head">
        <div>
          <div className="eyebrow">Evaluación física</div>
          <h1 className="h1">Mediciones de {client.name}</h1>
          <p className="subtitle">Registra y compara la evolución antropométrica del cliente.</p>
        </div>
        <ClientSubMenu clientId={client.id} />
      </section>

      <section className="measurement-toolbar">
        <div>
          <strong>Historial de controles</strong>
          <span>{measurements.length} {measurements.length === 1 ? 'registro' : 'registros'}</span>
        </div>
        <MeasurementForm clientId={client.id} clientName={client.name} onSaved={reload} />
      </section>

      <section className="measurement-records">
        {measurements.map((measurement) => <MeasurementSummary measurement={measurement} key={measurement.id} />)}
        {!measurements.length ? (
          <div className="measurement-empty-state">
            <span>＋</span>
            <h2>Aún no hay mediciones</h2>
            <p>Usa el botón “Crear medición” para registrar el primer control antropométrico.</p>
          </div>
        ) : null}
      </section>
    </>
  );
}
