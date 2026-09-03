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
    <header className="bg-white border-b border-slate-200/90 px-3 sm:px-6 py-3.5 flex items-center justify-between gap-2 sm:gap-4 sticky top-0 z-30 select-none shadow-xs w-full">
      {/* Left: Mobile Menu Button & Title */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {onMenuToggle && (
          <button
            type="button"
            onClick={onMenuToggle}
            className="p-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl lg:hidden transition-colors shrink-0"
            title="Abrir Menu Lateral"
          >
            <Menu className="w-6 h-6 text-slate-800" />
          </button>
        )}
        <h1 className="text-base sm:text-xl lg:text-2xl font-black text-slate-900 tracking-tight truncate">
          {title}
        </h1>
      </div>

      {/* Right Controls: Notifications, Settings, User Avatar, + Nova Ação */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {/* Notification Bell */}
        <button
          type="button"
          title="Central de Alertas & Notificações"
          className="relative p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-all hidden xs:flex items-center justify-center"
        >
          <Bell className="w-5 h-5 text-slate-600" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-600 rounded-full ring-2 ring-white animate-pulse"></span>
        </button>

        {/* User Profile Pill */}
        <div className="flex items-center gap-1.5 bg-slate-100/90 hover:bg-slate-200/80 px-2 sm:px-3 py-1.5 rounded-full border border-slate-200/90 transition-all cursor-pointer">
          <div className="w-6 h-6 sm:w-7 sm:h-7 bg-red-600 text-white rounded-full flex items-center justify-center font-black text-xs shrink-0">
            {profile?.nome ? profile.nome.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />}
          </div>
          <span className="text-xs font-bold text-slate-800 hidden md:inline max-w-[100px] truncate">
            {profile?.nome || 'Usuário'}
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
        </div>

        {/* Primary Action Button: + Nova Ação */}
        <button
          type="button"
          onClick={onNewActionClick}
          className="bg-gradient-to-r from-red-600 via-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 active:scale-[0.98] text-white font-extrabold px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl shadow-md hover:shadow-red-600/25 flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm transition-all whitespace-nowrap"
        >
          <Plus className="w-4 h-4 text-white shrink-0" />
          <span className="hidden sm:inline">Nova Ação</span>
          <span className="sm:hidden">Ação</span>
        </button>
      </div>
    </header>
  );
};
