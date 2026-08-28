import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

export async function userHasPermission(
  supabase: SupabaseClient<Database>,
  userId: string,
  tenantId: string,
  module: string,
  action: string,
): Promise<boolean> {
  const { data: permission } = await supabase
    .from('permissions')
    .select('id')
    .eq('module', module)
    .eq('action', action)
    .maybeSingle();

  if (!permission) {
    return false;
  }

  const { data: override } = await supabase
    .from('user_permission_overrides')
    .select('granted')
    .eq('user_id', userId)
    .eq('tenant_id', tenantId)
    .eq('permission_id', permission.id)
    .maybeSingle();

  if (override) {
    return override.granted;
  }

  const { data: userRoles } = await supabase
    .from('user_roles')
    .select('role_id')
    .eq('user_id', userId)
    .eq('tenant_id', tenantId);

  if (!userRoles?.length) {
    return false;
  }

  const roleIds = userRoles.map((item) => item.role_id);

  const { data: rolePermissions } = await supabase
    .from('role_permissions')
    .select('granted, permission_id')
    .in('role_id', roleIds)
    .eq('permission_id', permission.id)
    .eq('granted', true);

  return Boolean(rolePermissions?.length);
}
