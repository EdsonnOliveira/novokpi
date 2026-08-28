import Link from 'next/link';
import { PageTitle } from '@/components/dastone/PageTitle';
import { Card } from '@/components/dastone/Card';
import { TenantSettingsForm } from '@/components/settings/TenantSettingsForm';
import { createClient } from '@/lib/supabase/server';
import { getTenantContext } from '@/lib/settings/tenant-context';
import type { TenantRow } from '@/types/platform';
import { redirect } from 'next/navigation';

export default async function SettingsPage() {
  const supabase = await createClient();
  const context = await getTenantContext(supabase);

  if (!context) {
    redirect('/login');
  }

  const { data: tenantData } = await supabase
    .from('tenants')
    .select('id, name, slug, document, phone, email, logo_url')
    .eq('id', context.tenantId)
    .single();

  const tenant = tenantData as TenantRow | null;

  if (!tenant) {
    return (
      <>
        <PageTitle title="Configurações" subtitle="Configurações gerais da loja" />
        <Card>Loja não encontrada.</Card>
      </>
    );
  }

  return (
    <>
      <PageTitle
        title="Configurações"
        subtitle="Configurações gerais da loja"
        breadcrumbs={[{ label: 'Configurações' }]}
      />
      <Card title="Dados da loja" className="mb-3">
        <TenantSettingsForm tenant={tenant} />
      </Card>
      <Card title="Outras configurações">
        <div className="d-flex flex-wrap gap-2">
          <Link href="/settings/users" className="btn btn-light btn-sm">
            Usuários
          </Link>
          <Link href="/settings/roles" className="btn btn-light btn-sm">
            Perfis
          </Link>
          <Link href="/settings/channels" className="btn btn-light btn-sm">
            Canais
          </Link>
          <Link href="/settings/modalities" className="btn btn-light btn-sm">
            Modalidades
          </Link>
          <Link href="/settings/lost-reasons" className="btn btn-light btn-sm">
            Motivos de perda
          </Link>
          <Link href="/settings/audit" className="btn btn-light btn-sm">
            Auditoria
          </Link>
        </div>
      </Card>
    </>
  );
}
