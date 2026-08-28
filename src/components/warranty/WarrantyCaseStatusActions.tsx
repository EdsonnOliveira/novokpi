'use client';

import { useCallback, useState } from 'react';
import { updateWarrantyCaseStatus } from '@/lib/warranty/cases';
import { createClient } from '@/lib/supabase/client';
import { getClientTenantContext } from '@/lib/settings/client-context';

interface WarrantyCaseStatusActionsProps {
  caseId: string;
  status: string;
}

const STATUS_OPTIONS = [
  { value: 'open', label: 'Aberto' },
  { value: 'in_progress', label: 'Em andamento' },
  { value: 'resolved', label: 'Resolvido' },
  { value: 'closed', label: 'Fechado' },
];

export function WarrantyCaseStatusActions({ caseId, status }: WarrantyCaseStatusActionsProps) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  const handleChange = useCallback(
    async (nextStatus: string) => {
      setLoading(true);
      try {
        const context = await getClientTenantContext(supabase);
      if (!context) return;

        await updateWarrantyCaseStatus(supabase, {
          tenantId: context.tenantId,
          userId: context.userId,
          caseId,
          status: nextStatus,
        });

        window.location.reload();
      } finally {
        setLoading(false);
      }
    },
    [caseId, supabase],
  );

  return (
    <select
      className="form-select form-select-sm"
      value={status}
      onChange={(event) => handleChange(event.target.value)}
      disabled={loading}
      style={{ maxWidth: 160 }}
    >
      {STATUS_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
