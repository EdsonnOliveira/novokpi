import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import { mergeDocumentTemplate } from '@/lib/documents/entity-data';
import { writeAuditLog } from '@/lib/timeline/audit';

interface GenerateDocumentInput {
  tenantId: string;
  userId: string;
  templateId: string;
  title: string;
  entityType?: string;
  entityId?: string;
}

export async function generateDocument(
  supabase: SupabaseClient<Database>,
  input: GenerateDocumentInput,
) {
  const { data: template, error: templateError } = await supabase
    .from('document_templates')
    .select('id, name, slug, content_html')
    .eq('id', input.templateId)
    .eq('tenant_id', input.tenantId)
    .eq('is_active', true)
    .maybeSingle();

  if (templateError || !template) {
    throw new Error('Modelo não encontrado.');
  }

  const contentHtml = await mergeDocumentTemplate(supabase, {
    tenantId: input.tenantId,
    contentHtml: template.content_html,
    entityType: input.entityType,
    entityId: input.entityId,
  });

  const { data: document, error: documentError } = await supabase
    .from('generated_documents')
    .insert({
      tenant_id: input.tenantId,
      template_id: template.id,
      title: input.title,
      entity_type: input.entityType ?? null,
      entity_id: input.entityId ?? null,
      generated_by: input.userId,
      content_html: contentHtml,
      metadata: {
        template_slug: template.slug,
        template_name: template.name,
      },
    })
    .select('id')
    .single();

  if (documentError || !document) {
    throw new Error(documentError?.message ?? 'Erro ao gerar documento.');
  }

  await writeAuditLog(supabase, {
    tenantId: input.tenantId,
    userId: input.userId,
    action: 'create',
    module: 'documents',
    entityType: 'generated_document',
    entityId: document.id,
    newData: {
      template_id: template.id,
      title: input.title,
    },
  });

  return document;
}
