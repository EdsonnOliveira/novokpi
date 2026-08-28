'use client';

import { FormEvent, useCallback, useState } from 'react';
import { MaskedInput } from '@/components/dastone/MaskedInput';
import { parseMaskNumber } from '@/lib/masks';
import { createDispatcherRecord } from '@/lib/finance/transactions';
import { createClient } from '@/lib/supabase/client';
import { getClientTenantContext } from '@/lib/settings/client-context';

export function DispatcherForm() {
  const supabase = createClient();
  const [purpose, setPurpose] = useState('');
  const [advanceReceived, setAdvanceReceived] = useState('');
  const [notes, setNotes] = useState('');
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

      try {
        await createDispatcherRecord(supabase, {
          tenantId: context.tenantId,
          userId: context.userId,
          purpose,
          advanceReceived: parseMaskNumber(advanceReceived),
          notes: notes || undefined,
        });
        window.location.reload();
      } catch (submitError) {
        setError(submitError instanceof Error ? submitError.message : 'Erro ao salvar.');
        setLoading(false);
      }
    },
    [advanceReceived, notes, purpose, supabase],
  );

  return (
    <form onSubmit={handleSubmit} className="mb-3">
      <div className="row">
        <div className="col-md-4 mb-2">
          <input
            type="text"
            className="form-control form-control-sm"
            placeholder="Finalidade (DUA, vistoria...)"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            required
          />
        </div>
        <div className="col-md-3 mb-2">
          <MaskedInput
            mask="currency"
            className="form-control form-control-sm"
            placeholder="Adiantamento recebido"
            value={advanceReceived}
            onValueChange={setAdvanceReceived}
            required
          />
        </div>
        <div className="col-md-3 mb-2">
          <input
            type="text"
            className="form-control form-control-sm"
            placeholder="Observações"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
        <div className="col-md-2 mb-2">
          <button type="submit" className="btn btn-primary btn-sm w-100" disabled={loading}>
            <i className="iconoir-check me-1" aria-hidden="true" />
            {loading ? 'Registrando...' : 'Registrar'}
          </button>
        </div>
      </div>
      {error ? <div className="alert alert-danger py-1 px-2 mb-0">{error}</div> : null}
    </form>
  );
}
