'use client';

import React from 'react';
import { Sparkles, Cpu, CheckCircle2 } from 'lucide-react';

interface InsightPanelProps {
  text: string;
  source?: string;
}

export default function InsightPanel({ text, source }: InsightPanelProps) {
  const isGemini = source === 'gemini';

  return (
    <div className="bg-gradient-to-br from-indigo-50/50 via-purple-50/30 to-white p-6 sm:p-8 rounded-3xl border border-indigo-100 shadow-sm relative overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-200">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Informe Ejecutivo Inteligente</h3>
            <p className="text-xs text-gray-500">Lectura y síntesis automatizada de tus datos</p>
          </div>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
            isGemini
              ? 'bg-purple-100 text-purple-700 border border-purple-200'
              : 'bg-blue-100 text-blue-700 border border-blue-200'
          }`}
        >
          {isGemini ? <Sparkles className="w-3.5 h-3.5" /> : <Cpu className="w-3.5 h-3.5" />}
          {isGemini ? 'Potenciado por Gemini IA' : 'Motor Analítico Heurístico'}
        </span>
      </div>

      <div className="prose prose-indigo max-w-none text-gray-700 text-sm leading-relaxed whitespace-pre-wrap font-sans">
        {text}
      </div>
    </div>
  );
}
