import { PageTitle } from '@/components/dastone/PageTitle';
import { Card } from '@/components/dastone/Card';
import { AnnouncementsPanel } from '@/components/master/AnnouncementsPanel';
import { createClient } from '@/lib/supabase/server';
import type { MasterAnnouncementRow } from '@/types/master';

export default async function MasterAnnouncementsPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from('master_announcements')
    .select('id, title, body, is_published, published_at, created_at')
    .order('created_at', { ascending: false });

  const announcements = (data ?? []) as MasterAnnouncementRow[];

  return (
    <>
      <PageTitle
        title="Comunicados"
        subtitle="O que há de novo para as lojas"
        breadcrumbs={[
          { label: 'Master', href: '/master' },
          { label: 'Comunicados' },
        ]}
      />
      <Card title="Comunicados master">
        <AnnouncementsPanel announcements={announcements} />
      </Card>
    </>
  );
}
