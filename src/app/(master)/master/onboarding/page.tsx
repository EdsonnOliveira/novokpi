import Link from 'next/link';
import { PageTitle } from '@/components/dastone/PageTitle';
import { Card } from '@/components/dastone/Card';
import { createClient } from '@/lib/supabase/server';
import { TableEmptyRow } from '@/components/dastone/EmptyState';

export default async function MasterOnboardingPage() {
  const supabase = await createClient();

  const { data: tenants } = await supabase
    .from('tenants')
    .select('id, name, slug, is_active')
    .order('name');

  const { data: checklist } = await supabase
    .from('tenant_onboarding_checklist')
    .select('id, tenant_id, step_key, step_label, is_completed, completed_at');

  return (
    <>
      <PageTitle
        title="Implantação"
        subtitle="Checklist de onboarding por loja"
        breadcrumbs={[{ label: 'Master' }, { label: 'Implantação' }]}
      />
      <Card>
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead>
              <tr>
                <th>Loja</th>
                <th>Progresso</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {tenants?.length ? (
                tenants.map((tenant) => {
                  const steps = (checklist ?? []).filter((item) => item.tenant_id === tenant.id);
                  const done = steps.filter((item) => item.is_completed).length;
                  const total = steps.length || 1;
                  return (
                    <tr key={tenant.id}>
                      <td>
                        <Link href={`/master/tenants`}>{tenant.name}</Link>
                      </td>
                      <td>
                        {done}/{total} etapas
                      </td>
                      <td>{tenant.is_active ? 'Ativa' : 'Inativa'}</td>
                    </tr>
                  );
                })
              ) : (
                <TableEmptyRow
                  colSpan={3}
                  title="Nenhuma loja cadastrada."
                  icon="iconoir-shop"
                />
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
