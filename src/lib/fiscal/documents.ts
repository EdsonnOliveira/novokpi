import type { SupabaseClient } from '@supabase/supabase-js';
import { fisqalRequest } from '@/lib/fisqal/client';
import type {
  FisqalCompany,
  FisqalCertificate,
  FisqalEmitResponse,
  FisqalNfeRecord,
  FisqalNfseRecord,
} from '@/lib/fisqal/types';
import { writeAuditLog } from '@/lib/timeline/audit';
import type { Database, Json } from '@/types/database';
import type { FiscalDocumentNature, FiscalDocumentStatus } from '@/types/fiscal';
import { mapFisqalNfeStatus, mapFisqalNfseStatus, sanitizeDigits } from '@/types/fiscal';

export interface UpsertFiscalSettingsInput {
  tenantId: string;
  userId: string;
  razaoSocial: string;
  nomeFantasia?: string;
  cnpj: string;
  inscricaoMunicipal?: string;
  inscricaoEstadual?: string;
  codigoMunicipio?: string;
  municipio?: string;
  uf?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cep?: string;
  email?: string;
  telefone?: string;
  fiscalAmbiente: 'homologacao' | 'producao';
}

export interface EmitNfseInput {
  tenantId: string;
  userId: string;
  nature: FiscalDocumentNature;
  orderId?: string;
  personId?: string;
  recipientName: string;
  recipientDocument: string;
  recipientEmail?: string;
  serviceCode: string;
  nbsCode: string;
  municipalityCode: string;
  serviceDescription: string;
  serviceValue: number;
  competenceDate: string;
}

export interface EmitNfeInput {
  tenantId: string;
  userId: string;
  nature: FiscalDocumentNature;
  orderId?: string;
  personId?: string;
  recipientName: string;
  recipientDocument: string;
  recipientEmail?: string;
  totalValue: number;
  cfop: string;
  natureOperation: string;
  productDescription: string;
  ncm: string;
}

function buildCompanyPayload(input: UpsertFiscalSettingsInput) {
  return {
    razao_social: input.razaoSocial,
    nome_fantasia: input.nomeFantasia ?? input.razaoSocial,
    cnpj: sanitizeDigits(input.cnpj, 14),
    inscricao_municipal: input.inscricaoMunicipal,
    inscricao_estadual: input.inscricaoEstadual,
    codigo_municipio: input.codigoMunicipio ? sanitizeDigits(input.codigoMunicipio, 7) : undefined,
    municipio: input.municipio,
    uf: input.uf?.toUpperCase().slice(0, 2),
    logradouro: input.logradouro,
    numero: input.numero,
    complemento: input.complemento,
    bairro: input.bairro,
    cep: input.cep ? sanitizeDigits(input.cep, 8) : undefined,
    email: input.email,
    telefone: input.telefone ? sanitizeDigits(input.telefone, 20) : undefined,
    fiscal_ambiente: input.fiscalAmbiente,
  };
}

export async function getOrCreateFiscalSettings(
  supabase: SupabaseClient<Database>,
  tenantId: string,
) {
  const { data } = await supabase
    .from('fiscal_settings')
    .select('*')
    .eq('tenant_id', tenantId)
    .maybeSingle();

  if (data) return data;

  const { data: tenant } = await supabase
    .from('tenants')
    .select('name, document, email, phone')
    .eq('id', tenantId)
    .maybeSingle();

  const { data: created, error } = await supabase
    .from('fiscal_settings')
    .insert({
      tenant_id: tenantId,
      razao_social: tenant?.name ?? null,
      nome_fantasia: tenant?.name ?? null,
      cnpj: tenant?.document ? sanitizeDigits(tenant.document, 14) : null,
      email: tenant?.email ?? null,
      telefone: tenant?.phone ?? null,
    })
    .select('*')
    .single();

  if (error || !created) {
    throw new Error('Não foi possível inicializar configuração fiscal.');
  }

  return created;
}

