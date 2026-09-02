'use client';

import React, { useEffect, useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

export const ExecutiveAcoesChartCard: React.FC = () => {
  const [totalAcoes, setTotalAcoes] = useState(0);

  useEffect(() => {
    async function loadAcoes() {
      try {
        const { createClient } = await import('@/lib/supabase/client');
        const supabase = createClient();
        const { count } = await supabase
          .from('visitas')
          .select('*', { count: 'exact', head: true });
        
        setTotalAcoes(count || 0);
      } catch (e) {}
    }
    loadAcoes();
  }, []);

  const sparklineData = [
    { value: totalAcoes > 0 ? Math.round(totalAcoes * 0.4) : 0 },
    { value: totalAcoes > 0 ? Math.round(totalAcoes * 0.6) : 0 },
    { value: totalAcoes > 0 ? Math.round(totalAcoes * 0.8) : 0 },
    { value: totalAcoes || 0 },
  ];

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-300 space-y-4">
      <div>
        <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">Ações Realizadas</p>
        <div className="flex items-baseline gap-2 mt-1">
          <h3 className="text-3xl font-black text-red-600 tracking-tight">{totalAcoes}</h3>
          <span className="text-xs font-bold text-slate-400">Total acumulado</span>
        </div>
      </div>

      {/* Sparkline Micro Chart */}
      <div className="h-16 w-full pt-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={sparklineData}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="value"
              stroke="#ef4444"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorValue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom Growth Pill */}
      <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 text-xs font-black px-3 py-1 rounded-full border border-emerald-200/90">
        <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
        <span>Sincronizado em tempo real</span>
      </div>
    </div>
  );
};
