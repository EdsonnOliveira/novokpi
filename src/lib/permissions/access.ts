import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import { userHasPermission } from '@/lib/permissions/check';

export async function canViewAllDeals(
  supabase: SupabaseClient<Database>,
  userId: string,
  tenantId: string,
) {
  const canEdit = await userHasPermission(supabase, userId, tenantId, 'crm', 'edit');
  if (canEdit) return true;
  return userHasPermission(supabase, userId, tenantId, 'settings', 'edit');
}

export async function canAccessDeal(
  supabase: SupabaseClient<Database>,
  userId: string,
  tenantId: string,
  dealId: string,
) {
  const viewAll = await canViewAllDeals(supabase, userId, tenantId);
  if (viewAll) return true;

  const { data: deal } = await supabase
    .from('deals')
    .select('assigned_user_id')
    .eq('id', dealId)
    .eq('tenant_id', tenantId)
    .maybeSingle();

  if (!deal) return false;

  if (deal.assigned_user_id === userId) return true;

  const { data: assignment } = await supabase
    .from('deal_assignments')
    .select('id')
    .eq('deal_id', dealId)
    .eq('user_id', userId)
    .is('unassigned_at', null)
    .maybeSingle();

  return Boolean(assignment);
}

export async function requirePermission(
  supabase: SupabaseClient<Database>,
  userId: string,
  tenantId: string,
  module: string,
  action: string,
) {
  const allowed = await userHasPermission(supabase, userId, tenantId, module, action);
  if (!allowed) {
    throw new Error('Sem permissão para esta ação.');
  }
}
