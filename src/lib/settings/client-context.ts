import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

export interface ClientTenantContext {
  tenantId: string;
  userId: string;
  userName?: string;
  isImpersonating?: boolean;
}

export async function getClientTenantContext(
  supabase: SupabaseClient<Database>,
): Promise<ClientTenantContext | null> {
  try {
    const response = await fetch('/api/tenant/context', { cache: 'no-store' });
    if (response.ok) {
      return (await response.json()) as ClientTenantContext;
    }
  } catch {
    // fallback abaixo
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, full_name')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile?.tenant_id) {
    return null;
  }

  return {
    tenantId: profile.tenant_id,
    userId: user.id,
    userName: profile.full_name ?? undefined,
    isImpersonating: false,
  };
}
