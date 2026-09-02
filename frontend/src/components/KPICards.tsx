'use client';

import React from 'react';

import { TrendingUp, Database, DollarSign, Layers, Hash } from 'lucide-react';

interface KPICardsProps {
  kpis: Record<string, any>;
}

export default function KPICards({ kpis }: KPICardsProps) {
  const entries = Object.entries(kpis);

  const getIcon = (key: string) => {
    const k = key.toLowerCase();
    if (k.includes('total') || k.includes('suma') || k.includes('ingreso') || k.includes('monto')) {
      return <DollarSign className="w-5 h-5 text-emerald-600" />;
    }
    if (k.includes('promedio') || k.includes('mean')) {
      return <TrendingUp className="w-5 h-5 text-mio-violet" />;
    }
    if (k.includes('registros') || k.includes('filas')) {
      return <Database className="w-5 h-5 text-purple-600" />;
    }
    if (k.includes('columnas')) {
      return <Layers className="w-5 h-5 text-blue-600" />;
    }
    return <Hash className="w-5 h-5 text-amber-600" />;
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {entries.slice(0, 4).map(([key, value], idx) => (
        <div
          key={idx}
          className="bg-white p-5 rounded-none border border-[#111] border-2 shadow-[4px_4px_0px_#111] hover:shadow-[6px_6px_0px_#111] transition-shadow flex items-start justify-between"
        >
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              {key}
            </p>
            <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
              {String(value)}
            </h3>
          </div>
          <div className="p-2.5 bg-white rounded-none border border-[#111] border-2">
            {getIcon(key)}
          </div>
        </div>
      ))}
    </div>
  );
}
