import { emitNfse, getOrCreateFiscalSettings, type EmitNfseInput } from '@/lib/fiscal/documents';
import { getFiscalSession, jsonError } from '@/lib/fiscal/session';
import { FisqalApiError } from '@/lib/fisqal/client';

export async function POST(request: Request) {
  const session = await getFiscalSession();
  if (!session) return jsonError('Não autenticado.', 401);

  let body: Omit<EmitNfseInput, 'tenantId' | 'userId'>;
  try {
    body = (await request.json()) as Omit<EmitNfseInput, 'tenantId' | 'userId'>;
  } catch {
    return jsonError('Payload inválido.');
  }

  const settings = await getOrCreateFiscalSettings(session.supabase, session.tenantId);

  try {
    const result = await emitNfse(
      session.supabase,
      { ...body, tenantId: session.tenantId, userId: session.userId },
      settings,
    );
    return Response.json(result, { status: 202 });
  } catch (error) {
    if (error instanceof FisqalApiError) {
      return jsonError(error.message, error.status);
    }
    return jsonError(error instanceof Error ? error.message : 'Erro ao emitir NFS-e.', 500);
  }
}
