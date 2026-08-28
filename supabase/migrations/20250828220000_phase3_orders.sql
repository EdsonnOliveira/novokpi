CREATE TYPE order_status AS ENUM (
  'draft',
  'reserved',
  'closed',
  'cancelled'
);

CREATE TYPE order_payment_status AS ENUM (
  'pending',
  'paid',
  'partial',
  'cancelled'
);

CREATE TYPE delivery_status AS ENUM (
  'pending',
  'scheduled',
  'delivered',
  'cancelled'
);

CREATE TYPE transfer_status AS ENUM (
  'pending',
  'in_progress',
  'completed',
  'cancelled'
);

CREATE TABLE payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, slug)
);

CREATE TABLE product_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, slug)
);

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  order_number INT NOT NULL,
  deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
  person_id UUID NOT NULL REFERENCES people(id) ON DELETE RESTRICT,
  vehicle_passage_id UUID REFERENCES vehicle_passages(id) ON DELETE SET NULL,
  seller_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  channel_id UUID REFERENCES channels(id) ON DELETE SET NULL,
  status order_status NOT NULL DEFAULT 'draft',
  total_value NUMERIC(12, 2),
  vehicle_value NUMERIC(12, 2),
  margin_value NUMERIC(12, 2),
  margin_percent NUMERIC(5, 2),
  primary_payment_method TEXT,
  invoice_status TEXT NOT NULL DEFAULT 'pending',
  delivery_status delivery_status NOT NULL DEFAULT 'pending',
  transfer_status transfer_status NOT NULL DEFAULT 'pending',
  reserved_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancel_reason TEXT,
  notes TEXT,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, order_number)
);

CREATE INDEX idx_orders_tenant_status ON orders (tenant_id, status);
CREATE INDEX idx_orders_tenant_closed ON orders (tenant_id, closed_at DESC);
CREATE INDEX idx_orders_deal ON orders (deal_id);
CREATE INDEX idx_orders_passage ON orders (vehicle_passage_id);

CREATE TABLE order_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  payee_name TEXT,
  payee_document TEXT,
  payment_method_id UUID REFERENCES payment_methods(id) ON DELETE SET NULL,
  payment_method_name TEXT,
  amount NUMERIC(12, 2) NOT NULL,
  due_date DATE,
  paid_at TIMESTAMPTZ,
  status order_payment_status NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_order_payments_order ON order_payments (order_id);

