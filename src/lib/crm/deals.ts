import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import { writeAuditLog } from '@/lib/timeline/audit';
import { writeTimelineEvent } from '@/lib/timeline/events';
import { canAccessDeal, requirePermission } from '@/lib/permissions/access';

interface CreateDealInput {
  tenantId: string;
  userId: string;
  fullName: string;
  phone?: string;
  email?: string;
  socialHandle?: string;
  channelId?: string;
  title?: string;
  nextActionAt?: string;
  nextActionNote?: string;
}

interface DuplicateMatch {
  dealId: string;
  dealNumber: number;
  assignedUserId: string | null;
}

interface CloseLostDealInput {
  tenantId: string;
  userId: string;
  dealId: string;
  lostReasonId: string;
  justification: string;
}

interface UpdateDealStageInput {
  tenantId: string;
  userId: string;
  dealId: string;
  stageId: string;
}

interface SetNextActionInput {
  tenantId: string;
  userId: string;
  dealId: string;
  nextActionAt: string;
  nextActionNote: string;
}

interface UpsertInterestInput {
  tenantId: string;
  userId: string;
  dealId: string;
  personId: string;
  brand?: string;
  model?: string;
  version?: string;
  yearMin?: number;
  yearMax?: number;
  priceMin?: number;
  priceMax?: number;
  notes?: string;
}

interface AddNegotiationNoteInput {
  tenantId: string;
  userId: string;
  dealId: string;
  note: string;
}

export async function findDuplicateDeals(
  supabase: SupabaseClient<Database>,
  tenantId: string,
  phone?: string,
  email?: string,
): Promise<DuplicateMatch[]> {
  if (!phone && !email) {
    return [];
  }

  let query = supabase
    .from('people')
    .select('id')
    .eq('tenant_id', tenantId);

  if (phone && email) {
    query = query.or(`phone.eq.${phone},email.eq.${email}`);
  } else if (phone) {
    query = query.eq('phone', phone);
  } else if (email) {
    query = query.eq('email', email);
  }

  const { data: people } = await query;

  if (!people?.length) {
    return [];
  }

  const personIds = people.map((person) => person.id);

  const { data: deals } = await supabase
    .from('deals')
    .select('id, deal_number, assigned_user_id')
    .eq('tenant_id', tenantId)
    .in('person_id', personIds)
    .neq('status', 'closed_lost')
    .order('created_at', { ascending: false });

  return (
    deals?.map((deal) => ({
      dealId: deal.id,
      dealNumber: deal.deal_number,
      assignedUserId: deal.assigned_user_id,
    })) ?? []
  );
}

async function assertDealAccess(
  supabase: SupabaseClient<Database>,
  tenantId: string,
  userId: string,
  dealId: string,
) {
  const allowed = await canAccessDeal(supabase, userId, tenantId, dealId);
  if (!allowed) {
    throw new Error('Você não tem acesso a esta ficha.');
  }
}

