'use client';

import { useCallback, useEffect, useState } from 'react';

const DESKTOP_BREAKPOINT = 1200;

function syncBodySidebarSize(size: 'default' | 'collapsed') {
  document.body.setAttribute('data-sidebar-size', size);
}

export function useSidebar() {
  const [sidebarSize, setSidebarSize] = useState<'default' | 'collapsed'>('collapsed');

  useEffect(() => {
    const initialSize = window.innerWidth >= DESKTOP_BREAKPOINT ? 'default' : 'collapsed';
    setSidebarSize(initialSize);
    syncBodySidebarSize(initialSize);

    const media = window.matchMedia(`(min-width: ${DESKTOP_BREAKPOINT}px)`);
    const handleChange = (event: MediaQueryListEvent) => {
      if (!event.matches) {
        setSidebarSize('collapsed');
        syncBodySidebarSize('collapsed');
      }
    };

    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarSize((current) => {
      const next = current === 'default' ? 'collapsed' : 'default';
      syncBodySidebarSize(next);
      return next;
    });
  }, []);

  const closeSidebar = useCallback(() => {
    setSidebarSize('collapsed');
    syncBodySidebarSize('collapsed');
  }, []);

  return {
    sidebarSize,
    toggleSidebar,
    closeSidebar,
    isSidebarOpen: sidebarSize === 'default',
  };
}
