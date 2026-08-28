DO $$
DECLARE
  t RECORD;
  v_fiat UUID;
  v_vw UUID;
  v_chev UUID;
  v_fiat_uno UUID;
  v_vw_gol UUID;
  v_chev_onix UUID;
BEGIN
  FOR t IN SELECT id FROM tenants LOOP
    IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE tenant_id = t.id) THEN
      SELECT id INTO v_fiat FROM vehicle_brands WHERE tenant_id = t.id AND name = 'Fiat' LIMIT 1;
      SELECT id INTO v_vw FROM vehicle_brands WHERE tenant_id = t.id AND name = 'Volkswagen' LIMIT 1;
      SELECT id INTO v_chev FROM vehicle_brands WHERE tenant_id = t.id AND name = 'Chevrolet' LIMIT 1;

      IF v_fiat IS NOT NULL THEN
        INSERT INTO vehicle_models (tenant_id, brand_id, name) VALUES
          (t.id, v_fiat, 'Uno') RETURNING id INTO v_fiat_uno;
        INSERT INTO vehicle_models (tenant_id, brand_id, name) VALUES
          (t.id, v_fiat, 'Argo'),
          (t.id, v_fiat, 'Cronos');
      END IF;

      IF v_vw IS NOT NULL THEN
        INSERT INTO vehicle_models (tenant_id, brand_id, name) VALUES
          (t.id, v_vw, 'Gol') RETURNING id INTO v_vw_gol;
        INSERT INTO vehicle_models (tenant_id, brand_id, name) VALUES
          (t.id, v_vw, 'Polo'),
          (t.id, v_vw, 'T-Cross');
      END IF;

      IF v_chev IS NOT NULL THEN
        INSERT INTO vehicle_models (tenant_id, brand_id, name) VALUES
          (t.id, v_chev, 'Onix') RETURNING id INTO v_chev_onix;
        INSERT INTO vehicle_models (tenant_id, brand_id, name) VALUES
          (t.id, v_chev, 'Tracker');
      END IF;

      IF v_fiat_uno IS NOT NULL THEN
        INSERT INTO vehicle_versions (tenant_id, model_id, name) VALUES
          (t.id, v_fiat_uno, '1.0 Fire'),
          (t.id, v_fiat_uno, '1.0 Way');
      END IF;

      IF v_vw_gol IS NOT NULL THEN
        INSERT INTO vehicle_versions (tenant_id, model_id, name) VALUES
          (t.id, v_vw_gol, '1.0 MPI'),
          (t.id, v_vw_gol, '1.6 MSI');
      END IF;

      IF v_chev_onix IS NOT NULL THEN
        INSERT INTO vehicle_versions (tenant_id, model_id, name) VALUES
          (t.id, v_chev_onix, '1.0 LT'),
          (t.id, v_chev_onix, '1.0 Turbo Premier');
      END IF;
    END IF;
  END LOOP;
END;
$$;
