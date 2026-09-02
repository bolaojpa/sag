'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Search } from 'lucide-react';
import { Escola } from '@/types/database';

const AgentSchoolMapView = dynamic(
  () => import('@/components/map/AgentSchoolMapView'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[450px] bg-slate-100 rounded-2xl border border-slate-200 flex items-center justify-center text-slate-500 font-extrabold text-xs">
        Carregando mapa interativo...
      </div>
    ),
  }
);

interface ExecutiveMapCardProps {
  escolas: Escola[];
}

export const ExecutiveMapCard: React.FC<ExecutiveMapCardProps> = ({ escolas }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEscolas = escolas.filter((e) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      e.nome.toLowerCase().includes(q) ||
      (e.regiao && e.regiao.toLowerCase().includes(q)) ||
      (e.endereco && e.endereco.toLowerCase().includes(q))
    );
  });

  return (
    <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm space-y-4 h-full flex flex-col">
      {/* Top Search Input inside Map Card */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar escola, região ou ação..."
          className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-900 font-semibold focus:ring-2 focus:ring-red-500 focus:bg-white transition-all shadow-inner"
        />
      </div>

      {/* Leaflet Map Area */}
      <div className="flex-1 min-h-[420px]">
        <AgentSchoolMapView
          escolas={filteredEscolas}
          grupoNome="Visão Global Admin"
        />
      </div>
    </div>
  );
};
