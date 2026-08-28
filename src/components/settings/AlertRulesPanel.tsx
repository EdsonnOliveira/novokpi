'use client';

import { FormEvent, useCallback, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getClientTenantContext } from '@/lib/settings/client-context';

interface AlertRulesPanelProps {
  mode: 'create';
}

export function AlertRulesPanel({ mode }: AlertRulesPanelProps) {
  const supabase = createClient();
  const [name, setName] = useState('');
  const [module, setModule] = useState('crm');
  const [daysThreshold, setDaysThreshold] = useState('1');
  const [level, setLevel] = useState<'info' | 'warning' | 'overdue'>('warning');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (mode !== 'create') return;
      setLoading(true);
      setError(null);

      const context = await getClientTenantContext(supabase);
      if (!context) {
        setError('Loja não configurada.');
        setLoading(false);
        return;
      }

      const { error: insertError } = await supabase.from('alert_rules').insert({
        tenant_id: context.tenantId,
        name,
        module,
        days_threshold: Number(daysThreshold),
        level,
      });

      if (insertError) {
        setError(insertError.message);
        setLoading(false);
        return;
      }

      window.location.reload();
    },
    [daysThreshold, level, module, mode, name, supabase],
  );

  return (
    <form onSubmit={handleSubmit}>
      <div className="row">
        <div className="col-md-3 mb-2">
          <input type="text" className="form-control form-control-sm" placeholder="Nome da regra" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="col-md-2 mb-2">
          <select className="form-select form-select-sm" value={module} onChange={(e) => setModule(e.target.value)}>
            <option value="crm">CRM</option>
            <option value="inventory">Estoque</option>
            <option value="orders">Pedidos</option>
            <option value="finance">Financeiro</option>
          </select>
        </div>
        <div className="col-md-2 mb-2">
          <input type="number" className="form-control form-control-sm" placeholder="Dias" value={daysThreshold} onChange={(e) => setDaysThreshold(e.target.value)} min={1} required />
        </div>
        <div className="col-md-2 mb-2">
          <select className="form-select form-select-sm" value={level} onChange={(e) => setLevel(e.target.value as 'info' | 'warning' | 'overdue')}>
            <option value="info">Informativo</option>
            <option value="warning">Atenção</option>
            <option value="overdue">Atrasado</option>
          </select>
        </div>
        <div className="col-md-2 mb-2">
          <button type="submit" className="btn btn-primary btn-sm w-100" disabled={loading}>
            {loading ? '...' : 'Salvar'}
          </button>
        </div>
      </div>
      {error ? <div className="alert alert-danger py-1 px-2 mb-0">{error}</div> : null}
    </form>
  );
}
