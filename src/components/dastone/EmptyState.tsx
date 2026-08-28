import Link from 'next/link';

interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  actionIcon?: string;
  icon?: string;
  compact?: boolean;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
  actionIcon = 'iconoir-plus',
  icon = 'iconoir-empty-page',
  compact = false,
}: EmptyStateProps) {
  return (
    <div className={`text-center animate-in ${compact ? 'py-3' : 'py-5'}`}>
      <div
        className={`empty-state-icon mx-auto mb-3 d-inline-flex align-items-center justify-content-center rounded-circle bg-primary-subtle text-primary ${
          compact ? 'empty-state-icon-sm' : ''
        }`}
      >
        <i className={icon} aria-hidden="true" />
      </div>
      <h5 className={`mb-2 ${compact ? 'fs-14 fw-semibold mb-1' : ''}`}>{title}</h5>
      {description ? <p className="text-muted mb-3">{description}</p> : null}
      {actionLabel && actionHref ? (
        <Link href={actionHref} className="btn btn-primary btn-sm">
          <i className={`${actionIcon} me-1`} aria-hidden="true" />
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}

interface TableEmptyRowProps extends EmptyStateProps {
  colSpan: number;
}

export function TableEmptyRow({ colSpan, ...props }: TableEmptyRowProps) {
  return (
    <tr>
      <td colSpan={colSpan} className="border-0">
        <EmptyState {...props} compact />
      </td>
    </tr>
  );
}
