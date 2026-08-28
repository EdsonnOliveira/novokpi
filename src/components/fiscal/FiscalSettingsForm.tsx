'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useCallback, useState } from 'react';
import { MaskedInput } from '@/components/dastone/MaskedInput';
import type { FiscalSettingsRow } from '@/types/fiscal';

interface FiscalSettingsFormProps {
  settings: FiscalSettingsRow;
}

export function FiscalSettingsForm({ settings }: FiscalSettingsFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setLoading(true);
      setError(null);
      setSuccess(null);

      const form = new FormData(event.currentTarget);

      try {
        const response = await fetch('/api/fiscal/company', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            razaoSocial: form.get('razaoSocial'),
            nomeFantasia: form.get('nomeFantasia') || undefined,
            cnpj: form.get('cnpj'),
            inscricaoMunicipal: form.get('inscricaoMunicipal') || undefined,
            inscricaoEstadual: form.get('inscricaoEstadual') || undefined,
            codigoMunicipio: form.get('codigoMunicipio') || undefined,
            municipio: form.get('municipio') || undefined,
            uf: form.get('uf') || undefined,
            logradouro: form.get('logradouro') || undefined,
            numero: form.get('numero') || undefined,
            complemento: form.get('complemento') || undefined,
            bairro: form.get('bairro') || undefined,
            cep: form.get('cep') || undefined,
            email: form.get('email') || undefined,
            telefone: form.get('telefone') || undefined,
            fiscalAmbiente: form.get('fiscalAmbiente'),
          }),
        });

        const data = (await response.json()) as { error?: string };
        if (!response.ok) {
          throw new Error(data.error ?? 'Erro ao salvar.');
        }

        setSuccess('Empresa sincronizada com a FISQAL.');
        router.refresh();
      } catch (submitError) {
        setError(submitError instanceof Error ? submitError.message : 'Erro ao salvar.');
      } finally {
        setLoading(false);
      }
    },
    [router],
  );

  return (
    <form onSubmit={handleSubmit}>
      <div className="row">
        <div className="col-md-6 mb-2">
          <label className="form-label form-label-sm">Razão social</label>
          <input
            name="razaoSocial"
            className="form-control form-control-sm"
            defaultValue={settings.razao_social ?? ''}
            required
          />
        </div>
        <div className="col-md-6 mb-2">
          <label className="form-label form-label-sm">Nome fantasia</label>
          <input
            name="nomeFantasia"
            className="form-control form-control-sm"
            defaultValue={settings.nome_fantasia ?? ''}
          />
        </div>
        <div className="col-md-4 mb-2">
          <label className="form-label form-label-sm">CNPJ</label>
          <MaskedInput
            mask="cnpj"
            name="cnpj"
            className="form-control form-control-sm"
            defaultValue={settings.cnpj ?? ''}
            required
          />
        </div>
        <div className="col-md-4 mb-2">
          <label className="form-label form-label-sm">Inscrição municipal</label>
          <input
            name="inscricaoMunicipal"
            className="form-control form-control-sm"
            defaultValue={settings.inscricao_municipal ?? ''}
          />
        </div>
        <div className="col-md-4 mb-2">
          <label className="form-label form-label-sm">Inscrição estadual</label>
          <input
            name="inscricaoEstadual"
            className="form-control form-control-sm"
            defaultValue={settings.inscricao_estadual ?? ''}
          />
        </div>
        <div className="col-md-3 mb-2">
          <label className="form-label form-label-sm">Código IBGE município</label>
          <MaskedInput
            mask="digits"
            maxDigits={7}
            name="codigoMunicipio"
            className="form-control form-control-sm"
            defaultValue={settings.codigo_municipio ?? ''}
          />
        </div>
        <div className="col-md-5 mb-2">
          <label className="form-label form-label-sm">Município</label>
          <input
            name="municipio"
            className="form-control form-control-sm"
            defaultValue={settings.municipio ?? ''}
          />
        </div>
        <div className="col-md-2 mb-2">
          <label className="form-label form-label-sm">UF</label>
          <input
            name="uf"
            className="form-control form-control-sm"
            defaultValue={settings.uf ?? ''}
            maxLength={2}
          />
        </div>
        <div className="col-md-2 mb-2">
          <label className="form-label form-label-sm">Ambiente</label>
          <select
            name="fiscalAmbiente"
            className="form-select form-select-sm"
            defaultValue={settings.fiscal_ambiente ?? 'homologacao'}
          >
            <option value="homologacao">Homologação</option>
            <option value="producao">Produção</option>
          </select>
        </div>
        <div className="col-md-6 mb-2">
          <label className="form-label form-label-sm">Logradouro</label>
          <input
            name="logradouro"
            className="form-control form-control-sm"
            defaultValue={settings.logradouro ?? ''}
          />
        </div>
        <div className="col-md-2 mb-2">
          <label className="form-label form-label-sm">Número</label>
          <input
            name="numero"
            className="form-control form-control-sm"
            defaultValue={settings.numero ?? ''}
          />
        </div>
        <div className="col-md-4 mb-2">
          <label className="form-label form-label-sm">Complemento</label>
          <input
            name="complemento"
            className="form-control form-control-sm"
            defaultValue={settings.complemento ?? ''}
          />
        </div>
        <div className="col-md-4 mb-2">
          <label className="form-label form-label-sm">Bairro</label>
          <input
            name="bairro"
            className="form-control form-control-sm"
            defaultValue={settings.bairro ?? ''}
          />
        </div>
        <div className="col-md-2 mb-2">
          <label className="form-label form-label-sm">CEP</label>
          <MaskedInput
            mask="cep"
            name="cep"
            className="form-control form-control-sm"
            defaultValue={settings.cep ?? ''}
          />
        </div>
        <div className="col-md-3 mb-2">
          <label className="form-label form-label-sm">E-mail</label>
          <input
            name="email"
            type="email"
            className="form-control form-control-sm"
            defaultValue={settings.email ?? ''}
          />
        </div>
        <div className="col-md-3 mb-2">
          <label className="form-label form-label-sm">Telefone</label>
          <MaskedInput
            mask="phone"
            name="telefone"
            className="form-control form-control-sm"
            defaultValue={settings.telefone ?? ''}
          />
        </div>
      </div>
      {error ? <p className="text-danger small mb-2">{error}</p> : null}
      {success ? <p className="text-success small mb-2">{success}</p> : null}
      <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>
        {loading ? 'Salvando...' : 'Salvar e sincronizar FISQAL'}
      </button>
    </form>
  );
}
