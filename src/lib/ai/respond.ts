import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import { buildAverageStockDays, getMonthStartIso, sumNumbers } from '@/lib/dashboard/metrics';

interface AiContext {
  tenantId: string;
  monthSales: number;
  monthRevenue: number;
  openDeals: number;
  stockCount: number;
  avgStockDays: number;
  balance: number;
  overdueActivities: number;
}

async function loadAiContext(
  supabase: SupabaseClient<Database>,
  tenantId: string,
): Promise<AiContext> {
  const monthStart = getMonthStartIso();
  const today = new Date().toISOString();

  const [
    { count: openDeals },
    { data: monthOrders },
    { data: stockPassages },
    { data: accounts },
    { count: overdueActivities },
  ] = await Promise.all([
    supabase
      .from('deals')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .eq('status', 'open'),
    supabase
      .from('orders')
      .select('total_value')
      .eq('tenant_id', tenantId)
      .eq('status', 'closed')
      .gte('closed_at', monthStart),
    supabase
      .from('vehicle_passages')
      .select('stock_started_at, status')
      .eq('tenant_id', tenantId)
      .in('status', ['in_stock', 'reserved', 'temporarily_out']),
    supabase.from('financial_accounts').select('current_balance').eq('tenant_id', tenantId),
    supabase
      .from('activities')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .eq('status', 'pending')
      .lt('due_at', today),
  ]);

  const monthRevenue = sumNumbers((monthOrders ?? []).map((order) => order.total_value));
  const stockIn = (stockPassages ?? []).filter((item) => item.status === 'in_stock');

  return {
    tenantId,
    monthSales: monthOrders?.length ?? 0,
    monthRevenue,
    openDeals: openDeals ?? 0,
    stockCount: stockIn.length,
    avgStockDays: buildAverageStockDays(stockPassages ?? []),
    balance: sumNumbers((accounts ?? []).map((account) => account.current_balance)),
    overdueActivities: overdueActivities ?? 0,
  };
}

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export async function respondToAiQuestion(
  supabase: SupabaseClient<Database>,
  tenantId: string,
  question: string,
) {
  const context = await loadAiContext(supabase, tenantId);
  const normalized = question.toLowerCase();

  if (normalized.includes('venda') || normalized.includes('faturamento') || normalized.includes('receita')) {
    return `Este mês: ${context.monthSales} vendas fechadas, receita de ${formatCurrency(context.monthRevenue)}.`;
  }

  if (normalized.includes('estoque') || normalized.includes('veículo') || normalized.includes('veiculo')) {
    return `Estoque atual: ${context.stockCount} veículos disponíveis. Tempo médio em estoque: ${context.avgStockDays.toFixed(0)} dias.`;
  }

  if (normalized.includes('crm') || normalized.includes('ficha') || normalized.includes('lead')) {
    return `CRM: ${context.openDeals} fichas abertas. ${context.overdueActivities} atividades atrasadas.`;
  }

  if (normalized.includes('financeiro') || normalized.includes('saldo') || normalized.includes('caixa')) {
    return `Saldo total das contas: ${formatCurrency(context.balance)}.`;
  }

  if (normalized.includes('resumo') || normalized.includes('dashboard') || normalized.includes('kpi')) {
    return [
      `Vendas do mês: ${context.monthSales} (${formatCurrency(context.monthRevenue)}).`,
      `Estoque: ${context.stockCount} veículos (${context.avgStockDays.toFixed(0)} dias médios).`,
      `CRM: ${context.openDeals} fichas abertas.`,
      `Saldo: ${formatCurrency(context.balance)}.`,
      context.overdueActivities > 0
        ? `Atenção: ${context.overdueActivities} atividades atrasadas.`
        : 'Nenhuma atividade atrasada.',
    ].join(' ');
  }

  const { data: recentDeals } = await supabase
    .from('deals')
    .select('deal_number, status, created_at')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })
    .limit(3);

  const dealsSummary = (recentDeals ?? [])
    .map((deal) => `#${String(deal.deal_number).padStart(6, '0')} (${deal.status})`)
    .join(', ');

  return `Com base nos dados da loja: ${context.monthSales} vendas no mês, ${context.stockCount} veículos em estoque, ${context.openDeals} fichas abertas. Últimas fichas: ${dealsSummary || 'nenhuma'}. Pergunte sobre vendas, estoque, CRM ou financeiro.`;
}

export async function respondToMasterAiQuestion(
  supabase: SupabaseClient<Database>,
  question: string,
) {
  const [
    { data: tenants },
    { count: openTickets },
    { count: activePlans },
    { count: onboardingPending },
  ] = await Promise.all([
    supabase.from('tenants').select('id, name, is_active').eq('is_active', true),
    supabase
      .from('support_tickets')
      .select('*', { count: 'exact', head: true })
      .in('status', ['open', 'in_progress']),
    supabase.from('plans').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase
      .from('tenant_onboarding_checklist')
      .select('*', { count: 'exact', head: true })
      .eq('is_completed', false),
  ]);

  const activeCount = tenants?.length ?? 0;
  const normalized = question.toLowerCase();

  if (normalized.includes('loja') || normalized.includes('tenant')) {
    const names = (tenants ?? []).slice(0, 5).map((tenant) => tenant.name).join(', ');
    return `${activeCount} lojas ativas. Exemplos: ${names || 'nenhuma'}.`;
  }

  if (normalized.includes('suporte') || normalized.includes('ticket')) {
    return `${openTickets ?? 0} chamado(s) de suporte aberto(s) ou em andamento.`;
  }

  if (normalized.includes('plano')) {
    return `${activePlans ?? 0} plano(s) ativo(s) cadastrado(s) no Supabase.`;
  }

  if (normalized.includes('onboarding') || normalized.includes('implanta')) {
    return `${onboardingPending ?? 0} implantação(ões) pendente(s).`;
  }

  return `Painel master: ${activeCount} lojas ativas, ${openTickets ?? 0} tickets abertos, ${activePlans ?? 0} planos. Pergunte sobre lojas, suporte, planos ou implantação.`;
}
