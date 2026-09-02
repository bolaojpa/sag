'use client';

import React from 'react';
import { TrendingUp } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

export const ExecutiveAcoesChartCard: React.FC = () => {
  const sparklineData = [
    { value: 40 },
    { value: 65 },
    { value: 50 },
    { value: 85 },
    { value: 70 },
    { value: 110 },
    { value: 95 },
    { value: 130 },
  ];

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-300 space-y-4">
      <div>
        <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">Ações Realizadas</p>
        <div className="flex items-baseline gap-2 mt-1">
          <h3 className="text-3xl font-black text-red-600 tracking-tight">1,245</h3>
          <span className="text-xs font-bold text-slate-400">Total este mês</span>
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
        <span>+15% vs. mês anterior</span>
      </div>
    </div>
  );
};
