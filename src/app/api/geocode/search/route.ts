import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  if (!q) {
    return NextResponse.json({ error: 'Termo de busca é obrigatório' }, { status: 400 });
  }

  try {
    const searchQuery = q.toLowerCase().includes('joão pessoa')
      ? q
      : `${q}, João Pessoa, Paraíba, Brasil`;

    const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      searchQuery
    )}&limit=1`;

    const response = await fetch(nominatimUrl, {
      headers: {
        'User-Agent': 'SAG-IniciativaFuturo-App/2.0 (joaopessoa-pb-gov)',
        'Accept-Language': 'pt-BR,pt;q=0.9',
      },
      next: { revalidate: 3600 }
    });

    if (!response.ok) {
      return NextResponse.json({ error: `Nominatim HTTP ${response.status}` }, { status: response.status });
    }

    const data = await response.json();

    if (data && data.length > 0) {
      return NextResponse.json({
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
        displayName: data[0].display_name,
      });
    }

    return NextResponse.json({ error: 'Nenhum resultado encontrado' }, { status: 444 });
  } catch (err: any) {
    console.error('Erro no Server Proxy Search Nominatim:', err);
    return NextResponse.json({ error: err.message || 'Falha ao buscar no Nominatim' }, { status: 500 });
  }
}
