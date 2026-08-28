import { PageTitle } from '@/components/dastone/PageTitle';
import { Card } from '@/components/dastone/Card';
import { createClient } from '@/lib/supabase/server';
import { getTenantContext } from '@/lib/settings/tenant-context';
import { redirect } from 'next/navigation';

interface HelpVideoRow {
  id: string;
  module: string;
  route: string;
  title: string;
  video_url: string | null;
  description: string | null;
}

export default async function HelpPage() {
  const supabase = await createClient();
  const context = await getTenantContext(supabase);

  if (!context) {
    redirect('/login');
  }

  const { data: videosData } = await supabase
    .from('help_videos')
    .select('id, module, route, title, video_url, description')
    .order('module')
    .order('title');

  const videos = (videosData ?? []) as HelpVideoRow[];
  const grouped = videos.reduce<Record<string, HelpVideoRow[]>>((acc, video) => {
    const key = video.module || 'geral';
    acc[key] = acc[key] ? [...acc[key], video] : [video];
    return acc;
  }, {});

  return (
    <>
      <PageTitle
        title="Ajuda"
        subtitle="Vídeos e tutoriais do sistema"
        breadcrumbs={[{ label: 'Ajuda' }]}
      />
      {Object.keys(grouped).length ? (
        Object.entries(grouped).map(([module, moduleVideos]) => (
          <Card key={module} title={module.toUpperCase()} className="mb-3">
            <div className="list-group list-group-flush">
              {moduleVideos.map((video) => (
                <div key={video.id} className="list-group-item px-0">
                  <div className="d-flex justify-content-between align-items-start gap-3">
                    <div>
                      <h6 className="mb-1">{video.title}</h6>
                      {video.description ? <p className="text-muted small mb-1">{video.description}</p> : null}
                      <small className="text-muted">{video.route}</small>
                    </div>
                    {video.video_url ? (
                      <a href={video.video_url} target="_blank" rel="noreferrer" className="btn btn-light btn-sm">
                        Assistir
                      </a>
                    ) : (
                      <span className="badge bg-soft-secondary">Sem vídeo cadastrado</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))
      ) : (
        <Card>
          <p className="text-muted mb-0">Nenhum vídeo de ajuda cadastrado no Supabase.</p>
        </Card>
      )}
    </>
  );
}
