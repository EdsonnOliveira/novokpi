import { EmptyState } from '@/components/dastone/EmptyState';

export interface TimelineEventItem {
  id: string;
  title: string;
  description?: string | null;
  eventType: string;
  occurredAt: string;
  userName?: string | null;
}

interface TimelinePanelProps {
  events: TimelineEventItem[];
  emptyTitle?: string;
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function TimelinePanel({ events, emptyTitle = 'Nenhum evento na timeline' }: TimelinePanelProps) {
  if (!events.length) {
    return <EmptyState title={emptyTitle} icon="iconoir-clock-rotate-right" />;
  }

  return (
    <div className="timeline">
      {events.map((event) => (
        <div key={event.id} className="d-flex mb-3 pb-3 border-bottom">
          <div className="me-3">
            <span className="badge bg-soft-primary">{event.eventType}</span>
          </div>
          <div className="flex-grow-1">
            <div className="d-flex justify-content-between align-items-start">
              <h6 className="mb-1">{event.title}</h6>
              <small className="text-muted">{formatDateTime(event.occurredAt)}</small>
            </div>
            {event.description ? <p className="text-muted mb-1">{event.description}</p> : null}
            {event.userName ? <small className="text-muted">por {event.userName}</small> : null}
          </div>
        </div>
      ))}
    </div>
  );
}
