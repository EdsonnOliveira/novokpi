-- Phase 6-11: Settings, alerts, integrator, marketing, documents, warranty, master, support, AI

CREATE TYPE alert_level AS ENUM ('info', 'warning', 'overdue');
CREATE TYPE campaign_channel AS ENUM ('sms', 'email', 'whatsapp');
CREATE TYPE campaign_status AS ENUM ('draft', 'scheduled', 'running', 'completed', 'cancelled');
CREATE TYPE ticket_status AS ENUM ('open', 'in_progress', 'waiting', 'resolved', 'closed');
CREATE TYPE document_template_type AS ENUM (
  'contract',
  'proposal',
  'windshield',
  'deal_cover',
  'delivery',
  'other'
);

CREATE TABLE alert_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  module TEXT NOT NULL,
  days_threshold INT NOT NULL DEFAULT 1,
  level alert_level NOT NULL DEFAULT 'warning',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE tenant_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  level alert_level NOT NULL DEFAULT 'info',
  title TEXT NOT NULL,
  message TEXT,
  module TEXT,
  entity_type TEXT,
  entity_id UUID,
  href TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  is_dismissed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_tenant_alerts_user ON tenant_alerts (tenant_id, user_id, is_dismissed, created_at DESC);

CREATE TABLE portal_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  portal_slug TEXT NOT NULL,
  portal_name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  credentials JSONB NOT NULL DEFAULT '{}',
  last_sync_at TIMESTAMPTZ,
  sync_status TEXT NOT NULL DEFAULT 'idle',
  sync_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, portal_slug)
);

CREATE TABLE vehicle_portal_ads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  passage_id UUID NOT NULL REFERENCES vehicle_passages(id) ON DELETE CASCADE,
  portal_integration_id UUID NOT NULL REFERENCES portal_integrations(id) ON DELETE CASCADE,
  external_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  published_at TIMESTAMPTZ,
  last_sync_at TIMESTAMPTZ,
  sync_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (passage_id, portal_integration_id)
);

CREATE TABLE opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  person_id UUID REFERENCES people(id) ON DELETE SET NULL,
  deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
  passage_id UUID REFERENCES vehicle_passages(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  priority TEXT NOT NULL DEFAULT 'normal',
  assigned_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  due_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE document_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  template_type document_template_type NOT NULL DEFAULT 'other',
  content_html TEXT NOT NULL DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, slug)
);

CREATE TABLE generated_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  template_id UUID REFERENCES document_templates(id) ON DELETE SET NULL,
  entity_type TEXT,
  entity_id UUID,
  title TEXT NOT NULL,
  file_path TEXT,
  metadata JSONB NOT NULL DEFAULT '{}',
  generated_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE warranty_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  passage_id UUID REFERENCES vehicle_passages(id) ON DELETE SET NULL,
  person_id UUID REFERENCES people(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  opened_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  assigned_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  channel campaign_channel NOT NULL,
  status campaign_status NOT NULL DEFAULT 'draft',
  subject TEXT,
  body TEXT NOT NULL DEFAULT '',
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE campaign_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  person_id UUID REFERENCES people(id) ON DELETE SET NULL,
  contact TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  sent_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE tenant_site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL UNIQUE REFERENCES tenants(id) ON DELETE CASCADE,
  domain TEXT,
  is_published BOOLEAN NOT NULL DEFAULT false,
  theme JSONB NOT NULL DEFAULT '{}',
  seo JSONB NOT NULL DEFAULT '{}',
  sync_inventory BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE entity_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_entity_attachments_entity ON entity_attachments (tenant_id, entity_type, entity_id);

CREATE TABLE financial_reconciliation_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  account_id UUID REFERENCES financial_accounts(id) ON DELETE SET NULL,
  transaction_id UUID REFERENCES financial_transactions(id) ON DELETE SET NULL,
  bank_date DATE NOT NULL,
  description TEXT,
  amount NUMERIC(12, 2) NOT NULL,
  is_reconciled BOOLEAN NOT NULL DEFAULT false,
  reconciled_at TIMESTAMPTZ,
  reconciled_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  subject TEXT NOT NULL,
  description TEXT,
  status ticket_status NOT NULL DEFAULT 'open',
  priority TEXT NOT NULL DEFAULT 'normal',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  is_master BOOLEAN NOT NULL DEFAULT false,
  title TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE ai_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE help_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module TEXT NOT NULL,
  route TEXT,
  title TEXT NOT NULL,
  video_url TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE master_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
  subject TEXT NOT NULL,
  description TEXT,
  status ticket_status NOT NULL DEFAULT 'open',
  assigned_to UUID REFERENCES master_users(id) ON DELETE SET NULL,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE master_announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  is_published BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ,
  created_by UUID REFERENCES master_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE tenant_onboarding_checklist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  step_key TEXT NOT NULL,
  step_label TEXT NOT NULL,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, step_key)
);

