import Link from 'next/link';
import { PageTitle } from '@/components/dastone/PageTitle';
import { Card } from '@/components/dastone/Card';
import { createClient } from '@/lib/supabase/server';
import { TableEmptyRow } from '@/components/dastone/EmptyState';
import { StatusBadge } from '@/components/dastone/TableBadge';
import { formatTicketPriority } from '@/lib/ui/table-badges';

export default async function MarketingOpportunitiesPage() {
  const supabase = await createClient();

  const { data: opportunities } = await supabase
    .from('opportunities')
    .select('id, title, description, status, priority, due_at, created_at, person_id, assigned_user_id')
    .order('created_at', { ascending: false })
    .limit(200);

  const personIds = [...new Set((opportunities ?? []).map((item) => item.person_id).filter(Boolean))];
  const assigneeIds = [...new Set((opportunities ?? []).map((item) => item.assigned_user_id).filter(Boolean))];

  const [{ data: people }, { data: profiles }] = await Promise.all([
    personIds.length ? supabase.from('people').select('id, full_name').in('id', personIds as string[]) : Promise.resolve({ data: [] }),
    assigneeIds.length ? supabase.from('profiles').select('id, full_name').in('id', assigneeIds as string[]) : Promise.resolve({ data: [] }),
  ]);

  const peopleMap = new Map((people ?? []).map((person) => [person.id, person.full_name]));
  const profileMap = new Map((profiles ?? []).map((profile) => [profile.id, profile.full_name]));

  return (
    <>
      <PageTitle
        title="Central de Oportunidades"
        subtitle="Demandas e ofertas cruzadas"
        breadcrumbs={[
          { label: 'Marketing', href: '/marketing' },
          { label: 'Oportunidades' },
        ]}
      />
      <Card>
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead>
              <tr>
                <th>Título</th>
                <th>Cliente</th>
                <th>Responsável</th>
                <th>Prioridade</th>
                <th>Status</th>
                <th>Prazo</th>
              </tr>
            </thead>
            <tbody>
              {opportunities?.length ? (
                opportunities.map((item) => (
                  <tr key={item.id}>
                    <td>{item.title}</td>
                    <td>{item.person_id ? peopleMap.get(item.person_id) ?? '—' : '—'}</td>
                    <td>{item.assigned_user_id ? profileMap.get(item.assigned_user_id) ?? '—' : '—'}</td>
                    <td>
                      <StatusBadge
                        status={item.priority}
                        label={formatTicketPriority(item.priority)}
                      />
                    </td>
                    <td>
                      <StatusBadge status={item.status} label={item.status} />
                    </td>
                    <td>{item.due_at ? new Date(item.due_at).toLocaleDateString('pt-BR') : '—'}</td>
                  </tr>
                ))
              ) : (
                <TableEmptyRow
                  colSpan={6}
                  title="Nenhuma oportunidade registrada."
                  icon="iconoir-spark"
                />
              )}
            </tbody>
          </table>
        </div>
      </Card>
      <div className="mt-3 d-flex gap-2">
        <Link href="/crm/demand-queue" className="btn btn-light btn-sm">
          <i className="iconoir-community me-1" aria-hidden="true" />
          Fila demanda
        </Link>
        <Link href="/crm/offer-queue" className="btn btn-light btn-sm">
          <i className="iconoir-community me-1" aria-hidden="true" />
          Fila oferta
        </Link>
      </div>
    </>
  );
}
