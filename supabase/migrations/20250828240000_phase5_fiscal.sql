CREATE TYPE fiscal_document_type AS ENUM (
  'nfse',
  'nfe',
  'nfce',
  'mdfe',
  'cte'
);

CREATE TYPE fiscal_document_nature AS ENUM (
  'purchase',
  'sale',
  'consignment',
  'demo',
  'shipping',
  'return',
  'service',
  'other'
);

CREATE TYPE fiscal_document_status AS ENUM (
  'draft',
  'pending',
  'processing',
  'authorized',
  'rejected',
  'failed',
  'cancelled'
);

CREATE TABLE fiscal_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL UNIQUE REFERENCES tenants(id) ON DELETE CASCADE,
  fisqal_company_id UUID,
  company_status TEXT NOT NULL DEFAULT 'inactive',
  fiscal_ambiente TEXT NOT NULL DEFAULT 'homologacao',
  razao_social TEXT,
  nome_fantasia TEXT,
  cnpj TEXT,
  inscricao_municipal TEXT,
  inscricao_estadual TEXT,
  codigo_municipio TEXT,
  municipio TEXT,
  uf TEXT,
  logradouro TEXT,
  numero TEXT,
  complemento TEXT,
  bairro TEXT,
  cep TEXT,
  email TEXT,
  telefone TEXT,
  certificate_status TEXT,
  certificate_valid_until TIMESTAMPTZ,
  webhook_secret TEXT,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE fiscal_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  document_type fiscal_document_type NOT NULL,
  nature fiscal_document_nature NOT NULL DEFAULT 'other',
  status fiscal_document_status NOT NULL DEFAULT 'draft',
  fisqal_external_id UUID,
  fisqal_company_id UUID,
  fiscal_request_id UUID,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  person_id UUID REFERENCES people(id) ON DELETE SET NULL,
  vehicle_passage_id UUID REFERENCES vehicle_passages(id) ON DELETE SET NULL,
  document_number TEXT,
  document_series TEXT,
  access_key TEXT,
  protocol TEXT,
  cfop TEXT,
  total_value NUMERIC(12, 2),
  issue_date DATE,
  competence_date DATE,
  authorized_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancel_reason TEXT,
  recipient_name TEXT,
  recipient_document TEXT,
  service_description TEXT,
  error_message TEXT,
  idempotency_key TEXT,
  payload JSONB NOT NULL DEFAULT '{}',
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_fiscal_documents_tenant ON fiscal_documents (tenant_id, created_at DESC);
CREATE INDEX idx_fiscal_documents_status ON fiscal_documents (tenant_id, status);
CREATE INDEX idx_fiscal_documents_type ON fiscal_documents (tenant_id, document_type);
CREATE INDEX idx_fiscal_documents_order ON fiscal_documents (order_id);
CREATE INDEX idx_fiscal_documents_fisqal ON fiscal_documents (fisqal_external_id);
CREATE UNIQUE INDEX idx_fiscal_documents_idempotency ON fiscal_documents (tenant_id, idempotency_key)
  WHERE idempotency_key IS NOT NULL;

CREATE TABLE fiscal_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  fisqal_external_id UUID,
  fiscal_document_id UUID REFERENCES fiscal_documents(id) ON DELETE SET NULL,
  payload JSONB NOT NULL DEFAULT '{}',
  processed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_fiscal_webhook_events_document ON fiscal_webhook_events (fiscal_document_id);

CREATE TRIGGER fiscal_settings_updated_at BEFORE UPDATE ON fiscal_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER fiscal_documents_updated_at BEFORE UPDATE ON fiscal_documents
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE fiscal_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE fiscal_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE fiscal_webhook_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY fiscal_settings_tenant ON fiscal_settings FOR ALL
  USING (tenant_id = public.get_user_tenant_id())
  WITH CHECK (tenant_id = public.get_user_tenant_id());

CREATE POLICY fiscal_documents_tenant ON fiscal_documents FOR ALL
  USING (tenant_id = public.get_user_tenant_id())
  WITH CHECK (tenant_id = public.get_user_tenant_id());

CREATE POLICY fiscal_webhook_events_tenant ON fiscal_webhook_events FOR SELECT
  USING (tenant_id = public.get_user_tenant_id());
