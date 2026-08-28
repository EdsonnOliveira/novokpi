import Link from 'next/link';
import { PageTitle } from '@/components/dastone/PageTitle';
import { Card } from '@/components/dastone/Card';
import { createClient } from '@/lib/supabase/server';
import {
  formatCampaignChannel,
  formatCampaignStatus,
  type CampaignRow,
} from '@/types/platform';

export default async function MarketingPage() {
  const supabase = await createClient();

  const { data: campaignsData } = await supabase
    .from('campaigns')
    .select('id, name, channel, status, subject, scheduled_at, sent_at, created_at')
    .order('created_at', { ascending: false })
    .limit(100);

  const campaigns = (campaignsData ?? []) as CampaignRow[];

  return (
    <>
      <PageTitle
        title="Marketing"
        subtitle="Campanhas SMS, e-mail e WhatsApp"
        breadcrumbs={[{ label: 'Marketing' }]}
      />
      <Card>
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead>
              <tr>
                <th>Campanha</th>
                <th>Canal</th>
                <th>Status</th>
                <th>Assunto</th>
                <th>Agendamento</th>
                <th>Envio</th>
                <th>Criada em</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.length ? (
                campaigns.map((campaign) => (
                  <tr key={campaign.id}>
                    <td>{campaign.name}</td>
                    <td>{formatCampaignChannel(campaign.channel)}</td>
                    <td>{formatCampaignStatus(campaign.status)}</td>
                    <td>{campaign.subject ?? '—'}</td>
                    <td>
                      {campaign.scheduled_at
                        ? new Date(campaign.scheduled_at).toLocaleString('pt-BR')
                        : '—'}
                    </td>
                    <td>
                      {campaign.sent_at
                        ? new Date(campaign.sent_at).toLocaleString('pt-BR')
                        : '—'}
                    </td>
                    <td>{new Date(campaign.created_at).toLocaleDateString('pt-BR')}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center text-muted py-4">
                    Nenhuma campanha cadastrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
      <Card title="Central de oportunidades" className="mt-3">
        <p className="text-muted mb-2">
          Gerencie oportunidades de marketing vinculadas a clientes e veículos.
        </p>
        <Link href="/marketing/opportunities" className="btn btn-light btn-sm">
          Abrir oportunidades
        </Link>
      </Card>
    </>
  );
}
