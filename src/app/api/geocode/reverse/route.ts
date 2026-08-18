import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');

  if (!lat || !lng) {
    return NextResponse.json({ error: 'Latitude e Longitude são obrigatórios' }, { status: 400 });
  }

  try {
    const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
    
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
    
    // Formata o endereço amigável em português
    let formattedAddress = data.display_name || '';
    
    if (data.address) {
      const road = data.address.road || data.address.pedestrian || data.address.suburb || '';
      const houseNumber = data.address.house_number ? `, ${data.address.house_number}` : '';
      const suburb = data.address.suburb || data.address.neighbourhood ? ` - ${data.address.suburb || data.address.neighbourhood}` : '';
      const city = data.address.city || data.address.town || 'João Pessoa';
      
      if (road) {
        formattedAddress = `${road}${houseNumber}${suburb}, ${city} - PB`;
      }
    }

    return NextResponse.json({
      address: formattedAddress || data.display_name,
      lat: parseFloat(lat),
      lng: parseFloat(lng),
    });
  } catch (err: any) {
    console.error('Erro no Server Proxy Nominatim:', err);
    return NextResponse.json({ error: err.message || 'Falha ao comunicar com Nominatim' }, { status: 500 });
  }
}
