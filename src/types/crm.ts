export interface DealPersonJoin {
  full_name: string;
  phone: string | null;
  email: string | null;
}

export interface DealStageJoin {
  name: string;
}

export interface DealChannelJoin {
  name: string;
}

export interface DealListRow {
  id: string;
  deal_number: number;
  title: string | null;
  status: string;
  is_duplicate_alert: boolean;
  next_action_at: string | null;
  created_at: string;
  people: DealPersonJoin | DealPersonJoin[] | null;
  deal_stages: DealStageJoin | DealStageJoin[] | null;
  channels: DealChannelJoin | DealChannelJoin[] | null;
}

export interface DemandQueuePersonJoin {
  full_name: string;
  phone: string | null;
  email: string | null;
}

export interface DemandQueueInterestJoin {
  brand: string | null;
  model: string | null;
  version: string | null;
  year_min: number | null;
  year_max: number | null;
  price_min: number | null;
  price_max: number | null;
}

export interface DemandQueueDealJoin {
  id: string;
  deal_number: number;
  title: string | null;
}

export interface DemandQueueListRow {
  id: string;
  status: string;
  created_at: string;
  people: DemandQueuePersonJoin | DemandQueuePersonJoin[] | null;
  interest_profiles: DemandQueueInterestJoin | DemandQueueInterestJoin[] | null;
  deals: DemandQueueDealJoin | DemandQueueDealJoin[] | null;
}

export interface DemandQueueTableRow extends Record<string, unknown> {
  id: string;
  clientName: string;
  contact: string;
  interestLabel: string;
  dealHref: string;
  dealNumber: string;
  status: string;
  createdAt: string;
}

export interface OfferQueueVehicleJoin {
  plate: string | null;
  color: string | null;
  year_model: number | null;
  vehicle_brands: { name: string } | { name: string }[] | null;
  vehicle_models: { name: string } | { name: string }[] | null;
  vehicle_versions: { name: string } | { name: string }[] | null;
}

export interface OfferQueueListRow {
  id: string;
  status: string;
  created_at: string;
  vehicles: OfferQueueVehicleJoin | OfferQueueVehicleJoin[] | null;
}

export interface OfferQueueTableRow extends Record<string, unknown> {
  id: string;
  plate: string;
  vehicleLabel: string;
  color: string;
  yearModel: string;
  status: string;
  createdAt: string;
}

export interface LostReasonJoin {
  id: string;
  name: string;
}

export interface LostDealListRow {
  id: string;
  deal_number: number;
  title: string | null;
  closed_at: string | null;
  created_at: string;
  people: DealPersonJoin | DealPersonJoin[] | null;
  lost_reasons: LostReasonJoin | LostReasonJoin[] | null;
  channels: DealChannelJoin | DealChannelJoin[] | null;
}

export interface LostDealTableRow extends Record<string, unknown> {
  id: string;
  dealNumber: string;
  dealHref: string;
  clientName: string;
  contact: string;
  lostReason: string;
  channel: string;
  closedAt: string;
}

export function joinOne<T>(value: T | T[] | null): T | null {
  if (!value) return null;
  return Array.isArray(value) ? value[0] ?? null : value;
}

export function formatDealNumber(value: number) {
  return `#${String(value).padStart(6, '0')}`;
}

export function formatQueueStatus(status: string): string {
  const map: Record<string, string> = {
    waiting: 'Aguardando',
    matched: 'Encontrado',
    closed: 'Encerrado',
    cancelled: 'Cancelado',
  };
  return map[status] ?? status;
}

export function formatInterestLabel(interest: DemandQueueInterestJoin | null): string {
  if (!interest) return '—';
  const vehicle = [interest.brand, interest.model, interest.version].filter(Boolean).join(' ');
  const years =
    interest.year_min || interest.year_max
      ? [interest.year_min, interest.year_max].filter(Boolean).join('–')
      : '';
  const parts = [vehicle, years].filter(Boolean);
  return parts.length ? parts.join(' · ') : '—';
}
