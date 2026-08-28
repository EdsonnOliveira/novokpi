import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import { DEFAULT_CHECKLIST_ITEMS } from '@/types/orders';
import { syncOrderFinancialEntries } from '@/lib/finance/order-sync';
import { writeAuditLog } from '@/lib/timeline/audit';
import { writeTimelineEvent } from '@/lib/timeline/events';

interface OrderPaymentInput {
  payeeName?: string;
  payeeDocument?: string;
  paymentMethodId?: string;
  paymentMethodName?: string;
  amount: number;
  dueDate?: string;
}

interface OrderProductInput {
  productTypeId?: string;
  productName: string;
  amount?: number;
  commission?: number;
}

interface CreateReservationInput {
  tenantId: string;
  userId: string;
  dealId: string;
  personId: string;
  vehiclePassageId: string;
  channelId?: string;
  vehicleValue: number;
  totalValue: number;
  payments?: OrderPaymentInput[];
  products?: OrderProductInput[];
  notes?: string;
}

interface CloseOrderInput {
  tenantId: string;
  userId: string;
  orderId: string;
}

interface CreateDeliveryInput {
  tenantId: string;
  userId: string;
  orderId: string;
  deliveryKm?: number;
  deliveredAt?: string;
  warrantyStart?: string;
  warrantyEnd?: string;
  warrantyKmLimit?: number;
  clientSatisfaction?: string;
  wentWell?: boolean;
  clientNotes?: string;
  notes?: string;
  checklist?: { itemKey: string; itemLabel: string; isChecked: boolean }[];
  pendencies?: { title: string; description?: string }[];
}

interface CreateTransferInput {
  tenantId: string;
  userId: string;
  orderId: string;
  vehiclePassageId?: string;
  thirdPartyName?: string;
  deadlineAt?: string;
  notes?: string;
}

export async function createReservation(
  supabase: SupabaseClient<Database>,
  input: CreateReservationInput,
) {
  const { data: orderNumber, error: numberError } = await supabase.rpc('next_order_number', {
    p_tenant_id: input.tenantId,
  });

  if (numberError || orderNumber === null) {
    throw new Error('Não foi possível gerar número do pedido.');
  }

  const marginValue = input.totalValue - input.vehicleValue;
  const marginPercent = input.totalValue > 0 ? (marginValue / input.totalValue) * 100 : 0;
  const primaryPayment = input.payments?.[0]?.paymentMethodName ?? null;

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      tenant_id: input.tenantId,
      order_number: orderNumber,
      deal_id: input.dealId,
      person_id: input.personId,
      vehicle_passage_id: input.vehiclePassageId,
      seller_user_id: input.userId,
      channel_id: input.channelId ?? null,
      status: 'reserved',
      total_value: input.totalValue,
      vehicle_value: input.vehicleValue,
      margin_value: marginValue,
      margin_percent: marginPercent,
      primary_payment_method: primaryPayment,
      reserved_at: new Date().toISOString(),
      notes: input.notes ?? null,
    })
    .select('id, order_number')
    .single();

  if (orderError || !order) {
    throw new Error('Não foi possível criar a reserva.');
  }

  if (input.payments?.length) {
    await supabase.from('order_payments').insert(
      input.payments.map((payment) => ({
        tenant_id: input.tenantId,
        order_id: order.id,
        payee_name: payment.payeeName ?? null,
        payee_document: payment.payeeDocument ?? null,
        payment_method_id: payment.paymentMethodId ?? null,
        payment_method_name: payment.paymentMethodName ?? null,
        amount: payment.amount,
        due_date: payment.dueDate ?? null,
      })),
    );
  }

  if (input.products?.length) {
    await supabase.from('order_products').insert(
      input.products.map((product) => ({
        tenant_id: input.tenantId,
        order_id: order.id,
        product_type_id: product.productTypeId ?? null,
        product_name: product.productName,
        amount: product.amount ?? null,
        commission: product.commission ?? null,
        responsible_user_id: input.userId,
      })),
    );
  }

  await supabase
    .from('vehicle_passages')
    .update({
      status: 'reserved',
      reserved_deal_id: input.dealId,
      reserved_at: new Date().toISOString(),
    })
    .eq('id', input.vehiclePassageId);

  await supabase
    .from('deals')
    .update({ status: 'reserved' })
    .eq('id', input.dealId);

  const { data: passage } = await supabase
    .from('vehicle_passages')
    .select('vehicle_id')
    .eq('id', input.vehiclePassageId)
    .maybeSingle();

  if (passage?.vehicle_id) {
    await writeTimelineEvent(supabase, {
      tenantId: input.tenantId,
      entityType: 'vehicle',
      entityId: passage.vehicle_id,
      eventType: 'reserved',
      title: `Reservado — Pedido #${String(order.order_number).padStart(6, '0')}`,
      userId: input.userId,
      metadata: { order_id: order.id, deal_id: input.dealId },
    });
  }

  await writeTimelineEvent(supabase, {
    tenantId: input.tenantId,
    entityType: 'deal',
    entityId: input.dealId,
    eventType: 'reserved',
    title: `Reserva — Pedido #${String(order.order_number).padStart(6, '0')}`,
    userId: input.userId,
    metadata: { order_id: order.id },
  });

  await writeTimelineEvent(supabase, {
    tenantId: input.tenantId,
    entityType: 'order',
    entityId: order.id,
    eventType: 'reserved',
    title: 'Pedido reservado',
    userId: input.userId,
  });

  await writeAuditLog(supabase, {
    tenantId: input.tenantId,
    userId: input.userId,
    action: 'create',
    module: 'orders',
    entityType: 'order',
    entityId: order.id,
    newData: {
      order_number: order.order_number,
      deal_id: input.dealId,
      status: 'reserved',
    },
  });

  return order;
}

