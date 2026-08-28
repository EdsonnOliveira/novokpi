import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PageTitle } from '@/components/dastone/PageTitle';
import { Card } from '@/components/dastone/Card';
import { StatusBadge, ValueBadge } from '@/components/dastone/TableBadge';
import { CloseOrderButton, DeliveryForm, TransferForm } from '@/components/orders/OrderActions';
import { TransferStageForm } from '@/components/orders/TransferStageForm';
import { createClient } from '@/lib/supabase/server';
import {
  formatCurrency,
  formatDeliveryStatus,
  formatOrderNumber,
  formatOrderStatus,
  formatTransferStatus,
  getVehicleLabel,
  joinOne,
} from '@/types/orders';

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: orderData } = await supabase
    .from('orders')
    .select(`
      id,
      order_number,
      status,
      total_value,
      vehicle_value,
      margin_value,
      margin_percent,
      primary_payment_method,
      invoice_status,
      delivery_status,
      transfer_status,
      reserved_at,
      closed_at,
      notes,
      people:person_id ( full_name, phone, email ),
      profiles:seller_user_id ( full_name ),
      channels:channel_id ( name ),
      deals:deal_id ( id, deal_number ),
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
    .eq('id', id)
    .maybeSingle();

  if (!orderData) {
    notFound();
  }

  const order = orderData as {
    id: string;
    order_number: number;
    status: string;
    total_value: number | null;
    vehicle_value: number | null;
    margin_value: number | null;
    margin_percent: number | null;
    primary_payment_method: string | null;
    invoice_status: string;
    delivery_status: string;
    transfer_status: string;
    reserved_at: string | null;
    closed_at: string | null;
    notes: string | null;
    people: { full_name: string; phone: string | null; email: string | null } | { full_name: string; phone: string | null; email: string | null }[] | null;
    profiles: { full_name: string | null } | { full_name: string | null }[] | null;
    channels: { name: string } | { name: string }[] | null;
    deals: { id: string; deal_number: number } | { id: string; deal_number: number }[] | null;
    vehicle_passages: {
      id: string;
      sale_price: number | null;
      cost: number | null;
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
      sale_price: number | null;
      cost: number | null;
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
  };

  const person = joinOne(order.people);
  const seller = joinOne(order.profiles);
  const channel = joinOne(order.channels);
  const deal = joinOne(order.deals);
  const passage = joinOne(order.vehicle_passages);

  const [{ data: payments }, { data: products }, { data: delivery }, { data: transfer }, { data: timeline }] =
    await Promise.all([
      supabase
        .from('order_payments')
        .select('id, payee_name, payee_document, payment_method_name, amount, due_date, paid_at, status')
        .eq('order_id', id)
        .order('created_at'),
      supabase
        .from('order_products')
        .select('id, product_name, amount, commission, expected_receipt_at, received_at')
        .eq('order_id', id)
        .order('created_at'),
      supabase
        .from('deliveries')
        .select('id, delivered_at, delivery_km, went_well, client_notes, status')
        .eq('order_id', id)
        .maybeSingle(),
      supabase
        .from('vehicle_transfers')
        .select('id, status, atpv_done, signature_done, sale_communication_done, dispatcher_done, completed_at, deadline_at, third_party_name')
        .eq('order_id', id)
        .maybeSingle(),
      supabase
        .from('timeline_events')
        .select('id, title, description, occurred_at, event_type')
        .eq('entity_type', 'order')
        .eq('entity_id', id)
        .order('occurred_at', { ascending: false }),
    ]);

  const { data: checklistItems } = delivery
    ? await supabase
        .from('delivery_checklist_items')
        .select('id, item_label, is_checked')
        .eq('delivery_id', delivery.id)
        .order('sort_order')
    : { data: [] };

  const { data: pendencies } = delivery
    ? await supabase
        .from('delivery_pendencies')
        .select('id, title, description, is_resolved')
        .eq('order_id', id)
    : { data: [] };

  return (
    <>
      <PageTitle
        title={formatOrderNumber(order.order_number)}
        subtitle={formatOrderStatus(order.status)}
        breadcrumbs={[
          { label: 'Pedidos', href: '/orders' },
          { label: formatOrderNumber(order.order_number) },
        ]}
        actions={<CloseOrderButton orderId={id} status={order.status} />}
      />
      <div className="row">
        <div className="col-lg-4 mb-3">
          <Card title="Cliente">
            <p className="mb-1"><strong>{person?.full_name ?? '—'}</strong></p>
            <p className="text-muted mb-1">{person?.phone ?? '—'}</p>
            <p className="text-muted mb-0">{person?.email ?? '—'}</p>
            {deal ? (
              <Link href={`/crm/${deal.id}`} className="btn btn-light btn-sm mt-2">
                <i className="iconoir-arrow-right me-1" aria-hidden="true" />
                Ficha #{String(deal.deal_number).padStart(6, '0')}
              </Link>
            ) : null}
          </Card>
        </div>
        <div className="col-lg-4 mb-3">
          <Card title="Operação">
            <dl className="mb-0">
              <dt className="text-muted">Veículo</dt>
              <dd>
                {passage ? (
                  <Link href={`/inventory/${passage.id}`}>{getVehicleLabel(passage)}</Link>
                ) : (
                  '—'
                )}
              </dd>
              <dt className="text-muted">Vendedor</dt>
              <dd>{seller?.full_name ?? '—'}</dd>
              <dt className="text-muted">Canal</dt>
              <dd>{channel?.name ?? '—'}</dd>
              <dt className="text-muted">Reservado em</dt>
              <dd>
                {order.reserved_at
                  ? new Date(order.reserved_at).toLocaleString('pt-BR')
                  : '—'}
              </dd>
              <dt className="text-muted">Fechado em</dt>
              <dd>
                {order.closed_at
                  ? new Date(order.closed_at).toLocaleString('pt-BR')
                  : '—'}
              </dd>
            </dl>
          </Card>
        </div>
        <div className="col-lg-4 mb-3">
          <Card title="Valores">
            <dl className="mb-0">
              <dt className="text-muted">Total</dt>
              <dd>{formatCurrency(order.total_value)}</dd>
              <dt className="text-muted">Veículo</dt>
              <dd>{formatCurrency(order.vehicle_value)}</dd>
              <dt className="text-muted">Margem</dt>
              <dd>
                {formatCurrency(order.margin_value)}
                {order.margin_percent !== null ? ` (${order.margin_percent.toFixed(1)}%)` : ''}
              </dd>
              <dt className="text-muted">Pagamento principal</dt>
              <dd>{order.primary_payment_method ?? '—'}</dd>
              <dt className="text-muted">NF</dt>
              <dd>{order.invoice_status}</dd>
            </dl>
          </Card>
        </div>
      </div>
      <div className="row">
        <div className="col-lg-6 mb-3">
          <Card title="Formas de pagamento">
            {payments?.length ? (
              <div className="table-responsive">
                <table className="table table-sm mb-0">
                  <thead>
                    <tr>
                      <th>Forma</th>
                      <th>Favorecido</th>
                      <th>Valor</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment) => (
                      <tr key={payment.id}>
                        <td>{payment.payment_method_name ?? '—'}</td>
                        <td>{payment.payee_name ?? '—'}</td>
                        <td>
                          <ValueBadge
                            value={payment.amount}
                            formatted={formatCurrency(payment.amount)}
                            variant="price"
                          />
                        </td>
                        <td>
                          <StatusBadge status={payment.status} label={payment.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-muted mb-0">Sem pagamentos registrados.</p>
            )}
          </Card>
        </div>
        <div className="col-lg-6 mb-3">
          <Card title="Produtos adicionais">
            {products?.length ? (
              <div className="table-responsive">
                <table className="table table-sm mb-0">
                  <thead>
                    <tr>
                      <th>Produto</th>
                      <th>Valor</th>
                      <th>Comissão</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id}>
                        <td>{product.product_name}</td>
                        <td>
                          <ValueBadge
                            value={product.amount}
                            formatted={formatCurrency(product.amount)}
                            variant="price"
                          />
                        </td>
                        <td>
                          <ValueBadge
                            value={product.commission}
                            formatted={formatCurrency(product.commission)}
                            variant="income"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-muted mb-0">Sem produtos adicionais.</p>
            )}
          </Card>
        </div>
      </div>
      <div className="row">
        <div className="col-lg-6 mb-3">
          <Card title={`Entrega — ${formatDeliveryStatus(order.delivery_status)}`}>
            {delivery ? (
              <>
                <p className="mb-1">
                  Km: {delivery.delivery_km?.toLocaleString('pt-BR') ?? '—'}
                </p>
                <p className="mb-1">
                  Data:{' '}
                  {delivery.delivered_at
                    ? new Date(delivery.delivered_at).toLocaleString('pt-BR')
                    : '—'}
                </p>
                {checklistItems?.length ? (
                  <ul className="list-unstyled mb-2">
                    {checklistItems.map((item) => (
                      <li key={item.id}>
                        {item.is_checked ? '✓' : '○'} {item.item_label}
                      </li>
                    ))}
                  </ul>
                ) : null}
                {pendencies?.filter((p) => !p.is_resolved).length ? (
                  <div className="alert alert-warning py-2">
                    Pendências:{' '}
                    {pendencies
                      .filter((p) => !p.is_resolved)
                      .map((p) => p.title)
                      .join(', ')}
                  </div>
                ) : null}
              </>
            ) : (
              <DeliveryForm orderId={id} orderStatus={order.status} deliveryStatus={order.delivery_status} />
            )}
          </Card>
        </div>
        <div className="col-lg-6 mb-3">
          <Card title={`Transferência — ${formatTransferStatus(order.transfer_status)}`}>
            {transfer ? (
              <>
                <p className="mb-2">Terceiro: {transfer.third_party_name ?? '—'}</p>
                <p className="mb-2">
                  Prazo:{' '}
                  {transfer.deadline_at
                    ? new Date(transfer.deadline_at).toLocaleDateString('pt-BR')
                    : '—'}
                </p>
                <TransferStageForm
                  transferId={transfer.id}
                  orderId={id}
                  atpvDone={transfer.atpv_done}
                  signatureDone={transfer.signature_done}
                  saleCommunicationDone={transfer.sale_communication_done}
                  dispatcherDone={transfer.dispatcher_done}
                />
              </>
            ) : (
              <TransferForm
                orderId={id}
                vehiclePassageId={passage?.id ?? null}
                hasTransfer={false}
              />
            )}
          </Card>
        </div>
      </div>
      <Card title="Timeline do pedido">
        {timeline?.length ? (
          <ul className="list-unstyled mb-0">
            {timeline.map((event) => (
              <li key={event.id} className="mb-3 border-bottom pb-2">
                <strong>{event.title}</strong>
                {event.description ? (
                  <div className="text-muted">{event.description}</div>
                ) : null}
                <small className="text-muted">
                  {new Date(event.occurred_at).toLocaleString('pt-BR')}
                </small>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted mb-0">Sem eventos.</p>
        )}
      </Card>
    </>
  );
}
