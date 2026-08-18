'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ClipboardList, AlertTriangle, LayoutDashboard, FileText, UserCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export const Nav: React.FC = () => {
  const pathname = usePathname();
  const { cargo } = useAuth();

  const allNavItems = [
    {
      label: 'Hub Operacional',
      href: '/',
      icon: ClipboardList,
      description: 'Check-in e Rotina',
      roles: ['agente', 'gerente_polo', 'coordenacao_area', 'coordenador_dados', 'coordenacao_geral'],
    },
    {
      label: 'Intercorrências',
      href: '/intercorrencias',
      icon: AlertTriangle,
      description: 'Semáforo de Alertas',
      roles: ['agente', 'gerente_polo', 'coordenacao_area', 'coordenador_dados', 'coordenacao_geral'],
    },
    {
      label: 'Painel Gerencial',
      href: '/dashboard',
      icon: LayoutDashboard,
      description: 'Métricas e Mapa',
      roles: ['gerente_polo', 'coordenacao_area', 'coordenador_dados', 'coordenacao_geral'],
    },
    {
      label: 'Relatórios A4',
      href: '/relatorios',
      icon: FileText,
      description: 'Exportação PDF',
      roles: ['gerente_polo', 'coordenacao_area', 'coordenador_dados', 'coordenacao_geral'],
    },
    {
      label: 'Gestão de Usuários',
      href: '/usuarios',
      icon: UserCheck,
      description: 'Whitelist de Acesso',
      roles: ['coordenacao_geral', 'coordenador_dados'],
    },
  ];

  const visibleNavItems = allNavItems.filter((item) => item.roles.includes(cargo));

  return (
    <nav className="bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-sm sticky top-16 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-around sm:justify-start space-x-1 sm:space-x-4 overflow-x-auto py-2">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-gradient-to-r from-red-50 to-rose-50 text-red-700 border border-red-200 shadow-sm ring-1 ring-red-500/20'
                    : 'text-slate-600 hover:text-red-700 hover:bg-slate-100/70 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 transition-transform duration-200 ${isActive ? 'text-red-600 scale-110' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
