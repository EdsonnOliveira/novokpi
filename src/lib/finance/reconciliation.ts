import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

interface ReconciliationItemInput {
  id: string;
  account_id: string | null;
  bank_date: string;
  amount: number;
  description: string | null;
}

export async function findReconciliationMatch(
  supabase: SupabaseClient<Database>,
  tenantId: string,
  item: ReconciliationItemInput,
) {
  const targetAmount = Math.abs(Number(item.amount));

  let query = supabase
    .from('financial_transactions')
    .select('id, amount, due_date, transaction_date, description, account_id')
    .eq('tenant_id', tenantId)
    .eq('status', 'pending');

  if (item.account_id) {
    query = query.eq('account_id', item.account_id);
  }

  const { data: transactions } = await query.limit(100);

  if (!transactions?.length) {
    return null;
  }

  const bankDate = new Date(item.bank_date).getTime();

  const scored = transactions
    .map((transaction) => {
      const transactionAmount = Math.abs(Number(transaction.amount));
      const amountDiff = Math.abs(transactionAmount - targetAmount);
      const dueDate = transaction.due_date ?? transaction.transaction_date;
      const dateDiff = dueDate
        ? Math.abs(new Date(dueDate).getTime() - bankDate)
        : Number.MAX_SAFE_INTEGER;

      return { transaction, amountDiff, dateDiff };
    })
    .filter((entry) => entry.amountDiff < 0.01)
    .sort((a, b) => a.dateDiff - b.dateDiff);

  return scored[0]?.transaction.id ?? null;
}

export async function reconcileFinancialItemByMatch(
  supabase: SupabaseClient<Database>,
  input: {
    tenantId: string;
    userId: string;
    item: ReconciliationItemInput;
  },
) {
  const transactionId = await findReconciliationMatch(supabase, input.tenantId, input.item);

  if (!transactionId) {
    throw new Error('Nenhum lançamento pendente compatível encontrado.');
  }

  const { error } = await supabase
    .from('financial_reconciliation_items')
    .update({
      transaction_id: transactionId,
      is_reconciled: true,
      reconciled_at: new Date().toISOString(),
      reconciled_by: input.userId,
    })
    .eq('id', input.item.id)
    .eq('tenant_id', input.tenantId);

  if (error) {
    throw new Error('Não foi possível conciliar item.');
  }

  return transactionId;
}