export async function closeOrder(
  supabase: SupabaseClient<Database>,
  input: CloseOrderInput,
) {
  const { data: order, error: fetchError } = await supabase
    .from('orders')
    .select('id, order_number, deal_id, vehicle_passage_id')
    .eq('id', input.orderId)
    .maybeSingle();

  if (fetchError || !order) {
    throw new Error('Pedido não encontrado.');
  }

  const { error: updateError } = await supabase
    .from('orders')
    .update({
      status: 'closed',
      closed_at: new Date().toISOString(),
    })
    .eq('id', input.orderId);

  if (updateError) {
    throw new Error('Não foi possível fechar o pedido.');
  }

  if (order.deal_id) {
    await supabase
      .from('deals')
      .update({ status: 'closed_won', closed_at: new Date().toISOString() })
      .eq('id', order.deal_id);
  }

  if (order.vehicle_passage_id) {
    await supabase
      .from('vehicle_passages')
      .update({ status: 'sold', sold_at: new Date().toISOString() })
      .eq('id', order.vehicle_passage_id);

    const { data: passage } = await supabase
      .from('vehicle_passages')
      .select('vehicle_id')
      .eq('id', order.vehicle_passage_id)
      .maybeSingle();

    if (passage?.vehicle_id) {
      await writeTimelineEvent(supabase, {
        tenantId: input.tenantId,
        entityType: 'vehicle',
        entityId: passage.vehicle_id,
        eventType: 'sold',
        title: `Vendido — Pedido #${String(order.order_number).padStart(6, '0')}`,
        userId: input.userId,
        metadata: { order_id: order.id },
      });
    }
  }

  await writeTimelineEvent(supabase, {
    tenantId: input.tenantId,
    entityType: 'order',
    entityId: order.id,
    eventType: 'closed',
    title: 'Pedido fechado',
    userId: input.userId,
  });

  await syncOrderFinancialEntries(supabase, {
    tenantId: input.tenantId,
    userId: input.userId,
    orderId: order.id,
  });

  await writeAuditLog(supabase, {
    tenantId: input.tenantId,
    userId: input.userId,
    action: 'approve',
    module: 'orders',
    entityType: 'order',
    entityId: order.id,
    newData: { status: 'closed' },
  });

  return order;
}

