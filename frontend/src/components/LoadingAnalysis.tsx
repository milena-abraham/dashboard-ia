'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, Sparkles } from 'lucide-react';

const MESSAGES = [
  'Leyendo y estructurando el archivo...',
  'Ejecutando pipeline de auto-limpieza...',
  'Calculando profiling estadístico...',
  'Entrenando modelos de Machine Learning...',
  'Detectando patrones y anomalías...',
  'Sintetizando informe ejecutivo con IA...',
  'Preparando visualizaciones...',
];

export default function LoadingAnalysis() {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % MESSAGES.length);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-12 bg-white rounded-none border border-[#111] border-2 shadow-[4px_4px_0px_#111] max-w-lg mx-auto text-center my-8">
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-none border-4 border-mio-violet/20 border-t-mio-violet animate-spin flex items-center justify-center" />
        <div className="absolute inset-0 flex items-center justify-center text-mio-violet">
          <Sparkles className="w-7 h-7 animate-pulse" />
        </div>
      </div>

      <h3 className="text-xl font-bold text-gray-900 mb-2">Procesando tus datos</h3>
      <p className="text-sm text-mio-violet font-medium h-6 transition-all duration-300">
        {MESSAGES[msgIndex]}
      </p>

      <div className="w-full bg-gray-100 h-2 rounded-none mt-6 overflow-hidden">
        <div className="bg-gradient-to-r from-mio-lime to-[#c8ff6a] h-full w-2/3 animate-pulse rounded-none" />
      </div>
    </div>
  );
}
