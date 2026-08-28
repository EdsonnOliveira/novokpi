import Link from 'next/link';
import { PageTitle } from '@/components/dastone/PageTitle';
import { CrmKanbanBoard } from '@/components/crm/CrmKanbanBoard';
import { createClient } from '@/lib/supabase/server';
import { getTenantContext } from '@/lib/settings/tenant-context';
import { canViewAllDeals } from '@/lib/permissions/access';
import { joinOne, type DealListRow } from '@/types/crm';
import { redirect } from 'next/navigation';

export default async function CrmKanbanPage() {
  const supabase = await createClient();
  const context = await getTenantContext(supabase);

  if (!context) {
    redirect('/login');
  }

  const viewAll = await canViewAllDeals(supabase, context.userId, context.tenantId);

  const { data: stages } = await supabase
    .from('deal_stages')
    .select('id, name, slug, sort_order')
    .eq('tenant_id', context.tenantId)
    .eq('is_active', true)
    .order('sort_order');

  let dealsQuery = supabase
    .from('deals')
    .select(`
      id,
      deal_number,
      title,
      stage_id,
      assigned_user_id,
      people:person_id ( full_name )
    `)
    .eq('tenant_id', context.tenantId)
    .neq('status', 'closed_lost')
    .order('created_at', { ascending: false });

  if (!viewAll) {
    dealsQuery = dealsQuery.eq('assigned_user_id', context.userId);
  }

  const { data: dealsData } = await dealsQuery;
  const deals = (dealsData ?? []) as (DealListRow & { stage_id: string })[];

  return (
    <>
      <PageTitle
        title="CRM Kanban"
        subtitle="Pipeline visual de negociações"
        breadcrumbs={[
          { label: 'CRM', href: '/crm' },
          { label: 'Kanban' },
        ]}
        actions={
          <Link href="/crm" className="btn btn-light btn-sm">
            Tabela
          </Link>
        }
      />
      <CrmKanbanBoard
        stages={(stages ?? []).map((stage) => ({ id: stage.id, name: stage.name }))}
        deals={deals.map((deal) => {
          const person = joinOne(deal.people);
          return {
            id: deal.id,
            dealNumber: deal.deal_number,
            title: deal.title,
            personName: person?.full_name ?? null,
            stageId: deal.stage_id,
          };
        })}
      />
    </>
  );
}
