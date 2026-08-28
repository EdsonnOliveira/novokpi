import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import { getStockAgeDays } from '@/types/inventory';

import type { AlertLevel } from '@/types/platform';

interface CreateAlertInput {
  tenantId: string;
  userId?: string;
  level: AlertLevel;
  title: string;
  message?: string;
  module?: string;
  entityType?: string;
  entityId?: string;
  href?: string;
}

export async function createTenantAlert(
  supabase: SupabaseClient<Database>,
  input: CreateAlertInput,
) {
  const { data: existing } = await supabase
    .from('tenant_alerts')
    .select('id')
    .eq('tenant_id', input.tenantId)
    .eq('title', input.title)
    .eq('is_dismissed', false)
    .maybeSingle();

  if (existing) {
    return existing;
  }

  const { data: alert, error } = await supabase
    .from('tenant_alerts')
    .insert({
      tenant_id: input.tenantId,
      user_id: input.userId ?? null,
      level: input.level,
      title: input.title,
      message: input.message ?? null,
      module: input.module ?? null,
      entity_type: input.entityType ?? null,
      entity_id: input.entityId ?? null,
      href: input.href ?? null,
    })
    .select('id')
    .single();

  if (error || !alert) {
    throw new Error('Não foi possível criar alerta.');
  }

  return alert;
}

export async function dismissAlert(
  supabase: SupabaseClient<Database>,
  alertId: string,
) {
  const { error } = await supabase
    .from('tenant_alerts')
    .update({ is_dismissed: true, is_read: true })
    .eq('id', alertId);

  if (error) {
    throw new Error('Não foi possível dispensar alerta.');
  }
}

export async function markAlertRead(
  supabase: SupabaseClient<Database>,
  alertId: string,
) {
  const { error } = await supabase
    .from('tenant_alerts')
    .update({ is_read: true })
    .eq('id', alertId);

  if (error) {
    throw new Error('Não foi possível marcar alerta como lido.');
  }
}

export async function runAlertEngine(
  supabase: SupabaseClient<Database>,
  tenantId: string,
) {
  const { data: rules } = await supabase
    .from('alert_rules')
    .select('id, name, module, days_threshold, level, is_active')
    .eq('tenant_id', tenantId)
    .eq('is_active', true);

  if (!rules?.length) return 0;

  let created = 0;

  for (const rule of rules) {
    if (rule.module === 'inventory') {
      const { data: passages } = await supabase
        .from('vehicle_passages')
        .select('id, stock_started_at, status')
        .eq('tenant_id', tenantId)
        .eq('status', 'in_stock');

      for (const passage of passages ?? []) {
        const days = getStockAgeDays(passage.stock_started_at);
        if (days < rule.days_threshold) continue;

        await createTenantAlert(supabase, {
          tenantId,
          level: rule.level as AlertLevel,
          title: `${rule.name}: veículo parado ${days} dias`,
          message: `Passagem acima do limite de ${rule.days_threshold} dias.`,
          module: 'inventory',
          entityType: 'vehicle_passage',
          entityId: passage.id,
          href: `/inventory/${passage.id}`,
        });
        created += 1;
      }
    }

    if (rule.module === 'crm') {
      const thresholdDate = new Date();
      thresholdDate.setDate(thresholdDate.getDate() - rule.days_threshold);

      const { data: deals } = await supabase
        .from('deals')
        .select('id, deal_number, next_action_at')
        .eq('tenant_id', tenantId)
        .eq('status', 'open')
        .or(`next_action_at.is.null,next_action_at.lt.${thresholdDate.toISOString()}`);

      for (const deal of deals ?? []) {
        await createTenantAlert(supabase, {
          tenantId,
          level: rule.level as AlertLevel,
          title: `${rule.name}: ficha #${String(deal.deal_number).padStart(6, '0')}`,
          message: deal.next_action_at
            ? 'Próxima ação atrasada.'
            : 'Ficha sem próxima ação.',
          module: 'crm',
          entityType: 'deal',
          entityId: deal.id,
          href: `/crm/${deal.id}`,
        });
        created += 1;
      }
    }

    if (rule.module === 'finance') {
      const today = new Date().toISOString().slice(0, 10);

      const { data: transactions } = await supabase
        .from('financial_transactions')
        .select('id, description, due_date, amount')
        .eq('tenant_id', tenantId)
        .eq('status', 'pending')
        .lt('due_date', today);

      for (const transaction of transactions ?? []) {
        await createTenantAlert(supabase, {
          tenantId,
          level: rule.level as AlertLevel,
          title: `${rule.name}: ${transaction.description ?? 'Lançamento vencido'}`,
          message: `Vencimento ${transaction.due_date ?? '—'}.`,
          module: 'finance',
          entityType: 'financial_transaction',
          entityId: transaction.id,
          href: '/finance/transactions',
        });
        created += 1;
      }
    }
  }

  return created;
}
