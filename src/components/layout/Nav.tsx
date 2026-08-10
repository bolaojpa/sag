'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ClipboardList, AlertTriangle, LayoutDashboard, FileText, UserCheck } from 'lucide-react';

export const Nav: React.FC = () => {
  const pathname = usePathname();
  const [userCargo, setUserCargo] = React.useState<CargoType>('agente');

  React.useEffect(() => {
    const fetchUserCargo = async () => {
      try {
        const { createClient } = await import('@/lib/supabase/client');
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          if (user.email?.toLowerCase() === 'bolaojpa@gmail.com') {
            setUserCargo('coordenacao_geral');
            return;
          }

          const { data: profile } = await supabase
            .from('profiles')
            .select('cargo')
            .eq('id', user.id)
            .single();

          if (profile?.cargo) {
            setUserCargo(profile.cargo as CargoType);
          }
        }
      } catch (err) {
        console.warn('Erro ao carregar perfil no Nav:', err);
      }
    };

    fetchUserCargo();
  }, []);

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

  const visibleNavItems = allNavItems.filter((item) => item.roles.includes(userCargo));

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-16 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-around sm:justify-start sm:space-x-8 overflow-x-auto">
          {visibleNavItems.map((item) => {
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
