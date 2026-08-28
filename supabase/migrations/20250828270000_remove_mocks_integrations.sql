DELETE FROM help_videos
WHERE video_url LIKE '%dQw4w9WgXcQ%';

ALTER TABLE vehicle_portal_ads
  ADD COLUMN IF NOT EXISTS sync_payload JSONB NOT NULL DEFAULT '{}';

CREATE TABLE IF NOT EXISTS tenant_site_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  passage_id UUID NOT NULL REFERENCES vehicle_passages(id) ON DELETE CASCADE,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
  plate TEXT,
  vehicle_label TEXT,
  sale_price NUMERIC(12, 2),
  km INT,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  synced_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, passage_id)
);

CREATE INDEX IF NOT EXISTS idx_tenant_site_inventory_tenant ON tenant_site_inventory (tenant_id, is_visible);

ALTER TABLE tenant_site_inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_site_inventory_tenant ON tenant_site_inventory FOR ALL
  USING (tenant_id = public.get_user_tenant_id() OR public.is_master_user())
  WITH CHECK (tenant_id = public.get_user_tenant_id() OR public.is_master_user());
