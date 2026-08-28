import { getOrCreateFiscalSettings, uploadFiscalCertificate } from '@/lib/fiscal/documents';
import { getFiscalSession, jsonError } from '@/lib/fiscal/session';
import { FisqalApiError } from '@/lib/fisqal/client';

export async function POST(request: Request) {
  const session = await getFiscalSession();
  if (!session) return jsonError('Não autenticado.', 401);

  const formData = await request.formData();
  const name = String(formData.get('name') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const file = formData.get('file');

  if (!name || !password || !(file instanceof File)) {
    return jsonError('Nome, senha e arquivo .pfx são obrigatórios.');
  }

  const settings = await getOrCreateFiscalSettings(session.supabase, session.tenantId);
  if (!settings.fisqal_company_id) {
    return jsonError('Cadastre a empresa fiscal antes de enviar o certificado.');
  }

  try {
    const certificate = await uploadFiscalCertificate(session.supabase, {
      tenantId: session.tenantId,
      userId: session.userId,
      companyId: settings.fisqal_company_id,
      name,
      password,
      file,
      fileName: file.name,
    });
    return Response.json({ certificate });
  } catch (error) {
    if (error instanceof FisqalApiError) {
      return jsonError(error.message, error.status);
    }
    return jsonError(error instanceof Error ? error.message : 'Erro ao enviar certificado.', 500);
  }
}
