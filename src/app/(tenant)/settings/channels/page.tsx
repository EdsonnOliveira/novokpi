import { PageTitle } from '@/components/dastone/PageTitle';
import { Card } from '@/components/dastone/Card';
import { CatalogPanel } from '@/components/settings/CatalogPanel';
import { createClient } from '@/lib/supabase/server';
import type { CatalogRow } from '@/types/settings';

export default async function SettingsChannelsPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from('channels')
    .select('id, name, slug, is_active, created_at')
    .order('name');

  const rows = (data ?? []) as CatalogRow[];

  return (
    <>
      <PageTitle
        title="Origens e canais"
        subtitle="Canais de entrada de leads"
        breadcrumbs={[
          { label: 'Configurações', href: '/settings' },
          { label: 'Canais' },
        ]}
      />
      <Card title="Canais cadastrados">
        <CatalogPanel table="channels" rows={rows} hasSlug />
      </Card>
    </>
  );
}
