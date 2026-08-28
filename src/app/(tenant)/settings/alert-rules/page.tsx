import { PageTitle } from '@/components/dastone/PageTitle';
import { Card } from '@/components/dastone/Card';
import { AlertBadge } from '@/components/dastone/AlertBadge';
import { AlertRulesPanel } from '@/components/settings/AlertRulesPanel';
import { createClient } from '@/lib/supabase/server';

export default async function AlertRulesPage() {
  const supabase = await createClient();

  const { data: rules } = await supabase
    .from('alert_rules')
    .select('id, name, module, days_threshold, level, is_active')
    .order('module');

  return (
    <>
      <PageTitle
        title="Prazos e Alertas"
        subtitle="Regras automáticas de alerta"
        breadcrumbs={[
          { label: 'Configurações', href: '/settings' },
          { label: 'Prazos e Alertas' },
        ]}
      />
      <Card title="Nova regra">
        <AlertRulesPanel mode="create" />
      </Card>
      <Card title="Regras configuradas" className="mt-3">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Módulo</th>
                <th>Dias</th>
                <th>Nível</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rules?.length ? (
                rules.map((rule) => (
                  <tr key={rule.id}>
                    <td>{rule.name}</td>
                    <td>{rule.module}</td>
                    <td>{rule.days_threshold}</td>
                    <td>
                      <AlertBadge
                        level={rule.level === 'overdue' ? 'danger' : rule.level === 'warning' ? 'warning' : 'info'}
                        label={rule.level}
                      />
                    </td>
                    <td>{rule.is_active ? 'Ativa' : 'Inativa'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center text-muted py-4">
                    Nenhuma regra cadastrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
