'use client';

import { useEffect, useRef, useState } from 'react';

interface AnimatedMountProps {
  show: boolean;
  children: React.ReactNode;
  className?: string;
  inClassName?: string;
  outClassName?: string;
  durationMs?: number;
  onHidden?: () => void;
}

export function AnimatedMount({
  show,
  children,
  className,
  inClassName = 'animate-in',
  outClassName = 'animate-out',
  durationMs = 200,
  onHidden,
}: AnimatedMountProps) {
  const [shouldRender, setShouldRender] = useState(show);
  const [phase, setPhase] = useState<'in' | 'out'>(show ? 'in' : 'out');

  useEffect(() => {
    if (show) {
      setShouldRender(true);
      setPhase('in');
      return;
    }

    if (!shouldRender) return;

    setPhase('out');
    const timer = window.setTimeout(() => {
      setShouldRender(false);
      onHidden?.();
    }, durationMs);

    return () => window.clearTimeout(timer);
  }, [durationMs, onHidden, shouldRender, show]);

  if (!shouldRender) return null;

  return (
    <div className={`${phase === 'out' ? outClassName : inClassName} ${className ?? ''}`.trim()}>
      {children}
    </div>
  );
}
