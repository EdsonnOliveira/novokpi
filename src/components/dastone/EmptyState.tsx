import Link from 'next/link';

interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  icon?: string;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
  icon = 'iconoir-empty-page',
}: EmptyStateProps) {
  return (
    <div className="text-center py-5 animate-in">
      <i className={`${icon} display-4 text-muted mb-3 d-block`} />
      <h5 className="mb-2">{title}</h5>
      {description ? <p className="text-muted mb-3">{description}</p> : null}
      {actionLabel && actionHref ? (
        <Link href={actionHref} className="btn btn-primary btn-sm">
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
