'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useCallback, useState } from 'react';
import { MaskedInput } from '@/components/dastone/MaskedInput';
import { FiscalCodeSelect } from '@/components/fiscal/FiscalCodeSelect';
import { FiscalMunicipalitySelect } from '@/components/fiscal/FiscalMunicipalitySelect';
import {
  NBS_SERVICE_CODES,
  NFSE_SERVICE_CODES,
} from '@/lib/fiscal/catalogs';
import { parseMaskNumber } from '@/lib/masks';
import type { FiscalDocumentNature } from '@/types/fiscal';

const NATURE_OPTIONS: { value: FiscalDocumentNature; label: string }[] = [
  { value: 'service', label: 'Serviço' },
  { value: 'sale', label: 'Venda' },
  { value: 'other', label: 'Outro' },
];

interface NfseEmitFormProps {
  defaultUf?: string;
  defaultMunicipalityCode?: string;
}

export function NfseEmitForm({
  defaultUf = 'SP',
  defaultMunicipalityCode = '3550308',
}: NfseEmitFormProps) {
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
            serviceValue: parseMaskNumber(String(form.get('serviceValue'))),
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
          <MaskedInput mask="currency" name="serviceValue" className="form-control form-control-sm" required />
        </div>
        <div className="col-md-6 mb-2">
          <label className="form-label form-label-sm">Código do serviço</label>
          <FiscalCodeSelect
            name="serviceCode"
            options={NFSE_SERVICE_CODES}
            defaultValue="140101"
            required
          />
        </div>
        <div className="col-md-6 mb-2">
          <label className="form-label form-label-sm">Código NBS</label>
          <FiscalCodeSelect
            name="nbsCode"
            options={NBS_SERVICE_CODES}
            defaultValue="115021000"
            required
          />
        </div>
        <div className="col-12 mb-2">
          <FiscalMunicipalitySelect
            codeFieldName="municipalityCode"
            defaultUf={defaultUf}
            defaultMunicipalityCode={defaultMunicipalityCode}
            required
          />
        </div>
        <div className="col-md-6 mb-2">
          <label className="form-label form-label-sm">Tomador</label>
          <input name="recipientName" className="form-control form-control-sm" required />
        </div>
        <div className="col-md-3 mb-2">
          <label className="form-label form-label-sm">CPF/CNPJ tomador</label>
          <MaskedInput mask="cpfCnpj" name="recipientDocument" className="form-control form-control-sm" required />
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
        <i className="iconoir-check me-1" aria-hidden="true" />
        {loading ? 'Enfileirando...' : 'Emitir NFS-e'}
      </button>
    </form>
  );
}
