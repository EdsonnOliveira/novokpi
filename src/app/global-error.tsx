'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <div style={{ padding: 40, fontFamily: 'system-ui, sans-serif' }}>
          <h2>Erro no aplicativo</h2>
          <p>{error.message || 'Erro inesperado.'}</p>
          <button type="button" onClick={reset}>
            Tentar de novo
          </button>
        </div>
      </body>
    </html>
  );
}
