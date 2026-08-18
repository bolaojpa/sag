'use client';

import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Shield, LogOut, User as UserIcon, School, RefreshCw, Sparkles } from 'lucide-react';
import { CargoType } from '@/types/database';
import { useAuth } from '@/context/AuthContext';

interface HeaderProps {
  currentCargo?: CargoType;
  onCargoChange?: (cargo: CargoType) => void;
  currentRegiao?: string;
  onRegiaoChange?: (regiao: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentCargo,
  onCargoChange,
  currentRegiao,
  onRegiaoChange,
}) => {
  const { user, profile, cargo: authCargo, regiao: authRegiao, signOut } = useAuth();
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [syncedMessage, setSyncedMessage] = useState<string | null>(null);

  const activeCargo = currentCargo || authCargo;
  const activeRegiao = currentRegiao || authRegiao;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);

      const handleOnline = () => {
        setIsOnline(true);
        setSyncedMessage('Sincronização PWA concluída!');
        setTimeout(() => setSyncedMessage(null), 4000);
      };
      const handleOffline = () => setIsOnline(false);

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  const cargoLabels: Record<CargoType, string> = {
    agente: 'Agente Educacional (Campo)',
    gerente_polo: 'Gerente de Polo',
    coordenacao_area: 'Coordenação de Área',
    coordenador_dados: 'Coordenação de Dados',
    coordenacao_geral: 'Coordenação Geral',
  };

  return (
    <header className="bg-gradient-to-r from-red-800 via-brand-700 to-red-900 text-white shadow-lg border-b border-red-900/60 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Marca Institucional - Programa Iniciativa Futuro */}
          <div className="flex items-center space-x-3">
            <div className="bg-white/95 backdrop-blur-md text-red-600 font-black p-2.5 rounded-xl text-lg tracking-wider shadow-lg shadow-black/10 flex items-center gap-2 transform hover:scale-105 transition-transform">
              <School className="w-5 h-5 text-red-600" />
              <span className="bg-gradient-to-r from-red-700 to-red-600 bg-clip-text text-transparent font-black">SAG</span>
            </div>
            <div>
              <h1 className="font-extrabold text-sm sm:text-base leading-tight tracking-wide text-white flex items-center gap-2">
                <span>Sistema de Acompanhamento de Gestão</span>
                <span className="hidden md:inline-flex items-center gap-1 bg-white/10 backdrop-blur-md text-red-100 text-[10px] uppercase font-extrabold px-2.5 py-0.5 rounded-full border border-white/20 shadow-inner">
                  <Sparkles className="w-3 h-3 text-red-300" />
                  Iniciativa Futuro
                </span>
              </h1>
              <p className="text-[11px] text-red-100/90 font-medium hidden sm:block">
                Monitoramento Educacional e Tomada de Decisão em Tempo Real
              </p>
            </div>
          </div>

          {/* Controls, User Profile & Status Badge */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Mensagem de Sincronização */}
            {syncedMessage && (
              <span className="hidden md:inline-flex items-center gap-1.5 bg-emerald-500 text-white text-xs px-3 py-1 rounded-full animate-bounce font-bold shadow-md">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                {syncedMessage}
              </span>
            )}

            {/* Badge PWA Online / Offline */}
            <div
              className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border shadow-sm transition-all ${
                isOnline
                  ? 'bg-emerald-500/20 text-emerald-100 border-emerald-400/40 backdrop-blur-md'
                  : 'bg-amber-500/30 text-amber-100 border-amber-400/60 animate-pulse'
              }`}
              title={isOnline ? 'Conectado à nuvem Supabase em tempo real' : 'Modo offline - Salvando em IndexedDB local'}
            >
              {isOnline ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  <Wifi className="w-3.5 h-3.5 text-emerald-300" />
                  <span className="hidden xs:inline">Online</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-amber-300" />
                  <span>Offline (PWA)</span>
                </>
              )}
            </div>

            {/* Seletor Dinâmico de Cargo/Polo (Se ativado por props) */}
            {onCargoChange && (
              <div className="bg-black/20 backdrop-blur-md p-1 rounded-xl border border-white/10 flex items-center gap-1 text-xs">
                <Shield className="w-3.5 h-3.5 text-red-200 hidden md:block" />
                <select
                  value={activeCargo}
                  onChange={(e) => onCargoChange(e.target.value as CargoType)}
                  className="bg-red-950/80 text-white text-xs rounded-lg px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-white border border-red-800/80 cursor-pointer font-semibold"
                >
                  {Object.entries(cargoLabels).map(([key, label]) => (
                    <option key={key} value={key} className="bg-slate-900 text-white">
                      {label}
                    </option>
                  ))}
                </select>

                {(activeCargo === 'gerente_polo' || activeCargo === 'coordenacao_area') && onRegiaoChange && (
                  <select
                    value={activeRegiao}
                    onChange={(e) => onRegiaoChange(e.target.value)}
                    className="bg-red-950/80 text-white text-xs rounded-lg px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-white border border-red-800/80 cursor-pointer font-semibold"
                  >
                    <option value="Polo Norte">Polo Norte</option>
                    <option value="Polo Sul">Polo Sul</option>
                    <option value="Polo Leste">Polo Leste</option>
                  </select>
                )}
              </div>
            )}

            {/* User Profile Card & Logout */}
            <div className="flex items-center gap-2.5 bg-black/20 backdrop-blur-md px-3 py-1 rounded-xl border border-white/15 shadow-sm">
              <div className="w-8 h-8 bg-gradient-to-tr from-red-600 to-rose-500 text-white rounded-full flex items-center justify-center font-black text-xs shadow-md border border-white/20">
                {profile?.nome ? profile.nome.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
              </div>
              <div className="hidden lg:block text-left text-xs leading-tight">
                <p className="font-extrabold text-white truncate max-w-[130px]">{profile?.nome || user?.email || 'Servidor'}</p>
                <p className="text-[10px] text-red-200/90 font-medium truncate">{cargoLabels[authCargo] || 'Agente'}</p>
              </div>
              <button
                onClick={signOut}
                title="Encerrar Sessão Segura"
                className="p-1.5 text-red-200 hover:text-white hover:bg-white/10 rounded-lg transition-all ml-0.5"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
