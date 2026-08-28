import Link from 'next/link';
import { Card } from '@/components/dastone/Card';
import { EmptyState } from '@/components/dastone/EmptyState';

export interface KpiItem {
  id: string;
  label: string;
  value: string | number;
  href?: string;
  subtitle?: string;
  suffix?: string;
  badgeClass?: string;
  icon?: string;
  iconBgClass?: string;
  iconColorClass?: string;
  progress?: number;
  variant?: 'default' | 'social' | 'stat';
  empty?: boolean;
  emptyTitle?: string;
  emptyIcon?: string;
  emptyActionLabel?: string;
  emptyActionHref?: string;
}

interface KpiGridProps {
  items: KpiItem[];
  columns?: 2 | 3 | 4;
}

function renderValue(item: KpiItem) {
  if (item.href) {
    return (
      <Link href={item.href} className="text-decoration-none text-dark">
        {item.value}
      </Link>
    );
  }

  return item.value;
}

function SocialKpiCard({ item }: { item: KpiItem }) {
  return (
    <div className="card h-100">
      <div className="card-body">
        {item.empty ? (
          <EmptyState
            title={item.emptyTitle ?? 'Sem dados no período.'}
            icon={item.emptyIcon ?? 'iconoir-empty-page'}
            actionLabel={item.emptyActionLabel}
            actionHref={item.emptyActionHref}
            compact
          />
        ) : (
          <div className="row d-flex justify-content-center">
            <div className="col-9">
              <p className="text-dark mb-0 fw-semibold">{item.label}</p>
              <h3 className={`mt-2 mb-0 fs-20 ${item.badgeClass ?? ''}`}>
                {renderValue(item)}
                {item.suffix ? (
                  <span className="fs-13 text-muted fw-medium"> {item.suffix}</span>
                ) : null}
              </h3>
              {item.subtitle ? <p className="text-muted small mb-0 mt-1">{item.subtitle}</p> : null}
            </div>
            {item.icon ? (
              <div className="col-3 align-self-center">
                <div
                  className={`d-flex justify-content-center align-items-center thumb-lg ${item.iconBgClass ?? 'bg-soft-primary'} rounded-circle mx-auto`}
                >
                  <i
                    className={`${item.icon} align-self-center mb-0 ${item.iconColorClass ?? 'text-primary'}`}
                    aria-hidden="true"
                  />
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}

function StatKpiCard({ item }: { item: KpiItem }) {
  const progress = Math.max(0, Math.min(100, item.progress ?? 0));

  return (
    <div className="card mb-3 mb-lg-0 h-100">
      <div className="card-body text-center">
        {item.empty ? (
          <EmptyState
            title={item.emptyTitle ?? 'Sem dados.'}
            icon={item.emptyIcon ?? 'iconoir-empty-page'}
            compact
          />
        ) : (
          <>
            <span className={`fs-18 fw-semibold ${item.badgeClass ?? ''}`}>{renderValue(item)}</span>
            <h6 className="text-uppercase text-muted my-2 m-0">{item.label}</h6>
            <div className="d-flex align-items-center">
              <div className="progress bg-primary-subtle w-100 dashboard-kpi-progress" role="progressbar">
                <div className="progress-bar bg-primary" style={{ width: `${progress}%` }} />
              </div>
              <small className="flex-shrink-1 ms-1">{progress}%</small>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export function KpiGrid({ items, columns = 4 }: KpiGridProps) {
  const colClass =
    columns === 2 ? 'col-sm-6 col-lg-6' : columns === 3 ? 'col-sm-6 col-lg-4' : 'col-sm-6 col-lg-3';
  const isStat = items[0]?.variant === 'stat';

  return (
    <div className={`row mb-3 animate-stagger ${isStat ? 'g-3 flex-grow-1 w-100' : 'g-2 g-md-3'}`}>
      {items.map((item, index) => (
        <div
          key={item.id}
          className={`${isStat ? 'col-md-6 col-lg-6' : `col-12 ${colClass}`} d-flex`}
        >
          {item.variant === 'social' ? (
            <SocialKpiCard item={item} />
          ) : item.variant === 'stat' ? (
            <StatKpiCard item={item} />
          ) : (
            <Card animateDelay={index * 45} className="h-100 w-100">
              <p className="text-muted mb-1">{item.label}</p>
              {item.empty ? (
                <EmptyState
                  title={item.emptyTitle ?? 'Sem dados no período.'}
                  icon={item.emptyIcon ?? 'iconoir-empty-page'}
                  actionLabel={item.emptyActionLabel}
                  actionHref={item.emptyActionHref}
                  compact
                />
              ) : (
                <>
                  {item.href ? (
                    <Link href={item.href} className="text-decoration-none">
                      <h4 className={`mb-0 ${item.badgeClass ?? ''}`}>{item.value}</h4>
                    </Link>
                  ) : (
                    <h4 className={`mb-0 ${item.badgeClass ?? ''}`}>{item.value}</h4>
                  )}
                  <p className="text-muted mb-0 small mt-1 kpi-grid-subtitle">{item.subtitle ?? '\u00A0'}</p>
                </>
              )}
            </Card>
          )}
        </div>
      ))}
    </div>
  );
}
