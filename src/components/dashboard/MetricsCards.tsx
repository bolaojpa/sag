'use client';

import React from 'react';
import { Users, MapPin, AlertCircle, AlertOctagon, TrendingUp, Sparkles } from 'lucide-react';

interface MetricsCardsProps {
  totalVisitas: number;
  totalAlunosImpactados: number;
  intercorrenciasCriticas: number;
  frequenciaIrregularCount: number;
  regiaoAtual: string;
}

export const MetricsCards: React.FC<MetricsCardsProps> = ({
  totalVisitas,
  totalAlunosImpactados,
  intercorrenciasCriticas,
  frequenciaIrregularCount,
  regiaoAtual,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total de Visitas (Check-ins) */}
      <div className="bg-gradient-to-br from-white via-slate-50/50 to-red-50/20 border-t-4 border-t-red-600 border border-slate-200/90 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              Visitas (Check-in GPS)
            </span>
            <h3 className="text-3xl font-black text-slate-900 mt-1 tracking-tight">{totalVisitas}</h3>
          </div>
          <div className="p-3 bg-red-100/80 text-red-600 rounded-2xl shadow-inner border border-red-200">
            <MapPin className="w-6 h-6 text-red-600" />
          </div>
        </div>
        <div className="flex items-center justify-between mt-3 text-xs pt-2 border-t border-slate-100">
          <span className="text-slate-500 font-medium truncate">Jurisdição:</span>
          <span className="font-extrabold text-red-700 bg-red-50 px-2 py-0.5 rounded-full border border-red-200/80">{regiaoAtual}</span>
        </div>
      </div>

      {/* Alunos Impactados */}
      <div className="bg-gradient-to-br from-white via-slate-50/50 to-blue-50/20 border-t-4 border-t-blue-600 border border-slate-200/90 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              Alunos Impactados
            </span>
            <h3 className="text-3xl font-black text-blue-950 mt-1 tracking-tight">{totalAlunosImpactados}</h3>
          </div>
          <div className="p-3 bg-blue-100/80 text-blue-600 rounded-2xl shadow-inner border border-blue-200">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
        </div>
        <div className="flex items-center justify-between mt-3 text-xs pt-2 border-t border-slate-100">
          <span className="text-slate-500 font-medium">Crescimento:</span>
          <span className="font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-emerald-600" /> +14.2%
          </span>
        </div>
      </div>

      {/* Intercorrências Críticas (🔴 Alta Urgência) */}
      <div className="bg-gradient-to-br from-white via-slate-50/50 to-rose-50/30 border-t-4 border-t-rose-600 border border-slate-200/90 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-rose-800">
              Alta Urgência (🔴)
            </span>
            <h3 className="text-3xl font-black text-rose-700 mt-1 tracking-tight">{intercorrenciasCriticas}</h3>
          </div>
          <div className="p-3 bg-rose-100/90 text-rose-600 rounded-2xl shadow-inner border border-rose-200 animate-pulse">
            <AlertOctagon className="w-6 h-6 text-red-600" />
          </div>
        </div>
        <div className="flex items-center justify-between mt-3 text-xs pt-2 border-t border-slate-100">
          <span className="text-rose-700 font-bold flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-rose-500" /> Semáforo Crítico
          </span>
          <span className="font-extrabold text-rose-800 bg-rose-100 px-2 py-0.5 rounded-full border border-rose-300">Ação Imparável</span>
        </div>
      </div>

      {/* Casos de Frequência Irregular (MANDATORY VOCABULARY) */}
      <div className="bg-gradient-to-br from-white via-slate-50/50 to-amber-50/30 border-t-4 border-t-amber-500 border border-slate-200/90 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-800">
              Frequência Irregular
            </span>
            <h3 className="text-3xl font-black text-amber-900 mt-1 tracking-tight">{frequenciaIrregularCount}</h3>
          </div>
          <div className="p-3 bg-amber-100/90 text-amber-600 rounded-2xl shadow-inner border border-amber-200">
            <AlertCircle className="w-6 h-6 text-amber-600" />
          </div>
        </div>
        <div className="flex items-center justify-between mt-3 text-xs pt-2 border-t border-slate-100">
          <span className="text-slate-500 font-medium">Busca Ativa:</span>
          <span className="font-extrabold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">Em Acompanhamento</span>
        </div>
      </div>
    </div>
  );
};
