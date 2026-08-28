'use client';

import { FormEvent, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { TenantRow } from '@/types/platform';

interface TenantSettingsFormProps {
  tenant: TenantRow;
}

export function TenantSettingsForm({ tenant }: TenantSettingsFormProps) {
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

      const { error: updateError } = await supabase
        .from('tenants')
        .update({
          name: String(form.get('name')),
          slug: String(form.get('slug')),
          document: String(form.get('document') || '') || null,
          phone: String(form.get('phone') || '') || null,
          email: String(form.get('email') || '') || null,
          logo_url: String(form.get('logoUrl') || '') || null,
        })
        .eq('id', tenant.id);

      if (updateError) {
        setError(updateError.message);
        setLoading(false);
        return;
      }

      setSuccess('Configurações salvas.');
      router.refresh();
      setLoading(false);
    },
    [router, supabase, tenant.id],
  );

  return (
    <form onSubmit={handleSubmit}>
      <div className="row">
        <div className="col-md-6 mb-2">
          <label className="form-label form-label-sm">Nome da loja</label>
          <input
            name="name"
            className="form-control form-control-sm"
            defaultValue={tenant.name}
            required
          />
        </div>
        <div className="col-md-6 mb-2">
          <label className="form-label form-label-sm">Slug</label>
          <input
            name="slug"
            className="form-control form-control-sm"
            defaultValue={tenant.slug}
            required
          />
        </div>
        <div className="col-md-4 mb-2">
          <label className="form-label form-label-sm">CNPJ / CPF</label>
          <input
            name="document"
            className="form-control form-control-sm"
            defaultValue={tenant.document ?? ''}
          />
        </div>
        <div className="col-md-4 mb-2">
          <label className="form-label form-label-sm">Telefone</label>
          <input
            name="phone"
            className="form-control form-control-sm"
            defaultValue={tenant.phone ?? ''}
          />
        </div>
        <div className="col-md-4 mb-2">
          <label className="form-label form-label-sm">E-mail</label>
          <input
            name="email"
            type="email"
            className="form-control form-control-sm"
            defaultValue={tenant.email ?? ''}
          />
        </div>
        <div className="col-md-12 mb-2">
          <label className="form-label form-label-sm">URL do logo</label>
          <input
            name="logoUrl"
            className="form-control form-control-sm"
            defaultValue={tenant.logo_url ?? ''}
          />
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
