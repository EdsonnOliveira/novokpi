CREATE TYPE stock_modality_slug AS ENUM (
  'purchase',
  'trade_in',
  'consignment',
  'online_consignment'
);

CREATE TYPE passage_status AS ENUM (
  'in_stock',
  'reserved',
  'sold',
  'temporarily_out'
);

CREATE TYPE preparation_status AS ENUM (
  'pending',
  'in_progress',
  'done',
  'cancelled'
);

CREATE TYPE evaluation_status AS ENUM (
  'pending',
  'approved',
  'rejected',
  'cancelled'
);

CREATE TYPE report_status AS ENUM (
  'none',
  'pending',
  'approved',
  'rejected'
);

CREATE TABLE vehicle_brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_vehicle_brands_tenant_name ON vehicle_brands (tenant_id, name);

CREATE TABLE vehicle_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  brand_id UUID NOT NULL REFERENCES vehicle_brands(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (brand_id, name)
);

CREATE TABLE vehicle_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  model_id UUID NOT NULL REFERENCES vehicle_models(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (model_id, name)
);

CREATE TABLE stock_modalities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug stock_modality_slug NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, slug)
);

CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  plate TEXT,
  chassis TEXT,
  renavam TEXT,
  brand_id UUID REFERENCES vehicle_brands(id) ON DELETE SET NULL,
  model_id UUID REFERENCES vehicle_models(id) ON DELETE SET NULL,
  version_id UUID REFERENCES vehicle_versions(id) ON DELETE SET NULL,
  year_manufacture INT,
  year_model INT,
  color TEXT,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_vehicles_tenant_plate ON vehicles (tenant_id, plate);
CREATE INDEX idx_vehicles_tenant_chassis ON vehicles (tenant_id, chassis);

CREATE TABLE vehicle_passages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  passage_number INT NOT NULL,
  modality_id UUID NOT NULL REFERENCES stock_modalities(id) ON DELETE RESTRICT,
  status passage_status NOT NULL DEFAULT 'in_stock',
  stock_started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  acquisition_cost NUMERIC(12, 2) NOT NULL DEFAULT 0,
  cost NUMERIC(12, 2) NOT NULL DEFAULT 0,
  sale_price NUMERIC(12, 2),
  fipe_value NUMERIC(12, 2),
  km INT,
  owner_person_id UUID REFERENCES people(id) ON DELETE SET NULL,
  capturer_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
  consignment_net_value NUMERIC(12, 2),
  consignment_percent NUMERIC(5, 2),
  has_history_alert BOOLEAN NOT NULL DEFAULT false,
  reserved_deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
  reserved_at TIMESTAMPTZ,
  sold_at TIMESTAMPTZ,
  exited_at TIMESTAMPTZ,
  notes TEXT,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, vehicle_id, passage_number)
);

CREATE INDEX idx_vehicle_passages_tenant_status ON vehicle_passages (tenant_id, status);
CREATE INDEX idx_vehicle_passages_stock_started ON vehicle_passages (tenant_id, stock_started_at);

CREATE TABLE vehicle_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  passage_id UUID NOT NULL REFERENCES vehicle_passages(id) ON DELETE CASCADE,
  price_type TEXT NOT NULL,
  value NUMERIC(12, 2) NOT NULL,
  changed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_vehicle_prices_passage ON vehicle_prices (passage_id, created_at DESC);

