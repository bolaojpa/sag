'use client';

import React, { useState } from 'react';
import { Intercorrencia, StatusIntercorrenciaType, CargoType } from '@/types/database';
import { Shield, Clock, CheckCircle, AlertCircle, Filter, Building, Calendar } from 'lucide-react';

interface IntercorrenciaListProps {
  items: Intercorrencia[];
  userCargo: CargoType;
  onStatusChange?: (id: string, newStatus: StatusIntercorrenciaType) => void;
}

export const IntercorrenciaList: React.FC<IntercorrenciaListProps> = ({
  items,
  userCargo,
  onStatusChange,
}) => {
  const [filterUrgencia, setFilterUrgencia] = useState<string>('todas');
  const [filterStatus, setFilterStatus] = useState<string>('todos');

  const filteredItems = items.filter((item) => {
    const matchUrgencia = filterUrgencia === 'todas' || item.urgencia === filterUrgencia;
    const matchStatus = filterStatus === 'todos' || item.status === filterStatus;
    return matchUrgencia && matchStatus;
  });

  const getUrgenciaBadge = (urgencia: string) => {
    switch (urgencia) {
      case 'alta':
        return (
          <span className="inline-flex items-center gap-1 bg-red-100/90 text-red-800 text-xs px-3 py-1 rounded-full font-extrabold border border-red-300 shadow-sm">
            🔴 Alta Urgência
          </span>
        );
      case 'media':
        return (
          <span className="inline-flex items-center gap-1 bg-amber-100/90 text-amber-800 text-xs px-3 py-1 rounded-full font-extrabold border border-amber-300 shadow-sm">
            🟡 Média Urgência
          </span>
        );
      case 'baixa':
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-100/90 text-emerald-800 text-xs px-3 py-1 rounded-full font-extrabold border border-emerald-300 shadow-sm">
            🟢 Baixa Urgência
          </span>
        );
    }
  };

  const getStatusBadge = (status: StatusIntercorrenciaType) => {
    switch (status) {
      case 'resolvido':
        return (
          <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs px-3 py-1 rounded-xl font-bold border border-emerald-200">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Resolvido
          </span>
        );
      case 'em_analise':
        return (
          <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs px-3 py-1 rounded-xl font-bold border border-blue-200">
            <Clock className="w-3.5 h-3.5 text-blue-600" /> Em Análise
          </span>
        );
      case 'aberto':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-700 text-xs px-3 py-1 rounded-xl font-bold border border-rose-200">
            <AlertCircle className="w-3.5 h-3.5 text-red-600 animate-pulse" /> Aberto
          </span>
        );
    }
  };

  const canManageStatus = ['gerente_polo', 'coordenacao_area', 'coordenador_dados', 'coordenacao_geral'].includes(
    userCargo
  );

  return (
    <div className="space-y-4">
      {/* Barra de Filtros CRM */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex flex-wrap gap-3 items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-extrabold text-slate-800 uppercase tracking-wider">
          <Filter className="w-4 h-4 text-red-600" />
          <span>Filtros do Painel:</span>
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          <select
            value={filterUrgencia}
            onChange={(e) => setFilterUrgencia(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 font-semibold text-slate-800 focus:ring-2 focus:ring-red-500 shadow-inner"
          >
            <option value="todas">Todas Urgências</option>
            <option value="alta">🔴 Alta Urgência</option>
            <option value="media">🟡 Média Urgência</option>
            <option value="baixa">🟢 Baixa Urgência</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 font-semibold text-slate-800 focus:ring-2 focus:ring-red-500 shadow-inner"
          >
            <option value="todos">Todos Status</option>
            <option value="aberto">Aberto</option>
            <option value="em_analise">Em Análise</option>
            <option value="resolvido">Resolvido</option>
          </select>
        </div>
      </div>

      {/* Lista de Registros CRM */}
      {filteredItems.length === 0 ? (
        <div className="bg-white p-10 rounded-2xl border border-slate-200/90 text-center shadow-sm">
          <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-slate-600 text-sm font-bold">Nenhuma intercorrência encontrada com os filtros selecionados.</p>
          <p className="text-xs text-slate-400 mt-1">Utilize o botão "+ Nova Intercorrência" para registrar um alerta de campo.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={`bg-white p-5 rounded-2xl border shadow-sm hover:shadow-md transition-all duration-200 ${
                item.urgencia === 'alta'
                  ? 'border-l-8 border-l-red-600 border-slate-200'
                  : item.urgencia === 'media'
                  ? 'border-l-8 border-l-amber-500 border-slate-200'
                  : 'border-l-8 border-l-emerald-500 border-slate-200'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  {getUrgenciaBadge(item.urgencia)}
                  <span className="text-xs font-extrabold text-slate-800 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                    {item.categoria}
                  </span>
                </div>
                <div>{getStatusBadge(item.status)}</div>
              </div>

              <p className="text-sm text-slate-800 font-semibold mb-4 leading-relaxed bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                {item.descricao}
              </p>

              <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100 gap-2">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-900 flex items-center gap-1">
                    <Building className="w-3.5 h-3.5 text-red-600" />
                    {item.escola?.nome || 'EMEF Anísio Teixeira'}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="font-medium text-slate-600 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {new Date(item.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>

                {/* Ações Gerenciais de Status */}
                {canManageStatus && onStatusChange && (
                  <div className="flex items-center gap-2 bg-slate-100/90 px-3 py-1.5 rounded-xl border border-slate-200">
                    <Shield className="w-3.5 h-3.5 text-red-600" />
                    <span className="text-[11px] font-extrabold text-slate-800 uppercase">Alterar Status:</span>
                    <select
                      value={item.status}
                      onChange={(e) => onStatusChange(item.id, e.target.value as StatusIntercorrenciaType)}
                      className="bg-white text-xs border border-slate-300 rounded-lg px-2 py-1 text-slate-900 font-bold cursor-pointer focus:ring-1 focus:ring-red-500 shadow-sm"
                    >
                      <option value="aberto">Aberto</option>
                      <option value="em_analise">Em Análise</option>
                      <option value="resolvido">Resolvido</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
