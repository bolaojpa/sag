import React from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { ExecutiveMapCard } from '@/components/dashboard/ExecutiveMapCard';
import { ExecutiveAcoesChartCard } from '@/components/dashboard/ExecutiveAcoesChartCard';
import { ExecutiveAlertsPieCard } from '@/components/dashboard/ExecutiveAlertsPieCard';
import { ExecutiveRecentDesafiosTable } from '@/components/dashboard/ExecutiveRecentDesafiosTable';
import { Escola } from '@/types/database';

interface AdminDashboardViewProps {
  escolas: Escola[];
  onNewActionClick?: () => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  escolas,
  onNewActionClick,
}) => {
  return (
    <AppShell title="Dashboard" onNewActionClick={onNewActionClick}>
      {/* Dashboard Content Grid - Identical Layout to Reference Image */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Map Card (Span 6 cols on LG) */}
        <div className="lg:col-span-6 min-h-[480px] sm:min-h-[520px]">
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
    </AppShell>
  );
};

