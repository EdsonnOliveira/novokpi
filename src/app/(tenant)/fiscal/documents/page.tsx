import Link from 'next/link';
import { PageTitle } from '@/components/dastone/PageTitle';
import { Card } from '@/components/dastone/Card';
import { createClient } from '@/lib/supabase/server';
import { getTenantContext } from '@/lib/settings/tenant-context';
import { TableEmptyRow } from '@/components/dastone/EmptyState';
import {
  formatDocumentNature,
  formatDocumentStatus,
  formatDocumentType,
  formatFiscalCurrency,
  getDocumentStatusBadge,
  type FiscalDocumentRow,
} from '@/types/fiscal';

function joinOne<T>(value: T | T[] | null): T | null {
  if (!value) return null;
  return Array.isArray(value) ? value[0] ?? null : value;
}

export default async function FiscalDocumentsPage() {
  const supabase = await createClient();
  const context = await getTenantContext(supabase);

  let documents: FiscalDocumentRow[] = [];

  if (context?.tenantId) {
    const { data } = await supabase
      .from('fiscal_documents')
      .select(`
        id,
        document_type,
        nature,
        status,
        document_number,
        document_series,
        access_key,
        total_value,
        recipient_name,
        recipient_document,
        created_at,
        orders:order_id ( order_number ),
        people:person_id ( full_name )
      `)
      .eq('tenant_id', context.tenantId)
      .order('created_at', { ascending: false })
      .limit(200);

    documents = (data ?? []) as FiscalDocumentRow[];
  }

  return (
    <>
      <PageTitle
        title="Documentos fiscais"
        subtitle="NFS-e, NF-e e demais notas"
        breadcrumbs={[
          { label: 'Fiscal / Notas', href: '/fiscal' },
          { label: 'Documentos' },
        ]}
        actions={
          <div className="d-flex gap-2">
            <Link href="/fiscal/nfse/new" className="btn btn-outline-primary btn-sm">
              NFS-e
            </Link>
            <Link href="/fiscal/nfe/new" className="btn btn-primary btn-sm">
              NF-e
            </Link>
          </div>
        }
      />
      <Card>
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead>
              <tr>
                <th>Data</th>
                <th>Tipo</th>
                <th>Natureza</th>
                <th>Número</th>
                <th>Destinatário</th>
                <th>Valor</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {documents.length ? (
                documents.map((doc) => {
                  const order = joinOne(doc.orders);
                  const person = joinOne(doc.people);
                  const label =
                    doc.recipient_name ?? person?.full_name ?? (order ? `Pedido #${order.order_number}` : '—');

                  return (
                    <tr key={doc.id}>
                      <td>{new Date(doc.created_at).toLocaleDateString('pt-BR')}</td>
                      <td>{formatDocumentType(doc.document_type)}</td>
                      <td>{formatDocumentNature(doc.nature)}</td>
                      <td>
                        {doc.document_series && doc.document_number
                          ? `${doc.document_series}/${doc.document_number}`
                          : '—'}
                      </td>
                      <td>{label}</td>
                      <td>{formatFiscalCurrency(doc.total_value)}</td>
                      <td>
                        <span className={`badge ${getDocumentStatusBadge(doc.status)}`}>
                          {formatDocumentStatus(doc.status)}
                        </span>
                      </td>
                      <td>
                        <Link href={`/fiscal/documents/${doc.id}`} className="btn btn-link btn-sm p-0">
                          Detalhes
                        </Link>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <TableEmptyRow
                  colSpan={8}
                  title="Nenhum documento fiscal."
                  icon="iconoir-receipt"
                />
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
