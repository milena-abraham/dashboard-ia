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
    setTimeLeft(Math.ceil(estimatedTotalSeconds));
    
    // Intervalo de mensajes (cada X seg según el tiempo total)
    const msgIntervalTime = (estimatedTotalSeconds * 1000) / MESSAGES.length;
    const msgInterval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1 < MESSAGES.length ? prev + 1 : prev));
    }, msgIntervalTime);

    // Intervalo de progreso (cada 100ms)
    const updateRate = 100;
    const progressIncrement = 100 / ((estimatedTotalSeconds * 1000) / updateRate);
    
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + progressIncrement;
        // Frenar en 99% si todavía no llega la respuesta del backend
        return next > 99 ? 99 : next;
      });
      setTimeLeft((prev) => {
        const next = prev - (updateRate / 1000);
        return next > 0 ? next : 0;
      });
    }, updateRate);

    return () => {
      clearInterval(msgInterval);
      clearInterval(progressInterval);
    };
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
