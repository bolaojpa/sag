import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cuuayomhetzomccrfqpp.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_4ZCz6B77Ki9qG56j4LsfsA_dqA2EeI4';

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthRoute = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/auth');

  // 1. Redireciona QUALQUER usuário não autenticado para a tela de login
  if (!user && !isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // 2. Validação da Whitelist Estrita para Usuários Autenticados
  if (user) {
    const userEmail = user.email?.toLowerCase() || '';

    if (userEmail !== 'bolaojpa@gmail.com') {
      // 1. Checa se o perfil existe em profiles
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, cargo')
        .eq('id', user.id)
        .single();

      if (!profile) {
        // 2. Fallback: Checa se o e-mail consta na tabela whitelist_emails
        const { data: whitelist } = await supabase
          .from('whitelist_emails')
          .select('email, cargo, regiao_atuacao, nome')
          .ilike('email', userEmail)
          .single();

        if (whitelist) {
          // Cria/Sincroniza automaticamente o perfil do servidor no banco
          await supabase.from('profiles').upsert({
            id: user.id,
            email: user.email,
            nome: whitelist.nome || user.email,
            cargo: whitelist.cargo || 'agente',
            regiao_atuacao: whitelist.regiao_atuacao || 'Polo Norte',
          });
        } else {
          // Se não estiver em nenhuma das duas listas, desloga e manda para a tela de login
          await supabase.auth.signOut();
          const url = request.nextUrl.clone();
          url.pathname = '/login';
          url.searchParams.set('error', 'unauthorized');
          return NextResponse.redirect(url);
        }
      }
    }

    // Se usuário autenticado e autorizado tentar ir para a tela de login, manda para a home
    if (isAuthRoute) {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sw.js|manifest.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
