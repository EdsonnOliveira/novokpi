import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import { writeAuditLog } from '@/lib/timeline/audit';

interface SyncPortalAdInput {
  tenantId: string;
  userId: string;
  adId: string;
}

interface PortalAdSyncRow {
  id: string;
  passage_id: string | null;
  external_id: string | null;
  portal_integration_id: string | null;
  vehicle_passages:
    | {
        passage_number: number | null;
        sale_price: number | null;
        km: number | null;
        vehicles:
          | {
              plate: string | null;
              color: string | null;
              year_model: number | null;
              vehicle_brands: { name: string } | { name: string }[] | null;
              vehicle_models: { name: string } | { name: string }[] | null;
              vehicle_versions: { name: string } | { name: string }[] | null;
            }
          | {
              plate: string | null;
              color: string | null;
              year_model: number | null;
              vehicle_brands: { name: string } | { name: string }[] | null;
              vehicle_models: { name: string } | { name: string }[] | null;
              vehicle_versions: { name: string } | { name: string }[] | null;
            }[]
          | null;
      }
    | {
        passage_number: number | null;
        sale_price: number | null;
        km: number | null;
        vehicles:
          | {
              plate: string | null;
              color: string | null;
              year_model: number | null;
              vehicle_brands: { name: string } | { name: string }[] | null;
              vehicle_models: { name: string } | { name: string }[] | null;
              vehicle_versions: { name: string } | { name: string }[] | null;
            }
          | {
              plate: string | null;
              color: string | null;
              year_model: number | null;
              vehicle_brands: { name: string } | { name: string }[] | null;
              vehicle_models: { name: string } | { name: string }[] | null;
              vehicle_versions: { name: string } | { name: string }[] | null;
            }[]
          | null;
      }[]
    | null;
  portal_integrations:
    | { portal_name: string; portal_slug: string }
    | { portal_name: string; portal_slug: string }[]
    | null;
}

function joinName(
  value: { name: string } | { name: string }[] | null | undefined,
) {
  if (!value) return null;
  return Array.isArray(value) ? value[0]?.name ?? null : value.name;
}

export async function syncPortalAd(
  supabase: SupabaseClient<Database>,
  input: SyncPortalAdInput,
) {
  const { data: adData } = await supabase
    .from('vehicle_portal_ads')
    .select(`
      id,
      passage_id,
      external_id,
      status,
      passage_id,
      portal_integration_id,
      vehicle_passages:passage_id (
        passage_number,
        sale_price,
        km,
        vehicles:vehicle_id (
          plate,
          color,
          year_model,
          vehicle_brands:brand_id ( name ),
          vehicle_models:model_id ( name ),
          vehicle_versions:version_id ( name )
        )
      ),
      portal_integrations:portal_integration_id ( portal_name, portal_slug )
    `)
    .eq('id', input.adId)
    .eq('tenant_id', input.tenantId)
    .maybeSingle();

  const ad = adData as PortalAdSyncRow | null;

  if (!ad) {
    throw new Error('Anúncio não encontrado.');
  }

  const passage = Array.isArray(ad.vehicle_passages) ? ad.vehicle_passages[0] : ad.vehicle_passages;
  const vehicle = passage?.vehicles
    ? Array.isArray(passage.vehicles)
      ? passage.vehicles[0]
      : passage.vehicles
    : null;
  const portal = Array.isArray(ad.portal_integrations)
    ? ad.portal_integrations[0]
    : ad.portal_integrations;

  const { count: photoCount } = await supabase
    .from('vehicle_photos')
    .select('*', { count: 'exact', head: true })
    .eq('passage_id', ad.passage_id ?? '');

  const brand = joinName(vehicle?.vehicle_brands);
  const model = joinName(vehicle?.vehicle_models);
  const version = joinName(vehicle?.vehicle_versions);
  const vehicleLabel = [brand, model, version].filter(Boolean).join(' ');
  const plate = vehicle?.plate ?? '';
  const portalSlug = portal?.portal_slug ?? 'portal';
  const passageRef = passage?.passage_number
    ? String(passage.passage_number).padStart(6, '0')
    : plate.replace(/\W/g, '').toUpperCase();

  const syncPayload = {
    portal_slug: portalSlug,
    portal_name: portal?.portal_name ?? null,
    passage_number: passage?.passage_number ?? null,
    plate,
    vehicle_label: vehicleLabel,
    year_model: vehicle?.year_model ?? null,
    color: vehicle?.color ?? null,
    km: passage?.km ?? null,
    sale_price: passage?.sale_price ?? null,
    photo_count: photoCount ?? 0,
    synced_at: new Date().toISOString(),
  };

  const externalId = ad.external_id ?? `${portalSlug}-${passageRef}`;
  const now = new Date().toISOString();

  const { error: adError } = await supabase
    .from('vehicle_portal_ads')
    .update({
      status: 'published',
      external_id: externalId,
      published_at: now,
      last_sync_at: now,
      sync_message: `Publicado em ${portal?.portal_name ?? 'portal'} — ${plate || vehicleLabel}`,
      sync_payload: syncPayload,
    } as never)
    .eq('id', input.adId);

  if (adError) {
    throw new Error('Não foi possível sincronizar anúncio.');
  }

  if (ad.portal_integration_id) {
    await supabase
      .from('portal_integrations')
      .update({
        last_sync_at: now,
        sync_status: 'success',
        sync_message: `Sync concluída — ${plate || vehicleLabel}`,
      })
      .eq('id', ad.portal_integration_id);
  }

  await writeAuditLog(supabase, {
    tenantId: input.tenantId,
    userId: input.userId,
    action: 'update',
    module: 'integrator',
    entityType: 'vehicle_portal_ad',
    entityId: input.adId,
    newData: { status: 'published', external_id: externalId, sync_payload: syncPayload },
  });

  return { externalId, publishedAt: now, syncPayload };
}

export async function createPortalAdForPassage(
  supabase: SupabaseClient<Database>,
  input: {
    tenantId: string;
    userId: string;
    passageId: string;
    portalIntegrationId: string;
  },
) {
  const { data: ad, error } = await supabase
    .from('vehicle_portal_ads')
    .insert({
      tenant_id: input.tenantId,
      passage_id: input.passageId,
      portal_integration_id: input.portalIntegrationId,
      status: 'pending',
    })
    .select('id')
    .single();

  if (error || !ad) {
    throw new Error('Não foi possível criar anúncio.');
  }

  return syncPortalAd(supabase, {
    tenantId: input.tenantId,
    userId: input.userId,
    adId: ad.id,
  });
}
