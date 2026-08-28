'use client';

import { useCallback, useState } from 'react';
import { reconcileFinancialItemByMatch } from '@/lib/finance/reconciliation';
import { createClient } from '@/lib/supabase/client';
import { getClientTenantContext } from '@/lib/settings/client-context';

interface ReconciliationActionsProps {
  item: {
    id: string;
    account_id: string | null;
    bank_date: string;
    amount: number;
    description: string | null;
  };
}

export function ReconciliationActions({ item }: ReconciliationActionsProps) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReconcile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const context = await getClientTenantContext(supabase);
      if (!context) return;

      await reconcileFinancialItemByMatch(supabase, {
        tenantId: context.tenantId,
        userId: context.userId,
        item,
      });

      window.location.reload();
    } catch (reconcileError) {
      setError(reconcileError instanceof Error ? reconcileError.message : 'Erro ao conciliar.');
    } finally {
      setLoading(false);
    }
  }, [item, supabase]);

  return (
    <div>
      <button type="button" className="btn btn-light btn-sm" onClick={handleReconcile} disabled={loading}>
        {loading ? '...' : 'Conciliar'}
      </button>
      {error ? <small className="d-block text-danger mt-1">{error}</small> : null}
    </div>
  );
}
