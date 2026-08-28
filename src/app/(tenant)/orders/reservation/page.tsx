'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useCallback, useEffect, useState } from 'react';
import { PageTitle } from '@/components/dastone/PageTitle';
import { Card } from '@/components/dastone/Card';
import { FormPageSkeleton } from '@/components/dastone/skeleton/FormPageSkeleton';
import { createReservation } from '@/lib/orders/orders';
import { createClient } from '@/lib/supabase/client';
import { getClientTenantContext } from '@/lib/settings/client-context';
import type { PaymentMethod, ProductType } from '@/types/orders';

interface DealOption {
  id: string;
  deal_number: number;
  person_id: string;
  channel_id: string | null;
  people: { full_name: string } | { full_name: string }[] | null;
}

interface PassageOption {
  id: string;
  sale_price: number | null;
  cost: number | null;
  vehicles: {
    plate: string | null;
    vehicle_brands: { name: string } | { name: string }[] | null;
    vehicle_models: { name: string } | { name: string }[] | null;
  } | {
    plate: string | null;
    vehicle_brands: { name: string } | { name: string }[] | null;
    vehicle_models: { name: string } | { name: string }[] | null;
  }[] | null;
}

function joinOne<T>(value: T | T[] | null): T | null {
  if (!value) return null;
  return Array.isArray(value) ? value[0] ?? null : value;
}

