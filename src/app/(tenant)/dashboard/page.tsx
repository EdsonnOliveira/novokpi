import Link from 'next/link';
import { PageTitle } from '@/components/dastone/PageTitle';
import { Card } from '@/components/dastone/Card';
import { KpiGrid } from '@/components/dastone/KpiGrid';
import { createClient } from '@/lib/supabase/server';
import {
  averageNumbers,
  buildAverageStockDays,
  buildChannelMetrics,
  buildPortalAdStatusMetrics,
  buildSellerMetrics,
  buildStockAgingBuckets,
  countPassagesWithoutPublishedAds,
  formatPortalAdStatus,
  getMonthStartDate,
  getMonthStartIso,
  getTodayDate,
  sumNumbers,
  sumPendingOverdueAmount,
} from '@/lib/dashboard/metrics';
import { formatCurrency, getStockAgeBadgeClass, getStockAgeDays, joinOne } from '@/types/inventory';

function formatDealNumber(value: number) {
  return `#${String(value).padStart(6, '0')}`;
}

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

interface DashboardOrderRow {
  id: string;
  total_value: number | null;
  margin_value: number | null;
  margin_percent: number | null;
  channel_id: string | null;
  closed_at: string | null;
  primary_payment_method: string | null;
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
  passage_number: number;
  status: string;
  cost: number | null;
  sale_price: number | null;
  stock_started_at: string;
  stock_modalities: { name: string; slug: string } | { name: string; slug: string }[] | null;
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
  title: string | null;
  status: string;
  created_at: string;
  next_action_at: string | null;
  people: { full_name: string } | { full_name: string }[] | null;
  deal_stages: { name: string } | { name: string }[] | null;
}

interface DashboardPortalAdRow {
  passage_id: string;
  status: string;
}

interface DashboardPreparationRow {
  actual_cost: number | null;
}

interface DashboardOverdueTransactionRow {
  transaction_type: string;
  amount: number | null;
  paid_amount: number | null;
  due_date: string | null;
}

interface DashboardAccountRow {
  id: string;
  name: string;
  current_balance: number | null;
}

interface DashboardAlertRow {
  id: string;
  title: string;
  level: string;
  href: string | null;
  created_at: string;
}

interface DashboardTransactionRow {
  transaction_type: string;
  paid_amount: number | null;
  amount: number | null;
  status: string;
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const monthStart = getMonthStartIso();
  const monthStartDate = getMonthStartDate();
  const today = getTodayDate();

