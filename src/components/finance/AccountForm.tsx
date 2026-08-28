'use client';

import { FormEvent, useCallback, useState } from 'react';
import { MaskedInput } from '@/components/dastone/MaskedInput';
import { parseMaskNumber } from '@/lib/masks';
import { createFinancialAccount } from '@/lib/finance/transactions';
import { createClient } from '@/lib/supabase/client';
import { getClientTenantContext } from '@/lib/settings/client-context';

export function AccountForm() {
  const supabase = createClient();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [accountType, setAccountType] = useState<'bank' | 'cash' | 'wallet'>('bank');
  const [initialBalance, setInitialBalance] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setLoading(true);
      setError(null);

      const context = await getClientTenantContext(supabase);

      if (!context) {
        setError('Loja não configurada.');
        setLoading(false);
        return;
      }

      try {
        await createFinancialAccount(supabase, {
          tenantId: context.tenantId,
          userId: context.userId,
          name,
          slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          accountType,
          initialBalance: initialBalance ? parseMaskNumber(initialBalance) : 0,
        });
        window.location.reload();
      } catch (submitError) {
        setError(submitError instanceof Error ? submitError.message : 'Erro ao salvar.');
        setLoading(false);
      }
    },
    [accountType, initialBalance, name, slug, supabase],
  );

  return (
    <form onSubmit={handleSubmit} className="mb-3">
      <div className="row">
        <div className="col-md-3 mb-2">
          <input
            type="text"
            className="form-control form-control-sm"
            placeholder="Nome da conta"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="col-md-2 mb-2">
          <select
            className="form-select form-select-sm"
            value={accountType}
            onChange={(e) => setAccountType(e.target.value as 'bank' | 'cash' | 'wallet')}
          >
            <option value="bank">Banco</option>
            <option value="cash">Caixa</option>
            <option value="wallet">Carteira</option>
          </select>
        </div>
        <div className="col-md-2 mb-2">
          <MaskedInput
            mask="currency"
            className="form-control form-control-sm"
            placeholder="Saldo inicial"
            value={initialBalance}
            onValueChange={setInitialBalance}
          />
        </div>
        <div className="col-md-2 mb-2">
          <button type="submit" className="btn btn-primary btn-sm w-100" disabled={loading}>
            <i className="iconoir-check me-1" aria-hidden="true" />
            {loading ? 'Adicionando...' : 'Adicionar conta'}
          </button>
        </div>
      </div>
      {error ? <div className="alert alert-danger py-1 px-2 mb-0">{error}</div> : null}
    </form>
  );
}
