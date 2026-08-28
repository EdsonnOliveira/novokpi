'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { createTemporaryExit } from '@/lib/inventory/exits';
import { createClient } from '@/lib/supabase/client';
import { getClientTenantContext } from '@/lib/settings/client-context';

interface PassageOption {
  id: string;
  plate: string;
}

export function TemporaryExitForm() {
  const supabase = createClient();
  const [passages, setPassages] = useState<PassageOption[]>([]);
  const [passageId, setPassageId] = useState('');
  const [reason, setReason] = useState('');
  const [expectedReturnAt, setExpectedReturnAt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPassages() {
      const { data } = await supabase
        .from('vehicle_passages')
        .select('id, vehicles:vehicle_id ( plate )')
        .in('status', ['in_stock', 'reserved'])
        .order('stock_started_at', { ascending: true })
        .limit(100);

      const rows = (data ?? []) as Array<{
        id: string;
        vehicles: { plate: string | null } | { plate: string | null }[] | null;
      }>;

      setPassages(
        rows.map((item) => {
          const vehicle = Array.isArray(item.vehicles) ? item.vehicles[0] : item.vehicles;
          return {
            id: item.id,
            plate: vehicle?.plate ?? item.id.slice(0, 8),
          };
        }),
      );
    }

    loadPassages();
  }, [supabase]);

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
        await createTemporaryExit(supabase, {
          tenantId: context.tenantId,
          userId: context.userId,
          passageId,
          reason,
          expectedReturnAt: expectedReturnAt || undefined,
        });
        window.location.reload();
      } catch (submitError) {
        setError(submitError instanceof Error ? submitError.message : 'Erro ao registrar.');
      } finally {
        setLoading(false);
      }
    },
    [expectedReturnAt, passageId, reason, supabase],
  );

  return (
    <form onSubmit={handleSubmit}>
      <div className="row">
        <div className="col-md-4 mb-2">
          <select className="form-select form-select-sm" value={passageId} onChange={(e) => setPassageId(e.target.value)} required>
            <option value="">Selecione o veículo</option>
            {passages.map((passage) => (
              <option key={passage.id} value={passage.id}>{passage.plate}</option>
            ))}
          </select>
        </div>
        <div className="col-md-4 mb-2">
          <input type="text" className="form-control form-control-sm" placeholder="Motivo" value={reason} onChange={(e) => setReason(e.target.value)} required />
        </div>
        <div className="col-md-2 mb-2">
          <input type="date" className="form-control form-control-sm" value={expectedReturnAt} onChange={(e) => setExpectedReturnAt(e.target.value)} />
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
