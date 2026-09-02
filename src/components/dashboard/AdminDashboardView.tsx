'use client';

import React, { useState } from 'react';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { AdminHeaderBar } from '@/components/layout/AdminHeaderBar';
import { ExecutiveMapCard } from '@/components/dashboard/ExecutiveMapCard';
import { ExecutiveAcoesChartCard } from '@/components/dashboard/ExecutiveAcoesChartCard';
import { ExecutiveAlertsPieCard } from '@/components/dashboard/ExecutiveAlertsPieCard';
import { ExecutiveRecentDesafiosTable } from '@/components/dashboard/ExecutiveRecentDesafiosTable';
import { Escola } from '@/types/database';
import { IntercorrenciaForm } from '@/components/intercorrencias/IntercorrenciaForm';

interface AdminDashboardViewProps {
  escolas: Escola[];
  onNewActionClick?: () => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  escolas,
  onNewActionClick,
}) => {
  const [showModalForm, setShowModalForm] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#f1f5f9] font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Left Dark Navy Sidebar (#0f172a) */}
      <AdminSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar with title, search, notifications, settings, user pill & + Nova Ação button */}
        <AdminHeaderBar
          title="Dashboard"
          onNewActionClick={() => {
            if (onNewActionClick) {
              onNewActionClick();
            } else {
              setShowModalForm(true);
            }
          }}
        />

        {/* Dashboard Content Grid - Identical Layout to Reference Image */}
        <main className="flex-1 p-6 space-y-6 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column: Interactive Map Card (Span 6 cols on LG) */}
            <div className="lg:col-span-6 min-h-[520px]">
              <ExecutiveMapCard escolas={escolas} />
            </div>

            {/* Right Column: Cards Grid (Span 6 cols on LG) */}
            <div className="lg:col-span-6 space-y-6 flex flex-col justify-between">
              
              {/* Top Row: 2 Stat Cards Side by Side (Ações Realizadas + Alertas Críticos) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <ExecutiveAcoesChartCard />
                <ExecutiveAlertsPieCard />
              </div>

              {/* Bottom Row: Desafios Operacionais Recentes Table */}
              <div>
                <ExecutiveRecentDesafiosTable />
              </div>

            </div>

          </div>
        </main>
      </div>

      {/* Modal para registro de + Nova Ação */}
      {showModalForm && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-xl shadow-2xl relative border border-slate-200">
            <button
              onClick={() => setShowModalForm(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 font-extrabold text-lg"
            >
              ✕
            </button>
            <h3 className="text-lg font-black text-slate-900 mb-4">Registrar Nova Ação / Alerta</h3>
            <IntercorrenciaForm
              escolaId={escolas[0]?.id || 'e1'}
              agenteId="admin"
              onSuccess={() => setShowModalForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
