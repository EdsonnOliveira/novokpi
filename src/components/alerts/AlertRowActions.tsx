'use client';

import { useCallback, useState } from 'react';
import { dismissAlert, markAlertRead } from '@/lib/alerts/engine';
import { createClient } from '@/lib/supabase/client';

interface AlertRowActionsProps {
  alertId: string;
  isRead: boolean;
  href?: string | null;
}

export function AlertRowActions({ alertId, isRead, href }: AlertRowActionsProps) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  const handleDismiss = useCallback(async () => {
    setLoading(true);
    try {
      await dismissAlert(supabase, alertId);
      window.location.reload();
    } finally {
      setLoading(false);
    }
  }, [alertId, supabase]);

  const handleRead = useCallback(async () => {
    if (isRead) return;
    setLoading(true);
    try {
      await markAlertRead(supabase, alertId);
      if (href) {
        window.location.href = href;
        return;
      }
      window.location.reload();
    } finally {
      setLoading(false);
    }
  }, [alertId, href, isRead, supabase]);

  return (
    <div className="d-flex gap-1">
      {href ? (
        <button type="button" className="btn btn-light btn-sm" onClick={handleRead} disabled={loading}>
          <i className="iconoir-eye me-1" aria-hidden="true" />
          Abrir
        </button>
      ) : null}
      <button type="button" className="btn btn-light btn-sm" onClick={handleDismiss} disabled={loading}>
        <i className="iconoir-check me-1" aria-hidden="true" />
        Dispensar
      </button>
    </div>
  );
}
