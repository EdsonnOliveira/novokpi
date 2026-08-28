'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import type { NavItem } from '@/config/navigation';

interface SidebarProps {
  items: NavItem[];
  brandLabel?: string;
  brandHref?: string;
  onNavigate?: () => void;
}

function NavLink({
  item,
  pathname,
  onNavigate,
}: {
  item: NavItem;
  pathname: string;
  onNavigate?: () => void;
}) {
  const isActive =
    pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
  const hasChildren = Boolean(item.children?.length);
  const collapseId = `sidebar-${item.id}`;

  if (hasChildren) {
    return (
      <li className="nav-item">
        <a
          className={`nav-link d-flex align-items-center ${isActive ? 'active' : ''}`}
          href={`#${collapseId}`}
          data-bs-toggle="collapse"
          role="button"
          aria-expanded={isActive ? 'true' : 'false'}
          aria-controls={collapseId}
        >
          {item.icon ? <i className={`${item.icon} menu-icon`} /> : null}
          <span>{item.label}</span>
          <i className="iconoir-nav-arrow-right ms-auto sidebar-menu-arrow" />
        </a>
        <div className={`collapse ${isActive ? 'show' : ''}`} id={collapseId}>
          <ul className="nav flex-column">
            {item.children?.map((child) => (
              <li key={child.id} className="nav-item">
                <Link
                  href={child.href}
                  className={`nav-link ${pathname === child.href ? 'active' : ''}`}
                  onClick={onNavigate}
                >
                  {child.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </li>
    );
  }

  return (
    <li className="nav-item">
      <Link
        href={item.href}
        className={`nav-link ${isActive ? 'active' : ''}`}
        onClick={onNavigate}
      >
        {item.icon ? <i className={`${item.icon} menu-icon`} /> : null}
        <span>{item.label}</span>
        {item.badge ? <span className="badge bg-soft-primary ms-auto">{item.badge}</span> : null}
      </Link>
    </li>
  );
}

export function Sidebar({
  items,
  brandLabel = 'Novo KPI',
  brandHref = '/dashboard',
  onNavigate,
}: SidebarProps) {
  const pathname = usePathname();
  const navItems = useMemo(() => items, [items]);

  return (
    <div className="startbar d-print-none">
      <div className="brand">
        <Link href={brandHref} className="logo text-decoration-none" onClick={onNavigate}>
          <span className="fw-semibold fs-18 text-white">{brandLabel}</span>
        </Link>
      </div>
      <div className="startbar-menu">
        <div className="startbar-collapse" id="startbarCollapse" data-simplebar>
          <div className="d-flex align-items-start flex-column w-100">
            <ul className="navbar-nav mb-auto w-100">
              <li className="menu-label mt-2">
                <span>Menu</span>
              </li>
              {navItems.map((item) => (
                <NavLink key={item.id} item={item} pathname={pathname} onNavigate={onNavigate} />
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
