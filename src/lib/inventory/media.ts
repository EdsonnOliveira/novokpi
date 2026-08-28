import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import { writeTimelineEvent } from '@/lib/timeline/events';

interface UploadPhotoInput {
  tenantId: string;
  userId: string;
  passageId: string;
  file: File;
  isPublished?: boolean;
}

interface UploadReportInput {
  tenantId: string;
  userId: string;
  passageId: string;
  file: File;
  notes?: string;
}

interface RenewStockEntryInput {
  tenantId: string;
  userId: string;
  passageId: string;
}

export async function uploadVehiclePhoto(
  supabase: SupabaseClient<Database>,
  input: UploadPhotoInput,
) {
  const path = `${input.tenantId}/photos/${input.passageId}/${Date.now()}-${input.file.name}`;
  const { error: uploadError } = await supabase.storage
    .from('tenant-attachments')
    .upload(path, input.file);

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { data: lastPhoto } = await supabase
    .from('vehicle_photos')
    .select('sort_order')
    .eq('passage_id', input.passageId)
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle();

  const sortOrder = (lastPhoto?.sort_order ?? 0) + 1;

  const { data: photo, error } = await supabase
    .from('vehicle_photos')
    .insert({
      tenant_id: input.tenantId,
      passage_id: input.passageId,
      storage_path: path,
      sort_order: sortOrder,
      is_published: input.isPublished ?? false,
    })
    .select('id, storage_path')
    .single();

  if (error || !photo) {
    throw new Error('Não foi possível registrar foto.');
  }

  const { data: passage } = await supabase
    .from('vehicle_passages')
    .select('vehicle_id')
    .eq('id', input.passageId)
    .maybeSingle();

  if (passage?.vehicle_id) {
    await writeTimelineEvent(supabase, {
      tenantId: input.tenantId,
      entityType: 'vehicle',
      entityId: passage.vehicle_id,
      eventType: 'photo_uploaded',
      title: 'Nova foto adicionada',
      userId: input.userId,
    });
  }

  return photo;
}

export async function uploadVehicleReport(
  supabase: SupabaseClient<Database>,
  input: UploadReportInput,
) {
  const path = `${input.tenantId}/reports/${input.passageId}/${Date.now()}-${input.file.name}`;
  const { error: uploadError } = await supabase.storage
    .from('tenant-attachments')
    .upload(path, input.file);

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { data: report, error } = await supabase
    .from('vehicle_reports')
    .insert({
      tenant_id: input.tenantId,
      passage_id: input.passageId,
      storage_path: path,
      status: 'uploaded',
      notes: input.notes ?? null,
    })
    .select('id, storage_path')
    .single();

  if (error || !report) {
    throw new Error('Não foi possível registrar laudo.');
  }

  return report;
}

export async function renewStockEntry(
  supabase: SupabaseClient<Database>,
  input: RenewStockEntryInput,
) {
  const now = new Date().toISOString();

  const { error } = await supabase
    .from('vehicle_passages')
    .update({
      stock_started_at: now,
      status: 'in_stock',
    })
    .eq('id', input.passageId)
    .eq('tenant_id', input.tenantId);

  if (error) {
    throw new Error('Não foi possível renovar entrada.');
  }

  const { data: passage } = await supabase
    .from('vehicle_passages')
    .select('vehicle_id, passage_number')
    .eq('id', input.passageId)
    .maybeSingle();

  if (passage?.vehicle_id) {
    await writeTimelineEvent(supabase, {
      tenantId: input.tenantId,
      entityType: 'vehicle',
      entityId: passage.vehicle_id,
      eventType: 'stock_renewed',
      title: `Entrada renovada — Passagem #${passage.passage_number}`,
      userId: input.userId,
    });
  }
}

export function getStoragePublicUrl(
  supabase: SupabaseClient<Database>,
  path: string,
) {
  return supabase.storage.from('tenant-attachments').getPublicUrl(path).data.publicUrl;
}
