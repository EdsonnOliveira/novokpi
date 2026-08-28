import { PageTitle } from '@/components/dastone/PageTitle';
import { Card } from '@/components/dastone/Card';
import { TenantsTable } from '@/components/master/TenantsTable';
import { createClient } from '@/lib/supabase/server';
import type { TenantListRow } from '@/types/master';

export default async function MasterTenantsPage() {
  const supabase = await createClient();

  const [{ data: tenantsData }, { data: subscriptionsData }, { data: plansData }] = await Promise.all([
    supabase
      .from('tenants')
      .select('id, name, slug, document, phone, email, is_active, created_at')
      .order('created_at', { ascending: false }),
    supabase.from('subscriptions').select('id, tenant_id, status, started_at, plan_id'),
    supabase.from('plans').select('id, name, price_monthly'),
  ]);

  const planMap = new Map((plansData ?? []).map((plan) => [plan.id, plan]));
  const subscriptionMap = new Map<string, TenantListRow['subscriptions']>();

  (subscriptionsData ?? []).forEach((subscription) => {
    const plan = planMap.get(subscription.plan_id);
    subscriptionMap.set(subscription.tenant_id, {
      id: subscription.id,
      status: subscription.status,
      started_at: subscription.started_at,
      plans: plan ?? null,
    });
  });

  const tenants = (tenantsData ?? []).map((tenant) => ({
    ...tenant,
    subscriptions: subscriptionMap.get(tenant.id) ?? null,
  })) as Array<TenantListRow & Record<string, unknown>>;

  return (
    <>
      <PageTitle
        title="Lojas"
        subtitle="Gestão de tenants"
        breadcrumbs={[
          { label: 'Master', href: '/master' },
          { label: 'Lojas' },
        ]}
      />
      <Card title="Lojas cadastradas">
        <TenantsTable tenants={tenants} />
      </Card>
    </>
  );
}
