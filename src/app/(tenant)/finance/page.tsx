import Link from 'next/link';
import { PageTitle } from '@/components/dastone/PageTitle';
import { Card } from '@/components/dastone/Card';
import { createClient } from '@/lib/supabase/server';
import { formatCurrency } from '@/types/finance';

export default async function FinancePage() {
  const supabase = await createClient();

  const { data: accountsList } = await supabase
    .from('financial_accounts')
    .select('id, name, current_balance')
    .eq('is_active', true)
    .order('name');

  const monthStart = new Date();
  monthStart.setDate(1);
  const monthStartStr = monthStart.toISOString().slice(0, 10);

  const { data: monthTransactions } = await supabase
    .from('financial_transactions')
    .select('transaction_type, paid_amount, amount, status')
    .gte('transaction_date', monthStartStr)
    .in('status', ['paid', 'partial']);

  let monthIncome = 0;
  let monthExpense = 0;
  let pendingCount = 0;

  monthTransactions?.forEach((tx) => {
    const value = tx.paid_amount || tx.amount;
    if (tx.transaction_type === 'income') monthIncome += value;
    else monthExpense += value;
  });

  const { count } = await supabase
    .from('financial_transactions')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'pending');

  pendingCount = count ?? 0;

  const totalBalance = accountsList?.reduce((sum, a) => sum + a.current_balance, 0) ?? 0;

  return (
    <>
      <PageTitle
        title="Financeiro"
        subtitle="Visão geral financeira"
        breadcrumbs={[{ label: 'Financeiro' }]}
        actions={
          <Link href="/finance/transactions" className="btn btn-primary btn-sm">
            Novo lançamento
          </Link>
        }
      />
      <div className="row mb-3">
        <div className="col-md-3">
          <Card>
            <p className="text-muted mb-1">Saldo total</p>
            <h4 className="mb-0">{formatCurrency(totalBalance)}</h4>
          </Card>
        </div>
        <div className="col-md-3">
          <Card>
            <p className="text-muted mb-1">Receitas do mês</p>
            <h4 className="mb-0 text-success">{formatCurrency(monthIncome)}</h4>
          </Card>
        </div>
        <div className="col-md-3">
          <Card>
            <p className="text-muted mb-1">Despesas do mês</p>
            <h4 className="mb-0 text-danger">{formatCurrency(monthExpense)}</h4>
          </Card>
        </div>
        <div className="col-md-3">
          <Card>
            <p className="text-muted mb-1">Pendentes</p>
            <h4 className="mb-0">{pendingCount}</h4>
          </Card>
        </div>
      </div>
      <div className="row">
        <div className="col-md-4 mb-3">
          <Card title="Atalhos">
            <div className="d-grid gap-2">
              <Link href="/finance/accounts" className="btn btn-light btn-sm">
                Contas financeiras
              </Link>
              <Link href="/finance/transactions" className="btn btn-light btn-sm">
                Lançamentos
              </Link>
              <Link href="/finance/statement" className="btn btn-light btn-sm">
                Extrato
              </Link>
              <Link href="/finance/cashflow" className="btn btn-light btn-sm">
                Fluxo de caixa
              </Link>
              <Link href="/finance/dre" className="btn btn-light btn-sm">
                DRE
              </Link>
              <Link href="/finance/dispatcher" className="btn btn-light btn-sm">
                Despachante
              </Link>
            </div>
          </Card>
        </div>
        <div className="col-md-8 mb-3">
          <Card title="Contas">
            <div className="table-responsive">
              <table className="table table-sm mb-0">
                <thead>
                  <tr>
                    <th>Conta</th>
                    <th>Saldo</th>
                  </tr>
                </thead>
                <tbody>
                  {accountsList?.length ? (
                    accountsList.map((account) => (
                      <tr key={account.id}>
                        <td>{account.name}</td>
                        <td>{formatCurrency(account.current_balance)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={2} className="text-muted">Nenhuma conta.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