export async function createQuickDeal(
  supabase: SupabaseClient<Database>,
  input: CreateDealInput,
) {
  if (!input.phone && !input.email && !input.socialHandle) {
    throw new Error('Informe telefone, e-mail ou rede social.');
  }

  if (!input.nextActionAt || !input.nextActionNote?.trim()) {
    throw new Error('Próxima ação é obrigatória.');
  }

  const duplicates = await findDuplicateDeals(
    supabase,
    input.tenantId,
    input.phone,
    input.email,
  );

  const { data: person, error: personError } = await supabase
    .from('people')
    .insert({
      tenant_id: input.tenantId,
      full_name: input.fullName,
      phone: input.phone ?? null,
      email: input.email ?? null,
      social_handle: input.socialHandle ?? null,
      assigned_user_id: input.userId,
    })
    .select('id')
    .single();

  if (personError || !person) {
    throw new Error('Não foi possível cadastrar a pessoa.');
  }

  const { data: stage } = await supabase
    .from('deal_stages')
    .select('id')
    .eq('tenant_id', input.tenantId)
    .eq('slug', 'new_lead')
    .maybeSingle();

  if (!stage) {
    throw new Error('Etapa inicial não configurada.');
  }

  const { data: dealNumberData, error: numberError } = await supabase.rpc(
    'next_deal_number',
    { p_tenant_id: input.tenantId },
  );

  if (numberError || dealNumberData === null) {
    throw new Error('Não foi possível gerar número da ficha.');
  }

  const { data: deal, error: dealError } = await supabase
    .from('deals')
    .insert({
      tenant_id: input.tenantId,
      deal_number: dealNumberData,
      title: input.title ?? input.fullName,
      person_id: person.id,
      stage_id: stage.id,
      channel_id: input.channelId ?? null,
      assigned_user_id: input.userId,
      is_duplicate_alert: duplicates.length > 0,
      duplicate_of_deal_id: duplicates[0]?.dealId ?? null,
      next_action_at: input.nextActionAt,
      next_action_note: input.nextActionNote,
    })
    .select('id, deal_number')
    .single();

  if (dealError || !deal) {
    throw new Error('Não foi possível criar a ficha.');
  }

  await supabase.from('deal_assignments').insert({
    tenant_id: input.tenantId,
    deal_id: deal.id,
    user_id: input.userId,
    assigned_by: input.userId,
  });

  await supabase.from('activities').insert({
    tenant_id: input.tenantId,
    deal_id: deal.id,
    person_id: person.id,
    assigned_user_id: input.userId,
    title: input.nextActionNote,
    due_at: input.nextActionAt,
    created_by: input.userId,
  });

  await writeTimelineEvent(supabase, {
    tenantId: input.tenantId,
    entityType: 'deal',
    entityId: deal.id,
    eventType: 'deal_created',
    title: `Ficha #${String(deal.deal_number).padStart(6, '0')} aberta`,
    description: input.fullName,
    userId: input.userId,
  });

  await writeTimelineEvent(supabase, {
    tenantId: input.tenantId,
    entityType: 'person',
    entityId: person.id,
    eventType: 'deal_created',
    title: `Nova ficha #${String(deal.deal_number).padStart(6, '0')}`,
    userId: input.userId,
  });

  await writeAuditLog(supabase, {
    tenantId: input.tenantId,
    userId: input.userId,
    action: 'create',
    module: 'crm',
    entityType: 'deal',
    entityId: deal.id,
    newData: {
      deal_number: deal.deal_number,
      person_id: person.id,
      duplicate: duplicates.length > 0,
    },
  });

  return { deal, person, duplicates };
}

export async function closeLostDeal(
  supabase: SupabaseClient<Database>,
  input: CloseLostDealInput,
) {
  await requirePermission(supabase, input.userId, input.tenantId, 'crm', 'edit');
  await assertDealAccess(supabase, input.tenantId, input.userId, input.dealId);

  if (!input.justification.trim()) {
    throw new Error('Justificativa é obrigatória.');
  }

  const { data: deal, error: fetchError } = await supabase
    .from('deals')
    .select('id, deal_number, status')
    .eq('id', input.dealId)
    .eq('tenant_id', input.tenantId)
    .maybeSingle();

  if (fetchError || !deal) {
    throw new Error('Ficha não encontrada.');
  }

  if (deal.status === 'closed_lost' || deal.status === 'closed_won') {
    throw new Error('Ficha já encerrada.');
  }

  const { error: updateError } = await supabase
    .from('deals')
    .update({
      status: 'closed_lost',
      lost_reason_id: input.lostReasonId,
      closed_at: new Date().toISOString(),
      metadata: { lost_justification: input.justification },
    })
    .eq('id', input.dealId);

  if (updateError) {
    throw new Error('Não foi possível marcar como perdida.');
  }

  await writeTimelineEvent(supabase, {
    tenantId: input.tenantId,
    entityType: 'deal',
    entityId: input.dealId,
    eventType: 'deal_lost',
    title: `Venda perdida — Ficha #${String(deal.deal_number).padStart(6, '0')}`,
    description: input.justification,
    userId: input.userId,
  });

  await writeAuditLog(supabase, {
    tenantId: input.tenantId,
    userId: input.userId,
    action: 'update',
    module: 'crm',
    entityType: 'deal',
    entityId: input.dealId,
    newData: {
      status: 'closed_lost',
      lost_reason_id: input.lostReasonId,
    },
  });

  return deal;
}