CREATE TRIGGER support_tickets_updated_at BEFORE UPDATE ON support_tickets
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER master_tickets_updated_at BEFORE UPDATE ON master_tickets
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER tenant_site_settings_updated_at BEFORE UPDATE ON tenant_site_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE alert_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_portal_ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE warranty_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE entity_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_reconciliation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE help_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_onboarding_checklist ENABLE ROW LEVEL SECURITY;

CREATE POLICY alert_rules_tenant ON alert_rules FOR ALL
  USING (tenant_id = public.get_user_tenant_id())
  WITH CHECK (tenant_id = public.get_user_tenant_id());

CREATE POLICY tenant_alerts_tenant ON tenant_alerts FOR ALL
  USING (tenant_id = public.get_user_tenant_id() OR public.is_master_user())
  WITH CHECK (tenant_id = public.get_user_tenant_id() OR public.is_master_user());

CREATE POLICY portal_integrations_tenant ON portal_integrations FOR ALL
  USING (tenant_id = public.get_user_tenant_id())
  WITH CHECK (tenant_id = public.get_user_tenant_id());

CREATE POLICY vehicle_portal_ads_tenant ON vehicle_portal_ads FOR ALL
  USING (tenant_id = public.get_user_tenant_id())
  WITH CHECK (tenant_id = public.get_user_tenant_id());

CREATE POLICY opportunities_tenant ON opportunities FOR ALL
  USING (tenant_id = public.get_user_tenant_id())
  WITH CHECK (tenant_id = public.get_user_tenant_id());

CREATE POLICY document_templates_tenant ON document_templates FOR ALL
  USING (tenant_id = public.get_user_tenant_id())
  WITH CHECK (tenant_id = public.get_user_tenant_id());

CREATE POLICY generated_documents_tenant ON generated_documents FOR ALL
  USING (tenant_id = public.get_user_tenant_id())
  WITH CHECK (tenant_id = public.get_user_tenant_id());

CREATE POLICY warranty_cases_tenant ON warranty_cases FOR ALL
  USING (tenant_id = public.get_user_tenant_id())
  WITH CHECK (tenant_id = public.get_user_tenant_id());

CREATE POLICY campaigns_tenant ON campaigns FOR ALL
  USING (tenant_id = public.get_user_tenant_id())
  WITH CHECK (tenant_id = public.get_user_tenant_id());

CREATE POLICY campaign_recipients_tenant ON campaign_recipients FOR ALL
  USING (tenant_id = public.get_user_tenant_id())
  WITH CHECK (tenant_id = public.get_user_tenant_id());

CREATE POLICY tenant_site_settings_tenant ON tenant_site_settings FOR ALL
  USING (tenant_id = public.get_user_tenant_id())
  WITH CHECK (tenant_id = public.get_user_tenant_id());

CREATE POLICY entity_attachments_tenant ON entity_attachments FOR ALL
  USING (tenant_id = public.get_user_tenant_id())
  WITH CHECK (tenant_id = public.get_user_tenant_id());

CREATE POLICY financial_reconciliation_tenant ON financial_reconciliation_items FOR ALL
  USING (tenant_id = public.get_user_tenant_id())
  WITH CHECK (tenant_id = public.get_user_tenant_id());

CREATE POLICY support_tickets_tenant ON support_tickets FOR ALL
  USING (tenant_id = public.get_user_tenant_id())
  WITH CHECK (tenant_id = public.get_user_tenant_id());

