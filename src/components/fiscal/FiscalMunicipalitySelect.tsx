'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { BRAZILIAN_STATES, formatFiscalOptionLabel } from '@/lib/fiscal/catalogs';

interface MunicipalityOption {
  code: string;
  name: string;
}

interface FiscalMunicipalitySelectProps {
  codeFieldName: string;
  municipalityFieldName?: string;
  ufFieldName?: string;
  defaultUf?: string;
  defaultMunicipalityCode?: string;
  required?: boolean;
}

export function FiscalMunicipalitySelect({
  codeFieldName,
  municipalityFieldName,
  ufFieldName,
  defaultUf = '',
  defaultMunicipalityCode = '',
  required = false,
}: FiscalMunicipalitySelectProps) {
  const [uf, setUf] = useState(defaultUf.toUpperCase());
  const [search, setSearch] = useState('');
  const [municipalities, setMunicipalities] = useState<MunicipalityOption[]>([]);
  const [selectedCode, setSelectedCode] = useState(defaultMunicipalityCode);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!uf) {
      setMunicipalities([]);
      return;
    }

    let cancelled = false;

    const loadMunicipalities = async () => {
      setLoading(true);
      setLoadError(null);

      try {
        const response = await fetch(`/api/fiscal/municipalities?uf=${uf}`);
        const data = (await response.json()) as MunicipalityOption[] | { error?: string };

        if (!response.ok) {
          throw new Error('error' in data ? data.error : 'Erro ao carregar municípios.');
        }

        if (!cancelled) {
          setMunicipalities(data as MunicipalityOption[]);
        }
      } catch (error) {
        if (!cancelled) {
          setMunicipalities([]);
          setLoadError(error instanceof Error ? error.message : 'Erro ao carregar municípios.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadMunicipalities();

    return () => {
      cancelled = true;
    };
  }, [uf]);

  const filteredMunicipalities = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) {
      return municipalities;
    }

    return municipalities.filter(
      (municipality) =>
        municipality.name.toLowerCase().includes(term) || municipality.code.includes(term),
    );
  }, [municipalities, search]);

  const selectedMunicipality = useMemo(
    () => municipalities.find((municipality) => municipality.code === selectedCode) ?? null,
    [municipalities, selectedCode],
  );

  const handleUfChange = useCallback((value: string) => {
    setUf(value);
    setSearch('');
    setSelectedCode('');
  }, []);

  const handleMunicipalityChange = useCallback((value: string) => {
    setSelectedCode(value);
  }, []);

  return (
    <div className="row g-2">
      <div className="col-md-3">
        <label className="form-label form-label-sm">UF</label>
        {ufFieldName ? <input type="hidden" name={ufFieldName} value={uf} /> : null}
        <select
          className="form-select form-select-sm"
          value={uf}
          onChange={(event) => handleUfChange(event.target.value)}
          required={required}
        >
          <option value="">Selecione</option>
          {BRAZILIAN_STATES.map((state) => (
            <option key={state.value} value={state.value}>
              {state.value} — {state.label}
            </option>
          ))}
        </select>
      </div>
      <div className="col-md-9">
        <label className="form-label form-label-sm">Município (IBGE)</label>
        {municipalityFieldName ? (
          <input type="hidden" name={municipalityFieldName} value={selectedMunicipality?.name ?? ''} />
        ) : null}
        <input
          type="search"
          className="form-control form-control-sm mb-2"
          placeholder="Buscar município ou código IBGE..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          disabled={!uf || loading}
        />
        <select
          name={codeFieldName}
          className="form-select form-select-sm"
          value={selectedCode}
          onChange={(event) => handleMunicipalityChange(event.target.value)}
          required={required}
          disabled={!uf || loading || !filteredMunicipalities.length}
        >
          <option value="">
            {loading ? 'Carregando municípios...' : 'Selecione o município'}
          </option>
          {filteredMunicipalities.map((municipality) => (
            <option key={municipality.code} value={municipality.code}>
              {formatFiscalOptionLabel(municipality.code, municipality.name)}
            </option>
          ))}
        </select>
        {loadError ? <p className="text-danger small mb-0 mt-1">{loadError}</p> : null}
      </div>
    </div>
  );
}
