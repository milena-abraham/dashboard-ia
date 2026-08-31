'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, Sparkles } from 'lucide-react';

const MESSAGES = [
  'Leyendo archivo optimizado (C Engine)...',
  'Limpieza veloz y pre-procesamiento...',
  'Generando profiling y gráficos...',
  'Ejecutando Modelos ML Paralelizados...',
  'Finalizando predicciones en milisegundos...',
];

export default function LoadingAnalysis({ fileSize = 1000000, isUploading = false, uploadProgress = 0, currentFile = 1, totalFiles = 1 }: { fileSize?: number, isUploading?: boolean, uploadProgress?: number, currentFile?: number, totalFiles?: number }) {
  const [msgIndex, setMsgIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);

  // Estimación Data-Driven (Basada en benchmarks del backend V2):
  // Test real: 20.3MB (85k filas) tardó 3.94s en procesarse (aprox 0.2s por MB).
  // Fórmula: 1s base (latencia red/Vercel) + 0.2s por MB. Tope máximo de 20s.
  const fileSizeInMB = fileSize / (1024 * 1024);
  const estimatedTotalSeconds = Math.min(20, Math.max(1.5, 1 + (fileSizeInMB * 0.2)));

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

      <h3 className="text-xl font-bold text-gray-900 mb-2">Procesando {totalFiles > 1 ? `archivo ${currentFile} de ${totalFiles}` : "tus datos"}</h3>
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
        <span>Est. ~{Math.ceil(timeLeft)}s restantes</span>
      </div>
    </div>
  );
}
