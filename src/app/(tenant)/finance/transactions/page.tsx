import { PageTitle } from '@/components/dastone/PageTitle';
import { Card } from '@/components/dastone/Card';
import { TransactionActions, TransactionForm } from '@/components/finance/TransactionForm';
import { createClient } from '@/lib/supabase/server';
import { TableEmptyRow } from '@/components/dastone/EmptyState';
import { StatusBadge, ValueBadge } from '@/components/dastone/TableBadge';
import {
  formatCurrency,
  formatTransactionStatus,
  joinOne,
  type FinancialAccount,
  type FinancialCategory,
  type TransactionListRow,
} from '@/types/finance';

export default async function FinanceTransactionsPage() {
  const supabase = await createClient();

  const [{ data: accountsData }, { data: categoriesData }, { data: transactionsData }] =
    await Promise.all([
      supabase
        .from('financial_accounts')
        .select('id, name, slug, account_type, initial_balance, current_balance, is_active')
        .eq('is_active', true)
        .order('name'),
      supabase
        .from('financial_categories')
        .select('id, name, slug, transaction_type, dre_group')
        .eq('is_active', true)
        .order('sort_order'),
      supabase
        .from('financial_transactions')
        .select(`
          id,
          account_id,
          transaction_type,
          amount,
          paid_amount,
          description,
          transaction_date,
          due_date,
          paid_at,
          status,
          origin_label,
          account_id,
          financial_accounts:account_id ( name ),
          financial_categories:category_id ( name, dre_group )
        `)
        .order('transaction_date', { ascending: false })
        .limit(100),
    ]);

  const accounts = (accountsData ?? []) as FinancialAccount[];
  const categories = (categoriesData ?? []) as FinancialCategory[];
  const transactions = (transactionsData ?? []) as TransactionListRow[];

  return (
    <>
      <PageTitle
        title="Lançamentos"
        subtitle="Receitas e despesas"
        breadcrumbs={[
          { label: 'Financeiro', href: '/finance' },
          { label: 'Lançamentos' },
        ]}
      />
      <Card title="Novo lançamento">
        <TransactionForm accounts={accounts} categories={categories} />
      </Card>
      <Card title="Lançamentos recentes" className="mt-3">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead>
              <tr>
                <th>Data</th>
                <th>Descrição</th>
                <th>Conta</th>
                <th>Categoria</th>
                <th>Tipo</th>
                <th>Valor</th>
                <th>Pago</th>
                <th>Status</th>
                <th>Origem</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {transactions.length ? (
                transactions.map((tx) => {
                  const account = joinOne(tx.financial_accounts);
                  const category = joinOne(tx.financial_categories);
                  const remaining = tx.amount - tx.paid_amount;

                  return (
                    <tr key={tx.id}>
                      <td>{new Date(tx.transaction_date).toLocaleDateString('pt-BR')}</td>
                      <td>{tx.description}</td>
                      <td>{account?.name ?? '—'}</td>
                      <td>{category?.name ?? '—'}</td>
                      <td>
                        <StatusBadge
                          status={tx.transaction_type}
                          label={tx.transaction_type === 'income' ? 'Receita' : 'Despesa'}
                        />
                      </td>
                      <td>
                        <ValueBadge
                          value={tx.amount}
                          formatted={formatCurrency(tx.amount)}
                          variant={tx.transaction_type === 'income' ? 'income' : 'expense'}
                        />
                      </td>
                      <td>
                        <ValueBadge
                          value={tx.paid_amount}
                          formatted={formatCurrency(tx.paid_amount)}
                          variant={tx.transaction_type === 'income' ? 'income' : 'expense'}
                        />
                      </td>
                      <td>
                        <StatusBadge
                          status={tx.status}
                          label={formatTransactionStatus(tx.status)}
                        />
                      </td>
                      <td>{tx.origin_label ?? '—'}</td>
                      <td>
                        <TransactionActions
                          transactionId={tx.id}
                          accountId={tx.account_id}
                          status={tx.status}
                          remainingAmount={remaining}
                        />
                      </td>
                    </tr>
                  );
                })
              ) : (
                <TableEmptyRow
                  colSpan={10}
                  title="Nenhum lançamento."
                  icon="iconoir-wallet"
                />
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
