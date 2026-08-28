import Link from 'next/link';
import { PageTitle } from '@/components/dastone/PageTitle';
import { Card } from '@/components/dastone/Card';
import { DocumentGenerateForm } from '@/components/documents/DocumentGenerateForm';
import { loadDocumentEntityOptions } from '@/lib/documents/entity-options';
import { createClient } from '@/lib/supabase/server';
import { getTenantContext } from '@/lib/settings/tenant-context';
import type { DocumentTemplateRow } from '@/types/documents';
import { redirect } from 'next/navigation';

export default async function DocumentGeneratePage() {
  const supabase = await createClient();
  const context = await getTenantContext(supabase);

  if (!context) {
    redirect('/login');
  }

  const [{ data: templatesData }, { deals, orders }] = await Promise.all([
    supabase
      .from('document_templates')
      .select('id, name, slug, template_type, is_active, created_at')
      .eq('is_active', true)
      .order('name'),
    loadDocumentEntityOptions(supabase, context.tenantId),
  ]);

  const templates = (templatesData ?? []) as DocumentTemplateRow[];

  return (
    <>
      <PageTitle
        title="Gerar documento"
        subtitle="Criação a partir de modelos"
        breadcrumbs={[
          { label: 'Documentos', href: '/documents' },
          { label: 'Gerar' },
        ]}
        actions={
          <Link href="/documents" className="btn btn-light btn-sm">
            Voltar
          </Link>
        }
      />
      <Card title="Novo documento">
        <DocumentGenerateForm templates={templates} deals={deals} orders={orders} />
      </Card>
    </>
  );
}
