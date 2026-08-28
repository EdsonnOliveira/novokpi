import Link from 'next/link';
import { PageTitle } from '@/components/dastone/PageTitle';
import { Card } from '@/components/dastone/Card';
import { createClient } from '@/lib/supabase/server';
import {
  formatOrderNumber,
  formatTransferStatus,
  getVehicleLabel,
  joinOne,
  type TransferRow,
} from '@/types/orders';

export default async function TransferPage() {
  const supabase = await createClient();

  const { data: transfersData } = await supabase
    .from('vehicle_transfers')
    .select(`
      id,
      status,
      atpv_done,
      signature_done,
      sale_communication_done,
      dispatcher_done,
      completed_at,
      deadline_at,
      third_party_name,
      profiles:responsible_user_id ( full_name ),
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

  const transfers = (transfersData ?? []) as TransferRow[];

  const { data: pendingOrders } = await supabase
    .from('orders')
    .select('id, order_number, transfer_status')
    .eq('transfer_status', 'pending')
    .in('status', ['reserved', 'closed'])
    .limit(20);

  return (
    <>
      <PageTitle
        title="Transferência veicular"
        subtitle="ATPV, assinatura, despachante"
        breadcrumbs={[
          { label: 'Pedidos', href: '/orders' },
          { label: 'Transferência' },
        ]}
      />
      {pendingOrders?.length ? (
        <Card title="Transferências pendentes" className="mb-3">
          <div className="d-flex flex-wrap gap-2">
            {pendingOrders.map((order) => (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="btn btn-light btn-sm"
              >
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
                <th>Terceiro</th>
                <th>Prazo</th>
                <th>ATPV</th>
                <th>Assinatura</th>
                <th>Comunicação</th>
                <th>Despachante</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {transfers.length ? (
                transfers.map((transfer) => {
                  const order = joinOne(transfer.orders);
                  const person = joinOne(order?.people ?? null);
                  const passage = joinOne(order?.vehicle_passages ?? null);

                  return (
                    <tr key={transfer.id}>
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
                      <td>{getVehicleLabel(passage)}</td>
                      <td>{transfer.third_party_name ?? '—'}</td>
                      <td>
                        {transfer.deadline_at
                          ? new Date(transfer.deadline_at).toLocaleDateString('pt-BR')
                          : '—'}
                      </td>
                      <td>{transfer.atpv_done ? '✓' : '—'}</td>
                      <td>{transfer.signature_done ? '✓' : '—'}</td>
                      <td>{transfer.sale_communication_done ? '✓' : '—'}</td>
                      <td>{transfer.dispatcher_done ? '✓' : '—'}</td>
                      <td>{formatTransferStatus(transfer.status)}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={10} className="text-center text-muted py-4">
                    Nenhuma transferência registrada.
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
