export interface PortalIntegrationRow {
  id: string;
  portal_slug: string;
  portal_name: string;
  is_active: boolean;
  last_sync_at: string | null;
  sync_status: string;
  sync_message: string | null;
}

export interface PortalAdPassageJoin {
  id: string;
  passage_number: number;
  vehicles: PortalAdVehicleJoin | PortalAdVehicleJoin[] | null;
}

export interface PortalAdVehicleJoin {
  plate: string | null;
  vehicle_brands: { name: string } | { name: string }[] | null;
  vehicle_models: { name: string } | { name: string }[] | null;
}

export interface PortalAdIntegrationJoin {
  portal_name: string;
  portal_slug: string;
}

export interface PortalAdListRow {
  id: string;
  status: string;
  external_id: string | null;
  published_at: string | null;
  last_sync_at: string | null;
  sync_message: string | null;
  created_at: string;
  vehicle_passages: PortalAdPassageJoin | PortalAdPassageJoin[] | null;
  portal_integrations: PortalAdIntegrationJoin | PortalAdIntegrationJoin[] | null;
}

export interface PortalAdTableRow extends Record<string, unknown> {
  id: string;
  portalName: string;
  plate: string;
  vehicleLabel: string;
  passageHref: string;
  status: string;
  externalId: string;
  publishedAt: string;
  lastSyncAt: string;
  syncMessage: string;
}

export function joinOne<T>(value: T | T[] | null): T | null {
  if (!value) return null;
  return Array.isArray(value) ? value[0] ?? null : value;
}

export function formatSyncStatus(status: string): string {
  const map: Record<string, string> = {
    idle: 'Ocioso',
    syncing: 'Sincronizando',
    success: 'Sucesso',
    error: 'Erro',
  };
  return map[status] ?? status;
}

export function formatAdStatus(status: string): string {
  const map: Record<string, string> = {
    pending: 'Pendente',
    published: 'Publicado',
    paused: 'Pausado',
    error: 'Erro',
    removed: 'Removido',
  };
  return map[status] ?? status;
}

export function getAdStatusBadgeClass(status: string): string {
  if (status === 'published') return 'bg-soft-success';
  if (status === 'error') return 'bg-soft-danger';
  if (status === 'pending') return 'bg-soft-warning';
  return 'bg-soft-secondary';
}
