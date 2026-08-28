'use client';

import { useCallback } from 'react';
import { downloadXlsx } from '@/lib/export/xlsx';

interface ExportButtonProps {
  filename: string;
  headers: string[];
  rows: string[][];
  label?: string;
}

export function ExportButton({ filename, headers, rows, label = 'Exportar Excel' }: ExportButtonProps) {
  const handleExport = useCallback(() => {
    downloadXlsx(filename.replace(/\.csv$/i, ''), headers, rows);
  }, [filename, headers, rows]);

  return (
    <button type="button" className="btn btn-light btn-sm" onClick={handleExport}>
      <i className="iconoir-download me-1" />
      {label}
    </button>
  );
}
