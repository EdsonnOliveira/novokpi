'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import type { FiscalDocumentStatus } from '@/types/fiscal';

interface FiscalDocumentActionsProps {
  documentId: string;
  status: FiscalDocumentStatus;
  documentType: string;
  hasExternalId: boolean;
}

export function FiscalDocumentActions({
  documentId,
  status,
  documentType,
  hasExternalId,
}: FiscalDocumentActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const syncStatus = useCallback(async () => {
    setLoading('sync');
    setError(null);
    try {
      const response = await fetch(`/api/fiscal/documents/${documentId}/sync`, { method: 'POST' });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error ?? 'Erro ao sincronizar.');
      router.refresh();
    } catch (syncError) {
      setError(syncError instanceof Error ? syncError.message : 'Erro ao sincronizar.');
    } finally {
      setLoading(null);
    }
  }, [documentId, router]);

  const openAsset = useCallback(
    async (asset: 'pdf' | 'xml') => {
      setLoading(asset);
      setError(null);
      try {
        const response = await fetch(`/api/fiscal/documents/${documentId}/asset?asset=${asset}`);
        const data = (await response.json()) as { error?: string; url?: string };
        if (!response.ok || !data.url) throw new Error(data.error ?? 'Arquivo indisponível.');
        window.open(data.url, '_blank', 'noopener,noreferrer');
      } catch (assetError) {
        setError(assetError instanceof Error ? assetError.message : 'Erro ao abrir arquivo.');
      } finally {
        setLoading(null);
      }
    },
    [documentId],
  );

  const cancelDocument = useCallback(async () => {
    const reason = window.prompt('Motivo do cancelamento (mínimo 15 caracteres):');
    if (!reason || reason.trim().length < 15) return;

    setLoading('cancel');
    setError(null);
    try {
      const response = await fetch(`/api/fiscal/documents/${documentId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: reason.trim() }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error ?? 'Erro ao cancelar.');
      router.refresh();
    } catch (cancelError) {
      setError(cancelError instanceof Error ? cancelError.message : 'Erro ao cancelar.');
    } finally {
      setLoading(null);
    }
  }, [documentId, router]);

  const canCancel = status === 'authorized' && hasExternalId;
  const canDownload = status === 'authorized' && hasExternalId;
  const supportedType = documentType === 'nfse' || documentType === 'nfe';

  return (
    <div>
      <div className="d-flex flex-wrap gap-2">
        {hasExternalId ? (
          <button
            type="button"
            className="btn btn-outline-primary btn-sm"
            onClick={syncStatus}
            disabled={loading !== null}
          >
            {loading === 'sync' ? 'Sincronizando...' : 'Atualizar status'}
          </button>
        ) : null}
        {canDownload && supportedType ? (
          <>
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              onClick={() => openAsset('pdf')}
              disabled={loading !== null}
            >
              {loading === 'pdf' ? 'Abrindo...' : 'PDF'}
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              onClick={() => openAsset('xml')}
              disabled={loading !== null}
            >
              {loading === 'xml' ? 'Abrindo...' : 'XML'}
            </button>
          </>
        ) : null}
        {canCancel && supportedType ? (
          <button
            type="button"
            className="btn btn-outline-danger btn-sm"
            onClick={cancelDocument}
            disabled={loading !== null}
          >
            {loading === 'cancel' ? 'Cancelando...' : 'Cancelar nota'}
          </button>
        ) : null}
      </div>
      {error ? <p className="text-danger small mt-2 mb-0">{error}</p> : null}
    </div>
  );
}
