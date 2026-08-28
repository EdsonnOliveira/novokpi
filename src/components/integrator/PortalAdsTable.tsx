'use client';

import { DataTable, DataTableLink } from '@/components/dastone/DataTable';
import { PortalAdSyncButton } from '@/components/integrator/PortalAdSyncButton';
import {
  formatAdStatus,
  getAdStatusBadgeClass,
  type PortalAdTableRow,
} from '@/types/integrator';

interface PortalAdsTableProps {
  rows: PortalAdTableRow[];
}

export function PortalAdsTable({ rows }: PortalAdsTableProps) {
  return (
    <DataTable
      data={rows}
      getRowKey={(row) => row.id}
      searchPlaceholder="Buscar placa, portal ou status..."
      searchKeys={['portalName', 'plate', 'vehicleLabel', 'status', 'externalId']}
      exportFilename="anuncios-portais.csv"
      emptyTitle="Nenhum anúncio publicado"
      emptyDescription="Anúncios vinculados a portais aparecem aqui."
      emptyActionLabel="Ver estoque"
      emptyActionHref="/inventory"
      columns={[
        {
          key: 'portalName',
          label: 'Portal',
          sortable: true,
          exportValue: (row) => row.portalName,
          render: (row) => row.portalName,
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
          key: 'vehicleLabel',
          label: 'Veículo',
          sortable: true,
          exportValue: (row) => row.vehicleLabel,
          render: (row) => row.vehicleLabel,
        },
        {
          key: 'status',
          label: 'Status',
          sortable: true,
          exportValue: (row) => formatAdStatus(row.status),
          render: (row) => (
            <span className={`badge ${getAdStatusBadgeClass(row.status)}`}>
              {formatAdStatus(row.status)}
            </span>
          ),
        },
        {
          key: 'externalId',
          label: 'ID externo',
          exportValue: (row) => row.externalId,
          render: (row) => row.externalId,
        },
        {
          key: 'publishedAt',
          label: 'Publicado',
          sortable: true,
          exportValue: (row) => row.publishedAt,
          render: (row) => row.publishedAt,
        },
        {
          key: 'lastSyncAt',
          label: 'Última sync',
          sortable: true,
          exportValue: (row) => row.lastSyncAt,
          render: (row) => row.lastSyncAt,
        },
        {
          key: 'actions',
          label: 'Ação',
          exportValue: () => '',
          render: (row) => <PortalAdSyncButton adId={row.id} />,
        },
      ]}
    />
  );
}
