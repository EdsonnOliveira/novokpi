'use client';

import { DataTable, DataTableLink } from '@/components/dastone/DataTable';
import { StatusBadge } from '@/components/dastone/TableBadge';
import { formatQueueStatus, type DemandQueueTableRow } from '@/types/crm';

interface DemandQueueTableProps {
  rows: DemandQueueTableRow[];
}

export function DemandQueueTable({ rows }: DemandQueueTableProps) {
  return (
    <DataTable
      data={rows}
      getRowKey={(row) => row.id}
      searchPlaceholder="Buscar cliente ou interesse..."
      searchKeys={['clientName', 'contact', 'interestLabel', 'dealNumber', 'status']}
      exportFilename="fila-demanda.csv"
      emptyTitle="Nenhum cliente na fila"
      emptyDescription="Clientes aguardando veículo aparecem aqui."
      emptyActionLabel="Abrir ficha"
      emptyActionHref="/crm/new"
      columns={[
        {
          key: 'clientName',
          label: 'Cliente',
          sortable: true,
          exportValue: (row) => row.clientName,
          render: (row) => row.clientName,
        },
        {
          key: 'contact',
          label: 'Contato',
          exportValue: (row) => row.contact,
          render: (row) => row.contact,
        },
        {
          key: 'interestLabel',
          label: 'Interesse',
          sortable: true,
          exportValue: (row) => row.interestLabel,
          render: (row) => row.interestLabel,
        },
        {
          key: 'dealNumber',
          label: 'Ficha',
          sortable: true,
          exportValue: (row) => row.dealNumber,
          render: (row) =>
            row.dealHref ? (
              <DataTableLink href={row.dealHref}>{row.dealNumber}</DataTableLink>
            ) : (
              '—'
            ),
        },
        {
          key: 'status',
          label: 'Status',
          sortable: true,
          exportValue: (row) => formatQueueStatus(row.status),
          render: (row) => (
            <StatusBadge status={row.status} label={formatQueueStatus(row.status)} />
          ),
        },
        {
          key: 'createdAt',
          label: 'Entrada',
          sortable: true,
          exportValue: (row) => row.createdAt,
          render: (row) => row.createdAt,
        },
      ]}
    />
  );
}
