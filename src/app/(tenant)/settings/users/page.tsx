import { PageTitle } from '@/components/dastone/PageTitle';
import { Card } from '@/components/dastone/Card';
import { UsersPanel } from '@/components/settings/UsersPanel';
import { createClient } from '@/lib/supabase/server';
import type { ProfileListRow, RoleListRow, UserRoleJoin } from '@/types/settings';

export default async function SettingsUsersPage() {
  const supabase = await createClient();

  const [{ data: profilesData }, { data: rolesData }, { data: userRolesData }, { data: rolesLookup }] =
    await Promise.all([
      supabase
        .from('profiles')
        .select('id, full_name, email, phone, is_active, created_at')
        .order('full_name'),
      supabase.from('roles').select('id, name, slug, description, is_system, created_at').order('name'),
      supabase.from('user_roles').select('id, user_id, role_id'),
      supabase.from('roles').select('id, name, slug'),
    ]);

  const roles = (rolesData ?? []) as RoleListRow[];
  const roleNameMap = new Map((rolesLookup ?? []).map((role) => [role.id, role]));
  const roleMap = new Map<string, UserRoleJoin[]>();

  (userRolesData ?? []).forEach((item) => {
    const role = roleNameMap.get(item.role_id);
    const current = roleMap.get(item.user_id) ?? [];
    current.push({
      id: item.id,
      roles: role ?? null,
    });
    roleMap.set(item.user_id, current);
  });

  const profiles = (profilesData ?? []).map((profile) => ({
    ...profile,
    user_roles: roleMap.get(profile.id) ?? null,
  })) as ProfileListRow[];

  return (
    <>
      <PageTitle
        title="Usuários"
        subtitle="Gestão de usuários e perfis"
        breadcrumbs={[
          { label: 'Configurações', href: '/settings' },
          { label: 'Usuários' },
        ]}
      />
      <Card title="Usuários da loja">
        <UsersPanel profiles={profiles} roles={roles} />
      </Card>
    </>
  );
}
