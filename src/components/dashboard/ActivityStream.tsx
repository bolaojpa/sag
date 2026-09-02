'use client';

import React from 'react';
import { Activity, CheckCircle2, AlertTriangle, Building2, Clock, Users, ShieldCheck } from 'lucide-react';

interface ActivityItem {
  id: string;
  tipo: 'checkin' | 'acao' | 'intercorrencia';
  titulo: string;
  descricao: string;
  escolaNome: string;
  timestamp: string;
  urgencia?: 'Baixa' | 'Média' | 'Alta';
}

export const ActivityStream: React.FC = () => {
  const mockActivities: ActivityItem[] = [];

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-red-50 text-red-600 rounded-xl">
            <Activity className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900">
              Feed de Atividades CRM em Tempo Real
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Sincronia contínua entre o chão da escola e o painel gerencial
            </p>
          </div>
        </div>
        <span className="text-[11px] bg-emerald-50 text-emerald-800 font-extrabold px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          Live Stream
        </span>
      </div>

      <div className="space-y-3">
        {mockActivities.length === 0 ? (
          <div className="p-4 text-center text-xs font-bold text-slate-500 bg-slate-50 rounded-xl border border-slate-100">
            Nenhuma atividade recente no sistema.
          </div>
        ) : (
          mockActivities.map((act) => (
            <div
              key={act.id}
              className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition-all flex items-start gap-3"
            >
              {act.tipo === 'checkin' && (
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              )}
              {act.tipo === 'acao' && (
                <div className="p-2 bg-blue-100 text-blue-700 rounded-lg shrink-0">
                  <Users className="w-4 h-4" />
                </div>
              )}
              {act.tipo === 'intercorrencia' && (
                <div className="p-2 bg-amber-100 text-amber-700 rounded-lg shrink-0">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-extrabold text-slate-900 truncate">{act.titulo}</p>
                  <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 shrink-0">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {act.timestamp}
                  </span>
                </div>
                <p className="text-xs text-slate-600 font-medium mt-0.5 leading-relaxed">{act.descricao}</p>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="text-[10px] font-extrabold text-slate-700 bg-white px-2 py-0.5 rounded-md border border-slate-200 flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-red-600" />
                    {act.escolaNome}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
