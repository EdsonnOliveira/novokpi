'use client';

import { FormEvent, useCallback, useState } from 'react';
import { uploadVehicleReport } from '@/lib/inventory/media';
import { createClient } from '@/lib/supabase/client';
import { getClientTenantContext } from '@/lib/settings/client-context';

interface ReportUploadPanelProps {
  passageId: string;
}

export function ReportUploadPanel({ passageId }: ReportUploadPanelProps) {
  const supabase = createClient();
  const [notes, setNotes] = useState('');
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

        await uploadVehicleReport(supabase, {
          tenantId: context.tenantId,
          userId: context.userId,
          passageId,
          file,
          notes: notes || undefined,
        });

        window.location.reload();
      } catch (uploadError) {
        setError(uploadError instanceof Error ? uploadError.message : 'Erro ao enviar laudo.');
      } finally {
        setLoading(false);
        event.target.value = '';
      }
    },
    [notes, passageId, supabase],
  );

  return (
    <div className="mb-3">
      <input
        type="text"
        className="form-control form-control-sm mb-2"
        placeholder="Observações do laudo"
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
      />
      <label className="btn btn-primary btn-sm mb-0">
        <i className="iconoir-upload me-1" aria-hidden="true" />
        {loading ? 'Enviando...' : 'Enviar laudo (PDF/imagem)'}
        <input type="file" accept=".pdf,image/*" className="d-none" onChange={handleUpload} disabled={loading} />
      </label>
      {error ? <p className="text-danger small mt-2 mb-0">{error}</p> : null}
    </div>
  );
}
