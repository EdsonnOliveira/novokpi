import Link from 'next/link';
import { PageTitle } from '@/components/dastone/PageTitle';
import { Card } from '@/components/dastone/Card';
import { KpiGrid } from '@/components/dastone/KpiGrid';
import { EmptyState, TableEmptyRow } from '@/components/dastone/EmptyState';
import { DashboardCharts } from '@/components/dashboard/DashboardCharts';
import { createClient } from '@/lib/supabase/server';
import {
  buildChannelMetrics,
  buildDailySalesSeries,
  buildSellerMetrics,
  buildStockAgingBuckets,
  getMonthStartIso,
  sumNumbers,
  averageNumbers,
} from '@/lib/dashboard/metrics';
import { formatCurrency, joinOne } from '@/types/inventory';

function formatDealNumber(value: number) {
  return `#${String(value).padStart(6, '0')}`;
}

interface DashboardOrderRow {
  id: string;
  total_value: number | null;
  margin_value: number | null;
  margin_percent: number | null;
  channel_id: string | null;
  closed_at: string | null;
  channels: { name: string } | { name: string }[] | null;
}

interface DashboardSellerOrderRow {
  seller_user_id: string | null;
  total_value: number | null;
  margin_value: number | null;
  profiles: { full_name: string } | { full_name: string }[] | null;
}

interface DashboardPassageRow {
  id: string;
  status: string;
  cost: number | null;
  stock_started_at: string;
}

interface DashboardActivityRow {
  id: string;
  title: string;
  due_at: string;
  status: string;
  deals: { id: string; deal_number: number } | { id: string; deal_number: number }[] | null;
  people: { full_name: string } | { full_name: string }[] | null;
}

interface DashboardDealRow {
  id: string;
  deal_number: number;
  status: string;
  next_action_at: string | null;
  people: { full_name: string } | { full_name: string }[] | null;
  deal_stages: { name: string } | { name: string }[] | null;
}

interface DashboardAlertRow {
  id: string;
  title: string;
  href: string | null;
  created_at: string;
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const monthStart = getMonthStartIso();

  const [
    { data: monthOrders },
    { data: sellerOrders },
    { count: salesDealsCount },
    { count: lostDealsCount },
    { count: monthLeadsCount },
    { data: stockPassages },
    { count: openDealsCount },
    { count: overdueActivitiesCount },
    { count: alertsCount },
    { data: recentAlerts },
    { data: upcomingActivities },
    { data: recentDeals },
    { count: demandQueueCount },
    { count: deliveryPendingCount },
    { count: preparationPendingCount },
    { count: pendingEvaluationsCount },
  ] = await Promise.all([
    supabase
      .from('orders')
      .select('id, total_value, margin_value, margin_percent, channel_id, closed_at, channels:channel_id ( name )')
      .eq('status', 'closed')
      .gte('closed_at', monthStart)
      .order('closed_at', { ascending: false }),
    supabase
      .from('orders')
      .select('seller_user_id, total_value, margin_value, profiles:seller_user_id ( full_name )')
      .eq('status', 'closed')
      .gte('closed_at', monthStart),
    supabase.from('deals').select('*', { count: 'exact', head: true }).eq('status', 'closed_won').gte('closed_at', monthStart),
    supabase.from('deals').select('*', { count: 'exact', head: true }).eq('status', 'closed_lost').gte('closed_at', monthStart),
    supabase.from('deals').select('*', { count: 'exact', head: true }).gte('created_at', monthStart),
    supabase
      .from('vehicle_passages')
      .select('id, status, cost, stock_started_at')
      .in('status', ['in_stock', 'reserved', 'temporarily_out']),
    supabase.from('deals').select('*', { count: 'exact', head: true }).eq('status', 'open'),
    supabase.from('activities').select('*', { count: 'exact', head: true }).eq('status', 'overdue'),
    supabase.from('tenant_alerts').select('*', { count: 'exact', head: true }).eq('is_dismissed', false),
    supabase
      .from('tenant_alerts')
      .select('id, title, href, created_at')
      .eq('is_dismissed', false)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('activities')
      .select('id, title, due_at, status, deals:deal_id ( id, deal_number ), people:person_id ( full_name )')
      .in('status', ['pending', 'overdue'])
      .order('due_at', { ascending: true })
      .limit(6),
    supabase
      .from('deals')
      .select('id, deal_number, status, next_action_at, people:person_id ( full_name ), deal_stages:stage_id ( name )')
      .eq('status', 'open')
      .order('created_at', { ascending: false })
      .limit(6),
    supabase.from('demand_queue').select('*', { count: 'exact', head: true }).eq('status', 'waiting'),
    supabase.from('delivery_pendencies').select('*', { count: 'exact', head: true }).eq('is_resolved', false),
    supabase
      .from('preparation_orders')
      .select('*', { count: 'exact', head: true })
      .in('status', ['pending', 'in_progress']),
    supabase.from('evaluations').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
  ]);

