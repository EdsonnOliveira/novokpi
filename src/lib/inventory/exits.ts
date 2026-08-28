import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

interface CreateTemporaryExitInput {
  tenantId: string;
  userId: string;
  passageId: string;
  reason: string;
  expectedReturnAt?: string;
}

export async function createTemporaryExit(
  supabase: SupabaseClient<Database>,
  input: CreateTemporaryExitInput,
) {
  const { error: insertError } = await supabase.from('stock_exits').insert({
    tenant_id: input.tenantId,
    passage_id: input.passageId,
    reason: input.reason,
    expected_return_at: input.expectedReturnAt ?? null,
    created_by: input.userId,
  });

  if (insertError) {
    throw new Error(insertError.message);
  }

  const { error: updateError } = await supabase
    .from('vehicle_passages')
    .update({ status: 'temporarily_out' })
    .eq('id', input.passageId)
    .eq('tenant_id', input.tenantId);

  if (updateError) {
    throw new Error('Não foi possível atualizar passagem.');
  }
}
