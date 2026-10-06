import { NextResponse } from 'next/server';
import { lookupPlateOnApiPlacas } from '@/lib/integrations/api-placas';
import { createClient } from '@/lib/supabase/server';
import { getTenantContext } from '@/lib/settings/tenant-context';

export async function GET(request: Request) {
  const supabase = await createClient();
  const context = await getTenantContext(supabase);

  if (!context) {
    return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
  }

  const plate = new URL(request.url).searchParams.get('plate')?.trim() ?? '';

  try {
    const result = await lookupPlateOnApiPlacas(plate);
    return NextResponse.json(result);
  } catch (lookupError) {
    const message = lookupError instanceof Error ? lookupError.message : 'Erro ao consultar placa.';
    const status = message.includes('não configurada') ? 503 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
