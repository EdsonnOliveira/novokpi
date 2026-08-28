import Link from 'next/link';
import { PageTitle } from '@/components/dastone/PageTitle';
import { KpiGrid } from '@/components/dastone/KpiGrid';
import { createClient } from '@/lib/supabase/server';
import { formatCurrency } from '@/types/master';

export default async function MasterAnalyticsPage() {
  const supabase = await createClient();

  const [
    { count: tenantCount },
    { count: dealCount },
    { count: vehicleCount },
    { data: subscriptionsData },
    { data: plansData },
    { count: ticketCount },
  ] = await Promise.all([
    supabase.from('tenants').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('deals').select('*', { count: 'exact', head: true }),
    supabase.from('vehicles').select('*', { count: 'exact', head: true }),
    supabase.from('subscriptions').select('id, status, plan_id').eq('status', 'active'),
    supabase.from('plans').select('id, price_monthly'),
    supabase.from('master_tickets').select('*', { count: 'exact', head: true }),
  ]);

  const planPriceMap = new Map((plansData ?? []).map((plan) => [plan.id, plan.price_monthly]));
  const mrr = (subscriptionsData ?? []).reduce((sum, subscription) => {
    return sum + Number(planPriceMap.get(subscription.plan_id) ?? 0);
  }, 0);

  return (
    <>
      <PageTitle
        title="Analytics"
        subtitle="Inteligência de mercado e operação"
        breadcrumbs={[
          { label: 'Master', href: '/master' },
          { label: 'Analytics' },
        ]}
        actions={
          <Link href="/master/billing" className="btn btn-light btn-sm">
            <i className="iconoir-credit-card me-1" aria-hidden="true" />
            Cobrança
          </Link>
        }
      />
      <KpiGrid
        columns={3}
        items={[
          {
            id: 'tenants',
            label: 'Lojas ativas',
            value: tenantCount ?? 0,
            href: '/master/tenants',
          },
          {
            id: 'deals',
            label: 'Fichas na plataforma',
            value: dealCount ?? 0,
          },
          {
            id: 'vehicles',
            label: 'Veículos cadastrados',
            value: vehicleCount ?? 0,
          },
          {
            id: 'mrr',
            label: 'MRR consolidado',
            value: formatCurrency(mrr),
            href: '/master/billing',
          },
          {
            id: 'subscriptions',
            label: 'Assinaturas ativas',
            value: subscriptionsData?.length ?? 0,
            href: '/master/billing',
          },
          {
            id: 'tickets',
            label: 'Chamados master',
            value: ticketCount ?? 0,
            href: '/master/support',
          },
        ]}
      />
    </>
  );
}
