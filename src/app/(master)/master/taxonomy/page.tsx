import { PageTitle } from '@/components/dastone/PageTitle';
import { Card } from '@/components/dastone/Card';
import { TaxonomyPanel } from '@/components/master/TaxonomyPanel';
import { createClient } from '@/lib/supabase/server';
import type { TaxonomyBrandRow } from '@/types/master';

export default async function MasterTaxonomyPage() {
  const supabase = await createClient();

  const [{ data: brandsData }, { data: modelsData }] = await Promise.all([
    supabase
      .from('vehicle_brands')
      .select('id, name, is_active, created_at')
      .is('tenant_id', null)
      .order('name'),
    supabase.from('vehicle_models').select('id, brand_id, name, is_active'),
  ]);

  const modelsMap = new Map<string, TaxonomyBrandRow['vehicle_models']>();
  (modelsData ?? []).forEach((model) => {
    const current = modelsMap.get(model.brand_id) ?? [];
    current.push({
      id: model.id,
      name: model.name,
      is_active: model.is_active,
    });
    modelsMap.set(model.brand_id, current);
  });

  const brands = (brandsData ?? []).map((brand) => ({
    ...brand,
    vehicle_models: modelsMap.get(brand.id) ?? null,
  })) as TaxonomyBrandRow[];

  return (
    <>
      <PageTitle
        title="Taxonomia"
        subtitle="Marcas e modelos master"
        breadcrumbs={[
          { label: 'Master', href: '/master' },
          { label: 'Taxonomia' },
        ]}
      />
      <Card title="Marcas master">
        <TaxonomyPanel brands={brands} />
      </Card>
    </>
  );
}
