import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

export async function syncTenantSiteInventory(
  supabase: SupabaseClient<Database>,
  tenantId: string,
) {
  const { data: settings } = await supabase
    .from('tenant_site_settings')
    .select('sync_inventory, is_published')
    .eq('tenant_id', tenantId)
    .maybeSingle();

  if (!settings?.sync_inventory) {
    return 0;
  }

  const { data: passagesData } = await supabase
    .from('vehicle_passages')
    .select(`
      id,
      vehicle_id,
      sale_price,
      km,
      status,
      vehicles:vehicle_id (
        plate,
        vehicle_brands:brand_id ( name ),
        vehicle_models:model_id ( name ),
        vehicle_versions:version_id ( name )
      )
    `)
    .eq('tenant_id', tenantId)
    .in('status', ['in_stock', 'reserved']);

  type PassageSyncRow = {
    id: string;
    vehicle_id: string | null;
    sale_price: number | null;
    km: number | null;
    status: string;
    vehicles:
      | {
          plate: string | null;
          vehicle_brands: { name: string } | { name: string }[] | null;
          vehicle_models: { name: string } | { name: string }[] | null;
          vehicle_versions: { name: string } | { name: string }[] | null;
        }
      | {
          plate: string | null;
          vehicle_brands: { name: string } | { name: string }[] | null;
          vehicle_models: { name: string } | { name: string }[] | null;
          vehicle_versions: { name: string } | { name: string }[] | null;
        }[]
      | null;
  };

  const passages = (passagesData ?? []) as PassageSyncRow[];

  if (!passages?.length) {
    await supabase.from('tenant_site_inventory').delete().eq('tenant_id', tenantId);
    return 0;
  }

  await supabase.from('tenant_site_inventory').delete().eq('tenant_id', tenantId);

  const rows = passages.map((passage) => {
    const vehicle = Array.isArray(passage.vehicles) ? passage.vehicles[0] : passage.vehicles;
    const brand = vehicle?.vehicle_brands
      ? Array.isArray(vehicle.vehicle_brands)
        ? vehicle.vehicle_brands[0]?.name
        : vehicle.vehicle_brands.name
      : null;
    const model = vehicle?.vehicle_models
      ? Array.isArray(vehicle.vehicle_models)
        ? vehicle.vehicle_models[0]?.name
        : vehicle.vehicle_models.name
      : null;
    const version = vehicle?.vehicle_versions
      ? Array.isArray(vehicle.vehicle_versions)
        ? vehicle.vehicle_versions[0]?.name
        : vehicle.vehicle_versions.name
      : null;

    return {
      tenant_id: tenantId,
      passage_id: passage.id,
      vehicle_id: passage.vehicle_id,
      plate: vehicle?.plate ?? null,
      vehicle_label: [brand, model, version].filter(Boolean).join(' '),
      sale_price: passage.sale_price,
      km: passage.km,
      is_visible: settings.is_published && passage.status === 'in_stock',
      synced_at: new Date().toISOString(),
    };
  });

  const { error } = await supabase
    .from('tenant_site_inventory')
    .upsert(rows as never[], { onConflict: 'tenant_id,passage_id' });

  if (error) {
    throw new Error('Não foi possível sincronizar estoque do site.');
  }

  return rows.length;
}
