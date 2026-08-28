'use client';

import { DataTable, type DataTableColumn } from '@/components/dastone/DataTable';
import type { TenantListRow } from '@/types/master';
import { formatSubscriptionStatus, joinOne } from '@/types/master';

interface TenantsTableProps {
  tenants: Array<TenantListRow & Record<string, unknown>>;
}

export function TenantsTable({ tenants }: TenantsTableProps) {
  const columns: DataTableColumn<TenantListRow>[] = [
    {
      key: 'name',
      label: 'Loja',
      sortable: true,
      render: (row) => row.name,
    },
    {
      key: 'slug',
      label: 'Slug',
      sortable: true,
      render: (row) => row.slug,
    },
    {
      key: 'email',
      label: 'E-mail',
      render: (row) => row.email ?? '—',
    },
    {
      key: 'phone',
      label: 'Telefone',
      render: (row) => row.phone ?? '—',
    },
    {
      key: 'plan',
      label: 'Plano',
      render: (row) => {
        const subscription = joinOne(row.subscriptions);
        const plan = joinOne(subscription?.plans ?? null);
        return plan?.name ?? '—';
      },
    },
    {
      key: 'status',
      label: 'Assinatura',
      render: (row) => {
        const subscription = joinOne(row.subscriptions);
        return subscription ? formatSubscriptionStatus(subscription.status) : '—';
      },
    },
    {
      key: 'is_active',
      label: 'Loja',
      render: (row) => (row.is_active ? 'Ativa' : 'Inativa'),
    },
    {
      key: 'created_at',
      label: 'Criada em',
      sortable: true,
      render: (row) => new Date(row.created_at).toLocaleDateString('pt-BR'),
    },
  ];

  return (
    <DataTable
      data={tenants}
      columns={columns}
      searchPlaceholder="Buscar loja..."
      searchKeys={['name', 'slug', 'email', 'phone']}
      exportFilename="lojas.csv"
      emptyTitle="Nenhuma loja encontrada"
      getRowKey={(row) => row.id}
    />
  );
}
