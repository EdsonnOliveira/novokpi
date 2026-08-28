import { PageTitle } from '@/components/dastone/PageTitle';
import { Card } from '@/components/dastone/Card';
import { AlertBadge } from '@/components/dastone/AlertBadge';
import { AlertRowActions } from '@/components/alerts/AlertRowActions';
import { RunAlertsButton } from '@/components/alerts/RunAlertsButton';
import { createClient } from '@/lib/supabase/server';
import { getTenantContext } from '@/lib/settings/tenant-context';
import { formatAlertLevelLabel, type TenantAlertRow } from '@/types/platform';
import { redirect } from 'next/navigation';
import { TableEmptyRow } from '@/components/dastone/EmptyState';

export default async function AlertsPage() {
  const supabase = await createClient();
  const context = await getTenantContext(supabase);

  if (!context) {
    redirect('/login');
  }

  const { data: alertsData } = await supabase
    .from('tenant_alerts')
    .select('id, level, title, message, module, href, is_read, is_dismissed, created_at')
    .eq('tenant_id', context.tenantId)
    .eq('is_dismissed', false)
    .order('created_at', { ascending: false })
    .limit(100);

  const alerts = (alertsData ?? []) as TenantAlertRow[];
  const unreadCount = alerts.filter((alert) => !alert.is_read).length;

  return (
    <>
      <PageTitle
        title="Alertas"
        subtitle="Central de alertas persistentes"
        breadcrumbs={[{ label: 'Alertas' }]}
        actions={
          <div className="d-flex align-items-center gap-2">
            {unreadCount ? (
              <span className="badge bg-soft-warning">{unreadCount} não lido(s)</span>
            ) : null}
            <RunAlertsButton />
          </div>
        }
      />
      <Card>
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead>
              <tr>
                <th>Nível</th>
                <th>Título</th>
                <th>Mensagem</th>
                <th>Módulo</th>
                <th>Data</th>
                <th>Ação</th>
              </tr>
            </thead>
            <tbody>
              {alerts.length ? (
                alerts.map((alert) => (
                  <tr key={alert.id} className={alert.is_read ? '' : 'table-warning'}>
                    <td>
                      <AlertBadge level={alert.level} label={formatAlertLevelLabel(alert.level)} />
                    </td>
                    <td>{alert.title}</td>
                    <td>{alert.message ?? '—'}</td>
                    <td>{alert.module ?? '—'}</td>
                    <td>{new Date(alert.created_at).toLocaleString('pt-BR')}</td>
                    <td>
                      <AlertRowActions alertId={alert.id} isRead={alert.is_read} href={alert.href} />
                    </td>
                  </tr>
                ))
              ) : (
                <TableEmptyRow
                  colSpan={6}
                  title="Nenhum alerta ativo."
                  icon="iconoir-bell"
                />
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
