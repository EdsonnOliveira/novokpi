import type { SupabaseClient } from '@supabase/supabase-js';
import type { AuditAction, Database, Json } from '@/types/database';

interface AuditLogInput {
  tenantId?: string | null;
  userId?: string | null;
  action: AuditAction;
  module: string;
  entityType: string;
  entityId?: string | null;
  previousData?: Json | null;
  newData?: Json | null;
}

export async function writeAuditLog(
  supabase: SupabaseClient<Database>,
  input: AuditLogInput,
) {
  return supabase.from('audit_logs').insert({
    tenant_id: input.tenantId ?? null,
    user_id: input.userId ?? null,
    action: input.action,
    module: input.module,
    entity_type: input.entityType,
    entity_id: input.entityId ?? null,
    previous_data: input.previousData ?? null,
    new_data: input.newData ?? null,
  });
}
