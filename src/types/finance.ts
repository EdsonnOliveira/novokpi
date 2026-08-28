export interface FinancialAccount {
  id: string;
  name: string;
  slug: string;
  account_type: string;
  initial_balance: number;
  current_balance: number;
  is_active: boolean;
}

export interface FinancialCategory {
  id: string;
  name: string;
  slug: string;
  transaction_type: string;
  dre_group: string | null;
}

export interface TransactionListRow {
  id: string;
  account_id: string;
  transaction_type: string;
  amount: number;
  paid_amount: number;
  description: string;
  transaction_date: string;
  due_date: string | null;
  paid_at: string | null;
  status: string;
  origin_label: string | null;
  financial_accounts: { name: string } | { name: string }[] | null;
  financial_categories: { name: string; dre_group: string | null } | { name: string; dre_group: string | null }[] | null;
}

export interface DispatcherRecordRow {
  id: string;
  purpose: string;
  advance_received: number;
  costs_paid: number;
  balance: number;
  revenue_recognized: number;
  status: string;
  created_at: string;
  people: { full_name: string } | { full_name: string }[] | null;
  orders: { order_number: number } | { order_number: number }[] | null;
}

export interface DreMonthRow {
  month: number;
  revenue: number;
  vehicleCost: number;
  financing: number;
  dispatcher: number;
  insurance: number;
  consortium: number;
  accessories: number;
  otherIncome: number;
  salesExpense: number;
  payroll: number;
  marketing: number;
  taxes: number;
  administrative: number;
  otherExpense: number;
}

export function joinOne<T>(value: T | T[] | null): T | null {
  if (!value) return null;
  return Array.isArray(value) ? value[0] ?? null : value;
}

export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—';
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function formatTransactionStatus(status: string): string {
  const labels: Record<string, string> = {
    pending: 'Pendente',
    paid: 'Pago',
    partial: 'Parcial',
    cancelled: 'Cancelado',
    reversed: 'Estornado',
  };
  return labels[status] ?? status;
}

export function formatAccountType(type: string): string {
  const labels: Record<string, string> = {
    bank: 'Banco',
    cash: 'Caixa',
    wallet: 'Carteira',
  };
  return labels[type] ?? type;
}

export const MONTH_LABELS = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
];

export const DRE_ROWS = [
  { key: 'revenue', label: 'Receita / Faturamento', type: 'income' as const },
  { key: 'vehicle_cost', label: '(-) Custo veículos vendidos', type: 'expense' as const },
  { key: 'financing', label: '(+) Financiamento', type: 'income' as const },
  { key: 'dispatcher', label: '(+) Despachante', type: 'mixed' as const },
  { key: 'insurance', label: '(+) Seguro', type: 'income' as const },
  { key: 'consortium', label: '(+) Consórcio', type: 'income' as const },
  { key: 'accessories', label: '(+) Acessórios', type: 'income' as const },
  { key: 'other_income', label: '(+) Outras receitas', type: 'income' as const },
  { key: 'sales_expense', label: '(-) Despesas de vendas', type: 'expense' as const },
  { key: 'payroll', label: '(-) Pessoal', type: 'expense' as const },
  { key: 'marketing', label: '(-) Marketing', type: 'expense' as const },
  { key: 'taxes', label: '(-) Impostos', type: 'expense' as const },
  { key: 'administrative', label: '(-) Administrativas', type: 'expense' as const },
  { key: 'other_expense', label: '(-) Outras despesas', type: 'expense' as const },
];

export function calcOperatingResult(row: DreMonthRow): number {
  return (
    row.revenue +
    row.financing +
    row.dispatcher +
    row.insurance +
    row.consortium +
    row.accessories +
    row.otherIncome -
    row.vehicleCost -
    row.salesExpense -
    row.payroll -
    row.marketing -
    row.taxes -
    row.administrative -
    row.otherExpense
  );
}

export function calcGrossProfit(row: DreMonthRow): number {
  return row.revenue - row.vehicleCost;
}
