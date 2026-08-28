import { getFiscalDocumentAssetUrl } from '@/lib/fiscal/documents';
import { getFiscalSession, jsonError } from '@/lib/fiscal/session';
import { FisqalApiError } from '@/lib/fisqal/client';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getFiscalSession();
  if (!session) return jsonError('Não autenticado.', 401);

  const { id } = await context.params;
  const { searchParams } = new URL(request.url);
  const asset = searchParams.get('asset') === 'xml' ? 'xml' : 'pdf';

  const { data: document, error } = await session.supabase
    .from('fiscal_documents')
    .select('document_type, fisqal_external_id, status')
    .eq('id', id)
    .eq('tenant_id', session.tenantId)
    .maybeSingle();

  if (error || !document?.fisqal_external_id) {
    return jsonError('Documento não encontrado.', 404);
  }

  if (document.document_type !== 'nfse' && document.document_type !== 'nfe') {
    return jsonError('Tipo de documento não suportado.');
  }

  try {
    const url = await getFiscalDocumentAssetUrl(
      document.document_type,
      document.fisqal_external_id,
      asset,
    );
    return Response.json({ url });
  } catch (error) {
    if (error instanceof FisqalApiError) {
      return jsonError(error.message, error.status);
    }
    return jsonError(error instanceof Error ? error.message : 'Erro ao obter arquivo.', 500);
  }
}
