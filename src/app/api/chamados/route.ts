import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cuuayomhetzomccrfqpp.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_4ZCz6B77Ki9qG56j4LsfsA_dqA2EeI4';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const agenteId = searchParams.get('agente_id');
    const escolaId = searchParams.get('escola_id');
    const data = searchParams.get('data');

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    let query = supabase.from('chamados_reabertura').select('*').order('created_at', { ascending: false });

    if (agenteId) query = query.eq('agente_id', agenteId);
    if (escolaId) query = query.eq('escola_id', escolaId);
    if (data) query = query.eq('data_bloqueio', data);

    const { data: list, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data: list || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { agente_id, agente_nome, escola_id, escola_nome, data_bloqueio, motivo } = body;

    if (!agente_id || !escola_id || !motivo) {
      return NextResponse.json({ error: 'Campos obrigatórios ausentes.' }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const insertPayload = {
      agente_id,
      agente_nome: agente_nome || 'Agente de Campo',
      escola_id,
      escola_nome: escola_nome || 'Escola',
      data_bloqueio: data_bloqueio || new Date().toISOString().split('T')[0],
      motivo,
      status: 'pendente',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('chamados_reabertura')
      .insert([insertPayload])
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: data ? data[0] : null });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status, resposta_admin } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'ID e status são obrigatórios.' }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const updatePayload: any = {
      status,
      updated_at: new Date().toISOString(),
    };
    if (resposta_admin) updatePayload.resposta_admin = resposta_admin;

    const { data, error } = await supabase
      .from('chamados_reabertura')
      .update(updatePayload)
      .eq('id', id)
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: data ? data[0] : null });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
