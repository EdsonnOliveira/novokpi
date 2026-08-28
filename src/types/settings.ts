export interface ProfileListRow {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  is_active: boolean;
  created_at: string;
  user_roles: UserRoleJoin | UserRoleJoin[] | null;
}

export interface UserRoleJoin {
  id: string;
  roles: RoleJoin | RoleJoin[] | null;
}

export interface RoleJoin {
  id: string;
  name: string;
  slug: string;
}

export interface RoleListRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  is_system: boolean;
  created_at: string;
}

export interface PermissionRow {
  id: string;
  module: string;
  action: string;
  description: string | null;
}

export interface RolePermissionRow {
  id: string;
  role_id: string;
  permission_id: string;
  granted: boolean;
}

export interface CatalogRow {
  id: string;
  name: string;
  slug?: string;
  is_active: boolean;
  sort_order?: number;
  created_at?: string;
}

export interface AuditLogRow {
  id: string;
  action: string;
  module: string;
  entity_type: string;
  entity_id: string | null;
  created_at: string;
  profiles: { full_name: string | null } | { full_name: string | null }[] | null;
}

export function joinOne<T>(value: T | T[] | null): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

export function formatAuditAction(action: string) {
  const labels: Record<string, string> = {
    create: 'Criação',
    update: 'Atualização',
    delete: 'Exclusão',
    approve: 'Aprovação',
    cancel: 'Cancelamento',
    reverse: 'Estorno',
    login: 'Login',
    export: 'Exportação',
    assign: 'Atribuição',
    merge: 'Mesclagem',
  };
  return labels[action] ?? action;
}
