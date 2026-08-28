import { PageTitle } from '@/components/dastone/PageTitle';
import { Card } from '@/components/dastone/Card';
import { SupportTicketsPanel } from '@/components/master/SupportTicketsPanel';
import { createClient } from '@/lib/supabase/server';
import type { MasterTicketRow, TenantListRow } from '@/types/master';

export default async function MasterSupportPage() {
  const supabase = await createClient();

  const [{ data: ticketsData }, { data: tenantsData }] = await Promise.all([
    supabase
      .from('master_tickets')
      .select('id, subject, description, status, created_at, updated_at, tenant_id')
      .order('updated_at', { ascending: false }),
    supabase.from('tenants').select('id, name, slug, document, phone, email, is_active, created_at').order('name'),
  ]);

  const tenantMap = new Map((tenantsData ?? []).map((tenant) => [tenant.id, { name: tenant.name }]));

  const tickets = (ticketsData ?? []).map((ticket) => ({
    ...ticket,
    tenants: ticket.tenant_id ? tenantMap.get(ticket.tenant_id) ?? null : null,
  })) as MasterTicketRow[];

  const tenants = (tenantsData ?? []).map((tenant) => ({
    ...tenant,
    subscriptions: null,
  })) as TenantListRow[];

  return (
    <>
      <PageTitle
        title="Suporte"
        subtitle="Chamados e atendimento master"
        breadcrumbs={[
          { label: 'Master', href: '/master' },
          { label: 'Suporte' },
        ]}
      />
      <Card title="Chamados master">
        <SupportTicketsPanel tickets={tickets} tenants={tenants} />
      </Card>
    </>
  );
}
