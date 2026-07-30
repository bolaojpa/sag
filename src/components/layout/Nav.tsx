'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ClipboardList, AlertTriangle, LayoutDashboard, FileText, UserCheck } from 'lucide-react';

export const Nav: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    {
      label: 'Hub Operacional',
      href: '/',
      icon: ClipboardList,
      description: 'Check-in e Rotina',
    },
    {
      label: 'Intercorrências',
      href: '/intercorrencias',
      icon: AlertTriangle,
      description: 'Semáforo de Alertas',
    },
    {
      label: 'Painel Gerencial',
      href: '/dashboard',
      icon: LayoutDashboard,
      description: 'Métricas e Mapa',
    },
    {
      label: 'Relatórios A4',
      href: '/relatorios',
      icon: FileText,
      description: 'Exportação PDF',
    },
    {
      label: 'Gestão de Usuários',
      href: '/usuarios',
      icon: UserCheck,
      description: 'Whitelist de Acesso',
    },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-16 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-around sm:justify-start sm:space-x-8 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex items-center gap-2 py-3 px-3 border-b-2 text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? 'border-brand-600 text-brand-700 bg-brand-50/50'
                    : 'border-transparent text-gray-600 hover:text-brand-600 hover:border-gray-300'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-brand-600' : 'text-gray-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
