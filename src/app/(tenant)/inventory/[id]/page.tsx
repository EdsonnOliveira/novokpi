import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PageTitle } from '@/components/dastone/PageTitle';
import { Card } from '@/components/dastone/Card';
import { TimelinePanel } from '@/components/dastone/TimelinePanel';
import { PhotoUploadPanel } from '@/components/inventory/PhotoUploadPanel';
import { ReportUploadPanel } from '@/components/inventory/ReportUploadPanel';
import { RenewStockButton } from '@/components/inventory/RenewStockButton';
import { PreparationForm } from '@/components/inventory/PreparationForm';
import { INVENTORY_TABS } from '@/components/inventory/InventoryDetailTabs';
import { getStoragePublicUrl } from '@/lib/inventory/media';
import { createClient } from '@/lib/supabase/server';
import {
  formatCurrency,
  formatMargin,
  getStockAgeBadgeClass,
  getStockAgeDays,
  joinOne,
} from '@/types/inventory';

export default async function InventoryDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { id } = await params;
  const { tab } = await searchParams;
  const activeTab = INVENTORY_TABS.some((item) => item.id === tab) ? tab! : 'summary';
  const supabase = await createClient();

  const { data: passageData } = await supabase
    .from('vehicle_passages')
    .select(`
      id,
      passage_number,
      status,
      stock_started_at,
      acquisition_cost,
      cost,
      sale_price,
      fipe_value,
      km,
      has_history_alert,
      consignment_net_value,
      consignment_percent,
      notes,
      vehicles:vehicle_id (
        id,
        plate,
        chassis,
        renavam,
        color,
        year_manufacture,
        year_model,
        vehicle_brands:brand_id ( name ),
        vehicle_models:model_id ( name ),
        vehicle_versions:version_id ( name )
      ),
      stock_modalities:modality_id ( name, slug ),
      people:owner_person_id ( full_name, phone ),
      profiles:capturer_user_id ( full_name )
    `)
    .eq('id', id)
    .maybeSingle();

  if (!passageData) {
    notFound();
  }

  const passage = passageData as {
    id: string;
    passage_number: number;
    status: string;
    stock_started_at: string;
    acquisition_cost: number;
    cost: number;
    sale_price: number | null;
    fipe_value: number | null;
    km: number | null;
    has_history_alert: boolean;
    consignment_net_value: number | null;
    consignment_percent: number | null;
    notes: string | null;
    vehicles: {
      id: string;
      plate: string | null;
      chassis: string | null;
      renavam: string | null;
      color: string | null;
      year_manufacture: number | null;
      year_model: number | null;
      vehicle_brands: { name: string } | { name: string }[] | null;
      vehicle_models: { name: string } | { name: string }[] | null;
      vehicle_versions: { name: string } | { name: string }[] | null;
    } | {
      id: string;
      plate: string | null;
      chassis: string | null;
      renavam: string | null;
      color: string | null;
      year_manufacture: number | null;
      year_model: number | null;
      vehicle_brands: { name: string } | { name: string }[] | null;
      vehicle_models: { name: string } | { name: string }[] | null;
      vehicle_versions: { name: string } | { name: string }[] | null;
    }[] | null;
    stock_modalities: { name: string; slug: string } | { name: string; slug: string }[] | null;
    people: { full_name: string; phone: string | null } | { full_name: string; phone: string | null }[] | null;
    profiles: { full_name: string | null } | { full_name: string | null }[] | null;
  };

  const vehicle = joinOne(passage.vehicles);
  const brand = joinOne(vehicle?.vehicle_brands ?? null);
  const model = joinOne(vehicle?.vehicle_models ?? null);
  const version = joinOne(vehicle?.vehicle_versions ?? null);
  const modality = joinOne(passage.stock_modalities);
  const owner = joinOne(passage.people);
  const capturer = joinOne(passage.profiles);
  const ageDays = getStockAgeDays(passage.stock_started_at);
  const vehicleLabel = [brand?.name, model?.name, version?.name].filter(Boolean).join(' ');

  const [{ data: preparations }, { data: photos }, { data: reports }, { data: timeline }, { data: priceHistory }, { data: portalAds }] =
    await Promise.all([
      supabase
        .from('preparation_orders')
        .select('id, title, description, actual_cost, is_internal, supplier_name, status, created_at')
        .eq('passage_id', id)
        .order('created_at', { ascending: false }),
      supabase
        .from('vehicle_photos')
        .select('id, storage_path, sort_order, is_published, created_at')
        .eq('passage_id', id)
        .order('sort_order'),
      supabase
        .from('vehicle_reports')
        .select('id, status, notes, storage_path, created_at')
        .eq('passage_id', id)
        .order('created_at', { ascending: false }),
      supabase
        .from('timeline_events')
        .select('id, title, description, occurred_at, event_type')
        .eq('entity_type', 'vehicle')
        .eq('entity_id', vehicle?.id ?? '')
        .order('occurred_at', { ascending: false }),
      supabase
        .from('vehicle_prices')
        .select('id, price_type, value, created_at')
        .eq('passage_id', id)
        .order('created_at', { ascending: false }),
      supabase
        .from('vehicle_portal_ads')
        .select('id, status, published_at, portal_integration_id')
        .eq('passage_id', id),
    ]);

  const portalIds = [...new Set((portalAds ?? []).map((ad) => ad.portal_integration_id))];
  const { data: portals } = portalIds.length
    ? await supabase.from('portal_integrations').select('id, portal_name').in('id', portalIds)
    : { data: [] };
  const portalMap = new Map((portals ?? []).map((portal) => [portal.id, portal.portal_name]));

  const timelineItems = (timeline ?? []).map((event) => ({
    id: event.id,
    title: event.title,
    description: event.description,
    eventType: event.event_type,
    occurredAt: event.occurred_at,
  }));

  return (
    <>
      <PageTitle
        title={vehicle?.plate ?? 'Veículo'}
        subtitle={vehicleLabel}
        breadcrumbs={[
          { label: 'Estoque', href: '/inventory' },
          { label: vehicle?.plate ?? 'Detalhe' },
        ]}
        actions={
          <div className="d-flex gap-2 align-items-center">
            <RenewStockButton passageId={id} />
            <span className={`badge ${getStockAgeBadgeClass(ageDays)}`}>
              {ageDays} dias em estoque
            </span>
          </div>
        }
      />
      {passage.has_history_alert ? (
        <div className="alert alert-warning">
          Veículo já possui histórico na loja. Passagem #{passage.passage_number}.
        </div>
      ) : null}
      <ul className="nav nav-tabs mb-3">
        {INVENTORY_TABS.map((item) => (
          <li key={item.id} className="nav-item">
            <Link
              href={`/inventory/${id}?tab=${item.id}`}
              className={`nav-link ${activeTab === item.id ? 'active' : ''}`}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
      {activeTab === 'summary' ? (
      <div className="row">
        <div className="col-lg-4 mb-3">
          <Card title="Resumo">
            <dl className="mb-0">
              <dt className="text-muted">Veículo</dt>
              <dd>{vehicleLabel || '—'}</dd>
              <dt className="text-muted">Ano</dt>
              <dd>
                {vehicle?.year_manufacture ?? '—'}/{vehicle?.year_model ?? '—'}
              </dd>
              <dt className="text-muted">Cor / Km</dt>
              <dd>
                {vehicle?.color ?? '—'} · {passage.km?.toLocaleString('pt-BR') ?? '—'} km
              </dd>
              <dt className="text-muted">Modalidade</dt>
              <dd>{modality?.name ?? '—'}</dd>
              <dt className="text-muted">Captador</dt>
              <dd>{capturer?.full_name ?? '—'}</dd>
              <dt className="text-muted">Proprietário</dt>
              <dd>{owner?.full_name ?? '—'}</dd>
              <dt className="text-muted">Status</dt>
              <dd>{passage.status}</dd>
            </dl>
          </Card>
        </div>
        <div className="col-lg-4 mb-3">
          <Card title="Custos e preços">
            <dl className="mb-0">
              <dt className="text-muted">Aquisição</dt>
              <dd>{formatCurrency(passage.acquisition_cost)}</dd>
              <dt className="text-muted">Custo total</dt>
              <dd>{formatCurrency(passage.cost)}</dd>
              <dt className="text-muted">Venda</dt>
              <dd>{formatCurrency(passage.sale_price)}</dd>
              <dt className="text-muted">Margem</dt>
              <dd>{formatMargin(passage.cost, passage.sale_price)}</dd>
              <dt className="text-muted">FIPE</dt>
              <dd>{formatCurrency(passage.fipe_value)}</dd>
              {modality?.slug === 'consignment' || modality?.slug === 'online_consignment' ? (
                <>
                  <dt className="text-muted">Líquido proprietário</dt>
                  <dd>{formatCurrency(passage.consignment_net_value)}</dd>
                  <dt className="text-muted">Percentual loja</dt>
                  <dd>
                    {passage.consignment_percent !== null
                      ? `${passage.consignment_percent}%`
                      : '—'}
                  </dd>
                </>
              ) : null}
            </dl>
          </Card>
        </div>
        <div className="col-lg-4 mb-3">
          <Card title="Histórico de preços">
            {priceHistory?.length ? (
              <ul className="list-unstyled mb-0">
                {priceHistory.map((price) => (
                  <li key={price.id} className="mb-2">
                    <strong>{price.price_type}</strong>: {formatCurrency(price.value)}
                    <br />
                    <small className="text-muted">
                      {new Date(price.created_at).toLocaleString('pt-BR')}
                    </small>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted mb-0">Sem alterações de preço.</p>
            )}
          </Card>
        </div>
      </div>
      ) : null}
      {activeTab === 'preparation' ? (
      <div className="row">
        <div className="col-12 mb-3">
          <Card title="Preparação / OS">
            <PreparationForm passageId={id} />
            {preparations?.length ? (
              <div className="table-responsive">
                <table className="table table-sm mb-0">
                  <thead>
                    <tr>
                      <th>Serviço</th>
                      <th>Tipo</th>
                      <th>Custo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preparations.map((item) => (
                      <tr key={item.id}>
                        <td>{item.title}</td>
                        <td>{item.is_internal ? 'Interno' : item.supplier_name ?? 'Terceiro'}</td>
                        <td>{formatCurrency(item.actual_cost)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-muted mb-0">Nenhuma preparação lançada.</p>
            )}
          </Card>
        </div>
      </div>
      ) : null}
      {activeTab === 'report' ? (
      <div className="row">
        <div className="col-12 mb-3">
          <Card title="Laudo">
            <ReportUploadPanel passageId={id} />
            {reports?.length ? (
              <ul className="list-unstyled mb-0">
                {reports.map((report) => (
                  <li key={report.id} className="mb-2">
                    <strong>{report.status}</strong>
                    {report.notes ? ` — ${report.notes}` : ''}
                    {report.storage_path ? (
                      <>
                        {' '}
                        —{' '}
                        <a
                          href={getStoragePublicUrl(supabase, report.storage_path)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Ver arquivo
                        </a>
                      </>
                    ) : null}
                    <br />
                    <small className="text-muted">
                      {new Date(report.created_at).toLocaleString('pt-BR')}
                    </small>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted mb-0">Sem laudo registrado.</p>
            )}
          </Card>
        </div>
      </div>
      ) : null}
      {activeTab === 'photos' ? (
      <div className="row">
        <div className="col-12 mb-3">
          <Card title="Fotos">
            <PhotoUploadPanel passageId={id} />
            {photos?.length ? (
              <ul className="list-unstyled mb-0">
                {photos.map((photo) => (
                  <li key={photo.id} className="mb-2">
                    <a
                      href={getStoragePublicUrl(supabase, photo.storage_path)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {photo.storage_path.split('/').pop()}
                    </a>
                    {photo.is_published ? (
                      <span className="badge bg-soft-success ms-1">Publicada</span>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted mb-0">Nenhuma foto cadastrada.</p>
            )}
          </Card>
        </div>
      </div>
      ) : null}
      {activeTab === 'timeline' ? (
      <div className="row">
        <div className="col-12 mb-3">
          <Card title="Timeline do veículo">
            <TimelinePanel events={timelineItems} />
          </Card>
        </div>
      </div>
      ) : null}
      {activeTab === 'ads' ? (
      <div className="row">
        <div className="col-12 mb-3">
          <Card title="Anúncios nos portais">
            {portalAds?.length ? (
              <ul className="list-unstyled mb-0">
                {portalAds.map((ad) => (
                    <li key={ad.id} className="mb-2">
                      <strong>{portalMap.get(ad.portal_integration_id) ?? 'Portal'}</strong> — {ad.status}
                      {ad.published_at ? (
                        <span className="text-muted ms-2">
                          {new Date(ad.published_at).toLocaleDateString('pt-BR')}
                        </span>
                      ) : null}
                    </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted mb-0">Veículo sem anúncios publicados.</p>
            )}
            <Link href="/integrator" className="btn btn-light btn-sm mt-2">
              Ver integrador
            </Link>
          </Card>
        </div>
      </div>
      ) : null}
    </>
  );
}
