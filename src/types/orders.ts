export interface PersonJoin {
  full_name: string;
}

export interface ProfileJoin {
  full_name: string | null;
}

export interface ChannelJoin {
  name: string;
}

export interface VehiclePassageJoin {
  id: string;
  sale_price: number | null;
  cost: number | null;
  vehicles: {
    plate: string | null;
    vehicle_brands: { name: string } | { name: string }[] | null;
    vehicle_models: { name: string } | { name: string }[] | null;
    vehicle_versions: { name: string } | { name: string }[] | null;
  } | {
    plate: string | null;
    vehicle_brands: { name: string } | { name: string }[] | null;
    vehicle_models: { name: string } | { name: string }[] | null;
    vehicle_versions: { name: string } | { name: string }[] | null;
  }[] | null;
}

export interface DealJoin {
  deal_number: number;
}

export interface OrderListRow {
  id: string;
  order_number: number;
  status: string;
  total_value: number | null;
  margin_value: number | null;
  margin_percent: number | null;
  primary_payment_method: string | null;
  invoice_status: string;
  delivery_status: string;
  transfer_status: string;
  closed_at: string | null;
  reserved_at: string | null;
  created_at: string;
  people: PersonJoin | PersonJoin[] | null;
  profiles: ProfileJoin | ProfileJoin[] | null;
  channels: ChannelJoin | ChannelJoin[] | null;
  vehicle_passages: VehiclePassageJoin | VehiclePassageJoin[] | null;
  deals: DealJoin | DealJoin[] | null;
}

export interface PaymentMethod {
  id: string;
  name: string;
  slug: string;
}

export interface ProductType {
  id: string;
  name: string;
  slug: string;
}

export interface OrderPaymentRow {
  id: string;
  payee_name: string | null;
  payee_document: string | null;
  payment_method_name: string | null;
  amount: number;
  due_date: string | null;
  paid_at: string | null;
  status: string;
}

export interface OrderProductRow {
  id: string;
  product_name: string;
  amount: number | null;
  commission: number | null;
  expected_receipt_at: string | null;
  received_at: string | null;
}

export interface DeliveryChecklistItem {
  id: string;
  item_key: string;
  item_label: string;
  is_checked: boolean;
  notes: string | null;
}

export interface DeliveryPendencyRow {
  id: string;
  title: string;
  description: string | null;
  is_resolved: boolean;
  created_at: string;
}

export interface TransferRow {
  id: string;
  status: string;
  atpv_done: boolean;
  signature_done: boolean;
  sale_communication_done: boolean;
  dispatcher_done: boolean;
  completed_at: string | null;
  deadline_at: string | null;
  third_party_name: string | null;
  profiles: ProfileJoin | ProfileJoin[] | null;
  orders: {
    id: string;
    order_number: number;
    people: PersonJoin | PersonJoin[] | null;
    vehicle_passages: VehiclePassageJoin | VehiclePassageJoin[] | null;
  } | {
    id: string;
    order_number: number;
    people: PersonJoin | PersonJoin[] | null;
    vehicle_passages: VehiclePassageJoin | VehiclePassageJoin[] | null;
  }[] | null;
}

export function joinOne<T>(value: T | T[] | null): T | null {
  if (!value) return null;
  return Array.isArray(value) ? value[0] ?? null : value;
}

export function formatOrderNumber(value: number): string {
  return `#${String(value).padStart(6, '0')}`;
}

export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—';
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function formatOrderStatus(status: string): string {
  const labels: Record<string, string> = {
    draft: 'Rascunho',
    reserved: 'Reservado',
    closed: 'Fechado',
    cancelled: 'Cancelado',
  };
  return labels[status] ?? status;
}

export function formatDeliveryStatus(status: string): string {
  const labels: Record<string, string> = {
    pending: 'Pendente',
    scheduled: 'Agendada',
    delivered: 'Entregue',
    cancelled: 'Cancelada',
  };
  return labels[status] ?? status;
}

export function formatTransferStatus(status: string): string {
  const labels: Record<string, string> = {
    pending: 'Pendente',
    in_progress: 'Em andamento',
    completed: 'Concluída',
    cancelled: 'Cancelada',
  };
  return labels[status] ?? status;
}

export const DEFAULT_CHECKLIST_ITEMS = [
  { key: 'manual', label: 'Manual' },
  { key: 'main_key', label: 'Chave principal' },
  { key: 'spare_key', label: 'Chave reserva' },
  { key: 'spare_tire', label: 'Estepe' },
  { key: 'jack', label: 'Macaco' },
  { key: 'triangle', label: 'Triângulo' },
  { key: 'tools', label: 'Ferramentas' },
  { key: 'documentation', label: 'Documentação' },
];

export function getVehicleLabel(passage: VehiclePassageJoin | null): string {
  if (!passage) return '—';
  const vehicle = joinOne(passage.vehicles);
  if (!vehicle) return '—';
  const brand = joinOne(vehicle.vehicle_brands);
  const model = joinOne(vehicle.vehicle_models);
  const version = joinOne(vehicle.vehicle_versions);
  const label = [brand?.name, model?.name, version?.name].filter(Boolean).join(' ');
  return vehicle.plate ? `${vehicle.plate} — ${label}` : label || '—';
}
