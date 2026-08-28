export interface FisqalCompany {
  id: string;
  workspace_id?: string;
  razao_social: string;
  nome_fantasia?: string;
  cnpj: string;
  status: string;
  fiscal_ambiente: string;
  plan_eligible?: boolean;
  certificates?: FisqalCertificate[];
  created_at?: string;
}

export interface FisqalCertificate {
  id: string;
  nome?: string;
  status: string;
  valido_ate?: string;
  certificado_tipo?: string;
  thumbprint?: string;
  valido_de?: string;
  created_at?: string;
}

export interface FisqalEmitResponse {
  dpsId?: string;
  documentId?: string;
  status: string;
  fiscalRequestId?: string;
}

export interface FisqalNfseRecord {
  id: string;
  company_id: string;
  serie_dps?: string;
  numero_dps?: string;
  status: string;
  chave_acesso_nfse?: string;
  protocolo_nacional?: string;
  data_competencia?: string;
  tomador?: { razao_social?: string };
  servico?: { codigo_tributacao_nacional?: string; discriminacao?: string };
  valores?: { valor_servico?: string };
}

export interface FisqalNfeRecord {
  id: string;
  company_id: string;
  mod?: string;
  serie?: string;
  nnf?: string;
  status: string;
  chave_acesso_nfe?: string;
  protocolo_autorizacao?: string;
  total?: { v_nf?: string };
  destinatario?: { x_nome?: string; cnpj?: string; cpf?: string };
}

export interface FisqalApiErrorBody {
  code?: string;
  message?: string;
  error?: string;
  errors?: string[];
}
