'use client';

import { useCallback, useState } from 'react';
import { runAlertEngine } from '@/lib/alerts/engine';
import { createClient } from '@/lib/supabase/client';
import { getClientTenantContext } from '@/lib/settings/client-context';

export function RunAlertsButton() {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleRun = useCallback(async () => {
    setLoading(true);
    setResult(null);
    try {
      const context = await getClientTenantContext(supabase);
      if (!context) throw new Error('Sessão inválida.');

      const created = await runAlertEngine(supabase, context.tenantId);
      setResult(`${created} alerta(s) processado(s).`);
      window.location.reload();
    } catch (runError) {
      setResult(runError instanceof Error ? runError.message : 'Erro ao executar.');
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  return (
    <div>
      <button type="button" className="btn btn-light btn-sm" onClick={handleRun} disabled={loading}>
        {loading ? 'Executando...' : 'Executar regras'}
      </button>
      {result ? <small className="text-muted d-block mt-1">{result}</small> : null}
    </div>
  );
}
