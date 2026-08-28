CREATE TYPE financial_account_type AS ENUM (
  'bank',
  'cash',
  'wallet'
);

CREATE TYPE financial_transaction_type AS ENUM (
  'income',
  'expense'
);

CREATE TYPE financial_transaction_status AS ENUM (
  'pending',
  'paid',
  'partial',
  'cancelled',
  'reversed'
);

CREATE TYPE dre_group AS ENUM (
  'revenue',
  'vehicle_cost',
  'financing',
  'dispatcher',
  'insurance',
  'consortium',
  'accessories',
  'other_income',
  'sales_expense',
  'payroll',
  'marketing',
  'taxes',
  'administrative',
  'other_expense'
);

CREATE TABLE financial_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  account_type financial_account_type NOT NULL DEFAULT 'bank',
  initial_balance NUMERIC(12, 2) NOT NULL DEFAULT 0,
  current_balance NUMERIC(12, 2) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, slug)
);

CREATE TABLE financial_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  transaction_type financial_transaction_type NOT NULL,
  dre_group dre_group,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, slug)
);

CREATE TABLE financial_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES financial_accounts(id) ON DELETE RESTRICT,
  category_id UUID NOT NULL REFERENCES financial_categories(id) ON DELETE RESTRICT,
  transaction_type financial_transaction_type NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  paid_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  description TEXT NOT NULL,
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  paid_at TIMESTAMPTZ,
  status financial_transaction_status NOT NULL DEFAULT 'pending',
  origin_type TEXT,
  origin_id UUID,
  origin_label TEXT,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  person_id UUID REFERENCES people(id) ON DELETE SET NULL,
  vehicle_passage_id UUID REFERENCES vehicle_passages(id) ON DELETE SET NULL,
  reversed_transaction_id UUID REFERENCES financial_transactions(id) ON DELETE SET NULL,
  is_reversal BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_financial_transactions_tenant_date ON financial_transactions (tenant_id, transaction_date DESC);
CREATE INDEX idx_financial_transactions_account ON financial_transactions (account_id, transaction_date DESC);
CREATE INDEX idx_financial_transactions_status ON financial_transactions (tenant_id, status);
CREATE INDEX idx_financial_transactions_order ON financial_transactions (order_id);
CREATE INDEX idx_financial_transactions_origin ON financial_transactions (tenant_id, origin_type, origin_id);

