import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

export type ActivityDisplayStatus = 'overdue' | 'today' | 'upcoming' | 'done' | 'cancelled';

export interface AgendaActivity {
  id: string;
  title: string;
  description: string | null;
  due_at: string;
  status: string;
  contact_method: string | null;
  deal_id: string | null;
  person_id: string | null;
  assigned_user_id: string | null;
  deal_number: number | null;
  person_name: string | null;
}

export interface AgendaDealOption {
  id: string;
  deal_number: number;
  person_name: string | null;
  title: string | null;
}

export function startOfDay(date: Date) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

export function getActivityDisplayStatus(dueAt: string, status: string): ActivityDisplayStatus {
  if (status === 'done') return 'done';
  if (status === 'cancelled') return 'cancelled';

  const due = startOfDay(new Date(dueAt));
  const today = startOfDay(new Date());

  if (due < today) return 'overdue';
  if (due.getTime() === today.getTime()) return 'today';
  return 'upcoming';
}

export function formatActivityScheduleLabel(dueAt: string) {
  const due = new Date(dueAt);
  const today = startOfDay(new Date());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dueDay = startOfDay(due);
  const timeLabel = due.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  if (dueDay.getTime() === today.getTime()) {
    return `Hoje ${timeLabel}`;
  }

  if (dueDay.getTime() === tomorrow.getTime()) {
    return `Amanhã ${timeLabel}`;
  }

  return `${due.toLocaleDateString('pt-BR')} ${timeLabel}`;
}

export function getActivityBadgeClass(displayStatus: ActivityDisplayStatus) {
  if (displayStatus === 'overdue') return 'text-bg-danger';
  if (displayStatus === 'today') return 'text-bg-primary';
  return 'text-bg-secondary';
}

export function getActivityBadgeLabel(displayStatus: ActivityDisplayStatus) {
  if (displayStatus === 'overdue') return 'Atrasado';
  if (displayStatus === 'today') return 'Hoje';
  return 'Próximo';
}

export function getActivityEventClassName(displayStatus: ActivityDisplayStatus) {
  if (displayStatus === 'overdue') return 'bg-soft-danger text-danger border-0';
  if (displayStatus === 'today') return 'bg-soft-primary text-primary border-0';
  return 'bg-soft-info text-info border-0';
}

export function getActivityInitials(name: string | null) {
  if (!name) return 'AC';
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function formatDealNumber(value: number) {
  return `#${String(value).padStart(6, '0')}`;
}

function mapAgendaActivityRow(row: {
  id: string;
  title: string;
  description: string | null;
  due_at: string;
  status: string;
  contact_method: string | null;
  deal_id: string | null;
  person_id: string | null;
  assigned_user_id: string | null;
  deals: { deal_number: number } | { deal_number: number }[] | null;
  people: { full_name: string } | { full_name: string }[] | null;
}): AgendaActivity {
  const deal = Array.isArray(row.deals) ? row.deals[0] : row.deals;
  const person = Array.isArray(row.people) ? row.people[0] : row.people;

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    due_at: row.due_at,
    status: row.status,
    contact_method: row.contact_method,
    deal_id: row.deal_id,
    person_id: row.person_id,
    assigned_user_id: row.assigned_user_id,
    deal_number: deal?.deal_number ?? null,
    person_name: person?.full_name ?? null,
  };
}

export async function syncOverdueActivities(supabase: SupabaseClient<Database>) {
  const todayIso = startOfDay(new Date()).toISOString();

  await supabase
    .from('activities')
    .update({ status: 'overdue' })
    .eq('status', 'pending')
    .lt('due_at', todayIso);
}

export async function fetchAgendaActivities(supabase: SupabaseClient<Database>) {
  const { data } = await supabase
    .from('activities')
    .select(`
      id,
      title,
      description,
      due_at,
      status,
      contact_method,
      deal_id,
      person_id,
      assigned_user_id,
      deals:deal_id ( deal_number ),
      people:person_id ( full_name )
    `)
    .neq('status', 'done')
    .neq('status', 'cancelled')
    .order('due_at', { ascending: true })
    .limit(300);

  return ((data ?? []) as Parameters<typeof mapAgendaActivityRow>[0][]).map(mapAgendaActivityRow);
}

export async function fetchAgendaDealOptions(supabase: SupabaseClient<Database>) {
  const { data } = await supabase
    .from('deals')
    .select(`
      id,
      deal_number,
      title,
      people:person_id ( full_name )
    `)
    .eq('status', 'open')
    .order('created_at', { ascending: false })
    .limit(100);

  return (data ?? []).map((deal) => {
    const row = deal as {
      id: string;
      deal_number: number;
      title: string | null;
      people: { full_name: string } | { full_name: string }[] | null;
    };
    const person = Array.isArray(row.people) ? row.people[0] : row.people;
    return {
      id: row.id,
      deal_number: row.deal_number,
      person_name: person?.full_name ?? null,
      title: row.title,
    } satisfies AgendaDealOption;
  });
}

export function sortSidebarActivities(activities: AgendaActivity[]) {
  const priority: Record<ActivityDisplayStatus, number> = {
    overdue: 0,
    today: 1,
    upcoming: 2,
    done: 3,
    cancelled: 4,
  };

  return [...activities].sort((left, right) => {
    const leftStatus = getActivityDisplayStatus(left.due_at, left.status);
    const rightStatus = getActivityDisplayStatus(right.due_at, right.status);
    const statusDiff = priority[leftStatus] - priority[rightStatus];
    if (statusDiff !== 0) return statusDiff;
    return new Date(left.due_at).getTime() - new Date(right.due_at).getTime();
  });
}

export function mapActivityToCalendarEvent(activity: AgendaActivity) {
  const displayStatus = getActivityDisplayStatus(activity.due_at, activity.status);
  const clientLabel = activity.person_name ? `${activity.title} — ${activity.person_name}` : activity.title;

  return {
    id: activity.id,
    title: clientLabel,
    start: activity.due_at,
    allDay: false,
    classNames: [getActivityEventClassName(displayStatus)],
    extendedProps: {
      activity,
      displayStatus,
    },
  };
}
