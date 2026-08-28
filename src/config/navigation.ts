export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon?: string;
  badge?: string;
  children?: NavItem[];
}

export const tenantNavigation: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/dashboard',
    icon: 'iconoir-view-grid',
  },
  {
    id: 'inventory',
    label: 'Estoque',
    href: '/inventory',
    icon: 'iconoir-car',
    children: [
      { id: 'inventory-table', label: 'Tabela', href: '/inventory' },
      { id: 'inventory-quick', label: 'Cadastro rápido', href: '/inventory/quick' },
      { id: 'inventory-timeline', label: 'Timeline veículo', href: '/inventory/timeline' },
      { id: 'inventory-preparation', label: 'Preparação/OS', href: '/inventory/preparation' },
      { id: 'inventory-photos', label: 'Fotos', href: '/inventory/photos' },
      { id: 'inventory-report', label: 'Laudo', href: '/inventory/report' },
      { id: 'inventory-temporary-exit', label: 'Saída temporária', href: '/inventory/temporary-exit' },
    ],
  },
  {
    id: 'integrator',
    label: 'Integrador',
    href: '/integrator',
    icon: 'iconoir-globe',
  },
  {
    id: 'crm',
    label: 'Leads / CRM',
    href: '/crm',
    icon: 'iconoir-user',
    children: [
      { id: 'crm-table', label: 'Tabela', href: '/crm' },
      { id: 'crm-kanban', label: 'Kanban', href: '/crm/kanban' },
      { id: 'crm-new-deal', label: 'Nova Ficha', href: '/crm/new' },
      { id: 'crm-people', label: 'Clientes', href: '/crm/people' },
      { id: 'crm-evaluation', label: 'Avaliação / Trade-in', href: '/crm/evaluation' },
      { id: 'crm-demand-queue', label: 'Fila demanda', href: '/crm/demand-queue' },
      { id: 'crm-offer-queue', label: 'Fila oferta', href: '/crm/offer-queue' },
      { id: 'crm-lost-sales', label: 'Vendas perdidas', href: '/crm/lost-sales' },
    ],
  },
  {
    id: 'agenda',
    label: 'Agenda',
    href: '/agenda',
    icon: 'iconoir-calendar',
  },
  {
    id: 'orders',
    label: 'Pedidos Fechados',
    href: '/orders',
    icon: 'iconoir-cart-alt',
    children: [
      { id: 'orders-closed', label: 'Negócios fechados', href: '/orders' },
      { id: 'orders-reservation', label: 'Reserva / Finalização', href: '/orders/reservation' },
      { id: 'orders-delivery', label: 'Entrega / Checklist', href: '/orders/delivery' },
      { id: 'orders-transfer', label: 'Transferência veicular', href: '/orders/transfer' },
      { id: 'orders-pending', label: 'Pendências da Entrega', href: '/orders/pending' },
    ],
  },
  {
    id: 'finance',
    label: 'Financeiro',
    href: '/finance',
    icon: 'iconoir-wallet',
    children: [
      { id: 'finance-overview', label: 'Visão geral', href: '/finance' },
      { id: 'finance-accounts', label: 'Contas financeiras', href: '/finance/accounts' },
      { id: 'finance-statement', label: 'Extrato', href: '/finance/statement' },
      { id: 'finance-cashflow', label: 'Fluxo de caixa', href: '/finance/cashflow' },
      { id: 'finance-transactions', label: 'Lançamentos', href: '/finance/transactions' },
      { id: 'finance-products', label: 'Produtos adicionais', href: '/finance/products' },
      { id: 'finance-dre', label: 'DRE', href: '/finance/dre' },
      { id: 'finance-dispatcher', label: 'Despachante', href: '/finance/dispatcher' },
      { id: 'finance-reconciliation', label: 'Conciliação', href: '/finance/reconciliation' },
    ],
  },
  {
    id: 'fiscal',
    label: 'Fiscal / Notas',
    href: '/fiscal',
    icon: 'iconoir-page',
    children: [
      { id: 'fiscal-overview', label: 'Visão geral', href: '/fiscal' },
      { id: 'fiscal-settings', label: 'Configuração', href: '/fiscal/settings' },
      { id: 'fiscal-documents', label: 'Documentos', href: '/fiscal/documents' },
      { id: 'fiscal-nfse', label: 'Emitir NFS-e', href: '/fiscal/nfse/new' },
      { id: 'fiscal-nfe', label: 'Emitir NF-e', href: '/fiscal/nfe/new' },
    ],
  },
  {
    id: 'documents',
    label: 'Formulários / Documentos',
    href: '/documents',
    icon: 'iconoir-page-search',
    children: [
      { id: 'documents-center', label: 'Central', href: '/documents' },
      { id: 'documents-generate', label: 'Gerar documento', href: '/documents/generate' },
      { id: 'documents-windshield', label: 'Para-brisa', href: '/documents/windshield' },
      { id: 'documents-deal-cover', label: 'Capa do Negócio', href: '/documents/deal-cover' },
    ],
  },
  {
    id: 'warranty',
    label: 'Garantia / Pós-venda',
    href: '/warranty',
    icon: 'iconoir-shield',
  },
  {
    id: 'marketing',
    label: 'Marketing',
    href: '/marketing',
    icon: 'iconoir-megaphone',
    children: [
      { id: 'marketing-campaigns', label: 'Campanhas', href: '/marketing' },
      { id: 'marketing-opportunities', label: 'Central de Oportunidades', href: '/marketing/opportunities' },
    ],
  },
  {
    id: 'reports',
    label: 'Relatórios',
    href: '/reports',
    icon: 'iconoir-stats-report',
  },
  {
    id: 'alerts',
    label: 'Alertas',
    href: '/alerts',
    icon: 'iconoir-bell',
  },
  {
    id: 'search',
    label: 'Busca global',
    href: '/search',
    icon: 'iconoir-search',
  },
  {
    id: 'ai',
    label: 'Assistente IA',
    href: '/ai',
    icon: 'iconoir-brain',
  },
  {
    id: 'site',
    label: 'Site da Loja',
    href: '/site',
    icon: 'iconoir-globe',
  },
  {
    id: 'help',
    label: 'Ajuda',
    href: '/help',
    icon: 'iconoir-book',
  },
  {
    id: 'settings',
    label: 'Configurações',
    href: '/settings',
    icon: 'iconoir-settings',
    children: [
      { id: 'settings-general', label: 'Geral', href: '/settings' },
      { id: 'settings-users', label: 'Usuários', href: '/settings/users' },
      { id: 'settings-roles', label: 'Perfis e permissões', href: '/settings/roles' },
      { id: 'settings-lost-reasons', label: 'Motivos venda perdida', href: '/settings/lost-reasons' },
      { id: 'settings-channels', label: 'Origens / Canais', href: '/settings/channels' },
      { id: 'settings-modalities', label: 'Modalidades', href: '/settings/modalities' },
      { id: 'settings-audit', label: 'Timeline / Auditoria', href: '/settings/audit' },
      { id: 'settings-alert-rules', label: 'Prazos e Alertas', href: '/settings/alert-rules' },
      { id: 'settings-support', label: 'Suporte', href: '/support' },
    ],
  },
];

