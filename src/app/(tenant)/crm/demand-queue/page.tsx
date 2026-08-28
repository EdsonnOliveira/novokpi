import Link from 'next/link';
import { redirect } from 'next/navigation';
import { PageTitle } from '@/components/dastone/PageTitle';
import { Card } from '@/components/dastone/Card';
import { KpiGrid } from '@/components/dastone/KpiGrid';
import { DemandQueueTable } from '@/components/crm/DemandQueueTable';
import { RunQueueMatchingButton } from '@/components/crm/RunQueueMatchingButton';
import { createClient } from '@/lib/supabase/server';
import { getTenantContext } from '@/lib/settings/tenant-context';
import {
  formatDealNumber,
  formatInterestLabel,
  joinOne,
  type DemandQueueListRow,
  type DemandQueueTableRow,
} from '@/types/crm';

function mapDemandQueueRows(items: DemandQueueListRow[]): DemandQueueTableRow[] {
  return items.map((item) => {
    const person = joinOne(item.people);
    const interest = joinOne(item.interest_profiles);
    const deal = joinOne(item.deals);

    return {
      id: item.id,
      clientName: person?.full_name ?? '—',
      contact: person?.phone ?? person?.email ?? '—',
      interestLabel: formatInterestLabel(interest),
      dealHref: deal?.id ? `/crm/${deal.id}` : '',
      dealNumber: deal ? formatDealNumber(deal.deal_number) : '—',
      status: item.status,
      createdAt: new Date(item.created_at).toLocaleString('pt-BR'),
    };
  });
}

export default async function DemandQueuePage() {
  const supabase = await createClient();
  const context = await getTenantContext(supabase);

  if (!context) {
    redirect('/login');
  }

  const { data: queueData } = await supabase
    .from('demand_queue')
    .select(`
      id,
      status,
      created_at,
      people:person_id ( full_name, phone, email ),
      interest_profiles:interest_profile_id (
        brand,
        model,
        version,
        year_min,
        year_max,
        price_min,
        price_max
      ),
      deals:deal_id ( id, deal_number, title )
    `)
    .eq('tenant_id', context.tenantId)
    .order('created_at', { ascending: true })
    .limit(200);

  const rows = mapDemandQueueRows((queueData ?? []) as DemandQueueListRow[]);
  const waitingCount = rows.filter((row) => row.status === 'waiting').length;
  const matchedCount = rows.filter((row) => row.status === 'matched').length;

  return (
    <>
      <PageTitle
        title="Fila demanda"
        subtitle="Clientes aguardando veículo"
        breadcrumbs={[
          { label: 'CRM', href: '/crm' },
          { label: 'Fila demanda' },
        ]}
        actions={
          <div className="d-flex gap-2 align-items-center">
            <RunQueueMatchingButton tenantId={context.tenantId} userId={context.userId} />
            <Link href="/crm/offer-queue" className="btn btn-light btn-sm">
              Fila oferta
            </Link>
            <Link href="/crm/new" className="btn btn-primary btn-sm">
              Nova ficha
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
      <Card title="Clientes na fila">
        <DemandQueueTable rows={rows} />
      </Card>
    </>
  );
}
