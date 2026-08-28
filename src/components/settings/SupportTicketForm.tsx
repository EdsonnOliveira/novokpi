'use client';

import { FormEvent, useCallback, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getClientTenantContext } from '@/lib/settings/client-context';

export function SupportTicketForm() {
  const supabase = createClient();
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('normal');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setLoading(true);
      setError(null);

      const context = await getClientTenantContext(supabase);

      if (!context) {
        setError('Loja não configurada.');
        setLoading(false);
        return;
      }

      const { error: insertError } = await supabase.from('support_tickets').insert({
        tenant_id: context.tenantId,
        created_by: context.userId,
        subject,
        description,
        priority,
      });

      if (insertError) {
        setError(insertError.message);
        setLoading(false);
        return;
      }

      window.location.reload();
    },
    [description, priority, subject, supabase],
  );

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-2">
        <input type="text" className="form-control form-control-sm" placeholder="Assunto" value={subject} onChange={(e) => setSubject(e.target.value)} required />
      </div>
      <div className="mb-2">
        <textarea className="form-control form-control-sm" placeholder="Descreva o problema" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <div className="row">
        <div className="col-md-3 mb-2">
          <select className="form-select form-select-sm" value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value="low">Baixa</option>
            <option value="normal">Normal</option>
            <option value="high">Alta</option>
          </select>
        </div>
        <div className="col-md-2 mb-2">
          <button type="submit" className="btn btn-primary btn-sm w-100" disabled={loading}>
            <i className="iconoir-check me-1" aria-hidden="true" />
            {loading ? 'Enviando...' : 'Enviar'}
          </button>
        </div>
      </div>
      {error ? <div className="alert alert-danger py-1 px-2 mb-0">{error}</div> : null}
    </form>
  );
}
