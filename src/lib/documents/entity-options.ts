import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

export interface DocumentEntityOption {
  id: string;
  label: string;
}

export async function loadDocumentEntityOptions(
  supabase: SupabaseClient<Database>,
  tenantId: string,
) {
  const [{ data: dealsData }, { data: ordersData }] = await Promise.all([
    supabase
      .from('deals')
      .select('id, deal_number, people:person_id ( full_name )')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
      .limit(100),
    supabase
      .from('orders')
      .select('id, order_number, deals:deal_id ( people:person_id ( full_name ) )')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
      .limit(100),
  ]);

  const deals = ((dealsData ?? []) as Array<{
    id: string;
    deal_number: number;
    people: { full_name: string | null } | { full_name: string | null }[] | null;
  }>).map((deal) => {
    const person = Array.isArray(deal.people) ? deal.people[0] : deal.people;
    return {
      id: deal.id,
      label: `#${String(deal.deal_number).padStart(6, '0')} — ${person?.full_name ?? 'Sem cliente'}`,
    };
  });

  const orders = ((ordersData ?? []) as Array<{
    id: string;
    order_number: number;
    deals:
      | { people: { full_name: string | null } | { full_name: string | null }[] | null }
      | { people: { full_name: string | null } | { full_name: string | null }[] | null }[]
      | null;
  }>).map((order) => {
    const deal = Array.isArray(order.deals) ? order.deals[0] : order.deals;
    const person = deal?.people
      ? Array.isArray(deal.people)
        ? deal.people[0]
        : deal.people
      : null;
    return {
      id: order.id,
      label: `#${String(order.order_number).padStart(6, '0')} — ${person?.full_name ?? 'Sem cliente'}`,
    };
  });

  return { deals, orders };
}
