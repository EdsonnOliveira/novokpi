'use client';

import { useCallback, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getClientTenantContext } from '@/lib/settings/client-context';
import { EmptyState } from '@/components/dastone/EmptyState';

export interface AttachmentItem {
  id: string;
  name: string;
  url: string;
  size?: number;
  createdAt: string;
}

interface AttachmentPanelProps {
  entityType: string;
  entityId: string;
  attachments: AttachmentItem[];
  bucket?: string;
}

function formatSize(bytes?: number) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function AttachmentPanel({
  entityType,
  entityId,
  attachments: initialAttachments,
  bucket = 'tenant-attachments',
}: AttachmentPanelProps) {
  const [attachments, setAttachments] = useState(initialAttachments);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      setUploading(true);
      setError(null);

      try {
        const supabase = createClient();
        const context = await getClientTenantContext(supabase);

        if (!context) {
          setError('Tenant não encontrado.');
          return;
        }

        const path = `${context.tenantId}/${entityType}/${entityId}/${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage.from(bucket).upload(path, file);

        if (uploadError) {
          setError(uploadError.message);
          return;
        }

        const { data: publicUrl } = supabase.storage.from(bucket).getPublicUrl(path);

        const { data: record, error: insertError } = await supabase
          .from('entity_attachments')
          .insert({
            tenant_id: context.tenantId,
            entity_type: entityType,
            entity_id: entityId,
            file_name: file.name,
            file_path: path,
            file_size: file.size,
            mime_type: file.type,
          })
          .select('id, file_name, file_path, file_size, created_at')
          .single();

        if (insertError) {
          setError(insertError.message);
          return;
        }

        setAttachments((prev) => [
          {
            id: record.id,
            name: record.file_name,
            url: publicUrl.publicUrl,
            size: record.file_size ?? undefined,
            createdAt: record.created_at,
          },
          ...prev,
        ]);
      } finally {
        setUploading(false);
        event.target.value = '';
      }
    },
    [bucket, entityId, entityType],
  );

  return (
    <div>
      <div className="mb-3">
        <label className="btn btn-primary btn-sm mb-0">
          <i className="iconoir-attachment me-1" aria-hidden="true" />
          {uploading ? 'Enviando...' : 'Anexar arquivo'}
          <input type="file" className="d-none" onChange={handleUpload} disabled={uploading} />
        </label>
        {error ? <p className="text-danger small mt-2 mb-0">{error}</p> : null}
      </div>
      {attachments.length ? (
        <ul className="list-group list-group-flush">
          {attachments.map((item) => (
            <li key={item.id} className="list-group-item d-flex justify-content-between align-items-center px-0">
              <div>
                <a href={item.url} target="_blank" rel="noopener noreferrer">
                  {item.name}
                </a>
                {item.size ? <span className="text-muted small ms-2">{formatSize(item.size)}</span> : null}
              </div>
              <small className="text-muted">{new Date(item.createdAt).toLocaleDateString('pt-BR')}</small>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState title="Nenhum anexo" description="Envie documentos, fotos ou contratos." icon="iconoir-attachment" />
      )}
    </div>
  );
}
