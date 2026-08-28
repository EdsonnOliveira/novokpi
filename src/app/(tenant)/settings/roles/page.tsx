import { PageTitle } from '@/components/dastone/PageTitle';
import { Card } from '@/components/dastone/Card';
import { RolesPanel } from '@/components/settings/RolesPanel';
import { createClient } from '@/lib/supabase/server';
import type { PermissionRow, RoleListRow, RolePermissionRow } from '@/types/settings';

export default async function SettingsRolesPage() {
  const supabase = await createClient();

  const [{ data: rolesData }, { data: permissionsData }, { data: rolePermissionsData }] = await Promise.all([
    supabase.from('roles').select('id, name, slug, description, is_system, created_at').order('name'),
    supabase.from('permissions').select('id, module, action, description').order('module'),
    supabase.from('role_permissions').select('id, role_id, permission_id, granted'),
  ]);

  const roles = (rolesData ?? []) as RoleListRow[];
  const permissions = (permissionsData ?? []) as PermissionRow[];
  const rolePermissions = (rolePermissionsData ?? []) as RolePermissionRow[];

  return (
    <>
      <PageTitle
        title="Perfis e permissões"
        subtitle="Controle de acesso por perfil"
        breadcrumbs={[
          { label: 'Configurações', href: '/settings' },
          { label: 'Perfis' },
        ]}
      />
      <Card title="Matriz de permissões">
        <RolesPanel roles={roles} permissions={permissions} rolePermissions={rolePermissions} />
      </Card>
    </>
  );
}
