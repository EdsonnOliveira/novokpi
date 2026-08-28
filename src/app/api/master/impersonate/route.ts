import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
  }

  const { data: masterUser } = await supabase
    .from('master_users')
    .select('id')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .maybeSingle();

  if (!masterUser) {
    return NextResponse.json({ error: 'Acesso master necessário.' }, { status: 403 });
  }

  let body: { tenantId?: string };
  try {
    body = (await request.json()) as { tenantId?: string };
  } catch {
    return NextResponse.json({ error: 'Payload inválido.' }, { status: 400 });
  }

  if (!body.tenantId) {
    return NextResponse.json({ error: 'Tenant obrigatório.' }, { status: 400 });
  }

  const { data: tenant } = await supabase
    .from('tenants')
    .select('id, name, is_active')
    .eq('id', body.tenantId)
    .maybeSingle();

  if (!tenant?.is_active) {
    return NextResponse.json({ error: 'Loja inválida ou inativa.' }, { status: 404 });
  }

  const response = NextResponse.json({
    ok: true,
    tenantId: body.tenantId,
    tenantName: tenant.name,
  });

  response.cookies.set('impersonate_tenant_id', body.tenantId, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 8,
  });
  response.cookies.set('impersonate_tenant_name', tenant.name, {
    httpOnly: false,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 8,
  });

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete('impersonate_tenant_id');
  response.cookies.delete('impersonate_tenant_name');
  return response;
}
