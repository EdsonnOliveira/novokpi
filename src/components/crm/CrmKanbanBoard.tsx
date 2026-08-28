'use client';

import { EmptyState } from '@/components/dastone/EmptyState';

import Link from 'next/link';
import { useCallback, useMemo, useState } from 'react';
import {
  formatDealNumber,
  getActivityProgressPercent,
  getDealPriorityBadge,
  getUserInitials,
  type KanbanDealCard,
  type KanbanStageColumn,
} from '@/lib/crm/kanban';
import { updateDealStage } from '@/lib/crm/deals';
import { createClient } from '@/lib/supabase/client';
import { getClientTenantContext } from '@/lib/settings/client-context';

interface CrmKanbanBoardProps {
  stages: KanbanStageColumn[];
  deals: KanbanDealCard[];
}

export function CrmKanbanBoard({ stages, deals }: CrmKanbanBoardProps) {
  const supabase = createClient();
  const [items, setItems] = useState(deals);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const dealsByStage = useMemo(() => {
    const map = new Map<string, KanbanDealCard[]>();
    stages.forEach((stage) => map.set(stage.id, []));
    items.forEach((deal) => {
      const list = map.get(deal.stageId);
      if (list) {
        list.push(deal);
      }
    });
    return map;
  }, [items, stages]);

  const handleDrop = useCallback(
    async (stageId: string, dealId: string) => {
      setError(null);
      const previous = items;
      setItems((current) =>
        current.map((deal) => (deal.id === dealId ? { ...deal, stageId } : deal)),
      );

      try {
        const context = await getClientTenantContext(supabase);
        if (!context) {
          throw new Error('Sessão inválida.');
        }
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
      <div className="kanban-board">
        {stages.map((stage) => {
          const stageDeals = dealsByStage.get(stage.id) ?? [];
          const pendingTotal = stageDeals.reduce((sum, deal) => sum + deal.pendingActivities, 0);

          return (
            <div
              key={stage.id}
              className="kanban-col"
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                const dealId = event.dataTransfer.getData('text/deal-id') || draggingId;
                if (dealId) {
                  handleDrop(stage.id, dealId);
                }
              }}
            >
              <div className="my-3">
                <div
                  className={`d-flex justify-content-between align-items-center border-bottom ${stage.borderClass}`}
                >
                  <div>
                    <h6 className="fw-semibold fs-16 text-muted mb-1">{stage.name}</h6>
                    <h6 className="fs-13 fw-semibold mb-0">
                      {stageDeals.length} {stageDeals.length === 1 ? 'ficha' : 'fichas'}
                      {pendingTotal ? (
                        <>
                          {' '}
                          — <span className="text-muted">{pendingTotal} pendências</span>
                        </>
                      ) : null}
                    </h6>
                  </div>
                  <div>
                    <Link
                      href="/crm/new"
                      className="text-secondary me-1 add-btn cursor-pointer"
                      title="Nova ficha"
                    >
                      <i className="iconoir-plus fs-18" />
                    </Link>
                  </div>
                </div>
              </div>

              <div className="pt-1">
                {stageDeals.length ? (
                  stageDeals.map((deal) => (
                    <KanbanDealCardItem
                      key={deal.id}
                      deal={deal}
                      onDragStart={(dealId) => setDraggingId(dealId)}
                      onDragEnd={() => setDraggingId(null)}
                    />
                  ))
                ) : (
                  <EmptyState
                    title="Nenhuma ficha nesta etapa."
                    icon="iconoir-page"
                    compact
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

interface KanbanDealCardItemProps {
  deal: KanbanDealCard;
  onDragStart: (dealId: string) => void;
  onDragEnd: () => void;
}

function KanbanDealCardItem({ deal, onDragStart, onDragEnd }: KanbanDealCardItemProps) {
  const priority = getDealPriorityBadge(deal);
  const progress = getActivityProgressPercent(deal.completedActivities, deal.totalActivities);
  const cardTitle = deal.personName ?? deal.title ?? formatDealNumber(deal.dealNumber);
  const description =
    deal.nextActionNote ??
    (deal.channelName ? `Canal: ${deal.channelName}` : 'Sem próxima ação registrada.');

  return (
    <div
      className="card mb-3 kanban-deal-card"
      draggable
      onDragStart={(event) => {
        onDragStart(deal.id);
        event.dataTransfer.setData('text/deal-id', deal.id);
        event.dataTransfer.effectAllowed = 'move';
      }}
      onDragEnd={onDragEnd}
    >
      <div className="card-body">
        <div className="dropdown d-inline-block float-end">
          <a
            className="dropdown-toggle arrow-none text-secondary"
            data-bs-toggle="dropdown"
            href={`#kanban-deal-${deal.id}`}
            role="button"
            aria-haspopup="false"
            aria-expanded="false"
            onClick={(event) => event.preventDefault()}
          >
            <i className="iconoir-more-horiz fs-18" />
          </a>
          <div className="dropdown-menu dropdown-menu-end">
            <Link className="dropdown-item" href={`/crm/${deal.id}`}>
              <i className="iconoir-open-in-window fs-16 me-1 align-text-bottom" />
              Abrir ficha
            </Link>
          </div>
        </div>

        <span className={`badge rounded fw-normal px-1 mb-1 ${priority.className}`}>
          {priority.label}
        </span>
        <h5 className="my-2 fs-14">
          <Link href={`/crm/${deal.id}`} className="text-body text-decoration-none">
            {cardTitle}
          </Link>
        </h5>
        <p className="text-muted mb-2 text-truncate">{description}</p>
        <p className="text-muted mb-3 fs-12">{formatDealNumber(deal.dealNumber)}</p>

        {deal.channelName ? (
          <div className="mb-2">
            <span className="badge rounded text-primary bg-primary-subtle fw-normal px-1 mb-1">
              {deal.channelName}
            </span>
          </div>
        ) : null}

        {deal.totalActivities > 0 ? (
          <>
            <div className="d-flex justify-content-between fw-semibold align-items-center">
              <p className="mb-1 d-inline-flex align-items-center">
                <i className="iconoir-task-list fs-18 text-muted me-1" />
                {deal.completedActivities}/{deal.totalActivities} Atividades
              </p>
              <small className="text-end text-body-emphasis d-block ms-auto">{progress}%</small>
            </div>
            <div className="progress bg-secondary-subtle" style={{ height: 3 }}>
              <div
                className="progress-bar bg-secondary rounded-pill"
                role="progressbar"
                style={{ width: `${progress}%` }}
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
            <hr className="hr-dashed" />
          </>
        ) : (
          <hr className="hr-dashed" />
        )}

        <div className="row justify-content-center">
          <div className="col-auto align-self-center">
            <ul className="list-inline mb-0">
              <li className="list-item d-inline-block me-2">
                <Link href={`/crm/${deal.id}`} className="text-decoration-none">
                  <i className="iconoir-task-list text-muted" />
                  <span className="text-muted fw-bold">
                    {deal.pendingActivities}/{deal.totalActivities || 0} Tarefas
                  </span>
                </Link>
              </li>
              <li className="list-item d-inline-block">
                <Link href={`/crm/${deal.id}`} className="text-decoration-none">
                  <i className="iconoir-message-text text-muted" />
                  <span className="text-muted fw-bold">{deal.timelineCount} Eventos</span>
                </Link>
              </li>
            </ul>
          </div>
          {deal.assignedUserName ? (
            <div className="col align-self-center">
              <div className="img-group d-flex justify-content-end">
                <span
                  className="user-avatar thumb-sm shadow-sm rounded-circle bg-primary-subtle text-primary d-inline-flex align-items-center justify-content-center fw-semibold"
                  title={deal.assignedUserName}
                >
                  {getUserInitials(deal.assignedUserName)}
                </span>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
