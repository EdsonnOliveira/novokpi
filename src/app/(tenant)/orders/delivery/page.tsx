import Link from 'next/link';
import { PageTitle } from '@/components/dastone/PageTitle';
import { Card } from '@/components/dastone/Card';
import { createClient } from '@/lib/supabase/server';
import { TableEmptyRow } from '@/components/dastone/EmptyState';
import { StatusBadge } from '@/components/dastone/TableBadge';
import {
  formatDeliveryStatus,
  formatOrderNumber,
  getVehicleLabel,
  joinOne,
} from '@/types/orders';

interface DeliveryRow {
  id: string;
  delivered_at: string | null;
  delivery_km: number | null;
  went_well: boolean | null;
  status: string;
  orders: {
    id: string;
    order_number: number;
    people: { full_name: string } | { full_name: string }[] | null;
    vehicle_passages: {
      id: string;
      vehicles: {
        plate: string | null;
        vehicle_brands: { name: string } | { name: string }[] | null;
        vehicle_models: { name: string } | { name: string }[] | null;
        vehicle_versions: { name: string } | { name: string }[] | null;
      } | {
        plate: string | null;
        vehicle_brands: { name: string } | { name: string }[] | null;
        vehicle_models: { name: string } | { name: string }[] | null;
        vehicle_versions: { name: string } | { name: string }[] | null;
      }[] | null;
    } | {
      id: string;
      vehicles: {
        plate: string | null;
        vehicle_brands: { name: string } | { name: string }[] | null;
        vehicle_models: { name: string } | { name: string }[] | null;
        vehicle_versions: { name: string } | { name: string }[] | null;
      } | {
        plate: string | null;
        vehicle_brands: { name: string } | { name: string }[] | null;
        vehicle_models: { name: string } | { name: string }[] | null;
        vehicle_versions: { name: string } | { name: string }[] | null;
      }[] | null;
    }[] | null;
  } | {
    id: string;
    order_number: number;
    people: { full_name: string } | { full_name: string }[] | null;
    vehicle_passages: {
      id: string;
      vehicles: {
        plate: string | null;
        vehicle_brands: { name: string } | { name: string }[] | null;
        vehicle_models: { name: string } | { name: string }[] | null;
        vehicle_versions: { name: string } | { name: string }[] | null;
      } | {
        plate: string | null;
        vehicle_brands: { name: string } | { name: string }[] | null;
        vehicle_models: { name: string } | { name: string }[] | null;
        vehicle_versions: { name: string } | { name: string }[] | null;
      }[] | null;
    } | {
      id: string;
      vehicles: {
        plate: string | null;
        vehicle_brands: { name: string } | { name: string }[] | null;
        vehicle_models: { name: string } | { name: string }[] | null;
        vehicle_versions: { name: string } | { name: string }[] | null;
      } | {
        plate: string | null;
        vehicle_brands: { name: string } | { name: string }[] | null;
        vehicle_models: { name: string } | { name: string }[] | null;
        vehicle_versions: { name: string } | { name: string }[] | null;
      }[] | null;
    }[] | null;
  }[] | null;
}

export default async function DeliveryPage() {
  const supabase = await createClient();

  const { data: deliveriesData } = await supabase
    .from('deliveries')
    .select(`
      id,
      delivered_at,
      delivery_km,
      went_well,
      status,
      orders:order_id (
        id,
        order_number,
        people:person_id ( full_name ),
        vehicle_passages:vehicle_passage_id (
          id,
          vehicles:vehicle_id (
            plate,
            vehicle_brands:brand_id ( name ),
            vehicle_models:model_id ( name ),
            vehicle_versions:version_id ( name )
          )
        )
      )
    `)
    .order('created_at', { ascending: false })
    .limit(100);

  const deliveries = (deliveriesData ?? []) as DeliveryRow[];

  const { data: pendingOrders } = await supabase
    .from('orders')
    .select('id, order_number, delivery_status')
    .eq('delivery_status', 'pending')
    .in('status', ['reserved', 'closed'])
    .limit(20);

  return (
    <>
      <PageTitle
        title="Entrega / Checklist"
        subtitle="Entregas realizadas e pendentes"
        breadcrumbs={[
          { label: 'Pedidos', href: '/orders' },
          { label: 'Entrega' },
        ]}
      />
      {pendingOrders?.length ? (
        <Card title="Entregas pendentes" className="mb-3">
          <div className="d-flex flex-wrap gap-2">
            {pendingOrders.map((order) => (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="btn btn-light btn-sm"
              >
                <i className="iconoir-arrow-right me-1" aria-hidden="true" />
                {formatOrderNumber(order.order_number)}
              </Link>
            ))}
          </div>
        </Card>
      ) : null}
      <Card>
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead>
              <tr>
                <th>Pedido</th>
                <th>Cliente</th>
                <th>Veículo</th>
                <th>Data</th>
                <th>Km</th>
                <th>Tudo certo</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {deliveries.length ? (
                deliveries.map((delivery) => {
                  const order = joinOne(delivery.orders);
                  const person = joinOne(order?.people ?? null);
                  const passage = joinOne(order?.vehicle_passages ?? null);

                  return (
                    <tr key={delivery.id}>
                      <td>
                        {order ? (
                          <Link href={`/orders/${order.id}`}>
                            {formatOrderNumber(order.order_number)}
                          </Link>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td>{person?.full_name ?? '—'}</td>
                      <td>{getVehicleLabel(passage as Parameters<typeof getVehicleLabel>[0])}</td>
                      <td>
                        {delivery.delivered_at
                          ? new Date(delivery.delivered_at).toLocaleDateString('pt-BR')
                          : '—'}
                      </td>
                      <td>{delivery.delivery_km?.toLocaleString('pt-BR') ?? '—'}</td>
                      <td>{delivery.went_well === null ? '—' : delivery.went_well ? 'Sim' : 'Não'}</td>
                      <td>
                        <StatusBadge status={delivery.status} label={formatDeliveryStatus(delivery.status)} />
                      </td>
                    </tr>
                  );
                })
              ) : (
                <TableEmptyRow
                  colSpan={7}
                  title="Nenhuma entrega registrada."
                  icon="iconoir-delivery-truck"
                />
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
