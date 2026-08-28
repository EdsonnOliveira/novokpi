'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { PageTitle } from '@/components/dastone/PageTitle';
import { Card } from '@/components/dastone/Card';
import { MaskedInput } from '@/components/dastone/MaskedInput';
import { FormPageSkeleton } from '@/components/dastone/skeleton/FormPageSkeleton';
import { parseMaskInteger, parseMaskNumber } from '@/lib/masks';
import { createQuickVehicleEntry, findVehicleHistoryByPlate } from '@/lib/inventory/vehicles';
import { createClient } from '@/lib/supabase/client';
import { getClientTenantContext } from '@/lib/settings/client-context';
import type { StockModality, TaxonomyBrand, TaxonomyModel, TaxonomyVersion } from '@/types/inventory';

export default function QuickInventoryPage() {
  const router = useRouter();
  const supabase = createClient();
  const [brands, setBrands] = useState<TaxonomyBrand[]>([]);
  const [models, setModels] = useState<TaxonomyModel[]>([]);
  const [versions, setVersions] = useState<TaxonomyVersion[]>([]);
  const [modalities, setModalities] = useState<StockModality[]>([]);
  const [brandId, setBrandId] = useState('');
  const [modelId, setModelId] = useState('');
  const [versionId, setVersionId] = useState('');
  const [modalityId, setModalityId] = useState('');
  const [plate, setPlate] = useState('');
  const [yearManufacture, setYearManufacture] = useState('');
  const [yearModel, setYearModel] = useState('');
  const [color, setColor] = useState('');
  const [km, setKm] = useState('');
  const [acquisitionCost, setAcquisitionCost] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [fipeValue, setFipeValue] = useState('');
  const [consignmentNetValue, setConsignmentNetValue] = useState('');
  const [consignmentPercent, setConsignmentPercent] = useState('');
  const [historyWarning, setHistoryWarning] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    async function loadOptions() {
      const [brandsRes, modalitiesRes] = await Promise.all([
        supabase.from('vehicle_brands').select('id, name').eq('is_active', true).order('name'),
        supabase.from('stock_modalities').select('id, name, slug').eq('is_active', true).order('sort_order'),
      ]);
      setBrands(brandsRes.data ?? []);
      setModalities(modalitiesRes.data ?? []);
      setInitialLoading(false);
    }

    loadOptions();
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

  const selectedModality = useMemo(
    () => modalities.find((item) => item.id === modalityId),
    [modalities, modalityId],
  );

  const isConsignment = selectedModality?.slug === 'consignment' || selectedModality?.slug === 'online_consignment';

  const checkPlateHistory = useCallback(
    async (value: string) => {
      if (value.length < 7) {
        setHistoryWarning(null);
        return;
      }

      const context = await getClientTenantContext(supabase);
      if (!context) return;

      const history = await findVehicleHistoryByPlate(supabase, context.tenantId, value);

      if (history && history.passageCount > 0) {
        setHistoryWarning(
          `Veículo já possui histórico na loja (${history.passageCount} passagem${history.passageCount > 1 ? 'ns' : ''}).`,
        );
      } else {
        setHistoryWarning(null);
      }
    },
    [supabase],
  );

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
        const result = await createQuickVehicleEntry(supabase, {
          tenantId: context.tenantId,
          userId: context.userId,
          brandId,
          modelId,
          versionId,
          yearManufacture: Number(yearManufacture),
          yearModel: Number(yearModel),
          color,
          km: parseMaskInteger(km),
          plate,
          modalityId,
          acquisitionCost: acquisitionCost ? parseMaskNumber(acquisitionCost) : undefined,
          salePrice: salePrice ? parseMaskNumber(salePrice) : undefined,
          fipeValue: fipeValue ? parseMaskNumber(fipeValue) : undefined,
          consignmentNetValue: consignmentNetValue ? parseMaskNumber(consignmentNetValue) : undefined,
          consignmentPercent: consignmentPercent ? parseMaskNumber(consignmentPercent) : undefined,
        });

        router.push(`/inventory/${result.passage.id}`);
        router.refresh();
      } catch (submitError) {
        setError(submitError instanceof Error ? submitError.message : 'Erro ao cadastrar veículo.');
        setLoading(false);
      }
    },
    [
      acquisitionCost,
      brandId,
      color,
      consignmentNetValue,
      consignmentPercent,
      fipeValue,
      km,
      modalityId,
      modelId,
      plate,
      router,
      salePrice,
      supabase,
      versionId,
      yearManufacture,
      yearModel,
    ],
  );

  if (initialLoading) {
    return <FormPageSkeleton fields={10} />;
  }

  return (
    <>
      <PageTitle
        title="Cadastro rápido"
        subtitle="Versão, modelo, ano, cor, km e placa"
        breadcrumbs={[
          { label: 'Estoque', href: '/inventory' },
          { label: 'Cadastro rápido' },
        ]}
      />
      <div className="row">
        <div className="col-lg-8">
          <Card title="Dados do veículo">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="plate" className="form-label">
                  Placa
                </label>
                <div className="input-group">
                  <MaskedInput
                    id="plate"
                    mask="plate"
                    className="form-control"
                    value={plate}
                    onValueChange={setPlate}
                    onBlur={(event) => checkPlateHistory(event.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="btn btn-light"
                    onClick={() => setError('Consulta por placa — integração em configuração.')}
                  >
                    Consultar placa
                  </button>
                </div>
                {historyWarning ? (
                  <div className="alert alert-warning py-2 mt-2 mb-0">{historyWarning}</div>
                ) : null}
              </div>
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
                  <label htmlFor="yearManufacture" className="form-label">
                    Ano fab.
                  </label>
                  <MaskedInput
                    id="yearManufacture"
                    mask="digits"
                    maxDigits={4}
                    className="form-control"
                    value={yearManufacture}
                    onValueChange={setYearManufacture}
                    required
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <label htmlFor="yearModel" className="form-label">
                    Ano mod.
                  </label>
                  <MaskedInput
                    id="yearModel"
                    mask="digits"
                    maxDigits={4}
                    className="form-control"
                    value={yearModel}
                    onValueChange={setYearModel}
                    required
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
                    required
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <label htmlFor="km" className="form-label">
                    Km
                  </label>
                  <MaskedInput
                    id="km"
                    mask="integer"
                    maxDigits={7}
                    className="form-control"
                    value={km}
                    onValueChange={setKm}
                    required
                  />
                </div>
              </div>
              <div className="mb-3">
                <label htmlFor="modalityId" className="form-label">
                  Modalidade de entrada
                </label>
                <select
                  id="modalityId"
                  className="form-select"
                  value={modalityId}
                  onChange={(e) => setModalityId(e.target.value)}
                  required
                >
                  <option value="">Selecione</option>
                  {modalities.map((modality) => (
                    <option key={modality.id} value={modality.id}>
                      {modality.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="row">
                <div className="col-md-4 mb-3">
                  <label htmlFor="acquisitionCost" className="form-label">
                    Custo aquisição
                  </label>
                  <MaskedInput
                    id="acquisitionCost"
                    mask="currency"
                    className="form-control"
                    value={acquisitionCost}
                    onValueChange={setAcquisitionCost}
                  />
                </div>
                <div className="col-md-4 mb-3">
                  <label htmlFor="salePrice" className="form-label">
                    Valor de venda
                  </label>
                  <MaskedInput
                    id="salePrice"
                    mask="currency"
                    className="form-control"
                    value={salePrice}
                    onValueChange={setSalePrice}
                  />
                </div>
                <div className="col-md-4 mb-3">
                  <label htmlFor="fipeValue" className="form-label">
                    FIPE
                  </label>
                  <MaskedInput
                    id="fipeValue"
                    mask="currency"
                    className="form-control"
                    value={fipeValue}
                    onValueChange={setFipeValue}
                  />
                </div>
              </div>
              {isConsignment ? (
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="consignmentNetValue" className="form-label">
                      Valor líquido proprietário
                    </label>
                    <MaskedInput
                      id="consignmentNetValue"
                      mask="currency"
                      className="form-control"
                      value={consignmentNetValue}
                      onValueChange={setConsignmentNetValue}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="consignmentPercent" className="form-label">
                      Percentual loja (%)
                    </label>
                    <MaskedInput
                      id="consignmentPercent"
                      mask="currency"
                      className="form-control"
                      value={consignmentPercent}
                      onValueChange={setConsignmentPercent}
                    />
                  </div>
                </div>
              ) : null}
              {error ? <div className="alert alert-danger py-2">{error}</div> : null}
              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Salvando...' : 'Entrar no estoque'}
                </button>
                <Link href="/inventory" className="btn btn-light">
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
