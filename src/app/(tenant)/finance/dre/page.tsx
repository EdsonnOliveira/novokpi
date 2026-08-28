import { PageTitle } from '@/components/dastone/PageTitle';
import { Card } from '@/components/dastone/Card';
import { ValueBadge } from '@/components/dastone/TableBadge';
import { createClient } from '@/lib/supabase/server';
import { buildDreFromTransactions } from '@/lib/finance/transactions';
import {
  calcGrossProfit,
  calcOperatingResult,
  DRE_ROWS,
  formatCurrency,
  MONTH_LABELS,
} from '@/types/finance';
import type { ValueBadgeVariant } from '@/lib/ui/table-badges';

function renderDreValue(value: number, variant: ValueBadgeVariant) {
  return <ValueBadge value={value} formatted={formatCurrency(value)} variant={variant} />;
}

export default async function FinanceDrePage() {
  const supabase = await createClient();
  const year = new Date().getFullYear();

  const { data: transactions } = await supabase
    .from('financial_transactions')
    .select(`
      transaction_type,
      amount,
      paid_amount,
      status,
      transaction_date,
      is_reversal,
      financial_categories:category_id ( dre_group, transaction_type )
    `)
    .gte('transaction_date', `${year}-01-01`)
    .lte('transaction_date', `${year}-12-31`);

  const dreMonths = buildDreFromTransactions(transactions ?? [], year);

  const dreFieldMap: Record<string, keyof typeof dreMonths[0]> = {
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

  function getRowTotal(key: string): number {
    const field = dreFieldMap[key];
    if (!field || field === 'month') return 0;
    return dreMonths.reduce((sum, row) => sum + (row[field] as number), 0);
  }

  return (
    <>
      <PageTitle
        title="DRE"
        subtitle={`Demonstrativo de resultados ${year}`}
        breadcrumbs={[
          { label: 'Financeiro', href: '/finance' },
          { label: 'DRE' },
        ]}
      />
      <Card>
        <div className="table-responsive">
          <table className="table table-sm table-bordered mb-0">
            <thead>
              <tr>
                <th>Linha</th>
                {MONTH_LABELS.map((label) => (
                  <th key={label} className="text-end">{label}</th>
                ))}
                <th className="text-end">Total</th>
              </tr>
            </thead>
            <tbody>
              {DRE_ROWS.map((row) => {
                const field = dreFieldMap[row.key];
                return (
                  <tr key={row.key}>
                    <td>{row.label}</td>
                    {dreMonths.map((monthRow) => {
                      const amount = field && field !== 'month' ? (monthRow[field] as number) : null;
                      return (
                        <td key={monthRow.month} className="text-end">
                          {amount === null ? '—' : renderDreValue(amount, row.type === 'mixed' ? 'price' : row.type)}
                        </td>
                      );
                    })}
                    <td className="text-end fw-semibold">
                      {renderDreValue(getRowTotal(row.key), row.type === 'mixed' ? 'price' : row.type)}
                    </td>
                  </tr>
                );
              })}
              <tr className="table-light">
                <td>= Lucro bruto</td>
                {dreMonths.map((monthRow) => {
                  const amount = calcGrossProfit(monthRow);
                  return (
                    <td key={monthRow.month} className="text-end">
                      {renderDreValue(amount, 'balance')}
                    </td>
                  );
                })}
                <td className="text-end fw-semibold">
                  {renderDreValue(
                    dreMonths.reduce((sum, row) => sum + calcGrossProfit(row), 0),
                    'balance',
                  )}
                </td>
              </tr>
              <tr className="table-primary">
                <td><strong>= Resultado operacional</strong></td>
                {dreMonths.map((monthRow) => {
                  const amount = calcOperatingResult(monthRow);
                  return (
                    <td key={monthRow.month} className="text-end">
                      <strong>{renderDreValue(amount, 'balance')}</strong>
                    </td>
                  );
                })}
                <td className="text-end">
                  <strong>
                    {renderDreValue(
                      dreMonths.reduce((sum, row) => sum + calcOperatingResult(row), 0),
                      'balance',
                    )}
                  </strong>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
