'use client';

import React from 'react';
import { Map, Flame, Building, AlertTriangle } from 'lucide-react';

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

  return (
    <div className="card-institutional p-5 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Map className="w-5 h-5 text-brand-600" />
          <h2 className="text-base font-bold text-gray-900">Mapa de Calor da Gestão por Polo</h2>
        </div>
        <span className="text-xs bg-brand-50 text-brand-700 px-2.5 py-1 rounded-full font-bold border border-brand-200 flex items-center gap-1">
          <Flame className="w-3.5 h-3.5 text-brand-600" /> Realtime Presence (Supabase)
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {visiblePolos.map((polo) => (
          <div
            key={polo.nome}
            className={`p-4 rounded-xl border transition-all ${
              polo.status === 'critico'
                ? 'bg-red-50/40 border-red-300 ring-1 ring-red-200'
                : polo.status === 'atencao'
                ? 'bg-amber-50/40 border-amber-300'
                : 'bg-emerald-50/40 border-emerald-300'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                <Building className="w-4 h-4 text-gray-600" />
                {polo.nome}
              </h3>
              {polo.intercorrenciasAltas > 0 ? (
                <span className="text-[11px] bg-red-600 text-white font-bold px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                  <AlertTriangle className="w-3 h-3" /> {polo.intercorrenciasAltas} Alertas 🔴
                </span>
              ) : (
                <span className="text-[11px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded-full">
                  🟢 Operação Normal
                </span>
              )}
            </div>

            <div className="space-y-2 text-xs text-gray-700 bg-white/80 p-3 rounded-lg border border-gray-200/80">
              <div className="flex justify-between font-semibold">
                <span className="text-gray-600">Escolas Monitoradas:</span>
                <span className="text-gray-900">{polo.escolas}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span className="text-gray-600">Visitas/Check-ins Hoje:</span>
                <span className="text-brand-700 font-bold">{polo.visitasHoje}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span className="text-gray-600">Frequência Irregular:</span>
                <span className="text-amber-800 font-bold">{polo.frequenciaIrregular} casos</span>
              </div>
              <div className="flex justify-between font-medium">
                <span className="text-gray-600">Desafios de Aprendizagem:</span>
                <span className="text-blue-800 font-bold">{polo.desafiosAprendizagem} casos</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
