import {
  getActiveStatusBadgeClass,
  getStatusBadgeClass,
  getValueBadgeClass,
  type ValueBadgeVariant,
} from '@/lib/ui/table-badges';

interface StatusBadgeProps {
  label: string;
  status?: string;
  active?: boolean;
}

export function StatusBadge({ label, status, active }: StatusBadgeProps) {
  const className =
    active !== undefined
      ? getActiveStatusBadgeClass(active)
      : getStatusBadgeClass(status ?? label);

  return <span className={`badge ${className}`}>{label}</span>;
}

interface ValueBadgeProps {
  value: number | null | undefined;
  formatted: string;
  variant?: ValueBadgeVariant;
}

export function ValueBadge({ value, formatted, variant = 'default' }: ValueBadgeProps) {
  if (formatted === '—') return <span className="text-muted">—</span>;

  return (
    <span className={`badge ${getValueBadgeClass(value ?? 0, variant)}`}>{formatted}</span>
  );
}
