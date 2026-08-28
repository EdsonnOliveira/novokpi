'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useCallback, useState } from 'react';
import { MaskedInput } from '@/components/dastone/MaskedInput';
import { createClient } from '@/lib/supabase/client';

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();
  const [storeName, setStoreName] = useState('');
  const [document, setDocument] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setLoading(true);
      setError(null);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      const slug = slugify(storeName);
      const { data: tenant, error: tenantError } = await supabase
        .from('tenants')
        .insert({
          name: storeName,
          slug,
          document: document || null,
          phone: phone || null,
          email: user.email ?? null,
        })
        .select('id')
        .single();

      if (tenantError || !tenant) {
        setError('Não foi possível criar a loja. Tente outro nome.');
        setLoading(false);
        return;
      }

      const { data: adminRole, error: roleError } = await supabase
        .from('roles')
        .insert({
          tenant_id: tenant.id,
          name: 'Administrador',
          slug: 'admin',
          description: 'Acesso total à loja',
          is_system: true,
        })
        .select('id')
        .single();

      if (roleError || !adminRole) {
        setError('Erro ao configurar perfil administrador.');
        setLoading(false);
        return;
      }

      const { data: permissions } = await supabase.from('permissions').select('id');

      if (permissions?.length) {
        await supabase.from('role_permissions').insert(
          permissions.map((permission) => ({
            role_id: adminRole.id,
            permission_id: permission.id,
            granted: true,
          })),
        );
      }

      await supabase.from('user_roles').insert({
        user_id: user.id,
        role_id: adminRole.id,
        tenant_id: tenant.id,
      });

      const { data: starterPlan } = await supabase
        .from('plans')
        .select('id')
        .eq('slug', 'starter')
        .maybeSingle();

      if (starterPlan) {
        await supabase.from('subscriptions').insert({
          tenant_id: tenant.id,
          plan_id: starterPlan.id,
          status: 'active',
        });
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          tenant_id: tenant.id,
          full_name: user.user_metadata?.full_name ?? user.email,
          email: user.email,
          onboarding_completed: true,
        })
        .eq('id', user.id);

      if (profileError) {
        setError('Erro ao finalizar cadastro.');
        setLoading(false);
        return;
      }

      await supabase.from('timeline_events').insert({
        tenant_id: tenant.id,
        entity_type: 'tenant',
        entity_id: tenant.id,
        event_type: 'tenant_created',
        title: 'Loja criada',
        description: `Loja ${storeName} configurada`,
        user_id: user.id,
      });

      await supabase.from('audit_logs').insert({
        tenant_id: tenant.id,
        user_id: user.id,
        action: 'create',
        module: 'onboarding',
        entity_type: 'tenant',
        entity_id: tenant.id,
        new_data: { name: storeName, slug },
      });

      router.push('/dashboard');
      router.refresh();
    },
    [document, phone, router, storeName, supabase],
  );

  return (
    <div className="container-xxl">
      <div className="row vh-100 d-flex justify-content-center">
        <div className="col-12 align-self-center">
          <div className="card-body">
            <div className="row">
              <div className="col-lg-5 mx-auto">
                <div className="card">
                  <div className="card-body p-0 bg-black auth-header-box rounded-top">
                    <div className="text-center p-3">
                      <Link href="/login" className="logo logo-admin">
                        <img
                          src="/dastone/images/logo-sm.png"
                          height={50}
                          alt="logo"
                          className="auth-logo"
                        />
                      </Link>
                      <h4 className="mt-3 mb-1 fw-semibold text-white fs-18">Configure sua loja</h4>
                      <p className="text-muted fw-medium mb-0">Último passo antes de começar</p>
                    </div>
                  </div>
                  <div className="card-body">
                    <form className="my-4" onSubmit={handleSubmit}>
                      <div className="form-group mb-2">
                        <label className="form-label" htmlFor="storeName">
                          Nome da loja
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="storeName"
                          value={storeName}
                          onChange={(e) => setStoreName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="form-group mb-2">
                        <label className="form-label" htmlFor="document">
                          CNPJ (opcional)
                        </label>
                        <MaskedInput
                          mask="cpfCnpj"
                          id="document"
                          className="form-control"
                          value={document}
                          onValueChange={setDocument}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="phone">
                          Telefone (opcional)
                        </label>
                        <MaskedInput
                          mask="phone"
                          id="phone"
                          className="form-control"
                          value={phone}
                          onValueChange={setPhone}
                        />
                      </div>
                      {error ? (
                        <div className="alert alert-danger py-2 mt-3 mb-0">{error}</div>
                      ) : null}
                      <div className="form-group mb-0 row">
                        <div className="col-12">
                          <div className="d-grid mt-3">
                            <button className="btn btn-primary" type="submit" disabled={loading}>
                              {loading ? 'Salvando...' : 'Concluir e entrar'}
                              <i className="iconoir-check ms-1" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
