'use client';

import { useCallback, useState } from 'react';

interface MasterTenantAccessButtonProps {
  tenantId: string;
  tenantName: string;
}

export function MasterTenantAccessButton({ tenantId, tenantName }: MasterTenantAccessButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleAccess = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/master/impersonate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? 'Erro ao acessar loja.');
      }

      window.location.href = '/dashboard';
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Erro ao acessar loja.');
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  return (
    <button type="button" className="btn btn-primary btn-sm" onClick={handleAccess} disabled={loading}>
      <i className="iconoir-check me-1" aria-hidden="true" />
      {loading ? 'Entrando...' : `Acessar ${tenantName}`}
    </button>
  );
}
