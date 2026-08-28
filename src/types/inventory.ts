export interface VehicleBrandJoin {
  name: string;
}

export interface VehicleModelJoin {
  name: string;
}

export interface VehicleVersionJoin {
  name: string;
}

export interface PersonJoin {
  full_name: string;
}

export interface ProfileJoin {
  full_name: string | null;
}

export interface ModalityJoin {
  name: string;
  slug: string;
}

export interface VehicleJoin {
  plate: string | null;
  color: string | null;
  year_manufacture: number | null;
  year_model: number | null;
  vehicle_brands: VehicleBrandJoin | VehicleBrandJoin[] | null;
  vehicle_models: VehicleModelJoin | VehicleModelJoin[] | null;
  vehicle_versions: VehicleVersionJoin | VehicleVersionJoin[] | null;
}

export interface PassageListRow {
  id: string;
  passage_number: number;
  status: string;
  stock_started_at: string;
  cost: number;
  sale_price: number | null;
  km: number | null;
  has_history_alert: boolean;
  vehicles: VehicleJoin | VehicleJoin[] | null;
  stock_modalities: ModalityJoin | ModalityJoin[] | null;
  people: PersonJoin | PersonJoin[] | null;
  profiles: ProfileJoin | ProfileJoin[] | null;
}

export interface TaxonomyBrand {
  id: string;
  name: string;
}

export interface TaxonomyModel {
  id: string;
  brand_id: string;
  name: string;
}

export interface TaxonomyVersion {
  id: string;
  model_id: string;
  name: string;
}

export interface StockModality {
  id: string;
  name: string;
  slug: string;
}

export interface EvaluationListRow {
  id: string;
  plate: string | null;
  year_model: number | null;
  km: number | null;
  color: string | null;
  fipe_value: number | null;
  offered_value: number | null;
  status: string;
  created_at: string;
  vehicle_brands: VehicleBrandJoin | VehicleBrandJoin[] | null;
  vehicle_models: VehicleModelJoin | VehicleModelJoin[] | null;
  vehicle_versions: VehicleVersionJoin | VehicleVersionJoin[] | null;
  people: PersonJoin | PersonJoin[] | null;
}

export function joinOne<T>(value: T | T[] | null): T | null {
  if (!value) return null;
  return Array.isArray(value) ? value[0] ?? null : value;
}

export function getStockAgeDays(stockStartedAt: string): number {
  const start = new Date(stockStartedAt);
  const now = new Date();
  const diff = now.getTime() - start.getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

export function getStockAgeClass(days: number): string {
  if (days <= 30) return 'text-success';
  if (days <= 60) return 'text-warning';
  return 'text-danger';
}

export function getStockAgeBadgeClass(days: number): string {
  if (days <= 30) return 'bg-soft-success';
  if (days <= 60) return 'bg-soft-warning';
  return 'bg-soft-danger';
}

export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—';
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function calcMarginPercent(cost: number, salePrice: number | null): number | null {
  if (!salePrice || salePrice <= 0) return null;
  return ((salePrice - cost) / salePrice) * 100;
}

export function formatMargin(cost: number, salePrice: number | null): string {
  const margin = calcMarginPercent(cost, salePrice);
  if (margin === null) return '—';
  return `${margin.toFixed(1)}%`;
}
