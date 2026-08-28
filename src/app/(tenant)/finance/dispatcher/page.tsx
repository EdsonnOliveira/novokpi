import { PageTitle } from '@/components/dastone/PageTitle';
import { Card } from '@/components/dastone/Card';
import { DispatcherForm } from '@/components/finance/DispatcherForm';
import { createClient } from '@/lib/supabase/server';
import { TableEmptyRow } from '@/components/dastone/EmptyState';
import { StatusBadge, ValueBadge } from '@/components/dastone/TableBadge';
import {
  formatCurrency,
  joinOne,
  type DispatcherRecordRow,
} from '@/types/finance';

export default async function FinanceDispatcherPage() {
  const supabase = await createClient();

  const { data: recordsData } = await supabase
    .from('dispatcher_records')
    .select(`
      id,
      purpose,
      advance_received,
      costs_paid,
      balance,
      revenue_recognized,
      status,
      created_at,
      people:person_id ( full_name ),
      orders:order_id ( order_number )
    `)
    .order('created_at', { ascending: false })
    .limit(100);

  const records = (recordsData ?? []) as DispatcherRecordRow[];

  const totalAdvance = records.reduce((sum, r) => sum + r.advance_received, 0);
  const totalCosts = records.reduce((sum, r) => sum + r.costs_paid, 0);
  const totalBalance = records.reduce((sum, r) => sum + r.balance, 0);
  const totalRevenue = records.reduce((sum, r) => sum + r.revenue_recognized, 0);

  return (
    <>
      <PageTitle
        title="Despachante"
        subtitle="Adiantamentos e custos consolidados"
        breadcrumbs={[
          { label: 'Financeiro', href: '/finance' },
          { label: 'Despachante' },
        ]}
      />
      <div className="row mb-3">
        <div className="col-md-3">
          <Card>
            <p className="text-muted mb-1">Adiantamentos</p>
            <h4 className="mb-0">{formatCurrency(totalAdvance)}</h4>
          </Card>
        </div>
        <div className="col-md-3">
          <Card>
            <p className="text-muted mb-1">Custos pagos</p>
            <h4 className="mb-0">{formatCurrency(totalCosts)}</h4>
          </Card>
        </div>
        <div className="col-md-3">
          <Card>
            <p className="text-muted mb-1">Saldo disponível</p>
            <h4 className="mb-0">{formatCurrency(totalBalance)}</h4>
          </Card>
        </div>
        <div className="col-md-3">
          <Card>
            <p className="text-muted mb-1">Receita/sobra</p>
            <h4 className="mb-0">{formatCurrency(totalRevenue)}</h4>
          </Card>
        </div>
      </div>
      <Card title="Novo adiantamento">
        <DispatcherForm />
      </Card>
      <Card title="Registros" className="mt-3">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead>
              <tr>
                <th>Data</th>
                <th>Finalidade</th>
                <th>Cliente</th>
                <th>Pedido</th>
                <th>Adiantamento</th>
                <th>Custos</th>
                <th>Saldo</th>
                <th>Receita</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {records.length ? (
                records.map((record) => {
                  const person = joinOne(record.people);
                  const order = joinOne(record.orders);

                  return (
                    <tr key={record.id}>
                      <td>{new Date(record.created_at).toLocaleDateString('pt-BR')}</td>
                      <td>{record.purpose}</td>
                      <td>{person?.full_name ?? '—'}</td>
                      <td>
                        {order ? `#${String(order.order_number).padStart(6, '0')}` : '—'}
                      </td>
                      <td>
                        <ValueBadge
                          value={record.advance_received}
                          formatted={formatCurrency(record.advance_received)}
                          variant="price"
                        />
                      </td>
                      <td>
                        <ValueBadge
                          value={record.costs_paid}
                          formatted={formatCurrency(record.costs_paid)}
                          variant="expense"
                        />
                      </td>
                      <td>
                        <ValueBadge
                          value={record.balance}
                          formatted={formatCurrency(record.balance)}
                          variant="balance"
                        />
                      </td>
                      <td>
                        <ValueBadge
                          value={record.revenue_recognized}
                          formatted={formatCurrency(record.revenue_recognized)}
                          variant="income"
                        />
                      </td>
                      <td>
                        <StatusBadge status={record.status} label={record.status} />
                      </td>
                    </tr>
                  );
                })
              ) : (
                <TableEmptyRow
                  colSpan={9}
                  title="Nenhum registro de despachante."
                  icon="iconoir-doc-search"
                />
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
