import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

interface EntityMergeData {
  [key: string]: string;
}

function replacePlaceholders(html: string, data: EntityMergeData) {
  return html.replace(/\{\{(\w+)\}\}/g, (_, key: string) => data[key] ?? '');
}

async function loadDealData(
  supabase: SupabaseClient<Database>,
  tenantId: string,
  dealId: string,
): Promise<EntityMergeData> {
  const { data: dealData } = await supabase
    .from('deals')
    .select(`
      deal_number,
      status,
      title,
      people:person_id ( full_name, document, phone, email )
    `)
    .eq('id', dealId)
    .eq('tenant_id', tenantId)
    .maybeSingle();

  const deal = dealData as {
    deal_number: number;
    status: string;
    title: string | null;
    people:
      | { full_name: string | null; document: string | null; phone: string | null; email: string | null }
      | { full_name: string | null; document: string | null; phone: string | null; email: string | null }[]
      | null;
  } | null;

  if (!deal) {
    throw new Error('Ficha não encontrada.');
  }

  const person = Array.isArray(deal.people) ? deal.people[0] : deal.people;

  return {
    deal_number: String(deal.deal_number ?? '').padStart(6, '0'),
    deal_status: deal.status ?? '',
    deal_title: deal.title ?? '',
    client_name: person?.full_name ?? '',
    client_document: person?.document ?? '',
    client_phone: person?.phone ?? '',
    client_email: person?.email ?? '',
  };
}

async function loadOrderData(
  supabase: SupabaseClient<Database>,
  tenantId: string,
  orderId: string,
): Promise<EntityMergeData> {
  const { data: orderData } = await supabase
    .from('orders')
    .select(`
      order_number,
      total_value,
      closed_at,
      deals:deal_id (
        deal_number,
        people:person_id ( full_name, document, phone )
      ),
      vehicle_passages:vehicle_passage_id (
        passage_number,
        sale_price,
        km,
        vehicles:vehicle_id ( plate, color, year_model )
      )
    `)
    .eq('id', orderId)
    .eq('tenant_id', tenantId)
    .maybeSingle();

  const order = orderData as {
    order_number: number;
    total_value: number | null;
    closed_at: string | null;
    deals:
      | {
          deal_number: number;
          people:
            | { full_name: string | null; document: string | null; phone: string | null }
            | { full_name: string | null; document: string | null; phone: string | null }[]
            | null;
        }
      | {
          deal_number: number;
          people:
            | { full_name: string | null; document: string | null; phone: string | null }
            | { full_name: string | null; document: string | null; phone: string | null }[]
            | null;
        }[]
      | null;
    vehicle_passages:
      | {
          passage_number: number | null;
          sale_price: number | null;
          km: number | null;
          vehicles:
            | { plate: string | null; color: string | null; year_model: number | null }
            | { plate: string | null; color: string | null; year_model: number | null }[]
            | null;
        }
      | {
          passage_number: number | null;
          sale_price: number | null;
          km: number | null;
          vehicles:
            | { plate: string | null; color: string | null; year_model: number | null }
            | { plate: string | null; color: string | null; year_model: number | null }[]
            | null;
        }[]
      | null;
  } | null;

  if (!order) {
    throw new Error('Pedido não encontrado.');
  }

  const deal = Array.isArray(order.deals) ? order.deals[0] : order.deals;
  const person = deal?.people
    ? Array.isArray(deal.people)
      ? deal.people[0]
      : deal.people
    : null;
  const passage = Array.isArray(order.vehicle_passages)
    ? order.vehicle_passages[0]
    : order.vehicle_passages;
  const vehicle = passage?.vehicles
    ? Array.isArray(passage.vehicles)
      ? passage.vehicles[0]
      : passage.vehicles
    : null;

  return {
    order_number: String(order.order_number ?? '').padStart(6, '0'),
    order_total: order.total_value ? String(order.total_value) : '',
    order_closed_at: order.closed_at ? new Date(order.closed_at).toLocaleDateString('pt-BR') : '',
    deal_number: deal?.deal_number ? String(deal.deal_number).padStart(6, '0') : '',
    client_name: person?.full_name ?? '',
    client_document: person?.document ?? '',
    client_phone: person?.phone ?? '',
    passage_number: passage?.passage_number ? String(passage.passage_number) : '',
    vehicle_plate: vehicle?.plate ?? '',
    vehicle_color: vehicle?.color ?? '',
    vehicle_year: vehicle?.year_model ? String(vehicle.year_model) : '',
    vehicle_km: passage?.km ? String(passage.km) : '',
    vehicle_price: passage?.sale_price ? String(passage.sale_price) : '',
  };
}

export async function mergeDocumentTemplate(
  supabase: SupabaseClient<Database>,
  input: {
    tenantId: string;
    contentHtml: string;
    entityType?: string;
    entityId?: string;
  },
) {
  if (!input.entityType || !input.entityId) {
    return input.contentHtml;
  }

  let entityData: EntityMergeData = {};

  if (input.entityType === 'deal') {
    entityData = await loadDealData(supabase, input.tenantId, input.entityId);
  } else if (input.entityType === 'order') {
    entityData = await loadOrderData(supabase, input.tenantId, input.entityId);
  }

  return replacePlaceholders(input.contentHtml, entityData);
}
