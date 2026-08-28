'use client';

import { FormEvent, useCallback, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { slugify } from '@/lib/settings/slug';
import type { PlanListRow } from '@/types/master';

interface PlansPanelProps {
  plans: PlanListRow[];
}

export function PlansPanel({ plans }: PlansPanelProps) {
  const supabase = createClient();
  const [name, setName] = useState('');
  const [priceMonthly, setPriceMonthly] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setLoading(true);
      setError(null);

      const { error: insertError } = await supabase.from('plans').insert({
        name,
        slug: slugify(name),
        price_monthly: Number(priceMonthly) || 0,
        is_active: true,
        features: {},
        limits: {},
      });

      if (insertError) {
        setError(insertError.message);
        setLoading(false);
        return;
      }

      window.location.reload();
    },
    [name, priceMonthly, supabase],
  );

  const handleToggleActive = useCallback(
    async (id: string, isActive: boolean) => {
      setLoading(true);
      const { error: updateError } = await supabase.from('plans').update({ is_active: !isActive }).eq('id', id);

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
      <form onSubmit={handleCreate} className="mb-3">
        <div className="row">
          <div className="col-md-4 mb-2">
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Nome do plano"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </div>
          <div className="col-md-3 mb-2">
            <input
              type="number"
              step="0.01"
              className="form-control form-control-sm"
              placeholder="Preço mensal"
              value={priceMonthly}
              onChange={(event) => setPriceMonthly(event.target.value)}
              required
            />
          </div>
          <div className="col-md-2 mb-2">
            <button type="submit" className="btn btn-primary btn-sm w-100" disabled={loading}>
              {loading ? '...' : 'Novo plano'}
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
              <th>Slug</th>
              <th>Preço mensal</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {plans.length ? (
              plans.map((plan) => (
                <tr key={plan.id}>
                  <td>{plan.name}</td>
                  <td>{plan.slug}</td>
                  <td>{plan.price_monthly.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                  <td>{plan.is_active ? 'Ativo' : 'Inativo'}</td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-light btn-sm"
                      disabled={loading}
                      onClick={() => handleToggleActive(plan.id, plan.is_active)}
                    >
                      {plan.is_active ? 'Desativar' : 'Ativar'}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center text-muted py-4">
                  Nenhum plano cadastrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
