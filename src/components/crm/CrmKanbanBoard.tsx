'use client';

import Link from 'next/link';
import { useCallback, useState } from 'react';
import { Card } from '@/components/dastone/Card';
import { updateDealStage } from '@/lib/crm/deals';
import { createClient } from '@/lib/supabase/client';
import { getClientTenantContext } from '@/lib/settings/client-context';

interface KanbanDeal {
  id: string;
  dealNumber: number;
  title: string | null;
  personName: string | null;
  stageId: string;
}

interface KanbanStage {
  id: string;
  name: string;
}

interface CrmKanbanBoardProps {
  stages: KanbanStage[];
  deals: KanbanDeal[];
}

function formatDealNumber(value: number) {
  return `#${String(value).padStart(6, '0')}`;
}

export function CrmKanbanBoard({ stages, deals }: CrmKanbanBoardProps) {
  const supabase = createClient();
  const [items, setItems] = useState(deals);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDrop = useCallback(
    async (stageId: string, dealId: string) => {
      setError(null);
      const previous = items;
      setItems((current) =>
        current.map((deal) => (deal.id === dealId ? { ...deal, stageId } : deal)),
      );

      try {
        const context = await getClientTenantContext(supabase);
      if (!context) throw new Error('Sessão inválida.');
        await updateDealStage(supabase, {
          tenantId: context.tenantId,
          userId: context.userId,
          dealId,
          stageId,
        });
      } catch (dropError) {
        setItems(previous);
        setError(dropError instanceof Error ? dropError.message : 'Erro ao mover ficha.');
      } finally {
        setDraggingId(null);
      }
    },
    [items, supabase],
  );

  return (
    <>
      {error ? <div className="alert alert-danger py-2">{error}</div> : null}
      <div className="row flex-nowrap overflow-auto pb-3 kanban-scroll g-3">
        {stages.map((stage) => {
          const stageDeals = items.filter((deal) => deal.stageId === stage.id);

          return (
            <div
              key={stage.id}
              className="col-12 col-sm-6 col-lg-4 col-xl-3 min-w-250 flex-shrink-0"
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                const dealId = event.dataTransfer.getData('text/deal-id') || draggingId;
                if (dealId) handleDrop(stage.id, dealId);
              }}
            >
              <Card title={stage.name}>
                <div className="d-flex flex-column gap-2">
                  {stageDeals.length ? (
                    stageDeals.map((deal) => (
                      <div
                        key={deal.id}
                        draggable
                        onDragStart={(event) => {
                          setDraggingId(deal.id);
                          event.dataTransfer.setData('text/deal-id', deal.id);
                        }}
                        className="border rounded p-2 bg-white"
                      >
                        <Link href={`/crm/${deal.id}`} className="text-decoration-none text-body">
                          <div className="fw-semibold">{formatDealNumber(deal.dealNumber)}</div>
                          <div className="small text-muted">
                            {deal.personName ?? deal.title ?? '—'}
                          </div>
                        </Link>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted small mb-0">Vazio</p>
                  )}
                </div>
              </Card>
            </div>
          );
        })}
      </div>
    </>
  );
}
