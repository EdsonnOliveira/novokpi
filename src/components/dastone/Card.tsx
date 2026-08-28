interface CardProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  animate?: boolean;
  animateDelay?: number;
}

export function Card({
  title,
  subtitle,
  actions,
  children,
  className,
  animate = true,
  animateDelay = 0,
}: CardProps) {
  return (
    <div
      className={`card ${animate ? 'animate-in' : ''} ${className ?? ''}`.trim()}
      style={animate ? { animationDelay: `${animateDelay}ms` } : undefined}
    >
      {title || actions ? (
        <div className="card-header">
          <div className="row align-items-start align-items-sm-center g-2">
            <div className="col-12 col-sm">
              {title ? <h4 className="card-title">{title}</h4> : null}
              {subtitle ? <p className="text-muted mb-0">{subtitle}</p> : null}
            </div>
            {actions ? <div className="col-12 col-sm-auto">{actions}</div> : null}
          </div>
        </div>
      ) : null}
      <div className="card-body">{children}</div>
    </div>
  );
}
