'use client';

import { DataTable, DataTableLink } from '@/components/dastone/DataTable';
import { WarrantyCaseStatusActions } from '@/components/warranty/WarrantyCaseStatusActions';
import { StatusBadge } from '@/components/dastone/TableBadge';
import { formatWarrantyStatus, type WarrantyCaseTableRow } from '@/types/warranty';

interface WarrantyCasesTableProps {
  rows: WarrantyCaseTableRow[];
}

export function WarrantyCasesTable({ rows }: WarrantyCasesTableProps) {
  return (
    <DataTable
      data={rows}
      getRowKey={(row) => row.id}
      searchPlaceholder="Buscar ocorrência, cliente ou placa..."
      searchKeys={['title', 'clientName', 'plate', 'status', 'assignedTo']}
      exportFilename="garantia.csv"
      emptyTitle="Nenhuma ocorrência"
      emptyDescription="Casos de garantia e pós-venda aparecem aqui."
      columns={[
        {
          key: 'title',
          label: 'Ocorrência',
          sortable: true,
          exportValue: (row) => row.title,
          render: (row) => row.title,
        },
        {
          key: 'clientName',
          label: 'Cliente',
          sortable: true,
          exportValue: (row) => row.clientName,
          render: (row) => row.clientName,
        },
        {
          key: 'plate',
          label: 'Placa',
          sortable: true,
          exportValue: (row) => row.plate,
          render: (row) =>
            row.passageHref ? (
              <DataTableLink href={row.passageHref}>{row.plate}</DataTableLink>
            ) : (
              row.plate
            ),
        },
        {
          key: 'status',
          label: 'Status',
          sortable: true,
          exportValue: (row) => formatWarrantyStatus(row.status),
          render: (row) => (
            <div className="d-flex flex-column gap-1">
              <StatusBadge status={row.status} label={formatWarrantyStatus(row.status)} />
              <WarrantyCaseStatusActions caseId={row.id} status={row.status} />
            </div>
          ),
        },
        {
          key: 'assignedTo',
          label: 'Responsável',
          sortable: true,
          exportValue: (row) => row.assignedTo,
          render: (row) => row.assignedTo,
        },
        {
          key: 'openedAt',
          label: 'Abertura',
          sortable: true,
          exportValue: (row) => row.openedAt,
          render: (row) => row.openedAt,
        },
        {
          key: 'resolvedAt',
          label: 'Resolução',
          sortable: true,
          exportValue: (row) => row.resolvedAt,
          render: (row) => row.resolvedAt,
        },
      ]}
    />
  );
}
