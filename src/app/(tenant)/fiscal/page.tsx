import Link from 'next/link';
import { PageTitle } from '@/components/dastone/PageTitle';
import { Card } from '@/components/dastone/Card';
import { createClient } from '@/lib/supabase/server';
import { getOrCreateFiscalSettings } from '@/lib/fiscal/documents';
import { getTenantContext } from '@/lib/settings/tenant-context';
import { isFisqalConfigured } from '@/lib/fisqal/client';
import {
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

export default async function FiscalPage() {
  const supabase = await createClient();
  const context = await getTenantContext(supabase);

  const tenantId = context?.tenantId;
  let settings = null;
  let recentDocuments: FiscalDocumentRow[] = [];
  let authorizedCount = 0;
  let pendingCount = 0;

  if (tenantId) {
    settings = await getOrCreateFiscalSettings(supabase, tenantId);

    const { data: documents } = await supabase
      .from('fiscal_documents')
      .select(`
        id,
        document_type,
        nature,
        status,
        document_number,
        document_series,
        total_value,
        recipient_name,
        created_at,
        orders:order_id ( order_number ),
        people:person_id ( full_name )
      `)
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
      .limit(10);

    recentDocuments = (documents ?? []) as FiscalDocumentRow[];

    const { count: authorized } = await supabase
      .from('fiscal_documents')
      .select('id', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .eq('status', 'authorized');

    const { count: pending } = await supabase
      .from('fiscal_documents')
      .select('id', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .in('status', ['pending', 'processing']);

    authorizedCount = authorized ?? 0;
    pendingCount = pending ?? 0;
  }

  const fisqalReady = isFisqalConfigured();

  return (
    <>
      <PageTitle
        title="Fiscal / Notas"
        subtitle="Emissão e controle de documentos fiscais via FISQAL"
        breadcrumbs={[{ label: 'Fiscal / Notas' }]}
        actions={
          <div className="d-flex gap-2">
            <Link href="/fiscal/nfse/new" className="btn btn-outline-primary btn-sm">
              Nova NFS-e
            </Link>
            <Link href="/fiscal/nfe/new" className="btn btn-primary btn-sm">
              Nova NF-e
            </Link>
          </div>
        }
      />
      {!fisqalReady ? (
        <div className="alert alert-warning py-2">
          Configure <code>FISQAL_API_KEY</code> no servidor para habilitar emissão.
        </div>
      ) : null}
      <div className="row mb-3">
        <div className="col-md-3">
          <Card>
            <p className="text-muted mb-1">Autorizadas</p>
            <h4 className="mb-0">{authorizedCount}</h4>
          </Card>
        </div>
        <div className="col-md-3">
          <Card>
            <p className="text-muted mb-1">Em processamento</p>
            <h4 className="mb-0">{pendingCount}</h4>
          </Card>
        </div>
        <div className="col-md-3">
          <Card>
            <p className="text-muted mb-1">Empresa FISQAL</p>
            <h6 className="mb-0">{settings?.fisqal_company_id ? 'Vinculada' : 'Não vinculada'}</h6>
          </Card>
        </div>
        <div className="col-md-3">
          <Card>
            <p className="text-muted mb-1">Certificado A1</p>
            <h6 className="mb-0">{settings?.certificate_status ?? '—'}</h6>
          </Card>
        </div>
      </div>
      <div className="row">
        <div className="col-md-4 mb-3">
          <Card title="Atalhos">
            <div className="d-grid gap-2">
              <Link href="/fiscal/settings" className="btn btn-light btn-sm">
                Configuração fiscal
              </Link>
              <Link href="/fiscal/documents" className="btn btn-light btn-sm">
                Todas as notas
              </Link>
              <Link href="/fiscal/nfse/new" className="btn btn-light btn-sm">
                Emitir NFS-e
              </Link>
              <Link href="/fiscal/nfe/new" className="btn btn-light btn-sm">
                Emitir NF-e
              </Link>
            </div>
          </Card>
        </div>
        <div className="col-md-8 mb-3">
          <Card title="Notas recentes">
            <div className="table-responsive">
              <table className="table table-sm mb-0">
                <thead>
                  <tr>
                    <th>Tipo</th>
                    <th>Nº</th>
                    <th>Destinatário</th>
                    <th>Valor</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {recentDocuments.length ? (
                    recentDocuments.map((doc) => {
                      const order = joinOne(doc.orders);
                      const person = joinOne(doc.people);
                      const label =
                        doc.recipient_name ??
                        person?.full_name ??
                        (order ? `#${order.order_number}` : '—');

                      return (
                        <tr key={doc.id}>
                          <td>{formatDocumentType(doc.document_type)}</td>
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
                              Ver
                            </Link>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-muted">
                        Nenhuma nota emitida.
                      </td>
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
