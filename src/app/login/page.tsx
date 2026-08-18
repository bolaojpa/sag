'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { School, Lock, AlertCircle, Loader2, ShieldCheck, Sparkles, UserCheck, ShieldAlert, KeyRound } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

function LoginContent() {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showDemoOptions, setShowDemoOptions] = useState(false);
  const searchParams = useSearchParams();
  const { refreshProfile } = useAuth();

  useEffect(() => {
    const errorType = searchParams.get('error');
    if (errorType === 'unauthorized') {
      setErrorMsg(
        '🛑 Acesso Negado: Seu e-mail não foi pré-autorizado pela Coordenação Geral do SAG. Solicite ao Administrador o seu cadastro na Whitelist antes de tentar acessar.'
      );
    } else if (errorType === 'auth_failed') {
      setErrorMsg('Falha no processo de autenticação com o Google. Tente novamente.');
    }
  }, [searchParams]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const supabase = createClient();
      const origin = typeof window !== 'undefined' ? window.location.origin : '';

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${origin}/auth/callback`,
        },
      });

      if (error) {
        console.warn('Supabase OAuth Error:', error.message);
        setErrorMsg(`⚠️ Domínio Supabase não alcançado ou não configurado (${error.message}). Você pode utilizar o modo de teste abaixo.`);
        setShowDemoOptions(true);
        setLoading(false);
      }
    } catch (err: any) {
      console.warn('Erro de conexão OAuth Supabase:', err);
      setErrorMsg('⚠️ O projeto Supabase em nuvem não foi localizado via DNS. Utilize as opções de simulação de login abaixo para testar.');
      setShowDemoOptions(true);
      setLoading(false);
    }
  };

  // Simulação de login para testes em ambiente sem DNS ativo
  const handleSimulatedLogin = async (role: 'admin' | 'agente' | 'unauthorized') => {
    setLoading(true);
    setErrorMsg(null);

    if (role === 'unauthorized') {
      setTimeout(() => {
        setErrorMsg(
          '🛑 Acesso Negado: O e-mail (nao_autorizado@gmail.com) não foi pré-autorizado pela Coordenação Geral. Cadastre-o na Whitelist primeiro!'
        );
        setLoading(false);
      }, 600);
      return;
    }

    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();

      const testEmail = role === 'admin' ? 'bolaojpa@gmail.com' : 'agente.campo@joaopessoa.pb.gov.br';

      // Salva sessão localmente para testes
      localStorage.setItem('sag_simulated_user', JSON.stringify({ email: testEmail, role }));
      await refreshProfile();

      window.location.href = '/';
    } catch (err: any) {
      setErrorMsg('Erro ao simular login de teste.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 antialiased">
      {/* Cabeçalho Institucional */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center bg-gradient-to-tr from-red-800 via-red-600 to-rose-600 text-white p-4 rounded-2xl shadow-lg mb-4 shadow-red-600/20 transform hover:scale-105 transition-transform">
          <School className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center justify-center gap-2">
          <span>SAG</span>
          <span className="text-xs bg-red-50 text-red-700 px-2.5 py-0.5 rounded-full border border-red-200 uppercase font-extrabold flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-red-600" />
            v2.0 CRM
          </span>
        </h1>
        <p className="mt-1 text-xs font-black text-red-700 uppercase tracking-widest">
          Sistema de Acompanhamento de Gestão
        </p>
        <p className="mt-1 text-xs text-slate-500 font-semibold">
          Portal Oficial • Programa Iniciativa Futuro
        </p>
      </div>

      {/* Card Principal de Login */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl border border-slate-200/90 sm:px-10 space-y-6">
          {errorMsg && (
            <div className="bg-rose-50 text-rose-950 p-4 rounded-2xl border-2 border-rose-300 text-xs flex items-start gap-3 shadow-sm animate-pulse">
              <AlertCircle className="w-5 h-5 shrink-0 text-red-600 mt-0.5" />
              <div className="font-bold leading-relaxed">{errorMsg}</div>
            </div>
          )}

          {/* Banner de Aviso Whitelist */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-600 font-medium leading-relaxed flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-extrabold text-slate-900 block mb-0.5">Acesso Restrito por Whitelist:</span>
              Apenas servidores cujos e-mails e cargos forem previamente autorizados pelo Administrador conseguirão realizar o login.
            </div>
          </div>

          {/* Botão Oficial Google OAuth */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full btn-primary py-4 px-4 text-sm font-extrabold flex items-center justify-center gap-3 shadow-lg shadow-red-600/20 active:scale-[0.99] transition-all"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-white" />
                <span>Conectando com o Google...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5 bg-white rounded-full p-0.5 shadow-sm" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Entrar com Conta Google Autorizada</span>
              </>
            )}
          </button>

          {/* Opção de Exibir Simulação de Testes */}
          <div className="pt-3 text-center">
            <button
              type="button"
              onClick={() => setShowDemoOptions(!showDemoOptions)}
              className="text-xs font-bold text-red-700 hover:text-red-800 underline flex items-center justify-center gap-1 mx-auto"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>{showDemoOptions ? 'Ocultar Opções de Teste' : 'Opções de Teste de Acesso (Ambiente Local)'}</span>
            </button>

            {showDemoOptions && (
              <div className="mt-3 p-3 bg-slate-100 rounded-xl border border-slate-200 space-y-2 text-xs font-semibold">
                <p className="text-[11px] text-slate-500 font-extrabold uppercase tracking-wider">
                  Testar Autenticação & Níveis de Acesso:
                </p>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleSimulatedLogin('admin')}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-lg font-bold flex items-center justify-center gap-2 shadow-sm"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Entrar como ADMIN (bolaojpa@gmail.com)</span>
                  </button>
                  <button
                    onClick={() => handleSimulatedLogin('agente')}
                    className="w-full bg-slate-800 hover:bg-slate-900 text-white py-2 px-3 rounded-lg font-bold flex items-center justify-center gap-2 shadow-sm"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Entrar como Agente de Campo (Grupo 01)</span>
                  </button>
                  <button
                    onClick={() => handleSimulatedLogin('unauthorized')}
                    className="w-full bg-rose-100 hover:bg-rose-200 text-rose-900 py-2 px-3 rounded-lg font-bold flex items-center justify-center gap-2 border border-rose-300"
                  >
                    <ShieldAlert className="w-4 h-4 text-red-600" />
                    <span>Testar Rejeição de E-mail Não Autorizado</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 text-center">
            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 font-semibold">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Autenticação OAuth2 + Validação de Whitelist Supabase</span>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-500 font-medium">
          &copy; {new Date().getFullYear()} SAG - Sistema de Acompanhamento de Gestão. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
