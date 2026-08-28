-- Phase 0: Foundation — tenants, auth, RBAC, timeline, audit, storage

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE timeline_entity_type AS ENUM (
  'person',
  'deal',
  'vehicle',
  'user',
  'order',
  'payment',
  'document',
  'invoice',
  'delivery',
  'transfer',
  'warranty',
  'campaign',
  'tenant'
);

CREATE TYPE audit_action AS ENUM (
  'create',
  'update',
  'delete',
  'approve',
  'cancel',
  'reverse',
  'login',
  'export',
  'assign',
  'merge'
);

CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  document TEXT,
  phone TEXT,
  email TEXT,
  logo_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  settings JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE tenant_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE tenant_group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES tenant_groups(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (group_id, tenant_id)
);

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  is_system BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, slug)
);

CREATE TABLE permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module TEXT NOT NULL,
  action TEXT NOT NULL,
  description TEXT,
  UNIQUE (module, action)
);

CREATE TABLE role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  granted BOOLEAN NOT NULL DEFAULT true,
  UNIQUE (role_id, permission_id)
);

CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role_id)
);

CREATE TABLE user_permission_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  granted BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, permission_id, tenant_id)
);

CREATE TABLE timeline_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  entity_type timeline_entity_type NOT NULL,
  entity_id UUID NOT NULL,
  event_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  metadata JSONB NOT NULL DEFAULT '{}',
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_timeline_events_entity ON timeline_events (tenant_id, entity_type, entity_id, occurred_at DESC);
CREATE INDEX idx_timeline_events_tenant ON timeline_events (tenant_id, occurred_at DESC);

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action audit_action NOT NULL,
  module TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  previous_data JSONB,
  new_data JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_logs_tenant ON audit_logs (tenant_id, created_at DESC);
CREATE INDEX idx_audit_logs_entity ON audit_logs (entity_type, entity_id, created_at DESC);

CREATE TABLE master_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  price_monthly NUMERIC(12, 2) NOT NULL DEFAULT 0,
  features JSONB NOT NULL DEFAULT '{}',
  limits JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES plans(id),
  status TEXT NOT NULL DEFAULT 'active',
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO permissions (module, action, description) VALUES
  ('dashboard', 'view', 'View dashboard'),
  ('inventory', 'view', 'View inventory'),
  ('inventory', 'create', 'Create vehicles'),
  ('inventory', 'edit', 'Edit vehicles'),
  ('crm', 'view', 'View CRM'),
  ('crm', 'create', 'Create deals'),
  ('crm', 'edit', 'Edit deals'),
  ('finance', 'view', 'View finance'),
  ('finance', 'create', 'Create transactions'),
  ('finance', 'edit', 'Edit transactions'),
  ('documents', 'view', 'View documents'),
  ('documents', 'create', 'Create documents'),
  ('fiscal', 'view', 'View fiscal'),
  ('fiscal', 'create', 'Issue invoices'),
  ('settings', 'view', 'View settings'),
  ('settings', 'edit', 'Edit settings'),
  ('users', 'view', 'View users'),
  ('users', 'edit', 'Manage users'),
  ('reports', 'view', 'View reports'),
  ('reports', 'export', 'Export reports'),
  ('marketing', 'view', 'View marketing'),
  ('marketing', 'create', 'Create campaigns'),
  ('master', 'view', 'View master admin'),
  ('master', 'edit', 'Manage master admin');

INSERT INTO plans (name, slug, price_monthly, features, limits) VALUES
  ('Starter', 'starter', 0, '{"modules": ["dashboard", "crm", "inventory"]}', '{"users": 3, "vehicles": 50}'),
  ('Pro', 'pro', 299, '{"modules": ["all"]}', '{"users": 15, "vehicles": 500}'),
  ('Enterprise', 'enterprise', 599, '{"modules": ["all"], "master_analytics": true}', '{"users": 999, "vehicles": 9999}');

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER tenants_updated_at BEFORE UPDATE ON tenants
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.get_user_tenant_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT tenant_id FROM profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_master_user()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM master_users
    WHERE user_id = auth.uid() AND is_active = true
  );
$$;

ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_permission_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenants_select ON tenants FOR SELECT
  USING (id = public.get_user_tenant_id() OR public.is_master_user());

CREATE POLICY tenants_insert ON tenants FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY tenants_update ON tenants FOR UPDATE
  USING (id = public.get_user_tenant_id() OR public.is_master_user());

CREATE POLICY profiles_select ON profiles FOR SELECT
  USING (
    id = auth.uid()
    OR tenant_id = public.get_user_tenant_id()
    OR public.is_master_user()
  );

CREATE POLICY profiles_update ON profiles FOR UPDATE
  USING (id = auth.uid() OR public.is_master_user());

CREATE POLICY profiles_insert ON profiles FOR INSERT
  WITH CHECK (id = auth.uid() OR public.is_master_user());

CREATE POLICY roles_tenant ON roles FOR ALL
  USING (tenant_id = public.get_user_tenant_id() OR public.is_master_user())
  WITH CHECK (tenant_id = public.get_user_tenant_id() OR public.is_master_user());

CREATE POLICY permissions_read ON permissions FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY role_permissions_tenant ON role_permissions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM roles r
      WHERE r.id = role_id
        AND (r.tenant_id = public.get_user_tenant_id() OR public.is_master_user())
    )
  );

CREATE POLICY user_roles_tenant ON user_roles FOR ALL
  USING (tenant_id = public.get_user_tenant_id() OR public.is_master_user())
  WITH CHECK (tenant_id = public.get_user_tenant_id() OR public.is_master_user());

CREATE POLICY user_permission_overrides_tenant ON user_permission_overrides FOR ALL
  USING (tenant_id = public.get_user_tenant_id() OR public.is_master_user())
  WITH CHECK (tenant_id = public.get_user_tenant_id() OR public.is_master_user());

CREATE POLICY timeline_events_tenant ON timeline_events FOR ALL
  USING (tenant_id = public.get_user_tenant_id() OR public.is_master_user())
  WITH CHECK (tenant_id = public.get_user_tenant_id() OR public.is_master_user());

CREATE POLICY audit_logs_tenant ON audit_logs FOR SELECT
  USING (tenant_id = public.get_user_tenant_id() OR public.is_master_user());

CREATE POLICY audit_logs_insert ON audit_logs FOR INSERT
  WITH CHECK (tenant_id = public.get_user_tenant_id() OR public.is_master_user());

CREATE POLICY master_users_self ON master_users FOR SELECT
  USING (user_id = auth.uid() OR public.is_master_user());

CREATE POLICY plans_read ON plans FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY subscriptions_tenant ON subscriptions FOR SELECT
  USING (tenant_id = public.get_user_tenant_id() OR public.is_master_user());

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('tenant-attachments', 'tenant-attachments', false, 52428800, NULL),
  ('tenant-documents', 'tenant-documents', false, 52428800, ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'application/xml', 'text/xml']),
  ('tenant-avatars', 'tenant-avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

CREATE POLICY storage_tenant_attachments ON storage.objects FOR ALL
  USING (
    bucket_id IN ('tenant-attachments', 'tenant-documents', 'tenant-avatars')
    AND (storage.foldername(name))[1] = public.get_user_tenant_id()::text
  )
  WITH CHECK (
    bucket_id IN ('tenant-attachments', 'tenant-documents', 'tenant-avatars')
    AND (storage.foldername(name))[1] = public.get_user_tenant_id()::text
  );
