import { startOfDay } from '@/lib/agenda/activities';

export interface KanbanStageColumn {
  id: string;
  name: string;
  slug: string;
  borderClass: string;
}

export interface KanbanDealCard {
  id: string;
  dealNumber: number;
  title: string | null;
  personName: string | null;
  stageId: string;
  channelName: string | null;
  assignedUserName: string | null;
  nextActionAt: string | null;
  nextActionNote: string | null;
  isDuplicateAlert: boolean;
  pendingActivities: number;
  completedActivities: number;
  totalActivities: number;
  timelineCount: number;
}

export function getStageBorderClass(slug: string): string {
  const map: Record<string, string> = {
    new_lead: 'border-pink',
    contact: 'border-info',
    qualified: 'border-primary',
    evaluation: 'border-warning',
    negotiation: 'border-secondary',
    proposal: 'border-success',
    won: 'border-success',
    lost: 'border-danger',
  };
  return map[slug] ?? 'border-primary';
}

export function getDealPriorityBadge(
  deal: Pick<KanbanDealCard, 'nextActionAt' | 'isDuplicateAlert'>,
): { label: string; className: string } {
  if (deal.isDuplicateAlert) {
    return { label: 'Duplicidade', className: 'text-danger bg-danger-subtle' };
  }
  if (!deal.nextActionAt) {
    return { label: 'Sem ação', className: 'text-secondary bg-secondary-subtle' };
  }

  const due = startOfDay(new Date(deal.nextActionAt));
  const today = startOfDay(new Date());

  if (due < today) {
    return { label: 'Atrasada', className: 'text-danger bg-danger-subtle' };
  }
  if (due.getTime() === today.getTime()) {
    return { label: 'Hoje', className: 'text-warning bg-warning-subtle' };
  }
  return { label: 'Agendada', className: 'text-info bg-info-subtle' };
}

export function getUserInitials(name: string | null): string {
  if (!name) {
    return '?';
  }
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function getActivityProgressPercent(completed: number, total: number): number {
  if (!total) {
    return 0;
  }
  return Math.round((completed / total) * 100);
}

export function formatDealNumber(value: number) {
  return `#${String(value).padStart(6, '0')}`;
}
