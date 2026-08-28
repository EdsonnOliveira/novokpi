import { DastoneTheme } from '@/components/dastone/DastoneTheme';
import { AuthTransitionShell } from '@/components/dastone/AuthTransitionShell';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <DastoneTheme startbar="light" bsTheme="light" />
      <AuthTransitionShell>{children}</AuthTransitionShell>
    </>
  );
}
