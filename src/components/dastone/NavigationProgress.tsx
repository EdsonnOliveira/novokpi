'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

function isSameRoute(href: string, pathname: string, search: string) {
  if (href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:')) {
    return true;
  }

  const url = new URL(href, window.location.origin);
  const nextPath = `${url.pathname}${url.search}`;

  if (url.origin !== window.location.origin) {
    return true;
  }

  const currentPath = `${pathname}${search ? `?${search}` : ''}`;
  return nextPath === currentPath || nextPath === pathname;
}

export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const trickleRef = useRef<number | null>(null);
  const hideRef = useRef<number | null>(null);
  const isFirstRender = useRef(true);
  const routeKey = `${pathname}?${search}`;

  const clearTimers = useCallback(() => {
    if (trickleRef.current) {
      window.clearInterval(trickleRef.current);
      trickleRef.current = null;
    }
    if (hideRef.current) {
      window.clearTimeout(hideRef.current);
      hideRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    clearTimers();
    setVisible(true);
    setProgress(18);

    trickleRef.current = window.setInterval(() => {
      setProgress((current) => {
        if (current >= 92) return current;
        return current + Math.random() * 8;
      });
    }, 220);
  }, [clearTimers]);

  const complete = useCallback(() => {
    clearTimers();
    setProgress(100);
    hideRef.current = window.setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 240);
  }, [clearTimers]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    complete();
  }, [routeKey, complete]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const target = event.target as HTMLElement | null;
      const anchor = target?.closest('a');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href || href.startsWith('#') || anchor.target === '_blank' || anchor.hasAttribute('download')) {
        return;
      }

      if (isSameRoute(href, pathname, search)) return;

      start();
    };

    const handlePopState = () => {
      start();
    };

    document.addEventListener('click', handleClick, true);
    window.addEventListener('popstate', handlePopState);

    return () => {
      document.removeEventListener('click', handleClick, true);
      window.removeEventListener('popstate', handlePopState);
      clearTimers();
    };
  }, [clearTimers, pathname, search, start]);

  return (
    <div className={`navigation-progress ${visible ? 'is-visible' : ''}`} aria-hidden="true">
      <div className="navigation-progress-bar" style={{ width: `${progress}%` }} />
    </div>
  );
}
