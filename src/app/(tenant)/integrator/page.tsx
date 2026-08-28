import Link from 'next/link';
import { PageTitle } from '@/components/dastone/PageTitle';
import { Card } from '@/components/dastone/Card';
import { KpiGrid } from '@/components/dastone/KpiGrid';
import { PortalAdsTable } from '@/components/integrator/PortalAdsTable';
import { createClient } from '@/lib/supabase/server';
import { TableEmptyRow } from '@/components/dastone/EmptyState';
import { StatusBadge } from '@/components/dastone/TableBadge';
import {
  formatSyncStatus,
  joinOne,
  type PortalAdListRow,
  type PortalAdTableRow,
  type PortalIntegrationRow,
} from '@/types/integrator';

function mapPortalAdRows(ads: PortalAdListRow[]): PortalAdTableRow[] {
  return ads.map((ad) => {
    const passage = joinOne(ad.vehicle_passages);
    const vehicle = joinOne(passage?.vehicles ?? null);
    const brand = joinOne(vehicle?.vehicle_brands ?? null);
    const model = joinOne(vehicle?.vehicle_models ?? null);
    const portal = joinOne(ad.portal_integrations);

    return {
      id: ad.id,
      portalName: portal?.portal_name ?? '—',
      plate: vehicle?.plate ?? '—',
      vehicleLabel: [brand?.name, model?.name].filter(Boolean).join(' ') || '—',
      passageHref: passage?.id ? `/inventory/${passage.id}` : '',
      status: ad.status,
      externalId: ad.external_id ?? '—',
      publishedAt: ad.published_at
        ? new Date(ad.published_at).toLocaleString('pt-BR')
        : '—',
      lastSyncAt: ad.last_sync_at
        ? new Date(ad.last_sync_at).toLocaleString('pt-BR')
        : '—',
      syncMessage: ad.sync_message ?? '—',
    };
  });
}

export default async function IntegratorPage() {
  const supabase = await createClient();

  const { data: integrationsData } = await supabase
    .from('portal_integrations')
    .select('id, portal_slug, portal_name, is_active, last_sync_at, sync_status, sync_message')
    .order('portal_name');

  const { data: adsData } = await supabase
    .from('vehicle_portal_ads')
    .select(`
      id,
      status,
      external_id,
      published_at,
      last_sync_at,
      sync_message,
      created_at,
      vehicle_passages:passage_id (
        id,
        passage_number,
        vehicles:vehicle_id (
          plate,
          vehicle_brands:brand_id ( name ),
          vehicle_models:model_id ( name )
        )
      ),
      portal_integrations:portal_integration_id ( portal_name, portal_slug )
    `)
    .order('created_at', { ascending: false })
    .limit(200);

  const integrations = (integrationsData ?? []) as PortalIntegrationRow[];
  const ads = mapPortalAdRows((adsData ?? []) as PortalAdListRow[]);
  const activeIntegrations = integrations.filter((item) => item.is_active).length;
  const publishedAds = ads.filter((item) => item.status === 'published').length;
  const pendingAds = ads.filter((item) => item.status === 'pending').length;

  return (
    <>
      <PageTitle
        title="Integrador"
        subtitle="Publicação em portais de anúncios"
        breadcrumbs={[{ label: 'Integrador' }]}
        actions={
          <Link href="/inventory" className="btn btn-light btn-sm">
            <i className="iconoir-eye me-1" aria-hidden="true" />
            Ver estoque
          </Link>
        }
      />
      <KpiGrid
        items={[
          { id: 'integrations', label: 'Portais ativos', value: activeIntegrations },
          { id: 'published', label: 'Anúncios publicados', value: publishedAds },
          { id: 'pending', label: 'Anúncios pendentes', value: pendingAds },
          { id: 'total', label: 'Total de anúncios', value: ads.length },
        ]}
      />
      <Card title="Portais configurados">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead>
              <tr>
                <th>Portal</th>
                <th>Status</th>
                <th>Sync</th>
                <th>Última sync</th>
                <th>Mensagem</th>
              </tr>
            </thead>
            <tbody>
              {integrations.length ? (
                integrations.map((integration) => (
                  <tr key={integration.id}>
                    <td>{integration.portal_name}</td>
                    <td>
                      <StatusBadge
                        label={integration.is_active ? 'Ativo' : 'Inativo'}
                        active={integration.is_active}
                      />
                    </td>
                    <td>
                      <StatusBadge
                        status={integration.sync_status}
                        label={formatSyncStatus(integration.sync_status)}
                      />
                    </td>
                    <td>
                      {integration.last_sync_at
                        ? new Date(integration.last_sync_at).toLocaleString('pt-BR')
                        : '—'}
                    </td>
                    <td>{integration.sync_message ?? '—'}</td>
                  </tr>
                ))
              ) : (
                <TableEmptyRow
                  colSpan={5}
                  title="Nenhum portal configurado."
                  icon="iconoir-globe"
                />
              )}
            </tbody>
          </table>
        </div>
      </Card>
      <Card title="Anúncios por veículo" className="mt-3">
        <PortalAdsTable rows={ads} />
      </Card>
    </>
  );
}
