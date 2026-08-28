'use client';

import { FormEvent, useCallback, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getClientTenantContext } from '@/lib/settings/client-context';
import { slugify } from '@/lib/settings/slug';
import type { CatalogRow } from '@/types/settings';
import { TableEmptyRow } from '@/components/dastone/EmptyState';

type CatalogTable = 'channels' | 'lost_reasons' | 'stock_modalities';

interface CatalogPanelProps {
  table: CatalogTable;
  rows: CatalogRow[];
  hasSlug?: boolean;
  hasSortOrder?: boolean;
}

export function CatalogPanel({ table, rows, hasSlug = false, hasSortOrder = false }: CatalogPanelProps) {
  const supabase = createClient();
  const [name, setName] = useState('');
  const [sortOrder, setSortOrder] = useState('0');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = useCallback(
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

      let insertError: { message: string } | null = null;

      if (table === 'channels') {
        const result = await supabase.from('channels').insert({
          tenant_id: context.tenantId,
          name,
          slug: slugify(name),
          is_active: true,
        });
        insertError = result.error;
      } else if (table === 'lost_reasons') {
        const result = await supabase.from('lost_reasons').insert({
          tenant_id: context.tenantId,
          name,
          is_active: true,
          sort_order: Number(sortOrder) || 0,
        });
        insertError = result.error;
      } else {
        const result = await supabase.from('stock_modalities').insert({
          tenant_id: context.tenantId,
          name,
          slug: slugify(name),
          is_active: true,
          sort_order: Number(sortOrder) || 0,
        });
        insertError = result.error;
      }

      if (insertError) {
        setError(insertError.message);
        setLoading(false);
        return;
      }

      window.location.reload();
    },
    [name, sortOrder, supabase, table],
  );

  const handleToggleActive = useCallback(
    async (id: string, isActive: boolean) => {
      setLoading(true);
      const { error: updateError } = await supabase.from(table).update({ is_active: !isActive }).eq('id', id);

      if (updateError) {
        setError(updateError.message);
        setLoading(false);
        return;
      }

      window.location.reload();
    },
    [supabase, table],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      setLoading(true);
      const { error: deleteError } = await supabase.from(table).delete().eq('id', id);

      if (deleteError) {
        setError(deleteError.message);
        setLoading(false);
        return;
      }

      window.location.reload();
    },
    [supabase, table],
  );

  return (
    <>
      <form onSubmit={handleCreate} className="mb-3">
        <div className="row">
          <div className="col-md-4 mb-2">
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Nome"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </div>
          {hasSortOrder ? (
            <div className="col-md-2 mb-2">
              <input
                type="number"
                className="form-control form-control-sm"
                placeholder="Ordem"
                value={sortOrder}
                onChange={(event) => setSortOrder(event.target.value)}
              />
            </div>
          ) : null}
          <div className="col-md-2 mb-2">
            <button type="submit" className="btn btn-primary btn-sm w-100" disabled={loading}>
              {loading ? '...' : 'Adicionar'}
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
              {hasSlug ? <th>Slug</th> : null}
              {hasSortOrder ? <th>Ordem</th> : null}
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {rows.length ? (
              rows.map((row) => (
                <tr key={row.id}>
                  <td>{row.name}</td>
                  {hasSlug ? <td>{row.slug ?? '—'}</td> : null}
                  {hasSortOrder ? <td>{row.sort_order ?? 0}</td> : null}
                  <td>{row.is_active ? 'Ativo' : 'Inativo'}</td>
                  <td>
                    <div className="d-flex gap-1">
                      <button
                        type="button"
                        className="btn btn-light btn-sm"
                        disabled={loading}
                        onClick={() => handleToggleActive(row.id, row.is_active)}
                      >
                        {row.is_active ? 'Desativar' : 'Ativar'}
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm"
                        disabled={loading}
                        onClick={() => handleDelete(row.id)}
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <TableEmptyRow
                colSpan={hasSlug && hasSortOrder ? 5 : hasSlug || hasSortOrder ? 4 : 3}
                title="Nenhum registro cadastrado."
                icon="iconoir-list"
              />
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
