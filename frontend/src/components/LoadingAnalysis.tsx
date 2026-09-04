'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, Sparkles } from 'lucide-react';

const MESSAGES = [
  'Lectura y parseo optimizado C Engine...',
  'Limpieza inteligente y normalización...',
  'Profiling estadístico y correlaciones...',
  'Seleccionando visualizaciones óptimas...',
  'Ejecutando Modelos ML y Predicción...',
  'Finalizando análisis y empaquetado...',
];

export default function LoadingAnalysis({
  fileSize = 25000000,
  isUploading = false,
  uploadProgress = 0,
  currentFile = 1,
  totalFiles = 1,
}: {
  fileSize?: number;
  isUploading?: boolean;
  uploadProgress?: number;
  currentFile?: number;
  totalFiles?: number;
}) {
  const [msgIndex, setMsgIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);

  // Estimación Data-Driven calibrada con el backend V2 optimizado:
  // Benchmark real en 200MB (2,075,000 filas): ~16-17 segundos.
  // Benchmark en 20MB (~85,000 filas): ~3.5 segundos.
  // Fórmula ajustada: 2.0s base + 0.075s por MB.
  const fileSizeInMB = (fileSize || 25000000) / (1024 * 1024);
  const estimatedTotalSeconds = Math.min(90, Math.max(2.5, 2.0 + fileSizeInMB * 0.075));

  useEffect(() => {
    const startTime = Date.now();
    const totalMs = estimatedTotalSeconds * 1000;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;

      // Avance fluido y realista:
      // - Hasta 85% avanza proporcional al tiempo estimado
      // - Entre 85% y 98% desacelera asintóticamente sin congelarse en 99%
      let currentProgress: number;
      const ratio = elapsed / totalMs;

      if (ratio <= 0.85) {
        currentProgress = ratio * 100;
      } else {
        // Asymptote towards 98%
        const extraTime = (elapsed - totalMs * 0.85) / (totalMs * 0.6);
        currentProgress = 85 + 13 * (1 - Math.exp(-extraTime));
      }

      if (currentProgress > 98.5) currentProgress = 98.5;
      setProgress(currentProgress);

      // Tiempo restante
      const remaining = (totalMs - elapsed) / 1000;
      setTimeLeft(remaining > 0 ? remaining : 0);

      // Índice de mensajes descriptivos
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

      <h3 className="text-xl font-bold text-gray-900 mb-2">
        Procesando {totalFiles > 1 ? `archivo ${currentFile} de ${totalFiles}` : 'tus datos'}
      </h3>
      <p className="text-sm text-mio-violet font-medium h-6 transition-all duration-300">
        {isUploading ? `Subiendo a la nube de manera segura...` : MESSAGES[msgIndex]}
      </p>

      <div className="w-full bg-gray-100 h-3 rounded-none mt-6 overflow-hidden border border-[#111] shadow-[2px_2px_0px_#111]">
        <div
          className="bg-mio-lime h-full transition-all duration-100 ease-linear rounded-none border-r border-[#111]"
          style={{ width: `${isUploading ? uploadProgress : progress}%` }}
        />
      </div>
      <div className="mt-2 flex justify-between w-full text-[10px] text-gray-500 font-bold uppercase tracking-wider">
        <span>{isUploading ? Math.floor(uploadProgress) : Math.floor(progress)}% Completado</span>
        <span>
          {isUploading
            ? 'Subiendo...'
            : timeLeft > 1
            ? `Est. ~${Math.ceil(timeLeft)}s restantes`
            : 'Finalizando análisis...'}
        </span>
      </div>
    </div>
  );
}
