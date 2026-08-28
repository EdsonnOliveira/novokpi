import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import { addToOfferQueue } from '@/lib/crm/queues';
import { writeAuditLog } from '@/lib/timeline/audit';
import { writeTimelineEvent } from '@/lib/timeline/events';

interface CreateQuickVehicleInput {
  tenantId: string;
  userId: string;
  brandId: string;
  modelId: string;
  versionId: string;
  yearManufacture: number;
  yearModel: number;
  color: string;
  km: number;
  plate: string;
  modalityId: string;
  acquisitionCost?: number;
  salePrice?: number;
  fipeValue?: number;
  ownerPersonId?: string;
  dealId?: string;
  consignmentNetValue?: number;
  consignmentPercent?: number;
  chassis?: string;
  renavam?: string;
}

interface HistoryMatch {
  vehicleId: string;
  passageCount: number;
  lastPassageAt: string | null;
}

export async function findVehicleHistoryByPlate(
  supabase: SupabaseClient<Database>,
  tenantId: string,
  plate: string,
): Promise<HistoryMatch | null> {
  const normalizedPlate = plate.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  if (!normalizedPlate) return null;

  const { data: vehicles } = await supabase
    .from('vehicles')
    .select('id')
    .eq('tenant_id', tenantId)
    .ilike('plate', normalizedPlate);

  if (!vehicles?.length) return null;

  const vehicleId = vehicles[0].id;

  const { data: passages } = await supabase
    .from('vehicle_passages')
    .select('id, created_at')
    .eq('vehicle_id', vehicleId)
    .order('created_at', { ascending: false });

  return {
    vehicleId,
    passageCount: passages?.length ?? 0,
    lastPassageAt: passages?.[0]?.created_at ?? null,
  };
}

export async function createQuickVehicleEntry(
  supabase: SupabaseClient<Database>,
  input: CreateQuickVehicleInput,
) {
  const normalizedPlate = input.plate.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  const history = await findVehicleHistoryByPlate(supabase, input.tenantId, normalizedPlate);

  let vehicleId = history?.vehicleId;

  if (!vehicleId) {
    const { data: vehicle, error: vehicleError } = await supabase
      .from('vehicles')
      .insert({
        tenant_id: input.tenantId,
        plate: normalizedPlate,
        chassis: input.chassis ?? null,
        renavam: input.renavam ?? null,
        brand_id: input.brandId,
        model_id: input.modelId,
        version_id: input.versionId,
        year_manufacture: input.yearManufacture,
        year_model: input.yearModel,
        color: input.color,
      })
      .select('id')
      .single();

    if (vehicleError || !vehicle) {
      throw new Error('Não foi possível cadastrar o veículo.');
    }

    vehicleId = vehicle.id;
  } else {
    await supabase
      .from('vehicles')
      .update({
        brand_id: input.brandId,
        model_id: input.modelId,
        version_id: input.versionId,
        year_manufacture: input.yearManufacture,
        year_model: input.yearModel,
        color: input.color,
        chassis: input.chassis ?? null,
        renavam: input.renavam ?? null,
      })
      .eq('id', vehicleId);
  }

  const { data: passageNumber, error: numberError } = await supabase.rpc(
    'next_passage_number',
    { p_vehicle_id: vehicleId },
  );

  if (numberError || passageNumber === null) {
    throw new Error('Não foi possível gerar número da passagem.');
  }

  const acquisitionCost = input.acquisitionCost ?? 0;

  const { data: passage, error: passageError } = await supabase
    .from('vehicle_passages')
    .insert({
      tenant_id: input.tenantId,
      vehicle_id: vehicleId,
      passage_number: passageNumber,
      modality_id: input.modalityId,
      acquisition_cost: acquisitionCost,
      cost: acquisitionCost,
      sale_price: input.salePrice ?? null,
      fipe_value: input.fipeValue ?? null,
      km: input.km,
      owner_person_id: input.ownerPersonId ?? null,
      capturer_user_id: input.userId,
      deal_id: input.dealId ?? null,
      consignment_net_value: input.consignmentNetValue ?? null,
      consignment_percent: input.consignmentPercent ?? null,
      has_history_alert: (history?.passageCount ?? 0) > 0,
    })
    .select('id, passage_number')
    .single();

  if (passageError || !passage) {
    throw new Error('Não foi possível registrar a entrada no estoque.');
  }

  if (input.salePrice) {
    await supabase.from('vehicle_prices').insert({
      tenant_id: input.tenantId,
      passage_id: passage.id,
      price_type: 'sale',
      value: input.salePrice,
      changed_by: input.userId,
    });
  }

  if (input.fipeValue) {
    await supabase.from('vehicle_prices').insert({
      tenant_id: input.tenantId,
      passage_id: passage.id,
      price_type: 'fipe',
      value: input.fipeValue,
      changed_by: input.userId,
    });
  }

  await writeTimelineEvent(supabase, {
    tenantId: input.tenantId,
    entityType: 'vehicle',
    entityId: vehicleId,
    eventType: 'stock_entry',
    title: `Entrada no estoque — passagem ${passageNumber}`,
    description: normalizedPlate,
    userId: input.userId,
    metadata: {
      passage_id: passage.id,
      has_history_alert: (history?.passageCount ?? 0) > 0,
    },
  });

  await writeAuditLog(supabase, {
    tenantId: input.tenantId,
    userId: input.userId,
    action: 'create',
    module: 'inventory',
    entityType: 'vehicle_passage',
    entityId: passage.id,
    newData: {
      vehicle_id: vehicleId,
      plate: normalizedPlate,
      passage_number: passageNumber,
    },
  });

  await addToOfferQueue(supabase, {
    tenantId: input.tenantId,
    userId: input.userId,
    vehicleId,
  });

  return {
    vehicleId,
    passage,
    hasHistoryAlert: (history?.passageCount ?? 0) > 0,
    historyPassageCount: history?.passageCount ?? 0,
  };
}

