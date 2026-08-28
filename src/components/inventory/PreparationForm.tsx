'use client';

import { FormEvent, useCallback, useState } from 'react';
import { createPreparationOrder } from '@/lib/inventory/vehicles';
import { createClient } from '@/lib/supabase/client';
import { getClientTenantContext } from '@/lib/settings/client-context';

interface PreparationFormProps {
  passageId: string;
}

export function PreparationForm({ passageId }: PreparationFormProps) {
  const supabase = createClient();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [actualCost, setActualCost] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [isInternal, setIsInternal] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setLoading(true);
      setError(null);
      setSuccess(false);

      const context = await getClientTenantContext(supabase);

      if (!context) {
        setError('Loja não configurada.');
        setLoading(false);
        return;
      }

      try {
        await createPreparationOrder(supabase, {
          tenantId: context.tenantId,
          userId: context.userId,
          passageId,
          title,
          description: description || undefined,
          isInternal,
          supplierName: supplierName || undefined,
          actualCost: Number(actualCost),
        });

        setTitle('');
        setDescription('');
        setActualCost('');
        setSupplierName('');
        setSuccess(true);
        window.location.reload();
      } catch (submitError) {
        setError(submitError instanceof Error ? submitError.message : 'Erro ao salvar.');
      } finally {
        setLoading(false);
      }
    },
    [actualCost, description, isInternal, passageId, supplierName, supabase, title],
  );

  return (
    <form onSubmit={handleSubmit} className="mb-3">
      <div className="row">
        <div className="col-md-4 mb-2">
          <input
            type="text"
            className="form-control form-control-sm"
            placeholder="Serviço"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="col-md-3 mb-2">
          <input
            type="number"
            step="0.01"
            className="form-control form-control-sm"
            placeholder="Custo efetivo"
            value={actualCost}
            onChange={(e) => setActualCost(e.target.value)}
            required
          />
        </div>
        <div className="col-md-3 mb-2">
          <input
            type="text"
            className="form-control form-control-sm"
            placeholder="Fornecedor"
            value={supplierName}
            onChange={(e) => setSupplierName(e.target.value)}
            disabled={isInternal}
          />
        </div>
        <div className="col-md-2 mb-2 d-flex gap-2">
          <select
            className="form-select form-select-sm"
            value={isInternal ? 'internal' : 'external'}
            onChange={(e) => setIsInternal(e.target.value === 'internal')}
          >
            <option value="internal">Interno</option>
            <option value="external">Terceiro</option>
          </select>
          <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>
            {loading ? '...' : 'Add'}
          </button>
        </div>
      </div>
      <input
        type="text"
        className="form-control form-control-sm mb-2"
        placeholder="Descrição (opcional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      {error ? <div className="alert alert-danger py-1 px-2 mb-0">{error}</div> : null}
      {success ? (
        <div className="alert alert-success py-1 px-2 mb-0">Preparação registrada.</div>
      ) : null}
    </form>
  );
}
