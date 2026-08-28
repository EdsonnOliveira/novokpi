-- Phase 1: CRM — people, deals, activities, queues, config

CREATE TYPE deal_status AS ENUM (
  'open',
  'reserved',
  'closed_won',
  'closed_lost'
);

CREATE TYPE activity_status AS ENUM (
  'pending',
  'done',
  'overdue',
  'cancelled'
);

CREATE TABLE channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, slug)
);

CREATE TABLE lost_reasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE deal_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  color TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  is_won BOOLEAN NOT NULL DEFAULT false,
  is_lost BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, slug)
);

CREATE TABLE people (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  social_handle TEXT,
  document TEXT,
  notes TEXT,
  assigned_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  is_client BOOLEAN NOT NULL DEFAULT true,
  is_supplier BOOLEAN NOT NULL DEFAULT false,
  is_employee BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_people_tenant_phone ON people (tenant_id, phone);
CREATE INDEX idx_people_tenant_email ON people (tenant_id, email);
CREATE INDEX idx_people_tenant_name ON people (tenant_id, full_name);

CREATE TABLE deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  deal_number INT NOT NULL,
  title TEXT,
  person_id UUID NOT NULL REFERENCES people(id) ON DELETE RESTRICT,
  stage_id UUID NOT NULL REFERENCES deal_stages(id) ON DELETE RESTRICT,
  channel_id UUID REFERENCES channels(id) ON DELETE SET NULL,
  assigned_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status deal_status NOT NULL DEFAULT 'open',
  lost_reason_id UUID REFERENCES lost_reasons(id) ON DELETE SET NULL,
  is_duplicate_alert BOOLEAN NOT NULL DEFAULT false,
  duplicate_of_deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
  next_action_at TIMESTAMPTZ,
  next_action_note TEXT,
  closed_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, deal_number)
);

CREATE INDEX idx_deals_tenant_stage ON deals (tenant_id, stage_id);
CREATE INDEX idx_deals_tenant_assigned ON deals (tenant_id, assigned_user_id);
CREATE INDEX idx_deals_tenant_status ON deals (tenant_id, status);
CREATE INDEX idx_deals_next_action ON deals (tenant_id, next_action_at);

CREATE TABLE deal_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  unassigned_at TIMESTAMPTZ
);

CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  person_id UUID REFERENCES people(id) ON DELETE CASCADE,
  assigned_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  status activity_status NOT NULL DEFAULT 'pending',
  contact_method TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_activities_due ON activities (tenant_id, due_at, status);

