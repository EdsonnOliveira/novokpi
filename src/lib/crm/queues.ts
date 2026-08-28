import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import { writeTimelineEvent } from '@/lib/timeline/events';
import { createTenantAlert } from '@/lib/alerts/engine';

interface AddDemandQueueInput {
  tenantId: string;
  userId: string;
  personId: string;
  dealId?: string;
  interestProfileId?: string;
}

interface AddOfferQueueInput {
  tenantId: string;
  userId: string;
  vehicleId: string;
  interestProfileId?: string;
}

interface MatchResult {
  demandId: string;
  offerId: string;
  dealId: string | null;
  vehicleLabel: string;
}

interface DemandMatchRow {
  id: string;
  deal_id: string | null;
  interest_profiles:
    | {
        brand: string | null;
        model: string | null;
        year_min: number | null;
        year_max: number | null;
        price_min: number | null;
        price_max: number | null;
      }
    | {
        brand: string | null;
        model: string | null;
        year_min: number | null;
        year_max: number | null;
        price_min: number | null;
        price_max: number | null;
      }[]
    | null;
}

interface OfferMatchRow {
  id: string;
  vehicle_id: string | null;
  vehicles:
    | {
        id: string;
        year_model: number | null;
        vehicle_brands: { name: string } | { name: string }[] | null;
        vehicle_models: { name: string } | { name: string }[] | null;
      }
    | {
        id: string;
        year_model: number | null;
        vehicle_brands: { name: string } | { name: string }[] | null;
        vehicle_models: { name: string } | { name: string }[] | null;
      }[]
    | null;
}

function interestMatches(
  demand: {
    brand: string | null;
    model: string | null;
    year_min: number | null;
    year_max: number | null;
    price_min: number | null;
    price_max: number | null;
  },
  vehicle: {
    brand: string | null;
    model: string | null;
    year_model: number | null;
    sale_price: number | null;
  },
) {
  if (demand.brand && vehicle.brand && demand.brand.toLowerCase() !== vehicle.brand.toLowerCase()) {
    return false;
  }
  if (demand.model && vehicle.model && demand.model.toLowerCase() !== vehicle.model.toLowerCase()) {
    return false;
  }
  if (demand.year_min && vehicle.year_model && vehicle.year_model < demand.year_min) {
    return false;
  }
  if (demand.year_max && vehicle.year_model && vehicle.year_model > demand.year_max) {
    return false;
  }
  if (demand.price_min && vehicle.sale_price && vehicle.sale_price < demand.price_min) {
    return false;
  }
  if (demand.price_max && vehicle.sale_price && vehicle.sale_price > demand.price_max) {
    return false;
  }
  return true;
}

export async function addToDemandQueue(
  supabase: SupabaseClient<Database>,
  input: AddDemandQueueInput,
) {
  const { data: entry, error } = await supabase
    .from('demand_queue')
    .insert({
      tenant_id: input.tenantId,
      person_id: input.personId,
      deal_id: input.dealId ?? null,
      interest_profile_id: input.interestProfileId ?? null,
      status: 'waiting',
    })
    .select('id')
    .single();

  if (error || !entry) {
    throw new Error('Não foi possível incluir na fila de demanda.');
  }

  await runQueueMatching(supabase, input.tenantId, input.userId);
  return entry;
}

export async function addToOfferQueue(
  supabase: SupabaseClient<Database>,
  input: AddOfferQueueInput,
) {
  const { data: entry, error } = await supabase
    .from('offer_queue')
    .insert({
      tenant_id: input.tenantId,
      vehicle_id: input.vehicleId,
      interest_profile_id: input.interestProfileId ?? null,
      status: 'waiting',
    })
    .select('id')
    .single();

  if (error || !entry) {
    throw new Error('Não foi possível incluir na fila de oferta.');
  }

  await runQueueMatching(supabase, input.tenantId, input.userId);
  return entry;
}

export async function runQueueMatching(
  supabase: SupabaseClient<Database>,
  tenantId: string,
  userId: string,
): Promise<MatchResult[]> {
  const { data: demandItemsData } = await supabase
    .from('demand_queue')
    .select(`
      id,
      deal_id,
      interest_profiles:interest_profile_id (
        brand,
        model,
        year_min,
        year_max,
        price_min,
        price_max
      )
    `)
    .eq('tenant_id', tenantId)
    .eq('status', 'waiting');

  const { data: offerItemsData } = await supabase
    .from('offer_queue')
    .select(`
      id,
      vehicle_id,
      vehicles:vehicle_id (
        id,
        year_model,
        vehicle_brands:brand_id ( name ),
        vehicle_models:model_id ( name )
      )
    `)
    .eq('tenant_id', tenantId)
    .eq('status', 'waiting');

  const demandItems = (demandItemsData ?? []) as DemandMatchRow[];
  const offerItems = (offerItemsData ?? []) as OfferMatchRow[];

  if (!demandItems.length || !offerItems.length) {
    return [];
  }

  const vehicleIds = offerItems.map((item) => item.vehicle_id).filter(Boolean) as string[];
  const { data: passages } = vehicleIds.length
    ? await supabase
        .from('vehicle_passages')
        .select('vehicle_id, sale_price')
        .eq('tenant_id', tenantId)
        .in('vehicle_id', vehicleIds)
        .in('status', ['in_stock', 'reserved'])
    : { data: [] };

  const priceMap = new Map(
    (passages ?? []).map((passage) => [passage.vehicle_id, passage.sale_price]),
  );

  const matches: MatchResult[] = [];

  for (const demand of demandItems) {
    const interest = Array.isArray(demand.interest_profiles)
      ? demand.interest_profiles[0]
      : demand.interest_profiles;

    if (!interest) continue;

    for (const offer of offerItems) {
      const vehicle = Array.isArray(offer.vehicles) ? offer.vehicles[0] : offer.vehicles;
      if (!vehicle) continue;

      const brand = Array.isArray(vehicle.vehicle_brands)
        ? vehicle.vehicle_brands[0]?.name
        : vehicle.vehicle_brands?.name;
      const model = Array.isArray(vehicle.vehicle_models)
        ? vehicle.vehicle_models[0]?.name
        : vehicle.vehicle_models?.name;

      const vehicleData = {
        brand: brand ?? null,
        model: model ?? null,
        year_model: vehicle.year_model,
        sale_price: priceMap.get(vehicle.id) ?? null,
      };

      if (!interestMatches(interest, vehicleData)) continue;

      await supabase.from('demand_queue').update({ status: 'matched' }).eq('id', demand.id);
      await supabase.from('offer_queue').update({ status: 'matched' }).eq('id', offer.id);

      const vehicleLabel = [brand, model].filter(Boolean).join(' ');

      await createTenantAlert(supabase, {
        tenantId,
        level: 'info',
        title: 'Cruzamento fila demanda/oferta',
        message: `Match encontrado: ${vehicleLabel}`,
        module: 'crm',
        href: demand.deal_id ? `/crm/${demand.deal_id}` : '/crm/demand-queue',
      });

      if (demand.deal_id) {
        await writeTimelineEvent(supabase, {
          tenantId,
          entityType: 'deal',
          entityId: demand.deal_id,
          eventType: 'queue_match',
          title: `Veículo compatível: ${vehicleLabel}`,
          userId,
        });
      }

      matches.push({
        demandId: demand.id,
        offerId: offer.id,
        dealId: demand.deal_id,
        vehicleLabel,
      });

      break;
    }
  }

  return matches;
}
