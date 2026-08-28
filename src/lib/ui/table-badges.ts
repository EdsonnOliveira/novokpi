export type ValueBadgeVariant = 'default' | 'income' | 'expense' | 'balance' | 'neutral' | 'price';

const STATUS_BADGE_MAP: Record<string, string> = {
  active: 'bg-soft-success',
  inactive: 'bg-soft-secondary',
  income: 'bg-soft-success',
  expense: 'bg-soft-danger',
  open: 'bg-soft-primary',
  closed: 'bg-soft-success',
  closed_won: 'bg-soft-success',
  closed_lost: 'bg-soft-danger',
  draft: 'bg-soft-secondary',
  reserved: 'bg-soft-info',
  cancelled: 'bg-soft-danger',
  canceled: 'bg-soft-secondary',
  pending: 'bg-soft-warning',
  scheduled: 'bg-soft-info',
  running: 'bg-soft-info',
  delivered: 'bg-soft-success',
  in_progress: 'bg-soft-info',
  completed: 'bg-soft-success',
  paid: 'bg-soft-success',
  partial: 'bg-soft-warning',
  reversed: 'bg-soft-danger',
  resolved: 'bg-soft-success',
  trialing: 'bg-soft-info',
  past_due: 'bg-soft-danger',
  paused: 'bg-soft-warning',
  in_stock: 'bg-soft-success',
  temporarily_out: 'bg-soft-info',
  sold: 'bg-soft-secondary',
  in_preparation: 'bg-soft-warning',
  waiting: 'bg-soft-warning',
  matched: 'bg-soft-success',
  processing: 'bg-soft-info',
  authorized: 'bg-soft-success',
  rejected: 'bg-soft-danger',
  failed: 'bg-soft-danger',
  idle: 'bg-soft-secondary',
  syncing: 'bg-soft-info',
  success: 'bg-soft-success',
  error: 'bg-soft-danger',
  published: 'bg-soft-success',
  removed: 'bg-soft-secondary',
  approved: 'bg-soft-success',
  rejected_eval: 'bg-soft-danger',
  high: 'bg-soft-danger',
  medium: 'bg-soft-warning',
  low: 'bg-soft-info',
  urgent: 'bg-soft-danger',
  normal: 'bg-soft-secondary',
};

const LABEL_BADGE_MAP: Record<string, string> = {
  ativo: 'bg-soft-success',
  ativa: 'bg-soft-success',
  inativo: 'bg-soft-secondary',
  inativa: 'bg-soft-secondary',
  publicado: 'bg-soft-success',
  rascunho: 'bg-soft-secondary',
  receita: 'bg-soft-success',
  despesa: 'bg-soft-danger',
  aberto: 'bg-soft-warning',
  aberta: 'bg-soft-warning',
  fechado: 'bg-soft-success',
  fechada: 'bg-soft-success',
  ganha: 'bg-soft-success',
  perdida: 'bg-soft-danger',
  pendente: 'bg-soft-warning',
  agendada: 'bg-soft-info',
  pago: 'bg-soft-success',
  parcial: 'bg-soft-warning',
  estornado: 'bg-soft-danger',
  cancelado: 'bg-soft-danger',
  cancelada: 'bg-soft-danger',
  concluida: 'bg-soft-success',
  concluída: 'bg-soft-success',
  em: 'bg-soft-info',
  resolvido: 'bg-soft-success',
  encerrado: 'bg-soft-secondary',
  aguardando: 'bg-soft-warning',
  encontrado: 'bg-soft-success',
  em_estoque: 'bg-soft-success',
  trial: 'bg-soft-info',
  inadimplente: 'bg-soft-danger',
  pausada: 'bg-soft-warning',
  alta: 'bg-soft-danger',
  media: 'bg-soft-warning',
  média: 'bg-soft-warning',
  baixa: 'bg-soft-info',
  urgente: 'bg-soft-danger',
};

export function getActiveStatusBadgeClass(isActive: boolean): string {
  return isActive ? 'bg-soft-success' : 'bg-soft-secondary';
}

export function getPublishedStatusBadgeClass(isPublished: boolean): string {
  return isPublished ? 'bg-soft-success' : 'bg-soft-secondary';
}

export function getStatusBadgeClass(status: string): string {
  const normalizedKey = status.toLowerCase().trim().replace(/\s+/g, '_');
  if (STATUS_BADGE_MAP[normalizedKey]) return STATUS_BADGE_MAP[normalizedKey];

  const normalizedLabel = status
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

  if (LABEL_BADGE_MAP[normalizedLabel]) return LABEL_BADGE_MAP[normalizedLabel];

  if (normalizedLabel.startsWith('em ')) return 'bg-soft-info';

  return 'bg-soft-secondary';
}

export function getValueBadgeClass(value: number, variant: ValueBadgeVariant = 'default'): string {
  if (variant === 'income') return 'bg-soft-success';
  if (variant === 'expense') return value !== 0 ? 'bg-soft-danger' : 'bg-soft-secondary';
  if (variant === 'balance') {
    if (value > 0) return 'bg-soft-success';
    if (value < 0) return 'bg-soft-danger';
    return 'bg-soft-secondary';
  }
  if (variant === 'price' || variant === 'neutral') {
    if (value === 0) return 'bg-soft-secondary';
    return 'bg-soft-primary';
  }
  if (value > 0) return 'bg-soft-success';
  if (value < 0) return 'bg-soft-danger';
  return 'bg-soft-secondary';
}

export function formatDealStatus(status: string): string {
  const map: Record<string, string> = {
    open: 'Aberta',
    closed_won: 'Ganha',
    closed_lost: 'Perdida',
    reserved: 'Reservada',
  };
  return map[status] ?? status;
}

export function formatPassageStatus(status: string): string {
  const map: Record<string, string> = {
    in_stock: 'Em estoque',
    reserved: 'Reservado',
    temporarily_out: 'Saída temporária',
    sold: 'Vendido',
    in_preparation: 'Em preparação',
  };
  return map[status] ?? status;
}

export function formatTicketPriority(priority: string): string {
  const map: Record<string, string> = {
    low: 'Baixa',
    medium: 'Média',
    high: 'Alta',
    urgent: 'Urgente',
    normal: 'Normal',
  };
  return map[priority] ?? priority;
}
