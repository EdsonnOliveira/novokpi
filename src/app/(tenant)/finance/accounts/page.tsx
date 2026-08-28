import { PageTitle } from '@/components/dastone/PageTitle';
import { Card } from '@/components/dastone/Card';
import { AccountForm } from '@/components/finance/AccountForm';
import { createClient } from '@/lib/supabase/server';
import { formatAccountType, formatCurrency } from '@/types/finance';
import { TableEmptyRow } from '@/components/dastone/EmptyState';
import { StatusBadge, ValueBadge } from '@/components/dastone/TableBadge';

export default async function FinanceAccountsPage() {
  const supabase = await createClient();

  const { data: accounts } = await supabase
    .from('financial_accounts')
    .select('id, name, slug, account_type, initial_balance, current_balance, is_active')
    .order('name');

  return (
    <>
      <PageTitle
        title="Contas financeiras"
        subtitle="Bancos, caixa e carteiras"
        breadcrumbs={[
          { label: 'Financeiro', href: '/finance' },
          { label: 'Contas' },
        ]}
      />
      <Card title="Nova conta">
        <AccountForm />
      </Card>
      <Card title="Contas cadastradas" className="mt-3">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Tipo</th>
                <th>Saldo inicial</th>
                <th>Saldo atual</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {accounts?.length ? (
                accounts.map((account) => (
                  <tr key={account.id}>
                    <td>{account.name}</td>
                    <td>{formatAccountType(account.account_type)}</td>
                    <td>
                      <ValueBadge
                        value={account.initial_balance}
                        formatted={formatCurrency(account.initial_balance)}
                        variant="balance"
                      />
                    </td>
                    <td>
                      <ValueBadge
                        value={account.current_balance}
                        formatted={formatCurrency(account.current_balance)}
                        variant="balance"
                      />
                    </td>
                    <td>
                      <StatusBadge label={account.is_active ? 'Ativa' : 'Inativa'} active={account.is_active} />
                    </td>
                  </tr>
                ))
              ) : (
                <TableEmptyRow
                  colSpan={5}
                  title="Nenhuma conta cadastrada."
                  icon="iconoir-bank"
                />
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
