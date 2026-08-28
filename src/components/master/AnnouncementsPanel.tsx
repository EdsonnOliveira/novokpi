'use client';

import { FormEvent, useCallback, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { MasterAnnouncementRow } from '@/types/master';
import { TableEmptyRow } from '@/components/dastone/EmptyState';

interface AnnouncementsPanelProps {
  announcements: MasterAnnouncementRow[];
}

export function AnnouncementsPanel({ announcements }: AnnouncementsPanelProps) {
  const supabase = createClient();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setLoading(true);
      setError(null);

      const { error: insertError } = await supabase.from('master_announcements').insert({
        title,
        body,
        is_published: false,
      });

      if (insertError) {
        setError(insertError.message);
        setLoading(false);
        return;
      }

      window.location.reload();
    },
    [body, supabase, title],
  );

  const handleTogglePublish = useCallback(
    async (id: string, isPublished: boolean) => {
      setLoading(true);
      const { error: updateError } = await supabase
        .from('master_announcements')
        .update({
          is_published: !isPublished,
          published_at: !isPublished ? new Date().toISOString() : null,
        })
        .eq('id', id);

      if (updateError) {
        setError(updateError.message);
        setLoading(false);
        return;
      }

      window.location.reload();
    },
    [supabase],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      setLoading(true);
      const { error: deleteError } = await supabase.from('master_announcements').delete().eq('id', id);

      if (deleteError) {
        setError(deleteError.message);
        setLoading(false);
        return;
      }

      window.location.reload();
    },
    [supabase],
  );

  return (
    <>
      <form onSubmit={handleCreate} className="mb-3">
        <div className="row">
          <div className="col-md-3 mb-2">
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Título"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
            />
          </div>
          <div className="col-md-7 mb-2">
            <textarea
              className="form-control form-control-sm"
              placeholder="Conteúdo"
              value={body}
              onChange={(event) => setBody(event.target.value)}
              rows={2}
              required
            />
          </div>
          <div className="col-md-2 mb-2">
            <button type="submit" className="btn btn-primary btn-sm w-100" disabled={loading}>
              {loading ? '...' : 'Novo comunicado'}
            </button>
          </div>
        </div>
        {error ? <div className="alert alert-danger py-1 px-2 mb-0">{error}</div> : null}
      </form>
      <div className="table-responsive">
        <table className="table table-hover mb-0">
          <thead>
            <tr>
              <th>Título</th>
              <th>Status</th>
              <th>Publicado em</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {announcements.length ? (
              announcements.map((announcement) => (
                <tr key={announcement.id}>
                  <td>
                    {announcement.title}
                    <small className="text-muted d-block">{announcement.body}</small>
                  </td>
                  <td>{announcement.is_published ? 'Publicado' : 'Rascunho'}</td>
                  <td>
                    {announcement.published_at
                      ? new Date(announcement.published_at).toLocaleString('pt-BR')
                      : '—'}
                  </td>
                  <td>
                    <div className="d-flex gap-1">
                      <button
                        type="button"
                        className="btn btn-light btn-sm"
                        disabled={loading}
                        onClick={() => handleTogglePublish(announcement.id, announcement.is_published)}
                      >
                        {announcement.is_published ? 'Despublicar' : 'Publicar'}
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm"
                        disabled={loading}
                        onClick={() => handleDelete(announcement.id)}
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <TableEmptyRow
                colSpan={4}
                title="Nenhum comunicado cadastrado."
                icon="iconoir-megaphone"
              />
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
