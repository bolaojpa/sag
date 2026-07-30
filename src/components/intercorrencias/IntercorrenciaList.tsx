'use client';

import React, { useState } from 'react';
import { Intercorrencia, StatusIntercorrenciaType, CargoType } from '@/types/database';
import { Shield, Clock, CheckCircle, AlertCircle, Filter } from 'lucide-react';

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
          <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 text-xs px-2.5 py-0.5 rounded-full font-bold border border-red-300">
            🔴 Alta
          </span>
        );
      case 'media':
        return (
          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-xs px-2.5 py-0.5 rounded-full font-bold border border-amber-300">
            🟡 Média
          </span>
        );
      case 'baixa':
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-xs px-2.5 py-0.5 rounded-full font-bold border border-emerald-300">
            🟢 Baixa
          </span>
        );
    }
  };

  const getStatusBadge = (status: StatusIntercorrenciaType) => {
    switch (status) {
      case 'resolvido':
        return (
          <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-xs px-2 py-0.5 rounded font-semibold border border-green-200">
            <CheckCircle className="w-3 h-3" /> Resolvido
          </span>
        );
      case 'em_analise':
        return (
          <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded font-semibold border border-blue-200">
            <Clock className="w-3 h-3" /> Em Análise
          </span>
        );
      case 'aberto':
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded font-semibold border border-gray-300">
            <AlertCircle className="w-3 h-3 text-red-500" /> Aberto
          </span>
        );
    }
  };

  const canManageStatus = ['gerente_polo', 'coordenacao_area', 'coordenador_dados', 'coordenacao_geral'].includes(
    userCargo
  );

  return (
    <div className="space-y-4">
      {/* Filtros da Central */}
      <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm flex flex-wrap gap-3 items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
          <Filter className="w-4 h-4 text-brand-600" />
          <span>Filtrar Ocorrências:</span>
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          <select
            value={filterUrgencia}
            onChange={(e) => setFilterUrgencia(e.target.value)}
            className="bg-gray-50 border border-gray-300 rounded-lg px-2.5 py-1.5 font-medium text-gray-800 focus:ring-1 focus:ring-brand-500"
          >
            <option value="todas">Todas Urgências</option>
            <option value="alta">🔴 Alta Urgência</option>
            <option value="media">🟡 Média Urgência</option>
            <option value="baixa">🟢 Baixa Urgência</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-gray-50 border border-gray-300 rounded-lg px-2.5 py-1.5 font-medium text-gray-800 focus:ring-1 focus:ring-brand-500"
          >
            <option value="todos">Todos Status</option>
            <option value="aberto">Aberto</option>
            <option value="em_analise">Em Análise</option>
            <option value="resolvido">Resolvido</option>
          </select>
        </div>
      </div>

      {/* Lista de Registros */}
      {filteredItems.length === 0 ? (
        <div className="bg-white p-8 rounded-xl border border-gray-200 text-center">
          <p className="text-gray-500 text-sm font-medium">Nenhuma intercorrência encontrada com os filtros selecionados.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={`bg-white p-4 rounded-xl border shadow-sm transition-all ${
                item.urgencia === 'alta' ? 'border-l-4 border-l-red-600 bg-red-50/20' : 'border-gray-200'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  {getUrgenciaBadge(item.urgencia)}
                  <span className="text-xs font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                    {item.categoria}
                  </span>
                </div>
                <div>{getStatusBadge(item.status)}</div>
              </div>

              <p className="text-sm text-gray-800 font-medium mb-3">{item.descricao}</p>

              <div className="flex flex-wrap items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100 gap-2">
                <div>
                  <span className="font-semibold text-gray-700">{item.escola?.nome || 'EMEF Anísio Teixeira'}</span>
                  <span className="mx-1.5">•</span>
                  <span>{new Date(item.created_at).toLocaleDateString('pt-BR')}</span>
                </div>

                {/* Ações Gerenciais do Status */}
                {canManageStatus && onStatusChange && (
                  <div className="flex items-center gap-1.5 bg-gray-50 p-1 rounded border border-gray-200">
                    <Shield className="w-3 h-3 text-brand-600" />
                    <span className="text-[11px] font-semibold text-gray-700">Alterar Status:</span>
                    <select
                      value={item.status}
                      onChange={(e) => onStatusChange(item.id, e.target.value as StatusIntercorrenciaType)}
                      className="bg-white text-xs border border-gray-300 rounded px-1.5 py-0.5 text-gray-800 font-medium cursor-pointer"
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
