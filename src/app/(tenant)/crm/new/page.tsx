'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useCallback, useEffect, useState } from 'react';
import { PageTitle } from '@/components/dastone/PageTitle';
import { Card } from '@/components/dastone/Card';
import { FormPageSkeleton } from '@/components/dastone/skeleton/FormPageSkeleton';
import { createQuickDeal } from '@/lib/crm/deals';
import { createClient } from '@/lib/supabase/client';
import { getClientTenantContext } from '@/lib/settings/client-context';

interface ChannelOption {
  id: string;
  name: string;
}

export default function NewDealPage() {
  const router = useRouter();
  const supabase = createClient();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [socialHandle, setSocialHandle] = useState('');
  const [channelId, setChannelId] = useState('');
  const [nextActionAt, setNextActionAt] = useState('');
  const [nextActionNote, setNextActionNote] = useState('');
  const [channels, setChannels] = useState<ChannelOption[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    async function loadChannels() {
      const { data } = await supabase.from('channels').select('id, name').eq('is_active', true);
      setChannels(data ?? []);
      setInitialLoading(false);
    }

    loadChannels();
  }, [supabase]);

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
          nextActionAt: nextActionAt || undefined,
          nextActionNote: nextActionNote || undefined,
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
      channelId,
      email,
      fullName,
      nextActionAt,
      nextActionNote,
      phone,
      router,
      socialHandle,
      supabase,
    ],
  );

  if (initialLoading) {
    return <FormPageSkeleton fields={8} />;
  }

  return (
    <>
      <PageTitle
        title="Nova Ficha"
        subtitle="Cadastro rápido — nome + telefone + e-mail ou rede social"
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
                  <input
                    id="phone"
                    type="tel"
                    className="form-control"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
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
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="nextActionAt" className="form-label">
                    Próxima ação
                  </label>
                  <input
                    id="nextActionAt"
                    type="datetime-local"
                    className="form-control"
                    value={nextActionAt}
                    onChange={(e) => setNextActionAt(e.target.value)}
                    required
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label htmlFor="nextActionNote" className="form-label">
                    Observação da ação
                  </label>
                  <input
                    id="nextActionNote"
                    type="text"
                    className="form-control"
                    value={nextActionNote}
                    onChange={(e) => setNextActionNote(e.target.value)}
                    required
                  />
                </div>
              </div>
              {error ? <div className="alert alert-danger py-2">{error}</div> : null}
              {duplicateWarning ? (
                <div className="alert alert-warning py-2">{duplicateWarning}</div>
              ) : null}
              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Salvando...' : 'Abrir ficha'}
                </button>
                <Link href="/crm" className="btn btn-light">
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
