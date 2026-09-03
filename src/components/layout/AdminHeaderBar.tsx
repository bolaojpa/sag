'use client';

import React from 'react';
import { Bell, Settings, User, Plus, Search, ChevronDown, Sparkles, Menu } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface AdminHeaderBarProps {
  title?: string;
  onMenuToggle?: () => void;
  onNewActionClick?: () => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export const AdminHeaderBar: React.FC<AdminHeaderBarProps> = ({
  title = 'Dashboard',
  onMenuToggle,
  onNewActionClick,
  searchQuery = '',
  onSearchChange,
}) => {
  const { profile, user } = useAuth();

  return (
    <header className="bg-white border-b border-slate-200/90 px-4 sm:px-6 py-4 flex items-center justify-between gap-4 sticky top-0 z-30 select-none shadow-xs">
      {/* Left: Mobile Menu Button & Title */}
      <div className="flex items-center gap-3">
        {onMenuToggle && (
          <button
            type="button"
            onClick={onMenuToggle}
            className="p-2 -ml-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl lg:hidden transition-colors"
            title="Abrir Menu Lateral"
          >
            <Menu className="w-6 h-6" />
          </button>
        )}
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight truncate">
          {title}
        </h1>
      </div>

      {/* Right Controls: Search, Notifications, Settings, User Avatar, + Nova Ação */}
      <div className="flex items-center gap-3">
        {/* Notification Bell */}
        <button
          type="button"
          title="Central de Alertas & Notificações"
          className="relative p-2.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-all"
        >
          <Bell className="w-5 h-5 text-slate-600" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-600 rounded-full ring-2 ring-white animate-pulse"></span>
        </button>

        {/* Settings Icon */}
        <button
          type="button"
          title="Configurações do Sistema"
          className="p-2.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-all"
        >
          <Settings className="w-5 h-5 text-slate-600" />
        </button>

        {/* User Profile Pill */}
        <div className="flex items-center gap-2 bg-slate-100/90 hover:bg-slate-200/80 px-3 py-1.5 rounded-full border border-slate-200/90 transition-all cursor-pointer">
          <div className="w-7 h-7 bg-slate-400 text-white rounded-full flex items-center justify-center font-bold text-xs">
            {profile?.nome ? profile.nome.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
          </div>
          <ChevronDown className="w-4 h-4 text-slate-500" />
        </div>

        {/* Primary Action Button: + Nova Ação */}
        <button
          type="button"
          onClick={onNewActionClick}
          className="bg-gradient-to-r from-red-600 via-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 active:scale-[0.98] text-white font-extrabold px-5 py-2.5 rounded-2xl shadow-md hover:shadow-lg hover:shadow-red-600/25 flex items-center gap-2 text-sm transition-all"
        >
          <Plus className="w-4.5 h-4.5 text-white" />
          <span>Nova Ação</span>
        </button>
      </div>
    </header>
  );
};
