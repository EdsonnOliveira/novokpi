import { syncFiscalCompany, type UpsertFiscalSettingsInput } from '@/lib/fiscal/documents';
import { getFiscalSession, jsonError } from '@/lib/fiscal/session';
import { FisqalApiError } from '@/lib/fisqal/client';

export async function POST(request: Request) {
  const session = await getFiscalSession();
  if (!session) return jsonError('Não autenticado.', 401);

  let body: Omit<UpsertFiscalSettingsInput, 'tenantId' | 'userId'>;
  try {
    body = (await request.json()) as Omit<UpsertFiscalSettingsInput, 'tenantId' | 'userId'>;
  } catch {
    return jsonError('Payload inválido.');
  }

  if (!body.razaoSocial?.trim() || !body.cnpj?.trim()) {
    return jsonError('Razão social e CNPJ são obrigatórios.');
  }

  try {
    const settings = await syncFiscalCompany(session.supabase, {
      ...body,
      tenantId: session.tenantId,
      userId: session.userId,
    });
    return Response.json({ settings });
  } catch (error) {
    if (error instanceof FisqalApiError) {
      return jsonError(error.message, error.status);
    }
    return jsonError(error instanceof Error ? error.message : 'Erro ao salvar empresa.', 500);
  }
}
