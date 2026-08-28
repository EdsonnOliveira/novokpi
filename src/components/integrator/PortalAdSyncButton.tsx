'use client';

import { useCallback, useState } from 'react';
import { syncPortalAd } from '@/lib/integrator/ads';
import { createClient } from '@/lib/supabase/client';
import { getClientTenantContext } from '@/lib/settings/client-context';

interface PortalAdSyncButtonProps {
  adId: string;
}

export function PortalAdSyncButton({ adId }: PortalAdSyncButtonProps) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSync = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    try {
      const context = await getClientTenantContext(supabase);
      if (!context) throw new Error('Sessão inválida.');

      const result = await syncPortalAd(supabase, {
        tenantId: context.tenantId,
        userId: context.userId,
        adId,
      });

      setMessage(`Publicado: ${result.externalId}`);
      window.location.reload();
    } catch (syncError) {
      setMessage(syncError instanceof Error ? syncError.message : 'Erro na sync.');
    } finally {
      setLoading(false);
    }
  }, [adId, supabase]);

  return (
    <div>
      <button type="button" className="btn btn-primary btn-sm" onClick={handleSync} disabled={loading}>
        <i className="iconoir-check me-1" aria-hidden="true" />
        {loading ? 'Sincronizando...' : 'Sincronizar'}
      </button>
      {message ? <small className="text-muted d-block mt-1">{message}</small> : null}
    </div>
  );
}
