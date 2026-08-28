import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PageTitle } from '@/components/dastone/PageTitle';
import { Card } from '@/components/dastone/Card';
import { FiscalDocumentActions } from '@/components/fiscal/FiscalDocumentActions';
import { createClient } from '@/lib/supabase/server';
import {
  formatDocumentNature,
  formatDocumentStatus,
  formatDocumentType,
  formatFiscalCurrency,
  getDocumentStatusBadge,
  type FiscalDocumentStatus,
} from '@/types/fiscal';

interface FiscalDocumentDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function FiscalDocumentDetailPage({ params }: FiscalDocumentDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: document, error } = await supabase
    .from('fiscal_documents')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error || !document) {
    notFound();
  }

  return (
    <>
      <PageTitle
        title={`${formatDocumentType(document.document_type)} ${document.document_series && document.document_number ? `${document.document_series}/${document.document_number}` : ''}`.trim()}
        subtitle={document.recipient_name ?? 'Documento fiscal'}
        breadcrumbs={[
          { label: 'Fiscal / Notas', href: '/fiscal' },
          { label: 'Documentos', href: '/fiscal/documents' },
          { label: 'Detalhe' },
        ]}
      />
      <div className="row">
        <div className="col-md-8 mb-3">
          <Card title="Informações">
            <dl className="row mb-0 small">
              <dt className="col-sm-4">Tipo</dt>
              <dd className="col-sm-8">{formatDocumentType(document.document_type)}</dd>
              <dt className="col-sm-4">Natureza</dt>
              <dd className="col-sm-8">{formatDocumentNature(document.nature)}</dd>
              <dt className="col-sm-4">Status</dt>
              <dd className="col-sm-8">
                <span className={`badge ${getDocumentStatusBadge(document.status)}`}>
                  {formatDocumentStatus(document.status)}
                </span>
              </dd>
              <dt className="col-sm-4">Valor</dt>
              <dd className="col-sm-8">{formatFiscalCurrency(document.total_value)}</dd>
              <dt className="col-sm-4">Destinatário</dt>
              <dd className="col-sm-8">{document.recipient_name ?? '—'}</dd>
              <dt className="col-sm-4">Documento destinatário</dt>
              <dd className="col-sm-8">{document.recipient_document ?? '—'}</dd>
              <dt className="col-sm-4">Chave de acesso</dt>
              <dd className="col-sm-8 text-break">{document.access_key ?? '—'}</dd>
              <dt className="col-sm-4">Protocolo</dt>
              <dd className="col-sm-8">{document.protocol ?? '—'}</dd>
              <dt className="col-sm-4">CFOP</dt>
              <dd className="col-sm-8">{document.cfop ?? '—'}</dd>
              <dt className="col-sm-4">Descrição</dt>
              <dd className="col-sm-8">{document.service_description ?? '—'}</dd>
              <dt className="col-sm-4">ID FISQAL</dt>
              <dd className="col-sm-8 text-break">{document.fisqal_external_id ?? '—'}</dd>
              <dt className="col-sm-4">Erro</dt>
              <dd className="col-sm-8 text-danger">{document.error_message ?? '—'}</dd>
            </dl>
          </Card>
        </div>
        <div className="col-md-4 mb-3">
          <Card title="Ações">
            <FiscalDocumentActions
              documentId={document.id}
              status={document.status as FiscalDocumentStatus}
              documentType={document.document_type}
              hasExternalId={Boolean(document.fisqal_external_id)}
            />
            {document.order_id ? (
              <Link href={`/orders`} className="btn btn-link btn-sm ps-0 mt-2">
                Ver pedido vinculado
              </Link>
            ) : null}
          </Card>
        </div>
      </div>
    </>
  );
}
