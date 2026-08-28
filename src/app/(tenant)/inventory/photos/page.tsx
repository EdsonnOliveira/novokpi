import Link from 'next/link';
import { PageTitle } from '@/components/dastone/PageTitle';
import { Card } from '@/components/dastone/Card';
import { createClient } from '@/lib/supabase/server';

async function getPassageLinks() {
  const supabase = await createClient();
  const { data: passages } = await supabase
    .from('vehicle_passages')
    .select('id, vehicle_id')
    .in('status', ['in_stock', 'reserved', 'temporarily_out'])
    .order('stock_started_at', { ascending: true })
    .limit(100);

  const vehicleIds = [...new Set((passages ?? []).map((item) => item.vehicle_id).filter(Boolean))];
  const { data: vehicles } = vehicleIds.length
    ? await supabase.from('vehicles').select('id, plate').in('id', vehicleIds as string[])
    : { data: [] };

  const plateMap = new Map((vehicles ?? []).map((vehicle) => [vehicle.id, vehicle.plate]));

  return (passages ?? []).map((passage) => ({
    id: passage.id,
    plate: plateMap.get(passage.vehicle_id) ?? passage.id.slice(0, 8),
  }));
}

export default async function InventoryPhotosShortcutPage() {
  const links = await getPassageLinks();

  return (
    <>
      <PageTitle
        title="Fotos"
        subtitle="Atalho para fotos no detalhe do veículo"
        breadcrumbs={[
          { label: 'Estoque', href: '/inventory' },
          { label: 'Fotos' },
        ]}
      />
      <Card title="Selecione o veículo">
        <div className="d-flex flex-wrap gap-2">
          {links.length ? (
            links.map((item) => (
              <Link key={item.id} href={`/inventory/${item.id}?tab=photos`} className="btn btn-light btn-sm">
                <i className="iconoir-arrow-right me-1" aria-hidden="true" />
                {item.plate}
              </Link>
            ))
          ) : (
            <p className="text-muted mb-0">Nenhum veículo em estoque.</p>
          )}
        </div>
      </Card>
    </>
  );
}
