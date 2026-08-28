import Link from 'next/link';
import { redirect } from 'next/navigation';
import { PageTitle } from '@/components/dastone/PageTitle';
import { CrmKanbanBoard } from '@/components/crm/CrmKanbanBoard';
import { getStageBorderClass, type KanbanDealCard } from '@/lib/crm/kanban';
import { canViewAllDeals } from '@/lib/permissions/access';
import { getTenantContext } from '@/lib/settings/tenant-context';
import { createClient } from '@/lib/supabase/server';
import { joinOne, type DealListRow } from '@/types/crm';

interface ActivityCountRow {
  deal_id: string | null;
  status: string;
}

interface TimelineCountRow {
  entity_id: string;
}

export default async function CrmKanbanPage() {
  const supabase = await createClient();
  const context = await getTenantContext(supabase);

  if (!context) {
    redirect('/login');
  }

  const viewAll = await canViewAllDeals(supabase, context.userId, context.tenantId);

  const { data: stages } = await supabase
    .from('deal_stages')
    .select('id, name, slug, sort_order, is_lost, is_won')
    .eq('tenant_id', context.tenantId)
    .eq('is_active', true)
    .eq('is_lost', false)
    .order('sort_order');

  let dealsQuery = supabase
    .from('deals')
    .select(`
      id,
      deal_number,
      title,
      stage_id,
      status,
      assigned_user_id,
      next_action_at,
      next_action_note,
      is_duplicate_alert,
      people:person_id ( full_name ),
      channels:channel_id ( name ),
      profiles:assigned_user_id ( full_name )
    `)
    .eq('tenant_id', context.tenantId)
    .neq('status', 'closed_lost')
    .order('created_at', { ascending: false });

  if (!viewAll) {
    dealsQuery = dealsQuery.eq('assigned_user_id', context.userId);
  }

  const { data: dealsData } = await dealsQuery;
  const deals = (dealsData ?? []) as (DealListRow & {
    stage_id: string;
    next_action_at: string | null;
    next_action_note: string | null;
    is_duplicate_alert: boolean;
    profiles: { full_name: string | null } | { full_name: string | null }[] | null;
  })[];

  const dealIds = deals.map((deal) => deal.id);

  const activityCounts = new Map<
    string,
    { pending: number; completed: number; total: number }
  >();
  const timelineCounts = new Map<string, number>();

  if (dealIds.length) {
    const [{ data: activities }, { data: timelineEvents }] = await Promise.all([
      supabase.from('activities').select('deal_id, status').in('deal_id', dealIds),
      supabase
        .from('timeline_events')
        .select('entity_id')
        .eq('tenant_id', context.tenantId)
        .eq('entity_type', 'deal')
        .in('entity_id', dealIds),
    ]);

    (activities as ActivityCountRow[] | null)?.forEach((activity) => {
      if (!activity.deal_id) {
        return;
      }
      const current = activityCounts.get(activity.deal_id) ?? {
        pending: 0,
        completed: 0,
        total: 0,
      };
      current.total += 1;
      if (activity.status === 'done') {
        current.completed += 1;
      } else if (activity.status !== 'cancelled') {
        current.pending += 1;
      }
      activityCounts.set(activity.deal_id, current);
    });

    (timelineEvents as TimelineCountRow[] | null)?.forEach((event) => {
      timelineCounts.set(event.entity_id, (timelineCounts.get(event.entity_id) ?? 0) + 1);
    });
  }

  const kanbanDeals: KanbanDealCard[] = deals.map((deal) => {
    const person = joinOne(deal.people);
    const channel = joinOne(deal.channels);
    const assignee = joinOne(deal.profiles);
    const counts = activityCounts.get(deal.id) ?? { pending: 0, completed: 0, total: 0 };

    return {
      id: deal.id,
      dealNumber: deal.deal_number,
      title: deal.title,
      personName: person?.full_name ?? null,
      stageId: deal.stage_id,
      channelName: channel?.name ?? null,
      assignedUserName: assignee?.full_name ?? null,
      nextActionAt: deal.next_action_at,
      nextActionNote: deal.next_action_note,
      isDuplicateAlert: deal.is_duplicate_alert,
      pendingActivities: counts.pending,
      completedActivities: counts.completed,
      totalActivities: counts.total,
      timelineCount: timelineCounts.get(deal.id) ?? 0,
    };
  });

  const visibleStageIds = new Set((stages ?? []).map((stage) => stage.id));
  const filteredDeals = kanbanDeals.filter((deal) => visibleStageIds.has(deal.stageId));

  return (
    <>
      <PageTitle
        title="Kanban"
        subtitle="Pipeline visual de negociações"
        breadcrumbs={[
          { label: 'CRM', href: '/crm' },
          { label: 'Kanban' },
        ]}
        actions={
          <>
            <Link href="/crm/new" className="btn btn-primary btn-sm">
              Nova ficha
            </Link>
            <Link href="/crm" className="btn btn-light btn-sm">
              Tabela
            </Link>
          </>
        }
      />
      <CrmKanbanBoard
        stages={(stages ?? []).map((stage) => ({
          id: stage.id,
          name: stage.name,
          slug: stage.slug,
          borderClass: getStageBorderClass(stage.slug),
        }))}
        deals={filteredDeals}
      />
    </>
  );
}
