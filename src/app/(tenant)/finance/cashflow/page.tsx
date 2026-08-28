import { PageTitle } from '@/components/dastone/PageTitle';
import { Card } from '@/components/dastone/Card';
import { createClient } from '@/lib/supabase/server';
import { formatCurrency, MONTH_LABELS } from '@/types/finance';

export default async function FinanceCashflowPage() {
  const supabase = await createClient();
  const year = new Date().getFullYear();

  const { data: transactions } = await supabase
    .from('financial_transactions')
    .select('transaction_type, paid_amount, amount, transaction_date, status')
    .gte('transaction_date', `${year}-01-01`)
    .lte('transaction_date', `${year}-12-31`)
    .in('status', ['paid', 'partial']);

  const months = Array.from({ length: 12 }, (_, index) => ({
    month: index + 1,
    income: 0,
    expense: 0,
  }));

  transactions?.forEach((tx) => {
    const date = new Date(tx.transaction_date);
    const monthIndex = date.getMonth();
    const value = tx.paid_amount || tx.amount;
    if (tx.transaction_type === 'income') {
      months[monthIndex].income += value;
    } else {
      months[monthIndex].expense += value;
    }
  });

  const totalIncome = months.reduce((sum, m) => sum + m.income, 0);
  const totalExpense = months.reduce((sum, m) => sum + m.expense, 0);

  return (
    <>
      <PageTitle
        title="Fluxo de caixa"
        subtitle={`Entradas e saídas ${year}`}
        breadcrumbs={[
          { label: 'Financeiro', href: '/finance' },
          { label: 'Fluxo de caixa' },
        ]}
      />
      <div className="row mb-3">
        <div className="col-md-4">
          <Card>
            <p className="text-muted mb-1">Total entradas</p>
            <h4 className="mb-0 text-success">{formatCurrency(totalIncome)}</h4>
          </Card>
        </div>
        <div className="col-md-4">
          <Card>
            <p className="text-muted mb-1">Total saídas</p>
            <h4 className="mb-0 text-danger">{formatCurrency(totalExpense)}</h4>
          </Card>
        </div>
        <div className="col-md-4">
          <Card>
            <p className="text-muted mb-1">Resultado</p>
            <h4 className="mb-0">{formatCurrency(totalIncome - totalExpense)}</h4>
          </Card>
        </div>
      </div>
      <Card>
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead>
              <tr>
                <th>Mês</th>
                <th>Entradas</th>
                <th>Saídas</th>
                <th>Resultado</th>
              </tr>
            </thead>
            <tbody>
              {months.map((row, index) => (
                <tr key={row.month}>
                  <td>{MONTH_LABELS[index]}</td>
                  <td className="text-success">{formatCurrency(row.income)}</td>
                  <td className="text-danger">{formatCurrency(row.expense)}</td>
                  <td>{formatCurrency(row.income - row.expense)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th>Total</th>
                <th className="text-success">{formatCurrency(totalIncome)}</th>
                <th className="text-danger">{formatCurrency(totalExpense)}</th>
                <th>{formatCurrency(totalIncome - totalExpense)}</th>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>
    </>
  );
}
