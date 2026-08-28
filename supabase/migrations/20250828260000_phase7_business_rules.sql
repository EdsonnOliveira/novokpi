ALTER TABLE generated_documents ADD COLUMN IF NOT EXISTS content_html TEXT;

CREATE OR REPLACE FUNCTION public.get_effective_tenant_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    NULLIF(current_setting('request.jwt.claim.impersonate_tenant_id', true), '')::uuid,
    (SELECT tenant_id FROM profiles WHERE id = auth.uid())
  );
$$;
