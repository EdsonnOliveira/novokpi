'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { addToOfferQueue } from '@/lib/crm/queues';
import { createClient } from '@/lib/supabase/client';
import { getClientTenantContext } from '@/lib/settings/client-context';

interface VehicleOption {
  id: string;
  label: string;
}

export function OfferQueueForm() {
  const supabase = createClient();
  const [vehicles, setVehicles] = useState<VehicleOption[]>([]);
  const [vehicleId, setVehicleId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadVehicles() {
      const { data } = await supabase
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
        .eq('status', 'in_stock')
        .limit(100);

      const rows = (data ?? []) as Array<{
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
            const brand = Array.isArray(vehicle.vehicle_brands)
              ? vehicle.vehicle_brands[0]?.name
              : vehicle.vehicle_brands?.name;
            const model = Array.isArray(vehicle.vehicle_models)
              ? vehicle.vehicle_models[0]?.name
              : vehicle.vehicle_models?.name;
            return {
              id: vehicle.id,
              label: [vehicle.plate, brand, model].filter(Boolean).join(' — '),
            };
          })
          .filter((item): item is VehicleOption => Boolean(item)),
      );
    }

    loadVehicles();
  }, [supabase]);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setLoading(true);
      setError(null);

      try {
        const context = await getClientTenantContext(supabase);
      if (!context) throw new Error('Sessão inválida.');

        await addToOfferQueue(supabase, {
          tenantId: context.tenantId,
          userId: context.userId,
          vehicleId,
        });

        window.location.reload();
      } catch (submitError) {
        setError(submitError instanceof Error ? submitError.message : 'Erro ao incluir.');
      } finally {
        setLoading(false);
      }
    },
    [supabase, vehicleId],
  );

  return (
    <form onSubmit={handleSubmit} className="mb-3">
      <div className="row">
        <div className="col-md-8 mb-2">
          <select className="form-select form-select-sm" value={vehicleId} onChange={(e) => setVehicleId(e.target.value)} required>
            <option value="">Selecione veículo em estoque</option>
            {vehicles.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>{vehicle.label}</option>
            ))}
          </select>
        </div>
        <div className="col-md-4 mb-2">
          <button type="submit" className="btn btn-primary btn-sm w-100" disabled={loading}>
            <i className="iconoir-check me-1" aria-hidden="true" />
            {loading ? 'Incluindo...' : 'Incluir na fila oferta'}
          </button>
        </div>
      </div>
      {error ? <div className="alert alert-danger py-1 px-2 mb-0">{error}</div> : null}
    </form>
  );
}
