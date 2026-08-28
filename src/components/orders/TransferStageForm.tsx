'use client';

import { FormEvent, useCallback, useState } from 'react';
import { updateTransferStage } from '@/lib/orders/orders';
import { createClient } from '@/lib/supabase/client';
import { getClientTenantContext } from '@/lib/settings/client-context';

interface TransferStageFormProps {
  transferId: string;
  orderId: string;
  atpvDone: boolean;
  signatureDone: boolean;
  saleCommunicationDone: boolean;
  dispatcherDone: boolean;
}

export function TransferStageForm({
  transferId,
  orderId,
  atpvDone,
  signatureDone,
  saleCommunicationDone,
  dispatcherDone,
}: TransferStageFormProps) {
  const supabase = createClient();
  const [loading, setLoading] = useState<string | null>(null);

  const handleToggle = useCallback(
    async (field: 'atpv_done' | 'signature_done' | 'sale_communication_done' | 'dispatcher_done', value: boolean) => {
      setLoading(field);

      const context = await getClientTenantContext(supabase);

      if (!context) {
        setLoading(null);
        return;
      }

      try {
        await updateTransferStage(supabase, {
          tenantId: context.tenantId,
          userId: context.userId,
          transferId,
          orderId,
          field,
          value,
        });
        window.location.reload();
      } catch {
        setLoading(null);
      }
    },
    [orderId, supabase, transferId],
  );

  const stages = [
    { field: 'atpv_done' as const, label: 'ATPV', done: atpvDone },
    { field: 'signature_done' as const, label: 'Assinatura', done: signatureDone },
    { field: 'sale_communication_done' as const, label: 'Comunicação de venda', done: saleCommunicationDone },
    { field: 'dispatcher_done' as const, label: 'Despachante', done: dispatcherDone },
  ];

  return (
    <div className="d-flex flex-wrap gap-2">
      {stages.map((stage) => (
        <button
          key={stage.field}
          type="button"
          className={`btn btn-sm ${stage.done ? 'btn-success' : 'btn-light'}`}
          disabled={loading === stage.field}
          onClick={() => handleToggle(stage.field, !stage.done)}
        >
          {stage.label} {stage.done ? '✓' : ''}
        </button>
      ))}
    </div>
  );
}
