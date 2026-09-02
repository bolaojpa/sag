'use client';

import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Shield, LogOut, User as UserIcon, School, RefreshCw, Sparkles, Bell, Search, ChevronDown } from 'lucide-react';
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
    coordenacao_geral: 'Coordenação Geral (Admin)',
  };

  return (
    <header className="bg-slate-950 text-white shadow-xl border-b border-slate-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Marca CRM - SAG Iniciativa Futuro */}
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-tr from-red-600 to-rose-600 text-white font-black p-2.5 rounded-xl text-lg tracking-wider shadow-lg shadow-red-600/30 flex items-center gap-2 transform hover:scale-105 transition-transform cursor-pointer">
              <School className="w-5 h-5 text-white" />
              <span className="font-black text-white">SAG</span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-sm sm:text-base leading-tight tracking-tight text-white">
                  Sistema de Acompanhamento de Gestão
                </h1>
                <span className="hidden lg:inline-flex items-center gap-1 bg-red-600/20 text-red-300 text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full border border-red-500/30 shadow-inner">
                  <Sparkles className="w-3 h-3 text-red-400" />
                  CRM v2.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                Prefeitura Municipal de João Pessoa — Monitoramento em Tempo Real
              </p>
            </div>
          </div>

          {/* Right Area: Status, Search, Profile & Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* Mensagem de Sincronização */}
            {syncedMessage && (
              <span className="hidden md:inline-flex items-center gap-1.5 bg-emerald-600 text-white text-xs px-3 py-1 rounded-full animate-bounce font-extrabold shadow-md">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                {syncedMessage}
              </span>
            )}

            {/* Indicator PWA Online / Offline */}
            <div
              className={`flex items-center gap-1.5 text-xs font-extrabold px-3 py-1 rounded-full border shadow-inner transition-all ${
                isOnline
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/80'
                  : 'bg-amber-950/60 text-amber-300 border-amber-800/80 animate-pulse'
              }`}
              title={isOnline ? 'Conectado à nuvem PostgreSQL Supabase' : 'Modo offline PWA (IndexedDB local)'}
            >
              {isOnline ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden xs:inline">Nuvem Conectada</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                  <span>Modo Offline PWA</span>
                </>
              )}
            </div>

            {/* Seletor de Perfis para Teste (Se ativado) */}
            {onCargoChange && (
              <div className="bg-slate-900 p-1 rounded-xl border border-slate-800 flex items-center gap-1 text-xs">
                <Shield className="w-3.5 h-3.5 text-red-400 hidden md:block" />
                <select
                  value={activeCargo}
                  onChange={(e) => onCargoChange(e.target.value as CargoType)}
                  className="bg-slate-950 text-white text-xs rounded-lg px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-red-500 border border-slate-800 cursor-pointer font-bold"
                >
                  {Object.entries(cargoLabels).map(([key, label]) => (
                    <option key={key} value={key} className="bg-slate-900 text-white">
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* User Profile Card CRM */}
            <div className="flex items-center gap-3 bg-slate-900 hover:bg-slate-850 px-3 py-1.5 rounded-xl border border-slate-800 transition-all shadow-sm">
              <div className="w-8 h-8 bg-gradient-to-tr from-red-600 via-rose-600 to-red-500 text-white rounded-full flex items-center justify-center font-black text-xs shadow-md border border-white/20">
                {profile?.nome ? profile.nome.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
              </div>

              <div className="hidden lg:block text-left text-xs leading-tight">
                <p className="font-extrabold text-white truncate max-w-[140px]">
                  {profile?.nome || user?.email || 'Servidor'}
                </p>
                <p className="text-[10px] text-red-400 font-extrabold truncate uppercase">
                  {cargoLabels[authCargo] ? cargoLabels[authCargo].split(' ')[0] : 'Agente'}
                </p>
              </div>

              <button
                onClick={signOut}
                title="Encerrar Sessão Segura"
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
              >
                <LogOut className="w-4 h-4 text-red-400" />
              </button>
            </div>

          </div>
        </div>
      </div>
    </header>
  );
};
