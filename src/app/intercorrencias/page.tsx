'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { IntercorrenciaList } from '@/components/intercorrencias/IntercorrenciaList';
import { IntercorrenciaForm } from '@/components/intercorrencias/IntercorrenciaForm';
import { Intercorrencia, StatusIntercorrenciaType, ChamadoReabertura } from '@/types/database';
import { 
  AlertOctagon, 
  PlusCircle, 
  ListFilter, 
  Filter, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Building2, 
  User, 
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function IntercorrenciasPage() {
  const { user, profile, cargo, loading } = useAuth();
  const [showForm, setShowForm] = useState<boolean>(false);
  const [intercorrencias, setIntercorrencias] = useState<Intercorrencia[]>([]);
  const [chamados, setChamados] = useState<ChamadoReabertura[]>([]);
  const [urgenciaFilter, setUrgenciaFilter] = useState<string>('todos');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [activeTab, setActiveTab] = useState<'alertas' | 'chamados'>('alertas');
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const isAdmin = ['coordenacao_geral', 'coordenador_dados', 'coordenacao_area', 'gerente_polo'].includes(cargo);

  useEffect(() => {
    if (!loading && (!user || !profile)) {
      window.location.href = '/login';
    }
  }, [loading, user, profile]);

  const fetchIntercorrencias = async () => {
    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const { data, error } = await supabase
        .from('intercorrencias')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar intercorrências:', error.message);
      }

      if (data) {
        setIntercorrencias(data);
      }
    } catch (err) {
      console.warn('Erro ao conectar ao Supabase:', err);
    }
  };

  const fetchChamados = async () => {
    try {
      const res = await fetch('/api/chamados');
      if (res.ok) {
        const json = await res.json();
        setChamados(json.data || []);
      }
    } catch (err) {
      console.warn('Erro ao carregar chamados:', err);
    }
  };

  useEffect(() => {
    if (!loading) {
      fetchIntercorrencias();
      fetchChamados();
      // Polling em real-time para novos alertas e chamados
      const interval = setInterval(() => {
        fetchIntercorrencias();
        fetchChamados();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [loading]);

  const handleStatusChange = async (id: string, newStatus: StatusIntercorrenciaType, acaoMitigacao?: string) => {
    setIntercorrencias((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus, acao_mitigacao: acaoMitigacao || item.acao_mitigacao } : item))
    );
    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const updateData: any = { status: newStatus };
      if (acaoMitigacao !== undefined) {
        updateData.acao_mitigacao = acaoMitigacao;
      }
      await supabase.from('intercorrencias').update(updateData).eq('id', id);
    } catch (err) {
      console.error('Erro ao atualizar status no Supabase:', err);
    }
  };

  // ADMIN INTERVÉM EM TEMPO REAL: Aprova ou Rejeita Chamado de Reativação
  const handleResolveChamado = async (chamadoId: string, novoStatus: 'aprovado' | 'rejeitado') => {
    try {
      const res = await fetch('/api/chamados', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: chamadoId,
          status: novoStatus,
          resposta_admin: novoStatus === 'aprovado' ? 'Reativação concedida pela Gestão.' : 'Solicitação indeferida.',
        }),
      });

      if (res.ok) {
        setChamados((prev) =>
          prev.map((c) => (c.id === chamadoId ? { ...c, status: novoStatus } : c))
        );
        setActionFeedback(
          novoStatus === 'aprovado'
            ? '✅ Formulário do Agente reativado com sucesso em Tempo Real!'
            : '❌ Chamado de reativação recusado.'
        );
        setTimeout(() => setActionFeedback(null), 5000);
      }
    } catch (err) {
      console.warn('Erro ao resolver chamado:', err);
    }
  };

  const filteredItems = intercorrencias.filter((item) => {
    if (urgenciaFilter !== 'todos' && item.urgencia !== urgenciaFilter) return false;
    if (statusFilter !== 'todos' && item.status !== statusFilter) return false;
    return true;
  });

  const chamadosPendentesCount = chamados.filter((c) => c.status === 'pendente').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <AppShell
      title="Central de Alertas & Intercorrências"
      onNewActionClick={() => setShowForm(true)}
    >
      <div className="space-y-6">
        {/* Banner CRM de Alertas & Notificação de Chamados */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                <AlertOctagon className="w-6 h-6 text-amber-600" />
              </div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                Gestão de Incidentes & Chamados
              </h2>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Classificação por semáforo: 🟢 Baixa | 🟡 Média | 🔴 Alta • Acompanhamento em Tempo Real.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Abas Alternáveis para ADMIN: Alertas vs Chamados de Reativação */}
            {isAdmin && (
              <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 gap-1 text-xs font-bold">
                <button
                  onClick={() => setActiveTab('alertas')}
                  className={`px-4 py-2 rounded-xl transition-all ${
                    activeTab === 'alertas'
                      ? 'bg-red-600 text-white shadow-md'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Alertas ({filteredItems.length})
                </button>
                <button
                  onClick={() => setActiveTab('chamados')}
                  className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                    activeTab === 'chamados'
                      ? 'bg-red-600 text-white shadow-md'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Chamados de Reativação</span>
                  {chamadosPendentesCount > 0 && (
                    <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.2 rounded-full animate-pulse">
                      {chamadosPendentesCount}
                    </span>
                  )}
                </button>
              </div>
            )}

            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-extrabold py-3 px-5 text-xs rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              {showForm ? (
                <>
                  <ListFilter className="w-4 h-4" />
                  <span>Ver Lista</span>
                </>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4" />
                  <span>+ Novo Alerta</span>
                </>
              )}
            </button>
          </div>
        </div>

        {actionFeedback && (
          <div className="bg-emerald-600 text-white p-4 rounded-2xl shadow-md flex items-center gap-2 text-xs font-bold animate-pulse">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{actionFeedback}</span>
          </div>
        )}

        {/* EXIBIÇÃO: FORMULÁRIO vs ABAS DE GESTÃO */}
        {showForm ? (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm max-w-3xl mx-auto">
            <IntercorrenciaForm
              escolaId="e1"
              escolaNome="Unidade Escolar"
              agenteId={user?.id || 'agente_demo'}
              agenteNome={profile?.nome || user?.email || 'Agente Educacional'}
              onSuccess={() => {
                setShowForm(false);
                fetchIntercorrencias();
              }}
            />
          </div>
        ) : activeTab === 'chamados' && isAdmin ? (
          /* ABA DE CHAMADOS DE REABERTURA (EXCLUSIVO PARA ADMIN) */
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl">
                  <RotateCcw className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Chamados de Reativação de Formulário (Intervenção do ADMIN em Tempo Real)
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Agentes que solicitaram destravamento após envio incorreto ou ocorrência superveniente.
                  </p>
                </div>
              </div>
              <span className="text-xs bg-blue-50 text-blue-800 font-extrabold px-3 py-1 rounded-full border border-blue-200">
                {chamados.length} chamados registrados
              </span>
            </div>

            {chamados.length === 0 ? (
              <div className="p-12 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-slate-500 text-xs font-bold">
                Nenhum chamado de reativação pendente no momento.
              </div>
            ) : (
              <div className="space-y-4">
                {chamados.map((c) => (
                  <div
                    key={c.id}
                    className="p-5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                          <Building2 className="w-4 h-4 text-red-600 shrink-0" />
                          {c.escola_nome || 'Escola'}
                        </span>
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <User className="w-3.5 h-3.5" />
                          {c.agente_nome || 'Agente'}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          • {new Date(c.created_at).toLocaleDateString('pt-BR')} às {new Date(c.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 font-medium bg-white p-3 rounded-xl border border-slate-200 shadow-inner">
                        <strong>Motivo alegado:</strong> "{c.motivo}"
                      </p>
                    </div>

                    {/* Ações do ADMIN */}
                    <div className="flex items-center gap-2 shrink-0">
                      {c.status === 'pendente' ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleResolveChamado(c.id, 'aprovado')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Aprovar & Reativar</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleResolveChamado(c.id, 'rejeitado')}
                            className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 active:scale-95 transition-all"
                          >
                            <XCircle className="w-4 h-4" />
                            <span>Recusar</span>
                          </button>
                        </>
                      ) : (
                        <span
                          className={`text-xs font-extrabold px-3 py-1 rounded-full border ${
                            c.status === 'aprovado'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                              : 'bg-rose-50 text-rose-700 border-rose-300'
                          }`}
                        >
                          {c.status === 'aprovado' ? '✅ Reativação Concedida' : '❌ Indeferido'}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* ABA PADRÃO DE ALERTAS & INTERCORRÊNCIAS */
          <div className="space-y-4">
            {/* Barra de Filtros CRM */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-700 font-bold">
                <Filter className="w-4 h-4 text-red-600" />
                <span>Filtrar Alertas por Urgência & Status:</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={urgenciaFilter}
                  onChange={(e) => setUrgenciaFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl px-3 py-2 focus:ring-2 focus:ring-red-500 font-bold shadow-inner"
                >
                  <option value="todos">Todas Urgências</option>
                  <option value="alta">🔴 Alta Urgência</option>
                  <option value="media">🟡 Média Urgência</option>
                  <option value="baixa">🟢 Baixa Urgência</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl px-3 py-2 focus:ring-2 focus:ring-red-500 font-bold shadow-inner"
                >
                  <option value="todos">Todos Status</option>
                  <option value="aberto">Em Aberto</option>
                  <option value="em_analise">Em Análise</option>
                  <option value="resolvido">Resolvido</option>
                </select>
              </div>
            </div>

            <IntercorrenciaList
              items={filteredItems}
              userCargo={cargo}
              onStatusChange={handleStatusChange}
            />
          </div>
        )}
      </div>
    </AppShell>
  );
}
