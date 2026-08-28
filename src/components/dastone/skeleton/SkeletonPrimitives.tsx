interface SkeletonBlockProps {
  className?: string;
  height?: number | string;
  width?: number | string;
}

export function SkeletonBlock({ className, height = 14, width = '100%' }: SkeletonBlockProps) {
  return (
    <div className={`placeholder-glow ${className ?? ''}`.trim()} style={{ width, height }}>
      <span className="placeholder col-12 h-100 d-block rounded" />
    </div>
  );
}

export function PageTitleSkeleton({ withActions = false }: { withActions?: boolean }) {
  return (
    <div className="row mb-3">
      <div className="col-sm-12">
        <div className="page-title-box">
          <div className="row align-items-center">
            <div className="col">
              <SkeletonBlock height={28} width="220px" className="mb-2" />
              <SkeletonBlock height={16} width="320px" />
            </div>
            {withActions ? (
              <div className="col-auto">
                <SkeletonBlock height={32} width="120px" />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export function CardSkeleton({
  title = true,
  children,
  className,
}: {
  title?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`card ${className ?? ''}`.trim()}>
      {title ? (
        <div className="card-header">
          <SkeletonBlock height={20} width="160px" />
        </div>
      ) : null}
      <div className="card-body">{children}</div>
    </div>
  );
}
