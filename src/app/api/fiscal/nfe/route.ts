import { emitNfe, getOrCreateFiscalSettings, type EmitNfeInput } from '@/lib/fiscal/documents';
import { getFiscalSession, jsonError } from '@/lib/fiscal/session';
import { FisqalApiError } from '@/lib/fisqal/client';

export async function POST(request: Request) {
  const session = await getFiscalSession();
  if (!session) return jsonError('Não autenticado.', 401);

  let body: Omit<EmitNfeInput, 'tenantId' | 'userId'>;
  try {
    body = (await request.json()) as Omit<EmitNfeInput, 'tenantId' | 'userId'>;
  } catch {
    return jsonError('Payload inválido.');
  }

  const settings = await getOrCreateFiscalSettings(session.supabase, session.tenantId);

  try {
    const result = await emitNfe(
      session.supabase,
      { ...body, tenantId: session.tenantId, userId: session.userId },
      settings,
    );
    return Response.json(result, { status: 202 });
  } catch (error) {
    if (error instanceof FisqalApiError) {
      return jsonError(error.message, error.status);
    }
    return jsonError(error instanceof Error ? error.message : 'Erro ao emitir NF-e.', 500);
  }
}