export async function syncFiscalCompany(
  supabase: SupabaseClient<Database>,
  input: UpsertFiscalSettingsInput,
) {
  const settings = await getOrCreateFiscalSettings(supabase, input.tenantId);
  const payload = buildCompanyPayload(input);

  let company: FisqalCompany;

  if (settings.fisqal_company_id) {
    company = await fisqalRequest<FisqalCompany>(`/v1/companies/${settings.fisqal_company_id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } else {
    company = await fisqalRequest<FisqalCompany>('/v1/companies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  }

  const certificate = company.certificates?.[0];

  const { data: updated, error } = await supabase
    .from('fiscal_settings')
    .update({
      fisqal_company_id: company.id,
      company_status: company.status,
      fiscal_ambiente: input.fiscalAmbiente,
      razao_social: input.razaoSocial,
      nome_fantasia: input.nomeFantasia ?? input.razaoSocial,
      cnpj: sanitizeDigits(input.cnpj, 14),
      inscricao_municipal: input.inscricaoMunicipal ?? null,
      inscricao_estadual: input.inscricaoEstadual ?? null,
      codigo_municipio: input.codigoMunicipio ? sanitizeDigits(input.codigoMunicipio, 7) : null,
      municipio: input.municipio ?? null,
      uf: input.uf?.toUpperCase().slice(0, 2) ?? null,
      logradouro: input.logradouro ?? null,
      numero: input.numero ?? null,
      complemento: input.complemento ?? null,
      bairro: input.bairro ?? null,
      cep: input.cep ? sanitizeDigits(input.cep, 8) : null,
      email: input.email ?? null,
      telefone: input.telefone ?? null,
      certificate_status: certificate?.status ?? settings.certificate_status,
      certificate_valid_until: certificate?.valido_ate ?? settings.certificate_valid_until,
    })
    .eq('tenant_id', input.tenantId)
    .select('*')
    .single();

  if (error || !updated) {
    throw new Error('Não foi possível salvar configuração fiscal.');
  }

  await writeAuditLog(supabase, {
    tenantId: input.tenantId,
    userId: input.userId,
    action: 'update',
    module: 'fiscal',
    entityType: 'fiscal_settings',
    entityId: updated.id,
    newData: { fisqal_company_id: company.id, status: company.status },
  });

  return updated;
}

export async function uploadFiscalCertificate(
  supabase: SupabaseClient<Database>,
  input: {
    tenantId: string;
    userId: string;
    companyId: string;
    name: string;
    password: string;
    file: Blob;
    fileName: string;
  },
) {
  const formData = new FormData();
  formData.append('nome', input.name);
  formData.append('password', input.password);
  formData.append('file', input.file, input.fileName);

  const certificate = await fisqalRequest<FisqalCertificate>(
    `/v1/companies/${input.companyId}/certificates`,
    {
      method: 'POST',
      body: formData,
    },
  );

  await supabase
    .from('fiscal_settings')
    .update({
      certificate_status: certificate.status,
      certificate_valid_until: certificate.valido_ate ?? null,
    })
    .eq('tenant_id', input.tenantId);

  await writeAuditLog(supabase, {
    tenantId: input.tenantId,
    userId: input.userId,
    action: 'update',
    module: 'fiscal',
    entityType: 'fiscal_certificate',
    entityId: certificate.id,
    newData: { status: certificate.status },
  });

  return certificate;
}

export async function refreshFiscalCertificates(
  supabase: SupabaseClient<Database>,
  tenantId: string,
  companyId: string,
) {
  const certificates = await fisqalRequest<FisqalCertificate[]>(
    `/v1/companies/${companyId}/certificates`,
  );

  const active = certificates.find((item) => item.status === 'active') ?? certificates[0];

  if (!active) return certificates;

  await supabase
    .from('fiscal_settings')
    .update({
      certificate_status: active.status,
      certificate_valid_until: active.valido_ate ?? null,
    })
    .eq('tenant_id', tenantId);

  return certificates;
}

function nextDpsId(municipalityCode: string, cnpj: string, serie: string, number: string): string {
  return `DPS${municipalityCode}${sanitizeDigits(cnpj, 14)}${serie}${number.padStart(15, '0')}`;
}

export async function emitNfse(
  supabase: SupabaseClient<Database>,
  input: EmitNfseInput,
  settings: { fisqal_company_id: string | null; cnpj: string | null; inscricao_municipal: string | null; codigo_municipio: string | null },
) {
  if (!settings.fisqal_company_id || !settings.cnpj || !settings.codigo_municipio) {
    throw new Error('Configure a empresa fiscal antes de emitir.');
  }

  const serie = '900';
  const numero = String(Date.now()).slice(-6);
  const idDps = nextDpsId(settings.codigo_municipio, settings.cnpj, serie, numero);
  const idempotencyKey = `nfse-${input.tenantId}-${idDps}`;
  const recipientDoc = sanitizeDigits(input.recipientDocument);
  const recipientType = recipientDoc.length === 11 ? '1' : '2';

  const { data: localDoc, error: insertError } = await supabase
    .from('fiscal_documents')
    .insert({
      tenant_id: input.tenantId,
      document_type: 'nfse',
      nature: input.nature,
      status: 'pending',
      fisqal_company_id: settings.fisqal_company_id,
      order_id: input.orderId ?? null,
      person_id: input.personId ?? null,
      total_value: input.serviceValue,
      competence_date: input.competenceDate,
      recipient_name: input.recipientName,
      recipient_document: recipientDoc,
      service_description: input.serviceDescription,
      idempotency_key: idempotencyKey,
      created_by: input.userId,
      payload: { idDps, serie, numero } as Json,
    })
    .select('id')
    .single();

  if (insertError || !localDoc) {
    throw new Error('Não foi possível registrar a nota localmente.');
  }

  const body = {
    companyId: settings.fisqal_company_id,
    idDps,
    serieDps: serie,
    numeroDps: numero,
    codigoMunicipioEmissor: settings.codigo_municipio,
    tipoInscricaoPrestador: '2',
    inscricaoFederalPrestador: sanitizeDigits(settings.cnpj, 14),
    inscricaoMunicipalPrestador: settings.inscricao_municipal ?? undefined,
    dataCompetencia: input.competenceDate,
    opSimpNac: '1',
    regEspTrib: '0',
    tomador: {
      tipoInscricao: recipientType,
      inscricaoFederal: recipientDoc,
      razaoSocial: input.recipientName,
      email: input.recipientEmail,
    },
    servico: {
      codigoServico: sanitizeDigits(input.serviceCode, 6),
      codigoNbs: sanitizeDigits(input.nbsCode, 9),
      municipioIncidencia: input.municipalityCode,
      discriminacao: input.serviceDescription,
    },
    valores: {
      valorServico: input.serviceValue,
      tribIssqn: '1',
      tpRetIssqn: '1',
    },
  };

  const response = await fisqalRequest<FisqalEmitResponse>('/v1/nfse', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    idempotencyKey,
  });

  await supabase
    .from('fiscal_documents')
    .update({
      status: 'processing',
      fisqal_external_id: response.dpsId ?? null,
      fiscal_request_id: response.fiscalRequestId ?? null,
      document_series: serie,
      document_number: numero,
      payload: { request: body, response } as unknown as Json,
    })
    .eq('id', localDoc.id);

  if (input.orderId) {
    await supabase.from('orders').update({ invoice_status: 'processing' }).eq('id', input.orderId);
  }

  await writeAuditLog(supabase, {
    tenantId: input.tenantId,
    userId: input.userId,
    action: 'create',
    module: 'fiscal',
    entityType: 'fiscal_document',
    entityId: localDoc.id,
    newData: { document_type: 'nfse', status: 'processing' },
  });

  return { localDocumentId: localDoc.id, fisqal: response };
}

export async function emitNfe(
  supabase: SupabaseClient<Database>,
  input: EmitNfeInput,
  settings: {
    fisqal_company_id: string | null;
    cnpj: string | null;
    razao_social: string | null;
    inscricao_estadual: string | null;
    codigo_municipio: string | null;
    municipio: string | null;
    uf: string | null;
    logradouro: string | null;
    numero: string | null;
    bairro: string | null;
    cep: string | null;
  },
) {
  if (!settings.fisqal_company_id || !settings.cnpj) {
    throw new Error('Configure a empresa fiscal antes de emitir.');
  }

  const serie = '1';
  const nnf = String(Date.now()).slice(-6);
  const idempotencyKey = `nfe-${input.tenantId}-${serie}-${nnf}`;
  const recipientDoc = sanitizeDigits(input.recipientDocument);
  const isCpf = recipientDoc.length === 11;
  const uf = settings.uf ?? 'SP';
  const cuf = uf === 'SP' ? '35' : '35';
  const now = new Date().toISOString();

  const { data: localDoc, error: insertError } = await supabase
    .from('fiscal_documents')
    .insert({
      tenant_id: input.tenantId,
      document_type: 'nfe',
      nature: input.nature,
      status: 'pending',
      fisqal_company_id: settings.fisqal_company_id,
      order_id: input.orderId ?? null,
      person_id: input.personId ?? null,
      total_value: input.totalValue,
      issue_date: now.slice(0, 10),
      cfop: input.cfop,
      document_series: serie,
      document_number: nnf,
      recipient_name: input.recipientName,
      recipient_document: recipientDoc,
      service_description: input.productDescription,
      idempotency_key: idempotencyKey,
      created_by: input.userId,
    })
    .select('id')
    .single();

  if (insertError || !localDoc) {
    throw new Error('Não foi possível registrar a nota localmente.');
  }

  const body = {
    companyId: settings.fisqal_company_id,
    ide: {
      cuf,
      natOp: input.natureOperation,
      serie,
      nnf,
      dhEmi: now,
      tpNf: input.nature === 'purchase' ? '0' : '1',
      idDest: '1',
      cMunFg: settings.codigo_municipio ?? '3550308',
      tpImp: '1',
      finNfe: '1',
      indFinal: '1',
      indPres: '9',
    },
    emit: {
      cnpj: sanitizeDigits(settings.cnpj, 14),
      xNome: settings.razao_social ?? 'Emitente',
      enderEmit: {
        xLgr: settings.logradouro ?? 'NA',
        nro: settings.numero ?? 'S/N',
        xBairro: settings.bairro ?? 'Centro',
        cMun: settings.codigo_municipio ?? '3550308',
        xMun: settings.municipio ?? 'Sao Paulo',
        uf,
        cep: settings.cep ? sanitizeDigits(settings.cep, 8) : '01310100',
      },
      ie: settings.inscricao_estadual ?? 'ISENTO',
      crt: '1',
    },
    dest: {
      ...(isCpf ? { cpf: recipientDoc } : { cnpj: recipientDoc }),
      xNome: input.recipientName,
      enderDest: {
        xLgr: 'NA',
        nro: 'S/N',
        xBairro: 'Centro',
        cMun: settings.codigo_municipio ?? '3550308',
        xMun: settings.municipio ?? 'Sao Paulo',
        uf,
        cep: settings.cep ? sanitizeDigits(settings.cep, 8) : '01310100',
      },
      indIeDest: '9',
      email: input.recipientEmail,
    },
    det: [
      {
        nItem: 1,
        cProd: 'VEIC-001',
        cEan: 'SEM GTIN',
        xProd: input.productDescription,
        ncm: sanitizeDigits(input.ncm, 8),
        cfop: sanitizeDigits(input.cfop, 4),
        uCom: 'UN',
        qCom: 1,
        vUnCom: input.totalValue,
        vProd: input.totalValue,
        uTrib: 'UN',
        qTrib: 1,
        vUnTrib: input.totalValue,
        indTot: '1',
        imposto: {
          ICMS: { ICMSSN102: { orig: 0, CSOSN: '102' } },
          PIS: { PISNT: { CST: '07' } },
          COFINS: { COFINSNT: { CST: '07' } },
        },
      },
    ],
    total: {
      icmsTot: {
        vProd: input.totalValue,
        vNF: input.totalValue,
      },
    },
  };

  const response = await fisqalRequest<FisqalEmitResponse>('/v1/nfe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    idempotencyKey,
  });

  await supabase
    .from('fiscal_documents')
    .update({
      status: 'processing',
      fisqal_external_id: response.documentId ?? null,
      fiscal_request_id: response.fiscalRequestId ?? null,
      payload: { request: body, response } as unknown as Json,
    })
    .eq('id', localDoc.id);

  if (input.orderId) {
    await supabase.from('orders').update({ invoice_status: 'processing' }).eq('id', input.orderId);
  }

  await writeAuditLog(supabase, {
    tenantId: input.tenantId,
    userId: input.userId,
    action: 'create',
    module: 'fiscal',
    entityType: 'fiscal_document',
    entityId: localDoc.id,
    newData: { document_type: 'nfe', status: 'processing' },
  });

  return { localDocumentId: localDoc.id, fisqal: response };
}

export async function syncFiscalDocumentStatus(
  supabase: SupabaseClient<Database>,
  documentId: string,
  tenantId: string,
) {
  const { data: document, error } = await supabase
    .from('fiscal_documents')
    .select('*')
    .eq('id', documentId)
    .eq('tenant_id', tenantId)
    .maybeSingle();

  if (error || !document || !document.fisqal_external_id) {
    throw new Error('Documento fiscal não encontrado.');
  }

  let status: FiscalDocumentStatus = document.status as FiscalDocumentStatus;
  const patch: Database['public']['Tables']['fiscal_documents']['Update'] = {};

  if (document.document_type === 'nfse') {
    const remote = await fisqalRequest<FisqalNfseRecord>(
      `/v1/nfse/${document.fisqal_external_id}`,
    );
    status = mapFisqalNfseStatus(remote.status);
    patch.access_key = remote.chave_acesso_nfse ?? document.access_key;
    patch.protocol = remote.protocolo_nacional ?? document.protocol;
    patch.document_number = remote.numero_dps ?? document.document_number;
    patch.document_series = remote.serie_dps ?? document.document_series;
    patch.total_value = remote.valores?.valor_servico
      ? Number(remote.valores.valor_servico)
      : document.total_value;
    patch.recipient_name = remote.tomador?.razao_social ?? document.recipient_name;
    patch.service_description =
      remote.servico?.discriminacao ?? document.service_description;
    patch.competence_date = remote.data_competencia ?? document.competence_date;
    if (status === 'authorized') {
      patch.authorized_at = new Date().toISOString();
    }
  }

  if (document.document_type === 'nfe') {
    const remote = await fisqalRequest<FisqalNfeRecord>(
      `/v1/nfe/${document.fisqal_external_id}`,
    );
    status = mapFisqalNfeStatus(remote.status);
    patch.access_key = remote.chave_acesso_nfe ?? document.access_key;
    patch.protocol = remote.protocolo_autorizacao ?? document.protocol;
    patch.document_number = remote.nnf ?? document.document_number;
    patch.document_series = remote.serie ?? document.document_series;
    patch.total_value = remote.total?.v_nf ? Number(remote.total.v_nf) : document.total_value;
    patch.recipient_name = remote.destinatario?.x_nome ?? document.recipient_name;
    patch.recipient_document =
      remote.destinatario?.cnpj ?? remote.destinatario?.cpf ?? document.recipient_document;
    if (status === 'authorized') {
      patch.authorized_at = new Date().toISOString();
    }
  }

  patch.status = status;

  const { data: updated, error: updateError } = await supabase
    .from('fiscal_documents')
    .update(patch)
    .eq('id', documentId)
    .select('*')
    .single();

  if (updateError || !updated) {
    throw new Error('Não foi possível atualizar status da nota.');
  }

  if (document.order_id) {
    const invoiceStatus =
      status === 'authorized'
        ? 'issued'
        : status === 'cancelled'
          ? 'cancelled'
          : status === 'rejected' || status === 'failed'
            ? 'error'
            : 'processing';
    await supabase
      .from('orders')
      .update({ invoice_status: invoiceStatus })
      .eq('id', document.order_id);
  }

  return updated;
}

export async function cancelFiscalDocument(
  supabase: SupabaseClient<Database>,
  input: {
    tenantId: string;
    userId: string;
    documentId: string;
    reason: string;
  },
) {
  const { data: document, error } = await supabase
    .from('fiscal_documents')
    .select('*')
    .eq('id', input.documentId)
    .eq('tenant_id', input.tenantId)
    .maybeSingle();

  if (error || !document || !document.fisqal_external_id) {
    throw new Error('Documento fiscal não encontrado.');
  }

  if (document.document_type === 'nfse') {
    await fisqalRequest(`/v1/nfse/${document.fisqal_external_id}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ motivoCancelamento: input.reason }),
    });
  } else if (document.document_type === 'nfe') {
    await fisqalRequest(`/v1/nfe/${document.fisqal_external_id}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ justificativa: input.reason }),
    });
  } else {
    throw new Error('Cancelamento não disponível para este tipo de documento.');
  }

  await supabase
    .from('fiscal_documents')
    .update({
      status: 'processing',
      cancel_reason: input.reason,
    })
    .eq('id', document.id);

  await writeAuditLog(supabase, {
    tenantId: input.tenantId,
    userId: input.userId,
    action: 'cancel',
    module: 'fiscal',
    entityType: 'fiscal_document',
    entityId: document.id,
    newData: { cancel_reason: input.reason },
  });
}

export async function getFiscalDocumentAssetUrl(
  documentType: 'nfse' | 'nfe',
  fisqalExternalId: string,
  asset: 'pdf' | 'xml',
) {
  const base = documentType === 'nfse' ? '/v1/nfse' : '/v1/nfe';
  const suffix = asset === 'pdf' ? '/pdf' : '/xml';
  const query = asset === 'pdf' ? '?variant=authorized' : undefined;

  const result = await fisqalRequest<string | { url: string }>(
    `${base}/${fisqalExternalId}${suffix}${query ?? ''}`,
  );

  if (typeof result === 'string') return result;
  return result.url;
}

export async function processFisqalWebhookEvent(
  supabase: SupabaseClient<Database>,
  payload: {
    event?: string;
    type?: string;
    dpsId?: string;
    documentId?: string;
    status?: string;
    chaveAcesso?: string;
    chave_acesso_nfse?: string;
    chave_acesso_nfe?: string;
    protocolo?: string;
    message?: string;
  },
) {
  const eventType = payload.event ?? payload.type ?? 'unknown';
  const externalId = payload.dpsId ?? payload.documentId;
  if (!externalId) return null;

  const { data: document } = await supabase
    .from('fiscal_documents')
    .select('*')
    .eq('fisqal_external_id', externalId)
    .maybeSingle();

  await supabase.from('fiscal_webhook_events').insert({
    tenant_id: document?.tenant_id ?? null,
    event_type: eventType,
    fisqal_external_id: externalId,
    fiscal_document_id: document?.id ?? null,
    payload: payload as Json,
    processed: Boolean(document),
  });

  if (!document) return null;

  let status = document.status as FiscalDocumentStatus;
  const remoteStatus = payload.status ?? eventType.split('.').pop() ?? '';

  if (document.document_type === 'nfse') {
    status = mapFisqalNfseStatus(remoteStatus);
  } else if (document.document_type === 'nfe') {
    status = mapFisqalNfeStatus(remoteStatus);
  }

  const patch: Database['public']['Tables']['fiscal_documents']['Update'] = { status };
  const accessKey =
    payload.chaveAcesso ?? payload.chave_acesso_nfse ?? payload.chave_acesso_nfe;
  if (accessKey) patch.access_key = accessKey;
  if (payload.protocolo) patch.protocol = payload.protocolo;
  if (payload.message && (status === 'rejected' || status === 'failed')) {
    patch.error_message = payload.message;
  }
  if (status === 'authorized') patch.authorized_at = new Date().toISOString();
  if (status === 'cancelled') patch.cancelled_at = new Date().toISOString();

  await supabase.from('fiscal_documents').update(patch).eq('id', document.id);

  if (document.order_id) {
    const invoiceStatus =
      status === 'authorized'
        ? 'issued'
        : status === 'cancelled'
          ? 'cancelled'
          : status === 'rejected' || status === 'failed'
            ? 'error'
            : 'processing';
    await supabase.from('orders').update({ invoice_status: invoiceStatus }).eq('id', document.order_id);
  }

  return document.id;
}
