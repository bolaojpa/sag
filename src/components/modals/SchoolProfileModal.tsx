'use client';

import React from 'react';
import { Escola } from '@/types/database';
import { Building2, MapPin, Navigation, Calendar, Users, Activity, AlertTriangle, X, ExternalLink, ShieldCheck } from 'lucide-react';

interface SchoolProfileModalProps {
  escola: Escola | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectForCheckIn?: (escolaId: string) => void;
}

export const SchoolProfileModal: React.FC<SchoolProfileModalProps> = ({
  escola,
  isOpen,
  onClose,
  onSelectForCheckIn,
}) => {
  if (!isOpen || !escola) return null;

  const lat = escola.latitude || -7.1153;
  const lng = escola.longitude || -34.8610;
  const gpsRouteUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all space-y-0">
        
        {/* Header do Modal CRM */}
        <div className="bg-gradient-to-r from-red-700 via-red-600 to-rose-700 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white bg-black/20 hover:bg-black/40 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-xs uppercase font-black tracking-wider text-red-200 mb-1">
            <Building2 className="w-4 h-4 text-white" />
            <span>Perfil CRM da Unidade Escolar</span>
          </div>

          <h2 className="text-xl font-extrabold text-white leading-tight">
            {escola.nome}
          </h2>

          <div className="flex items-center gap-2 mt-2">
            <span className="bg-white/20 text-white text-[11px] font-extrabold px-3 py-0.5 rounded-full border border-white/30 backdrop-blur-md">
              {escola.regiao || 'Polo Municipal'}
            </span>
            <span className="bg-emerald-500/30 text-emerald-100 text-[11px] font-extrabold px-3 py-0.5 rounded-full border border-emerald-400/40 backdrop-blur-md flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-300" />
              Unidade Ativa
            </span>
          </div>
        </div>

        {/* Corpo do Modal CRM */}
        <div className="p-6 space-y-5">
          {/* Endereço Geocodificado & Coordenadas */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-start gap-2.5">
              <MapPin className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Endereço Mapeado (OpenStreetMap):</p>
                <p className="text-sm font-extrabold text-slate-900 leading-snug">
                  {escola.endereco || 'Endereço em processamento via pino geografico'}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200/80 font-mono">
              <span className="text-slate-500 font-sans font-semibold">Coordenadas Pino:</span>
              <span className="font-extrabold text-red-700 bg-red-50 px-2.5 py-1 rounded-lg border border-red-200">
                {lat.toFixed(6)}, {lng.toFixed(6)}
              </span>
            </div>
          </div>

          {/* Cards Rápidos de Indicadores CRM da Escola */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <Activity className="w-4 h-4 text-red-600 mx-auto mb-1" />
              <p className="text-[10px] uppercase font-bold text-slate-500">Check-ins</p>
              <p className="text-base font-black text-slate-900 mt-0.5">Visita Hoje</p>
            </div>

            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <Users className="w-4 h-4 text-blue-600 mx-auto mb-1" />
              <p className="text-[10px] uppercase font-bold text-slate-500">Atendimentos</p>
              <p className="text-base font-black text-slate-900 mt-0.5">Alunos OK</p>
            </div>

            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <AlertTriangle className="w-4 h-4 text-amber-600 mx-auto mb-1" />
              <p className="text-[10px] uppercase font-bold text-slate-500">Semáforo</p>
              <p className="text-base font-black text-slate-900 mt-0.5">Sem Alertas</p>
            </div>
          </div>

          {/* Ações Diretas */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <a
              href={gpsRouteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full btn-primary py-3.5 px-4 text-xs font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-red-600/20"
            >
              <Navigation className="w-4 h-4 text-white" />
              <span>Rotear no GPS (Waze / Google Maps)</span>
              <ExternalLink className="w-3.5 h-3.5 text-white/80" />
            </a>

            {onSelectForCheckIn && (
              <button
                type="button"
                onClick={() => {
                  onSelectForCheckIn(escola.id);
                  onClose();
                }}
                className="w-full sm:w-auto btn-secondary py-3.5 px-4 text-xs font-extrabold whitespace-nowrap"
              >
                <span>Fazer Check-in</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
