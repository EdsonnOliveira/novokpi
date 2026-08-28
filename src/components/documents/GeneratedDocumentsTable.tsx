'use client';

import Link from 'next/link';
import { DataTable } from '@/components/dastone/DataTable';
import type { GeneratedDocumentTableRow } from '@/types/documents';

interface GeneratedDocumentsTableProps {
  rows: GeneratedDocumentTableRow[];
}

export function GeneratedDocumentsTable({ rows }: GeneratedDocumentsTableProps) {
  return (
    <DataTable
      data={rows}
      getRowKey={(row) => row.id}
      searchPlaceholder="Buscar documento ou modelo..."
      searchKeys={['title', 'templateName', 'generatedBy', 'entityType']}
      exportFilename="documentos-gerados.csv"
      emptyTitle="Nenhum documento gerado"
      emptyDescription="Documentos criados a partir de modelos aparecem aqui."
      emptyActionLabel="Gerar documento"
      emptyActionHref="/documents/generate"
      columns={[
        {
          key: 'title',
          label: 'Título',
          sortable: true,
          exportValue: (row) => row.title,
          render: (row) => (
            <Link href={`/documents/${row.id}`}>{row.title}</Link>
          ),
        },
        {
          key: 'templateName',
          label: 'Modelo',
          sortable: true,
          exportValue: (row) => row.templateName,
          render: (row) => row.templateName,
        },
        {
          key: 'entityType',
          label: 'Entidade',
          exportValue: (row) => row.entityType,
          render: (row) => row.entityType,
        },
        {
          key: 'generatedBy',
          label: 'Gerado por',
          sortable: true,
          exportValue: (row) => row.generatedBy,
          render: (row) => row.generatedBy,
        },
        {
          key: 'createdAt',
          label: 'Data',
          sortable: true,
          exportValue: (row) => row.createdAt,
          render: (row) => row.createdAt,
        },
        {
          key: 'filePath',
          label: 'Arquivo',
          exportValue: (row) => row.filePath,
          render: (row) => row.filePath,
        },
      ]}
    />
  );
}
