import { PageTitle } from '@/components/dastone/PageTitle';
import { Card } from '@/components/dastone/Card';
import { CatalogPanel } from '@/components/settings/CatalogPanel';
import { createClient } from '@/lib/supabase/server';
import type { CatalogRow } from '@/types/settings';

export default async function SettingsLostReasonsPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from('lost_reasons')
    .select('id, name, is_active, sort_order, created_at')
    .order('sort_order')
    .order('name');

  const rows = (data ?? []) as CatalogRow[];

  return (
    <>
      <PageTitle
        title="Motivos de venda perdida"
        subtitle="Cadastro de motivos de perda"
        breadcrumbs={[
          { label: 'Configurações', href: '/settings' },
          { label: 'Motivos perda' },
        ]}
      />
      <Card title="Motivos cadastrados">
        <CatalogPanel table="lost_reasons" rows={rows} hasSortOrder />
      </Card>
    </>
  );
}
