export interface FiscalCatalogOption {
  value: string;
  label: string;
}

export interface BrazilianStateOption {
  value: string;
  label: string;
}

export function formatFiscalOptionLabel(value: string, label: string): string {
  return `${value} — ${label}`;
}

export const BRAZILIAN_STATES: BrazilianStateOption[] = [
  { value: 'AC', label: 'Acre' },
  { value: 'AL', label: 'Alagoas' },
  { value: 'AP', label: 'Amapá' },
  { value: 'AM', label: 'Amazonas' },
  { value: 'BA', label: 'Bahia' },
  { value: 'CE', label: 'Ceará' },
  { value: 'DF', label: 'Distrito Federal' },
  { value: 'ES', label: 'Espírito Santo' },
  { value: 'GO', label: 'Goiás' },
  { value: 'MA', label: 'Maranhão' },
  { value: 'MT', label: 'Mato Grosso' },
  { value: 'MS', label: 'Mato Grosso do Sul' },
  { value: 'MG', label: 'Minas Gerais' },
  { value: 'PA', label: 'Pará' },
  { value: 'PB', label: 'Paraíba' },
  { value: 'PR', label: 'Paraná' },
  { value: 'PE', label: 'Pernambuco' },
  { value: 'PI', label: 'Piauí' },
  { value: 'RJ', label: 'Rio de Janeiro' },
  { value: 'RN', label: 'Rio Grande do Norte' },
  { value: 'RS', label: 'Rio Grande do Sul' },
  { value: 'RO', label: 'Rondônia' },
  { value: 'RR', label: 'Roraima' },
  { value: 'SC', label: 'Santa Catarina' },
  { value: 'SP', label: 'São Paulo' },
  { value: 'SE', label: 'Sergipe' },
  { value: 'TO', label: 'Tocantins' },
];

export const NFSE_SERVICE_CODES: FiscalCatalogOption[] = [
  {
    value: '140101',
    label: 'Manutenção, conserto, revisão e conservação de veículos',
  },
  {
    value: '140501',
    label: 'Guarda e estacionamento de veículos automotores',
  },
  {
    value: '140601',
    label: 'Serviços de transporte de natureza municipal',
  },
  {
    value: '100101',
    label: 'Agenciamento, corretagem ou intermediação de bens móveis',
  },
  {
    value: '100501',
    label: 'Corretagem de seguros',
  },
  {
    value: '100801',
    label: 'Corretagem de contratos de arrendamento mercantil (leasing)',
  },
  {
    value: '170101',
    label: 'Assessoria ou consultoria de qualquer natureza',
  },
  {
    value: '010701',
    label: 'Suporte técnico em informática',
  },
];

export const NBS_SERVICE_CODES: FiscalCatalogOption[] = [
  {
    value: '115021000',
    label: 'Serviços de manutenção e reparo de veículos automotores',
  },
  {
    value: '115022000',
    label: 'Serviços de lavagem, lubrificação e polimento de veículos',
  },
  {
    value: '115011000',
    label: 'Serviços de corretagem e intermediação na comercialização de veículos',
  },
  {
    value: '115029000',
    label: 'Outros serviços de manutenção e reparo de veículos automotores',
  },
  {
    value: '114019900',
    label: 'Outros serviços de intermediação na comercialização de bens',
  },
];

export const NFE_CFOP_CODES: FiscalCatalogOption[] = [
  {
    value: '5102',
    label: 'Venda de mercadoria adquirida ou recebida de terceiros (dentro do estado)',
  },
  {
    value: '5405',
    label: 'Venda de mercadoria sujeita ao ICMS-ST (dentro do estado)',
  },
  {
    value: '6102',
    label: 'Venda de mercadoria adquirida ou recebida de terceiros (interestadual)',
  },
  {
    value: '6403',
    label: 'Venda de mercadoria sujeita ao ICMS-ST (interestadual)',
  },
  {
    value: '5912',
    label: 'Remessa de mercadoria para demonstração',
  },
  {
    value: '5915',
    label: 'Remessa de mercadoria para conserto ou reparo',
  },
  {
    value: '5916',
    label: 'Retorno de mercadoria recebida para conserto ou reparo',
  },
  {
    value: '1202',
    label: 'Devolução de venda de mercadoria adquirida ou recebida de terceiros',
  },
  {
    value: '5949',
    label: 'Outra saída de mercadoria ou prestação de serviço não especificada',
  },
];

export const NFE_NCM_CODES: FiscalCatalogOption[] = [
  {
    value: '87032310',
    label: 'Automóveis com motor a explosão, cilindrada entre 1.500 cm³ e 3.000 cm³',
  },
  {
    value: '87032410',
    label: 'Automóveis com motor a explosão, cilindrada superior a 3.000 cm³',
  },
  {
    value: '87032210',
    label: 'Automóveis com motor a explosão, cilindrada entre 1.000 cm³ e 1.500 cm³',
  },
  {
    value: '87032100',
    label: 'Automóveis com motor a explosão, cilindrada não superior a 1.000 cm³',
  },
  {
    value: '87033390',
    label: 'Outros veículos automóveis com motor diesel ou semia diesel',
  },
  {
    value: '87042100',
    label: 'Veículos automóveis para transporte de mercadorias, peso em carga máxima até 5 toneladas',
  },
  {
    value: '87042200',
    label: 'Veículos automóveis para transporte de mercadorias, peso em carga máxima superior a 5 toneladas e até 20 toneladas',
  },
  {
    value: '87034000',
    label: 'Veículos automóveis híbridos',
  },
];

export const NFE_NATURE_OPERATION_OPTIONS: FiscalCatalogOption[] = [
  { value: 'Venda de mercadoria', label: 'Venda de mercadoria' },
  { value: 'Venda de veículo usado', label: 'Venda de veículo usado' },
  { value: 'Remessa para demonstração', label: 'Remessa para demonstração' },
  { value: 'Remessa para conserto ou reparo', label: 'Remessa para conserto ou reparo' },
  { value: 'Retorno de conserto ou reparo', label: 'Retorno de conserto ou reparo' },
  { value: 'Devolução de mercadoria', label: 'Devolução de mercadoria' },
];
