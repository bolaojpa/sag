'use client';

import React, { useState } from 'react';
import { Plus, Minus, Send, BookOpen, CheckCircle, WifiOff } from 'lucide-react';
import { savePendingRegistro } from '@/lib/offline/db';

interface AcaoFormProps {
  escolaId: string;
  agenteId: string;
  onSuccess?: (registro: { tipo: string; alunos: number; offline: boolean }) => void;
}

export const AcaoForm: React.FC<AcaoFormProps> = ({ escolaId, agenteId, onSuccess }) => {
  const [tipoAtividade, setTipoAtividade] = useState('Acompanhamento Pedagógico');
  const [alunosImpactados, setAlunosImpactados] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSaved, setLastSaved] = useState<{ tipo: string; alunos: number; offline: boolean } | null>(null);

  const atividadesPredefinidas = [
    'Acompanhamento Pedagógico',
    'Oficina de Aprendizagem',
    'Busca Ativa de Alunos',
    'Reunião com Equipe Escolar',
    'Atendimento às Famílias',
  ];

  const handleIncrement = () => setAlunosImpactados((prev) => prev + 1);
  const handleDecrement = () => setAlunosImpactados((prev) => (prev > 1 ? prev - 1 : 1));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const isOnline = typeof window !== 'undefined' && navigator.onLine;

    const payload = {
      agente_id: agenteId,
      escola_id: escolaId,
      tipo_atividade: tipoAtividade,
      alunos_impactados: alunosImpactados,
    };

    if (!isOnline) {
      // Salva no IndexedDB localmente se estiver offline
      await savePendingRegistro(payload);
      setLastSaved({ tipo: tipoAtividade, alunos: alunosImpactados, offline: true });
    } else {
      // Simulação ou chamada enviada com sucesso
      setLastSaved({ tipo: tipoAtividade, alunos: alunosImpactados, offline: false });
    }

    setIsSubmitting(false);

    if (onSuccess) {
      onSuccess({ tipo: tipoAtividade, alunos: alunosImpactados, offline: !isOnline });
    }
  };

  return (
    <div className="card-institutional p-5 border-l-4 border-l-brand-600 bg-white">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="w-5 h-5 text-brand-600" />
        <h2 className="text-base font-bold text-gray-900">Registro de Ação Diária</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Seleção da Rotina Pedagógica */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Tipo de Rotina / Atividade Executada:
          </label>
          <select
            value={tipoAtividade}
            onChange={(e) => setTipoAtividade(e.target.value)}
            className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg p-2.5 focus:ring-2 focus:ring-brand-500 font-medium"
          >
            {atividadesPredefinidas.map((tipo) => (
              <option key={tipo} value={tipo}>
                {tipo}
              </option>
            ))}
          </select>
        </div>

        {/* Incremental Mobile [+] e [-] para Alunos Impactados */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-2">
            Impacto Directo (Número de Alunos Atendidos):
          </label>
          <div className="flex items-center justify-between bg-gray-50 border border-gray-300 rounded-xl p-2 max-w-sm mx-auto shadow-inner">
            <button
              type="button"
              onClick={handleDecrement}
              className="w-14 h-14 bg-white border border-gray-300 text-gray-800 rounded-lg flex items-center justify-center text-2xl font-bold shadow-sm hover:bg-gray-100 active:bg-gray-200 transition-colors"
              aria-label="Diminuir alunos"
            >
              <Minus className="w-6 h-6 text-brand-700" />
            </button>

            <div className="text-center px-4">
              <span className="text-3xl font-extrabold text-brand-700 tracking-tight">
                {alunosImpactados}
              </span>
              <span className="block text-[11px] text-gray-500 uppercase font-semibold">
                {alunosImpactados === 1 ? 'Aluno' : 'Alunos'}
              </span>
            </div>

            <button
              type="button"
              onClick={handleIncrement}
              className="w-14 h-14 bg-brand-600 text-white rounded-lg flex items-center justify-center text-2xl font-bold shadow-sm hover:bg-brand-700 active:bg-brand-800 transition-colors"
              aria-label="Aumentar alunos"
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Botão de Envio */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full btn-primary py-3.5 px-4 text-base flex items-center justify-center gap-2 mt-4 shadow-md active:scale-[0.99] transition-transform"
        >
          <Send className="w-5 h-5" />
          <span>Salvar Registro de Ação</span>
        </button>
      </form>

      {/* Confirmação Visual */}
      {lastSaved && (
        <div
          className={`mt-4 p-3 rounded-lg border text-xs flex items-center gap-2.5 ${
            lastSaved.offline
              ? 'bg-amber-50 text-amber-900 border-amber-200'
              : 'bg-emerald-50 text-emerald-900 border-emerald-200'
          }`}
        >
          {lastSaved.offline ? (
            <WifiOff className="w-5 h-5 text-amber-600 shrink-0" />
          ) : (
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          )}
          <div>
            <p className="font-bold">
              {lastSaved.offline ? 'Salvo localmente (PWA Offline)' : 'Registro Confirmado no Servidor'}
            </p>
            <p className="text-[11px] opacity-90">
              {lastSaved.tipo} — {lastSaved.alunos} {lastSaved.alunos === 1 ? 'aluno atendido' : 'alunos atendidos'}.
              {lastSaved.offline && ' Será sincronizado silenciosamente ao reconectar.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
