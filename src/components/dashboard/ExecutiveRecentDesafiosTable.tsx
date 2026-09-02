'use client';

import React from 'react';

interface DesafioItem {
  id: string;
  desafio: string;
  escola: string;
  severidade: 'Crítica' | 'Alta' | 'Média';
  status: 'Em Análise' | 'Atribuído' | 'Atrasado' | 'Em Progresso' | 'Resolvido';
}

import { Intercorrencia } from '@/types/database';

export const ExecutiveRecentDesafiosTable: React.FC = () => {
  const [items, setItems] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadData() {
      try {
        const { createClient } = await import('@/lib/supabase/client');
        const supabase = createClient();
        const { data } = await supabase
          .from('intercorrencias')
          .select('*, escolas(nome)')
          .order('created_at', { ascending: false })
          .limit(5);

        if (data && data.length > 0) {
          setItems(
            data.map((item: any) => ({
              id: item.id.slice(0, 8),
              desafio: item.descricao || item.tipo,
              escola: item.escolas?.nome || 'Escola da Rede',
              severidade: item.urgencia === 'alta' ? 'Crítica' : item.urgencia === 'media' ? 'Alta' : 'Média',
              status: item.status === 'resolvido' ? 'Resolvido' : item.status === 'em_analise' ? 'Em Análise' : 'Em Progresso',
            }))
          );
        } else {
          setItems([]);
        }
      } catch (e) {
        setItems([]);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const getSeveridadeBadge = (sev: 'Crítica' | 'Alta' | 'Média') => {
    switch (sev) {
      case 'Crítica':
        return (
          <span className="bg-red-500 text-white font-extrabold text-[11px] px-3 py-0.5 rounded-full shadow-xs">
            Crítica
          </span>
        );
      case 'Alta':
        return (
          <span className="bg-slate-900 text-white font-extrabold text-[11px] px-3 py-0.5 rounded-full shadow-xs">
            Alta
          </span>
        );
      case 'Média':
      default:
        return (
          <span className="bg-blue-600 text-white font-extrabold text-[11px] px-3 py-0.5 rounded-full shadow-xs">
            Média
          </span>
        );
    }
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
      <h3 className="text-base font-extrabold text-slate-900">
        Desafios Operacionais Recentes
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="text-slate-400 font-extrabold border-b border-slate-200 pb-2">
              <th className="pb-3 pr-2">ID</th>
              <th className="pb-3 pr-2">Desafio</th>
              <th className="pb-3 pr-2">Escola</th>
              <th className="pb-3 pr-2 text-center">Severidade</th>
              <th className="pb-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
            {items.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400 font-bold">
                  Nenhum registro ou desafio operacional recente cadastrado.
                </td>
              </tr>
            ) : (
              items.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 font-mono text-slate-500 font-bold">{row.id}</td>
                  <td className="py-3.5 font-extrabold text-slate-900 pr-2">{row.desafio}</td>
                  <td className="py-3.5 text-slate-600 font-medium pr-2">{row.escola}</td>
                  <td className="py-3.5 text-center pr-2">
                    {getSeveridadeBadge(row.severidade)}
                  </td>
                  <td className="py-3.5 text-right font-extrabold text-slate-700">{row.status}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
