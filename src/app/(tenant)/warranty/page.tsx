import { PageTitle } from '@/components/dastone/PageTitle';
import { Card } from '@/components/dastone/Card';
import { KpiGrid } from '@/components/dastone/KpiGrid';
import { WarrantyCaseForm } from '@/components/warranty/WarrantyCaseForm';
import { WarrantyCasesTable } from '@/components/warranty/WarrantyCasesTable';
import { createClient } from '@/lib/supabase/server';
import { getTenantContext } from '@/lib/settings/tenant-context';
import {
  joinOne,
  type WarrantyCaseListRow,
  type WarrantyCaseTableRow,
} from '@/types/warranty';
import { redirect } from 'next/navigation';

function mapWarrantyCaseRows(cases: WarrantyCaseListRow[]): WarrantyCaseTableRow[] {
  return cases.map((warrantyCase) => {
    const person = joinOne(warrantyCase.people);
    const passage = joinOne(warrantyCase.vehicle_passages);
    const vehicle = joinOne(passage?.vehicles ?? null);
    const assignee = joinOne(warrantyCase.profiles);

    return {
      id: warrantyCase.id,
      title: warrantyCase.title,
      clientName: person?.full_name ?? '—',
      plate: vehicle?.plate ?? '—',
      passageHref: passage?.id ? `/inventory/${passage.id}` : '',
      status: warrantyCase.status,
      assignedTo: assignee?.full_name ?? '—',
      openedAt: new Date(warrantyCase.opened_at).toLocaleString('pt-BR'),
      resolvedAt: warrantyCase.resolved_at
        ? new Date(warrantyCase.resolved_at).toLocaleString('pt-BR')
        : '—',
    };
  });
}

export default async function WarrantyPage() {
  const supabase = await createClient();
  const context = await getTenantContext(supabase);

  if (!context) {
    redirect('/login');
  }

  const [{ data: casesData }, { data: passagesData }, { data: peopleData }] = await Promise.all([
    supabase
      .from('warranty_cases')
      .select(`
      id,
      title,
      description,
      status,
      opened_at,
      resolved_at,
      created_at,
      people:person_id ( full_name ),
      vehicle_passages:passage_id (
        id,
        passage_number,
        vehicles:vehicle_id ( plate )
      ),
      profiles:assigned_user_id ( full_name )
    `)
      .order('opened_at', { ascending: false })
      .limit(200),
    supabase
      .from('vehicle_passages')
      .select('id, passage_number, vehicles:vehicle_id ( plate )')
      .eq('tenant_id', context.tenantId)
      .order('stock_started_at', { ascending: false })
      .limit(100),
    supabase
      .from('people')
      .select('id, full_name')
      .eq('tenant_id', context.tenantId)
      .order('full_name')
      .limit(100),
  ]);

  const passages = ((passagesData ?? []) as Array<{
    id: string;
    passage_number: number;
    vehicles: { plate: string | null } | { plate: string | null }[] | null;
  }>).map((passage) => {
    const vehicle = joinOne(passage.vehicles);
    return {
      id: passage.id,
      label: `#${String(passage.passage_number).padStart(6, '0')} — ${vehicle?.plate ?? 'Sem placa'}`,
    };
  });

  const people = (peopleData ?? []).map((person) => ({
    id: person.id,
    label: person.full_name ?? person.id.slice(0, 8),
  }));

  const rows = mapWarrantyCaseRows((casesData ?? []) as WarrantyCaseListRow[]);
  const openCount = rows.filter((row) => row.status === 'open').length;
  const inProgressCount = rows.filter((row) => row.status === 'in_progress').length;
  const resolvedCount = rows.filter(
    (row) => row.status === 'resolved' || row.status === 'closed',
  ).length;

  return (
    <>
      <PageTitle
        title="Garantia"
        subtitle="Pós-venda e ocorrências"
        breadcrumbs={[{ label: 'Garantia' }]}
      />
      <KpiGrid
        columns={3}
        items={[
          { id: 'open', label: 'Abertos', value: openCount },
          { id: 'progress', label: 'Em andamento', value: inProgressCount },
          { id: 'resolved', label: 'Resolvidos', value: resolvedCount },
        ]}
      />
      <Card title="Nova ocorrência">
        <WarrantyCaseForm passages={passages} people={people} />
      </Card>
      <Card title="Ocorrências" className="mt-3">
        <WarrantyCasesTable rows={rows} />
      </Card>
    </>
  );
}
