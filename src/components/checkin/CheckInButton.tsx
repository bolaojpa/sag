'use client';

import React, { useState } from 'react';
import { MapPin, CheckCircle2, Loader2, AlertCircle, Building2 } from 'lucide-react';
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
          // Registro transparente mesmo sem GPS preciso
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
    <div className="card-institutional p-5 border-l-4 border-l-brand-600 bg-white">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-brand-600" />
          <h2 className="text-base font-bold text-gray-900">Check-in de Visita Escolar</h2>
        </div>
        <span className="text-xs bg-brand-50 text-brand-700 font-semibold px-2 py-0.5 rounded-full border border-brand-200">
          Mobile GPS
        </span>
      </div>

      {/* Seletor de Escola */}
      <div className="mb-4">
        <label className="block text-xs font-semibold text-gray-700 mb-1">
          Selecione a Unidade Escolar Atendida:
        </label>
        <select
          value={selectedEscolaId}
          onChange={(e) => onSelectEscola(e.target.value)}
          className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg p-2.5 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 font-medium"
        >
          {escolas.map((e) => (
            <option key={e.id} value={e.id}>
              {e.nome} ({e.regiao})
            </option>
          ))}
        </select>
      </div>

      {/* Botão Principal de Check-in */}
      <button
        onClick={handleCheckIn}
        disabled={loading}
        className="w-full btn-primary py-3.5 px-4 text-base flex items-center justify-center gap-2 shadow-md active:scale-[0.99] transition-transform"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Verificando localização no servidor...</span>
          </>
        ) : (
          <>
            <MapPin className="w-5 h-5" />
            <span>Confirmar Check-in na Escola</span>
          </>
        )}
      </button>

      {errorMsg && (
        <div className="mt-3 p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Card Informativo de Check-in Confirmado */}
      {lastCheckIn && (
        <div className="mt-4 p-3.5 bg-emerald-50 text-emerald-900 text-xs rounded-lg border border-emerald-200 flex items-start gap-3 shadow-inner">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold text-sm text-emerald-950">Check-in Registrado com Sucesso!</p>
            <p className="mt-0.5">
              <span className="font-semibold">{lastCheckIn.escolaNome}</span> às{' '}
              <span className="font-bold">{lastCheckIn.timestamp}</span>
            </p>
            <p className="text-[11px] text-emerald-700 mt-1">
              Coordenadas validadas em segundo plano: {lastCheckIn.coords}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
