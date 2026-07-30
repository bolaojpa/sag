'use client';

import React from 'react';
import { Users, MapPin, AlertCircle, AlertOctagon } from 'lucide-react';

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
      <div className="card-institutional p-5 border-t-4 border-t-brand-600">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Visitas (Check-in)
            </p>
            <h3 className="text-2xl font-extrabold text-gray-900 mt-1">{totalVisitas}</h3>
          </div>
          <div className="bg-brand-50 p-3 rounded-xl border border-brand-100">
            <MapPin className="w-6 h-6 text-brand-600" />
          </div>
        </div>
        <p className="text-[11px] text-gray-500 mt-2 font-medium">
          Jurisdição: <span className="font-semibold text-brand-700">{regiaoAtual}</span>
        </p>
      </div>

      {/* Alunos Impactados */}
      <div className="card-institutional p-5 border-t-4 border-t-blue-600">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Alunos Impactados
            </p>
            <h3 className="text-2xl font-extrabold text-blue-900 mt-1">{totalAlunosImpactados}</h3>
          </div>
          <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
        </div>
        <p className="text-[11px] text-gray-500 mt-2 font-medium">
          Registros diários acumulados
        </p>
      </div>

      {/* Intercorrências Críticas (🔴 Alta Urgência) */}
      <div className="card-institutional p-5 border-t-4 border-t-red-600">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Alta Urgência (🔴)
            </p>
            <h3 className="text-2xl font-extrabold text-red-700 mt-1">{intercorrenciasCriticas}</h3>
          </div>
          <div className="bg-red-50 p-3 rounded-xl border border-red-100">
            <AlertOctagon className="w-6 h-6 text-red-600 animate-pulse" />
          </div>
        </div>
        <p className="text-[11px] text-red-600 font-semibold mt-2">
          Gatilho automático no mapa de calor
        </p>
      </div>

      {/* Casos de Frequência Irregular (MANDATORY VOCABULARY) */}
      <div className="card-institutional p-5 border-t-4 border-t-amber-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Frequência Irregular
            </p>
            <h3 className="text-2xl font-extrabold text-amber-800 mt-1">{frequenciaIrregularCount}</h3>
          </div>
          <div className="bg-amber-50 p-3 rounded-xl border border-amber-100">
            <AlertCircle className="w-6 h-6 text-amber-600" />
          </div>
        </div>
        <p className="text-[11px] text-gray-500 mt-2 font-medium">
          Acompanhamento prioritário
        </p>
      </div>
    </div>
  );
};
