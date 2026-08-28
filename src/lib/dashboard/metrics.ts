import { getStockAgeDays } from '@/types/inventory';

export function getMonthStartIso() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
}

export function getMonthStartDate() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
}

export function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

export function sumNumbers(values: Array<number | null | undefined>) {
  return values.reduce<number>((sum, value) => sum + Number(value ?? 0), 0);
}

export function averageNumbers(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export interface StockAgingBuckets {
  upTo30: number;
  from31To60: number;
  from61To90: number;
  above90: number;
}

export function buildStockAgingBuckets(
  passages: Array<{ stock_started_at: string; status: string }>,
): StockAgingBuckets {
  const buckets: StockAgingBuckets = {
    upTo30: 0,
    from31To60: 0,
    from61To90: 0,
    above90: 0,
  };

  passages
    .filter((passage) => ['in_stock', 'reserved', 'temporarily_out'].includes(passage.status))
    .forEach((passage) => {
      const days = getStockAgeDays(passage.stock_started_at);
      if (days <= 30) buckets.upTo30 += 1;
      else if (days <= 60) buckets.from31To60 += 1;
      else if (days <= 90) buckets.from61To90 += 1;
      else buckets.above90 += 1;
    });

  return buckets;
}

export function buildAverageStockDays(
  passages: Array<{ stock_started_at: string; status: string }>,
) {
  const inStock = passages.filter((passage) => passage.status === 'in_stock');
  if (!inStock.length) return 0;
  return averageNumbers(inStock.map((passage) => getStockAgeDays(passage.stock_started_at)));
}

export interface ChannelMetric {
  channelId: string | null;
  channelName: string;
  salesCount: number;
  revenue: number;
}

export function buildChannelMetrics(
  orders: Array<{
    channel_id: string | null;
    total_value: number | null;
    channels: { name: string } | { name: string }[] | null;
  }>,
): ChannelMetric[] {
  const map = new Map<string, ChannelMetric>();

  orders.forEach((order) => {
    const channel = Array.isArray(order.channels) ? order.channels[0] : order.channels;
    const key = order.channel_id ?? 'none';
    const current = map.get(key) ?? {
      channelId: order.channel_id,
      channelName: channel?.name ?? 'Sem canal',
      salesCount: 0,
      revenue: 0,
    };
    current.salesCount += 1;
    current.revenue += Number(order.total_value ?? 0);
    map.set(key, current);
  });

  return [...map.values()].sort((a, b) => b.salesCount - a.salesCount);
}

export interface SellerMetric {
  sellerId: string | null;
  sellerName: string;
  salesCount: number;
  revenue: number;
  margin: number;
}

export function buildSellerMetrics(
  orders: Array<{
    seller_user_id: string | null;
    total_value: number | null;
    margin_value: number | null;
    profiles: { full_name: string } | { full_name: string }[] | null;
  }>,
): SellerMetric[] {
  const map = new Map<string, SellerMetric>();

  orders.forEach((order) => {
    const profile = Array.isArray(order.profiles) ? order.profiles[0] : order.profiles;
    const key = order.seller_user_id ?? 'none';
    const current = map.get(key) ?? {
      sellerId: order.seller_user_id,
      sellerName: profile?.full_name ?? 'Sem vendedor',
      salesCount: 0,
      revenue: 0,
      margin: 0,
    };
    current.salesCount += 1;
    current.revenue += Number(order.total_value ?? 0);
    current.margin += Number(order.margin_value ?? 0);
    map.set(key, current);
  });

  return [...map.values()].sort((a, b) => b.salesCount - a.salesCount);
}

export interface PortalAdStatusMetric {
  status: string;
  count: number;
}

export function buildPortalAdStatusMetrics(
  ads: Array<{ status: string }>,
): PortalAdStatusMetric[] {
  const map = new Map<string, number>();

  ads.forEach((ad) => {
    map.set(ad.status, (map.get(ad.status) ?? 0) + 1);
  });

  return [...map.entries()]
    .map(([status, count]) => ({ status, count }))
    .sort((a, b) => b.count - a.count);
}

export function countPassagesWithoutPublishedAds(
  passages: Array<{ id: string; status: string }>,
  publishedPassageIds: Set<string>,
) {
  return passages.filter(
    (passage) => passage.status === 'in_stock' && !publishedPassageIds.has(passage.id),
  ).length;
}

export function sumPendingOverdueAmount(
  transactions: Array<{
    transaction_type: string;
    amount: number | null;
    paid_amount: number | null;
  }>,
) {
  return transactions.reduce((sum, transaction) => {
    const remaining = Number(transaction.amount ?? 0) - Number(transaction.paid_amount ?? 0);
    return sum + Math.max(remaining, 0);
  }, 0);
}

export function formatPortalAdStatus(status: string) {
  const labels: Record<string, string> = {
    published: 'Publicado',
    pending: 'Pendente',
    error: 'Erro',
    paused: 'Pausado',
    not_selected: 'Não selecionado',
  };
  return labels[status] ?? status;
}

export interface DailySalesPoint {
  label: string;
  sales: number;
  revenue: number;
}

export function buildDailySalesSeries(
  orders: Array<{ closed_at: string | null; total_value: number | null }>,
): DailySalesPoint[] {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const map = new Map<string, DailySalesPoint>();

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, month, day);
    const key = date.toISOString().slice(0, 10);
    map.set(key, {
      label: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      sales: 0,
      revenue: 0,
    });
  }

  orders.forEach((order) => {
    if (!order.closed_at) return;
    const key = order.closed_at.slice(0, 10);
    const current = map.get(key);
    if (!current) return;
    current.sales += 1;
    current.revenue += Number(order.total_value ?? 0);
  });

  return [...map.values()];
}
