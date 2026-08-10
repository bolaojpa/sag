'use client';

import React, { useState } from 'react';
import { AlertOctagon, Send, CheckCircle2, WifiOff } from 'lucide-react';
import { CategoriaIntercorrencia, UrgenciaType } from '@/types/database';
import { savePendingIntercorrencia } from '@/lib/offline/db';

interface IntercorrenciaFormProps {
  escolaId: string;
  agenteId: string;
  onSuccess?: () => void;
}

export const IntercorrenciaForm: React.FC<IntercorrenciaFormProps> = ({
  escolaId,
  agenteId,
  onSuccess,
}) => {
  const [categoria, setCategoria] = useState<CategoriaIntercorrencia>('Frequência Irregular');
  const [urgencia, setUrgencia] = useState<UrgenciaType>('baixa');
  const [descricao, setDescricao] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ msg: string; offline: boolean } | null>(null);

  // Categorias estritamente alinhadas com as diretrizes institucionais de vocabulário
  const categoriasOficiais: CategoriaIntercorrencia[] = [
    'Infraestrutura',
    'Frequência Irregular',
    'Suporte Familiar',
    'Desafios de Aprendizagem',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!descricao.trim()) return;

    setIsSubmitting(true);
    const isOnline = typeof window !== 'undefined' && navigator.onLine;

    const payload = {
      agente_id: agenteId,
      escola_id: escolaId,
      categoria,
      urgencia,
      descricao,
      status: 'aberto' as const,
    };

    if (!isOnline) {
      await savePendingIntercorrencia(payload);
      setFeedback({
        msg: 'Intercorrência salva localmente no dispositivo (IndexedDB).',
        offline: true,
      });
    } else {
      try {
        const { createClient } = await import('@/lib/supabase/client');
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        const insertPayload: any = {
          agente_id: user?.id,
          categoria,
          urgencia,
          descricao,
          status: 'aberto',
        };

        if (escolaId && escolaId.length > 20) {
          insertPayload.escola_id = escolaId;
        }

        const { data, error } = await supabase
          .from('intercorrencias')
          .insert(insertPayload)
          .select();

        if (error) {
          console.error('Erro de gravação Supabase (intercorrencias):', error);
          setFeedback({
            msg: `❌ Erro no banco Supabase: ${error.message}`,
            offline: false,
          });
          setIsSubmitting(false);
          return;
        } else {
          setFeedback({
            msg: '✅ Intercorrência enviada e salva no banco de dados Supabase com sucesso!',
            offline: false,
          });
          setDescricao('');
          setTimeout(() => {
            if (onSuccess) onSuccess();
          }, 1200);
        }
      } catch (err: any) {
        setFeedback({
          msg: `❌ Erro de conexão: ${err.message || 'Falha de comunicação'}`,
          offline: false,
        });
      }
    }

    setIsSubmitting(false);
  };

  return (
    <div className="card-institutional p-5 border-l-4 border-l-red-600 bg-white">
      <div className="flex items-center gap-2 mb-4">
        <AlertOctagon className="w-5 h-5 text-red-600" />
        <h2 className="text-base font-bold text-gray-900">Registrar Nova Intercorrência</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Categoria Oficial */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Categoria do Problema:
          </label>
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value as CategoriaIntercorrencia)}
            className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg p-2.5 focus:ring-2 focus:ring-red-500 font-medium"
          >
            {categoriasOficiais.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Nível de Urgência (Semáforo) */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-2">
            Classificação de Urgência (Semáforo):
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setUrgencia('baixa')}
              className={`p-3 rounded-lg border flex flex-col items-center justify-center gap-1 transition-all ${
                urgencia === 'baixa'
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-500 font-bold'
                  : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-emerald-50/50'
              }`}
            >
              <span className="text-xl">🟢</span>
              <span className="text-xs">Baixa</span>
            </button>

            <button
              type="button"
              onClick={() => setUrgencia('media')}
              className={`p-3 rounded-lg border flex flex-col items-center justify-center gap-1 transition-all ${
                urgencia === 'media'
                  ? 'bg-amber-50 border-amber-500 text-amber-900 ring-2 ring-amber-500 font-bold'
                  : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-amber-50/50'
              }`}
            >
              <span className="text-xl">🟡</span>
              <span className="text-xs">Média</span>
            </button>

            <button
              type="button"
              onClick={() => setUrgencia('alta')}
              className={`p-3 rounded-lg border flex flex-col items-center justify-center gap-1 transition-all ${
                urgencia === 'alta'
                  ? 'bg-red-50 border-red-500 text-red-900 ring-2 ring-red-500 font-bold animate-pulse'
                  : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-red-50/50'
              }`}
            >
              <span className="text-xl">🔴</span>
              <span className="text-xs">Alta</span>
            </button>
          </div>
        </div>

        {/* Descrição dos Fatos */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Descrição Detalhada do Fato:
          </label>
          <textarea
            required
            rows={3}
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Relate os detalhes operacionais ou pedagógicos observados..."
            className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg p-2.5 focus:ring-2 focus:ring-red-500 font-medium"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full btn-primary bg-red-600 hover:bg-red-700 py-3.5 px-4 text-base flex items-center justify-center gap-2 shadow-md active:scale-[0.99]"
        >
          <Send className="w-5 h-5" />
          <span>Enviar Intercorrência</span>
        </button>
      </form>

      {feedback && (
        <div
          className={`mt-4 p-3 rounded-lg border text-xs flex items-center gap-2.5 ${
            feedback.offline
              ? 'bg-amber-50 text-amber-900 border-amber-200'
              : 'bg-emerald-50 text-emerald-900 border-emerald-200'
          }`}
        >
          {feedback.offline ? (
            <WifiOff className="w-5 h-5 text-amber-600 shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          )}
          <span>{feedback.msg}</span>
        </div>
      )}
    </div>
  );
};
