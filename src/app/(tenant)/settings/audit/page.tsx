import { PageTitle } from '@/components/dastone/PageTitle';
import { Card } from '@/components/dastone/Card';
import { TimelinePanel } from '@/components/dastone/TimelinePanel';
import { createClient } from '@/lib/supabase/server';
import { formatAuditAction, joinOne, type AuditLogRow } from '@/types/settings';

export default async function SettingsAuditPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from('audit_logs')
    .select(`
      id,
      action,
      module,
      entity_type,
      entity_id,
      created_at,
      profiles:user_id ( full_name )
    `)
    .order('created_at', { ascending: false })
    .limit(100);

  const logs = (data ?? []) as AuditLogRow[];
  const events = logs.map((log) => {
    const profile = joinOne(log.profiles);

    return {
      id: log.id,
      title: `${formatAuditAction(log.action)} · ${log.module} / ${log.entity_type}`,
      description: log.entity_id ? `Registro ${log.entity_id.slice(0, 8)}` : null,
      eventType: log.action,
      occurredAt: log.created_at,
      userName: profile?.full_name ?? null,
    };
  });

  return (
    <>
      <PageTitle
        title="Auditoria"
        subtitle="Timeline e auditoria de usuários"
        breadcrumbs={[
          { label: 'Configurações', href: '/settings' },
          { label: 'Auditoria' },
        ]}
      />
      <Card title="Registros de auditoria">
        <TimelinePanel events={events} emptyTitle="Nenhum registro de auditoria" />
      </Card>
    </>
  );
}
