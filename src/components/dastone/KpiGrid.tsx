import Link from 'next/link';
import { Card } from '@/components/dastone/Card';

export interface KpiItem {
  id: string;
  label: string;
  value: string | number;
  href?: string;
  subtitle?: string;
  badgeClass?: string;
}

interface KpiGridProps {
  items: KpiItem[];
  columns?: 2 | 3 | 4;
}

export function KpiGrid({ items, columns = 4 }: KpiGridProps) {
  const colClass = columns === 2 ? 'col-sm-6 col-lg-6' : columns === 3 ? 'col-sm-6 col-lg-4' : 'col-sm-6 col-lg-3';

  return (
    <div className="row mb-3 animate-stagger g-2 g-md-3">
      {items.map((item, index) => (
        <div key={item.id} className={`col-12 ${colClass} d-flex`}>
          <Card animateDelay={index * 45} className="h-100 w-100">
            <p className="text-muted mb-1">{item.label}</p>
            {item.href ? (
              <Link href={item.href} className="text-decoration-none">
                <h4 className={`mb-0 ${item.badgeClass ?? ''}`}>{item.value}</h4>
              </Link>
            ) : (
              <h4 className={`mb-0 ${item.badgeClass ?? ''}`}>{item.value}</h4>
            )}
            <p className="text-muted mb-0 small mt-1 kpi-grid-subtitle">{item.subtitle ?? '\u00A0'}</p>
          </Card>
        </div>
      ))}
    </div>
  );
}
