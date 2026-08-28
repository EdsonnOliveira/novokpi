import Link from 'next/link';
import { PageTitle } from '@/components/dastone/PageTitle';
import { Card } from '@/components/dastone/Card';
import { createClient } from '@/lib/supabase/server';
import { TableEmptyRow } from '@/components/dastone/EmptyState';

export default async function OrdersPendingPage() {
  const supabase = await createClient();

  const { data: pendencies } = await supabase
    .from('delivery_pendencies')
    .select('id, title, description, is_resolved, created_at, order_id')
    .eq('is_resolved', false)
    .order('created_at', { ascending: true })
    .limit(200);

  const orderIds = [...new Set((pendencies ?? []).map((item) => item.order_id))];
  const { data: orders } = orderIds.length
    ? await supabase.from('orders').select('id, order_number').in('id', orderIds)
    : { data: [] };

  const orderMap = new Map((orders ?? []).map((order) => [order.id, order.order_number]));

  return (
    <>
      <PageTitle
        title="Pendências da Entrega"
        subtitle="Itens pendentes antes da entrega"
        breadcrumbs={[
          { label: 'Pedidos', href: '/orders' },
          { label: 'Pendências' },
        ]}
      />
      <Card>
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead>
              <tr>
                <th>Pendência</th>
                <th>Pedido</th>
                <th>Aberta em</th>
              </tr>
            </thead>
            <tbody>
              {pendencies?.length ? (
                pendencies.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.title}</strong>
                      {item.description ? <div className="text-muted small">{item.description}</div> : null}
                    </td>
                    <td>
                      <Link href={`/orders/${item.order_id}`}>#{orderMap.get(item.order_id) ?? item.order_id.slice(0, 8)}</Link>
                    </td>
                    <td>{new Date(item.created_at).toLocaleDateString('pt-BR')}</td>
                  </tr>
                ))
              ) : (
                <TableEmptyRow
                  colSpan={3}
                  title="Nenhuma pendência aberta."
                  icon="iconoir-warning-circle"
                />
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
