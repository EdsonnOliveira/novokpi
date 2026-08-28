'use client';

import { FormEvent, useCallback, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getClientTenantContext } from '@/lib/settings/client-context';
import type { ProfileListRow, RoleListRow } from '@/types/settings';
import { joinOne } from '@/types/settings';

interface UsersPanelProps {
  profiles: ProfileListRow[];
  roles: RoleListRow[];
}

export function UsersPanel({ profiles, roles }: UsersPanelProps) {
  const supabase = createClient();
  const [userId, setUserId] = useState('');
  const [roleId, setRoleId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAssignRole = useCallback(
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

      const { error: insertError } = await supabase.from('user_roles').insert({
        user_id: userId,
        role_id: roleId,
        tenant_id: context.tenantId,
      });

      if (insertError) {
        setError(insertError.message);
        setLoading(false);
        return;
      }

      window.location.reload();
    },
    [roleId, supabase, userId],
  );

  const handleToggleActive = useCallback(
    async (profileId: string, isActive: boolean) => {
      setLoading(true);
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ is_active: !isActive })
        .eq('id', profileId);

      if (updateError) {
        setError(updateError.message);
        setLoading(false);
        return;
      }

      window.location.reload();
    },
    [supabase],
  );

  return (
    <>
      <form onSubmit={handleAssignRole} className="mb-3">
        <div className="row">
          <div className="col-md-4 mb-2">
            <select
              className="form-select form-select-sm"
              value={userId}
              onChange={(event) => setUserId(event.target.value)}
              required
            >
              <option value="">Selecione o usuário</option>
              {profiles.map((profile) => (
                <option key={profile.id} value={profile.id}>
                  {profile.full_name ?? profile.email ?? profile.id.slice(0, 8)}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-4 mb-2">
            <select
              className="form-select form-select-sm"
              value={roleId}
              onChange={(event) => setRoleId(event.target.value)}
              required
            >
              <option value="">Selecione o perfil</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-2 mb-2">
            <button type="submit" className="btn btn-primary btn-sm w-100" disabled={loading}>
              {loading ? '...' : 'Atribuir perfil'}
            </button>
          </div>
        </div>
        {error ? <div className="alert alert-danger py-1 px-2 mb-0">{error}</div> : null}
      </form>
      <div className="table-responsive">
        <table className="table table-hover mb-0">
          <thead>
            <tr>
              <th>Nome</th>
              <th>E-mail</th>
              <th>Telefone</th>
              <th>Perfis</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {profiles.length ? (
              profiles.map((profile) => {
                const userRoles = Array.isArray(profile.user_roles)
                  ? profile.user_roles
                  : profile.user_roles
                    ? [profile.user_roles]
                    : [];
                const roleNames = userRoles
                  .map((item) => joinOne(item.roles)?.name)
                  .filter(Boolean)
                  .join(', ');

                return (
                  <tr key={profile.id}>
                    <td>{profile.full_name ?? '—'}</td>
                    <td>{profile.email ?? '—'}</td>
                    <td>{profile.phone ?? '—'}</td>
                    <td>{roleNames || '—'}</td>
                    <td>{profile.is_active ? 'Ativo' : 'Inativo'}</td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-light btn-sm"
                        disabled={loading}
                        onClick={() => handleToggleActive(profile.id, profile.is_active)}
                      >
                        {profile.is_active ? 'Desativar' : 'Ativar'}
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="text-center text-muted py-4">
                  Nenhum usuário encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
