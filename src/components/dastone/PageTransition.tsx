'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

interface PageTransitionProps {
  children: React.ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const previousPath = useRef(pathname);
  const [displayed, setDisplayed] = useState(children);
  const [phase, setPhase] = useState<'in' | 'out'>('in');

  useEffect(() => {
    if (previousPath.current === pathname) {
      setDisplayed(children);
      return;
    }

    setPhase('out');

    const timer = window.setTimeout(() => {
      previousPath.current = pathname;
      setDisplayed(children);
      setPhase('in');
    }, 200);

    return () => window.clearTimeout(timer);
  }, [children, pathname]);

  return <div className={phase === 'out' ? 'page-animate-out' : 'page-animate-in'}>{displayed}</div>;
}
