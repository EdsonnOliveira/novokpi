import { PageTitle } from '@/components/dastone/PageTitle';
import { Card } from '@/components/dastone/Card';
import { CertificateUploadForm } from '@/components/fiscal/CertificateUploadForm';
import { FiscalSettingsForm } from '@/components/fiscal/FiscalSettingsForm';
import { createClient } from '@/lib/supabase/server';
import { getOrCreateFiscalSettings } from '@/lib/fiscal/documents';
import { getTenantContext } from '@/lib/settings/tenant-context';
import { isFisqalConfigured } from '@/lib/fisqal/client';
import type { FiscalSettingsRow } from '@/types/fiscal';
import { redirect } from 'next/navigation';

export default async function FiscalSettingsPage() {
  const supabase = await createClient();
  const context = await getTenantContext(supabase);

  if (!context) {
    redirect('/login');
  }

  const settings = (await getOrCreateFiscalSettings(
    supabase,
    context.tenantId,
  )) as FiscalSettingsRow;

  return (
    <>
      <PageTitle
        title="Configuração fiscal"
        subtitle="Empresa emitente e certificado digital na FISQAL"
        breadcrumbs={[
          { label: 'Fiscal / Notas', href: '/fiscal' },
          { label: 'Configuração' },
        ]}
      />
      {!isFisqalConfigured() ? (
        <div className="alert alert-warning py-2 mb-3">
          Adicione <code>FISQAL_API_KEY</code> no <code>.env.local</code> do servidor.
        </div>
      ) : null}
      <Card title="Dados da empresa" className="mb-3">
        <p className="text-muted small">
          Status FISQAL: {settings.company_status} · Ambiente: {settings.fiscal_ambiente}
          {settings.fisqal_company_id ? ` · ID: ${settings.fisqal_company_id}` : ''}
        </p>
        <FiscalSettingsForm settings={settings} />
      </Card>
      <Card title="Certificado digital A1">
        <p className="text-muted small mb-2">
          Status: {settings.certificate_status ?? 'não enviado'}
          {settings.certificate_valid_until
            ? ` · Válido até ${new Date(settings.certificate_valid_until).toLocaleDateString('pt-BR')}`
            : ''}
        </p>
        <CertificateUploadForm hasCompany={Boolean(settings.fisqal_company_id)} />
      </Card>
    </>
  );
}
