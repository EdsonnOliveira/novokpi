import Link from 'next/link';
import { PageTitle } from '@/components/dastone/PageTitle';
import { Card } from '@/components/dastone/Card';
import { KpiGrid } from '@/components/dastone/KpiGrid';
import { GeneratedDocumentsTable } from '@/components/documents/GeneratedDocumentsTable';
import { createClient } from '@/lib/supabase/server';
import { TableEmptyRow } from '@/components/dastone/EmptyState';
import { StatusBadge } from '@/components/dastone/TableBadge';
import {
  formatTemplateType,
  joinOne,
  type DocumentTemplateRow,
  type GeneratedDocumentListRow,
  type GeneratedDocumentTableRow,
} from '@/types/documents';

function mapGeneratedDocumentRows(
  documents: GeneratedDocumentListRow[],
): GeneratedDocumentTableRow[] {
  return documents.map((document) => {
    const template = joinOne(document.document_templates);
    const profile = joinOne(document.profiles);

    return {
      id: document.id,
      title: document.title,
      templateName: template?.name ?? '—',
      entityType: document.entity_type ?? '—',
      generatedBy: profile?.full_name ?? '—',
      createdAt: new Date(document.created_at).toLocaleString('pt-BR'),
      filePath: document.file_path ?? '—',
    };
  });
}

export default async function DocumentsPage() {
  const supabase = await createClient();

  const { data: templatesData } = await supabase
    .from('document_templates')
    .select('id, name, slug, template_type, is_active, created_at')
    .order('name');

  const { data: generatedData } = await supabase
    .from('generated_documents')
    .select(`
      id,
      title,
      entity_type,
      entity_id,
      file_path,
      created_at,
      document_templates:template_id ( name, slug ),
      profiles:generated_by ( full_name )
    `)
    .order('created_at', { ascending: false })
    .limit(200);

  const templates = (templatesData ?? []) as DocumentTemplateRow[];
  const generatedRows = mapGeneratedDocumentRows(
    (generatedData ?? []) as GeneratedDocumentListRow[],
  );
  const activeTemplates = templates.filter((template) => template.is_active).length;

  return (
    <>
      <PageTitle
        title="Documentos"
        subtitle="Central de formulários e histórico"
        breadcrumbs={[{ label: 'Documentos' }]}
        actions={
          <Link href="/documents/generate" className="btn btn-primary btn-sm">
            <i className="iconoir-page me-1" aria-hidden="true" />
            Gerar documento
          </Link>
        }
      />
      <KpiGrid
        columns={3}
        items={[
          { id: 'templates', label: 'Modelos ativos', value: activeTemplates },
          { id: 'generated', label: 'Documentos gerados', value: generatedRows.length },
          { id: 'total-templates', label: 'Total de modelos', value: templates.length },
        ]}
      />
      <Card title="Modelos disponíveis">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Slug</th>
                <th>Tipo</th>
                <th>Status</th>
                <th>Cadastro</th>
              </tr>
            </thead>
            <tbody>
              {templates.length ? (
                templates.map((template) => (
                  <tr key={template.id}>
                    <td>{template.name}</td>
                    <td>{template.slug}</td>
                    <td>{formatTemplateType(template.template_type)}</td>
                    <td>
                      <StatusBadge label={template.is_active ? 'Ativo' : 'Inativo'} active={template.is_active} />
                    </td>
                    <td>{new Date(template.created_at).toLocaleDateString('pt-BR')}</td>
                  </tr>
                ))
              ) : (
                <TableEmptyRow
                  colSpan={5}
                  title="Nenhum modelo cadastrado."
                  icon="iconoir-page"
                />
              )}
            </tbody>
          </table>
        </div>
      </Card>
      <Card title="Histórico de documentos gerados" className="mt-3">
        <GeneratedDocumentsTable rows={generatedRows} />
      </Card>
    </>
  );
}
