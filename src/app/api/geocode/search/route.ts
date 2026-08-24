import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  if (!q) {
    return NextResponse.json({ error: 'Termo de busca é obrigatório' }, { status: 400 });
  }

  try {
    const rawQuery = q.trim();
    
    // Função auxiliar para buscar na API do Nominatim
    const searchNominatim = async (queryStr: string) => {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(queryStr)}&limit=1`;
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'SAG-IniciativaFuturo-App/2.0 (joaopessoa-pb-gov)',
          'Accept-Language': 'pt-BR,pt;q=0.9',
        },
        next: { revalidate: 3600 }
      });
      if (!res.ok) return null;
      const data = await res.json();
      return (data && data.length > 0) ? data[0] : null;
    };

    // PASSO 1: Tentativa com a string fornecida + João Pessoa, PB
    let searchQuery = rawQuery.toLowerCase().includes('joão pessoa')
      ? rawQuery
      : `${rawQuery}, João Pessoa, Paraíba, Brasil`;
    
    let result = await searchNominatim(searchQuery);

    // PASSO 2: Se falhar, limpa números de imóveis (, 27), hífens (- Alto do Mateus) e abreviações
    if (!result) {
      const cleaned = rawQuery
        .replace(/,\s*\d+/g, '') // remove números (ex: , 27)
        .replace(/-\s*/g, ' ')   // remove hífens (ex: - Alto do Mateus)
        .replace(/\bR\.\b/gi, 'Rua')
        .replace(/\bAv\.\b/gi, 'Avenida')
        .replace(/\bEMEF\b/gi, '')
        .replace(/\bEMEIF\b/gi, '')
        .trim();

      const cleanedQuery = `${cleaned}, João Pessoa, Paraíba, Brasil`;
      result = await searchNominatim(cleanedQuery);

      // PASSO 3: Se ainda falhar, busca apenas o nome da rua/bairro em João Pessoa
      if (!result) {
        const parts = cleaned.split(',');
        const streetOnly = parts[0].trim();
        if (streetOnly && streetOnly !== cleaned) {
          result = await searchNominatim(`${streetOnly}, João Pessoa, Paraíba, Brasil`);
        }
      }
    }

    if (result) {
      return NextResponse.json({
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
        displayName: result.display_name,
      });
    }

    return NextResponse.json({ error: 'Nenhum resultado encontrado' }, { status: 404 });
  } catch (err: any) {
    console.error('Erro no Server Proxy Search Nominatim:', err);
    return NextResponse.json({ error: err.message || 'Falha ao buscar no Nominatim' }, { status: 500 });
  }
}
