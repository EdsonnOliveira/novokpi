import { PageTitle } from '@/components/dastone/PageTitle';
import { Card } from '@/components/dastone/Card';
import { PlansPanel } from '@/components/master/PlansPanel';
import { createClient } from '@/lib/supabase/server';
import type { PlanListRow } from '@/types/master';

export default async function MasterPlansPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from('plans')
    .select('id, name, slug, price_monthly, is_active, created_at')
    .order('price_monthly');

  const plans = (data ?? []) as PlanListRow[];

  return (
    <>
      <PageTitle
        title="Planos"
        subtitle="Planos configuráveis do SaaS"
        breadcrumbs={[
          { label: 'Master', href: '/master' },
          { label: 'Planos' },
        ]}
      />
      <Card title="Planos disponíveis">
        <PlansPanel plans={plans} />
      </Card>
    </>
  );
}
