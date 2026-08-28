import type { FisqalApiErrorBody } from '@/lib/fisqal/types';

const DEFAULT_BASE_URL = 'https://api.fisqal.com.br';

export class FisqalApiError extends Error {
  code: string;
  status: number;

  constructor(code: string, message: string, status: number) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

function getApiKey(): string {
  const apiKey = process.env.FISQAL_API_KEY;
  if (!apiKey) {
    throw new FisqalApiError('MISSING_CONFIG', 'FISQAL_API_KEY não configurada no servidor.', 500);
  }
  return apiKey;
}

function getBaseUrl(): string {
  return process.env.FISQAL_API_BASE_URL ?? DEFAULT_BASE_URL;
}

async function parseError(response: Response): Promise<FisqalApiError> {
  let body: FisqalApiErrorBody = {};
  try {
    body = (await response.json()) as FisqalApiErrorBody;
  } catch {
    body = {};
  }

  const message =
    body.message ??
    body.error ??
    (body.errors?.length ? body.errors.join(', ') : null) ??
    `Erro FISQAL (${response.status})`;

  return new FisqalApiError(body.code ?? 'FISQAL_ERROR', message, response.status);
}

export interface FisqalRequestOptions {
  method?: string;
  body?: BodyInit | null;
  headers?: Record<string, string>;
  query?: Record<string, string | undefined>;
  idempotencyKey?: string;
  correlationId?: string;
}

export async function fisqalRequest<T>(path: string, options: FisqalRequestOptions = {}): Promise<T> {
  const apiKey = getApiKey();
  const url = new URL(`${getBaseUrl()}${path}`);

  if (options.query) {
    Object.entries(options.query).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        url.searchParams.set(key, value);
      }
    });
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${apiKey}`,
    'X-API-Key': apiKey,
    ...options.headers,
  };

  if (options.idempotencyKey) {
    headers['Idempotency-Key'] = options.idempotencyKey;
  }

  if (options.correlationId) {
    headers['X-Correlation-Id'] = options.correlationId;
  }

  const response = await fetch(url.toString(), {
    method: options.method ?? 'GET',
    headers,
    body: options.body,
    cache: 'no-store',
  });

  if (!response.ok) {
    throw await parseError(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  if (!text) {
    return undefined as T;
  }

  return JSON.parse(text) as T;
}

export async function fisqalHealthCheck(): Promise<{ service: string; status: string }> {
  const response = await fetch(`${getBaseUrl()}/v1/health`, { cache: 'no-store' });
  if (!response.ok) {
    throw new FisqalApiError('HEALTH_ERROR', 'FISQAL indisponível.', response.status);
  }
  return response.json() as Promise<{ service: string; status: string }>;
}

export function isFisqalConfigured(): boolean {
  return Boolean(process.env.FISQAL_API_KEY);
}
