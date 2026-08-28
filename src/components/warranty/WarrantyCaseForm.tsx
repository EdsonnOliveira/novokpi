'use client';

import { FormEvent, useCallback, useState } from 'react';
import { createWarrantyCase } from '@/lib/warranty/cases';
import { createClient } from '@/lib/supabase/client';
import { getClientTenantContext } from '@/lib/settings/client-context';

interface EntityOption {
  id: string;
  label: string;
}

interface WarrantyCaseFormProps {
  passages: EntityOption[];
  people: EntityOption[];
}

export function WarrantyCaseForm({ passages, people }: WarrantyCaseFormProps) {
  const supabase = createClient();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [passageId, setPassageId] = useState('');
  const [personId, setPersonId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setLoading(true);
      setError(null);

      try {
        const context = await getClientTenantContext(supabase);
        if (!context) throw new Error('Sessão inválida.');

        await createWarrantyCase(supabase, {
          tenantId: context.tenantId,
          userId: context.userId,
          title,
          description: description || undefined,
          passageId: passageId || undefined,
          personId: personId || undefined,
        });

        window.location.reload();
      } catch (submitError) {
        setError(submitError instanceof Error ? submitError.message : 'Erro ao abrir ocorrência.');
      } finally {
        setLoading(false);
      }
    },
    [description, passageId, personId, supabase, title],
  );

  return (
    <form onSubmit={handleSubmit}>
      <div className="row">
        <div className="col-md-4 mb-2">
          <input type="text" className="form-control form-control-sm" placeholder="Título" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div className="col-md-4 mb-2">
          <select className="form-select form-select-sm" value={passageId} onChange={(e) => setPassageId(e.target.value)}>
            <option value="">Passagem (opcional)</option>
            {passages.map((passage) => (
              <option key={passage.id} value={passage.id}>
                {passage.label}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-4 mb-2">
          <select className="form-select form-select-sm" value={personId} onChange={(e) => setPersonId(e.target.value)}>
            <option value="">Cliente (opcional)</option>
            {people.map((person) => (
              <option key={person.id} value={person.id}>
                {person.label}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-10 mb-2">
          <input type="text" className="form-control form-control-sm" placeholder="Descrição" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="col-md-2 mb-2">
          <button type="submit" className="btn btn-primary btn-sm w-100" disabled={loading}>
            <i className="iconoir-check me-1" aria-hidden="true" />
            {loading ? 'Abrindo...' : 'Abrir'}
          </button>
        </div>
      </div>
      {error ? <div className="alert alert-danger py-1 px-2 mb-0">{error}</div> : null}
    </form>
  );
}
