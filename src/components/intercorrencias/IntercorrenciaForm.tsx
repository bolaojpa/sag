'use client';

import React, { useState } from 'react';
import { AlertOctagon, Send, CheckCircle2, WifiOff, ShieldAlert } from 'lucide-react';
import { CategoriaIntercorrencia, UrgenciaType } from '@/types/database';
import { savePendingIntercorrencia } from '@/lib/offline/db';

interface IntercorrenciaFormProps {
  escolaId: string;
  agenteId: string;
  onSuccess?: () => void;
}

import { ConfirmModal } from '@/components/ui/ConfirmModal';

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
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const categoriasOficiais: CategoriaIntercorrencia[] = [
    'Infraestrutura',
    'Frequência Irregular',
    'Suporte Familiar',
    'Desafios de Aprendizagem',
  ];

  const requestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!descricao.trim()) return;
    setShowConfirmModal(true);
  };

  const executeSubmit = async () => {
    setShowConfirmModal(false);
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
    <div className="bg-white border-l-4 border-l-red-600 border border-slate-200/90 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-red-50 text-red-600 rounded-xl shadow-inner border border-red-100">
            <AlertOctagon className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">Registrar Nova Intercorrência</h2>
            <p className="text-xs text-slate-500 font-medium">Notificação imediata para atendimento prioritário da gestão</p>
          </div>
        </div>
        <span className="text-xs bg-red-50 text-red-700 font-extrabold px-3 py-1 rounded-full border border-red-200/80 flex items-center gap-1 shadow-sm">
          <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
          Semáforo Alerta
        </span>
      </div>

      <form onSubmit={requestSubmit} className="space-y-5">
        {/* Categoria Oficial */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
            Categoria do Problema:
          </label>
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value as CategoriaIntercorrencia)}
            className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-xl p-3 focus:ring-2 focus:ring-red-500 focus:border-red-500 font-semibold shadow-inner"
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
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
            Classificação de Urgência (Semáforo Institucional):
          </label>
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setUrgencia('baixa')}
              className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all active:scale-95 ${
                urgencia === 'baixa'
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-950 ring-2 ring-emerald-500 font-extrabold shadow-md'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-emerald-50/40 hover:border-emerald-300 font-semibold'
              }`}
            >
              <span className="text-2xl">🟢</span>
              <span className="text-xs tracking-tight">Baixa Urgência</span>
            </button>

            <button
              type="button"
              onClick={() => setUrgencia('media')}
              className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all active:scale-95 ${
                urgencia === 'media'
                  ? 'bg-amber-50 border-amber-500 text-amber-950 ring-2 ring-amber-500 font-extrabold shadow-md'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-amber-50/40 hover:border-amber-300 font-semibold'
              }`}
            >
              <span className="text-2xl">🟡</span>
              <span className="text-xs tracking-tight">Média Urgência</span>
            </button>

            <button
              type="button"
              onClick={() => setUrgencia('alta')}
              className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all active:scale-95 ${
                urgencia === 'alta'
                  ? 'bg-red-50 border-red-500 text-red-950 ring-2 ring-red-500 font-extrabold shadow-md animate-pulse'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-red-50/40 hover:border-red-300 font-semibold'
              }`}
            >
              <span className="text-2xl">🔴</span>
              <span className="text-xs tracking-tight">Alta Urgência</span>
            </button>
          </div>
        </div>

        {/* Descrição dos Fatos */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
            Descrição Detalhada do Fato:
          </label>
          <textarea
            required
            rows={3}
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Relate os detalhes operacionais ou pedagógicos observados..."
            className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-xl p-3 focus:ring-2 focus:ring-red-500 focus:border-red-500 font-medium shadow-inner"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full btn-primary py-4 px-5 text-base font-extrabold flex items-center justify-center gap-2.5 shadow-lg shadow-red-600/20 active:scale-[0.99] transition-all"
        >
          <Send className="w-5 h-5 text-white" />
          <span>Enviar Intercorrência à Gestão</span>
        </button>
      </form>

      {feedback && (
        <div
          className={`mt-4 p-4 rounded-xl border text-xs flex items-center gap-3 shadow-inner ${
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
          <span className="font-bold">{feedback.msg}</span>
        </div>
      )}

      {/* Modal de Confirmação de Intercorrência */}
      <ConfirmModal
        isOpen={showConfirmModal}
        title="Confirmar Envio da Intercorrência"
        message={`Deseja registrar o alerta de intercorrência na categoria "${categoria}" com nível de urgência "${urgencia.toUpperCase()}"?`}
        confirmText="Confirmar Envio"
        variant={urgencia === 'alta' ? 'danger' : 'warning'}
        onConfirm={executeSubmit}
        onCancel={() => setShowConfirmModal(false)}
      />
    </div>
  );
};