export default function ReservationPage() {
  const router = useRouter();
  const supabase = createClient();
  const [deals, setDeals] = useState<DealOption[]>([]);
  const [passages, setPassages] = useState<PassageOption[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [dealId, setDealId] = useState('');
  const [passageId, setPassageId] = useState('');
  const [vehicleValue, setVehicleValue] = useState('');
  const [totalValue, setTotalValue] = useState('');
  const [paymentMethodId, setPaymentMethodId] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [productTypeId, setProductTypeId] = useState('');
  const [productAmount, setProductAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    async function loadOptions() {
      const [dealsRes, passagesRes, methodsRes, typesRes] = await Promise.all([
        supabase
          .from('deals')
          .select('id, deal_number, person_id, channel_id, people:person_id ( full_name )')
          .eq('status', 'open')
          .order('created_at', { ascending: false })
          .limit(50),
        supabase
          .from('vehicle_passages')
          .select(`
            id,
            sale_price,
            cost,
            vehicles:vehicle_id (
              plate,
              vehicle_brands:brand_id ( name ),
              vehicle_models:model_id ( name )
            )
          `)
          .eq('status', 'in_stock')
          .order('stock_started_at', { ascending: false })
          .limit(50),
        supabase.from('payment_methods').select('id, name, slug').eq('is_active', true).order('sort_order'),
        supabase.from('product_types').select('id, name, slug').eq('is_active', true).order('sort_order'),
      ]);

      setDeals((dealsRes.data ?? []) as DealOption[]);
      setPassages((passagesRes.data ?? []) as PassageOption[]);
      setPaymentMethods(methodsRes.data ?? []);
      setProductTypes(typesRes.data ?? []);
      setInitialLoading(false);
    }

    loadOptions();
  }, [supabase]);

  useEffect(() => {
    const passage = passages.find((p) => p.id === passageId);
    if (passage?.sale_price) {
      setVehicleValue(String(passage.sale_price));
      setTotalValue(String(passage.sale_price));
      setPaymentAmount(String(passage.sale_price));
    }
  }, [passageId, passages]);

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

      const deal = deals.find((d) => d.id === dealId);
      if (!deal) {
        setError('Selecione uma ficha.');
        setLoading(false);
        return;
      }

      const selectedMethod = paymentMethods.find((m) => m.id === paymentMethodId);
      const selectedProduct = productTypes.find((p) => p.id === productTypeId);

      try {
        const result = await createReservation(supabase, {
          tenantId: context.tenantId,
          userId: context.userId,
          dealId,
          personId: deal.person_id,
          vehiclePassageId: passageId,
          channelId: deal.channel_id ?? undefined,
          vehicleValue: Number(vehicleValue),
          totalValue: Number(totalValue),
          notes: notes || undefined,
          payments: paymentAmount
            ? [
                {
                  paymentMethodId: paymentMethodId || undefined,
                  paymentMethodName: selectedMethod?.name,
                  amount: Number(paymentAmount),
                },
              ]
            : undefined,
          products: selectedProduct
            ? [
                {
                  productTypeId: selectedProduct.id,
                  productName: selectedProduct.name,
                  amount: productAmount ? Number(productAmount) : undefined,
                },
              ]
            : undefined,
        });

        router.push(`/orders/${result.id}`);
        router.refresh();
      } catch (submitError) {
        setError(submitError instanceof Error ? submitError.message : 'Erro ao reservar.');
        setLoading(false);
      }
    },
    [
      dealId,
      deals,
      notes,
      passageId,
      paymentAmount,
      paymentMethodId,
      paymentMethods,
      productAmount,
      productTypeId,
      productTypes,
      router,
      supabase,
      totalValue,
      vehicleValue,
    ],
  );

  if (initialLoading) {
    return <FormPageSkeleton fields={8} />;
  }

  return (
    <>
      <PageTitle
        title="Reserva / Finalização"
        subtitle="Avançar negociação para reserva"
        breadcrumbs={[
          { label: 'Pedidos', href: '/orders' },
          { label: 'Reserva' },
        ]}
      />
      <div className="row">
        <div className="col-lg-8">
          <Card title="Dados da reserva">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="dealId" className="form-label">
                  Ficha (negociação aberta)
                </label>
                <select
                  id="dealId"
                  className="form-select"
                  value={dealId}
                  onChange={(e) => setDealId(e.target.value)}
                  required
                >
                  <option value="">Selecione</option>
                  {deals.map((deal) => {
                    const person = joinOne(deal.people);
                    return (
                      <option key={deal.id} value={deal.id}>
                        #{String(deal.deal_number).padStart(6, '0')} — {person?.full_name ?? 'Cliente'}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div className="mb-3">
                <label htmlFor="passageId" className="form-label">
                  Veículo em estoque
                </label>
                <select
                  id="passageId"
                  className="form-select"
                  value={passageId}
                  onChange={(e) => setPassageId(e.target.value)}
                  required
                >
                  <option value="">Selecione</option>
                  {passages.map((passage) => {
                    const vehicle = joinOne(passage.vehicles);
                    const brand = joinOne(vehicle?.vehicle_brands ?? null);
                    const model = joinOne(vehicle?.vehicle_models ?? null);
                    return (
                      <option key={passage.id} value={passage.id}>
                        {vehicle?.plate ?? '—'} — {brand?.name} {model?.name}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="vehicleValue" className="form-label">
                    Valor do veículo
                  </label>
                  <input
                    id="vehicleValue"
                    type="number"
                    step="0.01"
                    className="form-control"
                    value={vehicleValue}
                    onChange={(e) => setVehicleValue(e.target.value)}
                    required
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label htmlFor="totalValue" className="form-label">
                    Valor total da operação
                  </label>
                  <input
                    id="totalValue"
                    type="number"
                    step="0.01"
                    className="form-control"
                    value={totalValue}
                    onChange={(e) => setTotalValue(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="row">
                <div className="col-md-4 mb-3">
                  <label htmlFor="paymentMethodId" className="form-label">
                    Forma de pagamento
                  </label>
                  <select
                    id="paymentMethodId"
                    className="form-select"
                    value={paymentMethodId}
                    onChange={(e) => setPaymentMethodId(e.target.value)}
                  >
                    <option value="">Selecione</option>
                    {paymentMethods.map((method) => (
                      <option key={method.id} value={method.id}>
                        {method.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-4 mb-3">
                  <label htmlFor="paymentAmount" className="form-label">
                    Valor pagamento
                  </label>
                  <input
                    id="paymentAmount"
                    type="number"
                    step="0.01"
                    className="form-control"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                  />
                </div>
                <div className="col-md-4 mb-3">
                  <label htmlFor="productTypeId" className="form-label">
                    Produto adicional
                  </label>
                  <select
                    id="productTypeId"
                    className="form-select"
                    value={productTypeId}
                    onChange={(e) => setProductTypeId(e.target.value)}
                  >
                    <option value="">Nenhum</option>
                    {productTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {productTypeId ? (
                <div className="mb-3">
                  <label htmlFor="productAmount" className="form-label">
                    Valor produto adicional
                  </label>
                  <input
                    id="productAmount"
                    type="number"
                    step="0.01"
                    className="form-control"
                    value={productAmount}
                    onChange={(e) => setProductAmount(e.target.value)}
                  />
                </div>
              ) : null}
              <div className="mb-3">
                <label htmlFor="notes" className="form-label">
                  Observações
                </label>
                <textarea
                  id="notes"
                  className="form-control"
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
              {error ? <div className="alert alert-danger py-2">{error}</div> : null}
              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Salvando...' : 'Confirmar reserva'}
                </button>
                <Link href="/orders" className="btn btn-light">
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
