import { createClient } from '@/lib/supabase/server';
import { getTenantContext } from '@/lib/settings/tenant-context';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

export interface FiscalSession {
  userId: string;
  tenantId: string;
  supabase: SupabaseClient<Database>;
}

export async function getFiscalSession(): Promise<FiscalSession | null> {
  const supabase = await createClient();
  const context = await getTenantContext(supabase);

  if (!context) return null;

  return {
    userId: context.userId,
    tenantId: context.tenantId,
    supabase,
  };
}

export function jsonError(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}
