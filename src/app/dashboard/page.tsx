'use client';

import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Nav } from '@/components/layout/Nav';
import { MetricsCards } from '@/components/dashboard/MetricsCards';
import { RegionalHeatmap } from '@/components/dashboard/RegionalHeatmap';
import { CargoType } from '@/types/database';
import { LayoutDashboard, ShieldCheck, RefreshCw } from 'lucide-react';

export default function DashboardPage() {
  const [cargo, setCargo] = useState<CargoType>('coordenacao_geral');
  const [regiao, setRegiao] = useState<string>('Polo Norte');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
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

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Banner Gerencial */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <LayoutDashboard className="w-6 h-6 text-brand-600" />
              <h1 className="text-xl font-extrabold text-gray-900">
                Painel Analítico de Gestão Governamental
              </h1>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Visão consolidada em tempo real para tomada de decisão estratégica — Programa Iniciativa Futuro
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-emerald-50 text-emerald-800 text-xs px-3 py-1.5 rounded-lg border border-emerald-200 font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>RLS Ativo ({cargo})</span>
            </div>

            <button
              onClick={handleRefresh}
              className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1.5"
              title="Atualizar dados do Supabase Realtime"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-brand-600' : ''}`} />
              <span>Atualizar</span>
            </button>
          </div>
        </div>

        {/* Módulo 1: Metrics Cards em Tempo Real */}
        <MetricsCards
          totalVisitas={73}
          totalAlunosImpactados={512}
          intercorrenciasCriticas={3}
          frequenciaIrregularCount={34}
          regiaoAtual={['gerente_polo', 'coordenacao_area'].includes(cargo) ? regiao : 'Rede Global'}
        />

        {/* Módulo 2: Mapa de Calor por Polo */}
        <RegionalHeatmap userCargo={cargo} userRegiao={regiao} />

        {/* Módulo 3: Tabela Sintética de Indicadores */}
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
                <tr className="hover:bg-gray-50">
                  <td className="p-3 font-semibold text-gray-900">EMEF Anísio Teixeira</td>
                  <td className="p-3">Polo Norte</td>
                  <td className="p-3 text-center font-bold text-brand-700">14</td>
                  <td className="p-3 text-center font-bold">128</td>
                  <td className="p-3 text-center text-amber-700 font-bold">8</td>
                  <td className="p-3 text-center text-blue-700 font-bold">11</td>
                  <td className="p-3 text-center font-bold text-red-600">🔴 Alta Urgência</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="p-3 font-semibold text-gray-900">EMEF Paulo Freire</td>
                  <td className="p-3">Polo Norte</td>
                  <td className="p-3 text-center font-bold text-brand-700">10</td>
                  <td className="p-3 text-center font-bold">94</td>
                  <td className="p-3 text-center text-amber-700 font-bold">7</td>
                  <td className="p-3 text-center text-blue-700 font-bold">7</td>
                  <td className="p-3 text-center font-bold text-amber-600">🟡 Média Urgência</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="p-3 font-semibold text-gray-900">EMEF Florestan Fernandes</td>
                  <td className="p-3">Polo Sul</td>
                  <td className="p-3 text-center font-bold text-brand-700">18</td>
                  <td className="p-3 text-center font-bold">145</td>
                  <td className="p-3 text-center text-amber-700 font-bold">4</td>
                  <td className="p-3 text-center text-blue-700 font-bold">6</td>
                  <td className="p-3 text-center font-bold text-emerald-600">🟢 Baixa Urgência</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="p-3 font-semibold text-gray-900">EMEF Darcy Ribeiro</td>
                  <td className="p-3">Polo Sul</td>
                  <td className="p-3 text-center font-bold text-brand-700">13</td>
                  <td className="p-3 text-center font-bold">87</td>
                  <td className="p-3 text-center text-amber-700 font-bold">4</td>
                  <td className="p-3 text-center text-blue-700 font-bold">6</td>
                  <td className="p-3 text-center font-bold text-emerald-600">🟢 Baixa Urgência</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="p-3 font-semibold text-gray-900">EMEF Celso Furtado</td>
                  <td className="p-3">Polo Leste</td>
                  <td className="p-3 text-center font-bold text-brand-700">18</td>
                  <td className="p-3 text-center font-bold">58</td>
                  <td className="p-3 text-center text-amber-700 font-bold">11</td>
                  <td className="p-3 text-center text-blue-700 font-bold">9</td>
                  <td className="p-3 text-center font-bold text-amber-600">🟡 Média Urgência</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
