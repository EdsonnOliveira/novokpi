'use client';

import { DataTable } from '@/components/dastone/DataTable';
import { formatQueueStatus, type OfferQueueTableRow } from '@/types/crm';

interface OfferQueueTableProps {
  rows: OfferQueueTableRow[];
}

export function OfferQueueTable({ rows }: OfferQueueTableProps) {
  return (
    <DataTable
      data={rows}
      getRowKey={(row) => row.id}
      searchPlaceholder="Buscar placa ou veículo..."
      searchKeys={['plate', 'vehicleLabel', 'color', 'yearModel', 'status']}
      exportFilename="fila-oferta.csv"
      emptyTitle="Nenhum veículo na fila"
      emptyDescription="Veículos aguardando comprador aparecem aqui."
      emptyActionLabel="Ver estoque"
      emptyActionHref="/inventory"
      columns={[
        {
          key: 'plate',
          label: 'Placa',
          sortable: true,
          exportValue: (row) => row.plate,
          render: (row) => row.plate,
        },
        {
          key: 'vehicleLabel',
          label: 'Veículo',
          sortable: true,
          exportValue: (row) => row.vehicleLabel,
          render: (row) => row.vehicleLabel,
        },
        {
          key: 'yearModel',
          label: 'Ano',
          sortable: true,
          exportValue: (row) => row.yearModel,
          render: (row) => row.yearModel,
        },
        {
          key: 'color',
          label: 'Cor',
          exportValue: (row) => row.color,
          render: (row) => row.color,
        },
        {
          key: 'status',
          label: 'Status',
          sortable: true,
          exportValue: (row) => formatQueueStatus(row.status),
          render: (row) => formatQueueStatus(row.status),
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
