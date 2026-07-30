'use client';

import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Nav } from '@/components/layout/Nav';
import { PdfReportView } from '@/components/relatorios/PdfReport';
import { CargoType } from '@/types/database';
import { FileText, Filter } from 'lucide-react';

export default function RelatoriosPage() {
  const [cargo, setCargo] = useState<CargoType>('coordenacao_geral');
  const [regiao, setRegiao] = useState<string>('Polo Norte');
  const [selectedEscola, setSelectedEscola] = useState<string>('EMEF Anísio Teixeira');

  React.useEffect(() => {
    const checkAuth = async () => {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = '/login';
      }
    };
    checkAuth();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="print:hidden">
        <Header
          currentCargo={cargo}
          onCargoChange={setCargo}
          currentRegiao={regiao}
          onRegiaoChange={setRegiao}
        />
        <Nav />
      </div>

      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Banner de Controle de Relatório */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-wrap items-center justify-between gap-4 print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-brand-600" />
            <h1 className="text-base font-extrabold text-gray-900">
              Módulo de Emissão de Relatórios Oficiais (Formato A4 P&B)
            </h1>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={selectedEscola}
              onChange={(e) => setSelectedEscola(e.target.value)}
              className="bg-gray-50 border border-gray-300 rounded-lg p-2 font-medium text-gray-800"
            >
              <option value="Rede Municipal - Geral">Todas as Escolas (Rede Global)</option>
              <option value="EMEF Anísio Teixeira">EMEF Anísio Teixeira (Polo Norte)</option>
              <option value="EMEF Paulo Freire">EMEF Paulo Freire (Polo Norte)</option>
              <option value="EMEF Florestan Fernandes">EMEF Florestan Fernandes (Polo Sul)</option>
            </select>
          </div>
        </div>

        {/* Componente da Folha A4 Imprimível */}
        <PdfReportView escolaNome={selectedEscola} regiao={regiao} />
      </main>
    </div>
  );
}
