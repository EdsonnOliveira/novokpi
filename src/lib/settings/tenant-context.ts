import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import { cookies } from 'next/headers';

export async function getTenantContext(supabase: SupabaseClient<Database>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const cookieStore = await cookies();
  const impersonateTenantId = cookieStore.get('impersonate_tenant_id')?.value ?? null;
  const impersonateTenantName = cookieStore.get('impersonate_tenant_name')?.value ?? null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, full_name')
    .eq('id', user.id)
    .maybeSingle();

  if (impersonateTenantId) {
    const { data: masterUser } = await supabase
      .from('master_users')
      .select('id')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .maybeSingle();

    if (masterUser) {
      return {
        userId: user.id,
        tenantId: impersonateTenantId,
        userName: profile?.full_name ?? 'Master',
        isImpersonating: true,
        impersonateTenantName,
      };
    }
  }

  if (!profile?.tenant_id) {
    return null;
  }

  return {
    userId: user.id,
    tenantId: profile.tenant_id,
    userName: profile.full_name,
    isImpersonating: false,
    impersonateTenantName: null,
  };
}
