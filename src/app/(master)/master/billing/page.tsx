import { PageTitle } from '@/components/dastone/PageTitle';
import { Card } from '@/components/dastone/Card';
import { createClient } from '@/lib/supabase/server';
import { formatCurrency, formatSubscriptionStatus, joinOne, type BillingRow } from '@/types/master';

export default async function MasterBillingPage() {
  const supabase = await createClient();

  const [{ data: subscriptionsData }, { data: tenantsData }, { data: plansData }] = await Promise.all([
    supabase
      .from('subscriptions')
      .select('id, tenant_id, plan_id, status, started_at, ends_at, created_at')
      .order('created_at', { ascending: false }),
    supabase.from('tenants').select('id, name'),
    supabase.from('plans').select('id, name, price_monthly'),
  ]);

  const tenantMap = new Map((tenantsData ?? []).map((tenant) => [tenant.id, tenant]));
  const planMap = new Map((plansData ?? []).map((plan) => [plan.id, plan]));

  const subscriptions = (subscriptionsData ?? []).map((subscription) => ({
    ...subscription,
    tenants: tenantMap.get(subscription.tenant_id) ?? null,
    plans: planMap.get(subscription.plan_id) ?? null,
  })) as BillingRow[];

  const activeMrr = subscriptions
    .filter((item) => item.status === 'active')
    .reduce((sum, item) => {
      const plan = joinOne(item.plans);
      return sum + Number(plan?.price_monthly ?? 0);
    }, 0);

  return (
    <>
      <PageTitle
        title="Cobrança"
        subtitle="Assinaturas e inadimplência"
        breadcrumbs={[
          { label: 'Master', href: '/master' },
          { label: 'Cobrança' },
        ]}
      />
      <Card title="MRR ativo" className="mb-3">
        <h4 className="mb-0">{formatCurrency(activeMrr)}</h4>
      </Card>
      <Card title="Assinaturas">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead>
              <tr>
                <th>Loja</th>
                <th>Plano</th>
                <th>Valor</th>
                <th>Status</th>
                <th>Início</th>
                <th>Fim</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.length ? (
                subscriptions.map((subscription) => {
                  const tenant = joinOne(subscription.tenants);
                  const plan = joinOne(subscription.plans);

                  return (
                    <tr key={subscription.id}>
                      <td>{tenant?.name ?? '—'}</td>
                      <td>{plan?.name ?? '—'}</td>
                      <td>{formatCurrency(plan?.price_monthly ?? 0)}</td>
                      <td>{formatSubscriptionStatus(subscription.status)}</td>
                      <td>{new Date(subscription.started_at).toLocaleDateString('pt-BR')}</td>
                      <td>
                        {subscription.ends_at
                          ? new Date(subscription.ends_at).toLocaleDateString('pt-BR')
                          : '—'}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="text-center text-muted py-4">
                    Nenhuma assinatura registrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
