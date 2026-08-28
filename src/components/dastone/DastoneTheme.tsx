'use client';

import { useEffect } from 'react';

interface DastoneThemeProps {
  startbar?: 'light' | 'dark';
  bsTheme?: 'light' | 'dark';
}

export function DastoneTheme({ startbar = 'dark', bsTheme = 'light' }: DastoneThemeProps) {
  useEffect(() => {
    document.documentElement.setAttribute('data-startbar', startbar);
    document.documentElement.setAttribute('data-bs-theme', bsTheme);
  }, [startbar, bsTheme]);

  return null;
}
