import Link from 'next/link';
import { TableEmptyRow } from '@/components/dastone/EmptyState';
import { PageTitle } from '@/components/dastone/PageTitle';
import { Card } from '@/components/dastone/Card';
import { createClient } from '@/lib/supabase/server';
import {
  formatCurrency,
  joinOne,
  type EvaluationListRow,
} from '@/types/inventory';
import { StatusBadge, ValueBadge } from '@/components/dastone/TableBadge';

export default async function EvaluationPage() {
  const supabase = await createClient();

  const { data: evaluationsData } = await supabase
    .from('evaluations')
    .select(`
      id,
      plate,
      year_model,
      km,
      color,
      fipe_value,
      offered_value,
      status,
      created_at,
      vehicle_brands:brand_id ( name ),
      vehicle_models:model_id ( name ),
      vehicle_versions:version_id ( name ),
      people:person_id ( full_name )
    `)
    .order('created_at', { ascending: false })
    .limit(100);

  const evaluations = (evaluationsData ?? []) as EvaluationListRow[];

  return (
    <>
      <PageTitle
        title="Avaliação / Trade-in"
        subtitle="Avaliações de usados e veículos de entrada"
        breadcrumbs={[
          { label: 'CRM', href: '/crm' },
          { label: 'Avaliação' },
        ]}
        actions={
          <Link href="/crm/evaluation/new" className="btn btn-primary btn-sm">
            <i className="iconoir-plus me-1" aria-hidden="true" />
            Nova avaliação
          </Link>
        }
      />
      <Card>
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead>
              <tr>
                <th>Data</th>
                <th>Placa</th>
                <th>Veículo</th>
                <th>Km</th>
                <th>FIPE</th>
                <th>Oferta</th>
                <th>Cliente</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {evaluations.length ? (
                evaluations.map((evaluation) => {
                  const brand = joinOne(evaluation.vehicle_brands);
                  const model = joinOne(evaluation.vehicle_models);
                  const version = joinOne(evaluation.vehicle_versions);
                  const person = joinOne(evaluation.people);
                  const label = [brand?.name, model?.name, version?.name]
                    .filter(Boolean)
                    .join(' ');

                  return (
                    <tr key={evaluation.id}>
                      <td>{new Date(evaluation.created_at).toLocaleDateString('pt-BR')}</td>
                      <td>{evaluation.plate ?? '—'}</td>
                      <td>
                        {label || '—'}
                        {evaluation.year_model ? (
                          <span className="text-muted ms-1">{evaluation.year_model}</span>
                        ) : null}
                        {evaluation.color ? (
                          <span className="text-muted ms-1">· {evaluation.color}</span>
                        ) : null}
                      </td>
                      <td>{evaluation.km?.toLocaleString('pt-BR') ?? '—'}</td>
                      <td>
                        <ValueBadge
                          value={evaluation.fipe_value}
                          formatted={formatCurrency(evaluation.fipe_value)}
                          variant="price"
                        />
                      </td>
                      <td>
                        <ValueBadge
                          value={evaluation.offered_value}
                          formatted={formatCurrency(evaluation.offered_value)}
                          variant="price"
                        />
                      </td>
                      <td>{person?.full_name ?? '—'}</td>
                      <td>
                        <StatusBadge status={evaluation.status} label={evaluation.status} />
                      </td>
                    </tr>
                  );
                })
              ) : (
                <TableEmptyRow
                  colSpan={8}
                  title="Nenhuma avaliação."
                  icon="iconoir-search"
                  actionLabel="Registrar avaliação"
                  actionHref="/crm/evaluation/new"
                />
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
