'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

export const ExecutiveAlertsPieCard: React.FC = () => {
  const data = [
    { name: 'Segurança', value: 12, color: '#ef4444' },      // Red
    { name: 'Infraestrutura', value: 8, color: '#2563eb' },  // Blue
    { name: 'Recursos', value: 18, color: '#f97316' },       // Orange
  ];

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-300 space-y-3">
      <div>
        <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">Alertas Críticos</p>
        <div className="flex items-baseline gap-2 mt-1">
          <h3 className="text-3xl font-black text-red-600 tracking-tight">38</h3>
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
                paddingAngle={3}
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
            <span>Segurança: <strong className="text-slate-900">12</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
            <span>Infraestrutura: <strong className="text-slate-900">8</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
            <span>Recursos: <strong className="text-slate-900">18</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};
