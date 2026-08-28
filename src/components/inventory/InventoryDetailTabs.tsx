import Link from 'next/link';
import { Suspense } from 'react';
import { EntityTabs } from '@/components/dastone/EntityTabs';

const INVENTORY_TABS = [
  { id: 'summary', label: 'Resumo' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'preparation', label: 'Preparação/OS' },
  { id: 'photos', label: 'Fotos' },
  { id: 'report', label: 'Laudo' },
  { id: 'ads', label: 'Anúncios' },
];

interface InventoryDetailTabsProps {
  passageId: string;
}

export function InventoryDetailTabs({ passageId }: InventoryDetailTabsProps) {
  return (
    <Suspense fallback={null}>
      <EntityTabs tabs={INVENTORY_TABS} />
    </Suspense>
  );
}

export function InventoryTabLinks({ passageId }: InventoryDetailTabsProps) {
  return (
    <ul className="nav nav-tabs mb-3">
      {INVENTORY_TABS.map((tab) => (
        <li key={tab.id} className="nav-item">
          <Link href={`/inventory/${passageId}?tab=${tab.id}`} className="nav-link">
            {tab.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export { INVENTORY_TABS };
