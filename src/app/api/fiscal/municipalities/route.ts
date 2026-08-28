import { getFiscalSession, jsonError } from '@/lib/fiscal/session';

interface BrasilApiMunicipality {
  nome: string;
  codigo_ibge: string;
}

export async function GET(request: Request) {
  const session = await getFiscalSession();
  if (!session) return jsonError('Não autenticado.', 401);

  const uf = new URL(request.url).searchParams.get('uf')?.trim().toUpperCase();

  if (!uf || uf.length !== 2) {
    return jsonError('Informe a UF com 2 letras.', 400);
  }

  try {
    const response = await fetch(`https://brasilapi.com.br/api/ibge/municipios/v1/${uf}`, {
      next: { revalidate: 86_400 },
    });

    if (!response.ok) {
      return jsonError('Não foi possível carregar os municípios.', response.status);
    }

    const municipalities = (await response.json()) as BrasilApiMunicipality[];

    return Response.json(
      municipalities
        .map((municipality) => ({
          code: municipality.codigo_ibge,
          name: municipality.nome,
        }))
        .sort((left, right) => left.name.localeCompare(right.name, 'pt-BR')),
    );
  } catch {
    return jsonError('Erro ao consultar municípios.', 500);
  }
}
