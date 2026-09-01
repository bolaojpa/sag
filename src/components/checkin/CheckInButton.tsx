'use client';

import React, { useState } from 'react';
import { MapPin, CheckCircle2, Loader2, AlertCircle, Building2, Navigation } from 'lucide-react';
import { Escola } from '@/types/database';

interface CheckInButtonProps {
  escolas: Escola[];
  selectedEscolaId: string;
  onSelectEscola: (id: string) => void;
  onCheckInSuccess?: (checkInData: { escola_id: string; coords: string; timestamp: string }) => void;
}

export const CheckInButton: React.FC<CheckInButtonProps> = ({
  escolas,
  selectedEscolaId,
  onSelectEscola,
  onCheckInSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [lastCheckIn, setLastCheckIn] = useState<{
    escolaNome: string;
    timestamp: string;
    coords: string;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleCheckIn = () => {
    if (!selectedEscolaId) {
      setErrorMsg('Selecione uma escola para realizar o check-in.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    const escola = escolas.find((e) => e.id === selectedEscolaId);
    const escolaNome = escola ? escola.nome : 'Escola Vinculada';

    // Geolocation API sem bloquear o fluxo
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = `${position.coords.latitude.toFixed(4)},${position.coords.longitude.toFixed(4)}`;
          const timestamp = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

          setLastCheckIn({ escolaNome, timestamp, coords });
          setLoading(false);

          if (onCheckInSuccess) {
            onCheckInSuccess({ escola_id: selectedEscolaId, coords, timestamp: new Date().toISOString() });
          }
        },
        (error) => {
          console.warn('Geolocalização não concedida ou indisponível:', error.message);
          const coords = 'Sem sinal GPS (Modo Transparente)';
          const timestamp = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

          setLastCheckIn({ escolaNome, timestamp, coords });
          setLoading(false);

          if (onCheckInSuccess) {
            onCheckInSuccess({ escola_id: selectedEscolaId, coords, timestamp: new Date().toISOString() });
          }
        },
        { enableHighAccuracy: false, timeout: 5000 }
      );
    } else {
      const timestamp = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      setLastCheckIn({ escolaNome, timestamp, coords: 'Navegador sem suporte GPS' });
      setLoading(false);
      if (onCheckInSuccess) {
        onCheckInSuccess({ escola_id: selectedEscolaId, coords: 'N/A', timestamp: new Date().toISOString() });
      }
    }
  };

  return (
    <div className="bg-white border-l-4 border-l-red-600 border border-slate-200/90 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-red-50 text-red-600 rounded-xl shadow-inner border border-red-100">
            <Building2 className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">Check-in de Visita Escolar</h2>
            <p className="text-xs text-slate-500 font-medium">Registro presencial de assiduidade de campo</p>
          </div>
        </div>
        <span className="text-xs bg-red-50 text-red-700 font-extrabold px-3 py-1 rounded-full border border-red-200/80 flex items-center gap-1 shadow-sm">
          <Navigation className="w-3 h-3 text-red-600 animate-pulse" />
          Mobile GPS
        </span>
      </div>

      {/* Seletor de Escola */}
      <div className="mb-5">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
          Selecione a Unidade Escolar Atendida:
        </label>
        <select
          value={selectedEscolaId}
          onChange={(e) => onSelectEscola(e.target.value)}
          disabled={escolas.length === 0}
          className={`w-full text-sm rounded-xl p-3 font-semibold shadow-inner border transition-all ${
            escolas.length === 0
              ? 'bg-amber-50 text-amber-900 border-amber-300 font-bold'
              : 'bg-slate-50 border-slate-300 text-slate-900 focus:ring-2 focus:ring-red-500'
          }`}
        >
          {escolas.length === 0 ? (
            <option value="">⚠️ Nenhuma escola cadastrada no banco. Acesse "Unidades Escolares" no menu.</option>
          ) : (
            escolas.map((e) => (
              <option key={e.id} value={e.id}>
                {e.nome} ({e.regiao})
              </option>
            ))
          )}
        </select>
      </div>

      {/* Botão Principal de Check-in */}
      <button
        onClick={handleCheckIn}
        disabled={loading || escolas.length === 0}
        className={`w-full py-4 px-5 text-base font-extrabold flex items-center justify-center gap-2.5 rounded-xl transition-all ${
          escolas.length === 0
            ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
            : 'btn-primary shadow-lg shadow-red-600/20 active:scale-[0.99]'
        }`}
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Validando localização GPS...</span>
          </>
        ) : (
          <>
            <MapPin className="w-5 h-5 text-white" />
            <span>Confirmar Check-in na Escola</span>
          </>
        )}
      </button>

      {errorMsg && (
        <div className="mt-3 p-3.5 bg-red-50 text-red-700 text-xs font-semibold rounded-xl border border-red-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Card Informativo de Check-in Confirmado */}
      {lastCheckIn && (
        <div className="mt-4 p-4 bg-gradient-to-br from-emerald-50 to-teal-50 text-emerald-900 text-xs rounded-xl border border-emerald-200/80 flex items-start gap-3 shadow-inner animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-extrabold text-sm text-emerald-950">Check-in Registrado com Sucesso!</p>
            <p className="mt-0.5 font-medium text-emerald-800">
              Unidade: <span className="font-bold text-emerald-950">{lastCheckIn.escolaNome}</span> às{' '}
              <span className="font-extrabold">{lastCheckIn.timestamp}</span>
            </p>
            <p className="text-[11px] text-emerald-700 mt-1 font-mono">
              Coordenadas de campo: {lastCheckIn.coords}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
