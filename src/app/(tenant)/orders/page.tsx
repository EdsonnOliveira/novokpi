import Link from 'next/link';
import { PageTitle } from '@/components/dastone/PageTitle';
import { Card } from '@/components/dastone/Card';
import { createClient } from '@/lib/supabase/server';
import { getTenantContext } from '@/lib/settings/tenant-context';
import {
  formatCurrency,
  formatDeliveryStatus,
  formatOrderNumber,
  formatOrderStatus,
  formatTransferStatus,
  getVehicleLabel,
  joinOne,
  type OrderListRow,
} from '@/types/orders';
import { redirect } from 'next/navigation';

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; channel?: string; seller?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const context = await getTenantContext(supabase);

  if (!context) {
    redirect('/login');
  }

  let query = supabase
    .from('orders')
    .select(`
      id,
      order_number,
      status,
      total_value,
      margin_value,
      margin_percent,
      primary_payment_method,
      invoice_status,
      delivery_status,
      transfer_status,
      closed_at,
      reserved_at,
      created_at,
      channel_id,
      seller_user_id,
      people:person_id ( full_name ),
      profiles:seller_user_id ( full_name ),
      channels:channel_id ( name ),
      deals:deal_id ( deal_number ),
      vehicle_passages:vehicle_passage_id (
        id,
        sale_price,
        cost,
        vehicles:vehicle_id (
          plate,
          vehicle_brands:brand_id ( name ),
          vehicle_models:model_id ( name ),
          vehicle_versions:version_id ( name )
        )
      )
    `)
    .eq('tenant_id', context.tenantId)
    .order('created_at', { ascending: false })
    .limit(200);

  if (params.status) {
    query = query.eq('status', params.status);
  } else {
    query = query.in('status', ['reserved', 'closed']);
  }

  if (params.channel) {
    query = query.eq('channel_id', params.channel);
  }

  if (params.seller) {
    query = query.eq('seller_user_id', params.seller);
  }

  const { data: ordersData } = await query;
  const orders = (ordersData ?? []) as OrderListRow[];
  const closedCount = orders.filter((o) => o.status === 'closed').length;
  const reservedCount = orders.filter((o) => o.status === 'reserved').length;

  return (
    <>
      <PageTitle
        title="Pedidos"
        subtitle={params.status ? `Filtro: ${params.status}` : 'Negócios reservados e fechados'}
        breadcrumbs={[{ label: 'Pedidos' }]}
        actions={
          <Link href="/orders/reservation" className="btn btn-primary btn-sm">
            Nova reserva
          </Link>
        }
      />
      <div className="row mb-3">
        <div className="col-md-4">
          <Card>
            <p className="text-muted mb-1">Fechados</p>
            <h4 className="mb-0">{closedCount}</h4>
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
            <p className="text-muted mb-1">Total</p>
            <h4 className="mb-0">{orders.length}</h4>
          </Card>
        </div>
      </div>
      <Card>
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead>
              <tr>
                <th>Pedido</th>
                <th>Cliente</th>
                <th>Veículo</th>
                <th>Valor</th>
                <th>Status</th>
                <th>Entrega</th>
                <th>Transferência</th>
              </tr>
            </thead>
            <tbody>
              {orders.length ? (
                orders.map((order) => {
                  const person = joinOne(order.people);
                  const seller = joinOne(order.profiles);
                  const passage = joinOne(order.vehicle_passages);
                  const vehicleLabel = getVehicleLabel(passage);

                  return (
                    <tr key={order.id}>
                      <td>
                        <Link href={`/orders/${order.id}`}>
                          {formatOrderNumber(order.order_number)}
                        </Link>
                      </td>
                      <td>{person?.full_name ?? '—'}</td>
                      <td>{vehicleLabel}</td>
                      <td>{formatCurrency(order.total_value)}</td>
                      <td>{formatOrderStatus(order.status)}</td>
                      <td>{formatDeliveryStatus(order.delivery_status)}</td>
                      <td>{formatTransferStatus(order.transfer_status)}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="text-center text-muted py-4">
                    Nenhum pedido encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
