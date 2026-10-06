import { isValidPlate, normalizePlate } from '@/lib/integrations/plates';

export interface PlateLookupResult {
  plate: string;
  brand: string;
  model: string;
  version: string;
  yearModel: number | null;
  color: string | null;
}

interface ApiPlacasResponse {
  placa?: string;
  marca?: string;
  MARCA?: string;
  modelo?: string;
  MODELO?: string;
  VERSAO?: string;
  SUBMODELO?: string;
  anoModelo?: string;
  ano?: string;
  cor?: string;
  mensagemRetorno?: string;
}

function parseYear(value: string | undefined) {
  if (!value) return null;
  const year = Number(value);
  if (!Number.isFinite(year) || year < 1900 || year > 2100) {
    return null;
  }
  return year;
}

function mapApiPlacasError(status: number) {
  if (status === 401) {
    return 'Placa inválida.';
  }
  if (status === 402) {
    return 'Token da consulta de placa inválido.';
  }
  if (status === 406) {
    return 'Nenhum veículo encontrado para esta placa.';
  }
  if (status === 429) {
    return 'Limite diário de consultas de placa atingido.';
  }
  return 'Não foi possível consultar a placa.';
}

export async function lookupPlateOnApiPlacas(plate: string): Promise<PlateLookupResult> {
  const token = process.env.APIPLACAS_TOKEN?.trim();
  if (!token) {
    throw new Error('Consulta por placa não configurada.');
  }

  const normalized = normalizePlate(plate);
  if (!isValidPlate(normalized)) {
    throw new Error('Placa inválida.');
  }

  const response = await fetch(`https://wdapi2.com.br/consulta/${normalized}/${token}`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(mapApiPlacasError(response.status));
  }

  const data = (await response.json()) as ApiPlacasResponse;
  const brand = (data.marca ?? data.MARCA ?? '').trim();
  const model = (data.modelo ?? data.MODELO ?? '').trim();
  const version = (data.VERSAO ?? data.SUBMODELO ?? '').trim();
  const yearModel = parseYear(data.anoModelo ?? data.ano);
  const resolvedPlate = normalizePlate(data.placa ?? normalized);

  if (!brand && !model) {
    throw new Error('Nenhum veículo encontrado para esta placa.');
  }

  return {
    plate: resolvedPlate,
    brand,
    model,
    version,
    yearModel,
    color: data.cor?.trim() || null,
  };
}
