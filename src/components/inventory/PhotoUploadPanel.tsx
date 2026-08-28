'use client';

import { FormEvent, useCallback, useState } from 'react';
import { uploadVehiclePhoto } from '@/lib/inventory/media';
import { createClient } from '@/lib/supabase/client';
import { getClientTenantContext } from '@/lib/settings/client-context';

interface PhotoUploadPanelProps {
  passageId: string;
}

export function PhotoUploadPanel({ passageId }: PhotoUploadPanelProps) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      setLoading(true);
      setError(null);

      try {
        const context = await getClientTenantContext(supabase);
      if (!context) throw new Error('Sessão inválida.');

        await uploadVehiclePhoto(supabase, {
          tenantId: context.tenantId,
          userId: context.userId,
          passageId,
          file,
        });

        window.location.reload();
      } catch (uploadError) {
        setError(uploadError instanceof Error ? uploadError.message : 'Erro ao enviar foto.');
      } finally {
        setLoading(false);
        event.target.value = '';
      }
    },
    [passageId, supabase],
  );

  return (
    <div className="mb-3">
      <label className="btn btn-primary btn-sm mb-0">
        <i className="iconoir-upload me-1" aria-hidden="true" />
        {loading ? 'Enviando...' : 'Enviar foto'}
        <input type="file" accept="image/*" className="d-none" onChange={handleUpload} disabled={loading} />
      </label>
      {error ? <p className="text-danger small mt-2 mb-0">{error}</p> : null}
    </div>
  );
}
