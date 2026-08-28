import Link from 'next/link';
import { PageTitle } from '@/components/dastone/PageTitle';
import { Card } from '@/components/dastone/Card';
import { TemporaryExitForm } from '@/components/inventory/TemporaryExitForm';
import { createClient } from '@/lib/supabase/server';

export default async function TemporaryExitPage() {
  const supabase = await createClient();

  const { data: exits } = await supabase
    .from('stock_exits')
    .select('id, reason, exited_at, expected_return_at, returned_at, passage_id')
    .is('returned_at', null)
    .order('exited_at', { ascending: false })
    .limit(100);

  const passageIds = [...new Set((exits ?? []).map((exit) => exit.passage_id))];
  const { data: passages } = passageIds.length
    ? await supabase.from('vehicle_passages').select('id, vehicle_id').in('id', passageIds)
    : { data: [] };

  const vehicleIds = [...new Set((passages ?? []).map((passage) => passage.vehicle_id).filter(Boolean))];
  const { data: vehicles } = vehicleIds.length
    ? await supabase.from('vehicles').select('id, plate').in('id', vehicleIds as string[])
    : { data: [] };

  const vehicleMap = new Map((vehicles ?? []).map((vehicle) => [vehicle.id, vehicle.plate]));
  const passageVehicleMap = new Map(
    (passages ?? []).map((passage) => [passage.id, vehicleMap.get(passage.vehicle_id) ?? null]),
  );

  return (
    <>
      <PageTitle
        title="Saída temporária"
        subtitle="Veículos fora da loja temporariamente"
        breadcrumbs={[
          { label: 'Estoque', href: '/inventory' },
          { label: 'Saída temporária' },
        ]}
      />
      <Card title="Registrar saída">
        <TemporaryExitForm />
      </Card>
      <Card title="Saídas em aberto" className="mt-3">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead>
              <tr>
                <th>Placa</th>
                <th>Motivo</th>
                <th>Saiu em</th>
                <th>Retorno previsto</th>
              </tr>
            </thead>
            <tbody>
              {exits?.length ? (
                exits.map((exit) => (
                  <tr key={exit.id}>
                    <td>
                      <Link href={`/inventory/${exit.passage_id}`}>
                        {passageVehicleMap.get(exit.passage_id) ?? '—'}
                      </Link>
                    </td>
                    <td>{exit.reason}</td>
                    <td>{new Date(exit.exited_at).toLocaleString('pt-BR')}</td>
                    <td>{exit.expected_return_at ? new Date(exit.expected_return_at).toLocaleDateString('pt-BR') : '—'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="text-center text-muted py-4">
                    Nenhuma saída temporária em aberto.
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
