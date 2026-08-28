import Link from 'next/link';
import { PageTitle } from '@/components/dastone/PageTitle';
import { Card } from '@/components/dastone/Card';
import { createClient } from '@/lib/supabase/server';
import {
  formatCurrency,
  formatTransactionStatus,
  joinOne,
  type TransactionListRow,
} from '@/types/finance';

export default async function FinanceStatementPage({
  searchParams,
}: {
  searchParams: Promise<{ account?: string }>;
}) {
  const { account: accountId } = await searchParams;
  const supabase = await createClient();

  const { data: accounts } = await supabase
    .from('financial_accounts')
    .select('id, name, current_balance')
    .eq('is_active', true)
    .order('name');

  let query = supabase
    .from('financial_transactions')
    .select(`
      id,
      account_id,
      transaction_type,
      amount,
      paid_amount,
      description,
      transaction_date,
      status,
      origin_label,
      financial_accounts:account_id ( name ),
      financial_categories:category_id ( name )
    `)
    .in('status', ['paid', 'partial', 'pending'])
    .order('transaction_date', { ascending: false })
    .limit(200);

  if (accountId) {
    query = query.eq('account_id', accountId);
  }

  const { data: transactionsData } = await query;
  const transactions = (transactionsData ?? []) as TransactionListRow[];

  return (
    <>
      <PageTitle
        title="Extrato"
        subtitle="Movimentações por conta"
        breadcrumbs={[
          { label: 'Financeiro', href: '/finance' },
          { label: 'Extrato' },
        ]}
      />
      <Card title="Filtrar por conta">
        <div className="d-flex flex-wrap gap-2">
          <Link
            href="/finance/statement"
            className={`btn btn-sm ${!accountId ? 'btn-primary' : 'btn-light'}`}
          >
            Todas
          </Link>
          {accounts?.map((account) => (
            <Link
              key={account.id}
              href={`/finance/statement?account=${account.id}`}
              className={`btn btn-sm ${accountId === account.id ? 'btn-primary' : 'btn-light'}`}
            >
              {account.name}
            </Link>
          ))}
        </div>
      </Card>
      <Card title="Movimentações" className="mt-3">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead>
              <tr>
                <th>Data</th>
                <th>Conta</th>
                <th>Descrição</th>
                <th>Categoria</th>
                <th>Tipo</th>
                <th>Valor</th>
                <th>Status</th>
                <th>Origem</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length ? (
                transactions.map((tx) => {
                  const account = joinOne(tx.financial_accounts);
                  const category = joinOne(tx.financial_categories);

                  return (
                    <tr key={tx.id}>
                      <td>{new Date(tx.transaction_date).toLocaleDateString('pt-BR')}</td>
                      <td>{account?.name ?? '—'}</td>
                      <td>{tx.description}</td>
                      <td>{category?.name ?? '—'}</td>
                      <td>{tx.transaction_type === 'income' ? 'Receita' : 'Despesa'}</td>
                      <td className={tx.transaction_type === 'income' ? 'text-success' : 'text-danger'}>
                        {tx.transaction_type === 'income' ? '+' : '-'}
                        {formatCurrency(tx.paid_amount || tx.amount)}
                      </td>
                      <td>{formatTransactionStatus(tx.status)}</td>
                      <td>{tx.origin_label ?? '—'}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="text-center text-muted py-4">
                    Nenhuma movimentação.
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
