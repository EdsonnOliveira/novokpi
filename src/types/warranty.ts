export interface WarrantyPersonJoin {
  full_name: string;
}

export interface WarrantyPassageJoin {
  id: string;
  passage_number: number;
  vehicles: WarrantyVehicleJoin | WarrantyVehicleJoin[] | null;
}

export interface WarrantyVehicleJoin {
  plate: string | null;
}

export interface WarrantyProfileJoin {
  full_name: string | null;
}

export interface WarrantyCaseListRow {
  id: string;
  title: string;
  description: string | null;
  status: string;
  opened_at: string;
  resolved_at: string | null;
  created_at: string;
  people: WarrantyPersonJoin | WarrantyPersonJoin[] | null;
  vehicle_passages: WarrantyPassageJoin | WarrantyPassageJoin[] | null;
  profiles: WarrantyProfileJoin | WarrantyProfileJoin[] | null;
}

export interface WarrantyCaseTableRow extends Record<string, unknown> {
  id: string;
  title: string;
  clientName: string;
  plate: string;
  passageHref: string;
  status: string;
  assignedTo: string;
  openedAt: string;
  resolvedAt: string;
}

export function joinOne<T>(value: T | T[] | null): T | null {
  if (!value) return null;
  return Array.isArray(value) ? value[0] ?? null : value;
}

export function formatWarrantyStatus(status: string): string {
  const map: Record<string, string> = {
    open: 'Aberto',
    in_progress: 'Em andamento',
    resolved: 'Resolvido',
    closed: 'Encerrado',
  };
  return map[status] ?? status;
}

export function getWarrantyStatusBadgeClass(status: string): string {
  if (status === 'resolved' || status === 'closed') return 'bg-soft-success';
  if (status === 'in_progress') return 'bg-soft-warning';
  return 'bg-soft-danger';
}
