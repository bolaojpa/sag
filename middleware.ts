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

  const pathname = request.nextUrl.pathname;
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/auth');

  // 1. Redireciona usuários não autenticados para a tela de login
  if (!user && !isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // 2. Validação de Autorização & RBAC Estrito por Rota
  if (user) {
    const userEmail = user.email?.toLowerCase() || '';
    let userCargo = 'agente';

    if (userEmail === 'bolaojpa@gmail.com') {
      userCargo = 'coordenacao_geral';
    } else {
      // Busca perfil em profiles
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, cargo')
        .eq('id', user.id)
        .single();

      if (profile) {
        userCargo = profile.cargo || 'agente';
      } else {
        // Fallback para whitelist_emails
        const { data: whitelist } = await supabase
          .from('whitelist_emails')
          .select('email, cargo, regiao_atuacao, nome')
          .ilike('email', userEmail)
          .single();

        if (whitelist) {
          userCargo = whitelist.cargo || 'agente';
          // Sincroniza o perfil do servidor no banco
          await supabase.from('profiles').upsert({
            id: user.id,
            email: user.email,
            nome: whitelist.nome || user.email,
            cargo: userCargo,
            regiao_atuacao: whitelist.regiao_atuacao || 'Polo Norte',
          });
        } else {
          // Desloga e manda para o login se não estiver na whitelist
          await supabase.auth.signOut();
          const url = request.nextUrl.clone();
          url.pathname = '/login';
          url.searchParams.set('error', 'unauthorized');
          return NextResponse.redirect(url);
        }
      }
    }

    // Se já estiver logado e autorizado, não deixa ficar na tela de login
    if (isAuthRoute) {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url);
    }

    // RBAC: Restrições Estritas de Rota por Cargo
    // /usuarios -> Apenas coordenacao_geral e coordenador_dados
    if (pathname.startsWith('/usuarios')) {
      const allowedRoles = ['coordenacao_geral', 'coordenador_dados'];
      if (!allowedRoles.includes(userCargo)) {
        const url = request.nextUrl.clone();
        url.pathname = '/';
        url.searchParams.set('error', 'forbidden');
        return NextResponse.redirect(url);
      }
    }

    // /dashboard e /relatorios -> Apenas gestores e coordenação
    if (pathname.startsWith('/dashboard') || pathname.startsWith('/relatorios')) {
      const allowedRoles = ['gerente_polo', 'coordenacao_area', 'coordenador_dados', 'coordenacao_geral'];
      if (!allowedRoles.includes(userCargo)) {
        const url = request.nextUrl.clone();
        url.pathname = '/';
        url.searchParams.set('error', 'forbidden');
        return NextResponse.redirect(url);
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sw.js|manifest.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
