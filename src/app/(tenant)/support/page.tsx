import { PageTitle } from '@/components/dastone/PageTitle';
import { Card } from '@/components/dastone/Card';
import { SupportTicketForm } from '@/components/settings/SupportTicketForm';
import { createClient } from '@/lib/supabase/server';
import { TableEmptyRow } from '@/components/dastone/EmptyState';
import { StatusBadge } from '@/components/dastone/TableBadge';
import { formatTicketPriority } from '@/lib/ui/table-badges';
import { formatTicketStatus } from '@/types/master';

export default async function SupportPage() {
  const supabase = await createClient();

  const { data: tickets } = await supabase
    .from('support_tickets')
    .select('id, subject, description, status, priority, created_at, updated_at')
    .order('created_at', { ascending: false })
    .limit(100);

  return (
    <>
      <PageTitle
        title="Suporte"
        subtitle="Chamados com a equipe Novo KPI"
        breadcrumbs={[
          { label: 'Configurações', href: '/settings' },
          { label: 'Suporte' },
        ]}
      />
      <Card title="Abrir chamado">
        <SupportTicketForm />
      </Card>
      <Card title="Meus chamados" className="mt-3">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead>
              <tr>
                <th>Assunto</th>
                <th>Status</th>
                <th>Prioridade</th>
                <th>Aberto em</th>
              </tr>
            </thead>
            <tbody>
              {tickets?.length ? (
                tickets.map((ticket) => (
                  <tr key={ticket.id}>
                    <td>
                      <strong>{ticket.subject}</strong>
                      {ticket.description ? <div className="text-muted small">{ticket.description}</div> : null}
                    </td>
                    <td>
                      <StatusBadge status={ticket.status} label={formatTicketStatus(ticket.status)} />
                    </td>
                    <td>
                      <StatusBadge
                        status={ticket.priority}
                        label={formatTicketPriority(ticket.priority)}
                      />
                    </td>
                    <td>{new Date(ticket.created_at).toLocaleDateString('pt-BR')}</td>
                  </tr>
                ))
              ) : (
                <TableEmptyRow
                  colSpan={4}
                  title="Nenhum chamado aberto."
                  icon="iconoir-headset-help"
                />
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
