'use client';

import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Shield, User, School, RefreshCw } from 'lucide-react';
import { CargoType } from '@/types/database';

interface HeaderProps {
  currentCargo?: CargoType;
  onCargoChange?: (cargo: CargoType) => void;
  currentRegiao?: string;
  onRegiaoChange?: (regiao: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentCargo = 'agente',
  onCargoChange,
  currentRegiao = 'Polo Norte',
  onRegiaoChange,
}) => {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [syncedMessage, setSyncedMessage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);

      const handleOnline = () => {
        setIsOnline(true);
        setSyncedMessage('Sincronização concluída!');
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
    <header className="bg-brand-700 text-white shadow-md border-b-2 border-brand-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Marca Institucional */}
          <div className="flex items-center space-x-3">
            <div className="bg-white text-brand-700 font-black p-2 rounded-lg text-lg tracking-wider shadow-inner flex items-center gap-1.5">
              <School className="w-5 h-5 text-brand-600" />
              <span>SAG</span>
            </div>
            <div>
              <h1 className="font-bold text-sm sm:text-base leading-tight tracking-wide text-white">
                Sistema de Acompanhamento de Gestão
              </h1>
              <p className="text-xs text-brand-100 hidden sm:block">
                Monitoramento Educacional em Tempo Real
              </p>
            </div>
          </div>

          {/* Status de Conexão e Perfil de Teste RBAC */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Mensagem de Sincronização */}
            {syncedMessage && (
              <span className="hidden md:inline-flex items-center gap-1 bg-green-500 text-white text-xs px-2.5 py-1 rounded-full animate-bounce font-medium">
                <RefreshCw className="w-3 h-3 animate-spin" />
                {syncedMessage}
              </span>
            )}

            {/* Badge de Rede Online / Offline */}
            <div
              className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border transition-all ${
                isOnline
                  ? 'bg-emerald-500/20 text-emerald-100 border-emerald-400/40'
                  : 'bg-amber-500/30 text-amber-100 border-amber-400/60 animate-pulse'
              }`}
              title={isOnline ? 'Conectado à internet' : 'Modo offline - Salvando em IndexedDB local'}
            >
              {isOnline ? (
                <>
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

            {/* Simulação Dinâmica de RBAC (Seletor de Cargo & Polo) */}
            {onCargoChange && (
              <div className="bg-brand-800/80 p-1 rounded-lg border border-brand-600/50 flex items-center gap-1 text-xs">
                <Shield className="w-3.5 h-3.5 text-brand-200 hidden md:block" />
                <select
                  value={currentCargo}
                  onChange={(e) => onCargoChange(e.target.value as CargoType)}
                  className="bg-brand-900 text-white text-xs rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-white border border-brand-700 cursor-pointer font-medium"
                >
                  {Object.entries(cargoLabels).map(([key, label]) => (
                    <option key={key} value={key} className="bg-gray-900 text-white">
                      {label}
                    </option>
                  ))}
                </select>

                {(currentCargo === 'gerente_polo' || currentCargo === 'coordenacao_area') && onRegiaoChange && (
                  <select
                    value={currentRegiao}
                    onChange={(e) => onRegiaoChange(e.target.value)}
                    className="bg-brand-900 text-white text-xs rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-white border border-brand-700 cursor-pointer font-medium"
                  >
                    <option value="Polo Norte">Polo Norte</option>
                    <option value="Polo Sul">Polo Sul</option>
                    <option value="Polo Leste">Polo Leste</option>
                  </select>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
