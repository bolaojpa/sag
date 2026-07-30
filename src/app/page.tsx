'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Nav } from '@/components/layout/Nav';
import { CheckInButton } from '@/components/checkin/CheckInButton';
import { AcaoForm } from '@/components/acoes/AcaoForm';
import { IntercorrenciaForm } from '@/components/intercorrencias/IntercorrenciaForm';
import { CargoType, Escola } from '@/types/database';
import { initOfflineSyncListener } from '@/lib/offline/sync';
import { Sparkles, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function HubOperacionalPage() {
  const [cargo, setCargo] = useState<CargoType>('agente');
  const [regiao, setRegiao] = useState<string>('Polo Norte');
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
    // Inicializa o ouvinte de sincronização offline silenciosa
    const unsubscribe = initOfflineSyncListener((count) => {
      setSyncNotice(`${count} registro(s) salvos offline foram sincronizados com sucesso!`);
      setTimeout(() => setSyncNotice(null), 5000);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header
        currentCargo={cargo}
        onCargoChange={setCargo}
        currentRegiao={regiao}
        onRegiaoChange={setRegiao}
      />
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

        {/* Card do Perfil Ativo */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-bold tracking-wider text-brand-600">
              Modo de Operação de Campo (Mobile First)
            </span>
            <h2 className="text-lg font-extrabold text-gray-900">
              Agente Educacional de Campo
            </h2>
            <p className="text-xs text-gray-500">
              Região de Atuação: <span className="font-semibold text-gray-800">{regiao}</span>
            </p>
          </div>
          <div className="bg-brand-50 p-2.5 rounded-xl text-brand-700 font-bold text-xs flex items-center gap-1 border border-brand-200">
            <Sparkles className="w-4 h-4 text-brand-600" />
            <span>PWA Ativo</span>
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
              + Ação Diária (Impacto de Alunos)
            </button>
            <button
              onClick={() => setActiveTab('intercorrencia')}
              className={`flex-1 py-3 text-xs sm:text-sm font-bold rounded-lg transition-all ${
                activeTab === 'intercorrencia'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              ⚠️ Central de Intercorrências
            </button>
          </div>

          {activeTab === 'acoes' ? (
            <AcaoForm escolaId={selectedEscolaId} agenteId="agente_demo_123" />
          ) : (
            <IntercorrenciaForm escolaId={selectedEscolaId} agenteId="agente_demo_123" />
          )}
        </div>
      </main>
    </div>
  );
}
