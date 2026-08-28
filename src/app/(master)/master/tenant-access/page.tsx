import { PageTitle } from '@/components/dastone/PageTitle';
import { Card } from '@/components/dastone/Card';
import { MasterTenantAccessButton } from '@/components/master/MasterTenantAccessButton';
import { createClient } from '@/lib/supabase/server';
import { TableEmptyRow } from '@/components/dastone/EmptyState';

export default async function MasterTenantAccessPage() {
  const supabase = await createClient();

  const { data: tenants } = await supabase
    .from('tenants')
    .select('id, name, slug, is_active, email, phone')
    .order('name');

  return (
    <>
      <PageTitle
        title="Acesso ao tenant"
        subtitle="Entrar na loja como master"
        breadcrumbs={[{ label: 'Master' }, { label: 'Acesso ao tenant' }]}
      />
      <Card>
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead>
              <tr>
                <th>Loja</th>
                <th>Slug</th>
                <th>Contato</th>
                <th>Status</th>
                <th>Ação</th>
              </tr>
            </thead>
            <tbody>
              {tenants?.length ? (
                tenants.map((tenant) => (
                  <tr key={tenant.id}>
                    <td>{tenant.name}</td>
                    <td>{tenant.slug}</td>
                    <td>{tenant.email ?? tenant.phone ?? '—'}</td>
                    <td>{tenant.is_active ? 'Ativa' : 'Inativa'}</td>
                    <td>
                      {tenant.is_active ? (
                        <MasterTenantAccessButton tenantId={tenant.id} tenantName={tenant.name} />
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <TableEmptyRow
                  colSpan={5}
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
