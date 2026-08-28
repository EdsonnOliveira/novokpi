'use client';

import { FormEvent, useCallback, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { TaxonomyBrandRow } from '@/types/master';

interface TaxonomyPanelProps {
  brands: TaxonomyBrandRow[];
}

export function TaxonomyPanel({ brands }: TaxonomyPanelProps) {
  const supabase = createClient();
  const [brandName, setBrandName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateBrand = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setLoading(true);
      setError(null);

      const { error: insertError } = await supabase.from('vehicle_brands').insert({
        name: brandName,
        tenant_id: null,
        is_active: true,
      });

      if (insertError) {
        setError(insertError.message);
        setLoading(false);
        return;
      }

      window.location.reload();
    },
    [brandName, supabase],
  );

  const handleToggleBrand = useCallback(
    async (id: string, isActive: boolean) => {
      setLoading(true);
      const { error: updateError } = await supabase
        .from('vehicle_brands')
        .update({ is_active: !isActive })
        .eq('id', id);

      if (updateError) {
        setError(updateError.message);
        setLoading(false);
        return;
      }

      window.location.reload();
    },
    [supabase],
  );

  const handleDeleteBrand = useCallback(
    async (id: string) => {
      setLoading(true);
      const { error: deleteError } = await supabase.from('vehicle_brands').delete().eq('id', id);

      if (deleteError) {
        setError(deleteError.message);
        setLoading(false);
        return;
      }

      window.location.reload();
    },
    [supabase],
  );

  return (
    <>
      <form onSubmit={handleCreateBrand} className="mb-3">
        <div className="row">
          <div className="col-md-4 mb-2">
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Nova marca master"
              value={brandName}
              onChange={(event) => setBrandName(event.target.value)}
              required
            />
          </div>
          <div className="col-md-2 mb-2">
            <button type="submit" className="btn btn-primary btn-sm w-100" disabled={loading}>
              {loading ? '...' : 'Add marca'}
            </button>
          </div>
        </div>
        {error ? <div className="alert alert-danger py-1 px-2 mb-0">{error}</div> : null}
      </form>
      <div className="table-responsive">
        <table className="table table-hover mb-0">
          <thead>
            <tr>
              <th>Marca</th>
              <th>Modelos vinculados</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {brands.length ? (
              brands.map((brand) => (
                <tr key={brand.id}>
                  <td>{brand.name}</td>
                  <td>
                    {brand.vehicle_models?.length
                      ? brand.vehicle_models.map((model) => model.name).join(', ')
                      : '—'}
                  </td>
                  <td>{brand.is_active ? 'Ativa' : 'Inativa'}</td>
                  <td>
                    <div className="d-flex gap-1">
                      <button
                        type="button"
                        className="btn btn-light btn-sm"
                        disabled={loading}
                        onClick={() => handleToggleBrand(brand.id, brand.is_active)}
                      >
                        {brand.is_active ? 'Desativar' : 'Ativar'}
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm"
                        disabled={loading}
                        onClick={() => handleDeleteBrand(brand.id)}
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="text-center text-muted py-4">
                  Nenhuma marca master cadastrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
