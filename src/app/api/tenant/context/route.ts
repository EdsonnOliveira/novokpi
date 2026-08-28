import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getTenantContext } from '@/lib/settings/tenant-context';

export async function GET() {
  const supabase = await createClient();
  const context = await getTenantContext(supabase);

  if (!context) {
    return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
  }

  return NextResponse.json({
    tenantId: context.tenantId,
    userId: context.userId,
    userName: context.userName,
    isImpersonating: context.isImpersonating,
  });
}
