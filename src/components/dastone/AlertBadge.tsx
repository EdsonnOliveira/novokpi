type AlertLevel = 'info' | 'warning' | 'overdue' | 'danger';

interface AlertBadgeProps {
  level: AlertLevel;
  label: string;
}

const levelClass: Record<AlertLevel, string> = {
  info: 'bg-soft-info',
  warning: 'bg-soft-warning',
  overdue: 'bg-soft-danger',
  danger: 'bg-soft-danger',
};

export function AlertBadge({ level, label }: AlertBadgeProps) {
  return <span className={`badge ${levelClass[level]}`}>{label}</span>;
}
