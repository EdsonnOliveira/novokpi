import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import { createTransaction } from '@/lib/finance/transactions';

interface SyncOrderFinanceInput {
  tenantId: string;
  userId: string;
  orderId: string;
}

export async function syncOrderFinancialEntries(
  supabase: SupabaseClient<Database>,
  input: SyncOrderFinanceInput,
) {
  const { data: order } = await supabase
    .from('orders')
    .select('id, order_number, total_value, vehicle_value, person_id, vehicle_passage_id')
    .eq('id', input.orderId)
    .eq('tenant_id', input.tenantId)
    .maybeSingle();

  if (!order) {
    throw new Error('Pedido não encontrado.');
  }

  const { data: existing } = await supabase
    .from('financial_transactions')
    .select('id')
    .eq('tenant_id', input.tenantId)
    .eq('order_id', input.orderId)
    .maybeSingle();

  if (existing) {
    return existing;
  }

  const { data: account } = await supabase
    .from('financial_accounts')
    .select('id')
    .eq('tenant_id', input.tenantId)
    .eq('slug', 'main-bank')
    .maybeSingle();

  const { data: category } = await supabase
    .from('financial_categories')
    .select('id')
    .eq('tenant_id', input.tenantId)
    .eq('slug', 'vehicle_sale')
    .maybeSingle();

  if (!account || !category) {
    throw new Error('Conta ou categoria financeira não configurada.');
  }

  const transaction = await createTransaction(supabase, {
    tenantId: input.tenantId,
    userId: input.userId,
    accountId: account.id,
    categoryId: category.id,
    transactionType: 'income',
    amount: Number(order.total_value ?? 0),
    description: `Venda — Pedido #${String(order.order_number).padStart(6, '0')}`,
    originType: 'order',
    originId: order.id,
    originLabel: `Pedido #${String(order.order_number).padStart(6, '0')}`,
    orderId: order.id,
    personId: order.person_id ?? undefined,
    vehiclePassageId: order.vehicle_passage_id ?? undefined,
    markAsPaid: false,
  });

  if (order.vehicle_value && order.vehicle_value > 0) {
    const { data: costCategory } = await supabase
      .from('financial_categories')
      .select('id')
      .eq('tenant_id', input.tenantId)
      .eq('slug', 'vehicle_purchase')
      .maybeSingle();

    if (costCategory) {
      await createTransaction(supabase, {
        tenantId: input.tenantId,
        userId: input.userId,
        accountId: account.id,
        categoryId: costCategory.id,
        transactionType: 'expense',
        amount: Number(order.vehicle_value),
        description: `Custo veículo — Pedido #${String(order.order_number).padStart(6, '0')}`,
        originType: 'order',
        originId: order.id,
        orderId: order.id,
        vehiclePassageId: order.vehicle_passage_id ?? undefined,
        markAsPaid: false,
      });
    }
  }

  return transaction;
}

export async function reconcileFinancialItem(
  supabase: SupabaseClient<Database>,
  input: {
    tenantId: string;
    userId: string;
    itemId: string;
    transactionId: string;
  },
) {
  const { error } = await supabase
    .from('financial_reconciliation_items')
    .update({
      transaction_id: input.transactionId,
      is_reconciled: true,
      reconciled_at: new Date().toISOString(),
      reconciled_by: input.userId,
    })
    .eq('id', input.itemId)
    .eq('tenant_id', input.tenantId);

  if (error) {
    throw new Error('Não foi possível conciliar item.');
  }
}
