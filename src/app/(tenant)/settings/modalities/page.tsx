import { PageTitle } from '@/components/dastone/PageTitle';
import { Card } from '@/components/dastone/Card';
import { CatalogPanel } from '@/components/settings/CatalogPanel';
import { createClient } from '@/lib/supabase/server';
import type { CatalogRow } from '@/types/settings';

export default async function SettingsModalitiesPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from('stock_modalities')
    .select('id, name, slug, is_active, sort_order, created_at')
    .order('sort_order')
    .order('name');

  const rows = (data ?? []) as CatalogRow[];

  return (
    <>
      <PageTitle
        title="Modalidades"
        subtitle="Tipos e modalidades de estoque"
        breadcrumbs={[
          { label: 'Configurações', href: '/settings' },
          { label: 'Modalidades' },
        ]}
      />
      <Card title="Modalidades cadastradas">
        <CatalogPanel table="stock_modalities" rows={rows} hasSlug hasSortOrder />
      </Card>
    </>
  );
}
