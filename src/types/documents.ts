export interface DocumentTemplateRow {
  id: string;
  name: string;
  slug: string;
  template_type: string;
  is_active: boolean;
  created_at: string;
}

export interface GeneratedDocumentTemplateJoin {
  name: string;
  slug: string;
}

export interface GeneratedDocumentProfileJoin {
  full_name: string | null;
}

export interface GeneratedDocumentListRow {
  id: string;
  title: string;
  entity_type: string | null;
  entity_id: string | null;
  file_path: string | null;
  created_at: string;
  document_templates: GeneratedDocumentTemplateJoin | GeneratedDocumentTemplateJoin[] | null;
  profiles: GeneratedDocumentProfileJoin | GeneratedDocumentProfileJoin[] | null;
}

export interface GeneratedDocumentTableRow extends Record<string, unknown> {
  id: string;
  title: string;
  templateName: string;
  entityType: string;
  generatedBy: string;
  createdAt: string;
  filePath: string;
}

export function joinOne<T>(value: T | T[] | null): T | null {
  if (!value) return null;
  return Array.isArray(value) ? value[0] ?? null : value;
}

export function formatTemplateType(type: string): string {
  const map: Record<string, string> = {
    contract: 'Contrato',
    proposal: 'Proposta',
    windshield: 'Para-brisa',
    deal_cover: 'Capa do negócio',
    delivery: 'Entrega',
    other: 'Outro',
  };
  return map[type] ?? type;
}
