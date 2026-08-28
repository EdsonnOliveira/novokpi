import { processFisqalWebhookEvent } from '@/lib/fiscal/documents';
import { jsonError } from '@/lib/fiscal/session';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  const admin = createAdminClient();
  if (!admin) {
    return jsonError('Webhook não configurado (SUPABASE_SERVICE_ROLE_KEY).', 503);
  }

  let payload: Record<string, unknown>;
  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    return jsonError('Payload inválido.');
  }

  try {
    await processFisqalWebhookEvent(admin, payload as Parameters<typeof processFisqalWebhookEvent>[1]);
    return Response.json({ received: true });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : 'Erro ao processar webhook.', 500);
  }
}
