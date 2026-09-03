'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { IntercorrenciaList } from '@/components/intercorrencias/IntercorrenciaList';
import { IntercorrenciaForm } from '@/components/intercorrencias/IntercorrenciaForm';
import { Intercorrencia, StatusIntercorrenciaType } from '@/types/database';
import { AlertOctagon, PlusCircle, ListFilter, Filter } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function IntercorrenciasPage() {
  const { user, profile, cargo, loading } = useAuth();
  const [showForm, setShowForm] = useState<boolean>(false);
  const [intercorrencias, setIntercorrencias] = useState<Intercorrencia[]>([]);
  const [urgenciaFilter, setUrgenciaFilter] = useState<string>('todos');
  const [statusFilter, setStatusFilter] = useState<string>('todos');

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

  useEffect(() => {
    if (!loading) {
      fetchIntercorrencias();
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

  const filteredItems = intercorrencias.filter((item) => {
    if (urgenciaFilter !== 'todos' && item.urgencia !== urgenciaFilter) return false;
    if (statusFilter !== 'todos' && item.status !== statusFilter) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <AppShell
      title="Central de Alertas & Intercorrências"
      onNewActionClick={() => setShowForm(true)}
    >
      <div className="space-y-6">
        {/* Banner CRM Central de Intercorrências */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-red-50 rounded-xl text-red-600">
                <AlertOctagon className="w-6 h-6 text-red-600" />
              </div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                Gestão de Ocorrências & Semáforo de Risco
              </h2>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Classificação por semáforo: 🟢 Baixa | 🟡 Média | 🔴 Alta. Tratativa prioritária pela coordenação.
            </p>
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-extrabold py-3 px-5 text-xs rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            {showForm ? (
              <>
                <ListFilter className="w-4 h-4" />
                <span>Ver Lista de Ocorrências</span>
              </>
            ) : (
              <>
                <PlusCircle className="w-4 h-4" />
                <span>+ Nova Intercorrência</span>
              </>
            )}
          </button>
        </div>

        {/* Exibição Alternada: Formulário vs Lista CRM */}
        {showForm ? (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm">
            <IntercorrenciaForm
              escolaId="e1"
              agenteId={user?.id || 'agente_demo'}
              onSuccess={() => {
                setShowForm(false);
                fetchIntercorrencias();
              }}
            />
          </div>
        ) : (
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