CREATE TABLE preparation_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  passage_id UUID NOT NULL REFERENCES vehicle_passages(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  is_internal BOOLEAN NOT NULL DEFAULT true,
  supplier_name TEXT,
  supplier_phone TEXT,
  budget_amount NUMERIC(12, 2),
  authorized_amount NUMERIC(12, 2),
  actual_cost NUMERIC(12, 2) NOT NULL DEFAULT 0,
  payment_status TEXT,
  warranty_until DATE,
  status preparation_status NOT NULL DEFAULT 'pending',
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_preparation_orders_passage ON preparation_orders (passage_id);

CREATE TABLE vehicle_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  passage_id UUID NOT NULL REFERENCES vehicle_passages(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT false,
  uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_vehicle_photos_passage ON vehicle_photos (passage_id, sort_order);

CREATE TABLE vehicle_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  passage_id UUID NOT NULL REFERENCES vehicle_passages(id) ON DELETE CASCADE,
  status report_status NOT NULL DEFAULT 'none',
  storage_path TEXT,
  notes TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_vehicle_reports_passage ON vehicle_reports (passage_id);

CREATE TABLE evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
  person_id UUID REFERENCES people(id) ON DELETE SET NULL,
  brand_id UUID REFERENCES vehicle_brands(id) ON DELETE SET NULL,
  model_id UUID REFERENCES vehicle_models(id) ON DELETE SET NULL,
  version_id UUID REFERENCES vehicle_versions(id) ON DELETE SET NULL,
  plate TEXT,
  year_manufacture INT,
  year_model INT,
  color TEXT,
  km INT,
  fipe_value NUMERIC(12, 2),
  offered_value NUMERIC(12, 2),
  notes TEXT,
  status evaluation_status NOT NULL DEFAULT 'pending',
  evaluated_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_evaluations_tenant_status ON evaluations (tenant_id, status);

CREATE TABLE stock_exits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  passage_id UUID NOT NULL REFERENCES vehicle_passages(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  exited_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expected_return_at TIMESTAMPTZ,
  returned_at TIMESTAMPTZ,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE offer_queue
  ADD CONSTRAINT offer_queue_vehicle_id_fkey
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE SET NULL;

CREATE OR REPLACE FUNCTION public.next_passage_number(p_vehicle_id UUID)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_number INT;
BEGIN
  SELECT COALESCE(MAX(passage_number), 0) + 1 INTO v_number
  FROM vehicle_passages WHERE vehicle_id = p_vehicle_id;
  RETURN v_number;
END;
$$;

CREATE OR REPLACE FUNCTION public.recalculate_passage_cost(p_passage_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_acquisition NUMERIC(12, 2);
  v_preparation NUMERIC(12, 2);
BEGIN
  SELECT acquisition_cost INTO v_acquisition
  FROM vehicle_passages WHERE id = p_passage_id;

  SELECT COALESCE(SUM(actual_cost), 0) INTO v_preparation
  FROM preparation_orders
  WHERE passage_id = p_passage_id AND status != 'cancelled';

  UPDATE vehicle_passages
  SET cost = COALESCE(v_acquisition, 0) + COALESCE(v_preparation, 0),
      updated_at = now()
  WHERE id = p_passage_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_preparation_cost_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.recalculate_passage_cost(
    COALESCE(NEW.passage_id, OLD.passage_id)
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER preparation_orders_cost_change
  AFTER INSERT OR UPDATE OR DELETE ON preparation_orders
  FOR EACH ROW EXECUTE FUNCTION public.handle_preparation_cost_change();

CREATE OR REPLACE FUNCTION public.seed_tenant_inventory_defaults()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_fiat UUID;
  v_vw UUID;
  v_chev UUID;
  v_toyota UUID;
  v_honda UUID;
  v_hyundai UUID;
  v_fiat_uno UUID;
  v_vw_gol UUID;
  v_chev_onix UUID;
BEGIN
  INSERT INTO stock_modalities (tenant_id, name, slug, sort_order) VALUES
    (NEW.id, 'Compra', 'purchase', 1),
    (NEW.id, 'Troca', 'trade_in', 2),
    (NEW.id, 'Consignação', 'consignment', 3),
    (NEW.id, 'Consignação online', 'online_consignment', 4);

  INSERT INTO vehicle_brands (tenant_id, name) VALUES
    (NEW.id, 'Fiat') RETURNING id INTO v_fiat;
  INSERT INTO vehicle_brands (tenant_id, name) VALUES
    (NEW.id, 'Volkswagen') RETURNING id INTO v_vw;
  INSERT INTO vehicle_brands (tenant_id, name) VALUES
    (NEW.id, 'Chevrolet') RETURNING id INTO v_chev;
  INSERT INTO vehicle_brands (tenant_id, name) VALUES
    (NEW.id, 'Toyota') RETURNING id INTO v_toyota;
  INSERT INTO vehicle_brands (tenant_id, name) VALUES
    (NEW.id, 'Honda') RETURNING id INTO v_honda;
  INSERT INTO vehicle_brands (tenant_id, name) VALUES
    (NEW.id, 'Hyundai') RETURNING id INTO v_hyundai;

  INSERT INTO vehicle_models (tenant_id, brand_id, name) VALUES
    (NEW.id, v_fiat, 'Uno') RETURNING id INTO v_fiat_uno;
  INSERT INTO vehicle_models (tenant_id, brand_id, name) VALUES
    (NEW.id, v_fiat, 'Argo');
  INSERT INTO vehicle_models (tenant_id, brand_id, name) VALUES
    (NEW.id, v_fiat, 'Cronos');
  INSERT INTO vehicle_models (tenant_id, brand_id, name) VALUES
    (NEW.id, v_vw, 'Gol') RETURNING id INTO v_vw_gol;
  INSERT INTO vehicle_models (tenant_id, brand_id, name) VALUES
    (NEW.id, v_vw, 'Polo');
  INSERT INTO vehicle_models (tenant_id, brand_id, name) VALUES
    (NEW.id, v_vw, 'T-Cross');
  INSERT INTO vehicle_models (tenant_id, brand_id, name) VALUES
    (NEW.id, v_chev, 'Onix') RETURNING id INTO v_chev_onix;
  INSERT INTO vehicle_models (tenant_id, brand_id, name) VALUES
    (NEW.id, v_chev, 'Tracker');
  INSERT INTO vehicle_models (tenant_id, brand_id, name) VALUES
    (NEW.id, v_toyota, 'Corolla');
  INSERT INTO vehicle_models (tenant_id, brand_id, name) VALUES
    (NEW.id, v_toyota, 'Hilux');
  INSERT INTO vehicle_models (tenant_id, brand_id, name) VALUES
    (NEW.id, v_honda, 'Civic');
  INSERT INTO vehicle_models (tenant_id, brand_id, name) VALUES
    (NEW.id, v_honda, 'HR-V');
  INSERT INTO vehicle_models (tenant_id, brand_id, name) VALUES
    (NEW.id, v_hyundai, 'HB20');
  INSERT INTO vehicle_models (tenant_id, brand_id, name) VALUES
    (NEW.id, v_hyundai, 'Creta');

  INSERT INTO vehicle_versions (tenant_id, model_id, name) VALUES
    (NEW.id, v_fiat_uno, '1.0 Fire'),
    (NEW.id, v_fiat_uno, '1.0 Way'),
    (NEW.id, v_vw_gol, '1.0 MPI'),
    (NEW.id, v_vw_gol, '1.6 MSI'),
    (NEW.id, v_chev_onix, '1.0 LT'),
    (NEW.id, v_chev_onix, '1.0 Turbo Premier');

  RETURN NEW;
END;
$$;

CREATE TRIGGER tenants_seed_inventory_defaults
  AFTER INSERT ON tenants
  FOR EACH ROW EXECUTE FUNCTION public.seed_tenant_inventory_defaults();

CREATE TRIGGER vehicles_updated_at BEFORE UPDATE ON vehicles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER vehicle_passages_updated_at BEFORE UPDATE ON vehicle_passages
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER preparation_orders_updated_at BEFORE UPDATE ON preparation_orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER evaluations_updated_at BEFORE UPDATE ON evaluations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER vehicle_reports_updated_at BEFORE UPDATE ON vehicle_reports
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE vehicle_brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_modalities ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_passages ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE preparation_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_exits ENABLE ROW LEVEL SECURITY;

CREATE POLICY vehicle_brands_tenant ON vehicle_brands FOR ALL
  USING (tenant_id = public.get_user_tenant_id() OR public.is_master_user())
  WITH CHECK (tenant_id = public.get_user_tenant_id() OR public.is_master_user());

CREATE POLICY vehicle_models_tenant ON vehicle_models FOR ALL
  USING (tenant_id = public.get_user_tenant_id())
  WITH CHECK (tenant_id = public.get_user_tenant_id());

CREATE POLICY vehicle_versions_tenant ON vehicle_versions FOR ALL
  USING (tenant_id = public.get_user_tenant_id())
  WITH CHECK (tenant_id = public.get_user_tenant_id());

CREATE POLICY stock_modalities_tenant ON stock_modalities FOR ALL
  USING (tenant_id = public.get_user_tenant_id())
  WITH CHECK (tenant_id = public.get_user_tenant_id());

CREATE POLICY vehicles_tenant ON vehicles FOR ALL
  USING (tenant_id = public.get_user_tenant_id())
  WITH CHECK (tenant_id = public.get_user_tenant_id());

CREATE POLICY vehicle_passages_tenant ON vehicle_passages FOR ALL
  USING (tenant_id = public.get_user_tenant_id())
  WITH CHECK (tenant_id = public.get_user_tenant_id());

CREATE POLICY vehicle_prices_tenant ON vehicle_prices FOR ALL
  USING (tenant_id = public.get_user_tenant_id())
  WITH CHECK (tenant_id = public.get_user_tenant_id());

CREATE POLICY preparation_orders_tenant ON preparation_orders FOR ALL
  USING (tenant_id = public.get_user_tenant_id())
  WITH CHECK (tenant_id = public.get_user_tenant_id());

CREATE POLICY vehicle_photos_tenant ON vehicle_photos FOR ALL
  USING (tenant_id = public.get_user_tenant_id())
  WITH CHECK (tenant_id = public.get_user_tenant_id());

CREATE POLICY vehicle_reports_tenant ON vehicle_reports FOR ALL
  USING (tenant_id = public.get_user_tenant_id())
  WITH CHECK (tenant_id = public.get_user_tenant_id());

CREATE POLICY evaluations_tenant ON evaluations FOR ALL
  USING (tenant_id = public.get_user_tenant_id())
  WITH CHECK (tenant_id = public.get_user_tenant_id());

CREATE POLICY stock_exits_tenant ON stock_exits FOR ALL
  USING (tenant_id = public.get_user_tenant_id())
  WITH CHECK (tenant_id = public.get_user_tenant_id());

INSERT INTO stock_modalities (tenant_id, name, slug, sort_order)
SELECT t.id, m.name, m.slug::stock_modality_slug, m.sort_order
FROM tenants t
CROSS JOIN (VALUES
  ('Compra', 'purchase', 1),
  ('Troca', 'trade_in', 2),
  ('Consignação', 'consignment', 3),
  ('Consignação online', 'online_consignment', 4)
) AS m(name, slug, sort_order)
WHERE NOT EXISTS (
  SELECT 1 FROM stock_modalities sm WHERE sm.tenant_id = t.id
);

INSERT INTO vehicle_brands (tenant_id, name)
SELECT t.id, b.name
FROM tenants t
CROSS JOIN (VALUES
  ('Fiat'), ('Volkswagen'), ('Chevrolet'), ('Toyota'), ('Honda'), ('Hyundai')
) AS b(name)
WHERE NOT EXISTS (
  SELECT 1 FROM vehicle_brands vb WHERE vb.tenant_id = t.id
);
