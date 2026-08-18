'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Nav } from '@/components/layout/Nav';
import { CheckInButton } from '@/components/checkin/CheckInButton';
import { AcaoForm } from '@/components/acoes/AcaoForm';
import { IntercorrenciaForm } from '@/components/intercorrencias/IntercorrenciaForm';
import { Escola } from '@/types/database';
import { initOfflineSyncListener } from '@/lib/offline/sync';
import { Sparkles, CheckCircle2, Activity, Users, ShieldAlert, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function HubOperacionalPage() {
  const { user, profile, cargo, regiao, loading } = useAuth();
  const [selectedEscolaId, setSelectedEscolaId] = useState<string>('e1');
  const [activeTab, setActiveTab] = useState<'acoes' | 'intercorrencia'>('acoes');
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  const escolasDemo: Escola[] = [
    { id: 'e1', nome: 'EMEF Anísio Teixeira', regiao: 'Polo Norte', lat_lng_oficial: '-3.7319,-38.5267', created_at: '', updated_at: '' },
    { id: 'e2', nome: 'EMEF Paulo Freire', regiao: 'Polo Norte', lat_lng_oficial: '-3.7380,-38.5300', created_at: '', updated_at: '' },
    { id: 'e3', nome: 'EMEF Florestan Fernandes', regiao: 'Polo Sul', lat_lng_oficial: '-3.7700,-38.5500', created_at: '', updated_at: '' },
    { id: 'e4', nome: 'EMEF Darcy Ribeiro', regiao: 'Polo Sul', lat_lng_oficial: '-3.7800,-38.5600', created_at: '', updated_at: '' },
    { id: 'e5', nome: 'EMEF Celso Furtado', regiao: 'Polo Leste', lat_lng_oficial: '-3.7400,-38.4900', created_at: '', updated_at: '' },
  ];

  useEffect(() => {
    const unsubscribe = initOfflineSyncListener((count) => {
      setSyncNotice(`${count} registro(s) salvos offline foram sincronizados com sucesso!`);
      setTimeout(() => setSyncNotice(null), 5000);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <Nav />

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Banner de Sincronização Concluída */}
        {syncNotice && (
          <div className="bg-emerald-600 text-white p-3.5 rounded-xl shadow-md flex items-center justify-between text-sm font-semibold animate-pulse">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              <span>{syncNotice}</span>
            </div>
          </div>
        )}

        {/* Header da Jornada CRM de Campo */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase font-extrabold tracking-wider bg-brand-50 text-brand-700 px-2.5 py-0.5 rounded-full border border-brand-200">
                Programa Iniciativa Futuro
              </span>
              <span className="text-[11px] uppercase font-bold text-gray-500">
                Hub Operacional CRM
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-gray-900 mt-1">
              {profile?.nome || 'Servidor Educacional'}
            </h2>
            <p className="text-xs text-gray-600">
              Cargo: <span className="font-semibold text-gray-800 uppercase">{cargo.replace('_', ' ')}</span> | Região:{' '}
              <span className="font-semibold text-gray-800">{regiao}</span>
            </p>
          </div>
          <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-xl border border-gray-200">
            <Sparkles className="w-5 h-5 text-brand-600" />
            <div className="text-left text-xs">
              <p className="font-bold text-gray-900">PWA Contingência Offline</p>
              <p className="text-[11px] text-gray-500">Modo de Coleta Rápida (&lt; 3 min)</p>
            </div>
          </div>
        </div>

        {/* Resumo Métrico da Jornada do Agente */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3">
            <div className="p-2.5 bg-brand-50 text-brand-600 rounded-lg shrink-0">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-gray-500 uppercase">Check-ins Hoje</p>
              <p className="text-lg font-bold text-gray-900">1 Escola</p>
            </div>
          </div>

          <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-gray-500 uppercase">Alunos Impactados</p>
              <p className="text-lg font-bold text-gray-900">Atendimento Ativo</p>
            </div>
          </div>

          <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3">
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-gray-500 uppercase">Intercorrências</p>
              <p className="text-lg font-bold text-gray-900">Semáforo Ativo</p>
            </div>
          </div>
        </div>

        {/* Módulo 1: Check-in Transparente via GPS */}
        <CheckInButton
          escolas={escolasDemo}
          selectedEscolaId={selectedEscolaId}
          onSelectEscola={setSelectedEscolaId}
        />

        {/* Módulo 2: Seletor de Ação x Intercorrência */}
        <div className="space-y-4">
          <div className="flex bg-gray-200 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('acoes')}
              className={`flex-1 py-3 text-xs sm:text-sm font-bold rounded-lg transition-all ${
                activeTab === 'acoes'
                  ? 'bg-white text-brand-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              + Registro de Ação Diária
            </button>
            <button
              onClick={() => setActiveTab('intercorrencia')}
              className={`flex-1 py-3 text-xs sm:text-sm font-bold rounded-lg transition-all ${
                activeTab === 'intercorrencia'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
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
