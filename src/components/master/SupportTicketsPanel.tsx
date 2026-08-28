'use client';

import { FormEvent, useCallback, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { MasterTicketRow, TenantListRow } from '@/types/master';
import { formatTicketStatus, joinOne } from '@/types/master';
import { TableEmptyRow } from '@/components/dastone/EmptyState';
import { StatusBadge } from '@/components/dastone/TableBadge';

interface SupportTicketsPanelProps {
  tickets: MasterTicketRow[];
  tenants: TenantListRow[];
}

export function SupportTicketsPanel({ tickets, tenants }: SupportTicketsPanelProps) {
  const supabase = createClient();
  const [tenantId, setTenantId] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setLoading(true);
      setError(null);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { error: insertError } = await supabase.from('master_tickets').insert({
        tenant_id: tenantId || null,
        subject,
        description: description || null,
        status: 'open',
        created_by: user?.id ?? null,
      });

      if (insertError) {
        setError(insertError.message);
        setLoading(false);
        return;
      }

      window.location.reload();
    },
    [description, subject, supabase, tenantId],
  );

  const handleStatusChange = useCallback(
    async (id: string, status: string) => {
      setLoading(true);
      const { error: updateError } = await supabase.from('master_tickets').update({ status }).eq('id', id);

      if (updateError) {
        setError(updateError.message);
        setLoading(false);
        return;
      }

      window.location.reload();
    },
    [supabase],
  );

  return (
    <>
      <form onSubmit={handleCreate} className="mb-3">
        <div className="row">
          <div className="col-md-3 mb-2">
            <select
              className="form-select form-select-sm"
              value={tenantId}
              onChange={(event) => setTenantId(event.target.value)}
            >
              <option value="">Loja (opcional)</option>
              {tenants.map((tenant) => (
                <option key={tenant.id} value={tenant.id}>
                  {tenant.name}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-3 mb-2">
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Assunto"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              required
            />
          </div>
          <div className="col-md-4 mb-2">
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Descrição"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>
          <div className="col-md-2 mb-2">
            <button type="submit" className="btn btn-primary btn-sm w-100" disabled={loading}>
              <i className="iconoir-check me-1" aria-hidden="true" />
              {loading ? 'Salvando...' : 'Novo chamado'}
            </button>
          </div>
        </div>
        {error ? <div className="alert alert-danger py-1 px-2 mb-0">{error}</div> : null}
      </form>
      <div className="table-responsive">
        <table className="table table-hover mb-0">
          <thead>
            <tr>
              <th>Assunto</th>
              <th>Loja</th>
              <th>Status</th>
              <th>Criado em</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {tickets.length ? (
              tickets.map((ticket) => {
                const tenant = joinOne(ticket.tenants);

                return (
                  <tr key={ticket.id}>
                    <td>
                      {ticket.subject}
                      {ticket.description ? (
                        <small className="text-muted d-block">{ticket.description}</small>
                      ) : null}
                    </td>
                    <td>{tenant?.name ?? '—'}</td>
                    <td>
                      <StatusBadge status={ticket.status} label={formatTicketStatus(ticket.status)} />
                    </td>
                    <td>{new Date(ticket.created_at).toLocaleString('pt-BR')}</td>
                    <td>
                      <select
                        className="form-select form-select-sm"
                        value={ticket.status}
                        disabled={loading}
                        onChange={(event) => handleStatusChange(ticket.id, event.target.value)}
                      >
                        <option value="open">Aberto</option>
                        <option value="in_progress">Em andamento</option>
                        <option value="resolved">Resolvido</option>
                        <option value="closed">Fechado</option>
                      </select>
                    </td>
                  </tr>
                );
              })
            ) : (
              <TableEmptyRow
                colSpan={5}
                title="Nenhum chamado registrado."
                icon="iconoir-headset-help"
              />
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
