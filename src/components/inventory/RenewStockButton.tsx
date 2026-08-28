'use client';

import { FormEvent, useCallback, useState } from 'react';
import { renewStockEntry } from '@/lib/inventory/media';
import { createClient } from '@/lib/supabase/client';
import { getClientTenantContext } from '@/lib/settings/client-context';

interface RenewStockButtonProps {
  passageId: string;
}

export function RenewStockButton({ passageId }: RenewStockButtonProps) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  const handleRenew = useCallback(async () => {
    setLoading(true);
    try {
      const context = await getClientTenantContext(supabase);
      if (!context) return;

      await renewStockEntry(supabase, {
        tenantId: context.tenantId,
        userId: context.userId,
        passageId,
      });

      window.location.reload();
    } finally {
      setLoading(false);
    }
  }, [passageId, supabase]);

  return (
    <button type="button" className="btn btn-light btn-sm" onClick={handleRenew} disabled={loading}>
      <i className="iconoir-refresh-double me-1" aria-hidden="true" />
      {loading ? 'Renovando...' : 'Renovar entrada'}
    </button>
  );
}