export async function createDelivery(
  supabase: SupabaseClient<Database>,
  input: CreateDeliveryInput,
) {
  const { data: delivery, error } = await supabase
    .from('deliveries')
    .insert({
      tenant_id: input.tenantId,
      order_id: input.orderId,
      delivery_km: input.deliveryKm ?? null,
      delivered_at: input.deliveredAt ?? new Date().toISOString(),
      responsible_user_id: input.userId,
      warranty_start: input.warrantyStart ?? null,
      warranty_end: input.warrantyEnd ?? null,
      warranty_km_limit: input.warrantyKmLimit ?? null,
      client_satisfaction: input.clientSatisfaction ?? null,
      went_well: input.wentWell ?? null,
      client_notes: input.clientNotes ?? null,
      notes: input.notes ?? null,
      status: 'delivered',
    })
    .select('id')
    .single();

  if (error || !delivery) {
    throw new Error('Não foi possível registrar a entrega.');
  }

  const checklistItems = input.checklist?.length
    ? input.checklist
    : DEFAULT_CHECKLIST_ITEMS.map((item) => ({
        itemKey: item.key,
        itemLabel: item.label,
        isChecked: false,
      }));

  await supabase.from('delivery_checklist_items').insert(
    checklistItems.map((item, index) => ({
      tenant_id: input.tenantId,
      delivery_id: delivery.id,
      item_key: item.itemKey,
      item_label: item.itemLabel,
      is_checked: item.isChecked,
      sort_order: index,
    })),
  );

  if (input.pendencies?.length) {
    await supabase.from('delivery_pendencies').insert(
      input.pendencies.map((pendency) => ({
        tenant_id: input.tenantId,
        delivery_id: delivery.id,
        order_id: input.orderId,
        title: pendency.title,
        description: pendency.description ?? null,
      })),
    );
  }

  await supabase
    .from('orders')
    .update({ delivery_status: 'delivered' })
    .eq('id', input.orderId);

  await writeTimelineEvent(supabase, {
    tenantId: input.tenantId,
    entityType: 'order',
    entityId: input.orderId,
    eventType: 'delivered',
    title: 'Veículo entregue',
    userId: input.userId,
    metadata: { delivery_id: delivery.id },
  });

  await writeAuditLog(supabase, {
    tenantId: input.tenantId,
    userId: input.userId,
    action: 'create',
    module: 'orders',
    entityType: 'delivery',
    entityId: delivery.id,
    newData: { order_id: input.orderId },
  });

  return delivery;
}

export async function createTransfer(
  supabase: SupabaseClient<Database>,
  input: CreateTransferInput,
) {
  const { data: transfer, error } = await supabase
    .from('vehicle_transfers')
    .insert({
      tenant_id: input.tenantId,
      order_id: input.orderId,
      vehicle_passage_id: input.vehiclePassageId ?? null,
      responsible_user_id: input.userId,
      third_party_name: input.thirdPartyName ?? null,
      deadline_at: input.deadlineAt ?? null,
      notes: input.notes ?? null,
      status: 'pending',
    })
    .select('id')
    .single();

  if (error || !transfer) {
    throw new Error('Não foi possível registrar a transferência.');
  }

  await supabase
    .from('orders')
    .update({ transfer_status: 'in_progress' })
    .eq('id', input.orderId);

  await writeTimelineEvent(supabase, {
    tenantId: input.tenantId,
    entityType: 'order',
    entityId: input.orderId,
    eventType: 'transfer_started',
    title: 'Transferência iniciada',
    userId: input.userId,
    metadata: { transfer_id: transfer.id },
  });

  await writeAuditLog(supabase, {
    tenantId: input.tenantId,
    userId: input.userId,
    action: 'create',
    module: 'orders',
    entityType: 'vehicle_transfer',
    entityId: transfer.id,
    newData: { order_id: input.orderId },
  });

  return transfer;
}

export async function updateTransferStage(
  supabase: SupabaseClient<Database>,
  input: {
    tenantId: string;
    userId: string;
    transferId: string;
    orderId: string;
    field: 'atpv_done' | 'signature_done' | 'sale_communication_done' | 'dispatcher_done';
    value: boolean;
  },
) {
  const updatePayload =
    input.field === 'atpv_done'
      ? { atpv_done: input.value }
      : input.field === 'signature_done'
        ? { signature_done: input.value }
        : input.field === 'sale_communication_done'
          ? { sale_communication_done: input.value }
          : { dispatcher_done: input.value };

  const { error } = await supabase
    .from('vehicle_transfers')
    .update(updatePayload)
    .eq('id', input.transferId);

  if (error) {
    throw new Error('Não foi possível atualizar a transferência.');
  }

  const { data: transfer } = await supabase
    .from('vehicle_transfers')
    .select('atpv_done, signature_done, sale_communication_done, dispatcher_done')
    .eq('id', input.transferId)
    .maybeSingle();

  if (
    transfer?.atpv_done &&
    transfer.signature_done &&
    transfer.sale_communication_done &&
    transfer.dispatcher_done
  ) {
    await supabase
      .from('vehicle_transfers')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('id', input.transferId);

    await supabase
      .from('orders')
      .update({ transfer_status: 'completed' })
      .eq('id', input.orderId);

    await writeTimelineEvent(supabase, {
      tenantId: input.tenantId,
      entityType: 'order',
      entityId: input.orderId,
      eventType: 'transfer_completed',
      title: 'Transferência concluída',
      userId: input.userId,
    });
  }
}
