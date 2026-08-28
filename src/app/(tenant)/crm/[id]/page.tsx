import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { PageTitle } from '@/components/dastone/PageTitle';
import { Card } from '@/components/dastone/Card';
import { DealActionsPanel } from '@/components/crm/DealActionsPanel';
import { createClient } from '@/lib/supabase/server';
import { getTenantContext } from '@/lib/settings/tenant-context';
import { canAccessDeal } from '@/lib/permissions/access';
import { joinOne } from '@/types/crm';

function formatDealNumber(value: number) {
  return `#${String(value).padStart(6, '0')}`;
}

export default async function DealDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const context = await getTenantContext(supabase);

  if (!context) {
    redirect('/login');
  }

  const allowed = await canAccessDeal(supabase, context.userId, context.tenantId, id);
  if (!allowed) {
    notFound();
  }

  const { data: dealData } = await supabase
    .from('deals')
    .select(`
      id,
      deal_number,
      title,
      status,
      person_id,
      is_duplicate_alert,
      duplicate_of_deal_id,
      next_action_at,
      next_action_note,
      created_at,
      people:person_id ( id, full_name, phone, email, social_handle ),
      deal_stages:stage_id ( name ),
      channels:channel_id ( name )
    `)
    .eq('id', id)
    .eq('tenant_id', context.tenantId)
    .maybeSingle();

  const deal = dealData as {
    id: string;
    deal_number: number;
    title: string | null;
    status: string;
    person_id: string;
    is_duplicate_alert: boolean;
    duplicate_of_deal_id: string | null;
    next_action_at: string | null;
    next_action_note: string | null;
    created_at: string;
    people: {
      id: string;
      full_name: string;
      phone: string | null;
      email: string | null;
      social_handle: string | null;
    } | {
      id: string;
      full_name: string;
      phone: string | null;
      email: string | null;
      social_handle: string | null;
    }[] | null;
    deal_stages: { name: string } | { name: string }[] | null;
    channels: { name: string } | { name: string }[] | null;
  } | null;

  if (!deal) {
    notFound();
  }

  const person = joinOne(deal.people);
  const stage = joinOne(deal.deal_stages);
  const channel = joinOne(deal.channels);

  const [{ data: timeline }, { data: lostReasons }, { data: interestData }] = await Promise.all([
    supabase
      .from('timeline_events')
      .select('id, title, description, occurred_at, event_type')
      .eq('entity_type', 'deal')
      .eq('entity_id', id)
      .order('occurred_at', { ascending: false }),
    supabase
      .from('lost_reasons')
      .select('id, name')
      .eq('tenant_id', context.tenantId)
      .eq('is_active', true)
      .order('name'),
    supabase
      .from('interest_profiles')
      .select('id, brand, model, version, year_min, year_max, price_min, price_max, notes')
      .eq('deal_id', id)
      .eq('is_active', true)
      .maybeSingle(),
  ]);

  const interest = interestData as {
    id: string;
    brand: string | null;
    model: string | null;
    version: string | null;
    year_min: number | null;
    year_max: number | null;
    price_min: number | null;
    price_max: number | null;
    notes: string | null;
  } | null;

  return (
    <>
      <PageTitle
        title={`Ficha ${formatDealNumber(deal.deal_number)}`}
        subtitle={deal.title ?? person?.full_name ?? 'Negociação'}
        breadcrumbs={[
          { label: 'CRM', href: '/crm' },
          { label: formatDealNumber(deal.deal_number) },
        ]}
        actions={
          person ? (
            <Link href={`/crm/people/${person.id}`} className="btn btn-light btn-sm">
              Ver cliente
            </Link>
          ) : null
        }
      />
      <div className="row">
        <div className="col-lg-4">
          <Card title="Cliente">
            <p className="mb-1">
              <strong>{person?.full_name ?? '—'}</strong>
            </p>
            <p className="text-muted mb-1">{person?.phone ?? '—'}</p>
            <p className="text-muted mb-1">{person?.email ?? '—'}</p>
            <p className="text-muted mb-0">{person?.social_handle ?? '—'}</p>
            {deal.is_duplicate_alert ? (
              <div className="alert alert-warning py-2 mt-3 mb-0">
                Duplicidade detectada
                {deal.duplicate_of_deal_id ? (
                  <>
                    {' '}
                    —{' '}
                    <Link href={`/crm/${deal.duplicate_of_deal_id}`}>Ver ficha original</Link>
                  </>
                ) : null}
              </div>
            ) : null}
          </Card>
          <Card title="Negociação" className="mt-3">
            <p className="mb-1">Etapa: {stage?.name ?? '—'}</p>
            <p className="mb-1">Canal: {channel?.name ?? '—'}</p>
            <p className="mb-1">Status: {deal.status}</p>
            <p className="mb-0">
              Próxima ação:{' '}
              {deal.next_action_at
                ? new Date(deal.next_action_at).toLocaleString('pt-BR')
                : '—'}
            </p>
          </Card>
        </div>
        <div className="col-lg-8">
          <Card title="Ações">
            <DealActionsPanel
              dealId={deal.id}
              personId={deal.person_id}
              status={deal.status}
              lostReasons={lostReasons ?? []}
              interestProfileId={interest?.id ?? null}
              initialInterest={
                interest
                  ? {
                      brand: interest.brand ?? '',
                      model: interest.model ?? '',
                      version: interest.version ?? '',
                      yearMin: interest.year_min ? String(interest.year_min) : '',
                      yearMax: interest.year_max ? String(interest.year_max) : '',
                      priceMin: interest.price_min ? String(interest.price_min) : '',
                      priceMax: interest.price_max ? String(interest.price_max) : '',
                      notes: interest.notes ?? '',
                    }
                  : undefined
              }
            />
          </Card>
          <Card title="Timeline" className="mt-3">
            {timeline?.length ? (
              <ul className="list-unstyled mb-0">
                {timeline.map((event) => (
                  <li key={event.id} className="border-bottom pb-3 mb-3">
                    <div className="d-flex justify-content-between">
                      <strong>{event.title}</strong>
                      <span className="text-muted small">
                        {new Date(event.occurred_at).toLocaleString('pt-BR')}
                      </span>
                    </div>
                    {event.description ? (
                      <p className="text-muted mb-0 mt-1">{event.description}</p>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted mb-0">Sem eventos ainda.</p>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
