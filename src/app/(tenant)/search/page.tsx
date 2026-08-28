import Link from 'next/link';
import { PageTitle } from '@/components/dastone/PageTitle';
import { Card } from '@/components/dastone/Card';
import { createClient } from '@/lib/supabase/server';
import { joinOne } from '@/types/crm';

interface SearchPageProps {
  searchParams: Promise<{ q?: string; search?: string }>;
}

interface PersonResult {
  id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
}

interface DealResult {
  id: string;
  deal_number: number;
  title: string | null;
  status: string;
  people: { full_name: string } | { full_name: string }[] | null;
}

interface PassageResult {
  id: string;
  passage_number: number;
  status: string;
  vehicles: {
    plate: string | null;
    chassis: string | null;
  } | {
    plate: string | null;
    chassis: string | null;
  }[] | null;
}

interface OrderResult {
  id: string;
  order_number: number;
  status: string;
  people: { full_name: string } | { full_name: string }[] | null;
}

function formatDealNumber(value: number) {
  return `#${String(value).padStart(6, '0')}`;
}

function formatOrderNumber(value: number) {
  return `PED-${String(value).padStart(6, '0')}`;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = (params.q ?? params.search ?? '').trim();
  const supabase = await createClient();

  let people: PersonResult[] = [];
  let deals: DealResult[] = [];
  let passages: PassageResult[] = [];
  let orders: OrderResult[] = [];

  if (query) {
    const normalizedQuery = query.toLowerCase();
    const numericQuery = query.replace(/\D/g, '');

    const [
      { data: peopleData },
      { data: dealsData },
      { data: passagesData },
      { data: ordersData },
    ] = await Promise.all([
      supabase
        .from('people')
        .select('id, full_name, phone, email')
        .order('full_name')
        .limit(200),
      supabase
        .from('deals')
        .select('id, deal_number, title, status, people:person_id ( full_name )')
        .order('created_at', { ascending: false })
        .limit(200),
      supabase
        .from('vehicle_passages')
        .select(`
          id,
          passage_number,
          status,
          vehicles:vehicle_id ( plate, chassis )
        `)
        .order('created_at', { ascending: false })
        .limit(200),
      supabase
        .from('orders')
        .select('id, order_number, status, people:person_id ( full_name )')
        .order('created_at', { ascending: false })
        .limit(200),
    ]);

    people = ((peopleData ?? []) as PersonResult[]).filter((person) =>
      [person.full_name, person.phone, person.email]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(normalizedQuery)),
    ).slice(0, 20);

    deals = ((dealsData ?? []) as DealResult[]).filter((deal) => {
      const person = joinOne(deal.people);
      return (
        deal.title?.toLowerCase().includes(normalizedQuery) ||
        person?.full_name.toLowerCase().includes(normalizedQuery) ||
        (numericQuery.length > 0 && String(deal.deal_number).includes(numericQuery))
      );
    }).slice(0, 20);

    passages = ((passagesData ?? []) as PassageResult[]).filter((passage) => {
      const vehicle = joinOne(passage.vehicles);
      return (
        vehicle?.plate?.toLowerCase().includes(normalizedQuery) ||
        vehicle?.chassis?.toLowerCase().includes(normalizedQuery) ||
        (numericQuery.length > 0 && String(passage.passage_number).includes(numericQuery))
      );
    }).slice(0, 20);

    orders = ((ordersData ?? []) as OrderResult[]).filter((order) => {
      const person = joinOne(order.people);
      return (
        person?.full_name.toLowerCase().includes(normalizedQuery) ||
        (numericQuery.length > 0 && String(order.order_number).includes(numericQuery))
      );
    }).slice(0, 20);
  }

  const totalResults = people.length + deals.length + passages.length + orders.length;

  return (
    <>
      <PageTitle
        title="Busca global"
        subtitle="Pessoas, fichas, veículos e pedidos"
        breadcrumbs={[{ label: 'Busca' }]}
      />
      <Card>
        <form action="/search" method="get" className="row g-2 mb-4">
          <div className="col">
            <input
              type="search"
              name="q"
              className="form-control form-control-sm"
              placeholder="Buscar por nome, placa, ficha, pedido..."
              defaultValue={query}
            />
          </div>
          <div className="col-auto">
            <button type="submit" className="btn btn-primary btn-sm">
              Buscar
            </button>
          </div>
        </form>

        {!query ? (
          <p className="text-muted mb-0">Digite um termo para buscar em toda a loja.</p>
        ) : (
          <>
            <p className="text-muted small mb-3">
              {totalResults} resultado(s) para &quot;{query}&quot;
            </p>

            <h6 className="mb-2">Pessoas</h6>
            {people.length ? (
              <ul className="list-unstyled mb-4">
                {people.map((person) => (
                  <li key={person.id} className="mb-2">
                    <Link href={`/crm/people/${person.id}`}>{person.full_name}</Link>
                    <span className="text-muted ms-2">
                      {person.phone ?? person.email ?? ''}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted small mb-4">Nenhuma pessoa encontrada.</p>
            )}

            <h6 className="mb-2">Fichas</h6>
            {deals.length ? (
              <ul className="list-unstyled mb-4">
                {deals.map((deal) => {
                  const person = joinOne(deal.people);
                  return (
                    <li key={deal.id} className="mb-2">
                      <Link href={`/crm/${deal.id}`}>{formatDealNumber(deal.deal_number)}</Link>
                      <span className="text-muted ms-2">
                        {person?.full_name ?? '—'} · {deal.status}
                      </span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-muted small mb-4">Nenhuma ficha encontrada.</p>
            )}

            <h6 className="mb-2">Veículos</h6>
            {passages.length ? (
              <ul className="list-unstyled mb-4">
                {passages.map((passage) => {
                  const vehicle = joinOne(passage.vehicles);
                  return (
                    <li key={passage.id} className="mb-2">
                      <Link href={`/inventory/${passage.id}`}>
                        {vehicle?.plate ?? `Passagem ${passage.passage_number}`}
                      </Link>
                      <span className="text-muted ms-2">{passage.status}</span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-muted small mb-4">Nenhum veículo encontrado.</p>
            )}

            <h6 className="mb-2">Pedidos</h6>
            {orders.length ? (
              <ul className="list-unstyled mb-0">
                {orders.map((order) => {
                  const person = joinOne(order.people);
                  return (
                    <li key={order.id} className="mb-2">
                      <Link href={`/orders/${order.id}`}>{formatOrderNumber(order.order_number)}</Link>
                      <span className="text-muted ms-2">
                        {person?.full_name ?? '—'} · {order.status}
                      </span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-muted small mb-0">Nenhum pedido encontrado.</p>
            )}
          </>
        )}
      </Card>
    </>
  );
}
