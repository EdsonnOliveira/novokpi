'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useCallback, useState } from 'react';

interface CertificateUploadFormProps {
  hasCompany: boolean;
}

export function CertificateUploadForm({ hasCompany }: CertificateUploadFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!hasCompany) {
        setError('Cadastre a empresa antes de enviar o certificado.');
        return;
      }

      setLoading(true);
      setError(null);
      setSuccess(null);

      const form = new FormData(event.currentTarget);
      const file = form.get('file');
      if (!(file instanceof File)) {
        setError('Selecione o arquivo .pfx.');
        setLoading(false);
        return;
      }

      const uploadData = new FormData();
      uploadData.append('name', String(form.get('name') ?? 'Certificado A1'));
      uploadData.append('password', String(form.get('password') ?? ''));
      uploadData.append('file', file);

      try {
        const response = await fetch('/api/fiscal/certificate', {
          method: 'POST',
          body: uploadData,
        });
        const data = (await response.json()) as { error?: string };
        if (!response.ok) {
          throw new Error(data.error ?? 'Erro ao enviar certificado.');
        }
        setSuccess('Certificado enviado com sucesso.');
        router.refresh();
      } catch (submitError) {
        setError(submitError instanceof Error ? submitError.message : 'Erro ao enviar.');
      } finally {
        setLoading(false);
      }
    },
    [hasCompany, router],
  );

  return (
    <form onSubmit={handleSubmit}>
      <div className="row">
        <div className="col-md-4 mb-2">
          <label className="form-label form-label-sm">Nome do certificado</label>
          <input name="name" className="form-control form-control-sm" defaultValue="Certificado A1" />
        </div>
        <div className="col-md-4 mb-2">
          <label className="form-label form-label-sm">Senha do .pfx</label>
          <input name="password" type="password" className="form-control form-control-sm" required />
        </div>
        <div className="col-md-4 mb-2">
          <label className="form-label form-label-sm">Arquivo .pfx</label>
          <input name="file" type="file" accept=".pfx,.p12" className="form-control form-control-sm" required />
        </div>
      </div>
      {error ? <p className="text-danger small mb-2">{error}</p> : null}
      {success ? <p className="text-success small mb-2">{success}</p> : null}
      <button type="submit" className="btn btn-outline-primary btn-sm" disabled={loading || !hasCompany}>
        <i className="iconoir-upload me-1" aria-hidden="true" />
        {loading ? 'Enviando...' : 'Enviar certificado A1'}
      </button>
    </form>
  );
}
