import Link from 'next/link';
import { PageTitle } from '@/components/dastone/PageTitle';
import { Card } from '@/components/dastone/Card';
import { KpiGrid } from '@/components/dastone/KpiGrid';
import { createClient } from '@/lib/supabase/server';
import { formatCurrency } from '@/types/master';

export default async function MasterDashboardPage() {
  const supabase = await createClient();

  const [
    { count: totalTenants },
    { count: activeTenants },
    { data: subscriptionsData },
    { data: plansData },
    { count: openTickets },
  ] = await Promise.all([
    supabase.from('tenants').select('*', { count: 'exact', head: true }),
    supabase.from('tenants').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('subscriptions').select('id, status, plan_id').eq('status', 'active'),
    supabase.from('plans').select('id, price_monthly'),
    supabase.from('master_tickets').select('*', { count: 'exact', head: true }).eq('status', 'open'),
  ]);

  const planPriceMap = new Map((plansData ?? []).map((plan) => [plan.id, plan.price_monthly]));
  const mrr = (subscriptionsData ?? []).reduce((sum, subscription) => {
    return sum + Number(planPriceMap.get(subscription.plan_id) ?? 0);
  }, 0);

  return (
    <>
      <PageTitle
        title="Dashboard SaaS"
        subtitle="MRR, lojas e operação master"
        breadcrumbs={[{ label: 'Master' }, { label: 'Dashboard' }]}
        actions={
          <Link href="/master/tenants" className="btn btn-light btn-sm">
            Ver lojas
          </Link>
        }
      />
      <KpiGrid
        columns={3}
        items={[
          {
            id: 'tenants',
            label: 'Lojas cadastradas',
            value: totalTenants ?? 0,
            href: '/master/tenants',
          },
          {
            id: 'active',
            label: 'Lojas ativas',
            value: activeTenants ?? 0,
            href: '/master/tenants',
          },
          {
            id: 'mrr',
            label: 'MRR estimado',
            value: formatCurrency(mrr),
            href: '/master/billing',
            subtitle: 'Assinaturas ativas',
          },
          {
            id: 'subscriptions',
            label: 'Assinaturas ativas',
            value: subscriptionsData?.length ?? 0,
            href: '/master/billing',
          },
          {
            id: 'tickets',
            label: 'Chamados abertos',
            value: openTickets ?? 0,
            href: '/master/support',
          },
          {
            id: 'plans',
            label: 'Planos',
            value: 'Gerenciar',
            href: '/master/plans',
          },
        ]}
      />
      <div className="row">
        <div className="col-md-6">
          <Card title="Acesso rápido">
            <div className="d-flex flex-wrap gap-2">
              <Link href="/master/crm" className="btn btn-primary btn-sm">
                CRM Master
              </Link>
              <Link href="/master/analytics" className="btn btn-light btn-sm">
                Analytics
              </Link>
              <Link href="/master/announcements" className="btn btn-light btn-sm">
                Comunicados
              </Link>
            </div>
          </Card>
        </div>
        <div className="col-md-6">
          <Card title="Operação">
            <ul className="list-unstyled mb-0">
              <li className="mb-2">
                <Link href="/master/billing">Cobrança e assinaturas</Link>
              </li>
              <li className="mb-2">
                <Link href="/master/support">Suporte master</Link>
              </li>
              <li className="mb-2">
                <Link href="/master/taxonomy">Taxonomia de veículos</Link>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </>
  );
}