  const orders = (monthOrders ?? []) as DashboardOrderRow[];
  const passages = (stockPassages ?? []) as DashboardPassageRow[];
  const monthRevenue = sumNumbers(orders.map((order) => order.total_value));
  const monthMargin = sumNumbers(orders.map((order) => order.margin_value));
  const averageMarginPercent = averageNumbers(
    orders.map((order) => Number(order.margin_percent ?? 0)).filter((value) => value > 0),
  );
  const stockCount = passages.filter((passage) => passage.status === 'in_stock').length;
  const stockValue = sumNumbers(passages.map((passage) => passage.cost));
  const stockAging = buildStockAgingBuckets(passages);
  const channelMetrics = buildChannelMetrics(orders);
  const sellerMetrics = buildSellerMetrics((sellerOrders ?? []) as DashboardSellerOrderRow[]);
  const dailySales = buildDailySalesSeries(orders);
  const hasSales = orders.length > 0;
  const hasStock = stockCount > 0;
  const pendingTotal =
    (deliveryPendingCount ?? 0) +
    (demandQueueCount ?? 0) +
    (preparationPendingCount ?? 0) +
    (pendingEvaluationsCount ?? 0) +
    (overdueActivitiesCount ?? 0) +
    (alertsCount ?? 0);

  return (
    <>
      <PageTitle
        title="Dashboard"
        subtitle="Visão geral da loja"
        breadcrumbs={[{ label: 'Novo KPI' }, { label: 'Dashboard' }]}
        actions={
          <div className="d-flex flex-wrap gap-2">
            <Link href="/reports" className="btn btn-light btn-sm">
              <i className="iconoir-stats-report me-1" aria-hidden="true" />
              Relatórios
            </Link>
            <Link href="/crm/new" className="btn btn-primary btn-sm">
              <i className="iconoir-plus me-1" aria-hidden="true" />
              Nova Ficha
            </Link>
          </div>
        }
      />

      <KpiGrid
        columns={4}
        items={[
          {
            id: 'sales-count',
            label: 'Vendas no mês',
            value: orders.length,
            suffix: 'vendas',
            href: '/orders?status=closed',
            subtitle: `${salesDealsCount ?? 0} fichas ganhas`,
            icon: 'iconoir-cart',
            iconBgClass: 'bg-soft-success',
            iconColorClass: 'text-success',
            variant: 'social',
            empty: !hasSales,
            emptyTitle: 'Nenhuma venda no mês.',
            emptyIcon: 'iconoir-cart',
            emptyActionLabel: 'Ver pedidos',
            emptyActionHref: '/orders',
          },
          {
            id: 'sales-revenue',
            label: 'Faturamento',
            value: formatCurrency(monthRevenue),
            href: '/orders?status=closed',
            icon: 'iconoir-wallet',
            iconBgClass: 'bg-soft-primary',
            iconColorClass: 'text-primary',
            variant: 'social',
            empty: !hasSales,
            emptyTitle: 'Sem faturamento no mês.',
            emptyIcon: 'iconoir-wallet',
          },
          {
            id: 'sales-margin',
            label: 'Lucro bruto',
            value: formatCurrency(monthMargin),
            subtitle: averageMarginPercent ? `${averageMarginPercent.toFixed(1)}% margem` : undefined,
            href: '/finance/dre',
            icon: 'iconoir-coins',
            iconBgClass: 'bg-soft-warning',
            iconColorClass: 'text-warning',
            variant: 'social',
            empty: !hasSales,
            emptyTitle: 'Sem lucro registrado.',
            emptyIcon: 'iconoir-coins',
          },
          {
            id: 'stock-count',
            label: 'Em estoque',
            value: stockCount,
            suffix: 'veículos',
            href: '/inventory?status=in_stock',
            subtitle: formatCurrency(stockValue),
            icon: 'iconoir-car',
            iconBgClass: 'bg-soft-info',
            iconColorClass: 'text-info',
            variant: 'social',
            empty: !hasStock,
            emptyTitle: 'Nenhum veículo em estoque.',
            emptyIcon: 'iconoir-car',
            emptyActionLabel: 'Cadastro rápido',
            emptyActionHref: '/inventory/quick',
          },
        ]}
      />

      <DashboardCharts
        dailySales={dailySales}
        channelMetrics={channelMetrics}
        stockAging={stockAging}
        sellerMetrics={sellerMetrics}
        funnel={{
          leads: monthLeadsCount ?? 0,
          open: openDealsCount ?? 0,
          won: salesDealsCount ?? 0,
          lost: lostDealsCount ?? 0,
        }}
      />

      <div className="row animate-stagger">
        <div className="col-xl-4 mb-3">
          <Card animate={false} title="Pendências">
            {pendingTotal > 0 ? (
              <ul className="list-group list-group-flush">
                {(deliveryPendingCount ?? 0) > 0 ? (
                  <li className="list-group-item d-flex justify-content-between px-0">
                    <Link href="/orders/pending">Entrega</Link>
                    <span className="badge bg-soft-warning">{deliveryPendingCount}</span>
                  </li>
                ) : null}
                {(demandQueueCount ?? 0) > 0 ? (
                  <li className="list-group-item d-flex justify-content-between px-0">
                    <Link href="/crm/demand-queue">Fila demanda</Link>
                    <span className="badge bg-soft-warning">{demandQueueCount}</span>
                  </li>
                ) : null}
                {(preparationPendingCount ?? 0) > 0 ? (
                  <li className="list-group-item d-flex justify-content-between px-0">
                    <Link href="/inventory/preparation">Preparação/OS</Link>
                    <span className="badge bg-soft-warning">{preparationPendingCount}</span>
                  </li>
                ) : null}
                {(pendingEvaluationsCount ?? 0) > 0 ? (
                  <li className="list-group-item d-flex justify-content-between px-0">
                    <Link href="/crm/evaluation">Avaliações</Link>
                    <span className="badge bg-soft-warning">{pendingEvaluationsCount}</span>
                  </li>
                ) : null}
                {(overdueActivitiesCount ?? 0) > 0 ? (
                  <li className="list-group-item d-flex justify-content-between px-0">
                    <Link href="/agenda">Atividades atrasadas</Link>
                    <span className="badge bg-soft-danger">{overdueActivitiesCount}</span>
                  </li>
                ) : null}
                {(alertsCount ?? 0) > 0 ? (
                  <li className="list-group-item d-flex justify-content-between px-0">
                    <Link href="/alerts">Alertas</Link>
                    <span className="badge bg-soft-danger">{alertsCount}</span>
                  </li>
                ) : null}
              </ul>
            ) : (
              <EmptyState title="Nenhuma pendência no momento." icon="iconoir-check-circle" compact />
            )}
          </Card>
        </div>
        <div className="col-xl-4 mb-3">
          <Card
            animate={false}
            title="Próximas atividades"
            actions={
              <Link href="/agenda" className="btn btn-light btn-sm">
                <i className="iconoir-eye me-1" aria-hidden="true" />
                Ver agenda
              </Link>
            }
          >
            {((upcomingActivities ?? []) as DashboardActivityRow[]).length ? (
              <ul className="list-group list-group-flush">
                {((upcomingActivities ?? []) as DashboardActivityRow[]).map((activity) => {
                  const deal = joinOne(activity.deals);
                  const person = joinOne(activity.people);
                  return (
                    <li key={activity.id} className="list-group-item px-0">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <strong>{activity.title}</strong>
                          <div className="text-muted small">
                            {person?.full_name ?? '—'}
                            {deal ? (
                              <>
                                {' '}
                                ·{' '}
                                <Link href={`/crm/${deal.id}`}>{formatDealNumber(deal.deal_number)}</Link>
                              </>
                            ) : null}
                          </div>
                        </div>
                        <span className={`badge ${activity.status === 'overdue' ? 'bg-soft-danger' : 'bg-soft-warning'}`}>
                          {new Date(activity.due_at).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <EmptyState title="Nenhuma atividade pendente." icon="iconoir-calendar" compact />
            )}
          </Card>
        </div>
        <div className="col-xl-4 mb-3">
          <Card
            animate={false}
            title="Alertas recentes"
            actions={
              <Link href="/alerts" className="btn btn-light btn-sm">
                <i className="iconoir-eye me-1" aria-hidden="true" />
                Ver todos
              </Link>
            }
          >
            {((recentAlerts ?? []) as DashboardAlertRow[]).length ? (
              <ul className="list-group list-group-flush">
                {((recentAlerts ?? []) as DashboardAlertRow[]).map((alert) => (
                  <li key={alert.id} className="list-group-item px-0">
                    {alert.href ? <Link href={alert.href}>{alert.title}</Link> : <span>{alert.title}</span>}
                    <div className="text-muted small">{new Date(alert.created_at).toLocaleString('pt-BR')}</div>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState title="Nenhum alerta ativo." icon="iconoir-bell" compact />
            )}
          </Card>
        </div>
      </div>

      <Card
        animate={false}
        title="Fichas abertas recentes"
        actions={
          <Link href="/crm?status=open" className="btn btn-light btn-sm">
            <i className="iconoir-eye me-1" aria-hidden="true" />
            Ver CRM
          </Link>
        }
      >
        <div className="table-responsive">
          <table className="table table-sm table-hover mb-0">
            <thead>
              <tr>
                <th>Ficha</th>
                <th>Cliente</th>
                <th>Etapa</th>
                <th>Próxima ação</th>
              </tr>
            </thead>
            <tbody>
              {((recentDeals ?? []) as DashboardDealRow[]).length ? (
                ((recentDeals ?? []) as DashboardDealRow[]).map((deal) => {
                  const person = joinOne(deal.people);
                  const stage = joinOne(deal.deal_stages);
                  return (
                    <tr key={deal.id}>
                      <td>
                        <Link href={`/crm/${deal.id}`}>{formatDealNumber(deal.deal_number)}</Link>
                      </td>
                      <td>{person?.full_name ?? '—'}</td>
                      <td>{stage?.name ?? '—'}</td>
                      <td>
                        {deal.next_action_at ? (
                          new Date(deal.next_action_at).toLocaleDateString('pt-BR')
                        ) : (
                          <span className="text-danger">Pendente</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <TableEmptyRow
                  colSpan={4}
                  title="Nenhuma ficha aberta."
                  icon="iconoir-page"
                  actionLabel="Abrir Nova Ficha"
                  actionHref="/crm/new"
                />
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
