ALTER TABLE interest_profiles
  ADD COLUMN IF NOT EXISTS plate TEXT;

CREATE INDEX IF NOT EXISTS idx_interest_profiles_plate
  ON interest_profiles (tenant_id, plate)
  WHERE plate IS NOT NULL;
