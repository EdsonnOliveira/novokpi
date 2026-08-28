import dynamic from 'next/dynamic';
import { PageTitle } from '@/components/dastone/PageTitle';
import { CardSkeleton, PageTitleSkeleton, SkeletonBlock } from '@/components/dastone/skeleton/SkeletonPrimitives';
import { createClient } from '@/lib/supabase/server';
import {
  fetchAgendaActivities,
  fetchAgendaDealOptions,
  syncOverdueActivities,
} from '@/lib/agenda/activities';

const AgendaCalendar = dynamic(
  () => import('@/components/agenda/AgendaCalendar').then((mod) => mod.AgendaCalendar),
  {
    loading: () => (
      <>
        <PageTitleSkeleton />
        <div className="row">
          <div className="col-lg-4 mb-3">
            <CardSkeleton>
              {Array.from({ length: 6 }).map((_, index) => (
                <SkeletonBlock key={index} height={14} className="mb-2" />
              ))}
            </CardSkeleton>
          </div>
          <div className="col-lg-8 mb-3">
            <CardSkeleton>
              <SkeletonBlock height={420} />
            </CardSkeleton>
          </div>
        </div>
      </>
    ),
  },
);

export default async function AgendaPage() {
  const supabase = await createClient();
  await syncOverdueActivities(supabase);

  const [activities, deals] = await Promise.all([
    fetchAgendaActivities(supabase),
    fetchAgendaDealOptions(supabase),
  ]);

  return (
    <>
      <PageTitle
        title="Agenda"
        subtitle="Atividades do dia, atrasadas e próximos retornos"
        breadcrumbs={[{ label: 'Agenda' }]}
      />
      <AgendaCalendar initialActivities={activities} initialDeals={deals} />
    </>
  );
}
