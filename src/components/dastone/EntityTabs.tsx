'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

export interface EntityTab {
  id: string;
  label: string;
}

interface EntityTabsProps {
  tabs: EntityTab[];
  paramName?: string;
}

export function EntityTabs({ tabs, paramName = 'tab' }: EntityTabsProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get(paramName) ?? tabs[0]?.id;

  return (
    <ul className="nav nav-tabs mb-3">
      {tabs.map((tab) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set(paramName, tab.id);
        const href = `${pathname}?${params.toString()}`;
        const isActive = activeTab === tab.id;

        return (
          <li key={tab.id} className="nav-item">
            <Link
              href={href}
              className={`nav-link ${isActive ? 'active' : ''}`}
              aria-current={isActive ? 'page' : undefined}
            >
              {tab.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function getActiveTab(searchParams: { get: (key: string) => string | null }, tabs: EntityTab[], paramName = 'tab') {
  const current = searchParams.get(paramName);
  if (current && tabs.some((tab) => tab.id === current)) {
    return current;
  }
  return tabs[0]?.id ?? '';
}
