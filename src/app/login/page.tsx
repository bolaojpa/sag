'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { School, ShieldAlert, Lock, AlertCircle, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const errorType = searchParams.get('error');
    if (errorType === 'unauthorized') {
      setErrorMsg(
        '🛑 Acesso Negado: Seu e-mail não possui autorização prévia da Coordenação Geral. Este sistema é exclusivo para servidores pré-cadastrados.'
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
        setErrorMsg(`Falha ao iniciar autenticação: ${error.message}`);
        setLoading(false);
      }
    } catch (err: any) {
      console.error('Erro de login:', err);
      setErrorMsg('Erro de conexão ao tentar autenticar. Verifique sua rede.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 antialiased">
      {/* Cabeçalho Institucional */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center bg-brand-700 text-white p-3.5 rounded-2xl shadow-lg mb-3">
          <School className="w-10 h-10" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
          SAG - Iniciativa Futuro
        </h1>
        <p className="mt-1 text-sm font-semibold text-brand-700 uppercase tracking-wider">
          Sistema de Acompanhamento de Gestão
        </p>
        <p className="mt-1 text-xs text-gray-500">
          Portal Oficial de Acesso Restrito a Servidores Autorizados
        </p>
      </div>

      {/* Card Principal de Login */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl border border-gray-200 sm:px-10 space-y-6">
          {errorMsg && (
            <div className="bg-red-50 text-red-800 p-4 rounded-xl border-2 border-red-300 text-xs flex items-start gap-3 shadow-sm animate-pulse">
              <AlertCircle className="w-5 h-5 shrink-0 text-red-600 mt-0.5" />
              <div className="font-semibold leading-relaxed">{errorMsg}</div>
            </div>
          )}

          {/* Botão Oficial Google OAuth */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full btn-primary py-3.5 px-4 text-sm flex items-center justify-center gap-3 shadow-md hover:shadow-lg active:scale-[0.99] transition-all bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Redirecionando para o Google...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5 bg-white rounded-full p-0.5" viewBox="0 0 24 24">
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

          <div className="pt-4 border-t border-gray-100 text-center">
            <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500 font-medium">
              <Lock className="w-3.5 h-3.5 text-gray-400" />
              <span>Conexão Protegida com Controle de Whitelist</span>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-gray-500">
          &copy; {new Date().getFullYear()} Programa Iniciativa Futuro. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}
