import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') ?? '/';

  // Na Vercel e proxies, o host real da aplicação vem no header 'x-forwarded-host'
  const forwardedHost = request.headers.get('x-forwarded-host');
  const forwardedProto = request.headers.get('x-forwarded-proto') || 'https';
  
  const origin = forwardedHost 
    ? `${forwardedProto}://${forwardedHost}` 
    : requestUrl.origin;

  if (code) {
    const cookieStore = cookies();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cuuayomhetzomccrfqpp.supabase.co';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_4ZCz6B77Ki9qG56j4LsfsA_dqA2EeI4';

    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Contexto de server component
            }
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const userEmail = user.email?.toLowerCase() || '';

        if (userEmail !== 'bolaojpa@gmail.com') {
          // Checa se o e-mail consta na Whitelist do sistema
          const { data: whitelist } = await supabase
            .from('whitelist_emails')
            .select('email, cargo, regiao_atuacao, nome')
            .ilike('email', userEmail)
            .single();

          const { data: profile } = await supabase
            .from('profiles')
            .select('id, cargo')
            .eq('id', user.id)
            .single();

          if (!whitelist && !profile) {
            // E-mail não autorizado! Encerra sessão imediatamente e manda para o login
            await supabase.auth.signOut();
            return NextResponse.redirect(`${origin}/login?error=unauthorized`);
          } else if (whitelist && !profile) {
            // Sincroniza o perfil do servidor autorizado
            await supabase.from('profiles').upsert({
              id: user.id,
              email: user.email,
              nome: whitelist.nome || user.email,
              cargo: whitelist.cargo || 'agente',
              regiao_atuacao: whitelist.regiao_atuacao || 'Polo Norte',
            });
          }
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
