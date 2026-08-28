import Link from 'next/link';
import { PageTitle } from '@/components/dastone/PageTitle';
import { Card } from '@/components/dastone/Card';
import { createClient } from '@/lib/supabase/server';
import { getTenantContext } from '@/lib/settings/tenant-context';
import {
  formatCurrency,
  formatMargin,
  getStockAgeBadgeClass,
  getStockAgeDays,
  joinOne,
  type PassageListRow,
} from '@/types/inventory';
import { redirect } from 'next/navigation';
import { TableEmptyRow } from '@/components/dastone/EmptyState';

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; aging?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const context = await getTenantContext(supabase);

  if (!context) {
    redirect('/login');
  }

  const statuses = params.status
    ? [params.status]
    : ['in_stock', 'reserved', 'temporarily_out'];

  const query = supabase
    .from('vehicle_passages')
    .select(`
      id,
      passage_number,
      status,
      stock_started_at,
      cost,
      sale_price,
      km,
      has_history_alert,
      vehicles:vehicle_id (
        plate,
        color,
        year_manufacture,
        year_model,
        vehicle_brands:brand_id ( name ),
        vehicle_models:model_id ( name ),
        vehicle_versions:version_id ( name )
      ),
      stock_modalities:modality_id ( name, slug ),
      people:owner_person_id ( full_name ),
      profiles:capturer_user_id ( full_name )
    `)
    .eq('tenant_id', context.tenantId)
    .in('status', statuses)
    .order('stock_started_at', { ascending: true })
    .limit(200);

  const { data: passagesData } = await query;
  let passages = (passagesData ?? []) as PassageListRow[];

  if (params.aging) {
    passages = passages.filter((passage) => {
      const days = getStockAgeDays(passage.stock_started_at);
      if (params.aging === 'above90') return days > 90;
      if (params.aging === '61-90') return days >= 61 && days <= 90;
      if (params.aging === '31-60') return days >= 31 && days <= 60;
      if (params.aging === '0-30') return days <= 30;
      return true;
    });
  }

  const inStockCount = passages.filter((p) => p.status === 'in_stock').length;
  const reservedCount = passages.filter((p) => p.status === 'reserved').length;

  return (
    <>
      <PageTitle
        title="Estoque"
        subtitle={params.status ? `Filtro: ${params.status}` : 'Veículos em estoque'}
        breadcrumbs={[{ label: 'Estoque' }]}
        actions={
          <div className="d-flex flex-wrap gap-2">
            <Link href="/crm/evaluation" className="btn btn-light btn-sm">
              Avaliações
            </Link>
            <Link href="/inventory/quick" className="btn btn-primary btn-sm">
              Cadastro rápido
            </Link>
          </div>
        }
      />
      <div className="row mb-3">
        <div className="col-md-4">
          <Card>
            <p className="text-muted mb-1">Em estoque</p>
            <h4 className="mb-0">{inStockCount}</h4>
          </Card>
        </div>
        <div className="col-md-4">
          <Card>
            <p className="text-muted mb-1">Reservados</p>
            <h4 className="mb-0">{reservedCount}</h4>
          </Card>
        </div>
        <div className="col-md-4">
          <Card>
            <p className="text-muted mb-1">Total listado</p>
            <h4 className="mb-0">{passages.length}</h4>
          </Card>
        </div>
      </div>
      <Card>
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead>
              <tr>
                <th>Placa</th>
                <th>Veículo</th>
                <th>Status</th>
                <th>Dias</th>
                <th>Custo</th>
                <th>Preço</th>
                <th>Margem</th>
              </tr>
            </thead>
            <tbody>
              {passages.length ? (
                passages.map((passage) => {
                  const vehicle = joinOne(passage.vehicles);
                  const brand = joinOne(vehicle?.vehicle_brands ?? null);
                  const model = joinOne(vehicle?.vehicle_models ?? null);
                  const version = joinOne(vehicle?.vehicle_versions ?? null);
                  const label = [brand?.name, model?.name, version?.name].filter(Boolean).join(' ');
                  const ageDays = getStockAgeDays(passage.stock_started_at);

                  return (
                    <tr key={passage.id}>
                      <td>
                        <Link href={`/inventory/${passage.id}`}>{vehicle?.plate ?? '—'}</Link>
                      </td>
                      <td>{label || '—'}</td>
                      <td>{passage.status}</td>
                      <td>
                        <span className={`badge ${getStockAgeBadgeClass(ageDays)}`}>{ageDays}d</span>
                      </td>
                      <td>{formatCurrency(passage.cost)}</td>
                      <td>{passage.sale_price ? formatCurrency(passage.sale_price) : '—'}</td>
                      <td>{formatMargin(passage.cost, passage.sale_price)}</td>
                    </tr>
                  );
                })
              ) : (
                <TableEmptyRow
                  colSpan={7}
                  title="Nenhum veículo encontrado."
                  icon="iconoir-car"
                />
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
