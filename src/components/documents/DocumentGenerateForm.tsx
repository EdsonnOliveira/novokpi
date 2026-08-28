'use client';

import { FormEvent, useCallback, useState } from 'react';
import { generateDocument } from '@/lib/documents/documents';
import { createClient } from '@/lib/supabase/client';
import { getClientTenantContext } from '@/lib/settings/client-context';
import type { DocumentTemplateRow } from '@/types/documents';
import { formatTemplateType } from '@/types/documents';

interface EntityOption {
  id: string;
  label: string;
}

interface DocumentGenerateFormProps {
  templates: DocumentTemplateRow[];
  deals?: EntityOption[];
  orders?: EntityOption[];
  defaultTemplateId?: string;
}

export function DocumentGenerateForm({
  templates,
  deals = [],
  orders = [],
  defaultTemplateId,
}: DocumentGenerateFormProps) {
  const supabase = createClient();
  const [templateId, setTemplateId] = useState(defaultTemplateId ?? templates[0]?.id ?? '');
  const [title, setTitle] = useState('');
  const [entityType, setEntityType] = useState('');
  const [entityId, setEntityId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const entityOptions = entityType === 'deal' ? deals : entityType === 'order' ? orders : [];

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setLoading(true);
      setError(null);
      setSuccess(null);

      const context = await getClientTenantContext(supabase);

      if (!context) {
        setError('Sessão expirada.');
        setLoading(false);
        return;
      }

      try {
        const document = await generateDocument(supabase, {
          tenantId: context.tenantId,
          userId: context.userId,
          templateId,
          title,
          entityType: entityType || undefined,
          entityId: entityId || undefined,
        });
        setSuccess(`Documento gerado com sucesso. ID: ${document.id}`);
        setTitle('');
        setEntityType('');
        setEntityId('');
      } catch (submitError) {
        setError(submitError instanceof Error ? submitError.message : 'Erro ao gerar.');
      } finally {
        setLoading(false);
      }
    },
    [entityId, entityType, supabase, templateId, title],
  );

  if (!templates.length) {
    return (
      <div className="alert alert-warning mb-0">
        Nenhum modelo ativo disponível. Configure modelos em Documentos.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="row">
        <div className="col-md-4 mb-3">
          <label className="form-label">Modelo</label>
          <select
            className="form-select form-select-sm"
            value={templateId}
            onChange={(event) => setTemplateId(event.target.value)}
            required
          >
            {templates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name} ({formatTemplateType(template.template_type)})
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-4 mb-3">
          <label className="form-label">Título do documento</label>
          <input
            type="text"
            className="form-control form-control-sm"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Ex.: Contrato #12345"
            required
          />
        </div>
        <div className="col-md-2 mb-3">
          <label className="form-label">Tipo entidade</label>
          <select
            className="form-select form-select-sm"
            value={entityType}
            onChange={(event) => {
              setEntityType(event.target.value);
              setEntityId('');
            }}
          >
            <option value="">Nenhum</option>
            <option value="deal">Ficha (deal)</option>
            <option value="order">Pedido (order)</option>
          </select>
        </div>
        <div className="col-md-2 mb-3">
          <label className="form-label">Entidade</label>
          <select
            className="form-select form-select-sm"
            value={entityId}
            onChange={(event) => setEntityId(event.target.value)}
            disabled={!entityType}
          >
            <option value="">Selecione</option>
            {entityOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>
        <i className="iconoir-check me-1" aria-hidden="true" />
        {loading ? 'Gerando...' : 'Gerar documento'}
      </button>
      {error ? <div className="alert alert-danger py-1 px-2 mt-2 mb-0">{error}</div> : null}
      {success ? <div className="alert alert-success py-1 px-2 mt-2 mb-0">{success}</div> : null}
    </form>
  );
}
