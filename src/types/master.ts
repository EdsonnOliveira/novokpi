export interface TenantListRow {
  id: string;
  name: string;
  slug: string;
  document: string | null;
  phone: string | null;
  email: string | null;
  is_active: boolean;
  created_at: string;
  subscriptions: SubscriptionJoin | SubscriptionJoin[] | null;
}

export interface SubscriptionJoin {
  id: string;
  status: string;
  started_at: string;
  plans: PlanJoin | PlanJoin[] | null;
}

export interface PlanJoin {
  id: string;
  name: string;
  price_monthly: number;
}

export interface PlanListRow {
  id: string;
  name: string;
  slug: string;
  price_monthly: number;
  is_active: boolean;
  created_at: string;
}

export interface BillingRow {
  id: string;
  status: string;
  started_at: string;
  ends_at: string | null;
  created_at: string;
  tenants: { id: string; name: string } | { id: string; name: string }[] | null;
  plans: { id: string; name: string; price_monthly: number } | { id: string; name: string; price_monthly: number }[] | null;
}

export interface MasterCrmRow {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  is_active: boolean;
  created_at: string;
  subscriptions: SubscriptionJoin | SubscriptionJoin[] | null;
  tenant_onboarding_checklist: OnboardingJoin[] | null;
}

export interface OnboardingJoin {
  id: string;
  step_label: string;
  is_completed: boolean;
}

export interface MasterTicketRow {
  id: string;
  subject: string;
  description: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  tenants: { name: string } | { name: string }[] | null;
}

export interface MasterAnnouncementRow {
  id: string;
  title: string;
  body: string;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
}

export interface TaxonomyBrandRow {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string;
  vehicle_models: TaxonomyModelRow[] | null;
}

export interface TaxonomyModelRow {
  id: string;
  name: string;
  is_active: boolean;
}

export interface AiConversationRow {
  id: string;
  title: string | null;
  created_at: string;
}

export interface AiMessageRow {
  id: string;
  role: string;
  content: string;
  created_at: string;
}

export function joinOne<T>(value: T | T[] | null): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

export function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function formatTicketStatus(status: string) {
  const labels: Record<string, string> = {
    open: 'Aberto',
    in_progress: 'Em andamento',
    resolved: 'Resolvido',
    closed: 'Fechado',
  };
  return labels[status] ?? status;
}

export function formatSubscriptionStatus(status: string) {
  const labels: Record<string, string> = {
    active: 'Ativa',
    trialing: 'Trial',
    past_due: 'Inadimplente',
    canceled: 'Cancelada',
    paused: 'Pausada',
  };
  return labels[status] ?? status;
}
