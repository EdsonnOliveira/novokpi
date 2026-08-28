'use client';

import { FormEvent, Fragment, useCallback, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getClientTenantContext } from '@/lib/settings/client-context';
import { slugify } from '@/lib/settings/slug';
import type { PermissionRow, RoleListRow, RolePermissionRow } from '@/types/settings';

interface RolesPanelProps {
  roles: RoleListRow[];
  permissions: PermissionRow[];
  rolePermissions: RolePermissionRow[];
}

export function RolesPanel({ roles, permissions, rolePermissions }: RolesPanelProps) {
  const supabase = createClient();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const grantedMap = useMemo(() => {
    const map = new Map<string, boolean>();
    rolePermissions.forEach((item) => {
      map.set(`${item.role_id}:${item.permission_id}`, item.granted);
    });
    return map;
  }, [rolePermissions]);

  const permissionLinkMap = useMemo(() => {
    const map = new Map<string, string>();
    rolePermissions.forEach((item) => {
      map.set(`${item.role_id}:${item.permission_id}`, item.id);
    });
    return map;
  }, [rolePermissions]);

  const modules = useMemo(() => {
    const grouped = new Map<string, PermissionRow[]>();
    permissions.forEach((permission) => {
      const current = grouped.get(permission.module) ?? [];
      current.push(permission);
      grouped.set(permission.module, current);
    });
    return grouped;
  }, [permissions]);

  const handleCreateRole = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setLoading(true);
      setError(null);

      const context = await getClientTenantContext(supabase);
      if (!context) {
        setError('Sessão inválida.');
        setLoading(false);
        return;
      }

      const slug = slugify(name);
      const { data: role, error: insertError } = await supabase
        .from('roles')
        .insert({
          tenant_id: context.tenantId,
          name,
          slug,
          description: description || null,
        })
        .select('id')
        .single();

      if (insertError || !role) {
        setError(insertError?.message ?? 'Erro ao criar perfil.');
        setLoading(false);
        return;
      }

      const inserts = permissions.map((permission) => ({
        role_id: role.id,
        permission_id: permission.id,
        granted: false,
      }));

      await supabase.from('role_permissions').insert(inserts);
      window.location.reload();
    },
    [description, name, permissions, supabase],
  );

  const handleTogglePermission = useCallback(
    async (roleId: string, permissionId: string, granted: boolean) => {
      setLoading(true);
      setError(null);

      const key = `${roleId}:${permissionId}`;
      const existingId = permissionLinkMap.get(key);

      if (existingId) {
        const { error: updateError } = await supabase
          .from('role_permissions')
          .update({ granted: !granted })
          .eq('id', existingId);

        if (updateError) {
          setError(updateError.message);
          setLoading(false);
          return;
        }
      } else {
        const { error: insertError } = await supabase.from('role_permissions').insert({
          role_id: roleId,
          permission_id: permissionId,
          granted: true,
        });

        if (insertError) {
          setError(insertError.message);
          setLoading(false);
          return;
        }
      }

      window.location.reload();
    },
    [permissionLinkMap, supabase],
  );

  return (
    <>
      <form onSubmit={handleCreateRole} className="mb-3">
        <div className="row">
          <div className="col-md-4 mb-2">
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Nome do perfil"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </div>
          <div className="col-md-5 mb-2">
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Descrição"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>
          <div className="col-md-2 mb-2">
            <button type="submit" className="btn btn-primary btn-sm w-100" disabled={loading}>
              <i className="iconoir-check me-1" aria-hidden="true" />
              {loading ? 'Salvando...' : 'Novo perfil'}
            </button>
          </div>
        </div>
        {error ? <div className="alert alert-danger py-1 px-2 mb-0">{error}</div> : null}
      </form>
      <div className="table-responsive">
        <table className="table table-bordered table-sm mb-0">
          <thead>
            <tr>
              <th>Módulo / Ação</th>
              {roles.map((role) => (
                <th key={role.id} className="text-center">
                  {role.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...modules.entries()].map(([moduleName, modulePermissions]) => (
              <Fragment key={moduleName}>
                <tr className="table-light">
                  <td colSpan={roles.length + 1}>
                    <strong>{moduleName}</strong>
                  </td>
                </tr>
                {modulePermissions.map((permission) => (
                  <tr key={permission.id}>
                    <td>
                      {permission.action}
                      {permission.description ? (
                        <small className="text-muted d-block">{permission.description}</small>
                      ) : null}
                    </td>
                    {roles.map((role) => {
                      const key = `${role.id}:${permission.id}`;
                      const granted = grantedMap.get(key) ?? false;

                      return (
                        <td key={`${role.id}-${permission.id}`} className="text-center">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            checked={granted}
                            disabled={loading || role.is_system}
                            onChange={() => handleTogglePermission(role.id, permission.id, granted)}
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
