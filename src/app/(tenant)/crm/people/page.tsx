import Link from 'next/link';
import { PageTitle } from '@/components/dastone/PageTitle';
import { Card } from '@/components/dastone/Card';
import { createClient } from '@/lib/supabase/server';

export default async function PeoplePage() {
  const supabase = await createClient();

  const { data: people } = await supabase
    .from('people')
    .select('id, full_name, phone, email, created_at')
    .order('created_at', { ascending: false })
    .limit(100);

  return (
    <>
      <PageTitle
        title="Clientes"
        subtitle="Cadastro progressivo de pessoas"
        breadcrumbs={[
          { label: 'CRM', href: '/crm' },
          { label: 'Clientes' },
        ]}
      />
      <Card>
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Telefone</th>
                <th>E-mail</th>
                <th>Cadastro</th>
              </tr>
            </thead>
            <tbody>
              {people?.length ? (
                people.map((person) => (
                  <tr key={person.id}>
                    <td>
                      <Link href={`/crm/people/${person.id}`}>{person.full_name}</Link>
                    </td>
                    <td>{person.phone ?? '—'}</td>
                    <td>{person.email ?? '—'}</td>
                    <td>{new Date(person.created_at).toLocaleDateString('pt-BR')}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="text-center text-muted py-4">
                    Nenhum cliente cadastrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
