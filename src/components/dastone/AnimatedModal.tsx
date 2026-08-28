'use client';

import { useCallback, useEffect } from 'react';
import { AnimatedMount } from '@/components/dastone/AnimatedMount';

interface AnimatedModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export function AnimatedModal({
  open,
  onClose,
  title,
  children,
  footer,
  size = 'md',
}: AnimatedModalProps) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (open) {
      document.body.classList.add('modal-open');
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }

    const timer = window.setTimeout(() => {
      document.body.classList.remove('modal-open');
    }, 200);

    return () => window.clearTimeout(timer);
  }, [handleKeyDown, open]);

  const dialogClass =
    size === 'sm'
      ? 'modal-dialog modal-dialog-centered modal-sm'
      : size === 'lg'
        ? 'modal-dialog modal-dialog-centered modal-lg'
        : 'modal-dialog modal-dialog-centered';

  return (
    <>
      <AnimatedMount show={open} inClassName="modal-backdrop-animate-in" outClassName="modal-backdrop-animate-out">
        <div className="modal-backdrop fade show" onClick={onClose} />
      </AnimatedMount>
      <AnimatedMount
        show={open}
        className="modal fade show d-block"
        inClassName="modal-animate-in"
        outClassName="modal-animate-out"
      >
        <div className={dialogClass} role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{title}</h5>
              <button type="button" className="btn-close" onClick={onClose} />
            </div>
            <div className="modal-body">{children}</div>
            {footer ? <div className="modal-footer">{footer}</div> : null}
          </div>
        </div>
      </AnimatedMount>
    </>
  );
}
