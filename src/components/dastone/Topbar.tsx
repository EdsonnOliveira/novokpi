'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatedMount } from '@/components/dastone/AnimatedMount';

interface TopbarProps {
  userName?: string;
  userEmail?: string;
  onLogout?: () => void;
  onToggleSidebar?: () => void;
}

export function Topbar({ userName, userEmail, onLogout, onToggleSidebar }: TopbarProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLLIElement>(null);

  const handleLogout = useCallback(() => {
    onLogout?.();
  }, [onLogout]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!profileRef.current?.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="topbar d-print-none">
      <div className="container-fluid">
        <nav className="topbar-custom d-flex justify-content-between" id="topbar-custom">
          <ul className="topbar-item list-unstyled d-inline-flex align-items-center mb-0">
            <li>
              <button
                type="button"
                className="nav-link mobile-menu-btn nav-icon"
                id="togglemenu"
                aria-label="Abrir menu"
                onClick={onToggleSidebar}
              >
                <i className="iconoir-menu" />
              </button>
            </li>
            <li className="mx-2 welcome-text">
              <Link href="/crm/new" className="btn btn-sm btn-soft-primary" role="button">
                <i className="iconoir-plus me-2" />
                Nova Ficha
              </Link>
            </li>
            <li className="d-lg-none">
              <Link href="/crm/new" className="nav-link nav-icon" aria-label="Nova Ficha">
                <i className="iconoir-plus" />
              </Link>
            </li>
          </ul>
          <ul className="topbar-item list-unstyled d-inline-flex align-items-center mb-0">
            <li className="hide-phone app-search">
              <form role="search" action="/search" method="get">
                <input
                  type="search"
                  name="q"
                  className="form-control top-search mb-0"
                  placeholder="Buscar..."
                />
                <button type="submit" aria-label="Buscar">
                  <i className="iconoir-search" />
                </button>
              </form>
            </li>
            <li className="d-md-none">
              <Link href="/search" className="nav-link nav-icon" aria-label="Buscar">
                <i className="iconoir-search" />
              </Link>
            </li>
            <li className="topbar-item">
              <Link href="/alerts" className="nav-link nav-icon" aria-label="Alertas">
                <i className="iconoir-bell" />
              </Link>
            </li>
            <li className="dropdown topbar-item position-relative" ref={profileRef}>
              <button
                type="button"
                className="nav-link dropdown-toggle arrow-none nav-icon border-0 bg-transparent"
                aria-expanded={profileOpen}
                aria-label="Menu do usuário"
                onClick={() => setProfileOpen((current) => !current)}
              >
                <img
                  src="/dastone/images/users/avatar-1.jpg"
                  alt=""
                  className="thumb-md rounded-circle"
                />
              </button>
              <AnimatedMount
                show={profileOpen}
                className="dropdown-menu dropdown-menu-end py-0 show topbar-profile-menu"
                inClassName="dropdown-animate-in"
                outClassName="dropdown-animate-out"
              >
                <div className="d-flex align-items-center dropdown-item py-2 bg-secondary-subtle">
                  <div className="flex-shrink-0">
                    <img
                      src="/dastone/images/users/avatar-1.jpg"
                      alt=""
                      className="thumb-md rounded-circle"
                    />
                  </div>
                  <div className="flex-grow-1 ms-2 text-truncate align-self-center">
                    <h6 className="my-0 fw-medium text-dark fs-13">{userName ?? 'Usuário'}</h6>
                    <small className="text-muted mb-0">{userEmail ?? ''}</small>
                  </div>
                </div>
                <div className="dropdown-divider mt-0" />
                <Link href="/settings" className="dropdown-item" onClick={() => setProfileOpen(false)}>
                  <i className="iconoir-settings fs-18 me-1 align-text-bottom" />
                  Configurações
                </Link>
                <div className="dropdown-divider mb-0" />
                <button
                  type="button"
                  className="dropdown-item text-danger"
                  onClick={() => {
                    setProfileOpen(false);
                    handleLogout();
                  }}
                >
                  <i className="iconoir-log-out fs-18 me-1 align-text-bottom" />
                  Sair
                </button>
              </AnimatedMount>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}
