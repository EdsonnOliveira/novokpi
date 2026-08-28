import Link from 'next/link';
import { PageTitle } from '@/components/dastone/PageTitle';
import { Card } from '@/components/dastone/Card';
import { KpiGrid } from '@/components/dastone/KpiGrid';
import { LostSalesTable } from '@/components/crm/LostSalesTable';
import { createClient } from '@/lib/supabase/server';
import {
  formatDealNumber,
  joinOne,
  type LostDealListRow,
  type LostDealTableRow,
} from '@/types/crm';

function mapLostDealRows(deals: LostDealListRow[]): LostDealTableRow[] {
  return deals.map((deal) => {
    const person = joinOne(deal.people);
    const reason = joinOne(deal.lost_reasons);
    const channel = joinOne(deal.channels);

    return {
      id: deal.id,
      dealNumber: formatDealNumber(deal.deal_number),
      dealHref: `/crm/${deal.id}`,
      clientName: person?.full_name ?? '—',
      contact: person?.phone ?? person?.email ?? '—',
      lostReason: reason?.name ?? 'Sem motivo',
      channel: channel?.name ?? '—',
      closedAt: deal.closed_at
        ? new Date(deal.closed_at).toLocaleString('pt-BR')
        : new Date(deal.created_at).toLocaleString('pt-BR'),
    };
  });
}

export default async function LostSalesPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const { reason: reasonId } = await searchParams;
  const supabase = await createClient();

  const { data: reasonsData } = await supabase
    .from('lost_reasons')
    .select('id, name')
    .order('sort_order');

  const { data: allDealsData } = await supabase
    .from('deals')
    .select(`
      id,
      deal_number,
      title,
      closed_at,
      created_at,
      people:person_id ( full_name, phone, email ),
      lost_reasons:lost_reason_id ( id, name ),
      channels:channel_id ( name )
    `)
    .eq('status', 'closed_lost')
    .order('closed_at', { ascending: false, nullsFirst: false })
    .limit(200);

  let filteredDeals = (allDealsData ?? []) as LostDealListRow[];

  if (reasonId === 'none') {
    filteredDeals = filteredDeals.filter((deal) => !joinOne(deal.lost_reasons));
  } else if (reasonId) {
    filteredDeals = filteredDeals.filter((deal) => joinOne(deal.lost_reasons)?.id === reasonId);
  }

  const deals = (allDealsData ?? []) as LostDealListRow[];
  const rows = mapLostDealRows(filteredDeals);

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisMonthCount = deals.filter((deal) => {
    const closedAt = deal.closed_at ?? deal.created_at;
    return new Date(closedAt) >= monthStart;
  }).length;

  const reasonCounts = new Map<string, { id: string; name: string; count: number }>();
  for (const deal of deals) {
    const reason = joinOne(deal.lost_reasons);
    const key = reason?.id ?? 'none';
    const name = reason?.name ?? 'Sem motivo';
    const current = reasonCounts.get(key);
    if (current) {
      current.count += 1;
    } else {
      reasonCounts.set(key, { id: key, name, count: 1 });
    }
  }

  const topReason = [...reasonCounts.values()].sort((a, b) => b.count - a.count)[0];

  return (
    <>
      <PageTitle
        title="Vendas perdidas"
        subtitle="Dashboard de perdas e motivos"
        breadcrumbs={[
          { label: 'CRM', href: '/crm' },
          { label: 'Vendas perdidas' },
        ]}
        actions={
          <Link href="/settings/lost-reasons" className="btn btn-light btn-sm">
            <i className="iconoir-warning-circle me-1" aria-hidden="true" />
            Motivos de perda
          </Link>
        }
      />
      <KpiGrid
        items={[
          { id: 'total', label: 'Total perdidas', value: deals.length },
          { id: 'month', label: 'Perdas no mês', value: thisMonthCount },
          {
            id: 'top',
            label: 'Motivo principal',
            value: topReason?.name ?? '—',
            subtitle: topReason ? `${topReason.count} ocorrência(s)` : undefined,
          },
          { id: 'reasons', label: 'Motivos distintos', value: reasonCounts.size },
        ]}
      />
      <Card title="Filtrar por motivo">
        <div className="d-flex flex-wrap gap-2">
          <Link
            href="/crm/lost-sales"
            className={`btn btn-sm ${!reasonId ? 'btn-primary' : 'btn-light'}`}
          >
            <i className="iconoir-check me-1" aria-hidden="true" />
            Todos
          </Link>
          {(reasonsData ?? []).map((reason) => (
            <Link
              key={reason.id}
              href={`/crm/lost-sales?reason=${reason.id}`}
              className={`btn btn-sm ${reasonId === reason.id ? 'btn-primary' : 'btn-light'}`}
            >
              <i className="iconoir-check me-1" aria-hidden="true" />
              {reason.name}
              {reasonCounts.get(reason.id) ? (
                <span className="ms-1 badge bg-soft-secondary">
                  {reasonCounts.get(reason.id)?.count}
                </span>
              ) : null}
            </Link>
          ))}
          {reasonCounts.get('none') ? (
            <Link
              href="/crm/lost-sales?reason=none"
              className={`btn btn-sm ${reasonId === 'none' ? 'btn-primary' : 'btn-light'}`}
            >
              <i className="iconoir-warning-circle me-1" aria-hidden="true" />
              Sem motivo
              <span className="ms-1 badge bg-soft-secondary">
                {reasonCounts.get('none')?.count}
              </span>
            </Link>
          ) : null}
        </div>
      </Card>
      <Card title="Fichas perdidas" className="mt-3">
        <LostSalesTable rows={rows} />
      </Card>
    </>
  );
}
