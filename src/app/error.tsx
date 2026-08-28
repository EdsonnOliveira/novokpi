'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="container py-5">
      <h2 className="h4 mb-2">Algo deu errado</h2>
      <p className="text-muted mb-3">{error.message || 'Erro inesperado.'}</p>
      <button type="button" className="btn btn-primary btn-sm" onClick={reset}>
        Tentar de novo
      </button>
    </div>
  );
}
