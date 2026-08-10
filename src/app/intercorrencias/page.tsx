'use client';

import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Nav } from '@/components/layout/Nav';
import { IntercorrenciaList } from '@/components/intercorrencias/IntercorrenciaList';
import { IntercorrenciaForm } from '@/components/intercorrencias/IntercorrenciaForm';
import { CargoType, Intercorrencia, StatusIntercorrenciaType } from '@/types/database';
import { AlertOctagon, PlusCircle, ListFilter } from 'lucide-react';

export default function IntercorrenciasPage() {
  const [cargo, setCargo] = useState<CargoType>('gerente_polo');
  const [regiao, setRegiao] = useState<string>('Polo Norte');
  const [showForm, setShowForm] = useState<boolean>(false);

  const [intercorrenciasDemo, setIntercorrenciasDemo] = useState<Intercorrencia[]>([]);

  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  React.useEffect(() => {
    const checkAuthAndFetchData = async () => {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = '/login';
        return;
      }

      const userEmail = user.email?.toLowerCase() || '';

      if (userEmail !== 'bolaojpa@gmail.com') {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, cargo')
          .eq('id', user.id)
          .single();

        if (!profile) {
          const { data: whitelist } = await supabase
            .from('whitelist_emails')
            .select('email, cargo, regiao_atuacao, nome')
            .ilike('email', userEmail)
            .single();

          if (whitelist) {
            await supabase.from('profiles').upsert({
              id: user.id,
              email: user.email,
              nome: whitelist.nome || user.email,
              cargo: whitelist.cargo || 'agente',
              regiao_atuacao: whitelist.regiao_atuacao || 'Polo Norte',
            });
          } else {
            await supabase.auth.signOut();
            window.location.href = '/login?error=unauthorized';
            return;
          }
        }
      }

      // Busca intercorrências reais do Supabase
      try {
        const { data: realData } = await supabase
          .from('intercorrencias')
          .select('*, escola:escolas(*)')
          .order('created_at', { ascending: false });

        if (realData) {
          setIntercorrenciasDemo(realData);
        }
      } catch (err) {
        console.warn('Busca de intercorrências Supabase:', err);
      }

      setIsAuthenticated(true);
      setIsAuthLoading(false);
    };

    checkAuthAndFetchData();
  }, []);

  const handleRefreshList = async () => {
    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const { data: realData } = await supabase
        .from('intercorrencias')
        .select('*, escola:escolas(*)')
        .order('created_at', { ascending: false });

      if (realData) {
        setIntercorrenciasDemo(realData);
      }
    } catch (err) {
      console.warn('Refresh intercorrencias:', err);
    }
  };

  if (isAuthLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const handleStatusChange = async (id: string, newStatus: StatusIntercorrenciaType) => {
    setIntercorrenciasDemo((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );
    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      await supabase.from('intercorrencias').update({ status: newStatus }).eq('id', id);
    } catch (err) {
      console.error('Erro ao atualizar status no banco Supabase:', err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header
        currentCargo={cargo}
        onCargoChange={setCargo}
        currentRegiao={regiao}
        onRegiaoChange={setRegiao}
      />
      <Nav />

      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Banner da Central */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <AlertOctagon className="w-6 h-6 text-red-600" />
              <h1 className="text-xl font-extrabold text-gray-900">
                Central de Intercorrências (Semáforo de Alertas)
              </h1>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Classificação por semáforo: 🟢 Baixa | 🟡 Média | 🔴 Alta. Atendimento prioritário da gestão.
            </p>
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-primary py-2.5 px-4 text-xs flex items-center gap-2"
          >
            {showForm ? (
              <>
                <ListFilter className="w-4 h-4" />
                <span>Ver Lista de Ocorrências</span>
              </>
            ) : (
              <>
                <PlusCircle className="w-4 h-4" />
                <span>Nova Intercorrência</span>
              </>
            )}
          </button>
        </div>

        {/* Exibição Alternada: Formulário vs Lista */}
        {showForm ? (
          <IntercorrenciaForm
            escolaId="e1"
            agenteId="agente_demo"
            onSuccess={() => {
              setShowForm(false);
              handleRefreshList();
            }}
          />
        ) : (
          <IntercorrenciaList
            items={intercorrenciasDemo}
            userCargo={cargo}
            onStatusChange={handleStatusChange}
          />
        )}
      </main>
    </div>
  );
}