CREATE TABLE transaction_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  transaction_id UUID NOT NULL REFERENCES financial_transactions(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES financial_accounts(id) ON DELETE RESTRICT,
  amount NUMERIC(12, 2) NOT NULL,
  paid_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_transaction_payments_transaction ON transaction_payments (transaction_id);

CREATE TABLE dispatcher_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  person_id UUID REFERENCES people(id) ON DELETE SET NULL,
  vehicle_passage_id UUID REFERENCES vehicle_passages(id) ON DELETE SET NULL,
  purpose TEXT NOT NULL,
  advance_received NUMERIC(12, 2) NOT NULL DEFAULT 0,
  costs_paid NUMERIC(12, 2) NOT NULL DEFAULT 0,
  balance NUMERIC(12, 2) NOT NULL DEFAULT 0,
  revenue_recognized NUMERIC(12, 2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'open',
  notes TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_dispatcher_records_tenant ON dispatcher_records (tenant_id, status);

CREATE OR REPLACE FUNCTION public.recalculate_account_balance(p_account_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_initial NUMERIC(12, 2);
  v_income NUMERIC(12, 2);
  v_expense NUMERIC(12, 2);
BEGIN
  SELECT initial_balance INTO v_initial
  FROM financial_accounts WHERE id = p_account_id;

  SELECT COALESCE(SUM(paid_amount), 0) INTO v_income
  FROM financial_transactions
  WHERE account_id = p_account_id
    AND transaction_type = 'income'
    AND status IN ('paid', 'partial')
    AND is_reversal = false;

  SELECT COALESCE(SUM(paid_amount), 0) INTO v_expense
  FROM financial_transactions
  WHERE account_id = p_account_id
    AND transaction_type = 'expense'
    AND status IN ('paid', 'partial')
    AND is_reversal = false;

  UPDATE financial_accounts
  SET current_balance = COALESCE(v_initial, 0) + COALESCE(v_income, 0) - COALESCE(v_expense, 0),
      updated_at = now()
  WHERE id = p_account_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_transaction_balance_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM public.recalculate_account_balance(OLD.account_id);
    RETURN OLD;
  END IF;

  PERFORM public.recalculate_account_balance(NEW.account_id);

  IF TG_OP = 'UPDATE' AND OLD.account_id IS DISTINCT FROM NEW.account_id THEN
    PERFORM public.recalculate_account_balance(OLD.account_id);
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER financial_transactions_balance_change
  AFTER INSERT OR UPDATE OR DELETE ON financial_transactions
  FOR EACH ROW EXECUTE FUNCTION public.handle_transaction_balance_change();

CREATE OR REPLACE FUNCTION public.seed_tenant_finance_defaults()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO financial_accounts (tenant_id, name, slug, account_type, initial_balance, current_balance) VALUES
    (NEW.id, 'Caixa', 'cash', 'cash', 0, 0),
    (NEW.id, 'Conta principal', 'main-bank', 'bank', 0, 0);

  INSERT INTO financial_categories (tenant_id, name, slug, transaction_type, dre_group, sort_order) VALUES
    (NEW.id, 'Venda de veículo', 'vehicle_sale', 'income', 'revenue', 1),
    (NEW.id, 'Compra de veículo', 'vehicle_purchase', 'expense', 'vehicle_cost', 2),
    (NEW.id, 'Preparação / OS', 'preparation', 'expense', 'vehicle_cost', 3),
    (NEW.id, 'Comissão financiamento', 'financing_commission', 'income', 'financing', 4),
    (NEW.id, 'Despachante / DUA', 'dispatcher', 'expense', 'dispatcher', 5),
    (NEW.id, 'Receita despachante', 'dispatcher_revenue', 'income', 'dispatcher', 6),
    (NEW.id, 'Comissão seguro', 'insurance_commission', 'income', 'insurance', 7),
    (NEW.id, 'Comissão consórcio', 'consortium_commission', 'income', 'consortium', 8),
    (NEW.id, 'Acessórios', 'accessories', 'income', 'accessories', 9),
    (NEW.id, 'Outras receitas', 'other_income', 'income', 'other_income', 10),
    (NEW.id, 'Despesas de vendas', 'sales_expense', 'expense', 'sales_expense', 11),
    (NEW.id, 'Pessoal', 'payroll', 'expense', 'payroll', 12),
    (NEW.id, 'Marketing', 'marketing', 'expense', 'marketing', 13),
    (NEW.id, 'Impostos', 'taxes', 'expense', 'taxes', 14),
    (NEW.id, 'Administrativas', 'administrative', 'expense', 'administrative', 15),
    (NEW.id, 'Outras despesas', 'other_expense', 'expense', 'other_expense', 16);

  RETURN NEW;
END;
$$;

CREATE TRIGGER tenants_seed_finance_defaults
  AFTER INSERT ON tenants
  FOR EACH ROW EXECUTE FUNCTION public.seed_tenant_finance_defaults();

CREATE TRIGGER financial_accounts_updated_at BEFORE UPDATE ON financial_accounts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER financial_transactions_updated_at BEFORE UPDATE ON financial_transactions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER dispatcher_records_updated_at BEFORE UPDATE ON dispatcher_records
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE financial_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE dispatcher_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY financial_accounts_tenant ON financial_accounts FOR ALL
  USING (tenant_id = public.get_user_tenant_id())
  WITH CHECK (tenant_id = public.get_user_tenant_id());

CREATE POLICY financial_categories_tenant ON financial_categories FOR ALL
  USING (tenant_id = public.get_user_tenant_id())
  WITH CHECK (tenant_id = public.get_user_tenant_id());

CREATE POLICY financial_transactions_tenant ON financial_transactions FOR ALL
  USING (tenant_id = public.get_user_tenant_id())
  WITH CHECK (tenant_id = public.get_user_tenant_id());

CREATE POLICY transaction_payments_tenant ON transaction_payments FOR ALL
  USING (tenant_id = public.get_user_tenant_id())
  WITH CHECK (tenant_id = public.get_user_tenant_id());

CREATE POLICY dispatcher_records_tenant ON dispatcher_records FOR ALL
  USING (tenant_id = public.get_user_tenant_id())
  WITH CHECK (tenant_id = public.get_user_tenant_id());

INSERT INTO financial_accounts (tenant_id, name, slug, account_type, initial_balance, current_balance)
SELECT t.id, a.name, a.slug, a.account_type::financial_account_type, 0, 0
FROM tenants t
CROSS JOIN (VALUES
  ('Caixa', 'cash', 'cash'),
  ('Conta principal', 'main-bank', 'bank')
) AS a(name, slug, account_type)
WHERE NOT EXISTS (
  SELECT 1 FROM financial_accounts fa WHERE fa.tenant_id = t.id
);

INSERT INTO financial_categories (tenant_id, name, slug, transaction_type, dre_group, sort_order)
SELECT t.id, c.name, c.slug, c.transaction_type::financial_transaction_type, c.dre_group::dre_group, c.sort_order
FROM tenants t
CROSS JOIN (VALUES
  ('Venda de veículo', 'vehicle_sale', 'income', 'revenue', 1),
  ('Compra de veículo', 'vehicle_purchase', 'expense', 'vehicle_cost', 2),
  ('Preparação / OS', 'preparation', 'expense', 'vehicle_cost', 3),
  ('Comissão financiamento', 'financing_commission', 'income', 'financing', 4),
  ('Despachante / DUA', 'dispatcher', 'expense', 'dispatcher', 5),
  ('Receita despachante', 'dispatcher_revenue', 'income', 'dispatcher', 6),
  ('Comissão seguro', 'insurance_commission', 'income', 'insurance', 7),
  ('Comissão consórcio', 'consortium_commission', 'income', 'consortium', 8),
  ('Acessórios', 'accessories', 'income', 'accessories', 9),
  ('Outras receitas', 'other_income', 'income', 'other_income', 10),
  ('Despesas de vendas', 'sales_expense', 'expense', 'sales_expense', 11),
  ('Pessoal', 'payroll', 'expense', 'payroll', 12),
  ('Marketing', 'marketing', 'expense', 'marketing', 13),
  ('Impostos', 'taxes', 'expense', 'taxes', 14),
  ('Administrativas', 'administrative', 'expense', 'administrative', 15),
  ('Outras despesas', 'other_expense', 'expense', 'other_expense', 16)
) AS c(name, slug, transaction_type, dre_group, sort_order)
WHERE NOT EXISTS (
  SELECT 1 FROM financial_categories fc WHERE fc.tenant_id = t.id
);
