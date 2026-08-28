'use client';

import { DataTable, DataTableLink } from '@/components/dastone/DataTable';
import type { LostDealTableRow } from '@/types/crm';

interface LostSalesTableProps {
  rows: LostDealTableRow[];
}

export function LostSalesTable({ rows }: LostSalesTableProps) {
  return (
    <DataTable
      data={rows}
      getRowKey={(row) => row.id}
      searchPlaceholder="Buscar ficha, cliente ou motivo..."
      searchKeys={['dealNumber', 'clientName', 'contact', 'lostReason', 'channel']}
      exportFilename="vendas-perdidas.csv"
      emptyTitle="Nenhuma venda perdida"
      emptyDescription="Fichas encerradas como perda aparecem aqui."
      columns={[
        {
          key: 'dealNumber',
          label: 'Ficha',
          sortable: true,
          exportValue: (row) => row.dealNumber,
          render: (row) => (
            <DataTableLink href={row.dealHref}>{row.dealNumber}</DataTableLink>
          ),
        },
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
          key: 'lostReason',
          label: 'Motivo',
          sortable: true,
          exportValue: (row) => row.lostReason,
          render: (row) => row.lostReason,
        },
        {
          key: 'channel',
          label: 'Canal',
          sortable: true,
          exportValue: (row) => row.channel,
          render: (row) => row.channel,
        },
        {
          key: 'closedAt',
          label: 'Encerramento',
          sortable: true,
          exportValue: (row) => row.closedAt,
          render: (row) => row.closedAt,
        },
      ]}
    />
  );
}
