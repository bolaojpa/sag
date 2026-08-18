'use client';

import React from 'react';
import { Map, Flame, Building, AlertTriangle, BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

interface RegionalHeatmapProps {
  userCargo: string;
  userRegiao: string;
}

export const RegionalHeatmap: React.FC<RegionalHeatmapProps> = ({ userCargo, userRegiao }) => {
  const polos = [
    {
      nome: 'Polo Norte',
      escolas: 12,
      visitasHoje: 24,
      intercorrenciasAltas: 2,
      frequenciaIrregular: 15,
      desafiosAprendizagem: 18,
      status: 'critico', // vermelho
    },
    {
      nome: 'Polo Sul',
      escolas: 10,
      visitasHoje: 31,
      intercorrenciasAltas: 0,
      frequenciaIrregular: 8,
      desafiosAprendizagem: 12,
      status: 'estavel', // verde
    },
    {
      nome: 'Polo Leste',
      escolas: 8,
      visitasHoje: 18,
      intercorrenciasAltas: 1,
      frequenciaIrregular: 11,
      desafiosAprendizagem: 9,
      status: 'atencao', // amarelo
    },
  ];

  const isRestrictedToPolo = ['gerente_polo', 'coordenacao_area'].includes(userCargo);

  const visiblePolos = isRestrictedToPolo
    ? polos.filter((p) => p.nome === userRegiao)
    : polos;

  // Recharts Data Sets
  const chartPoloData = polos.map((p) => ({
    name: p.nome,
    Visitas: p.visitasHoje,
    'Frequência Irregular': p.frequenciaIrregular,
    'Desafios Aprendizagem': p.desafiosAprendizagem,
  }));

  const pieCategoryData = [
    { name: 'Frequência Irregular', value: 34, color: '#dc2626' },
    { name: 'Desafios de Aprendizagem', value: 39, color: '#2563eb' },
    { name: 'Infraestrutura', value: 12, color: '#d97706' },
    { name: 'Suporte Familiar', value: 15, color: '#059669' },
  ];

  return (
    <div className="space-y-6">
      {/* Cards de Mapa de Calor por Polo */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-5 pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-red-50 text-red-600 rounded-xl">
              <Map className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Mapa de Calor da Gestão por Polo</h2>
              <p className="text-xs text-slate-500 font-medium">Monitoramento em tempo real de presença e assiduidade</p>
            </div>
          </div>
          <span className="text-xs bg-red-50 text-red-700 px-3 py-1 rounded-full font-extrabold border border-red-200 flex items-center gap-1.5 shadow-sm">
            <Flame className="w-3.5 h-3.5 text-red-600 animate-bounce" /> Realtime Presence (Supabase)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {visiblePolos.map((polo) => (
            <div
              key={polo.nome}
              className={`p-5 rounded-2xl border transition-all duration-300 transform hover:-translate-y-0.5 ${
                polo.status === 'critico'
                  ? 'bg-gradient-to-br from-white via-rose-50/30 to-red-50/40 border-red-300 shadow-sm'
                  : polo.status === 'atencao'
                  ? 'bg-gradient-to-br from-white via-amber-50/30 to-amber-50/40 border-amber-300 shadow-sm'
                  : 'bg-gradient-to-br from-white via-emerald-50/30 to-emerald-50/40 border-emerald-300 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between mb-3.5">
                <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                  <Building className="w-4 h-4 text-slate-600" />
                  {polo.nome}
                </h3>
                {polo.intercorrenciasAltas > 0 ? (
                  <span className="text-[11px] bg-red-600 text-white font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm animate-pulse">
                    <AlertTriangle className="w-3 h-3 text-white" /> {polo.intercorrenciasAltas} Alerta 🔴
                  </span>
                ) : (
                  <span className="text-[11px] bg-emerald-600 text-white font-extrabold px-2.5 py-0.5 rounded-full shadow-sm">
                    🟢 Operação Normal
                  </span>
                )}
              </div>

              <div className="space-y-2.5 text-xs text-slate-700 bg-white/90 p-3.5 rounded-xl border border-slate-200/80 shadow-inner">
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-500">Escolas Monitoradas:</span>
                  <span className="text-slate-900 font-extrabold">{polo.escolas}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-500">Visitas/Check-ins Hoje:</span>
                  <span className="text-red-700 font-extrabold">{polo.visitasHoje}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span className="text-slate-500">Frequência Irregular:</span>
                  <span className="text-amber-800 font-extrabold">{polo.frequenciaIrregular} casos</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span className="text-slate-500">Desafios de Aprendizagem:</span>
                  <span className="text-blue-800 font-extrabold">{polo.desafiosAprendizagem} casos</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Gráficos Analíticos Interativos (Recharts) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico 1: Atendimento por Polo */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-200">
            <BarChart3 className="w-5 h-5 text-red-600" />
            <h3 className="text-sm font-extrabold text-slate-900">Volume de Atendimento por Polo Regional</h3>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartPoloData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 700 }} stroke="#64748b" />
                <YAxis tick={{ fontSize: 11 }} stroke="#64748b" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="Visitas" fill="#dc2626" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Frequência Irregular" fill="#d97706" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Desafios Aprendizagem" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico 2: Distribuição de Categorias */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-200">
            <PieChartIcon className="w-5 h-5 text-red-600" />
            <h3 className="text-sm font-extrabold text-slate-900">Distribuição de Intercorrências por Categoria</h3>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieCategoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieCategoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #cbd5e1' }}
                />
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '11px', fontWeight: 600 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
