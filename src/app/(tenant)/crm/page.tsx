import Link from 'next/link';
import { PageTitle } from '@/components/dastone/PageTitle';
import { Card } from '@/components/dastone/Card';
import { createClient } from '@/lib/supabase/server';
import { getTenantContext } from '@/lib/settings/tenant-context';
import { canViewAllDeals } from '@/lib/permissions/access';
import { joinOne, type DealListRow } from '@/types/crm';
import { redirect } from 'next/navigation';

function formatDealNumber(value: number) {
  return `#${String(value).padStart(6, '0')}`;
}

export default async function CrmPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    no_action?: string;
    channel?: string;
    seller?: string;
  }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const context = await getTenantContext(supabase);

  if (!context) {
    redirect('/login');
  }

  const viewAll = await canViewAllDeals(supabase, context.userId, context.tenantId);

  let query = supabase
    .from('deals')
    .select(`
      id,
      deal_number,
      title,
      status,
      is_duplicate_alert,
      next_action_at,
      created_at,
      assigned_user_id,
      channel_id,
      people:person_id ( full_name, phone, email ),
      deal_stages:stage_id ( name ),
      channels:channel_id ( name )
    `)
    .eq('tenant_id', context.tenantId)
    .order('created_at', { ascending: false })
    .limit(200);

  if (params.status) {
    query = query.eq('status', params.status);
  }

  if (params.no_action === '1') {
    query = query.is('next_action_at', null);
  }

  if (params.channel) {
    query = query.eq('channel_id', params.channel);
  }

  if (params.seller) {
    query = query.eq('assigned_user_id', params.seller);
  }

  if (!viewAll) {
    query = query.eq('assigned_user_id', context.userId);
  }

  const { data: dealsData } = await query;
  const deals = (dealsData ?? []) as DealListRow[];

  const filterLabel = [
    params.status ? `status=${params.status}` : null,
    params.no_action === '1' ? 'sem próxima ação' : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <>
      <PageTitle
        title="Leads / CRM"
        subtitle={filterLabel || 'Tabela de fichas e negociações'}
        breadcrumbs={[{ label: 'CRM' }]}
        actions={
          <div className="d-flex gap-2">
            <Link href="/crm/kanban" className="btn btn-light btn-sm">
              Kanban
            </Link>
            <Link href="/crm/new" className="btn btn-primary btn-sm">
              Nova Ficha
            </Link>
          </div>
        }
      />
      <Card>
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead>
              <tr>
                <th>Ficha</th>
                <th>Cliente</th>
                <th>Contato</th>
                <th>Etapa</th>
                <th>Canal</th>
                <th>Próxima ação</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {deals.length ? (
                deals.map((deal) => {
                  const person = joinOne(deal.people);
                  const stage = joinOne(deal.deal_stages);
                  const channel = joinOne(deal.channels);

                  return (
                    <tr key={deal.id}>
                      <td>
                        <Link href={`/crm/${deal.id}`}>
                          {formatDealNumber(deal.deal_number)}
                        </Link>
                        {deal.is_duplicate_alert ? (
                          <span className="badge bg-soft-warning ms-1">Duplicidade</span>
                        ) : null}
                      </td>
                      <td>{person?.full_name ?? '—'}</td>
                      <td>{person?.phone ?? person?.email ?? '—'}</td>
                      <td>{stage?.name ?? '—'}</td>
                      <td>{channel?.name ?? '—'}</td>
                      <td>
                        {deal.next_action_at
                          ? new Date(deal.next_action_at).toLocaleString('pt-BR')
                          : '—'}
                      </td>
                      <td>{deal.status}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="text-center text-muted py-4">
                    Nenhuma ficha encontrada.{' '}
                    <Link href="/crm/new">Abrir Nova Ficha</Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
