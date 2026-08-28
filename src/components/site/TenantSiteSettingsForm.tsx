'use client';

import { FormEvent, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { syncTenantSiteInventory } from '@/lib/site/inventory-sync';
import { createClient } from '@/lib/supabase/client';
import type { TenantSiteSettingsRow } from '@/types/platform';

interface TenantSiteSettingsFormProps {
  tenantId: string;
  settings: TenantSiteSettingsRow | null;
}

export function TenantSiteSettingsForm({ tenantId, settings }: TenantSiteSettingsFormProps) {
  const router = useRouter();
  const supabase = createClient();
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
      const payload = {
        tenant_id: tenantId,
        domain: String(form.get('domain') || '') || null,
        is_published: form.get('isPublished') === 'on',
        sync_inventory: form.get('syncInventory') === 'on',
        theme: {
          primaryColor: String(form.get('primaryColor') || ''),
        },
        seo: {
          title: String(form.get('seoTitle') || ''),
          description: String(form.get('seoDescription') || ''),
        },
      };

      const query = settings?.id
        ? supabase.from('tenant_site_settings').update(payload).eq('id', settings.id)
        : supabase.from('tenant_site_settings').insert(payload);

      const { error: saveError } = await query;

      if (saveError) {
        setError(saveError.message);
        setLoading(false);
        return;
      }

      if (payload.sync_inventory) {
        const syncedCount = await syncTenantSiteInventory(supabase, tenantId);
        setSuccess(`Site atualizado. ${syncedCount} veículo(s) sincronizado(s).`);
      } else {
        setSuccess('Site atualizado.');
      }

      router.refresh();
      setLoading(false);
    },
    [router, settings?.id, supabase, tenantId],
  );

  return (
    <form onSubmit={handleSubmit}>
      <div className="row">
        <div className="col-md-6 mb-2">
          <label className="form-label form-label-sm">Domínio</label>
          <input
            name="domain"
            className="form-control form-control-sm"
            placeholder="loja.seudominio.com.br"
            defaultValue={settings?.domain ?? ''}
          />
        </div>
        <div className="col-md-6 mb-2">
          <label className="form-label form-label-sm">Cor primária</label>
          <input
            name="primaryColor"
            className="form-control form-control-sm"
            placeholder="#0d6efd"
            defaultValue={settings?.theme?.primaryColor ?? ''}
          />
        </div>
        <div className="col-md-6 mb-2">
          <label className="form-label form-label-sm">Título SEO</label>
          <input
            name="seoTitle"
            className="form-control form-control-sm"
            defaultValue={settings?.seo?.title ?? ''}
          />
        </div>
        <div className="col-md-6 mb-2">
          <label className="form-label form-label-sm">Descrição SEO</label>
          <input
            name="seoDescription"
            className="form-control form-control-sm"
            defaultValue={settings?.seo?.description ?? ''}
          />
        </div>
        <div className="col-md-6 mb-2">
          <div className="form-check mt-4">
            <input
              name="isPublished"
              type="checkbox"
              className="form-check-input"
              id="isPublished"
              defaultChecked={settings?.is_published ?? false}
            />
            <label className="form-check-label" htmlFor="isPublished">
              Site publicado
            </label>
          </div>
        </div>
        <div className="col-md-6 mb-2">
          <div className="form-check mt-4">
            <input
              name="syncInventory"
              type="checkbox"
              className="form-check-input"
              id="syncInventory"
              defaultChecked={settings?.sync_inventory ?? true}
            />
            <label className="form-check-label" htmlFor="syncInventory">
              Sincronizar estoque automaticamente
            </label>
          </div>
        </div>
      </div>
      {error ? <p className="text-danger small mb-2">{error}</p> : null}
      {success ? <p className="text-success small mb-2">{success}</p> : null}
      <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>
        {loading ? 'Salvando...' : 'Salvar'}
      </button>
    </form>
  );
}
