'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Header } from '@/components/layout/Header';
import { Nav } from '@/components/layout/Nav';
import { CheckInButton } from '@/components/checkin/CheckInButton';
import { AcaoForm } from '@/components/acoes/AcaoForm';
import { IntercorrenciaForm } from '@/components/intercorrencias/IntercorrenciaForm';
import { Escola } from '@/types/database';
import { initOfflineSyncListener } from '@/lib/offline/sync';
import { Sparkles, CheckCircle2, Activity, Users, ShieldAlert } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const AgentSchoolMapView = dynamic(
  () => import('@/components/map/AgentSchoolMapView'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-80 bg-slate-100 rounded-2xl border-2 border-slate-200 flex items-center justify-center text-slate-500 font-extrabold text-xs">
        Carregando mapa OpenStreetMap...
      </div>
    ),
  }
);

export default function HubOperacionalPage() {
  const { user, profile, cargo, regiao, loading } = useAuth();
  const [selectedEscolaId, setSelectedEscolaId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'acoes' | 'intercorrencia'>('acoes');
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  const [escolasList, setEscolasList] = useState<Escola[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('sag_escolas_v7');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed && Array.isArray(parsed)) {
            setEscolasList(parsed);
            if (parsed.length > 0) {
              setSelectedEscolaId(parsed[0].id);
            }
          }
        } catch (e) {
          console.warn('Erro ao ler cache local de escolas:', e);
        }
      }
    }

    const fetchEscolas = async () => {
      try {
        const { createClient } = await import('@/lib/supabase/client');
        const supabase = createClient();
        const { data: dbEscolas } = await supabase.from('escolas').select('*').order('nome', { ascending: true });

        if (dbEscolas) {
          setEscolasList(dbEscolas);
          if (typeof window !== 'undefined') {
            localStorage.setItem('sag_escolas_v7', JSON.stringify(dbEscolas));
          }
          if (dbEscolas.length > 0) {
            setSelectedEscolaId(dbEscolas[0].id);
          }
        }
      } catch (err) {
        console.warn('Erro ao carregar escolas no Hub:', err);
      }
    };

    fetchEscolas();

    const unsubscribe = initOfflineSyncListener((count) => {
      setSyncNotice(`${count} registro(s) salvos offline foram sincronizados com sucesso!`);
      setTimeout(() => setSyncNotice(null), 5000);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!loading && (!user || !profile)) {
      window.location.href = '/login';
    }
  }, [loading, user, profile]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  // Se for ADMIN / Coordenação, exibe TODAS as unidades da rede cadastradas pelo Admin!
  // Se for Agente de Campo, exibe as unidades vinculadas ao seu Grupo.
  const [selectedPoloFilter, setSelectedPoloFilter] = useState<string>('todos');

  // Se for ADMIN / Coordenação, exibe TODAS as unidades da rede cadastradas pelo Admin!
  // Se for Agente de Campo, exibe as unidades vinculadas ao seu Grupo.
  const isAdmin = cargo === 'coordenacao_geral' || cargo === 'coordenador_dados' || cargo === 'coordenacao_area';
  const agentGrupo = profile?.grupo_id || 'Grupo 01';

  const displayEscolas = escolasList.filter((e) => {
    const matchesRole = (isAdmin || !agentGrupo)
      ? true
      : (!e.grupo_id || e.grupo_id === agentGrupo);

    const matchesPolo = selectedPoloFilter === 'todos' || e.regiao === selectedPoloFilter;

    return matchesRole && matchesPolo;
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      <Nav />

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Banner de Sincronização Concluída */}
        {syncNotice && (
          <div className="bg-emerald-600 text-white p-4 rounded-2xl shadow-md flex items-center justify-between text-sm font-extrabold animate-pulse">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-white" />
              <span>{syncNotice}</span>
            </div>
          </div>
        )}

        {/* Header da Jornada CRM de Campo */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase font-extrabold tracking-wider bg-red-50 text-red-700 px-3 py-0.5 rounded-full border border-red-200">
                Programa Iniciativa Futuro
              </span>
              <span className="text-[11px] uppercase font-bold text-slate-500">
                Hub Operacional CRM
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 mt-1">
              {profile?.nome || 'Servidor Educacional'}
            </h2>
            <p className="text-xs text-slate-600 font-semibold mt-0.5">
              Cargo: <span className="font-extrabold text-slate-900 uppercase">{cargo.replace('_', ' ')}</span> | Grupo Escalado:{' '}
              <span className="font-extrabold text-red-700">{isAdmin ? '-' : agentGrupo}</span>
            </p>
          </div>
          <div className="flex items-center gap-2.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <Sparkles className="w-5 h-5 text-red-600" />
            <div className="text-left text-xs">
              <p className="font-extrabold text-slate-900">PWA Contingência Offline</p>
              <p className="text-[11px] text-slate-500 font-medium">Modo de Coleta Rápida (&lt; 3 min)</p>
            </div>
          </div>
        </div>

        {/* Seletor Interativo de Polo / Regional */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-red-600" />
            <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
              Filtrar Unidades Escolares por Polo:
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
            {['todos', 'Polo Norte', 'Polo Sul', 'Polo Leste', 'Polo Oeste'].map((polo) => (
              <button
                key={polo}
                onClick={() => setSelectedPoloFilter(polo)}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all border ${
                  selectedPoloFilter === polo
                    ? 'bg-red-600 text-white border-red-600 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {polo === 'todos' ? '🌐 Todos os Polos' : polo}
              </button>
            ))}
          </div>
        </div>

        {/* Resumo Métrico da Jornada do Agente */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex items-center gap-3">
            <div className="p-3 bg-red-50 text-red-600 rounded-xl shrink-0">
              <Activity className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Check-ins Hoje</p>
              <p className="text-base sm:text-lg font-black text-slate-900">1 Escola</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex items-center gap-3">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl shrink-0">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Alunos Impactados</p>
              <p className="text-base sm:text-lg font-black text-slate-900">Atendimento Ativo</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex items-center gap-3">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl shrink-0">
              <ShieldAlert className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Intercorrências</p>
              <p className="text-base sm:text-lg font-black text-slate-900">Semáforo Ativo</p>
            </div>
          </div>
        </div>

        {/* NOVO MÓDULO: Mapa do OpenStreetMap Leaflet.js para Agentes com Botão de Rota GPS */}
        <AgentSchoolMapView
          escolas={displayEscolas}
          grupoNome={isAdmin ? (selectedPoloFilter === 'todos' ? 'Todas as Unidades (Visão Admin)' : selectedPoloFilter) : agentGrupo}
        />

        {/* Módulo 1: Check-in Transparente via GPS */}
        <CheckInButton
          escolas={displayEscolas}
          selectedEscolaId={selectedEscolaId}
          onSelectEscola={setSelectedEscolaId}
        />

        {/* Módulo 2: Seletor de Ação x Intercorrência */}
        <div className="space-y-4">
          <div className="flex bg-slate-200/80 p-1.5 rounded-2xl border border-slate-300/80">
            <button
              onClick={() => setActiveTab('acoes')}
              className={`flex-1 py-3 text-xs sm:text-sm font-extrabold rounded-xl transition-all ${
                activeTab === 'acoes'
                  ? 'bg-white text-red-700 shadow-md ring-1 ring-red-500/20'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              + Registro de Ação Diária
            </button>
            <button
              onClick={() => setActiveTab('intercorrencia')}
              className={`flex-1 py-3 text-xs sm:text-sm font-extrabold rounded-xl transition-all ${
                activeTab === 'intercorrencia'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ⚠️ Central de Intercorrências
            </button>
          </div>

          {activeTab === 'acoes' ? (
            <AcaoForm escolaId={selectedEscolaId} agenteId={user?.id || 'agente_demo_123'} />
          ) : (
            <IntercorrenciaForm escolaId={selectedEscolaId} agenteId={user?.id || 'agente_demo_123'} />
          )}
        </div>
      </main>
    </div>
  );
}
