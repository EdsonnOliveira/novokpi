import { redirect } from 'next/navigation';
import { TenantShell } from '@/components/dastone/TenantShell';
import { masterNavigation } from '@/config/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function MasterLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <TenantShell
      navigation={masterNavigation}
      userName="Master Admin"
      userEmail={user.email ?? undefined}
      brandLabel="Novo KPI Master"
      brandHref="/master"
    >
      {children}
    </TenantShell>
  );
}
