import Link from 'next/link';
import { PageTitle } from '@/components/dastone/PageTitle';
import { Card } from '@/components/dastone/Card';
import { DocumentGenerateForm } from '@/components/documents/DocumentGenerateForm';
import { loadDocumentEntityOptions } from '@/lib/documents/entity-options';
import { createClient } from '@/lib/supabase/server';
import { getTenantContext } from '@/lib/settings/tenant-context';
import type { DocumentTemplateRow } from '@/types/documents';
import { redirect } from 'next/navigation';

export default async function WindshieldDocumentPage() {
  const supabase = await createClient();
  const context = await getTenantContext(supabase);

  if (!context) {
    redirect('/login');
  }

  const [{ data: templateData }, { deals, orders }] = await Promise.all([
    supabase
      .from('document_templates')
      .select('id, name, slug, template_type, is_active, created_at')
      .eq('slug', 'windshield')
      .maybeSingle(),
    loadDocumentEntityOptions(supabase, context.tenantId),
  ]);

  const template = templateData as DocumentTemplateRow | null;

  return (
    <>
      <PageTitle
        title="Ficha para-brisa"
        subtitle="Impressão rápida para o veículo"
        breadcrumbs={[
          { label: 'Documentos', href: '/documents' },
          { label: 'Para-brisa' },
        ]}
        actions={
          <Link href="/documents/generate" className="btn btn-light btn-sm">
            Gerar documento
          </Link>
        }
      />
      <Card title="Gerar ficha para-brisa">
        {template ? (
          <DocumentGenerateForm
            templates={[template]}
            deals={deals}
            orders={orders}
            defaultTemplateId={template.id}
          />
        ) : (
          <p className="text-muted mb-0">Modelo para-brisa não configurado.</p>
        )}
      </Card>
    </>
  );
}
