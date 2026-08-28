import Link from 'next/link';
import { ComponentProps } from 'react';

interface LinkButtonProps extends ComponentProps<typeof Link> {
  icon: string;
}

export function LinkButton({ icon, children, className = '', ...props }: LinkButtonProps) {
  return (
    <Link className={className} {...props}>
      <i className={`${icon} me-1`} aria-hidden="true" />
      {children}
    </Link>
  );
}
