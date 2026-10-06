'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useCallback, useEffect, useState } from 'react';
import { PageTitle } from '@/components/dastone/PageTitle';
import { Card } from '@/components/dastone/Card';
import { MaskedInput } from '@/components/dastone/MaskedInput';
import { FormPageSkeleton } from '@/components/dastone/skeleton/FormPageSkeleton';
import { createQuickDeal } from '@/lib/crm/deals';
import { normalizePlate } from '@/lib/integrations/plates';
import { parseMaskNumber } from '@/lib/masks';
import { createClient } from '@/lib/supabase/client';
import { getClientTenantContext } from '@/lib/settings/client-context';

interface ChannelOption {
  id: string;
  name: string;
}

interface VehicleOption {
  id: string;
  plate: string;
  label: string;
}

interface PlateLookupResponse {
  plate: string;
  brand: string;
  model: string;
  version: string;
  yearModel: number | null;
  color: string | null;
}

type InterestMode = 'stock' | 'wait_queue';

export default function NewDealPage() {
  const router = useRouter();
  const supabase = createClient();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [socialHandle, setSocialHandle] = useState('');
  const [channelId, setChannelId] = useState('');
  const [interestMode, setInterestMode] = useState<InterestMode>('stock');
  const [interestPlate, setInterestPlate] = useState('');
  const [plateLookupLoading, setPlateLookupLoading] = useState(false);
  const [plateLookupInfo, setPlateLookupInfo] = useState<string | null>(null);
  const [vehicleId, setVehicleId] = useState('');
  const [vehicles, setVehicles] = useState<VehicleOption[]>([]);
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [version, setVersion] = useState('');
  const [yearMin, setYearMin] = useState('');
  const [yearMax, setYearMax] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [interestNotes, setInterestNotes] = useState('');
  const [channels, setChannels] = useState<ChannelOption[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    async function loadOptions() {
      const context = await getClientTenantContext(supabase);
      const [channelsRes, passagesRes] = await Promise.all([
        supabase.from('channels').select('id, name').eq('is_active', true),
        context
          ? supabase
              .from('vehicle_passages')
              .select(`
                vehicle_id,
                vehicles:vehicle_id (
                  id,
                  plate,
                  vehicle_brands:brand_id ( name ),
                  vehicle_models:model_id ( name )
                )
              `)
              .eq('tenant_id', context.tenantId)
              .eq('status', 'in_stock')
              .order('stock_started_at', { ascending: false })
              .limit(200)
          : Promise.resolve({ data: [] }),
      ]);

      setChannels(channelsRes.data ?? []);

      const rows = (passagesRes.data ?? []) as Array<{
        vehicle_id: string | null;
        vehicles:
          | {
              id: string;
              plate: string | null;
              vehicle_brands: { name: string } | { name: string }[] | null;
              vehicle_models: { name: string } | { name: string }[] | null;
            }
          | {
              id: string;
              plate: string | null;
              vehicle_brands: { name: string } | { name: string }[] | null;
              vehicle_models: { name: string } | { name: string }[] | null;
            }[]
          | null;
      }>;

      setVehicles(
        rows
          .map((passage) => {
            const vehicle = Array.isArray(passage.vehicles) ? passage.vehicles[0] : passage.vehicles;
            if (!vehicle?.id) return null;
            const brandName = Array.isArray(vehicle.vehicle_brands)
              ? vehicle.vehicle_brands[0]?.name
              : vehicle.vehicle_brands?.name;
            const modelName = Array.isArray(vehicle.vehicle_models)
              ? vehicle.vehicle_models[0]?.name
              : vehicle.vehicle_models?.name;
            return {
              id: vehicle.id,
              plate: vehicle.plate ? normalizePlate(vehicle.plate) : '',
              label: [vehicle.plate, brandName, modelName].filter(Boolean).join(' — '),
            };
          })
          .filter((item): item is VehicleOption => Boolean(item)),
      );
      setInitialLoading(false);
    }

    loadOptions();
  }, [supabase]);

  const handlePlateLookup = useCallback(async () => {
    setPlateLookupLoading(true);
    setPlateLookupInfo(null);
    setError(null);

    try {
      const response = await fetch(`/api/vehicles/plate-lookup?plate=${encodeURIComponent(interestPlate)}`);
      const payload = (await response.json()) as PlateLookupResponse & { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? 'Erro ao consultar placa.');
      }

      setInterestPlate(payload.plate);
      setBrand(payload.brand);
      setModel(payload.model);
      setVersion(payload.version);
      if (payload.yearModel) {
        setYearMin(String(payload.yearModel));
        setYearMax(String(payload.yearModel));
      }

      const stockVehicle = vehicles.find((vehicle) => vehicle.plate === payload.plate);
      if (stockVehicle) {
        setInterestMode('stock');
        setVehicleId(stockVehicle.id);
        setPlateLookupInfo('Veículo encontrado no estoque da loja.');
      } else {
        setInterestMode('wait_queue');
        setVehicleId('');
        setPlateLookupInfo('Veículo não está no estoque — perfil preenchido para fila de espera.');
      }
    } catch (lookupError) {
      setError(lookupError instanceof Error ? lookupError.message : 'Erro ao consultar placa.');
    } finally {
      setPlateLookupLoading(false);
    }
  }, [interestPlate, vehicles]);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setLoading(true);
      setError(null);
      setDuplicateWarning(null);

      const context = await getClientTenantContext(supabase);

      if (!context) {
        setError('Loja não configurada.');
        setLoading(false);
        return;
      }

      try {
        const result = await createQuickDeal(supabase, {
          tenantId: context.tenantId,
          userId: context.userId,
          fullName,
          phone: phone || undefined,
          email: email || undefined,
          socialHandle: socialHandle || undefined,
          channelId: channelId || undefined,
          interestMode,
          interestPlate,
          vehicleId: interestMode === 'stock' ? vehicleId : undefined,
          interest:
            interestMode === 'wait_queue'
              ? {
                  plate: interestPlate,
                  brand: brand || undefined,
                  model: model || undefined,
                  version: version || undefined,
                  yearMin: yearMin ? Number(yearMin) : undefined,
                  yearMax: yearMax ? Number(yearMax) : undefined,
                  priceMin: priceMin ? parseMaskNumber(priceMin) : undefined,
                  priceMax: priceMax ? parseMaskNumber(priceMax) : undefined,
                  notes: interestNotes || undefined,
                }
              : undefined,
        });

        if (result.duplicates.length) {
          setDuplicateWarning(
            `Duplicidade detectada — Ficha #${String(result.duplicates[0].dealNumber).padStart(6, '0')}`,
          );
        }

        router.push(`/crm/${result.deal.id}`);
        router.refresh();
      } catch (submitError) {
        setError(submitError instanceof Error ? submitError.message : 'Erro ao criar ficha.');
        setLoading(false);
      }
    },
    [
      brand,
      channelId,
      email,
      fullName,
      interestMode,
      interestPlate,
      interestNotes,
      model,
      phone,
      priceMax,
      priceMin,
      router,
      socialHandle,
      supabase,
      vehicleId,
      version,
      yearMax,
      yearMin,
    ],
  );

  if (initialLoading) {
    return <FormPageSkeleton fields={10} />;
  }

  return (
    <>
      <PageTitle
        title="Nova Ficha"
        subtitle="Cadastro rápido — cliente + veículo de interesse"
        breadcrumbs={[
          { label: 'CRM', href: '/crm' },
          { label: 'Nova Ficha' },
        ]}
      />
      <div className="row">
        <div className="col-lg-8">
          <Card title="Dados iniciais">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="fullName" className="form-label">
                  Nome
                </label>
                <input
                  id="fullName"
                  type="text"
                  className="form-control"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="phone" className="form-label">
                    Telefone
                  </label>
                  <MaskedInput
                    id="phone"
                    mask="phone"
                    className="form-control"
                    value={phone}
                    onValueChange={setPhone}
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label htmlFor="email" className="form-label">
                    E-mail
                  </label>
                  <input
                    id="email"
                    type="email"
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <div className="mb-3">
                <label htmlFor="socialHandle" className="form-label">
                  Rede social
                </label>
                <input
                  id="socialHandle"
                  type="text"
                  className="form-control"
                  value={socialHandle}
                  onChange={(e) => setSocialHandle(e.target.value)}
                  placeholder="@usuario ou link"
                />
              </div>
              <div className="mb-3">
                <label htmlFor="channelId" className="form-label">
                  Origem / Canal
                </label>
                <select
                  id="channelId"
                  className="form-select"
                  value={channelId}
                  onChange={(e) => setChannelId(e.target.value)}
                >
                  <option value="">Selecione</option>
                  {channels.map((channel) => (
                    <option key={channel.id} value={channel.id}>
                      {channel.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <span className="form-label d-block">Veículo de interesse</span>
                <div className="mb-2">
                  <label htmlFor="interestPlate" className="form-label">
                    Placa
                  </label>
                  <div className="input-group">
                    <MaskedInput
                      id="interestPlate"
                      mask="plate"
                      className="form-control"
                      value={interestPlate}
                      onValueChange={setInterestPlate}
                      required
                    />
                    <button
                      type="button"
                      className="btn btn-light"
                      onClick={handlePlateLookup}
                      disabled={plateLookupLoading || !interestPlate}
                    >
                      <i className="iconoir-search me-1" aria-hidden="true" />
                      {plateLookupLoading ? 'Consultando...' : 'Consultar placa'}
                    </button>
                  </div>
                  {plateLookupInfo ? (
                    <p className="form-text text-muted mb-0 mt-1">{plateLookupInfo}</p>
                  ) : null}
                </div>
                <div className="d-flex flex-wrap gap-3 mb-2">
                  <div className="form-check">
                    <input
                      id="interestStock"
                      type="radio"
                      className="form-check-input"
                      name="interestMode"
                      checked={interestMode === 'stock'}
                      onChange={() => setInterestMode('stock')}
                    />
                    <label className="form-check-label" htmlFor="interestStock">
                      Veículo em estoque
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      id="interestWaitQueue"
                      type="radio"
                      className="form-check-input"
                      name="interestMode"
                      checked={interestMode === 'wait_queue'}
                      onChange={() => setInterestMode('wait_queue')}
                    />
                    <label className="form-check-label" htmlFor="interestWaitQueue">
                      Fila de espera
                    </label>
                  </div>
                </div>
                {interestMode === 'stock' ? (
                  <select
                    id="vehicleId"
                    className="form-select"
                    value={vehicleId}
                    onChange={(e) => setVehicleId(e.target.value)}
                    required
                  >
                    <option value="">Selecione o veículo em estoque</option>
                    {vehicles.map((vehicle) => (
                      <option key={vehicle.id} value={vehicle.id}>
                        {vehicle.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="row">
                    <div className="col-md-4 mb-2">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Marca"
                        value={brand}
                        onChange={(e) => setBrand(e.target.value)}
                      />
                    </div>
                    <div className="col-md-4 mb-2">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Modelo"
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                      />
                    </div>
                    <div className="col-md-4 mb-2">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Versão"
                        value={version}
                        onChange={(e) => setVersion(e.target.value)}
                      />
                    </div>
                    <div className="col-md-3 mb-2">
                      <MaskedInput
                        mask="digits"
                        maxDigits={4}
                        className="form-control"
                        placeholder="Ano mín."
                        value={yearMin}
                        onValueChange={setYearMin}
                      />
                    </div>
                    <div className="col-md-3 mb-2">
                      <MaskedInput
                        mask="digits"
                        maxDigits={4}
                        className="form-control"
                        placeholder="Ano máx."
                        value={yearMax}
                        onValueChange={setYearMax}
                      />
                    </div>
                    <div className="col-md-3 mb-2">
                      <MaskedInput
                        mask="currency"
                        className="form-control"
                        placeholder="Preço mín."
                        value={priceMin}
                        onValueChange={setPriceMin}
                      />
                    </div>
                    <div className="col-md-3 mb-2">
                      <MaskedInput
                        mask="currency"
                        className="form-control"
                        placeholder="Preço máx."
                        value={priceMax}
                        onValueChange={setPriceMax}
                      />
                    </div>
                    <div className="col-12 mb-2">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Observações do interesse"
                        value={interestNotes}
                        onChange={(e) => setInterestNotes(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>
              {error ? <div className="alert alert-danger py-2">{error}</div> : null}
              {duplicateWarning ? (
                <div className="alert alert-warning py-2">{duplicateWarning}</div>
              ) : null}
              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  <i className="iconoir-check me-1" aria-hidden="true" />
                  {loading ? 'Salvando...' : 'Abrir ficha'}
                </button>
                <Link href="/crm" className="btn btn-light">
                  <i className="iconoir-arrow-left me-1" aria-hidden="true" />
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
