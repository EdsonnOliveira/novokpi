import Link from 'next/link';
import { redirect } from 'next/navigation';
import { PageTitle } from '@/components/dastone/PageTitle';
import { Card } from '@/components/dastone/Card';
import { KpiGrid } from '@/components/dastone/KpiGrid';
import { OfferQueueForm } from '@/components/crm/OfferQueueForm';
import { OfferQueueTable } from '@/components/crm/OfferQueueTable';
import { RunQueueMatchingButton } from '@/components/crm/RunQueueMatchingButton';
import { createClient } from '@/lib/supabase/server';
import { getTenantContext } from '@/lib/settings/tenant-context';
import { joinOne, type OfferQueueListRow, type OfferQueueTableRow } from '@/types/crm';

function mapOfferQueueRows(items: OfferQueueListRow[]): OfferQueueTableRow[] {
  return items.map((item) => {
    const vehicle = joinOne(item.vehicles);
    const brand = joinOne(vehicle?.vehicle_brands ?? null);
    const model = joinOne(vehicle?.vehicle_models ?? null);
    const version = joinOne(vehicle?.vehicle_versions ?? null);

    return {
      id: item.id,
      plate: vehicle?.plate ?? '—',
      vehicleLabel: [brand?.name, model?.name, version?.name].filter(Boolean).join(' ') || '—',
      color: vehicle?.color ?? '—',
      yearModel: vehicle?.year_model ? String(vehicle.year_model) : '—',
      status: item.status,
      createdAt: new Date(item.created_at).toLocaleString('pt-BR'),
    };
  });
}

export default async function OfferQueuePage() {
  const supabase = await createClient();
  const context = await getTenantContext(supabase);

  if (!context) {
    redirect('/login');
  }

  const { data: queueData } = await supabase
    .from('offer_queue')
    .select(`
      id,
      status,
      created_at,
      vehicles:vehicle_id (
        plate,
        color,
        year_model,
        vehicle_brands:brand_id ( name ),
        vehicle_models:model_id ( name ),
        vehicle_versions:version_id ( name )
      )
    `)
    .eq('tenant_id', context.tenantId)
    .order('created_at', { ascending: true })
    .limit(200);

  const rows = mapOfferQueueRows((queueData ?? []) as OfferQueueListRow[]);
  const waitingCount = rows.filter((row) => row.status === 'waiting').length;
  const matchedCount = rows.filter((row) => row.status === 'matched').length;

  return (
    <>
      <PageTitle
        title="Fila oferta"
        subtitle="Veículos aguardando comprador"
        breadcrumbs={[
          { label: 'CRM', href: '/crm' },
          { label: 'Fila oferta' },
        ]}
        actions={
          <div className="d-flex gap-2 align-items-center">
            <RunQueueMatchingButton tenantId={context.tenantId} userId={context.userId} />
            <Link href="/crm/demand-queue" className="btn btn-light btn-sm">
              Fila demanda
            </Link>
            <Link href="/inventory" className="btn btn-primary btn-sm">
              Ver estoque
            </Link>
          </div>
        }
      />
      <KpiGrid
        columns={3}
        items={[
          { id: 'waiting', label: 'Aguardando', value: waitingCount },
          { id: 'matched', label: 'Encontrados', value: matchedCount },
          { id: 'total', label: 'Total na fila', value: rows.length },
        ]}
      />
      <Card title="Incluir veículo">
        <OfferQueueForm />
      </Card>
      <Card title="Veículos na fila" className="mt-3">
        <OfferQueueTable rows={rows} />
      </Card>
    </>
  );
}
