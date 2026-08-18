'use client';

import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Nav } from '@/components/layout/Nav';
import { PdfReportView } from '@/components/relatorios/PdfReport';
import { FileText, Filter } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function RelatoriosPage() {
  const { user, profile, regiao, loading } = useAuth();
  const [selectedEscola, setSelectedEscola] = useState<string>('EMEF Anísio Teixeira');

  React.useEffect(() => {
    if (!loading && (!user || !profile)) {
      window.location.href = '/login';
    }
  }, [loading, user, profile]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="print:hidden">
        <Header />
        <Nav />
      </div>

      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Banner CRM de Controle de Relatório */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-wrap items-center justify-between gap-4 print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-brand-600" />
            <div>
              <h1 className="text-lg font-extrabold text-gray-900 leading-tight">
                Emissão de Relatórios Oficiais (Formato A4 Impressão / PDF)
              </h1>
              <p className="text-xs text-gray-600">
                Relatório executivo otimizado em P&B para arquivo e prestação de contas do Programa Iniciativa Futuro.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <Filter className="w-4 h-4 text-brand-600" />
            <select
              value={selectedEscola}
              onChange={(e) => setSelectedEscola(e.target.value)}
              className="bg-gray-50 border border-gray-300 rounded-lg p-2 font-medium text-gray-800 focus:ring-2 focus:ring-brand-500"
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
