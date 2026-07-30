import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Se variáveis de ambiente não estiverem presentes, permite ambiente demo
  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('mock-sag-project')) {
    return response;
  }

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

  // 1. Redireciona usuários não autenticados para a tela de login
  if (!user && !isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // 2. Validação da Whitelist Estrita para Usuários Autenticados
  if (user) {
    // Verifica se existe perfil pré-autorizado para o usuário na tabela profiles
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, cargo')
      .eq('id', user.id)
      .single();

    // Se o e-mail não possui perfil autorizado (e não é o admin supremo), desloga e barra o acesso
    if (!profile && user.email?.toLowerCase() !== 'bolaojpa@gmail.com') {
      await supabase.auth.signOut();
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('error', 'unauthorized');
      return NextResponse.redirect(url);
    }

    // Se usuário já autenticado e autorizado tentar ir para a tela de login, manda para a home
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
