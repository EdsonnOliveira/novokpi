export type FiscalDocumentType = 'nfse' | 'nfe' | 'nfce' | 'mdfe' | 'cte';

export type FiscalDocumentNature =
  | 'purchase'
  | 'sale'
  | 'consignment'
  | 'demo'
  | 'shipping'
  | 'return'
  | 'service'
  | 'other';

export type FiscalDocumentStatus =
  | 'draft'
  | 'pending'
  | 'processing'
  | 'authorized'
  | 'rejected'
  | 'failed'
  | 'cancelled';

export interface FiscalSettingsRow {
  id: string;
  tenant_id: string;
  fisqal_company_id: string | null;
  company_status: string;
  fiscal_ambiente: string;
  razao_social: string | null;
  nome_fantasia: string | null;
  cnpj: string | null;
  inscricao_municipal: string | null;
  inscricao_estadual: string | null;
  codigo_municipio: string | null;
  municipio: string | null;
  uf: string | null;
  logradouro: string | null;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  cep: string | null;
  email: string | null;
  telefone: string | null;
  certificate_status: string | null;
  certificate_valid_until: string | null;
}

export interface FiscalDocumentRow {
  id: string;
  tenant_id: string;
  document_type: FiscalDocumentType;
  nature: FiscalDocumentNature;
  status: FiscalDocumentStatus;
  fisqal_external_id: string | null;
  fisqal_company_id: string | null;
  fiscal_request_id: string | null;
  order_id: string | null;
  person_id: string | null;
  vehicle_passage_id: string | null;
  document_number: string | null;
  document_series: string | null;
  access_key: string | null;
  protocol: string | null;
  cfop: string | null;
  total_value: number | null;
  issue_date: string | null;
  competence_date: string | null;
  authorized_at: string | null;
  cancelled_at: string | null;
  cancel_reason: string | null;
  recipient_name: string | null;
  recipient_document: string | null;
  service_description: string | null;
  error_message: string | null;
  created_at: string;
  orders: { order_number: number } | { order_number: number }[] | null;
  people: { full_name: string } | { full_name: string }[] | null;
}

const DOCUMENT_TYPE_LABELS: Record<FiscalDocumentType, string> = {
  nfse: 'NFS-e',
  nfe: 'NF-e',
  nfce: 'NFC-e',
  mdfe: 'MDF-e',
  cte: 'CT-e',
};

const NATURE_LABELS: Record<FiscalDocumentNature, string> = {
  purchase: 'Compra',
  sale: 'Venda',
  consignment: 'Consignação',
  demo: 'Demonstração',
  shipping: 'Remessa',
  return: 'Retorno',
  service: 'Serviço',
  other: 'Outro',
};

const STATUS_LABELS: Record<FiscalDocumentStatus, string> = {
  draft: 'Rascunho',
  pending: 'Pendente',
  processing: 'Processando',
  authorized: 'Autorizada',
  rejected: 'Rejeitada',
  failed: 'Falhou',
  cancelled: 'Cancelada',
};

const STATUS_BADGE: Record<FiscalDocumentStatus, string> = {
  draft: 'bg-secondary-subtle text-secondary',
  pending: 'bg-warning-subtle text-warning',
  processing: 'bg-info-subtle text-info',
  authorized: 'bg-success-subtle text-success',
  rejected: 'bg-danger-subtle text-danger',
  failed: 'bg-danger-subtle text-danger',
  cancelled: 'bg-dark-subtle text-dark',
};

export function formatDocumentType(type: string): string {
  return DOCUMENT_TYPE_LABELS[type as FiscalDocumentType] ?? type;
}

export function formatDocumentNature(nature: string): string {
  return NATURE_LABELS[nature as FiscalDocumentNature] ?? nature;
}

export function formatDocumentStatus(status: string): string {
  return STATUS_LABELS[status as FiscalDocumentStatus] ?? status;
}

export function getDocumentStatusBadge(status: string): string {
  return STATUS_BADGE[status as FiscalDocumentStatus] ?? 'bg-secondary-subtle text-secondary';
}

export function formatFiscalCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

export function sanitizeDigits(value: string, maxLength?: number): string {
  const digits = value.replace(/\D/g, '');
  return maxLength ? digits.slice(0, maxLength) : digits;
}

export function mapFisqalNfseStatus(status: string): FiscalDocumentStatus {
  const map: Record<string, FiscalDocumentStatus> = {
    pending: 'pending',
    validated: 'processing',
    xml_generated: 'processing',
    signed: 'processing',
    queued: 'processing',
    processing: 'processing',
    sent: 'processing',
    authorized: 'authorized',
    rejected: 'rejected',
    failed: 'failed',
    cancelled: 'cancelled',
  };
  return map[status] ?? 'processing';
}

export function mapFisqalNfeStatus(status: string): FiscalDocumentStatus {
  const map: Record<string, FiscalDocumentStatus> = {
    pending: 'pending',
    processing: 'processing',
    authorized: 'authorized',
    rejected: 'rejected',
    failed: 'failed',
    cancelled: 'cancelled',
  };
  return map[status] ?? 'processing';
}
