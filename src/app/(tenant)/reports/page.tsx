import Link from 'next/link';
import { PageTitle } from '@/components/dastone/PageTitle';
import { Card } from '@/components/dastone/Card';
import { REPORT_DEFINITIONS } from '@/lib/reports/definitions';

export default function ReportsPage() {
  return (
    <>
      <PageTitle
        title="Relatórios"
        subtitle="Central de relatórios exportáveis"
        breadcrumbs={[{ label: 'Relatórios' }]}
      />
      <div className="row">
        {REPORT_DEFINITIONS.map((report) => (
          <div key={report.id} className="col-md-6 col-lg-4 mb-3">
            <Card title={report.title}>
              <p className="text-muted mb-3">{report.description}</p>
              <Link href={report.href} className="btn btn-primary btn-sm">
                <i className="iconoir-check me-1" aria-hidden="true" />
                {report.exportLabel}
              </Link>
            </Card>
          </div>
        ))}
      </div>
    </>
  );
}
