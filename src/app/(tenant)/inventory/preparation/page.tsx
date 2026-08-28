import Link from 'next/link';
import { PageTitle } from '@/components/dastone/PageTitle';
import { Card } from '@/components/dastone/Card';
import { createClient } from '@/lib/supabase/server';
import { formatCurrency, joinOne } from '@/types/inventory';
import { TableEmptyRow } from '@/components/dastone/EmptyState';
import { StatusBadge, ValueBadge } from '@/components/dastone/TableBadge';

interface PreparationOrderRow {
  id: string;
  title: string;
  actual_cost: number;
  status: string;
  is_internal: boolean;
  supplier_name: string | null;
  created_at: string;
  vehicle_passages: {
    id: string;
    vehicles: { plate: string | null } | { plate: string | null }[] | null;
  } | {
    id: string;
    vehicles: { plate: string | null } | { plate: string | null }[] | null;
  }[] | null;
}

export default async function PreparationListPage() {
  const supabase = await createClient();

  const { data: orders } = await supabase
    .from('preparation_orders')
    .select(`
      id,
      title,
      actual_cost,
      status,
      is_internal,
      supplier_name,
      created_at,
      vehicle_passages:passage_id (
        id,
        vehicles:vehicle_id ( plate )
      )
    `)
    .order('created_at', { ascending: false })
    .limit(100);

  return (
    <>
      <PageTitle
        title="Preparação / OS"
        subtitle="Ordens de serviço de todos os veículos"
        breadcrumbs={[
          { label: 'Estoque', href: '/inventory' },
          { label: 'Preparação' },
        ]}
      />
      <Card>
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead>
              <tr>
                <th>Data</th>
                <th>Placa</th>
                <th>Serviço</th>
                <th>Tipo</th>
                <th>Custo</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {(orders as PreparationOrderRow[] | null)?.length ? (
                (orders as PreparationOrderRow[]).map((order) => {
                  const passage = joinOne(order.vehicle_passages);
                  const vehicle = joinOne(passage?.vehicles ?? null);

                  return (
                    <tr key={order.id}>
                      <td>{new Date(order.created_at).toLocaleDateString('pt-BR')}</td>
                      <td>
                        {passage ? (
                          <Link href={`/inventory/${passage.id}`}>{vehicle?.plate ?? '—'}</Link>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td>{order.title}</td>
                      <td>{order.is_internal ? 'Interno' : order.supplier_name ?? 'Terceiro'}</td>
                      <td>
                        <ValueBadge
                          value={order.actual_cost}
                          formatted={formatCurrency(order.actual_cost)}
                          variant="price"
                        />
                      </td>
                      <td>
                        <StatusBadge status={order.status} label={order.status} />
                      </td>
                    </tr>
                  );
                })
              ) : (
                <TableEmptyRow
                  colSpan={6}
                  title="Nenhuma OS registrada."
                  icon="iconoir-tools"
                />
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
