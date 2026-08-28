'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { EmptyState } from '@/components/dastone/EmptyState';
import { ExportButton } from '@/components/dastone/ExportButton';

export interface DataTableColumn<T> {
  key: string;
  label: string;
  sortable?: boolean;
  exportValue?: (row: T) => string;
  render: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  searchPlaceholder?: string;
  searchKeys?: (keyof T)[];
  exportFilename?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyIcon?: string;
  emptyActionLabel?: string;
  emptyActionHref?: string;
  getRowKey: (row: T) => string;
}

export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  searchPlaceholder = 'Buscar...',
  searchKeys,
  exportFilename,
  emptyTitle = 'Nenhum registro encontrado',
  emptyDescription,
  emptyIcon = 'iconoir-empty-page',
  emptyActionLabel,
  emptyActionHref,
  getRowKey,
}: DataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const filtered = useMemo(() => {
    let rows = data;

    if (search.trim()) {
      const term = search.toLowerCase();
      rows = rows.filter((row) => {
        const keys = searchKeys ?? (Object.keys(row) as (keyof T)[]);
        return keys.some((key) => String(row[key] ?? '').toLowerCase().includes(term));
      });
    }

    if (sortKey) {
      rows = [...rows].sort((a, b) => {
        const av = String(a[sortKey] ?? '');
        const bv = String(b[sortKey] ?? '');
        const cmp = av.localeCompare(bv, 'pt-BR', { numeric: true });
        return sortDir === 'asc' ? cmp : -cmp;
      });
    }

    return rows;
  }, [data, search, searchKeys, sortKey, sortDir]);

  const exportHeaders = columns.map((col) => col.label);
  const exportRows = filtered.map((row) =>
    columns.map((col) => (col.exportValue ? col.exportValue(row) : String(row[col.key] ?? ''))),
  );

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setSortKey(key);
    setSortDir('asc');
  };

  return (
    <div>
      <div className="row align-items-center g-2 mb-3">
        <div className="col-12 col-md">
          <input
            type="search"
            className="form-control form-control-sm"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        {exportFilename ? (
          <div className="col-12 col-md-auto">
            <ExportButton filename={exportFilename} headers={exportHeaders} rows={exportRows} />
          </div>
        ) : null}
      </div>
      <div className="table-responsive">
        <table className="table table-hover mb-0">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key}>
                  {col.sortable ? (
                    <button
                      type="button"
                      className="btn btn-link btn-sm p-0 text-decoration-none"
                      onClick={() => handleSort(col.key)}
                    >
                      {col.label}
                      {sortKey === col.key ? (sortDir === 'asc' ? ' ↑' : ' ↓') : null}
                    </button>
                  ) : (
                    col.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length ? (
              filtered.map((row) => (
                <tr key={getRowKey(row)}>{columns.map((col) => <td key={col.key}>{col.render(row)}</td>)}</tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length}>
                  <EmptyState
                    title={emptyTitle}
                    description={emptyDescription}
                    icon={emptyIcon}
                    actionLabel={emptyActionLabel}
                    actionHref={emptyActionHref}
                    compact
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {filtered.length ? (
        <p className="text-muted small mt-2 mb-0">{filtered.length} registro(s)</p>
      ) : null}
    </div>
  );
}

export function DataTableLink({ href, children }: { href: string; children: React.ReactNode }) {
  return <Link href={href}>{children}</Link>;
}