  const [
    { data: monthOrders },
    { data: sellerOrders },
    { count: salesDealsCount },
    { count: lostDealsCount },
    { count: monthLeadsCount },
    { data: stockPassages },
    { count: openDealsCount },
    { count: dealsWithoutNextActionCount },
    { data: accounts },
    { data: monthTransactions },
    { count: pendingTransactionsCount },
    { data: overdueTransactions },
    { count: overdueActivitiesCount },
    { count: alertsCount },
    { data: recentAlerts },
    { data: upcomingActivities },
    { data: recentDeals },
    { count: demandQueueCount },
    { count: deliveryPendingCount },
    { count: reservedCount },
    { count: preparationPendingCount },
    { count: opportunitiesCount },
    { data: portalAds },
    { count: pendingEvaluationsCount },
    { data: monthPreparationOrders },
    { count: tradeInOrdersCount },
  ] = await Promise.all([
    supabase
      .from('orders')
      .select('id, total_value, margin_value, margin_percent, channel_id, closed_at, primary_payment_method, channels:channel_id ( name )')
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
      .select('id, passage_number, status, cost, sale_price, stock_started_at, stock_modalities:modality_id ( name, slug )')
      .in('status', ['in_stock', 'reserved', 'temporarily_out']),
    supabase.from('deals').select('*', { count: 'exact', head: true }).eq('status', 'open'),
    supabase.from('deals').select('*', { count: 'exact', head: true }).eq('status', 'open').is('next_action_at', null),
    supabase.from('financial_accounts').select('id, name, current_balance').eq('is_active', true).order('name'),
    supabase
      .from('financial_transactions')
      .select('transaction_type, paid_amount, amount, status')
      .gte('transaction_date', monthStartDate)
      .in('status', ['paid', 'partial']),
    supabase.from('financial_transactions').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase
      .from('financial_transactions')
      .select('transaction_type, amount, paid_amount, due_date')
      .eq('status', 'pending')
      .not('due_date', 'is', null)
      .lt('due_date', today),
    supabase.from('activities').select('*', { count: 'exact', head: true }).eq('status', 'overdue'),
    supabase.from('tenant_alerts').select('*', { count: 'exact', head: true }).eq('is_dismissed', false),
    supabase
      .from('tenant_alerts')
      .select('id, title, level, href, created_at')
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
      .select('id, deal_number, title, status, created_at, next_action_at, people:person_id ( full_name ), deal_stages:stage_id ( name )')
      .eq('status', 'open')
      .order('created_at', { ascending: false })
      .limit(6),
    supabase.from('demand_queue').select('*', { count: 'exact', head: true }).eq('status', 'waiting'),
    supabase.from('delivery_pendencies').select('*', { count: 'exact', head: true }).eq('is_resolved', false),
    supabase.from('vehicle_passages').select('*', { count: 'exact', head: true }).eq('status', 'reserved'),
    supabase
      .from('preparation_orders')
      .select('*', { count: 'exact', head: true })
      .in('status', ['pending', 'in_progress']),
    supabase.from('opportunities').select('*', { count: 'exact', head: true }).eq('status', 'open'),
    supabase.from('vehicle_portal_ads').select('passage_id, status'),
    supabase.from('evaluations').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase
      .from('preparation_orders')
      .select('actual_cost')
      .gte('created_at', monthStart)
      .neq('status', 'cancelled'),
    supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'closed')
      .gte('closed_at', monthStart)
      .eq('primary_payment_method', 'trade_vehicle'),
  ]);

  const orders = (monthOrders ?? []) as DashboardOrderRow[];
  const passages = (stockPassages ?? []) as DashboardPassageRow[];
  const monthRevenue = sumNumbers(orders.map((order) => order.total_value));
  const monthMargin = sumNumbers(orders.map((order) => order.margin_value));
  const averageTicket = orders.length ? monthRevenue / orders.length : 0;
  const averageMarginPercent = averageNumbers(
    orders.map((order) => Number(order.margin_percent ?? 0)).filter((value) => value > 0),
  );
  const tradeInPercent = orders.length ? ((tradeInOrdersCount ?? 0) / orders.length) * 100 : 0;
  const stockValue = sumNumbers(passages.map((passage) => passage.cost));
  const stockCount = passages.filter((passage) => passage.status === 'in_stock').length;
  const stockAging = buildStockAgingBuckets(passages);
  const stockAbove60 = stockAging.from61To90 + stockAging.above90;
  const averageStockDays = buildAverageStockDays(passages);
  const channelMetrics = buildChannelMetrics(orders);
  const sellerMetrics = buildSellerMetrics((sellerOrders ?? []) as DashboardSellerOrderRow[]);
  const portalAdMetrics = buildPortalAdStatusMetrics((portalAds ?? []) as DashboardPortalAdRow[]);
  const publishedPassageIds = new Set(
    ((portalAds ?? []) as DashboardPortalAdRow[])
      .filter((ad) => ad.status === 'published')
      .map((ad) => ad.passage_id),
  );
  const withoutAdCount = countPassagesWithoutPublishedAds(passages, publishedPassageIds);
  const avgPreparationCost = averageNumbers(
    ((monthPreparationOrders ?? []) as DashboardPreparationRow[])
      .map((item) => Number(item.actual_cost ?? 0))
      .filter((value) => value > 0),
  );

  let monthIncome = 0;
  let monthExpense = 0;
  monthTransactions?.forEach((transaction) => {
    const row = transaction as DashboardTransactionRow;
    const value = Number(row.paid_amount || row.amount);
    if (row.transaction_type === 'income') monthIncome += value;
    else monthExpense += value;
  });

  const balance = ((accounts ?? []) as DashboardAccountRow[]).reduce(
    (sum, item) => sum + Number(item.current_balance ?? 0),
    0,
  );
  const overdueReceivable = sumPendingOverdueAmount(
    ((overdueTransactions ?? []) as DashboardOverdueTransactionRow[]).filter(
      (item) => item.transaction_type === 'income',
    ),
  );
  const overduePayable = sumPendingOverdueAmount(
    ((overdueTransactions ?? []) as DashboardOverdueTransactionRow[]).filter(
      (item) => item.transaction_type === 'expense',
    ),
  );

  const ownStockCount = passages.filter((passage) => {
    const modality = joinOne(passage.stock_modalities);
    return passage.status === 'in_stock' && modality?.slug === 'purchase';
  }).length;

  const consignmentCount = passages.filter((passage) => {
    const modality = joinOne(passage.stock_modalities);
    return passage.status === 'in_stock' && (modality?.slug === 'consignment' || modality?.slug === 'online_consignment');
  }).length;

  const conversionRate =
    (monthLeadsCount ?? 0) > 0 ? ((salesDealsCount ?? 0) / (monthLeadsCount ?? 1)) * 100 : 0;

  return (
    <>
      <PageTitle
        title="Dashboard"
        subtitle="Visão geral da loja"
        breadcrumbs={[{ label: 'Novo KPI' }, { label: 'Dashboard' }]}
        actions={
          <div className="d-flex flex-wrap gap-2">
            <Link href="/reports" className="btn btn-light btn-sm">
              Relatórios
            </Link>
            <Link href="/crm/new" className="btn btn-primary btn-sm">
              Nova Ficha
            </Link>
          </div>
        }
      />

      <h6 className="text-muted mb-2">Vendas do mês</h6>
      <KpiGrid
        columns={4}
        items={[
          {
            id: 'sales-count',
            label: 'Vendas fechadas',
            value: orders.length,
            href: '/orders?status=closed',
            subtitle: `${salesDealsCount ?? 0} fichas ganhas`,
          },
          {
            id: 'sales-revenue',
            label: 'Faturamento',
            value: formatCurrency(monthRevenue),
            href: '/orders?status=closed',
          },
          {
            id: 'sales-margin',
            label: 'Lucro bruto',
            value: formatCurrency(monthMargin),
            subtitle: averageMarginPercent ? `${averageMarginPercent.toFixed(1)}% margem` : undefined,
            href: '/finance/dre',
          },
          {
            id: 'sales-ticket',
            label: 'Ticket médio',
            value: formatCurrency(averageTicket),
            href: '/orders?status=closed',
          },
          {
            id: 'sales-trade-in',
            label: 'Trade-in nas vendas',
            value: formatPercent(tradeInPercent),
            subtitle: `${tradeInOrdersCount ?? 0} com troca`,
            href: '/orders?status=closed',
          },
          {
            id: 'sales-prep-cost',
            label: 'Custo médio preparação',
            value: avgPreparationCost ? formatCurrency(avgPreparationCost) : '—',
            href: '/inventory/preparation',
          },
        ]}
      />

      <h6 className="text-muted mb-2">Estoque</h6>
      <KpiGrid
        columns={4}
        items={[
          {
            id: 'stock-count',
            label: 'Em estoque',
            value: stockCount,
            href: '/inventory?status=in_stock',
          },
          {
            id: 'stock-value',
            label: 'Valor investido',
            value: formatCurrency(stockValue),
            href: '/inventory?status=in_stock',
          },
          {
            id: 'stock-own',
            label: 'Estoque próprio',
            value: ownStockCount,
            href: '/inventory?status=in_stock',
          },
          {
            id: 'stock-consignment',
            label: 'Consignados',
            value: consignmentCount,
            href: '/inventory?status=in_stock',
          },
          {
            id: 'stock-reserved',
            label: 'Reservados',
            value: reservedCount ?? 0,
            href: '/inventory?status=reserved',
          },
          {
            id: 'stock-aging-days',
            label: 'Dias médios em estoque',
            value: averageStockDays ? `${Math.round(averageStockDays)}d` : '—',
            href: '/inventory?status=in_stock',
          },
          {
            id: 'stock-aging',
            label: 'Acima de 60 dias',
            value: stockAbove60,
            href: '/inventory?aging=61-90',
            badgeClass: stockAbove60 > 0 ? 'text-danger' : undefined,
          },
          {
            id: 'stock-no-ad',
            label: 'Sem anúncio publicado',
            value: withoutAdCount,
            href: '/integrator',
            badgeClass: withoutAdCount > 0 ? 'text-warning' : undefined,
          },
        ]}
      />

      <h6 className="text-muted mb-2">CRM e operação</h6>
      <KpiGrid
        columns={4}
        items={[
          {
            id: 'crm-leads',
            label: 'Leads do mês',
            value: monthLeadsCount ?? 0,
            href: '/crm',
          },
          {
            id: 'crm-open',
            label: 'Fichas abertas',
            value: openDealsCount ?? 0,
            href: '/crm?status=open',
          },
          {
            id: 'crm-conversion',
            label: 'Conversão do mês',
            value: formatPercent(conversionRate),
            href: '/crm?status=open',
          },
          {
            id: 'crm-no-action',
            label: 'Sem próxima ação',
            value: dealsWithoutNextActionCount ?? 0,
            href: '/crm?no_action=1',
          },
          {
            id: 'crm-lost',
            label: 'Perdidas no mês',
            value: lostDealsCount ?? 0,
            href: '/crm/lost-sales',
          },
          {
            id: 'crm-overdue',
            label: 'Atividades atrasadas',
            value: overdueActivitiesCount ?? 0,
            href: '/agenda',
            badgeClass: (overdueActivitiesCount ?? 0) > 0 ? 'text-danger' : undefined,
          },
          {
            id: 'crm-evaluations',
            label: 'Avaliações pendentes',
            value: pendingEvaluationsCount ?? 0,
            href: '/crm/evaluation',
            badgeClass: (pendingEvaluationsCount ?? 0) > 0 ? 'text-warning' : undefined,
          },
        ]}
      />

      <h6 className="text-muted mb-2">Financeiro</h6>
      <KpiGrid
        columns={4}
        items={[
          {
            id: 'finance-balance',
            label: 'Saldo total',
            value: formatCurrency(balance),
            href: '/finance',
          },
          {
            id: 'finance-income',
            label: 'Receitas do mês',
            value: formatCurrency(monthIncome),
            href: '/finance/transactions',
            badgeClass: 'text-success',
          },
          {
            id: 'finance-expense',
            label: 'Despesas do mês',
            value: formatCurrency(monthExpense),
            href: '/finance/transactions',
            badgeClass: 'text-danger',
          },
          {
            id: 'finance-pending',
            label: 'Lançamentos pendentes',
            value: pendingTransactionsCount ?? 0,
            href: '/finance/transactions',
          },
          {
            id: 'finance-overdue-in',
            label: 'A receber vencido',
            value: formatCurrency(overdueReceivable),
            href: '/finance/transactions',
            badgeClass: overdueReceivable > 0 ? 'text-danger' : undefined,
          },
          {
            id: 'finance-overdue-out',
            label: 'A pagar vencido',
            value: formatCurrency(overduePayable),
            href: '/finance/transactions',
            badgeClass: overduePayable > 0 ? 'text-danger' : undefined,
          },
        ]}
      />

      <div className="row animate-stagger">
        <div className="col-xl-4 mb-3">
          <Card animate={false} title="Vendas por canal">
            <div className="table-responsive">
              <table className="table table-sm table-hover mb-0">
                <thead>
                  <tr>
                    <th>Canal</th>
                    <th>Qtd</th>
                    <th>Faturamento</th>
                  </tr>
                </thead>
                <tbody>
                  {channelMetrics.length ? (
                    channelMetrics.map((item) => (
                      <tr key={item.channelId ?? 'none'}>
                        <td>
                          <Link href={item.channelId ? `/orders?status=closed&channel=${item.channelId}` : '/orders?status=closed'}>
                            {item.channelName}
                          </Link>
                        </td>
                        <td>{item.salesCount}</td>
                        <td>{formatCurrency(item.revenue)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="text-muted">
                        Nenhuma venda no mês.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
        <div className="col-xl-4 mb-3">
          <Card animate={false} title="Ranking de vendedores">
            <div className="table-responsive">
              <table className="table table-sm table-hover mb-0">
                <thead>
                  <tr>
                    <th>Vendedor</th>
                    <th>Vendas</th>
                    <th>Lucro</th>
                  </tr>
                </thead>
                <tbody>
                  {sellerMetrics.length ? (
                    sellerMetrics.slice(0, 6).map((item) => (
                      <tr key={item.sellerId ?? 'none'}>
                        <td>
                          <Link href={item.sellerId ? `/orders?status=closed&seller=${item.sellerId}` : '/orders?status=closed'}>
                            {item.sellerName}
                          </Link>
                        </td>
                        <td>{item.salesCount}</td>
                        <td>{formatCurrency(item.margin)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="text-muted">
                        Nenhuma venda no mês.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
        <div className="col-xl-4 mb-3">
          <Card animate={false} title="Anúncios por status">
            <ul className="list-group list-group-flush">
              {portalAdMetrics.length ? (
                portalAdMetrics.map((item) => (
                  <li key={item.status} className="list-group-item d-flex justify-content-between px-0">
                    <Link href="/integrator">{formatPortalAdStatus(item.status)}</Link>
                    <span className="badge bg-soft-primary">{item.count}</span>
                  </li>
                ))
              ) : (
                <li className="list-group-item px-0 text-muted">Nenhum anúncio cadastrado.</li>
              )}
            </ul>
          </Card>
        </div>
      </div>

      <div className="row animate-stagger">
        <div className="col-xl-4 mb-3">
          <Card animate={false} title="Idade do estoque">
            <ul className="list-group list-group-flush">
              <li className="list-group-item d-flex justify-content-between px-0">
                <Link href="/inventory?status=in_stock&aging=0-30">Até 30 dias</Link>
                <span className="badge bg-soft-success">{stockAging.upTo30}</span>
              </li>
              <li className="list-group-item d-flex justify-content-between px-0">
                <Link href="/inventory?status=in_stock&aging=31-60">31 a 60 dias</Link>
                <span className="badge bg-soft-warning">{stockAging.from31To60}</span>
              </li>
              <li className="list-group-item d-flex justify-content-between px-0">
                <Link href="/inventory?status=in_stock&aging=61-90">61 a 90 dias</Link>
                <span className="badge bg-soft-warning">{stockAging.from61To90}</span>
              </li>
              <li className="list-group-item d-flex justify-content-between px-0">
                <Link href="/inventory?status=in_stock&aging=above90">Acima de 90 dias</Link>
                <span className="badge bg-soft-danger">{stockAging.above90}</span>
              </li>
            </ul>
          </Card>
        </div>
        <div className="col-xl-4 mb-3">
          <Card animate={false} title="Pendências operacionais">
            <ul className="list-group list-group-flush">
              <li className="list-group-item d-flex justify-content-between px-0">
                <Link href="/orders/pending">Entrega</Link>
                <span className="badge bg-soft-warning">{deliveryPendingCount ?? 0}</span>
              </li>
              <li className="list-group-item d-flex justify-content-between px-0">
                <Link href="/crm/demand-queue">Fila demanda</Link>
                <span className="badge bg-soft-warning">{demandQueueCount ?? 0}</span>
              </li>
              <li className="list-group-item d-flex justify-content-between px-0">
                <Link href="/inventory/preparation">Preparação/OS</Link>
                <span className="badge bg-soft-warning">{preparationPendingCount ?? 0}</span>
              </li>
              <li className="list-group-item d-flex justify-content-between px-0">
                <Link href="/marketing/opportunities">Oportunidades</Link>
                <span className="badge bg-soft-primary">{opportunitiesCount ?? 0}</span>
              </li>
              <li className="list-group-item d-flex justify-content-between px-0">
                <Link href="/alerts">Alertas ativos</Link>
                <span className="badge bg-soft-danger">{alertsCount ?? 0}</span>
              </li>
            </ul>
          </Card>
        </div>
        <div className="col-xl-4 mb-3">
          <Card animate={false} title="Veículos parados no estoque">
            <ul className="list-group list-group-flush">
              {passages.length ? (
                passages
                  .filter((passage) => passage.status === 'in_stock')
                  .sort((a, b) => getStockAgeDays(b.stock_started_at) - getStockAgeDays(a.stock_started_at))
                  .slice(0, 6)
                  .map((passage) => {
                    const ageDays = getStockAgeDays(passage.stock_started_at);
                    return (
                      <li key={passage.id} className="list-group-item d-flex justify-content-between px-0">
                        <Link href={`/inventory/${passage.id}`}>#{passage.passage_number}</Link>
                        <span className={`badge ${getStockAgeBadgeClass(ageDays)}`}>{ageDays}d</span>
                      </li>
                    );
                  })
              ) : (
                <li className="list-group-item px-0 text-muted">Nenhum veículo em estoque.</li>
              )}
            </ul>
          </Card>
        </div>
      </div>

      <div className="row animate-stagger">
        <div className="col-xl-6 mb-3">
          <Card animate={false}
            title="Próximas atividades"
            actions={
              <Link href="/agenda" className="btn btn-light btn-sm">
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
              <p className="text-muted mb-0">Nenhuma atividade pendente.</p>
            )}
          </Card>
        </div>
        <div className="col-xl-6 mb-3">
          <Card animate={false}
            title="Alertas recentes"
            actions={
              <Link href="/alerts" className="btn btn-light btn-sm">
                Ver todos
              </Link>
            }
          >
            {((recentAlerts ?? []) as DashboardAlertRow[]).length ? (
              <ul className="list-group list-group-flush">
                {((recentAlerts ?? []) as DashboardAlertRow[]).map((alert) => (
                  <li key={alert.id} className="list-group-item px-0">
                    {alert.href ? (
                      <Link href={alert.href}>{alert.title}</Link>
                    ) : (
                      <span>{alert.title}</span>
                    )}
                    <div className="text-muted small">{new Date(alert.created_at).toLocaleString('pt-BR')}</div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted mb-0">Nenhum alerta ativo.</p>
            )}
          </Card>
        </div>
      </div>

      <div className="row animate-stagger">
        <div className="col-xl-7 mb-3">
          <Card animate={false}
            title="Fichas abertas recentes"
            actions={
              <Link href="/crm?status=open" className="btn btn-light btn-sm">
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
                    <tr>
                      <td colSpan={4} className="text-muted">
                        Nenhuma ficha aberta.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
        <div className="col-xl-5 mb-3">
          <Card animate={false} title="Contas financeiras">
            <div className="table-responsive">
              <table className="table table-sm mb-0">
                <tbody>
                  {((accounts ?? []) as DashboardAccountRow[]).length ? (
                    ((accounts ?? []) as DashboardAccountRow[]).map((account) => (
                      <tr key={account.id}>
                        <td>
                          <Link href={`/finance/statement?account=${account.id}`}>{account.name}</Link>
                        </td>
                        <td className="text-end">{formatCurrency(account.current_balance)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={2} className="text-muted">
                        Nenhuma conta cadastrada.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>

      <Card title="Acesso rápido">
        <div className="d-flex flex-wrap gap-2">
          <Link href="/crm/new" className="btn btn-primary btn-sm">
            Nova Ficha
          </Link>
          <Link href="/inventory/quick" className="btn btn-light btn-sm">
            Cadastro rápido
          </Link>
          <Link href="/finance/transactions" className="btn btn-light btn-sm">
            Lançamento
          </Link>
          <Link href="/integrator" className="btn btn-light btn-sm">
            Integrador
          </Link>
          <Link href="/crm/kanban" className="btn btn-light btn-sm">
            Kanban
          </Link>
          <Link href="/crm/evaluation" className="btn btn-light btn-sm">
            Avaliações
          </Link>
          <Link href="/marketing/opportunities" className="btn btn-light btn-sm">
            Oportunidades
          </Link>
        </div>
      </Card>
    </>
  );
}
