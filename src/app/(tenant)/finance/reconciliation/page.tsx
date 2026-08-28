import { PageTitle } from '@/components/dastone/PageTitle';
import { Card } from '@/components/dastone/Card';
import { ReconciliationActions } from '@/components/finance/ReconciliationActions';
import { createClient } from '@/lib/supabase/server';
import { getTenantContext } from '@/lib/settings/tenant-context';
import { redirect } from 'next/navigation';
import { TableEmptyRow } from '@/components/dastone/EmptyState';
import { StatusBadge, ValueBadge } from '@/components/dastone/TableBadge';

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default async function FinanceReconciliationPage() {
  const supabase = await createClient();
  const context = await getTenantContext(supabase);

  if (!context) {
    redirect('/login');
  }

  const { data: items } = await supabase
    .from('financial_reconciliation_items')
    .select('id, bank_date, description, amount, is_reconciled, account_id, transaction_id')
    .eq('tenant_id', context.tenantId)
    .order('bank_date', { ascending: false })
    .limit(200);

  const accountIds = [...new Set((items ?? []).map((item) => item.account_id).filter(Boolean))];
  const { data: accounts } = accountIds.length
    ? await supabase.from('financial_accounts').select('id, name').in('id', accountIds as string[])
    : { data: [] };

  const accountMap = new Map((accounts ?? []).map((account) => [account.id, account.name]));
  const pending = (items ?? []).filter((item) => !item.is_reconciled).length;
  const reconciled = (items ?? []).filter((item) => item.is_reconciled).length;

  return (
    <>
      <PageTitle
        title="Conciliação"
        subtitle="Conferência bancária x lançamentos"
        breadcrumbs={[
          { label: 'Financeiro', href: '/finance' },
          { label: 'Conciliação' },
        ]}
      />
      <div className="row mb-3">
        <div className="col-md-6">
          <Card>
            <p className="text-muted mb-1">Pendentes</p>
            <h4 className="mb-0">{pending}</h4>
          </Card>
        </div>
        <div className="col-md-6">
          <Card>
            <p className="text-muted mb-1">Conciliados</p>
            <h4 className="mb-0">{reconciled}</h4>
          </Card>
        </div>
      </div>
      <Card title="Extrato bancário">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead>
              <tr>
                <th>Data</th>
                <th>Conta</th>
                <th>Descrição</th>
                <th>Valor</th>
                <th>Status</th>
                <th>Ação</th>
              </tr>
            </thead>
            <tbody>
              {items?.length ? (
                items.map((item) => (
                  <tr key={item.id}>
                    <td>{new Date(item.bank_date).toLocaleDateString('pt-BR')}</td>
                    <td>{item.account_id ? accountMap.get(item.account_id) ?? '—' : '—'}</td>
                    <td>{item.description ?? '—'}</td>
                    <td>
                      <ValueBadge
                        value={Number(item.amount)}
                        formatted={formatCurrency(Number(item.amount))}
                        variant="default"
                      />
                    </td>
                    <td>
                      <StatusBadge
                        label={item.is_reconciled ? 'Conciliado' : 'Pendente'}
                        status={item.is_reconciled ? 'matched' : 'pending'}
                      />
                    </td>
                    <td>
                      {!item.is_reconciled ? (
                        <ReconciliationActions
                          item={{
                            id: item.id,
                            account_id: item.account_id,
                            bank_date: item.bank_date,
                            amount: Number(item.amount),
                            description: item.description,
                          }}
                        />
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <TableEmptyRow
                  colSpan={6}
                  title="Nenhum item de conciliação."
                  icon="iconoir-check-circle"
                />
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
