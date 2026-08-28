import { syncFiscalDocumentStatus } from '@/lib/fiscal/documents';
import { getFiscalSession, jsonError } from '@/lib/fiscal/session';
import { FisqalApiError } from '@/lib/fisqal/client';

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getFiscalSession();
  if (!session) return jsonError('Não autenticado.', 401);

  const { id } = await context.params;

  try {
    const document = await syncFiscalDocumentStatus(session.supabase, id, session.tenantId);
    return Response.json({ document });
  } catch (error) {
    if (error instanceof FisqalApiError) {
      return jsonError(error.message, error.status);
    }
    return jsonError(error instanceof Error ? error.message : 'Erro ao sincronizar.', 500);
  }
}
