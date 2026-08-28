'use client';

import { useCallback, useState } from 'react';
import { runQueueMatching } from '@/lib/crm/queues';
import { createClient } from '@/lib/supabase/client';

interface RunQueueMatchingButtonProps {
  tenantId: string;
  userId: string;
}

export function RunQueueMatchingButton({ tenantId, userId }: RunQueueMatchingButtonProps) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleRun = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    try {
      const matches = await runQueueMatching(supabase, tenantId, userId);
      setMessage(`${matches.length} cruzamento(s) encontrado(s).`);
      if (matches.length) window.location.reload();
    } catch (runError) {
      setMessage(runError instanceof Error ? runError.message : 'Erro ao cruzar filas.');
    } finally {
      setLoading(false);
    }
  }, [supabase, tenantId, userId]);

  return (
    <div>
      <button type="button" className="btn btn-light btn-sm" onClick={handleRun} disabled={loading}>
        <i className="iconoir-arrow-right me-1" aria-hidden="true" />
        {loading ? 'Cruzando...' : 'Executar cruzamento'}
      </button>
      {message ? <small className="text-muted d-block mt-1">{message}</small> : null}
    </div>
  );
}
