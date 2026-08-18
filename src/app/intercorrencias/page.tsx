'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Nav } from '@/components/layout/Nav';
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

  const handleStatusChange = async (id: string, newStatus: StatusIntercorrenciaType) => {
    setIntercorrencias((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );
    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      await supabase.from('intercorrencias').update({ status: newStatus }).eq('id', id);
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
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <Nav />

      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Banner CRM Central de Intercorrências */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <AlertOctagon className="w-6 h-6 text-brand-600" />
              <h1 className="text-xl font-extrabold text-gray-900">
                Central de Intercorrências (Semáforo de Alertas)
              </h1>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Classificação por semáforo: 🟢 Baixa | 🟡 Média | 🔴 Alta. Acompanhamento prioritário da gestão.
            </p>
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-primary py-2.5 px-4 text-xs flex items-center gap-2"
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
          <IntercorrenciaForm
            escolaId="e1"
            agenteId={user?.id || 'agente_demo'}
            onSuccess={() => {
              setShowForm(false);
              fetchIntercorrencias();
            }}
          />
        ) : (
          <div className="space-y-4">
            {/* Barra de Filtros CRM */}
            <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-gray-700 font-semibold">
                <Filter className="w-4 h-4 text-brand-600" />
                <span>Filtros do Painel:</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={urgenciaFilter}
                  onChange={(e) => setUrgenciaFilter(e.target.value)}
                  className="bg-gray-50 border border-gray-300 text-gray-800 text-xs rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-brand-500 font-medium"
                >
                  <option value="todos">Todas Urgências</option>
                  <option value="alta">🔴 Alta Urgência</option>
                  <option value="media">🟡 Média Urgência</option>
                  <option value="baixa">🟢 Baixa Urgência</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-gray-50 border border-gray-300 text-gray-800 text-xs rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-brand-500 font-medium"
                >
                  <option value="todos">Todos Status</option>
                  <option value="aberto">Aberto</option>
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
      </main>
    </div>
  );
}
