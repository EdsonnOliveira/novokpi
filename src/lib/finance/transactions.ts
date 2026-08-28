import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import type { DreMonthRow } from '@/types/finance';
import { writeAuditLog } from '@/lib/timeline/audit';

interface CreateAccountInput {
  tenantId: string;
  userId: string;
  name: string;
  slug: string;
  accountType: 'bank' | 'cash' | 'wallet';
  initialBalance?: number;
}

interface CreateTransactionInput {
  tenantId: string;
  userId: string;
  accountId: string;
  categoryId: string;
  transactionType: 'income' | 'expense';
  amount: number;
  description: string;
  transactionDate?: string;
  dueDate?: string;
  originType?: string;
  originId?: string;
  originLabel?: string;
  orderId?: string;
  personId?: string;
  vehiclePassageId?: string;
  markAsPaid?: boolean;
}

interface PayTransactionInput {
  tenantId: string;
  userId: string;
  transactionId: string;
  accountId: string;
  amount: number;
  notes?: string;
}

interface ReverseTransactionInput {
  tenantId: string;
  userId: string;
  transactionId: string;
}

interface CreateDispatcherRecordInput {
  tenantId: string;
  userId: string;
  purpose: string;
  advanceReceived: number;
  orderId?: string;
  personId?: string;
  vehiclePassageId?: string;
  notes?: string;
}

export async function createFinancialAccount(
  supabase: SupabaseClient<Database>,
  input: CreateAccountInput,
) {
  const initialBalance = input.initialBalance ?? 0;

  const { data: account, error } = await supabase
    .from('financial_accounts')
    .insert({
      tenant_id: input.tenantId,
      name: input.name,
      slug: input.slug,
      account_type: input.accountType,
      initial_balance: initialBalance,
      current_balance: initialBalance,
    })
    .select('id')
    .single();

  if (error || !account) {
    throw new Error('Não foi possível criar a conta.');
  }

  await writeAuditLog(supabase, {
    tenantId: input.tenantId,
    userId: input.userId,
    action: 'create',
    module: 'finance',
    entityType: 'financial_account',
    entityId: account.id,
    newData: { name: input.name },
  });

  return account;
}

export async function createTransaction(
  supabase: SupabaseClient<Database>,
  input: CreateTransactionInput,
) {
  const isPaid = input.markAsPaid ?? false;

  const { data: transaction, error } = await supabase
    .from('financial_transactions')
    .insert({
      tenant_id: input.tenantId,
      account_id: input.accountId,
      category_id: input.categoryId,
      transaction_type: input.transactionType,
      amount: input.amount,
      paid_amount: isPaid ? input.amount : 0,
      description: input.description,
      transaction_date: input.transactionDate ?? new Date().toISOString().slice(0, 10),
      due_date: input.dueDate ?? null,
      paid_at: isPaid ? new Date().toISOString() : null,
      status: isPaid ? 'paid' : 'pending',
      origin_type: input.originType ?? null,
      origin_id: input.originId ?? null,
      origin_label: input.originLabel ?? null,
      order_id: input.orderId ?? null,
      person_id: input.personId ?? null,
      vehicle_passage_id: input.vehiclePassageId ?? null,
      created_by: input.userId,
    })
    .select('id')
    .single();

  if (error || !transaction) {
    throw new Error('Não foi possível criar o lançamento.');
  }

  if (isPaid) {
    await supabase.from('transaction_payments').insert({
      tenant_id: input.tenantId,
      transaction_id: transaction.id,
      account_id: input.accountId,
      amount: input.amount,
      created_by: input.userId,
    });
  }

  await writeAuditLog(supabase, {
    tenantId: input.tenantId,
    userId: input.userId,
    action: 'create',
    module: 'finance',
    entityType: 'financial_transaction',
    entityId: transaction.id,
    newData: {
      amount: input.amount,
      description: input.description,
      status: isPaid ? 'paid' : 'pending',
    },
  });

  return transaction;
}

export async function payTransaction(
  supabase: SupabaseClient<Database>,
  input: PayTransactionInput,
) {
  const { data: existing, error: fetchError } = await supabase
    .from('financial_transactions')
    .select('id, amount, paid_amount, status')
    .eq('id', input.transactionId)
    .maybeSingle();

  if (fetchError || !existing) {
    throw new Error('Lançamento não encontrado.');
  }

  const newPaidAmount = existing.paid_amount + input.amount;
  const newStatus =
    newPaidAmount >= existing.amount ? 'paid' : newPaidAmount > 0 ? 'partial' : existing.status;

  const { error: updateError } = await supabase
    .from('financial_transactions')
    .update({
      paid_amount: newPaidAmount,
      status: newStatus,
      paid_at: newStatus === 'paid' ? new Date().toISOString() : null,
    })
    .eq('id', input.transactionId);

  if (updateError) {
    throw new Error('Não foi possível registrar a baixa.');
  }

  await supabase.from('transaction_payments').insert({
    tenant_id: input.tenantId,
    transaction_id: input.transactionId,
    account_id: input.accountId,
    amount: input.amount,
    notes: input.notes ?? null,
    created_by: input.userId,
  });

  await writeAuditLog(supabase, {
    tenantId: input.tenantId,
    userId: input.userId,
    action: 'approve',
    module: 'finance',
    entityType: 'financial_transaction',
    entityId: input.transactionId,
    newData: { paid_amount: newPaidAmount, status: newStatus },
  });
}

