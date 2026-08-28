'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useCallback, useState } from 'react';
import type { FiscalDocumentNature } from '@/types/fiscal';

const NATURE_OPTIONS: { value: FiscalDocumentNature; label: string }[] = [
  { value: 'service', label: 'Serviço' },
  { value: 'sale', label: 'Venda' },
  { value: 'other', label: 'Outro' },
];

export function NfseEmitForm() {
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
        const response = await fetch('/api/fiscal/nfse', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nature: form.get('nature'),
            recipientName: form.get('recipientName'),
            recipientDocument: form.get('recipientDocument'),
            recipientEmail: form.get('recipientEmail') || undefined,
            serviceCode: form.get('serviceCode'),
            nbsCode: form.get('nbsCode'),
            municipalityCode: form.get('municipalityCode'),
            serviceDescription: form.get('serviceDescription'),
            serviceValue: Number(form.get('serviceValue')),
            competenceDate: form.get('competenceDate'),
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
          <select name="nature" className="form-select form-select-sm" defaultValue="service">
            {NATURE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-3 mb-2">
          <label className="form-label form-label-sm">Competência</label>
          <input
            name="competenceDate"
            type="date"
            className="form-control form-control-sm"
            defaultValue={new Date().toISOString().slice(0, 10)}
            required
          />
        </div>
        <div className="col-md-3 mb-2">
          <label className="form-label form-label-sm">Valor do serviço</label>
          <input
            name="serviceValue"
            type="number"
            step="0.01"
            min="0.01"
            className="form-control form-control-sm"
            required
          />
        </div>
        <div className="col-md-3 mb-2">
          <label className="form-label form-label-sm">Código serviço (6 dígitos)</label>
          <input name="serviceCode" className="form-control form-control-sm" defaultValue="010101" required />
        </div>
        <div className="col-md-3 mb-2">
          <label className="form-label form-label-sm">Código NBS (9 dígitos)</label>
          <input name="nbsCode" className="form-control form-control-sm" defaultValue="115021000" required />
        </div>
        <div className="col-md-3 mb-2">
          <label className="form-label form-label-sm">Município incidência (IBGE)</label>
          <input name="municipalityCode" className="form-control form-control-sm" defaultValue="3550308" required />
        </div>
        <div className="col-md-6 mb-2">
          <label className="form-label form-label-sm">Tomador</label>
          <input name="recipientName" className="form-control form-control-sm" required />
        </div>
        <div className="col-md-3 mb-2">
          <label className="form-label form-label-sm">CPF/CNPJ tomador</label>
          <input name="recipientDocument" className="form-control form-control-sm" required />
        </div>
        <div className="col-md-3 mb-2">
          <label className="form-label form-label-sm">E-mail tomador</label>
          <input name="recipientEmail" type="email" className="form-control form-control-sm" />
        </div>
        <div className="col-12 mb-2">
          <label className="form-label form-label-sm">Discriminação do serviço</label>
          <textarea name="serviceDescription" className="form-control form-control-sm" rows={3} required />
        </div>
      </div>
      {error ? <p className="text-danger small mb-2">{error}</p> : null}
      <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>
        {loading ? 'Enfileirando...' : 'Emitir NFS-e'}
      </button>
    </form>
  );
}
