'use client';

import { useCallback, useState } from 'react';

interface ImpersonationBannerProps {
  tenantName: string;
}

export function ImpersonationBanner({ tenantName }: ImpersonationBannerProps) {
  const [loading, setLoading] = useState(false);

  const handleExit = useCallback(async () => {
    setLoading(true);
    try {
      await fetch('/api/master/impersonate', { method: 'DELETE' });
      window.location.href = '/master/tenant-access';
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="alert alert-warning py-2 mb-3 d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-2">
      <span>
        Você está acessando a loja <strong>{tenantName}</strong> como master.
      </span>
      <button type="button" className="btn btn-light btn-sm" onClick={handleExit} disabled={loading}>
        <i className="iconoir-arrow-right me-1" aria-hidden="true" />
        {loading ? 'Saindo...' : 'Sair da loja'}
      </button>
    </div>
  );
}
