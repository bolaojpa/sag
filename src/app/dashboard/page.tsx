'use client';

import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Nav } from '@/components/layout/Nav';
import { MetricsCards } from '@/components/dashboard/MetricsCards';
import { RegionalHeatmap } from '@/components/dashboard/RegionalHeatmap';
import { LayoutDashboard, ShieldCheck, RefreshCw } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Escola } from '@/types/database';

export default function DashboardPage() {
  const { user, profile, cargo, regiao, loading } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [escolas, setEscolas] = useState<Escola[]>([]);

  const fetchEscolas = async () => {
    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const { data } = await supabase.from('escolas').select('*').order('nome', { ascending: true });
      if (data) {
        setEscolas(data);
        if (typeof window !== 'undefined') {
          localStorage.setItem('sag_escolas_v7', JSON.stringify(data));
        }
      }
    } catch (err) {}
  };

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('sag_escolas_v7');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed && Array.isArray(parsed)) setEscolas(parsed);
        } catch (e) {}
      }
    }

    fetchEscolas();

    if (!loading && (!user || !profile)) {
      window.location.href = '/login';
    }
  }, [loading, user, profile]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchEscolas();
    setTimeout(() => setIsRefreshing(false), 800);
  };

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

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <Nav />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Banner Gerencial CRM */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <LayoutDashboard className="w-6 h-6 text-brand-600" />
              <h1 className="text-xl font-extrabold text-gray-900">
                Painel Analítico de Gestão (Iniciativa Futuro)
              </h1>
            </div>
            <p className="text-xs text-gray-600 mt-1 font-medium">
              Monitoramento em tempo real do Semáforo de Urgências, Frequência Irregular e Desafios de Aprendizagem.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              className="btn-secondary py-2.5 px-4 text-xs flex items-center gap-2 font-bold shadow-sm"
            >
              <RefreshCw className={`w-4 h-4 text-brand-600 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Atualizar Dados</span>
            </button>
          </div>
        </div>

        {/* Módulo 1: Métricas Gerais em Cards */}
        <MetricsCards
          totalVisitas={0}
          totalAlunosImpactados={0}
          intercorrenciasCriticas={0}
          frequenciaIrregularCount={0}
          regiaoAtual={['gerente_polo', 'coordenacao_area'].includes(cargo) ? regiao : 'Rede Global'}
        />

        {/* Módulo 2: Mapa de Calor e Distribuição Regional */}
        <RegionalHeatmap userCargo={cargo} userRegiao={regiao} />

        {/* Módulo 3: Tabela Sintética de Indicadores CRM */}
        <div className="card-institutional p-5 bg-white">
          <h2 className="text-base font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
            Resumo Operacional de Escolas Atendidas
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-700 font-bold border-b border-gray-300">
                  <th className="p-3">Unidade Escolar</th>
                  <th className="p-3">Polo/Região</th>
                  <th className="p-3 text-center">Visitas</th>
                  <th className="p-3 text-center">Impacto (Alunos)</th>
                  <th className="p-3 text-center">Frequência Irregular</th>
                  <th className="p-3 text-center">Desafios de Aprendizagem</th>
                  <th className="p-3 text-center">Status Semáforo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 font-medium">
                {escolas.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500 font-semibold">
                      ⚠️ Nenhuma unidade escolar cadastrada no banco de dados. Acesse o menu <strong className="text-slate-800">Unidades Escolares</strong> para cadastrar.
                    </td>
                  </tr>
                ) : (
                  escolas.map((escola) => (
                    <tr key={escola.id} className="hover:bg-gray-50">
                      <td className="p-3 font-semibold text-gray-900">{escola.nome}</td>
                      <td className="p-3 text-gray-700">{escola.regiao}</td>
                      <td className="p-3 text-center font-bold text-brand-700">0</td>
                      <td className="p-3 text-center font-bold text-gray-700">0</td>
                      <td className="p-3 text-center text-amber-700 font-bold">0</td>
                      <td className="p-3 text-center text-blue-700 font-bold">0</td>
                      <td className="p-3 text-center font-bold text-emerald-600">🟢 Operação Normal</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
