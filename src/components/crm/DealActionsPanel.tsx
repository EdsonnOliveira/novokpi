'use client';

import { FormEvent, useCallback, useState } from 'react';
import { AnimatedModal } from '@/components/dastone/AnimatedModal';
import {
  addNegotiationNote,
  closeLostDeal,
  setDealNextAction,
  upsertDealInterest,
} from '@/lib/crm/deals';
import { addToDemandQueue } from '@/lib/crm/queues';
import { createClient } from '@/lib/supabase/client';
import { getClientTenantContext } from '@/lib/settings/client-context';

interface LostReasonOption {
  id: string;
  name: string;
}

interface DealActionsPanelProps {
  dealId: string;
  personId: string;
  status: string;
  lostReasons: LostReasonOption[];
  interestProfileId?: string | null;
  initialInterest?: {
    brand: string;
    model: string;
    version: string;
    yearMin: string;
    yearMax: string;
    priceMin: string;
    priceMax: string;
    notes: string;
  };
}

export function DealActionsPanel({
  dealId,
  personId,
  status,
  lostReasons,
  interestProfileId,
  initialInterest,
}: DealActionsPanelProps) {
  const supabase = createClient();
  const [showLostModal, setShowLostModal] = useState(false);
  const [lostReasonId, setLostReasonId] = useState(lostReasons[0]?.id ?? '');
  const [justification, setJustification] = useState('');
  const [nextActionAt, setNextActionAt] = useState('');
  const [nextActionNote, setNextActionNote] = useState('');
  const [negotiationNote, setNegotiationNote] = useState('');
  const [brand, setBrand] = useState(initialInterest?.brand ?? '');
  const [model, setModel] = useState(initialInterest?.model ?? '');
  const [version, setVersion] = useState(initialInterest?.version ?? '');
  const [yearMin, setYearMin] = useState(initialInterest?.yearMin ?? '');
  const [yearMax, setYearMax] = useState(initialInterest?.yearMax ?? '');
  const [priceMin, setPriceMin] = useState(initialInterest?.priceMin ?? '');
  const [priceMax, setPriceMax] = useState(initialInterest?.priceMax ?? '');
  const [interestNotes, setInterestNotes] = useState(initialInterest?.notes ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const runAction = useCallback(
    async (action: () => Promise<void>) => {
      setLoading(true);
      setError(null);
      setSuccess(null);
      try {
        await action();
        setSuccess('Salvo com sucesso.');
        window.location.reload();
      } catch (actionError) {
        setError(actionError instanceof Error ? actionError.message : 'Erro ao salvar.');
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const handleLostSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      await runAction(async () => {
        const context = await getClientTenantContext(supabase);
        if (!context) throw new Error('Sessão inválida.');
        await closeLostDeal(supabase, {
          tenantId: context.tenantId,
          userId: context.userId,
          dealId,
          lostReasonId,
          justification,
        });
      });
    },
    [dealId, justification, lostReasonId, runAction, supabase],
  );

  const handleNextAction = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      await runAction(async () => {
        const context = await getClientTenantContext(supabase);
        if (!context) throw new Error('Sessão inválida.');
        await setDealNextAction(supabase, {
          tenantId: context.tenantId,
          userId: context.userId,
          dealId,
          nextActionAt,
          nextActionNote,
        });
      });
    },
    [dealId, nextActionAt, nextActionNote, runAction, supabase],
  );

  const handleInterest = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      await runAction(async () => {
        const context = await getClientTenantContext(supabase);
        if (!context) throw new Error('Sessão inválida.');
        const interest = await upsertDealInterest(supabase, {
          tenantId: context.tenantId,
          userId: context.userId,
          dealId,
          personId,
          brand: brand || undefined,
          model: model || undefined,
          version: version || undefined,
          yearMin: yearMin ? Number(yearMin) : undefined,
          yearMax: yearMax ? Number(yearMax) : undefined,
          priceMin: priceMin ? Number(priceMin) : undefined,
          priceMax: priceMax ? Number(priceMax) : undefined,
          notes: interestNotes || undefined,
        });
        await addToDemandQueue(supabase, {
          tenantId: context.tenantId,
          userId: context.userId,
          personId,
          dealId,
          interestProfileId: interestProfileId ?? (interest as { id: string }).id,
        });
      });
    },
    [
      brand,
      dealId,
      interestNotes,
      interestProfileId,
      model,
      personId,
      priceMax,
      priceMin,
      runAction,
      supabase,
      version,
      yearMax,
      yearMin,
    ],
  );

  const handleNote = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      await runAction(async () => {
        const context = await getClientTenantContext(supabase);
        if (!context) throw new Error('Sessão inválida.');
        await addNegotiationNote(supabase, {
          tenantId: context.tenantId,
          userId: context.userId,
          dealId,
          note: negotiationNote,
        });
      });
    },
    [dealId, negotiationNote, runAction, supabase],
  );

  const isClosed = status === 'closed_lost' || status === 'closed_won' || status === 'reserved';

  return (
    <>
      {error ? <div className="alert alert-danger py-2">{error}</div> : null}
      {success ? <div className="alert alert-success py-2">{success}</div> : null}

      {!isClosed ? (
        <div className="d-flex gap-2 mb-3">
          <button type="button" className="btn btn-danger btn-sm" onClick={() => setShowLostModal(true)}>
            Marcar venda perdida
          </button>
        </div>
      ) : null}

      <form onSubmit={handleNextAction} className="mb-3">
        <h6 className="mb-2">Próxima ação</h6>
        <div className="row">
          <div className="col-md-4 mb-2">
            <input
              type="datetime-local"
              className="form-control form-control-sm"
              value={nextActionAt}
              onChange={(event) => setNextActionAt(event.target.value)}
              required
            />
          </div>
          <div className="col-md-6 mb-2">
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Descrição da ação"
              value={nextActionNote}
              onChange={(event) => setNextActionNote(event.target.value)}
              required
            />
          </div>
          <div className="col-md-2 mb-2">
            <button type="submit" className="btn btn-primary btn-sm w-100" disabled={loading}>
              Salvar
            </button>
          </div>
        </div>
      </form>

      <form onSubmit={handleInterest} className="mb-3">
        <h6 className="mb-2">Interesse / Fila demanda</h6>
        <div className="row">
          <div className="col-md-3 mb-2">
            <input type="text" className="form-control form-control-sm" placeholder="Marca" value={brand} onChange={(e) => setBrand(e.target.value)} />
          </div>
          <div className="col-md-3 mb-2">
            <input type="text" className="form-control form-control-sm" placeholder="Modelo" value={model} onChange={(e) => setModel(e.target.value)} />
          </div>
          <div className="col-md-3 mb-2">
            <input type="text" className="form-control form-control-sm" placeholder="Versão" value={version} onChange={(e) => setVersion(e.target.value)} />
          </div>
          <div className="col-md-3 mb-2">
            <input type="number" className="form-control form-control-sm" placeholder="Ano min" value={yearMin} onChange={(e) => setYearMin(e.target.value)} />
          </div>
          <div className="col-md-3 mb-2">
            <input type="number" className="form-control form-control-sm" placeholder="Ano max" value={yearMax} onChange={(e) => setYearMax(e.target.value)} />
          </div>
          <div className="col-md-3 mb-2">
            <input type="number" className="form-control form-control-sm" placeholder="Preço min" value={priceMin} onChange={(e) => setPriceMin(e.target.value)} />
          </div>
          <div className="col-md-3 mb-2">
            <input type="number" className="form-control form-control-sm" placeholder="Preço max" value={priceMax} onChange={(e) => setPriceMax(e.target.value)} />
          </div>
          <div className="col-md-3 mb-2">
            <button type="submit" className="btn btn-light btn-sm w-100" disabled={loading}>
              Salvar e entrar na fila
            </button>
          </div>
          <div className="col-12 mb-2">
            <input type="text" className="form-control form-control-sm" placeholder="Observações" value={interestNotes} onChange={(e) => setInterestNotes(e.target.value)} />
          </div>
        </div>
      </form>

      <form onSubmit={handleNote}>
        <h6 className="mb-2">Anotação de negociação</h6>
        <div className="input-group">
          <input
            type="text"
            className="form-control form-control-sm"
            placeholder="Registrar conversa ou proposta"
            value={negotiationNote}
            onChange={(event) => setNegotiationNote(event.target.value)}
            required
          />
          <button type="submit" className="btn btn-light btn-sm" disabled={loading}>
            Registrar
          </button>
        </div>
      </form>

      <AnimatedModal open={showLostModal} onClose={() => setShowLostModal(false)} title="Venda perdida">
        <form onSubmit={handleLostSubmit}>
          <div className="mb-2">
            <select className="form-select form-select-sm" value={lostReasonId} onChange={(e) => setLostReasonId(e.target.value)} required>
              {lostReasons.map((reason) => (
                <option key={reason.id} value={reason.id}>{reason.name}</option>
              ))}
            </select>
          </div>
          <div className="mb-3">
            <textarea
              className="form-control form-control-sm"
              rows={3}
              placeholder="Justificativa obrigatória"
              value={justification}
              onChange={(event) => setJustification(event.target.value)}
              required
            />
          </div>
          <div className="d-flex justify-content-end gap-2">
            <button type="button" className="btn btn-light btn-sm" onClick={() => setShowLostModal(false)}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-danger btn-sm" disabled={loading}>
              Confirmar perda
            </button>
          </div>
        </form>
      </AnimatedModal>
    </>
  );
}
