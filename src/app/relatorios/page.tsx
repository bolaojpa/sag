import React, { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { PdfReportView } from '@/components/relatorios/PdfReport';
import { FileText, Filter, Printer, Download } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

import { Escola } from '@/types/database';

export default function RelatoriosPage() {
  const { user, profile, regiao, loading } = useAuth();
  const [escolas, setEscolas] = useState<Escola[]>([]);
  const [selectedEscola, setSelectedEscola] = useState<string>('Rede Municipal - Geral');

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('sag_escolas_v7');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed && Array.isArray(parsed)) setEscolas(parsed);
        } catch (e) {}
      }
    }

    const fetchEscolas = async () => {
      try {
        const { createClient } = await import('@/lib/supabase/client');
        const supabase = createClient();
        const { data } = await supabase.from('escolas').select('*').order('nome', { ascending: true });
        if (data) setEscolas(data);
      } catch (err) {}
    };

    fetchEscolas();

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
    <AppShell title="Emissão de Relatórios Executivos">
      <div className="space-y-6">
        {/* Banner CRM de Controle de Relatório */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-50 text-red-600 rounded-2xl">
              <FileText className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 leading-tight tracking-tight">
                Relatórios Oficiais (Formato A4 Impressão / PDF)
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Relatório executivo de monitoramento e prestação de contas do Programa Iniciativa Futuro.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 p-1.5 rounded-2xl shadow-inner">
              <Filter className="w-4 h-4 text-red-600 ml-2" />
              <select
                value={selectedEscola}
                onChange={(e) => setSelectedEscola(e.target.value)}
                className="bg-transparent text-slate-800 font-bold p-1.5 focus:outline-none text-xs"
              >
                <option value="Rede Municipal - Geral">🌐 Todas as Escolas (Rede Global)</option>
                {escolas.map((e) => (
                  <option key={e.id} value={e.nome}>
                    {e.nome} ({e.regiao})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Componente da Folha A4 Imprimível */}
        <div className="bg-white rounded-3xl p-4 sm:p-8 border border-slate-200/90 shadow-sm overflow-x-auto">
          <PdfReportView escolaNome={selectedEscola} regiao={regiao} />
        </div>
      </div>
    </AppShell>
  );
}
