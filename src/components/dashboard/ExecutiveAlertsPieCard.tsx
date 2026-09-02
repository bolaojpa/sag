'use client';

import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

export const ExecutiveAlertsPieCard: React.FC = () => {
  const [counts, setCounts] = useState({ seguranca: 0, infra: 0, recursos: 0, total: 0 });

  useEffect(() => {
    async function loadAlerts() {
      try {
        const { createClient } = await import('@/lib/supabase/client');
        const supabase = createClient();
        const { data } = await supabase
          .from('intercorrencias')
          .select('tipo, status')
          .neq('status', 'resolvido');

        if (data) {
          const seg = data.filter((d: any) => d.tipo === 'seguranca' || d.tipo === 'conflito').length;
          const inf = data.filter((d: any) => d.tipo === 'infraestrutura' || d.tipo === 'manutencao').length;
          const rec = data.filter((d: any) => d.tipo === 'recursos' || d.tipo === 'alimentacao' || d.tipo === 'pedagogico').length;
          setCounts({ seguranca: seg, infra: inf, recursos: rec, total: data.length });
        }
      } catch (e) {}
    }
    loadAlerts();
  }, []);

  const data = counts.total > 0 ? [
    { name: 'Segurança', value: counts.seguranca, color: '#ef4444' },
    { name: 'Infraestrutura', value: counts.infra, color: '#2563eb' },
    { name: 'Recursos', value: counts.recursos, color: '#f97316' },
  ].filter(d => d.value > 0) : [
    { name: 'Sem alertas', value: 1, color: '#e2e8f0' }
  ];

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-300 space-y-3">
      <div>
        <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">Alertas Críticos</p>
        <div className="flex items-baseline gap-2 mt-1">
          <h3 className="text-3xl font-black text-red-600 tracking-tight">{counts.total}</h3>
          <span className="text-xs font-bold text-slate-400">Em aberto</span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 pt-1">
        {/* Donut Chart */}
        <div className="w-24 h-24 relative shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={24}
                outerRadius={40}
                paddingAngle={counts.total > 0 ? 3 : 0}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend List */}
        <div className="space-y-1.5 text-xs font-extrabold text-slate-700">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
            <span>Segurança: <strong className="text-slate-900">{counts.seguranca}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
            <span>Infraestrutura: <strong className="text-slate-900">{counts.infra}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
            <span>Recursos: <strong className="text-slate-900">{counts.recursos}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};
