import { PageTitle } from '@/components/dastone/PageTitle';
import { Card } from '@/components/dastone/Card';
import { NfseEmitForm } from '@/components/fiscal/NfseEmitForm';
import { createClient } from '@/lib/supabase/server';
import { getOrCreateFiscalSettings } from '@/lib/fiscal/documents';
import { getTenantContext } from '@/lib/settings/tenant-context';
import { redirect } from 'next/navigation';

export default async function FiscalNfseNewPage() {
  const supabase = await createClient();
  const context = await getTenantContext(supabase);

  if (!context) {
    redirect('/login');
  }

  const settings = await getOrCreateFiscalSettings(supabase, context.tenantId);

  return (
    <>
      <PageTitle
        title="Emitir NFS-e"
        subtitle="Serviço — emissão assíncrona via FISQAL"
        breadcrumbs={[
          { label: 'Fiscal / Notas', href: '/fiscal' },
          { label: 'Nova NFS-e' },
        ]}
      />
      <Card title="Dados da NFS-e">
        <NfseEmitForm
          defaultUf={settings.uf ?? 'SP'}
          defaultMunicipalityCode={settings.codigo_municipio ?? '3550308'}
        />
      </Card>
    </>
  );
}