export async function reverseTransaction(
  supabase: SupabaseClient<Database>,
  input: ReverseTransactionInput,
) {
  const { data: original, error: fetchError } = await supabase
    .from('financial_transactions')
    .select('*')
    .eq('id', input.transactionId)
    .maybeSingle();

  if (fetchError || !original) {
    throw new Error('Lançamento não encontrado.');
  }

  if (original.status === 'reversed') {
    throw new Error('Lançamento já estornado.');
  }

  const reversalType = original.transaction_type === 'income' ? 'expense' : 'income';

  const { data: reversal, error: createError } = await supabase
    .from('financial_transactions')
    .insert({
      tenant_id: input.tenantId,
      account_id: original.account_id,
      category_id: original.category_id,
      transaction_type: reversalType,
      amount: original.paid_amount || original.amount,
      paid_amount: original.paid_amount || original.amount,
      description: `Estorno: ${original.description}`,
      transaction_date: new Date().toISOString().slice(0, 10),
      paid_at: new Date().toISOString(),
      status: 'paid',
      origin_type: original.origin_type,
      origin_id: original.origin_id,
      origin_label: original.origin_label,
      order_id: original.order_id,
      person_id: original.person_id,
      vehicle_passage_id: original.vehicle_passage_id,
      reversed_transaction_id: original.id,
      is_reversal: true,
      created_by: input.userId,
    })
    .select('id')
    .single();

  if (createError || !reversal) {
    throw new Error('Não foi possível estornar.');
  }

  await supabase
    .from('financial_transactions')
    .update({ status: 'reversed' })
    .eq('id', original.id);

  await writeAuditLog(supabase, {
    tenantId: input.tenantId,
    userId: input.userId,
    action: 'reverse',
    module: 'finance',
    entityType: 'financial_transaction',
    entityId: original.id,
    newData: { reversal_id: reversal.id },
  });

  return reversal;
}

export async function createDispatcherRecord(
  supabase: SupabaseClient<Database>,
  input: CreateDispatcherRecordInput,
) {
  const { data: record, error } = await supabase
    .from('dispatcher_records')
    .insert({
      tenant_id: input.tenantId,
      order_id: input.orderId ?? null,
      person_id: input.personId ?? null,
      vehicle_passage_id: input.vehiclePassageId ?? null,
      purpose: input.purpose,
      advance_received: input.advanceReceived,
      balance: input.advanceReceived,
      created_by: input.userId,
      notes: input.notes ?? null,
    })
    .select('id')
    .single();

  if (error || !record) {
    throw new Error('Não foi possível registrar o adiantamento.');
  }

  await writeAuditLog(supabase, {
    tenantId: input.tenantId,
    userId: input.userId,
    action: 'create',
    module: 'finance',
    entityType: 'dispatcher_record',
    entityId: record.id,
    newData: { advance_received: input.advanceReceived },
  });

  return record;
}

interface TransactionWithCategory {
  transaction_type: string;
  amount: number;
  paid_amount: number;
  status: string;
  transaction_date: string;
  is_reversal: boolean;
  financial_categories: { dre_group: string | null; transaction_type: string } | { dre_group: string | null; transaction_type: string }[] | null;
}

export function buildDreFromTransactions(
  transactions: TransactionWithCategory[],
  year: number,
): DreMonthRow[] {
  const months: DreMonthRow[] = Array.from({ length: 12 }, (_, index) => ({
    month: index + 1,
    revenue: 0,
    vehicleCost: 0,
    financing: 0,
    dispatcher: 0,
    insurance: 0,
    consortium: 0,
    accessories: 0,
    otherIncome: 0,
    salesExpense: 0,
    payroll: 0,
    marketing: 0,
    taxes: 0,
    administrative: 0,
    otherExpense: 0,
  }));

  for (const tx of transactions) {
    const date = new Date(tx.transaction_date);
    if (date.getFullYear() !== year) continue;
    if (!['paid', 'partial'].includes(tx.status)) continue;

    const category = Array.isArray(tx.financial_categories)
      ? tx.financial_categories[0]
      : tx.financial_categories;
    const dreGroup = category?.dre_group;
    if (!dreGroup) continue;

    const value = tx.paid_amount || tx.amount;
    const monthIndex = date.getMonth();

    const map: Record<string, keyof Omit<DreMonthRow, 'month'>> = {
      revenue: 'revenue',
      vehicle_cost: 'vehicleCost',
      financing: 'financing',
      dispatcher: 'dispatcher',
      insurance: 'insurance',
      consortium: 'consortium',
      accessories: 'accessories',
      other_income: 'otherIncome',
      sales_expense: 'salesExpense',
      payroll: 'payroll',
      marketing: 'marketing',
      taxes: 'taxes',
      administrative: 'administrative',
      other_expense: 'otherExpense',
    };

    const field = map[dreGroup];
    if (!field) continue;

    if (tx.is_reversal) {
      months[monthIndex][field] -= value;
      continue;
    }

    months[monthIndex][field] += value;
  }

  return months;
}
