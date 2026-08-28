import Link from 'next/link';
import { PageTitle } from '@/components/dastone/PageTitle';
import { Card } from '@/components/dastone/Card';
import { createClient } from '@/lib/supabase/server';
import { formatCurrency, joinOne } from '@/types/orders';
import { TableEmptyRow } from '@/components/dastone/EmptyState';
import { ValueBadge } from '@/components/dastone/TableBadge';

interface ProductRow {
  id: string;
  product_name: string;
  amount: number | null;
  commission: number | null;
  expected_receipt_at: string | null;
  received_at: string | null;
  created_at: string;
  orders: {
    id: string;
    order_number: number;
    people: { full_name: string } | { full_name: string }[] | null;
  } | {
    id: string;
    order_number: number;
    people: { full_name: string } | { full_name: string }[] | null;
  }[] | null;
}

export default async function FinanceProductsPage() {
  const supabase = await createClient();

  const { data: productsData } = await supabase
    .from('order_products')
    .select(`
      id,
      product_name,
      amount,
      commission,
      expected_receipt_at,
      received_at,
      created_at,
      orders:order_id (
        id,
        order_number,
        people:person_id ( full_name )
      )
    `)
    .order('created_at', { ascending: false })
    .limit(100);

  const products = (productsData ?? []) as ProductRow[];

  const totalCommission = products.reduce((sum, p) => sum + (p.commission ?? 0), 0);
  const totalAmount = products.reduce((sum, p) => sum + (p.amount ?? 0), 0);

  return (
    <>
      <PageTitle
        title="Produtos adicionais"
        subtitle="Financiamento, seguro, consórcio, despachante, acessórios"
        breadcrumbs={[
          { label: 'Financeiro', href: '/finance' },
          { label: 'Produtos adicionais' },
        ]}
      />
      <div className="row mb-3">
        <div className="col-md-6">
          <Card>
            <p className="text-muted mb-1">Valor total produtos</p>
            <h4 className="mb-0">{formatCurrency(totalAmount)}</h4>
          </Card>
        </div>
        <div className="col-md-6">
          <Card>
            <p className="text-muted mb-1">Comissões</p>
            <h4 className="mb-0">{formatCurrency(totalCommission)}</h4>
          </Card>
        </div>
      </div>
      <Card>
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead>
              <tr>
                <th>Data</th>
                <th>Pedido</th>
                <th>Cliente</th>
                <th>Produto</th>
                <th>Valor</th>
                <th>Comissão</th>
                <th>Previsto</th>
                <th>Recebido</th>
              </tr>
            </thead>
            <tbody>
              {products.length ? (
                products.map((product) => {
                  const order = joinOne(product.orders);
                  const person = joinOne(order?.people ?? null);

                  return (
                    <tr key={product.id}>
                      <td>{new Date(product.created_at).toLocaleDateString('pt-BR')}</td>
                      <td>
                        {order ? (
                          <Link href={`/orders/${order.id}`}>
                            #{String(order.order_number).padStart(6, '0')}
                          </Link>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td>{person?.full_name ?? '—'}</td>
                      <td>{product.product_name}</td>
                      <td>
                        <ValueBadge
                          value={product.amount}
                          formatted={formatCurrency(product.amount)}
                          variant="price"
                        />
                      </td>
                      <td>
                        <ValueBadge
                          value={product.commission}
                          formatted={formatCurrency(product.commission)}
                          variant="price"
                        />
                      </td>
                      <td>
                        {product.expected_receipt_at
                          ? new Date(product.expected_receipt_at).toLocaleDateString('pt-BR')
                          : '—'}
                      </td>
                      <td>
                        {product.received_at
                          ? new Date(product.received_at).toLocaleDateString('pt-BR')
                          : '—'}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <TableEmptyRow
                  colSpan={8}
                  title="Nenhum produto adicional registrado."
                  icon="iconoir-box"
                />
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
