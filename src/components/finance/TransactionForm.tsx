'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useCallback, useEffect, useState } from 'react';
import { MaskedInput } from '@/components/dastone/MaskedInput';
import { parseMaskNumber } from '@/lib/masks';
import { createTransaction, payTransaction, reverseTransaction } from '@/lib/finance/transactions';
import { createClient } from '@/lib/supabase/client';
import { getClientTenantContext } from '@/lib/settings/client-context';
import type { FinancialAccount, FinancialCategory } from '@/types/finance';

interface TransactionFormProps {
  accounts: FinancialAccount[];
  categories: FinancialCategory[];
}

export function TransactionForm({ accounts, categories }: TransactionFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [accountId, setAccountId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().slice(0, 10));
  const [markAsPaid, setMarkAsPaid] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredCategories = categories.filter((c) => c.transaction_type === transactionType);

  useEffect(() => {
    setCategoryId('');
  }, [transactionType]);

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
        await createTransaction(supabase, {
          tenantId: context.tenantId,
          userId: context.userId,
          accountId,
          categoryId,
          transactionType,
          amount: parseMaskNumber(amount),
          description,
          transactionDate,
          markAsPaid,
        });
        router.refresh();
        setAmount('');
        setDescription('');
        setLoading(false);
      } catch (submitError) {
        setError(submitError instanceof Error ? submitError.message : 'Erro ao salvar.');
        setLoading(false);
      }
    },
    [accountId, amount, categoryId, description, markAsPaid, router, supabase, transactionDate, transactionType],
  );

  return (
    <form onSubmit={handleSubmit}>
      <div className="row">
        <div className="col-md-2 mb-2">
          <select
            className="form-select form-select-sm"
            value={transactionType}
            onChange={(e) => setTransactionType(e.target.value as 'income' | 'expense')}
          >
            <option value="expense">Despesa</option>
            <option value="income">Receita</option>
          </select>
        </div>
        <div className="col-md-2 mb-2">
          <select
            className="form-select form-select-sm"
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            required
          >
            <option value="">Conta</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-3 mb-2">
          <select
            className="form-select form-select-sm"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
          >
            <option value="">Categoria</option>
            {filteredCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-2 mb-2">
          <MaskedInput
            mask="currency"
            className="form-control form-control-sm"
            placeholder="Valor"
            value={amount}
            onValueChange={setAmount}
            required
          />
        </div>
        <div className="col-md-2 mb-2">
          <input
            type="date"
            className="form-control form-control-sm"
            value={transactionDate}
            onChange={(e) => setTransactionDate(e.target.value)}
            required
          />
        </div>
        <div className="col-md-1 mb-2">
          <button type="submit" className="btn btn-primary btn-sm w-100" disabled={loading}>
            <i className="iconoir-check me-1" aria-hidden="true" />
            {loading ? 'Adicionando...' : 'Adicionar lançamento'}
          </button>
        </div>
      </div>
      <div className="row">
        <div className="col-md-8 mb-2">
          <input
            type="text"
            className="form-control form-control-sm"
            placeholder="Descrição"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        <div className="col-md-4 mb-2 d-flex align-items-center">
          <div className="form-check">
            <input
              id="markAsPaid"
              type="checkbox"
              className="form-check-input"
              checked={markAsPaid}
              onChange={(e) => setMarkAsPaid(e.target.checked)}
            />
            <label htmlFor="markAsPaid" className="form-check-label">
              Já pago/recebido
            </label>
          </div>
        </div>
      </div>
      {error ? <div className="alert alert-danger py-1 px-2 mb-0">{error}</div> : null}
    </form>
  );
}

interface TransactionActionsProps {
  transactionId: string;
  accountId: string;
  status: string;
  remainingAmount: number;
}

export function TransactionActions({
  transactionId,
  accountId,
  status,
  remainingAmount,
}: TransactionActionsProps) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  const handlePay = useCallback(async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const context = await getClientTenantContext(supabase);
    if (!context) return;

    await payTransaction(supabase, {
      tenantId: context.tenantId,
      userId: context.userId,
      transactionId,
      accountId,
      amount: remainingAmount,
    });
    router.refresh();
  }, [accountId, remainingAmount, router, supabase, transactionId]);

  const handleReverse = useCallback(async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const context = await getClientTenantContext(supabase);
    if (!context) return;

    await reverseTransaction(supabase, {
      tenantId: context.tenantId,
      userId: context.userId,
      transactionId,
    });
    router.refresh();
  }, [router, supabase, transactionId]);

  if (status === 'reversed' || status === 'cancelled') return null;

  return (
    <div className="d-flex gap-1">
      {status === 'pending' || status === 'partial' ? (
        <button type="button" className="btn btn-light btn-sm" disabled={loading} onClick={handlePay}>
          <i className="iconoir-arrow-right me-1" aria-hidden="true" />
          Baixar
        </button>
      ) : null}
      {status === 'paid' ? (
        <button type="button" className="btn btn-light btn-sm" disabled={loading} onClick={handleReverse}>
          <i className="iconoir-undo me-1" aria-hidden="true" />
          Estornar
        </button>
      ) : null}
    </div>
  );
}
