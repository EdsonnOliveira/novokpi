import { PageTitle } from '@/components/dastone/PageTitle';
import { Card } from '@/components/dastone/Card';
import { NfeEmitForm } from '@/components/fiscal/NfeEmitForm';

export default function FiscalNfeNewPage() {
  return (
    <>
      <PageTitle
        title="Emitir NF-e"
        subtitle="Mercadoria — emissão assíncrona via FISQAL"
        breadcrumbs={[
          { label: 'Fiscal / Notas', href: '/fiscal' },
          { label: 'Nova NF-e' },
        ]}
      />
      <Card title="Dados da NF-e">
        <NfeEmitForm />
      </Card>
    </>
  );
}
