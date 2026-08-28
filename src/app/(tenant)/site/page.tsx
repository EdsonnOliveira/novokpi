import { PageTitle } from '@/components/dastone/PageTitle';
import { Card } from '@/components/dastone/Card';
import { TenantSiteSettingsForm } from '@/components/site/TenantSiteSettingsForm';
import { createClient } from '@/lib/supabase/server';
import { getTenantContext } from '@/lib/settings/tenant-context';
import type { TenantSiteSettingsRow } from '@/types/platform';
import { redirect } from 'next/navigation';

export default async function SitePage() {
  const supabase = await createClient();
  const context = await getTenantContext(supabase);

  if (!context) {
    redirect('/login');
  }

  const [{ data: settingsData }, { count: inventoryCount }] = await Promise.all([
    supabase
      .from('tenant_site_settings')
      .select('id, tenant_id, domain, is_published, sync_inventory, theme, seo')
      .eq('tenant_id', context.tenantId)
      .maybeSingle(),
    supabase
      .from('tenant_site_inventory')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', context.tenantId)
      .eq('is_visible', true),
  ]);

  const settings = settingsData
    ? ({
        ...settingsData,
        theme: (settingsData.theme ?? {}) as Record<string, string>,
        seo: (settingsData.seo ?? {}) as Record<string, string>,
      } as TenantSiteSettingsRow)
    : null;

  return (
    <>
      <PageTitle
        title="Site da Loja"
        subtitle="Templates e domínio"
        breadcrumbs={[{ label: 'Site' }]}
      />
      <Card title="Configurações do site">
        <TenantSiteSettingsForm tenantId={context.tenantId} settings={settings} />
      </Card>
      <Card title="Estoque sincronizado" className="mt-3">
        <p className="mb-0">
          {inventoryCount ?? 0} veículo(s) visível(is) no site via Supabase.
        </p>
      </Card>
    </>
  );
}
