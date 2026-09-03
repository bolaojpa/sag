'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { AppShell } from '@/components/layout/AppShell';
import { CheckInButton } from '@/components/checkin/CheckInButton';
import { AcaoForm } from '@/components/acoes/AcaoForm';
import { IntercorrenciaForm } from '@/components/intercorrencias/IntercorrenciaForm';
import { Escola } from '@/types/database';
import { initOfflineSyncListener } from '@/lib/offline/sync';
import { Sparkles, CheckCircle2, Activity, Users, ShieldAlert, Building2, Eye, MapPin } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { SchoolProfileModal } from '@/components/modals/SchoolProfileModal';
import { ActivityStream } from '@/components/dashboard/ActivityStream';
import { AdminDashboardView } from '@/components/dashboard/AdminDashboardView';

const AgentSchoolMapView = dynamic(
  () => import('@/components/map/AgentSchoolMapView'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-80 bg-slate-100 rounded-3xl border border-slate-200 flex items-center justify-center text-slate-500 font-extrabold text-xs">
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
  const [selectedPoloFilter, setSelectedPoloFilter] = useState<string>('todos');
  const [selectedSchoolModal, setSelectedSchoolModal] = useState<Escola | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const handleOpenSchoolModal = (escola: Escola) => {
    setSelectedSchoolModal(escola);
    setIsModalOpen(true);
  };

  const isAdmin = ['coordenacao_geral', 'coordenador_dados', 'coordenacao_area', 'gerente_polo'].includes(cargo);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('sag_escolas_v7');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed && Array.isArray(parsed)) setEscolasList(parsed);
        } catch (e) {}
      }
    }

    const fetchEscolas = async () => {
      try {
        const res = await fetch('/api/escolas');
        if (res.ok) {
          const result = await res.json();
          if (result.data && Array.isArray(result.data)) {
            setEscolasList(result.data);
            if (typeof window !== 'undefined') {
              localStorage.setItem('sag_escolas_v7', JSON.stringify(result.data));
            }
          }
        }
      } catch (err) {
        console.warn('Erro ao buscar escolas da API:', err);
      }
    };

    fetchEscolas();

    if (!loading && (!user || !profile)) {
      window.location.href = '/login';
    }

    initOfflineSyncListener((count) => {
      setSyncNotice(`⚡ Sincronização Concluída: ${count} registros enviados ao servidor.`);
      setTimeout(() => setSyncNotice(null), 6000);
    });
  }, [loading, user, profile]);

  const agentGrupo = (profile?.grupo_id || 'Grupo 01').trim();

  // Escolas visíveis para o Agente ou Admin
  const displayEscolas = escolasList.filter((e) => {
    if (selectedPoloFilter === 'todos') return true;
    return e.regiao === selectedPoloFilter;
  });

  // Auto-seleciona a primeira escola disponível para facilitar o Check-in
  useEffect(() => {
    if (displayEscolas.length > 0 && (!selectedEscolaId || !displayEscolas.some(e => e.id === selectedEscolaId))) {
      setSelectedEscolaId(displayEscolas[0].id);
    }
  }, [displayEscolas, selectedEscolaId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-white text-xs font-bold mt-3">Carregando Hub Operacional SAG...</p>
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  // Visão do ADMIN na raiz (/): Renderiza a Dashboard Exata da Imagem
  if (isAdmin) {
    return <AdminDashboardView escolas={escolasList} />;
  }

  // Visão do AGENTE DE CAMPO: Renderiza dentro da mesma casca moderna AppShell (Sidebar + Header + Visual Limpo)
  return (
    <AppShell title="Hub Operacional & Ações de Campo">
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Banner de Sincronização Concluída */}
        {syncNotice && (
          <div className="bg-emerald-600 text-white p-4 rounded-2xl shadow-md flex items-center justify-between text-sm font-extrabold animate-pulse">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-white" />
              <span>{syncNotice}</span>
            </div>
          </div>
        )}

        {/* Header da Jornada CRM do Agente */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase font-extrabold tracking-wider bg-red-50 text-red-700 px-3 py-0.5 rounded-full border border-red-200">
                Programa Iniciativa Futuro
              </span>
              <span className="text-[11px] uppercase font-bold text-slate-500">
                Agente de Campo
              </span>
            </div>
            <h2 className="text-xl font-black text-slate-900 mt-1">
              {profile?.nome || 'Servidor Educacional'}
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Regional: <span className="font-bold text-slate-800">{regiao || 'Polo Municipal'}</span> | Grupo:{' '}
              <span className="font-extrabold text-red-600">{agentGrupo}</span>
            </p>
          </div>
          <div className="flex items-center gap-2.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <Sparkles className="w-5 h-5 text-red-600" />
            <div className="text-left text-xs">
              <p className="font-extrabold text-slate-900">PWA Offline Ativo</p>
              <p className="text-[11px] text-slate-500 font-medium">Coleta Rápida em Campo</p>
            </div>
          </div>
        </div>

        {/* Seletor Interativo de Polo / Regional */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-red-600" />
            <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
              Filtrar Unidades:
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
            {['todos', 'Polo Norte', 'Polo Sul', 'Polo Leste', 'Polo Oeste'].map((polo) => (
              <button
                key={polo}
                onClick={() => setSelectedPoloFilter(polo)}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all border ${
                  selectedPoloFilter === polo
                    ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white border-transparent shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {polo === 'todos' ? '🌐 Todos os Polos' : polo}
              </button>
            ))}
          </div>
        </div>

        {/* NOVO MÓDULO: Mapa do OpenStreetMap Leaflet.js para Agentes com Botão de Rota GPS */}
        <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200/90 shadow-sm">
          <AgentSchoolMapView
            escolas={displayEscolas}
            grupoNome={isAdmin ? (selectedPoloFilter === 'todos' ? 'Todas as Unidades (Visão Admin)' : selectedPoloFilter) : agentGrupo}
          />
        </div>

        {/* Módulo 1: Check-in Transparente via GPS */}
        <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200/90 shadow-sm">
          <CheckInButton
            escolas={displayEscolas}
            selectedEscolaId={selectedEscolaId}
            onSelectEscola={setSelectedEscolaId}
          />
        </div>

        {/* Botão de Atalho para Abrir Perfil CRM da Escola Selecionada */}
        {displayEscolas.length > 0 && (
          <div className="bg-slate-100/90 p-4 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-800 font-bold">
              <Building2 className="w-4 h-4 text-red-600" />
              <span>Unidade Selecionada: <strong className="text-slate-900">{displayEscolas.find((e) => e.id === selectedEscolaId)?.nome || 'Selecione uma escola'}</strong></span>
            </div>

            <button
              onClick={() => {
                const found = displayEscolas.find((e) => e.id === selectedEscolaId);
                if (found) handleOpenSchoolModal(found);
              }}
              className="bg-white hover:bg-slate-50 text-red-600 border border-slate-200 font-extrabold py-2 px-3.5 rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Eye className="w-4 h-4 text-red-600" />
              <span>Ver Perfil CRM da Escola</span>
            </button>
          </div>
        )}

        {/* Módulo 2: Seletor de Ação x Intercorrência */}
        <div className="space-y-4">
          <div className="flex bg-slate-200/70 p-1.5 rounded-2xl border border-slate-300/80">
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
                  ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ⚠️ Central de Intercorrências
            </button>
          </div>

          <div className="bg-white rounded-3xl p-4 sm:p-8 border border-slate-200/90 shadow-sm">
            {activeTab === 'acoes' ? (
              <AcaoForm escolaId={selectedEscolaId} agenteId={user?.id || 'agente_demo_123'} />
            ) : (
              <IntercorrenciaForm escolaId={selectedEscolaId} agenteId={user?.id || 'agente_demo_123'} />
            )}
          </div>
        </div>

        {/* Feed de Atividades CRM em Tempo Real */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm">
          <ActivityStream />
        </div>

        {/* Modal CRM de Perfil da Escola */}
        <SchoolProfileModal
          escola={selectedSchoolModal}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSelectForCheckIn={(id) => setSelectedEscolaId(id)}
        />
      </div>
    </AppShell>
  );
}
