'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useCallback, useState } from 'react';
import { closeOrder } from '@/lib/orders/orders';
import { createClient } from '@/lib/supabase/client';
import { getClientTenantContext } from '@/lib/settings/client-context';

interface CloseOrderButtonProps {
  orderId: string;
  status: string;
}

export function CloseOrderButton({ orderId, status }: CloseOrderButtonProps) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClose = useCallback(async () => {
    setLoading(true);
    setError(null);

    const context = await getClientTenantContext(supabase);

    if (!context) {
      setError('Loja não configurada.');
      setLoading(false);
      return;
    }

    try {
      await closeOrder(supabase, {
        tenantId: context.tenantId,
        userId: context.userId,
        orderId,
      });
      router.refresh();
    } catch (closeError) {
      setError(closeError instanceof Error ? closeError.message : 'Erro ao fechar.');
      setLoading(false);
    }
  }, [orderId, router, supabase]);

  if (status !== 'reserved') return null;

  return (
    <div>
      <button type="button" className="btn btn-success btn-sm" disabled={loading} onClick={handleClose}>
        {loading ? 'Fechando...' : 'Fechar pedido'}
      </button>
      {error ? <div className="alert alert-danger py-1 px-2 mt-2 mb-0">{error}</div> : null}
    </div>
  );
}

interface DeliveryFormProps {
  orderId: string;
  orderStatus: string;
  deliveryStatus: string;
}

export function DeliveryForm({ orderId, orderStatus, deliveryStatus }: DeliveryFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [deliveryKm, setDeliveryKm] = useState('');
  const [clientNotes, setClientNotes] = useState('');
  const [wentWell, setWentWell] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setLoading(true);
      setError(null);

      const context = await getClientTenantContext(supabase);

      if (!context) {
        setError('Loja não configurada.');
        setLoading(false);
        return;
      }

      const { createDelivery } = await import('@/lib/orders/orders');

      try {
        await createDelivery(supabase, {
          tenantId: context.tenantId,
          userId: context.userId,
          orderId,
          deliveryKm: deliveryKm ? Number(deliveryKm) : undefined,
          clientNotes: clientNotes || undefined,
          wentWell,
        });
        router.refresh();
      } catch (submitError) {
        setError(submitError instanceof Error ? submitError.message : 'Erro ao registrar.');
        setLoading(false);
      }
    },
    [clientNotes, deliveryKm, orderId, router, supabase, wentWell],
  );

  if (deliveryStatus === 'delivered') {
    return <p className="text-muted mb-0">Entrega já registrada.</p>;
  }

  if (orderStatus !== 'closed' && orderStatus !== 'reserved') return null;

  return (
    <form onSubmit={handleSubmit}>
      <div className="row">
        <div className="col-md-4 mb-2">
          <input
            type="number"
            className="form-control form-control-sm"
            placeholder="Km entrega"
            value={deliveryKm}
            onChange={(e) => setDeliveryKm(e.target.value)}
          />
        </div>
        <div className="col-md-4 mb-2">
          <select
            className="form-select form-select-sm"
            value={wentWell ? 'yes' : 'no'}
            onChange={(e) => setWentWell(e.target.value === 'yes')}
          >
            <option value="yes">Tudo certo</option>
            <option value="no">Com ressalvas</option>
          </select>
        </div>
        <div className="col-md-4 mb-2">
          <button type="submit" className="btn btn-primary btn-sm w-100" disabled={loading}>
            {loading ? 'Salvando...' : 'Registrar entrega'}
          </button>
        </div>
      </div>
      <input
        type="text"
        className="form-control form-control-sm mb-2"
        placeholder="Observações do cliente"
        value={clientNotes}
        onChange={(e) => setClientNotes(e.target.value)}
      />
      {error ? <div className="alert alert-danger py-1 px-2 mb-0">{error}</div> : null}
    </form>
  );
}

interface TransferFormProps {
  orderId: string;
  vehiclePassageId: string | null;
  hasTransfer: boolean;
}

export function TransferForm({ orderId, vehiclePassageId, hasTransfer }: TransferFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [thirdPartyName, setThirdPartyName] = useState('');
  const [deadlineAt, setDeadlineAt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setLoading(true);
      setError(null);

      const context = await getClientTenantContext(supabase);

      if (!context) {
        setError('Loja não configurada.');
        setLoading(false);
        return;
      }

      const { createTransfer } = await import('@/lib/orders/orders');

      try {
        await createTransfer(supabase, {
          tenantId: context.tenantId,
          userId: context.userId,
          orderId,
          vehiclePassageId: vehiclePassageId ?? undefined,
          thirdPartyName: thirdPartyName || undefined,
          deadlineAt: deadlineAt || undefined,
        });
        router.refresh();
      } catch (submitError) {
        setError(submitError instanceof Error ? submitError.message : 'Erro ao registrar.');
        setLoading(false);
      }
    },
    [deadlineAt, orderId, router, supabase, thirdPartyName, vehiclePassageId],
  );

  if (hasTransfer) return null;

  return (
    <form onSubmit={handleSubmit}>
      <div className="row">
        <div className="col-md-4 mb-2">
          <input
            type="text"
            className="form-control form-control-sm"
            placeholder="Terceiro / despachante"
            value={thirdPartyName}
            onChange={(e) => setThirdPartyName(e.target.value)}
          />
        </div>
        <div className="col-md-4 mb-2">
          <input
            type="date"
            className="form-control form-control-sm"
            value={deadlineAt}
            onChange={(e) => setDeadlineAt(e.target.value)}
          />
        </div>
        <div className="col-md-4 mb-2">
          <button type="submit" className="btn btn-primary btn-sm w-100" disabled={loading}>
            {loading ? 'Salvando...' : 'Iniciar transferência'}
          </button>
        </div>
      </div>
      {error ? <div className="alert alert-danger py-1 px-2 mb-0">{error}</div> : null}
    </form>
  );
}
