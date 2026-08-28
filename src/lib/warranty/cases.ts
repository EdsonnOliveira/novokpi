import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import { writeAuditLog } from '@/lib/timeline/audit';

interface CreateWarrantyCaseInput {
  tenantId: string;
  userId: string;
  title: string;
  description?: string;
  orderId?: string;
  passageId?: string;
  personId?: string;
  assignedUserId?: string;
}

interface UpdateWarrantyStatusInput {
  tenantId: string;
  userId: string;
  caseId: string;
  status: string;
}

export async function createWarrantyCase(
  supabase: SupabaseClient<Database>,
  input: CreateWarrantyCaseInput,
) {
  const { data: warrantyCase, error } = await supabase
    .from('warranty_cases')
    .insert({
      tenant_id: input.tenantId,
      title: input.title,
      description: input.description ?? null,
      order_id: input.orderId ?? null,
      passage_id: input.passageId ?? null,
      person_id: input.personId ?? null,
      assigned_user_id: input.assignedUserId ?? input.userId,
      status: 'open',
    })
    .select('id')
    .single();

  if (error || !warrantyCase) {
    throw new Error('Não foi possível abrir ocorrência.');
  }

  await writeAuditLog(supabase, {
    tenantId: input.tenantId,
    userId: input.userId,
    action: 'create',
    module: 'warranty',
    entityType: 'warranty_case',
    entityId: warrantyCase.id,
    newData: { title: input.title, status: 'open' },
  });

  return warrantyCase;
}

export async function updateWarrantyCaseStatus(
  supabase: SupabaseClient<Database>,
  input: UpdateWarrantyStatusInput,
) {
  const resolvedAt =
    input.status === 'resolved' || input.status === 'closed'
      ? new Date().toISOString()
      : null;

  const { error } = await supabase
    .from('warranty_cases')
    .update({
      status: input.status,
      resolved_at: resolvedAt,
    })
    .eq('id', input.caseId)
    .eq('tenant_id', input.tenantId);

  if (error) {
    throw new Error('Não foi possível atualizar ocorrência.');
  }

  await writeAuditLog(supabase, {
    tenantId: input.tenantId,
    userId: input.userId,
    action: 'update',
    module: 'warranty',
    entityType: 'warranty_case',
    entityId: input.caseId,
    newData: { status: input.status },
  });
}
