import { cancelFiscalDocument } from '@/lib/fiscal/documents';
import { getFiscalSession, jsonError } from '@/lib/fiscal/session';
import { FisqalApiError } from '@/lib/fisqal/client';

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getFiscalSession();
  if (!session) return jsonError('Não autenticado.', 401);

  const { id } = await context.params;
  let reason = '';

  try {
    const body = (await request.json()) as { reason?: string };
    reason = body.reason?.trim() ?? '';
  } catch {
    return jsonError('Payload inválido.');
  }

  if (reason.length < 15) {
    return jsonError('Motivo do cancelamento deve ter no mínimo 15 caracteres.');
  }

  try {
    await cancelFiscalDocument(session.supabase, {
      tenantId: session.tenantId,
      userId: session.userId,
      documentId: id,
      reason,
    });
    return Response.json({ ok: true }, { status: 202 });
  } catch (error) {
    if (error instanceof FisqalApiError) {
      return jsonError(error.message, error.status);
    }
    return jsonError(error instanceof Error ? error.message : 'Erro ao cancelar.', 500);
  }
}
