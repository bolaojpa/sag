'use client';

import React, { useState, useEffect } from 'react';
import { 
  AlertOctagon, 
  Send, 
  CheckCircle2, 
  WifiOff, 
  ShieldAlert, 
  Lock, 
  HelpCircle, 
  Clock, 
  Check, 
  XCircle,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { CategoriaIntercorrencia, UrgenciaType, ChamadoReabertura } from '@/types/database';
import { savePendingIntercorrencia } from '@/lib/offline/db';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

interface IntercorrenciaFormProps {
  escolaId: string;
  escolaNome?: string;
  agenteId: string;
  agenteNome?: string;
  onSuccess?: () => void;
}

export const IntercorrenciaForm: React.FC<IntercorrenciaFormProps> = ({
  escolaId,
  escolaNome = 'Unidade Escolar',
  agenteId,
  agenteNome = 'Agente Educacional',
  onSuccess,
}) => {
  const [categoria, setCategoria] = useState<CategoriaIntercorrencia>('Frequência Irregular');
  const [urgencia, setUrgencia] = useState<UrgenciaType>('baixa');
  const [descricao, setDescricao] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ msg: string; offline: boolean; success: boolean } | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Estados do bloqueio diário e abertura de chamado
  const todayStr = new Date().toISOString().split('T')[0];
  const [isBlockedToday, setIsBlockedToday] = useState<boolean>(false);
  const [chamadoPendente, setChamadoPendente] = useState<ChamadoReabertura | null>(null);
  const [showChamadoModal, setShowChamadoModal] = useState<boolean>(false);
  const [motivoChamado, setMotivoChamado] = useState<string>('');
  const [isSubmittingChamado, setIsSubmittingChamado] = useState<boolean>(false);
  const [chamadoSuccessMsg, setChamadoSuccessMsg] = useState<string | null>(null);

  const categoriasOficiais: CategoriaIntercorrencia[] = [
    'Infraestrutura',
    'Frequência Irregular',
    'Suporte Familiar',
    'Desafios de Aprendizagem',
  ];

  // Verifica se o agente já enviou intercorrência nesta escola na data atual
  const checkDailyLock = async () => {
    if (!escolaId || !agenteId) return;

    try {
      // 1. Checa no localStorage cache
      const localLockKey = `sag_lock_interc_${agenteId}_${escolaId}_${todayStr}`;
      const localLocked = localStorage.getItem(localLockKey);

      // 2. Checa se existe chamado aprovado que destravou
      const resChamado = await fetch(`/api/chamados?agente_id=${agenteId}&escola_id=${escolaId}&data=${todayStr}`);
      if (resChamado.ok) {
        const json = await resChamado.json();
        const chamados: ChamadoReabertura[] = json.data || [];
        const latest = chamados[0];

        if (latest) {
          setChamadoPendente(latest);
          if (latest.status === 'aprovado') {
            // ADMIN REABRIU EM REAL TIME!
            setIsBlockedToday(false);
            return;
          }
        }
      }

      if (localLocked === 'true') {
        setIsBlockedToday(true);
        return;
      }

      // 3. Checa no Supabase se já existe envio hoje
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const startOfDay = `${todayStr}T00:00:00.000Z`;
      const endOfDay = `${todayStr}T23:59:59.999Z`;

      const { data, error } = await supabase
        .from('intercorrencias')
        .select('id')
        .eq('agente_id', agenteId)
        .eq('escola_id', escolaId)
        .gte('created_at', startOfDay)
        .lte('created_at', endOfDay);

      if (data && data.length > 0) {
        setIsBlockedToday(true);
        localStorage.setItem(localLockKey, 'true');
      } else {
        setIsBlockedToday(false);
      }
    } catch (err) {
      console.warn('Verificação de trava diária:', err);
    }
  };

  useEffect(() => {
    checkDailyLock();
    // Polling em real time para detecção de reativação pelo Admin
    const interval = setInterval(checkDailyLock, 6000);
    return () => clearInterval(interval);
  }, [escolaId, agenteId]);

  const requestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!descricao.trim()) return;
    if (isBlockedToday) return;
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
        msg: '⚡ Salvo em Modo Offline (PWA)! Sincronizará com o servidor assim que houver conexão.',
        offline: true,
        success: true,
      });
      // Trava localmente para hoje
      const localLockKey = `sag_lock_interc_${agenteId}_${escolaId}_${todayStr}`;
      localStorage.setItem(localLockKey, 'true');
      setIsBlockedToday(true);
    } else {
      try {
        const { createClient } = await import('@/lib/supabase/client');
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        const insertPayload: any = {
          agente_id: user?.id || agenteId,
          categoria,
          urgencia,
          descricao,
          status: 'aberto',
        };

        if (escolaId && escolaId.length > 10) {
          insertPayload.escola_id = escolaId;
        }

        const { error } = await supabase
          .from('intercorrencias')
          .insert(insertPayload);

        if (error) {
          console.error('Erro Supabase:', error);
          setFeedback({
            msg: `❌ Erro ao salvar: ${error.message}`,
            offline: false,
            success: false,
          });
          setIsSubmitting(false);
          return;
        } else {
          setFeedback({
            msg: '✅ Intercorrência enviada e confirmada no sistema com sucesso!',
            offline: false,
            success: true,
          });
          setDescricao('');

          // Ativa bloqueio para a data atual
          const localLockKey = `sag_lock_interc_${agenteId}_${escolaId}_${todayStr}`;
          localStorage.setItem(localLockKey, 'true');
          setIsBlockedToday(true);

          if (onSuccess) onSuccess();
        }
      } catch (err: any) {
        setFeedback({
          msg: `❌ Erro de conexão: ${err.message || 'Falha na comunicação'}`,
          offline: false,
          success: false,
        });
      }
    }

    setIsSubmitting(false);
  };

  const handleOpenChamado = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!motivoChamado.trim()) return;

    setIsSubmittingChamado(true);
    try {
      const res = await fetch('/api/chamados', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agente_id: agenteId,
          agente_nome: agenteNome,
          escola_id: escolaId,
          escola_nome: escolaNome,
          data_bloqueio: todayStr,
          motivo: motivoChamado.trim(),
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setChamadoPendente(json.data);
        setShowChamadoModal(false);
        setMotivoChamado('');
        setChamadoSuccessMsg('📩 Chamado aberto com sucesso! A Coordenação / Admin foi notificada para liberação.');
        setTimeout(() => setChamadoSuccessMsg(null), 6000);
      }
    } catch (err) {
      console.warn('Erro ao abrir chamado:', err);
    } finally {
      setIsSubmittingChamado(false);
    }
  };

  return (
    <div className="bg-white border-l-4 border-l-amber-500 border border-slate-200/90 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl shadow-inner border border-amber-100">
            <AlertOctagon className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">2. Central de Intercorrências & Alertas</h2>
            <p className="text-xs text-slate-500 font-medium">Notificação imediata para atendimento prioritário da gestão</p>
          </div>
        </div>
        <span className="text-xs bg-amber-50 text-amber-800 font-extrabold px-3 py-1 rounded-full border border-amber-200/80 flex items-center gap-1 shadow-sm">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
          Semáforo Alerta
        </span>
      </div>

      {/* SINALIZAÇÃO DESTACADA DE ENVIO */}
      {feedback && (
        <div
          className={`mb-5 p-4 rounded-2xl border text-xs flex items-center justify-between gap-3 shadow-md animate-bounce-short transition-all ${
            feedback.success
              ? feedback.offline
                ? 'bg-amber-500 text-white border-amber-600 shadow-amber-500/20'
                : 'bg-emerald-600 text-white border-emerald-700 shadow-emerald-600/25'
              : 'bg-red-600 text-white border-red-700 shadow-red-600/25'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
              {feedback.offline ? (
                <WifiOff className="w-6 h-6 text-white" />
              ) : feedback.success ? (
                <CheckCircle2 className="w-6 h-6 text-white" />
              ) : (
                <XCircle className="w-6 h-6 text-white" />
              )}
            </div>
            <div>
              <p className="font-black text-sm tracking-tight">{feedback.msg}</p>
              <p className="text-xs font-semibold opacity-95 mt-0.5">
                {feedback.success ? 'Registro salvo e bloqueado para envio duplo hoje.' : 'Tente novamente.'}
              </p>
            </div>
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2.5 py-1 rounded-full shrink-0">
            {feedback.success ? 'Confirmado' : 'Atenção'}
          </span>
        </div>
      )}

      {chamadoSuccessMsg && (
        <div className="mb-5 p-4 bg-blue-600 text-white rounded-2xl shadow-md flex items-center gap-3 text-xs font-bold animate-pulse">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{chamadoSuccessMsg}</span>
        </div>
      )}

      {/* BLOQUEIO DIÁRIO ATIVO: AGENTE JÁ ENVIOU HOJE */}
      {isBlockedToday ? (
        <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-6 text-center space-y-4">
          <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mx-auto shadow-inner border border-amber-200">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900">
              Intercorrência Já Registrada Hoje nesta Escola
            </h3>
            <p className="text-xs text-slate-600 max-w-md mx-auto mt-1 leading-relaxed">
              O relatório para <strong>{escolaNome}</strong> já foi gravado no dia de hoje ({new Date().toLocaleDateString('pt-BR')}). Novos envios regulares ficam disponíveis para visitas em datas futuras.
            </p>
          </div>

          {/* Estado do Chamado de Reabertura */}
          {chamadoPendente && chamadoPendente.status === 'pendente' ? (
            <div className="bg-blue-50 border border-blue-200 text-blue-900 p-4 rounded-xl text-xs text-left flex items-start gap-3 max-w-lg mx-auto shadow-inner">
              <Clock className="w-5 h-5 text-blue-600 shrink-0 mt-0.5 animate-spin" />
              <div>
                <p className="font-extrabold text-sm">Chamado de Reabertura em Análise pelo Admin</p>
                <p className="mt-1 text-blue-800">
                  Motivo: <em>"{chamadoPendente.motivo}"</em>
                </p>
                <p className="text-[11px] text-blue-600 mt-1 font-bold">
                  ⚡ O painel está monitorando em tempo real. Assim que o ADMIN autorizar, o formulário será reativado automaticamente!
                </p>
              </div>
            </div>
          ) : (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowChamadoModal(true)}
                className="bg-white hover:bg-slate-100 text-red-600 border border-red-300 font-extrabold py-3 px-5 text-xs rounded-xl shadow-xs inline-flex items-center gap-2 transition-all active:scale-95"
              >
                <HelpCircle className="w-4 h-4 text-red-600" />
                <span>Houve erro no envio? Solicitar Reativação ao ADMIN</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        /* FORMULÁRIO DE INTERCORRÊNCIA ATIVO */
        <form onSubmit={requestSubmit} className="space-y-5">
          {/* Categoria Oficial */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Categoria do Problema:
            </label>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value as CategoriaIntercorrencia)}
              className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-xl p-3 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-semibold shadow-inner"
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
              className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-xl p-3 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-medium shadow-inner"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-700 hover:to-red-700 text-white py-4 px-5 text-base font-extrabold flex items-center justify-center gap-2.5 rounded-xl shadow-lg shadow-amber-600/20 active:scale-[0.99] transition-all"
          >
            <Send className="w-5 h-5 text-white" />
            <span>{isSubmitting ? 'Enviando Alerta...' : 'Enviar Intercorrência à Gestão'}</span>
          </button>
        </form>
      )}

      {/* Modal de Confirmação de Envio */}
      <ConfirmModal
        isOpen={showConfirmModal}
        title="Confirmar Envio da Intercorrência"
        message={`Deseja registrar o alerta na categoria "${categoria}" com nível de urgência "${urgencia.toUpperCase()}"? Após o envio, os dados desta unidade ficarão gravados para hoje.`}
        confirmText="Confirmar e Bloquear"
        variant={urgencia === 'alta' ? 'danger' : 'warning'}
        onConfirm={executeSubmit}
        onCancel={() => setShowConfirmModal(false)}
      />

      {/* MODAL DE SOLICITAÇÃO DE REABERTURA AO ADMIN */}
      {showChamadoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 shadow-2xl space-y-5 animate-scale-up">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-50 text-red-600 rounded-2xl">
                <RotateCcw className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">Solicitar Reativação de Formulário</h3>
                <p className="text-xs text-slate-500 font-medium">Chamado direto à Coordenação Geral / ADMIN</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Explique o motivo da reabertura para a unidade <strong>{escolaNome}</strong> (ex: envio de categoria incorreta, retificação de fatos ou novo incidente urgente).
            </p>

            <form onSubmit={handleOpenChamado} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Motivo da Solicitação:
                </label>
                <textarea
                  required
                  rows={3}
                  value={motivoChamado}
                  onChange={(e) => setMotivoChamado(e.target.value)}
                  placeholder="Ex: Preenchi o nível de urgência errado e preciso reajustar para Alta Urgência..."
                  className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-xl p-3 font-semibold focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowChamadoModal(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingChamado}
                  className="btn-primary px-5 py-2.5 text-xs font-extrabold flex items-center gap-2 shadow-md"
                >
                  <Send className="w-4 h-4 text-white" />
                  <span>{isSubmittingChamado ? 'Enviando Chamado...' : 'Abrir Chamado ao ADMIN'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