export const masterNavigation: NavItem[] = [
  { id: 'master-dashboard', label: 'Dashboard SaaS', href: '/master', icon: 'iconoir-view-grid' },
  { id: 'master-tenants', label: 'Lojas', href: '/master/tenants', icon: 'iconoir-home' },
  { id: 'master-plans', label: 'Planos', href: '/master/plans', icon: 'iconoir-box' },
  { id: 'master-billing', label: 'Cobrança', href: '/master/billing', icon: 'iconoir-wallet' },
  { id: 'master-crm', label: 'CRM Master', href: '/master/crm', icon: 'iconoir-user' },
  { id: 'master-support', label: 'Suporte', href: '/master/support', icon: 'iconoir-headset' },
  { id: 'master-analytics', label: 'Analytics', href: '/master/analytics', icon: 'iconoir-stats-report' },
  { id: 'master-ai', label: 'IA Master', href: '/master/ai', icon: 'iconoir-brain' },
  { id: 'master-taxonomy', label: 'Taxonomia', href: '/master/taxonomy', icon: 'iconoir-book-stack' },
  { id: 'master-announcements', label: 'Comunicados', href: '/master/announcements', icon: 'iconoir-megaphone' },
  { id: 'master-onboarding', label: 'Implantação', href: '/master/onboarding', icon: 'iconoir-check-circle' },
  { id: 'master-tenant-access', label: 'Acesso ao tenant', href: '/master/tenant-access', icon: 'iconoir-key' },
];

export function flattenNavItems(items: NavItem[]): NavItem[] {
  return items.flatMap((item) => [item, ...(item.children ? flattenNavItems(item.children) : [])]);
}

export const tenantStubRoutes = flattenNavItems(tenantNavigation).map((item) => item.href);
export const masterStubRoutes = flattenNavItems(masterNavigation).map((item) => item.href);