CREATE TABLE interest_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
  brand TEXT,
  model TEXT,
  version TEXT,
  year_min INT,
  year_max INT,
  price_min NUMERIC(12, 2),
  price_max NUMERIC(12, 2),
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE demand_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  interest_profile_id UUID REFERENCES interest_profiles(id) ON DELETE SET NULL,
  deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'waiting',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE offer_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  vehicle_id UUID,
  interest_profile_id UUID REFERENCES interest_profiles(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'waiting',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.next_deal_number(p_tenant_id UUID)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_number INT;
BEGIN
  SELECT COALESCE(MAX(deal_number), 0) + 1 INTO v_number
  FROM deals WHERE tenant_id = p_tenant_id;
  RETURN v_number;
END;
$$;

CREATE OR REPLACE FUNCTION public.seed_tenant_crm_defaults()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO deal_stages (tenant_id, name, slug, sort_order, is_won, is_lost) VALUES
    (NEW.id, 'Novo Lead', 'new_lead', 1, false, false),
    (NEW.id, 'Contato realizado', 'contact', 2, false, false),
    (NEW.id, 'Qualificado', 'qualified', 3, false, false),
    (NEW.id, 'Avaliação', 'evaluation', 4, false, false),
    (NEW.id, 'Negociação', 'negotiation', 5, false, false),
    (NEW.id, 'Proposta', 'proposal', 6, false, false),
    (NEW.id, 'Venda', 'won', 7, true, false),
    (NEW.id, 'Perdida', 'lost', 8, false, true);

  INSERT INTO channels (tenant_id, name, slug) VALUES
    (NEW.id, 'Loja', 'store'),
    (NEW.id, 'Site da Loja', 'website'),
    (NEW.id, 'Telefone', 'phone'),
    (NEW.id, 'Indicação', 'referral'),
    (NEW.id, 'Portal', 'portal');

  INSERT INTO lost_reasons (tenant_id, name, sort_order) VALUES
    (NEW.id, 'Preço', 1),
    (NEW.id, 'Comprou em outra loja', 2),
    (NEW.id, 'Desistiu da compra', 3),
    (NEW.id, 'Sem retorno', 4),
    (NEW.id, 'Outro', 5);

  RETURN NEW;
END;
$$;

CREATE TRIGGER tenants_seed_crm_defaults
  AFTER INSERT ON tenants
  FOR EACH ROW EXECUTE FUNCTION public.seed_tenant_crm_defaults();

CREATE TRIGGER people_updated_at BEFORE UPDATE ON people
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER deals_updated_at BEFORE UPDATE ON deals
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER activities_updated_at BEFORE UPDATE ON activities
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE lost_reasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE people ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE interest_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE demand_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE offer_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY channels_tenant ON channels FOR ALL
  USING (tenant_id = public.get_user_tenant_id())
  WITH CHECK (tenant_id = public.get_user_tenant_id());

CREATE POLICY lost_reasons_tenant ON lost_reasons FOR ALL
  USING (tenant_id = public.get_user_tenant_id())
  WITH CHECK (tenant_id = public.get_user_tenant_id());

CREATE POLICY deal_stages_tenant ON deal_stages FOR ALL
  USING (tenant_id = public.get_user_tenant_id())
  WITH CHECK (tenant_id = public.get_user_tenant_id());

CREATE POLICY people_tenant ON people FOR ALL
  USING (tenant_id = public.get_user_tenant_id())
  WITH CHECK (tenant_id = public.get_user_tenant_id());

CREATE POLICY deals_tenant ON deals FOR ALL
  USING (tenant_id = public.get_user_tenant_id())
  WITH CHECK (tenant_id = public.get_user_tenant_id());

CREATE POLICY deal_assignments_tenant ON deal_assignments FOR ALL
  USING (tenant_id = public.get_user_tenant_id())
  WITH CHECK (tenant_id = public.get_user_tenant_id());

CREATE POLICY activities_tenant ON activities FOR ALL
  USING (tenant_id = public.get_user_tenant_id())
  WITH CHECK (tenant_id = public.get_user_tenant_id());

CREATE POLICY interest_profiles_tenant ON interest_profiles FOR ALL
  USING (tenant_id = public.get_user_tenant_id())
  WITH CHECK (tenant_id = public.get_user_tenant_id());

CREATE POLICY demand_queue_tenant ON demand_queue FOR ALL
  USING (tenant_id = public.get_user_tenant_id())
  WITH CHECK (tenant_id = public.get_user_tenant_id());

CREATE POLICY offer_queue_tenant ON offer_queue FOR ALL
  USING (tenant_id = public.get_user_tenant_id())
  WITH CHECK (tenant_id = public.get_user_tenant_id());

INSERT INTO deal_stages (tenant_id, name, slug, sort_order, is_won, is_lost)
SELECT t.id, s.name, s.slug, s.sort_order, s.is_won, s.is_lost
FROM tenants t
CROSS JOIN (VALUES
  ('Novo Lead', 'new_lead', 1, false, false),
  ('Contato realizado', 'contact', 2, false, false),
  ('Qualificado', 'qualified', 3, false, false),
  ('Avaliação', 'evaluation', 4, false, false),
  ('Negociação', 'negotiation', 5, false, false),
  ('Proposta', 'proposal', 6, false, false),
  ('Venda', 'won', 7, true, false),
  ('Perdida', 'lost', 8, false, true)
) AS s(name, slug, sort_order, is_won, is_lost)
WHERE NOT EXISTS (
  SELECT 1 FROM deal_stages ds WHERE ds.tenant_id = t.id
);

INSERT INTO channels (tenant_id, name, slug)
SELECT t.id, c.name, c.slug
FROM tenants t
CROSS JOIN (VALUES
  ('Loja', 'store'),
  ('Site da Loja', 'website'),
  ('Telefone', 'phone'),
  ('Indicação', 'referral'),
  ('Portal', 'portal')
) AS c(name, slug)
WHERE NOT EXISTS (
  SELECT 1 FROM channels ch WHERE ch.tenant_id = t.id
);

INSERT INTO lost_reasons (tenant_id, name, sort_order)
SELECT t.id, r.name, r.sort_order
FROM tenants t
CROSS JOIN (VALUES
  ('Preço', 1),
  ('Comprou em outra loja', 2),
  ('Desistiu da compra', 3),
  ('Sem retorno', 4),
  ('Outro', 5)
) AS r(name, sort_order)
WHERE NOT EXISTS (
  SELECT 1 FROM lost_reasons lr WHERE lr.tenant_id = t.id
);
