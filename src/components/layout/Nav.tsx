'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ClipboardList, AlertTriangle, LayoutDashboard, FileText, UserCheck, Building2, ChevronRight } from 'lucide-react';
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
      label: 'Unidades Escolares',
      href: '/usuarios?tab=escolas',
      icon: Building2,
      description: 'Cadastro & Mapeamento',
      roles: ['coordenacao_geral', 'coordenador_dados', 'coordenacao_area', 'gerente_polo'],
    },
    {
      label: 'Intercorrências',
      href: '/intercorrencias',
      icon: AlertTriangle,
      description: 'Semáforo de Alertas',
      badge: 'Kanban',
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
      href: '/usuarios?tab=whitelist',
      icon: UserCheck,
      description: 'Whitelist de Acesso',
      roles: ['coordenacao_geral', 'coordenador_dados'],
    },
  ];

  const visibleNavItems = allNavItems.filter((item) => item.roles.includes(cargo));

  return (
    <nav className="bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-sm sticky top-16 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-around sm:justify-start space-x-1 sm:space-x-2 overflow-x-auto py-2.5 scrollbar-none">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex items-center gap-2.5 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-extrabold transition-all whitespace-nowrap group ${
                  isActive
                    ? 'bg-red-600 text-white shadow-md shadow-red-600/25 ring-2 ring-red-600/20'
                    : 'text-slate-600 hover:text-red-600 hover:bg-red-50/60 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 transition-transform duration-200 ${isActive ? 'text-white scale-110' : 'text-slate-400 group-hover:text-red-600'}`} />
                <span>{item.label}</span>

                {item.badge && (
                  <span className={`text-[10px] uppercase font-black px-2 py-0.2 rounded-full border ${
                    isActive
                      ? 'bg-white/20 text-white border-white/30'
                      : 'bg-red-50 text-red-700 border-red-200'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
