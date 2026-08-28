'use client';

import { PageTransition } from '@/components/dastone/PageTransition';

interface AuthTransitionShellProps {
  children: React.ReactNode;
}

export function AuthTransitionShell({ children }: AuthTransitionShellProps) {
  return <PageTransition>{children}</PageTransition>;
}
