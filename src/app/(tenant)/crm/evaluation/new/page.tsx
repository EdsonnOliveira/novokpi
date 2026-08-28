'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useCallback, useEffect, useState } from 'react';
import { PageTitle } from '@/components/dastone/PageTitle';
import { Card } from '@/components/dastone/Card';
import { FormPageSkeleton } from '@/components/dastone/skeleton/FormPageSkeleton';
import { createEvaluation } from '@/lib/inventory/vehicles';
import { createClient } from '@/lib/supabase/client';
import { getClientTenantContext } from '@/lib/settings/client-context';
import type { TaxonomyBrand, TaxonomyModel, TaxonomyVersion } from '@/types/inventory';

export default function NewEvaluationPage() {
  const router = useRouter();
  const supabase = createClient();
  const [brands, setBrands] = useState<TaxonomyBrand[]>([]);
  const [models, setModels] = useState<TaxonomyModel[]>([]);
  const [versions, setVersions] = useState<TaxonomyVersion[]>([]);
  const [brandId, setBrandId] = useState('');
  const [modelId, setModelId] = useState('');
  const [versionId, setVersionId] = useState('');
  const [plate, setPlate] = useState('');
  const [yearModel, setYearModel] = useState('');
  const [color, setColor] = useState('');
  const [km, setKm] = useState('');
  const [fipeValue, setFipeValue] = useState('');
  const [offeredValue, setOfferedValue] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    async function loadBrands() {
      const { data } = await supabase
        .from('vehicle_brands')
        .select('id, name')
        .eq('is_active', true)
        .order('name');
      setBrands(data ?? []);
      setInitialLoading(false);
    }

    loadBrands();
  }, [supabase]);

  useEffect(() => {
    async function loadModels() {
      if (!brandId) {
        setModels([]);
        setModelId('');
        setVersions([]);
        setVersionId('');
        return;
      }

      const { data } = await supabase
        .from('vehicle_models')
        .select('id, brand_id, name')
        .eq('brand_id', brandId)
        .eq('is_active', true)
        .order('name');

      setModels(data ?? []);
      setModelId('');
      setVersions([]);
      setVersionId('');
    }

    loadModels();
  }, [brandId, supabase]);

  useEffect(() => {
    async function loadVersions() {
      if (!modelId) {
        setVersions([]);
        setVersionId('');
        return;
      }

      const { data } = await supabase
        .from('vehicle_versions')
        .select('id, model_id, name')
        .eq('model_id', modelId)
        .eq('is_active', true)
        .order('name');

      setVersions(data ?? []);
      setVersionId('');
    }

    loadVersions();
  }, [modelId, supabase]);

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
        await createEvaluation(supabase, {
          tenantId: context.tenantId,
          userId: context.userId,
          brandId,
          modelId,
          versionId,
          plate: plate || undefined,
          yearModel: yearModel ? Number(yearModel) : undefined,
          color: color || undefined,
          km: km ? Number(km) : undefined,
          fipeValue: fipeValue ? Number(fipeValue) : undefined,
          offeredValue: offeredValue ? Number(offeredValue) : undefined,
          notes: notes || undefined,
        });

        router.push('/crm/evaluation');
        router.refresh();
      } catch (submitError) {
        setError(submitError instanceof Error ? submitError.message : 'Erro ao salvar.');
        setLoading(false);
      }
    },
    [
      brandId,
      color,
      fipeValue,
      km,
      modelId,
      notes,
      offeredValue,
      plate,
      router,
      supabase,
      versionId,
      yearModel,
    ],
  );

  if (initialLoading) {
    return <FormPageSkeleton fields={9} />;
  }

  return (
    <>
      <PageTitle
        title="Nova avaliação"
        subtitle="Avaliação de usado / trade-in"
        breadcrumbs={[
          { label: 'CRM', href: '/crm' },
          { label: 'Avaliação', href: '/crm/evaluation' },
          { label: 'Nova' },
        ]}
      />
      <div className="row">
        <div className="col-lg-8">
          <Card title="Dados da avaliação">
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-4 mb-3">
                  <label htmlFor="brandId" className="form-label">
                    Marca
                  </label>
                  <select
                    id="brandId"
                    className="form-select"
                    value={brandId}
                    onChange={(e) => setBrandId(e.target.value)}
                    required
                  >
                    <option value="">Selecione</option>
                    {brands.map((brand) => (
                      <option key={brand.id} value={brand.id}>
                        {brand.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-4 mb-3">
                  <label htmlFor="modelId" className="form-label">
                    Modelo
                  </label>
                  <select
                    id="modelId"
                    className="form-select"
                    value={modelId}
                    onChange={(e) => setModelId(e.target.value)}
                    required
                    disabled={!brandId}
                  >
                    <option value="">Selecione</option>
                    {models.map((model) => (
                      <option key={model.id} value={model.id}>
                        {model.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-4 mb-3">
                  <label htmlFor="versionId" className="form-label">
                    Versão
                  </label>
                  <select
                    id="versionId"
                    className="form-select"
                    value={versionId}
                    onChange={(e) => setVersionId(e.target.value)}
                    required
                    disabled={!modelId}
                  >
                    <option value="">Selecione</option>
                    {versions.map((version) => (
                      <option key={version.id} value={version.id}>
                        {version.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="row">
                <div className="col-md-3 mb-3">
                  <label htmlFor="plate" className="form-label">
                    Placa
                  </label>
                  <input
                    id="plate"
                    type="text"
                    className="form-control"
                    value={plate}
                    onChange={(e) => setPlate(e.target.value.toUpperCase())}
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <label htmlFor="yearModel" className="form-label">
                    Ano
                  </label>
                  <input
                    id="yearModel"
                    type="number"
                    className="form-control"
                    value={yearModel}
                    onChange={(e) => setYearModel(e.target.value)}
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <label htmlFor="color" className="form-label">
                    Cor
                  </label>
                  <input
                    id="color"
                    type="text"
                    className="form-control"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <label htmlFor="km" className="form-label">
                    Km
                  </label>
                  <input
                    id="km"
                    type="number"
                    className="form-control"
                    value={km}
                    onChange={(e) => setKm(e.target.value)}
                  />
                </div>
              </div>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="fipeValue" className="form-label">
                    FIPE
                  </label>
                  <input
                    id="fipeValue"
                    type="number"
                    step="0.01"
                    className="form-control"
                    value={fipeValue}
                    onChange={(e) => setFipeValue(e.target.value)}
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label htmlFor="offeredValue" className="form-label">
                    Valor ofertado
                  </label>
                  <input
                    id="offeredValue"
                    type="number"
                    step="0.01"
                    className="form-control"
                    value={offeredValue}
                    onChange={(e) => setOfferedValue(e.target.value)}
                  />
                </div>
              </div>
              <div className="mb-3">
                <label htmlFor="notes" className="form-label">
                  Observações
                </label>
                <textarea
                  id="notes"
                  className="form-control"
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
              {error ? <div className="alert alert-danger py-2">{error}</div> : null}
              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Salvando...' : 'Salvar avaliação'}
                </button>
                <Link href="/crm/evaluation" className="btn btn-light">
                  Cancelar
                </Link>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </>
  );
}
