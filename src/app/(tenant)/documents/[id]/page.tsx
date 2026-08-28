import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PageTitle } from '@/components/dastone/PageTitle';
import { Card } from '@/components/dastone/Card';
import { createClient } from '@/lib/supabase/server';
import { getTenantContext } from '@/lib/settings/tenant-context';
import { redirect } from 'next/navigation';

export default async function GeneratedDocumentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const context = await getTenantContext(supabase);

  if (!context) {
    redirect('/login');
  }

  const { data: document } = await supabase
    .from('generated_documents')
    .select('id, title, content_html, created_at, metadata')
    .eq('id', id)
    .eq('tenant_id', context.tenantId)
    .maybeSingle();

  if (!document) {
    notFound();
  }

  const html = document.content_html ?? '<p>Documento sem conteúdo HTML.</p>';

  return (
    <>
      <PageTitle
        title={document.title}
        subtitle="Documento gerado"
        breadcrumbs={[
          { label: 'Documentos', href: '/documents' },
          { label: document.title },
        ]}
        actions={
          <Link href="/documents" className="btn btn-light btn-sm">
            <i className="iconoir-arrow-left me-1" aria-hidden="true" />
            Voltar
          </Link>
        }
      />
      <Card>
        <div
          className="document-preview"
          dangerouslySetInnerHTML={{ __html: html }}
        />
        <p className="text-muted small mt-3 mb-0">
          Gerado em {new Date(document.created_at).toLocaleString('pt-BR')}
        </p>
      </Card>
    </>
  );
}
