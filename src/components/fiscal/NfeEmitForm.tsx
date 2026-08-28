'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useCallback, useState } from 'react';
import { MaskedInput } from '@/components/dastone/MaskedInput';
import { parseMaskNumber } from '@/lib/masks';
import type { FiscalDocumentNature } from '@/types/fiscal';

const NATURE_OPTIONS: { value: FiscalDocumentNature; label: string }[] = [
  { value: 'sale', label: 'Venda' },
  { value: 'purchase', label: 'Compra' },
  { value: 'return', label: 'Retorno' },
  { value: 'shipping', label: 'Remessa' },
  { value: 'other', label: 'Outro' },
];

export function NfeEmitForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setLoading(true);
      setError(null);

      const form = new FormData(event.currentTarget);

      try {
        const response = await fetch('/api/fiscal/nfe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nature: form.get('nature'),
            recipientName: form.get('recipientName'),
            recipientDocument: form.get('recipientDocument'),
            recipientEmail: form.get('recipientEmail') || undefined,
            totalValue: parseMaskNumber(String(form.get('totalValue'))),
            cfop: form.get('cfop'),
            natureOperation: form.get('natureOperation'),
            productDescription: form.get('productDescription'),
            ncm: form.get('ncm'),
          }),
        });

        const data = (await response.json()) as { error?: string; localDocumentId?: string };
        if (!response.ok) {
          throw new Error(data.error ?? 'Erro ao emitir.');
        }

        router.push(`/fiscal/documents/${data.localDocumentId}`);
        router.refresh();
      } catch (submitError) {
        setError(submitError instanceof Error ? submitError.message : 'Erro ao emitir.');
        setLoading(false);
      }
    },
    [router],
  );

  return (
    <form onSubmit={handleSubmit}>
      <div className="row">
        <div className="col-md-3 mb-2">
          <label className="form-label form-label-sm">Natureza</label>
          <select name="nature" className="form-select form-select-sm" defaultValue="sale">
            {NATURE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-3 mb-2">
          <label className="form-label form-label-sm">Natureza operação</label>
          <input
            name="natureOperation"
            className="form-control form-control-sm"
            defaultValue="Venda de mercadoria"
            required
          />
        </div>
        <div className="col-md-3 mb-2">
          <label className="form-label form-label-sm">CFOP</label>
          <MaskedInput mask="digits" maxDigits={4} name="cfop" className="form-control form-control-sm" defaultValue="5102" required />
        </div>
        <div className="col-md-3 mb-2">
          <label className="form-label form-label-sm">NCM</label>
          <MaskedInput mask="digits" maxDigits={8} name="ncm" className="form-control form-control-sm" defaultValue="87032310" required />
        </div>
        <div className="col-md-3 mb-2">
          <label className="form-label form-label-sm">Valor total</label>
          <MaskedInput mask="currency" name="totalValue" className="form-control form-control-sm" required />
        </div>
        <div className="col-md-5 mb-2">
          <label className="form-label form-label-sm">Destinatário</label>
          <input name="recipientName" className="form-control form-control-sm" required />
        </div>
        <div className="col-md-4 mb-2">
          <label className="form-label form-label-sm">CPF/CNPJ destinatário</label>
          <MaskedInput mask="cpfCnpj" name="recipientDocument" className="form-control form-control-sm" required />
        </div>
        <div className="col-md-4 mb-2">
          <label className="form-label form-label-sm">E-mail destinatário</label>
          <input name="recipientEmail" type="email" className="form-control form-control-sm" />
        </div>
        <div className="col-12 mb-2">
          <label className="form-label form-label-sm">Descrição do produto</label>
          <textarea name="productDescription" className="form-control form-control-sm" rows={3} required />
        </div>
      </div>
      {error ? <p className="text-danger small mb-2">{error}</p> : null}
      <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>
        {loading ? 'Enfileirando...' : 'Emitir NF-e'}
      </button>
    </form>
  );
}
