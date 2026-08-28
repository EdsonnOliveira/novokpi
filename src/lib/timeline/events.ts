import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, Json, TimelineEntityType } from '@/types/database';

interface TimelineEventInput {
  tenantId: string;
  entityType: TimelineEntityType;
  entityId: string;
  eventType: string;
  title: string;
  description?: string | null;
  metadata?: Json;
  userId?: string | null;
  occurredAt?: string;
}

export async function writeTimelineEvent(
  supabase: SupabaseClient<Database>,
  input: TimelineEventInput,
) {
  return supabase.from('timeline_events').insert({
    tenant_id: input.tenantId,
    entity_type: input.entityType,
    entity_id: input.entityId,
    event_type: input.eventType,
    title: input.title,
    description: input.description ?? null,
    metadata: input.metadata ?? {},
    user_id: input.userId ?? null,
    occurred_at: input.occurredAt,
  });
}
