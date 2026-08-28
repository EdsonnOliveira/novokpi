import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

const AUTH_ROUTES = ['/login', '/signup', '/forgot-password'];
const PUBLIC_ROUTES = [...AUTH_ROUTES, '/'];
const WEBHOOK_PREFIX = '/api/fiscal/webhooks';

export async function middleware(request: NextRequest) {
  const { supabaseResponse, user, supabase } = await updateSession(request);
  const { pathname } = request.nextUrl;

  if (pathname.startsWith(WEBHOOK_PREFIX)) {
    return supabaseResponse;
  }

  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
  const isMasterRoute = pathname.startsWith('/master');
  const isOnboarding = pathname.startsWith('/onboarding');

  if (!user && !isPublicRoute && !isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  if (user && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = isMasterRoute ? '/master' : '/dashboard';
    return NextResponse.redirect(url);
  }

  if (user && !isMasterRoute && !isOnboarding && !isPublicRoute) {
    const impersonateTenantId = request.cookies.get('impersonate_tenant_id')?.value;

    const { data: masterUser } = await supabase
      .from('master_users')
      .select('id')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .maybeSingle();

    if (masterUser && impersonateTenantId) {
      return supabaseResponse;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('tenant_id, onboarding_completed')
      .eq('id', user.id)
      .maybeSingle();

    if (profile && !profile.onboarding_completed) {
      const url = request.nextUrl.clone();
      url.pathname = '/onboarding';
      return NextResponse.redirect(url);
    }
  }

  if (user && isMasterRoute) {
    const { data: masterUser } = await supabase
      .from('master_users')
      .select('id')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .maybeSingle();

    if (!masterUser) {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|dastone|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