CREATE TABLE order_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_type_id UUID REFERENCES product_types(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  amount NUMERIC(12, 2),
  commission NUMERIC(12, 2),
  expected_receipt_at DATE,
  received_at TIMESTAMPTZ,
  responsible_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_order_products_order ON order_products (order_id);

CREATE TABLE order_advances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  person_id UUID REFERENCES people(id) ON DELETE SET NULL,
  purpose TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  balance NUMERIC(12, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  delivered_at TIMESTAMPTZ,
  delivery_km INT,
  responsible_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  warranty_start DATE,
  warranty_end DATE,
  warranty_km_limit INT,
  client_satisfaction TEXT,
  went_well BOOLEAN,
  client_notes TEXT,
  notes TEXT,
  status delivery_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_deliveries_order ON deliveries (order_id);
CREATE INDEX idx_deliveries_tenant_status ON deliveries (tenant_id, status);

CREATE TABLE delivery_checklist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  delivery_id UUID NOT NULL REFERENCES deliveries(id) ON DELETE CASCADE,
  item_key TEXT NOT NULL,
  item_label TEXT NOT NULL,
  is_checked BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  sort_order INT NOT NULL DEFAULT 0
);

CREATE INDEX idx_delivery_checklist_delivery ON delivery_checklist_items (delivery_id, sort_order);

CREATE TABLE delivery_pendencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  delivery_id UUID NOT NULL REFERENCES deliveries(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  is_resolved BOOLEAN NOT NULL DEFAULT false,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_delivery_pendencies_order ON delivery_pendencies (order_id, is_resolved);

CREATE TABLE vehicle_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  vehicle_passage_id UUID REFERENCES vehicle_passages(id) ON DELETE SET NULL,
  responsible_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  third_party_name TEXT,
  status transfer_status NOT NULL DEFAULT 'pending',
  atpv_done BOOLEAN NOT NULL DEFAULT false,
  signature_done BOOLEAN NOT NULL DEFAULT false,
  sale_communication_done BOOLEAN NOT NULL DEFAULT false,
  dispatcher_done BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  deadline_at DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_vehicle_transfers_order ON vehicle_transfers (order_id);
CREATE INDEX idx_vehicle_transfers_tenant_status ON vehicle_transfers (tenant_id, status);

CREATE OR REPLACE FUNCTION public.next_order_number(p_tenant_id UUID)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_number INT;
BEGIN
  SELECT COALESCE(MAX(order_number), 0) + 1 INTO v_number
  FROM orders WHERE tenant_id = p_tenant_id;
  RETURN v_number;
END;
$$;

CREATE OR REPLACE FUNCTION public.seed_tenant_orders_defaults()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO payment_methods (tenant_id, name, slug, sort_order) VALUES
    (NEW.id, 'Dinheiro', 'cash', 1),
    (NEW.id, 'PIX', 'pix', 2),
    (NEW.id, 'Transferência', 'transfer', 3),
    (NEW.id, 'Cartão de crédito', 'credit_card', 4),
    (NEW.id, 'Cartão de débito', 'debit_card', 5),
    (NEW.id, 'Financiamento', 'financing', 6),
    (NEW.id, 'Consórcio', 'consortium', 7),
    (NEW.id, 'Cheque', 'check', 8),
    (NEW.id, 'Veículo na troca', 'trade_vehicle', 9);

  INSERT INTO product_types (tenant_id, name, slug, sort_order) VALUES
    (NEW.id, 'Financiamento', 'financing', 1),
    (NEW.id, 'Despachante', 'dispatcher', 2),
    (NEW.id, 'Seguro', 'insurance', 3),
    (NEW.id, 'Consórcio', 'consortium', 4),
    (NEW.id, 'Acessórios', 'accessories', 5);

  RETURN NEW;
END;
$$;

CREATE TRIGGER tenants_seed_orders_defaults
  AFTER INSERT ON tenants
  FOR EACH ROW EXECUTE FUNCTION public.seed_tenant_orders_defaults();

CREATE TRIGGER orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER deliveries_updated_at BEFORE UPDATE ON deliveries
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER vehicle_transfers_updated_at BEFORE UPDATE ON vehicle_transfers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_advances ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_pendencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_transfers ENABLE ROW LEVEL SECURITY;

CREATE POLICY payment_methods_tenant ON payment_methods FOR ALL
  USING (tenant_id = public.get_user_tenant_id())
  WITH CHECK (tenant_id = public.get_user_tenant_id());

CREATE POLICY product_types_tenant ON product_types FOR ALL
  USING (tenant_id = public.get_user_tenant_id())
  WITH CHECK (tenant_id = public.get_user_tenant_id());

CREATE POLICY orders_tenant ON orders FOR ALL
  USING (tenant_id = public.get_user_tenant_id())
  WITH CHECK (tenant_id = public.get_user_tenant_id());

CREATE POLICY order_payments_tenant ON order_payments FOR ALL
  USING (tenant_id = public.get_user_tenant_id())
  WITH CHECK (tenant_id = public.get_user_tenant_id());

CREATE POLICY order_products_tenant ON order_products FOR ALL
  USING (tenant_id = public.get_user_tenant_id())
  WITH CHECK (tenant_id = public.get_user_tenant_id());

CREATE POLICY order_advances_tenant ON order_advances FOR ALL
  USING (tenant_id = public.get_user_tenant_id())
  WITH CHECK (tenant_id = public.get_user_tenant_id());

CREATE POLICY deliveries_tenant ON deliveries FOR ALL
  USING (tenant_id = public.get_user_tenant_id())
  WITH CHECK (tenant_id = public.get_user_tenant_id());

CREATE POLICY delivery_checklist_items_tenant ON delivery_checklist_items FOR ALL
  USING (tenant_id = public.get_user_tenant_id())
  WITH CHECK (tenant_id = public.get_user_tenant_id());

CREATE POLICY delivery_pendencies_tenant ON delivery_pendencies FOR ALL
  USING (tenant_id = public.get_user_tenant_id())
  WITH CHECK (tenant_id = public.get_user_tenant_id());

CREATE POLICY vehicle_transfers_tenant ON vehicle_transfers FOR ALL
  USING (tenant_id = public.get_user_tenant_id())
  WITH CHECK (tenant_id = public.get_user_tenant_id());

INSERT INTO payment_methods (tenant_id, name, slug, sort_order)
SELECT t.id, m.name, m.slug, m.sort_order
FROM tenants t
CROSS JOIN (VALUES
  ('Dinheiro', 'cash', 1),
  ('PIX', 'pix', 2),
  ('Transferência', 'transfer', 3),
  ('Cartão de crédito', 'credit_card', 4),
  ('Cartão de débito', 'debit_card', 5),
  ('Financiamento', 'financing', 6),
  ('Consórcio', 'consortium', 7),
  ('Cheque', 'check', 8),
  ('Veículo na troca', 'trade_vehicle', 9)
) AS m(name, slug, sort_order)
WHERE NOT EXISTS (
  SELECT 1 FROM payment_methods pm WHERE pm.tenant_id = t.id
);

INSERT INTO product_types (tenant_id, name, slug, sort_order)
SELECT t.id, p.name, p.slug, p.sort_order
FROM tenants t
CROSS JOIN (VALUES
  ('Financiamento', 'financing', 1),
  ('Despachante', 'dispatcher', 2),
  ('Seguro', 'insurance', 3),
  ('Consórcio', 'consortium', 4),
  ('Acessórios', 'accessories', 5)
) AS p(name, slug, sort_order)
WHERE NOT EXISTS (
  SELECT 1 FROM product_types pt WHERE pt.tenant_id = t.id
);
