import { PageTitle } from '@/components/dastone/PageTitle';
import { Card } from '@/components/dastone/Card';
import { createClient } from '@/lib/supabase/server';
import { formatSubscriptionStatus, joinOne, type MasterCrmRow } from '@/types/master';

export default async function MasterCrmPage() {
  const supabase = await createClient();

  const [{ data: tenantsData }, { data: subscriptionsData }, { data: plansData }, { data: checklistData }] =
    await Promise.all([
      supabase
        .from('tenants')
        .select('id, name, email, phone, is_active, created_at')
        .order('created_at', { ascending: false }),
      supabase.from('subscriptions').select('id, tenant_id, status, started_at, plan_id'),
      supabase.from('plans').select('id, name, price_monthly'),
      supabase.from('tenant_onboarding_checklist').select('id, tenant_id, step_label, is_completed'),
    ]);

  const planMap = new Map((plansData ?? []).map((plan) => [plan.id, plan]));
  const subscriptionMap = new Map<string, MasterCrmRow['subscriptions']>();

  (subscriptionsData ?? []).forEach((subscription) => {
    subscriptionMap.set(subscription.tenant_id, {
      id: subscription.id,
      status: subscription.status,
      started_at: subscription.started_at,
      plans: planMap.get(subscription.plan_id) ?? null,
    });
  });

  const checklistMap = new Map<string, MasterCrmRow['tenant_onboarding_checklist']>();
  (checklistData ?? []).forEach((item) => {
    const current = checklistMap.get(item.tenant_id) ?? [];
    current.push({
      id: item.id,
      step_label: item.step_label,
      is_completed: item.is_completed,
    });
    checklistMap.set(item.tenant_id, current);
  });

  const tenants = (tenantsData ?? []).map((tenant) => ({
    ...tenant,
    subscriptions: subscriptionMap.get(tenant.id) ?? null,
    tenant_onboarding_checklist: checklistMap.get(tenant.id) ?? null,
  })) as MasterCrmRow[];

  return (
    <>
      <PageTitle
        title="CRM Master"
        subtitle="Prospect → cliente"
        breadcrumbs={[
          { label: 'Master', href: '/master' },
          { label: 'CRM' },
        ]}
      />
      <Card title="Pipeline de lojas">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead>
              <tr>
                <th>Loja</th>
                <th>Contato</th>
                <th>Estágio</th>
                <th>Plano</th>
                <th>Implantação</th>
                <th>Criada em</th>
              </tr>
            </thead>
            <tbody>
              {tenants.length ? (
                tenants.map((tenant) => {
                  const subscription = joinOne(tenant.subscriptions);
                  const plan = joinOne(subscription?.plans ?? null);
                  const checklist = tenant.tenant_onboarding_checklist ?? [];
                  const completedSteps = checklist.filter((step) => step.is_completed).length;
                  const totalSteps = checklist.length;
                  const stage = !tenant.is_active
                    ? 'Prospect'
                    : subscription?.status === 'active'
                      ? 'Cliente ativo'
                      : subscription
                        ? formatSubscriptionStatus(subscription.status)
                        : 'Sem assinatura';

                  return (
                    <tr key={tenant.id}>
                      <td>{tenant.name}</td>
                      <td>
                        {tenant.email ?? '—'}
                        {tenant.phone ? <small className="text-muted d-block">{tenant.phone}</small> : null}
                      </td>
                      <td>{stage}</td>
                      <td>{plan?.name ?? '—'}</td>
                      <td>
                        {totalSteps ? `${completedSteps}/${totalSteps} etapas` : '—'}
                      </td>
                      <td>{new Date(tenant.created_at).toLocaleDateString('pt-BR')}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="text-center text-muted py-4">
                    Nenhuma loja no pipeline.
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