CREATE POLICY ai_conversations_tenant ON ai_conversations FOR ALL
  USING (
    (tenant_id = public.get_user_tenant_id() AND user_id = auth.uid())
    OR public.is_master_user()
  )
  WITH CHECK (
    (tenant_id = public.get_user_tenant_id() AND user_id = auth.uid())
    OR public.is_master_user()
  );

CREATE POLICY ai_messages_tenant ON ai_messages FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM ai_conversations c
      WHERE c.id = conversation_id
        AND (
          (c.tenant_id = public.get_user_tenant_id() AND c.user_id = auth.uid())
          OR public.is_master_user()
        )
    )
  );

CREATE POLICY help_videos_read ON help_videos FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY master_tickets_master ON master_tickets FOR ALL
  USING (public.is_master_user())
  WITH CHECK (public.is_master_user());

CREATE POLICY master_announcements_read ON master_announcements FOR SELECT
  USING (is_published = true OR public.is_master_user());

CREATE POLICY master_announcements_write ON master_announcements FOR ALL
  USING (public.is_master_user())
  WITH CHECK (public.is_master_user());

CREATE POLICY tenant_onboarding_master ON tenant_onboarding_checklist FOR ALL
  USING (tenant_id = public.get_user_tenant_id() OR public.is_master_user())
  WITH CHECK (tenant_id = public.get_user_tenant_id() OR public.is_master_user());

CREATE POLICY subscriptions_master ON subscriptions FOR ALL
  USING (public.is_master_user())
  WITH CHECK (public.is_master_user());

CREATE POLICY plans_master ON plans FOR ALL
  USING (public.is_master_user())
  WITH CHECK (public.is_master_user());

INSERT INTO help_videos (module, route, title, video_url) VALUES
  ('crm', '/crm/new', 'Como abrir uma nova ficha', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'),
  ('inventory', '/inventory/quick', 'Cadastro rápido de veículo', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'),
  ('finance', '/finance/transactions', 'Lançamentos financeiros', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ');

INSERT INTO document_templates (tenant_id, name, slug, template_type, content_html)
SELECT t.id, 'Contrato de venda', 'sale_contract', 'contract', '<h1>Contrato de venda</h1>'
FROM tenants t
WHERE NOT EXISTS (
  SELECT 1 FROM document_templates dt WHERE dt.tenant_id = t.id AND dt.slug = 'sale_contract'
);

INSERT INTO document_templates (tenant_id, name, slug, template_type, content_html)
SELECT t.id, 'Ficha para-brisa', 'windshield', 'windshield', '<h1>Ficha para-brisa</h1>'
FROM tenants t
WHERE NOT EXISTS (
  SELECT 1 FROM document_templates dt WHERE dt.tenant_id = t.id AND dt.slug = 'windshield'
);

INSERT INTO document_templates (tenant_id, name, slug, template_type, content_html)
SELECT t.id, 'Capa do negócio', 'deal_cover', 'deal_cover', '<h1>Capa do negócio</h1>'
FROM tenants t
WHERE NOT EXISTS (
  SELECT 1 FROM document_templates dt WHERE dt.tenant_id = t.id AND dt.slug = 'deal_cover'
);

INSERT INTO portal_integrations (tenant_id, portal_slug, portal_name)
SELECT t.id, p.slug, p.name
FROM tenants t
CROSS JOIN (VALUES
  ('webmotors', 'Webmotors'),
  ('icarros', 'iCarros'),
  ('olx', 'OLX'),
  ('mercadolivre', 'Mercado Livre')
) AS p(slug, name)
WHERE NOT EXISTS (
  SELECT 1 FROM portal_integrations pi WHERE pi.tenant_id = t.id
);

INSERT INTO tenant_onboarding_checklist (tenant_id, step_key, step_label)
SELECT t.id, s.step_key, s.step_label
FROM tenants t
CROSS JOIN (VALUES
  ('company_data', 'Dados da loja'),
  ('users', 'Usuários e perfis'),
  ('channels', 'Canais de origem'),
  ('modalities', 'Modalidades de estoque'),
  ('fiscal', 'Configuração fiscal'),
  ('integrator', 'Integrador de portais'),
  ('site', 'Site da loja')
) AS s(step_key, step_label)
WHERE NOT EXISTS (
  SELECT 1 FROM tenant_onboarding_checklist toc WHERE toc.tenant_id = t.id
);
