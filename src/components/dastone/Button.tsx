import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: string;
}

export function Button({ icon, children, className = '', ...props }: ButtonProps) {
  return (
    <button className={className} {...props}>
      <i className={`${icon} me-1`} aria-hidden="true" />
      {children}
    </button>
  );
}
