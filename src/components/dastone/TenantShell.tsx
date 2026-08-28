'use client';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ImpersonationBanner } from '@/components/master/ImpersonationBanner';
import { PageTransition } from '@/components/dastone/PageTransition';
import { DastoneTheme } from '@/components/dastone/DastoneTheme';
import { Footer } from '@/components/dastone/Footer';
import { Sidebar } from '@/components/dastone/Sidebar';
import { Topbar } from '@/components/dastone/Topbar';
import { useSidebar } from '@/hooks/useSidebar';
import type { NavItem } from '@/config/navigation';

interface TenantShellProps {
  children: React.ReactNode;
  navigation: NavItem[];
  userName?: string;
  userEmail?: string;
  brandLabel?: string;
  brandHref?: string;
  impersonating?: boolean;
  impersonateTenantName?: string | null;
}

export function TenantShell({
  children,
  navigation,
  userName,
  userEmail,
  brandLabel,
  brandHref,
  impersonating,
  impersonateTenantName,
}: TenantShellProps) {
  const router = useRouter();
  const supabase = createClient();
  const { toggleSidebar, closeSidebar } = useSidebar();

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }, [router, supabase.auth]);

  const handleNavigate = useCallback(() => {
    if (window.innerWidth < 1200) {
      closeSidebar();
    }
  }, [closeSidebar]);

  return (
    <>
      <DastoneTheme startbar="dark" bsTheme="light" />
      <Topbar
        userName={userName}
        userEmail={userEmail}
        onLogout={handleLogout}
        onToggleSidebar={toggleSidebar}
      />
      <Sidebar
        items={navigation}
        brandLabel={brandLabel}
        brandHref={brandHref}
        onNavigate={handleNavigate}
      />
      <div
        className="startbar-overlay d-print-none"
        onClick={closeSidebar}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            closeSidebar();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label="Fechar menu"
      />
      <div className="page-wrapper">
        <div className="page-content">
          <div className="container-fluid">
            {impersonating && impersonateTenantName ? (
              <ImpersonationBanner tenantName={impersonateTenantName} />
            ) : null}
            <PageTransition>{children}</PageTransition>
          </div>
          <Footer />
        </div>
      </div>
    </>
  );
}
