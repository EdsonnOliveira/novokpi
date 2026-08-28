import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const routes = [
  ['/dashboard', 'Dashboard', 'Visão geral da loja', 'Fase 0', 'tenant'],
  ['/inventory', 'Estoque', 'Tabela de veículos em estoque', 'Fase 2', 'tenant'],
  ['/inventory/quick', 'Cadastro rápido', 'Cadastro rápido de veículo', 'Fase 2', 'tenant'],
  ['/inventory/timeline', 'Timeline veículo', 'Histórico permanente do veículo', 'Fase 2', 'tenant'],
  ['/inventory/preparation', 'Preparação / OS', 'Ordens de serviço e preparação', 'Fase 2', 'tenant'],
  ['/inventory/photos', 'Fotos', 'Galeria de fotos do veículo', 'Fase 2', 'tenant'],
  ['/inventory/report', 'Laudo', 'Laudo cautelar', 'Fase 2', 'tenant'],
  ['/integrator', 'Integrador', 'Publicação em portais de anúncios', 'Fase 7', 'tenant'],
  ['/crm', 'Leads / CRM', 'Tabela de leads e negociações', 'Fase 1', 'tenant'],
  ['/crm/kanban', 'CRM Kanban', 'Pipeline visual de negociações', 'Fase 1', 'tenant'],
  ['/crm/new', 'Nova Ficha', 'Cadastro rápido de atendimento', 'Fase 1', 'tenant'],
  ['/crm/people', 'Clientes', 'Cadastro progressivo de pessoas', 'Fase 1', 'tenant'],
  ['/crm/evaluation', 'Avaliação', 'Avaliação de usado e trade-in', 'Fase 1', 'tenant'],
  ['/crm/demand-queue', 'Fila demanda', 'Clientes aguardando veículo', 'Fase 1', 'tenant'],
  ['/crm/offer-queue', 'Fila oferta', 'Veículos aguardando comprador', 'Fase 1', 'tenant'],
  ['/crm/lost-sales', 'Vendas perdidas', 'Dashboard de perdas', 'Fase 1', 'tenant'],
  ['/agenda', 'Agenda', 'Atividades e próximas ações', 'Fase 1', 'tenant'],
  ['/orders', 'Pedidos Fechados', 'Negócios fechados', 'Fase 3', 'tenant'],
  ['/orders/reservation', 'Reserva', 'Reserva e finalização', 'Fase 3', 'tenant'],
  ['/orders/delivery', 'Entrega', 'Checklist de entrega', 'Fase 3', 'tenant'],
  ['/orders/transfer', 'Transferência', 'Transferência veicular', 'Fase 3', 'tenant'],
  ['/finance', 'Financeiro', 'Visão geral financeira', 'Fase 4', 'tenant'],
  ['/finance/accounts', 'Contas financeiras', 'Bancos, caixa e carteiras', 'Fase 4', 'tenant'],
  ['/finance/statement', 'Extrato', 'Extrato por conta', 'Fase 4', 'tenant'],
  ['/finance/cashflow', 'Fluxo de caixa', 'Projeção e realizado', 'Fase 4', 'tenant'],
  ['/finance/transactions', 'Lançamentos', 'Baixas e conciliação', 'Fase 4', 'tenant'],
  ['/finance/products', 'Produtos adicionais', 'Financiamento, seguro, acessórios', 'Fase 3', 'tenant'],
  ['/finance/dre', 'DRE', 'Demonstrativo Jan-Dez', 'Fase 4', 'tenant'],
  ['/finance/dispatcher', 'Despachante', 'Conta corrente despachante', 'Fase 4', 'tenant'],
  ['/fiscal', 'Fiscal / Notas', 'Controle de NF-e', 'Fase 5', 'tenant'],
  ['/documents', 'Documentos', 'Central de formulários', 'Fase 6', 'tenant'],
  ['/documents/generate', 'Gerar documento', 'Geração com variáveis', 'Fase 6', 'tenant'],
  ['/warranty', 'Garantia', 'Pós-venda e ocorrências', 'Fase 10', 'tenant'],
  ['/marketing', 'Marketing', 'Campanhas SMS, e-mail, WhatsApp', 'Fase 9', 'tenant'],
  ['/reports', 'Relatórios', 'Central de relatórios exportáveis', 'Fase 8', 'tenant'],
  ['/alerts', 'Alertas', 'Central de alertas persistentes', 'Fase 8', 'tenant'],
  ['/search', 'Busca global', 'Busca unificada', 'Fase 8', 'tenant'],
  ['/ai', 'Assistente IA', 'Assistente linguagem natural', 'Fase 12', 'tenant'],
  ['/site', 'Site da Loja', 'Templates e domínio', 'Fase 7', 'tenant'],
  ['/settings', 'Configurações', 'Configurações gerais da loja', 'Fase 11', 'tenant'],
  ['/settings/users', 'Usuários', 'Gestão de usuários', 'Fase 11', 'tenant'],
  ['/settings/roles', 'Perfis', 'Perfis e permissões', 'Fase 11', 'tenant'],
  ['/settings/lost-reasons', 'Motivos perda', 'Motivos de venda perdida', 'Fase 11', 'tenant'],
  ['/settings/channels', 'Canais', 'Origens e canais', 'Fase 11', 'tenant'],
  ['/settings/modalities', 'Modalidades', 'Tipos e modalidades', 'Fase 11', 'tenant'],
  ['/settings/audit', 'Auditoria', 'Timeline e auditoria de usuários', 'Fase 11', 'tenant'],
  ['/master', 'Dashboard SaaS', 'MRR, lojas, churn', 'Fase 13', 'master'],
  ['/master/tenants', 'Lojas', 'Gestão de tenants', 'Fase 13', 'master'],
  ['/master/plans', 'Planos', 'Planos configuráveis', 'Fase 13', 'master'],
  ['/master/billing', 'Cobrança', 'Assinaturas e inadimplência', 'Fase 13', 'master'],
  ['/master/crm', 'CRM Master', 'Prospect → cliente', 'Fase 13', 'master'],
  ['/master/support', 'Suporte', 'Chamados e chat', 'Fase 13', 'master'],
  ['/master/analytics', 'Analytics', 'Inteligência de mercado', 'Fase 13', 'master'],
  ['/master/ai', 'IA Master', 'IA sobre base consolidada', 'Fase 13', 'master'],
  ['/master/taxonomy', 'Taxonomia', 'Taxonomia central', 'Fase 13', 'master'],
  ['/master/announcements', 'Comunicados', 'O que há de novo', 'Fase 13', 'master'],
];

const root = path.join(__dirname, '..', 'src', 'app');

for (const [route, title, description, phase, group] of routes) {
  if (route === '/dashboard' && group === 'tenant') continue;

  const segments = route.split('/').filter(Boolean);
  const dir = path.join(root, `(${group})`, ...segments);
  fs.mkdirSync(dir, { recursive: true });

  const content = `import { PageTitle } from '@/components/dastone/PageTitle';
import { ModuleStub } from '@/components/dastone/ModuleStub';

export default function Page() {
  return (
    <>
      <PageTitle title="${title}" subtitle="${description}" />
      <ModuleStub title="${title}" description="${description}" phase="${phase}" />
    </>
  );
}
`;

  fs.writeFileSync(path.join(dir, 'page.tsx'), content);
}

console.log(`Generated ${routes.length} stub pages`);
