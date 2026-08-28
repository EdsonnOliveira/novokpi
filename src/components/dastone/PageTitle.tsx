import Link from 'next/link';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageTitleProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
}

export function PageTitle({ title, subtitle, breadcrumbs, actions }: PageTitleProps) {
  return (
    <div className="row animate-in">
      <div className="col-sm-12">
        <div className="page-title-box">
          <div className="row align-items-start align-items-sm-center g-2">
            <div className="col-12 col-sm">
              <h4 className="page-title">{title}</h4>
              {subtitle ? <p className="text-muted mb-0">{subtitle}</p> : null}
              {breadcrumbs?.length ? (
                <ol className="breadcrumb">
                  {breadcrumbs.map((item, index) => (
                    <li
                      key={`${item.label}-${index}`}
                      className={`breadcrumb-item ${!item.href ? 'active' : ''}`}
                    >
                      {item.href ? <Link href={item.href}>{item.label}</Link> : item.label}
                    </li>
                  ))}
                </ol>
              ) : null}
            </div>
            {actions ? <div className="col-12 col-sm-auto">{actions}</div> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