export async function updateDealStage(
  supabase: SupabaseClient<Database>,
  input: UpdateDealStageInput,
) {
  await requirePermission(supabase, input.userId, input.tenantId, 'crm', 'edit');
  await assertDealAccess(supabase, input.tenantId, input.userId, input.dealId);

  const { data: stage } = await supabase
    .from('deal_stages')
    .select('id, name')
    .eq('id', input.stageId)
    .eq('tenant_id', input.tenantId)
    .maybeSingle();

  if (!stage) {
    throw new Error('Etapa inválida.');
  }

  const { error } = await supabase
    .from('deals')
    .update({ stage_id: input.stageId })
    .eq('id', input.dealId)
    .eq('tenant_id', input.tenantId);

  if (error) {
    throw new Error('Não foi possível mover a ficha.');
  }

  await writeTimelineEvent(supabase, {
    tenantId: input.tenantId,
    entityType: 'deal',
    entityId: input.dealId,
    eventType: 'stage_changed',
    title: `Etapa alterada para ${stage.name}`,
    userId: input.userId,
  });

  return stage;
}

export async function setDealNextAction(
  supabase: SupabaseClient<Database>,
  input: SetNextActionInput,
) {
  await assertDealAccess(supabase, input.tenantId, input.userId, input.dealId);

  if (!input.nextActionAt || !input.nextActionNote.trim()) {
    throw new Error('Próxima ação é obrigatória.');
  }

  const { data: deal } = await supabase
    .from('deals')
    .select('person_id')
    .eq('id', input.dealId)
    .maybeSingle();

  const { error } = await supabase
    .from('deals')
    .update({
      next_action_at: input.nextActionAt,
      next_action_note: input.nextActionNote,
    })
    .eq('id', input.dealId);

  if (error) {
    throw new Error('Não foi possível salvar próxima ação.');
  }

  await supabase.from('activities').insert({
    tenant_id: input.tenantId,
    deal_id: input.dealId,
    person_id: deal?.person_id ?? null,
    assigned_user_id: input.userId,
    title: input.nextActionNote,
    due_at: input.nextActionAt,
    created_by: input.userId,
  });

  await writeTimelineEvent(supabase, {
    tenantId: input.tenantId,
    entityType: 'deal',
    entityId: input.dealId,
    eventType: 'next_action_set',
    title: 'Próxima ação definida',
    description: input.nextActionNote,
    userId: input.userId,
  });
}

export async function upsertDealInterest(
  supabase: SupabaseClient<Database>,
  input: UpsertInterestInput,
) {
  await assertDealAccess(supabase, input.tenantId, input.userId, input.dealId);

  const { data: existingData } = await supabase
    .from('interest_profiles')
    .select('id')
    .eq('deal_id', input.dealId)
    .eq('is_active', true)
    .maybeSingle();

  const existing = existingData as { id: string } | null;

  const payload = {
    tenant_id: input.tenantId,
    person_id: input.personId,
    deal_id: input.dealId,
    brand: input.brand ?? null,
    model: input.model ?? null,
    version: input.version ?? null,
    year_min: input.yearMin ?? null,
    year_max: input.yearMax ?? null,
    price_min: input.priceMin ?? null,
    price_max: input.priceMax ?? null,
    notes: input.notes ?? null,
    is_active: true,
  };

  if (existing) {
    const { error } = await supabase
      .from('interest_profiles')
      .update(payload as never)
      .eq('id', existing.id);

    if (error) {
      throw new Error('Não foi possível atualizar interesse.');
    }

    return existing;
  }

  const { data: created, error } = await supabase
    .from('interest_profiles')
    .insert(payload as never)
    .select('id')
    .single();

  if (error || !created) {
    throw new Error('Não foi possível salvar interesse.');
  }

  return created;
}

export async function addNegotiationNote(
  supabase: SupabaseClient<Database>,
  input: AddNegotiationNoteInput,
) {
  await assertDealAccess(supabase, input.tenantId, input.userId, input.dealId);

  if (!input.note.trim()) {
    throw new Error('Informe a anotação.');
  }

  await writeTimelineEvent(supabase, {
    tenantId: input.tenantId,
    entityType: 'deal',
    entityId: input.dealId,
    eventType: 'negotiation_note',
    title: 'Anotação de negociação',
    description: input.note,
    userId: input.userId,
  });
}
