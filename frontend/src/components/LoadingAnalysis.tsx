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

export default function LoadingAnalysis({ fileSize = 1000000 }: { fileSize?: number }) {
  const [msgIndex, setMsgIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);

  // Estimación básica: ~12 seg base + 1 seg cada 200KB (max 45 seg)
  const estimatedTotalSeconds = Math.min(45, Math.max(12, 12 + (fileSize / 200000)));

  useEffect(() => {
    const startTime = Date.now();
    const totalMs = estimatedTotalSeconds * 1000;
    
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      
      // Update progress based on actual time passed (resilient to tab switching)
      let currentProgress = (elapsed / totalMs) * 100;
      if (currentProgress > 99) currentProgress = 99;
      setProgress(currentProgress);
      
      // Update time left
      let remaining = (totalMs - elapsed) / 1000;
      if (remaining < 0) remaining = 0;
      setTimeLeft(remaining);
      
      // Update message index
      let mIndex = Math.floor((elapsed / totalMs) * MESSAGES.length);
      if (mIndex >= MESSAGES.length) mIndex = MESSAGES.length - 1;
      setMsgIndex(mIndex);
      
    }, 100);

    return () => clearInterval(interval);
  }, [estimatedTotalSeconds]);

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

      <div className="w-full bg-gray-100 h-3 rounded-none mt-6 overflow-hidden border border-[#111] shadow-[2px_2px_0px_#111]">
        <div 
          className="bg-mio-lime h-full transition-all duration-100 ease-linear rounded-none border-r border-[#111]" 
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="mt-2 flex justify-between w-full text-[10px] text-gray-500 font-bold uppercase tracking-wider">
        <span>{Math.floor(progress)}% Completado</span>
        <span>Est. ~{Math.ceil(timeLeft)}s restantes</span>
      </div>
    </div>
  );
}
