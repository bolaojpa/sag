import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cuuayomhetzomccrfqpp.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_4ZCz6B77Ki9qG56j4LsfsA_dqA2EeI4';

export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data, error } = await supabase.from('escolas').select('*').order('nome', { ascending: true });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ data: data || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nome, endereco, regiao, latitude, longitude, lat_lng_oficial } = body;

    if (!nome) {
      return NextResponse.json({ error: 'Nome da escola é obrigatório' }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Constrói payload com as colunas oficiais presentes no schema do Supabase
    const insertPayload: any = {
      nome: nome.trim(),
      regiao: regiao || 'Polo Norte',
    };

    if (lat_lng_oficial) {
      insertPayload.lat_lng_oficial = lat_lng_oficial;
    } else if (latitude && longitude) {
      insertPayload.lat_lng_oficial = `${latitude},${longitude}`;
    }

    if (endereco) {
      insertPayload.endereco = endereco;
    }

    const { data, error } = await supabase
      .from('escolas')
      .insert([insertPayload])
      .select();

    if (error) {
      console.error('Erro ao inserir escola via Supabase:', error);
      return NextResponse.json({ error: error.message, details: error }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: data ? data[0] : null });
  } catch (err: any) {
    console.error('Erro na API route /api/escolas:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, nome, endereco, regiao, latitude, longitude, lat_lng_oficial } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID da escola é obrigatório para atualização' }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const updatePayload: any = {
      updated_at: new Date().toISOString(),
    };

    if (nome) updatePayload.nome = nome.trim();
    if (regiao) updatePayload.regiao = regiao;
    if (endereco) updatePayload.endereco = endereco;

    if (lat_lng_oficial) {
      updatePayload.lat_lng_oficial = lat_lng_oficial;
    } else if (latitude && longitude) {
      updatePayload.lat_lng_oficial = `${latitude},${longitude}`;
    }

    const { data, error } = await supabase
      .from('escolas')
      .update(updatePayload)
      .eq('id', id)
      .select();

    if (error) {
      console.error('Erro ao atualizar escola via Supabase:', error);
      return NextResponse.json({ error: error.message, details: error }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: data ? data[0] : null });
  } catch (err: any) {
    console.error('Erro no PUT /api/escolas:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { error } = await supabase.from('escolas').delete().eq('id', id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
