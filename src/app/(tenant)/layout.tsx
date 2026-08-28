import { redirect } from 'next/navigation';
import { TenantShell } from '@/components/dastone/TenantShell';
import { tenantNavigation } from '@/config/navigation';
import { createClient } from '@/lib/supabase/server';
import { getTenantContext } from '@/lib/settings/tenant-context';

export default async function TenantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const context = await getTenantContext(supabase);

  if (!context) {
    redirect('/login');
  }

  if (!context.isImpersonating) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarding_completed')
      .eq('id', context.userId)
      .maybeSingle();

    if (profile && !profile.onboarding_completed) {
      redirect('/onboarding');
    }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('email')
    .eq('id', context.userId)
    .maybeSingle();

  return (
    <TenantShell
      navigation={tenantNavigation}
      userName={context.userName ?? 'Usuário'}
      userEmail={profile?.email ?? undefined}
      impersonating={context.isImpersonating}
      impersonateTenantName={context.impersonateTenantName}
    >
      {children}
    </TenantShell>
  );
}