interface CreateEvaluationInput {
  tenantId: string;
  userId: string;
  brandId: string;
  modelId: string;
  versionId: string;
  plate?: string;
  yearManufacture?: number;
  yearModel?: number;
  color?: string;
  km?: number;
  fipeValue?: number;
  offeredValue?: number;
  notes?: string;
  personId?: string;
  dealId?: string;
}

export async function createEvaluation(
  supabase: SupabaseClient<Database>,
  input: CreateEvaluationInput,
) {
  const { data: evaluation, error } = await supabase
    .from('evaluations')
    .insert({
      tenant_id: input.tenantId,
      brand_id: input.brandId,
      model_id: input.modelId,
      version_id: input.versionId,
      plate: input.plate ?? null,
      year_manufacture: input.yearManufacture ?? null,
      year_model: input.yearModel ?? null,
      color: input.color ?? null,
      km: input.km ?? null,
      fipe_value: input.fipeValue ?? null,
      offered_value: input.offeredValue ?? null,
      notes: input.notes ?? null,
      person_id: input.personId ?? null,
      deal_id: input.dealId ?? null,
      evaluated_by: input.userId,
    })
    .select('id')
    .single();

  if (error || !evaluation) {
    throw new Error('Não foi possível registrar a avaliação.');
  }

  await writeAuditLog(supabase, {
    tenantId: input.tenantId,
    userId: input.userId,
    action: 'create',
    module: 'inventory',
    entityType: 'evaluation',
    entityId: evaluation.id,
    newData: { plate: input.plate },
  });

  return evaluation;
}

interface CreatePreparationInput {
  tenantId: string;
  userId: string;
  passageId: string;
  title: string;
  description?: string;
  isInternal?: boolean;
  supplierName?: string;
  supplierPhone?: string;
  budgetAmount?: number;
  authorizedAmount?: number;
  actualCost: number;
  paymentStatus?: string;
}

export async function createPreparationOrder(
  supabase: SupabaseClient<Database>,
  input: CreatePreparationInput,
) {
  const { data: order, error } = await supabase
    .from('preparation_orders')
    .insert({
      tenant_id: input.tenantId,
      passage_id: input.passageId,
      title: input.title,
      description: input.description ?? null,
      is_internal: input.isInternal ?? true,
      supplier_name: input.supplierName ?? null,
      supplier_phone: input.supplierPhone ?? null,
      budget_amount: input.budgetAmount ?? null,
      authorized_amount: input.authorizedAmount ?? null,
      actual_cost: input.actualCost,
      payment_status: input.paymentStatus ?? null,
      status: 'done',
      created_by: input.userId,
    })
    .select('id')
    .single();

  if (error || !order) {
    throw new Error('Não foi possível registrar a preparação.');
  }

  const { data: passage } = await supabase
    .from('vehicle_passages')
    .select('vehicle_id')
    .eq('id', input.passageId)
    .maybeSingle();

  if (passage?.vehicle_id) {
    await writeTimelineEvent(supabase, {
      tenantId: input.tenantId,
      entityType: 'vehicle',
      entityId: passage.vehicle_id,
      eventType: 'preparation',
      title: input.title,
      description: formatCurrency(input.actualCost),
      userId: input.userId,
      metadata: { preparation_id: order.id, passage_id: input.passageId },
    });
  }

  return order;
}

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
