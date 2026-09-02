'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Compass, 
  LayoutDashboard, 
  Building2, 
  ClipboardList, 
  Bell, 
  TrendingUp, 
  Settings, 
  User, 
  LogOut,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface AdminSidebarProps {
  children?: React.ReactNode;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ children }) => {
  const pathname = usePathname();
  const { user, profile, cargo, signOut } = useAuth();

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Escolas', href: '/usuarios?tab=escolas', icon: Building2 },
    { label: 'Ações', href: '/', icon: ClipboardList },
    { label: 'Alertas', href: '/intercorrencias', icon: Bell },
    { label: 'Relatórios', href: '/relatorios', icon: TrendingUp },
    { label: 'Configurações', href: '/usuarios?tab=whitelist', icon: Settings },
    { label: 'Perfil', href: '/usuarios', icon: User },
  ];

  const cargoLabels: Record<string, string> = {
    agente: 'Agente Educacional',
    gerente_polo: 'Gerente de Polo',
    coordenacao_area: 'Coordenação de Área',
    coordenador_dados: 'Coordenação de Dados',
    coordenacao_geral: 'Administrador Geral',
  };

  return (
    <aside className="w-64 bg-[#0f172a] text-white flex flex-col justify-between shrink-0 min-h-screen border-r border-slate-800 select-none">
      {/* Top Section: Logo & Navigation Links */}
      <div>
        {/* Logo SAG Iniciativa Futuro */}
        <div className="p-6 flex items-center gap-3 border-b border-slate-800/80">
          <div className="w-10 h-10 bg-gradient-to-tr from-red-600 to-rose-500 rounded-2xl flex items-center justify-center shadow-lg shadow-red-600/30 shrink-0">
            <Compass className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-extrabold text-xl tracking-tight text-white">SAG</h1>
            </div>
            <p className="text-[10px] text-red-400 font-extrabold uppercase tracking-wider">
              Iniciativa Futuro
            </p>
          </div>
        </div>

        {/* Menu Items List */}
        <div className="p-4 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href.includes('?') && pathname === item.href.split('?')[0]);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl font-bold text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-600/25 ring-1 ring-red-500/30 font-extrabold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-850 border border-transparent'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Bottom Profile Card */}
      <div className="p-4 border-t border-slate-800/80">
        <div className="flex items-center justify-between bg-slate-900/90 p-3 rounded-2xl border border-slate-800 hover:bg-slate-850 transition-colors">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center font-black text-sm text-white shrink-0">
              {profile?.nome ? profile.nome.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-extrabold text-white truncate">
                {profile?.nome || 'Administrador Geral'}
              </p>
              <p className="text-[10px] text-slate-400 font-medium truncate">
                {cargoLabels[cargo] || 'Admin'}
              </p>
            </div>
          </div>
          <button
            onClick={signOut}
            title="Encerrar Sessão"
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4 text-red-400" />
          </button>
        </div>
      </div>
    </aside>
  );
};
