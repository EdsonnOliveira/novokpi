import type { ReportDefinition } from '@/types/platform';

export const REPORT_DEFINITIONS: ReportDefinition[] = [
  {
    id: 'crm-open',
    title: 'Fichas abertas',
    description: 'Negociações em andamento no CRM.',
    href: '/crm?status=open',
    exportLabel: 'Ver fichas abertas',
  },
  {
    id: 'crm-won',
    title: 'Vendas ganhas',
    description: 'Fichas fechadas como ganhas.',
    href: '/crm?status=closed_won',
    exportLabel: 'Ver vendas ganhas',
  },
  {
    id: 'inventory-stock',
    title: 'Veículos em estoque',
    description: 'Passagens disponíveis e reservadas.',
    href: '/inventory?status=in_stock',
    exportLabel: 'Ver estoque',
  },
  {
    id: 'inventory-report',
    title: 'Laudos cautelares',
    description: 'Laudos por veículo em estoque.',
    href: '/inventory/report',
    exportLabel: 'Ver laudos',
  },
  {
    id: 'orders-closed',
    title: 'Pedidos fechados',
    description: 'Reservas e vendas concluídas.',
    href: '/orders',
    exportLabel: 'Ver pedidos',
  },
  {
    id: 'finance-transactions',
    title: 'Lançamentos financeiros',
    description: 'Entradas, saídas e movimentações.',
    href: '/finance/transactions',
    exportLabel: 'Ver lançamentos',
  },
  {
    id: 'finance-dre',
    title: 'DRE',
    description: 'Demonstrativo de resultados.',
    href: '/finance/dre',
    exportLabel: 'Ver DRE',
  },
  {
    id: 'finance-cashflow',
    title: 'Fluxo de caixa',
    description: 'Projeção de entradas e saídas.',
    href: '/finance/cashflow',
    exportLabel: 'Ver fluxo de caixa',
  },
  {
    id: 'fiscal-documents',
    title: 'Notas fiscais',
    description: 'NF-e, NFS-e e documentos emitidos.',
    href: '/fiscal/documents',
    exportLabel: 'Ver notas',
  },
];
