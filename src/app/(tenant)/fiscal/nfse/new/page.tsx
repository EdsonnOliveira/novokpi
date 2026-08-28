import { PageTitle } from '@/components/dastone/PageTitle';
import { Card } from '@/components/dastone/Card';
import { NfseEmitForm } from '@/components/fiscal/NfseEmitForm';

export default function FiscalNfseNewPage() {
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
        <NfseEmitForm />
      </Card>
    </>
  );
}
