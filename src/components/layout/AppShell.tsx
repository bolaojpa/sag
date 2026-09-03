'use client';

import React, { useState } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeaderBar } from './AdminHeaderBar';
import { IntercorrenciaForm } from '@/components/intercorrencias/IntercorrenciaForm';
import { useAuth } from '@/context/AuthContext';

interface AppShellProps {
  children: React.ReactNode;
  title?: string;
  onNewActionClick?: () => void;
}

export const AppShell: React.FC<AppShellProps> = ({
  children,
  title = 'Dashboard',
  onNewActionClick,
}) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showModalForm, setShowModalForm] = useState(false);
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen bg-[#f8fafc] font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Desktop & Responsive Mobile Sidebar Drawer */}
      <AdminSidebar
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Body */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Modern CRM Top Header Bar */}
        <AdminHeaderBar
          title={title}
          onMenuToggle={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          onNewActionClick={() => {
            if (onNewActionClick) {
              onNewActionClick();
            } else {
              setShowModalForm(true);
            }
          }}
        />

        {/* Page Content Container */}
        <main className="flex-1 px-3 sm:px-6 lg:px-8 py-4 sm:py-6 overflow-y-auto space-y-4 sm:space-y-6 w-full max-w-full">
          {children}
        </main>
      </div>

      {/* Global Quick Action / Alert Modal */}
      {showModalForm && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 w-full max-w-xl shadow-2xl relative border border-slate-200">
            <button
              onClick={() => setShowModalForm(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 font-extrabold text-lg p-2 rounded-xl hover:bg-slate-100 transition-colors"
            >
              ✕
            </button>
            <h3 className="text-lg font-black text-slate-900 mb-4">Registrar Nova Ação / Alerta</h3>
            <IntercorrenciaForm
              escolaId="e1"
              agenteId={user?.id || 'admin'}
              onSuccess={() => setShowModalForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
