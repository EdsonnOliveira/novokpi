ALTER TABLE interest_profiles
  ADD COLUMN IF NOT EXISTS vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_interest_profiles_vehicle
  ON interest_profiles (tenant_id, vehicle_id)
  WHERE vehicle_id IS NOT NULL;
