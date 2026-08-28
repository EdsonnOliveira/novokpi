import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PageTitle } from '@/components/dastone/PageTitle';
import { Card } from '@/components/dastone/Card';
import { createClient } from '@/lib/supabase/server';

function formatDealNumber(value: number) {
  return `#${String(value).padStart(6, '0')}`;
}

export default async function PersonDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: person } = await supabase
    .from('people')
    .select('id, full_name, phone, email, social_handle, document, notes, created_at')
    .eq('id', id)
    .maybeSingle();

  if (!person) {
    notFound();
  }

  const { data: deals } = await supabase
    .from('deals')
    .select('id, deal_number, status, created_at')
    .eq('person_id', id)
    .order('created_at', { ascending: false });

  const { data: timeline } = await supabase
    .from('timeline_events')
    .select('id, title, description, occurred_at')
    .eq('entity_type', 'person')
    .eq('entity_id', id)
    .order('occurred_at', { ascending: false });

  return (
    <>
      <PageTitle
        title={person.full_name}
        subtitle="Timeline consolidada do cliente"
        breadcrumbs={[
          { label: 'CRM', href: '/crm' },
          { label: 'Clientes', href: '/crm/people' },
          { label: person.full_name },
        ]}
        actions={
          <Link href="/crm/new" className="btn btn-primary btn-sm">
            <i className="iconoir-plus me-1" aria-hidden="true" />
            Nova Ficha
          </Link>
        }
      />
      <div className="row">
        <div className="col-lg-4">
          <Card title="Dados">
            <p className="mb-1">{person.phone ?? '—'}</p>
            <p className="mb-1">{person.email ?? '—'}</p>
            <p className="mb-1">{person.social_handle ?? '—'}</p>
            <p className="mb-0">{person.document ?? '—'}</p>
          </Card>
          <Card title="Fichas" className="mt-3">
            {deals?.length ? (
              <ul className="list-unstyled mb-0">
                {deals.map((deal) => (
                  <li key={deal.id} className="mb-2">
                    <Link href={`/crm/${deal.id}`}>
                      {formatDealNumber(deal.deal_number)}
                    </Link>
                    <span className="text-muted small ms-2">{deal.status}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted mb-0">Sem fichas.</p>
            )}
          </Card>
        </div>
        <div className="col-lg-8">
          <Card title="Timeline">
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
              <p className="text-muted mb-0">Sem eventos.</p>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
