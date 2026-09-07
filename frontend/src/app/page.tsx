'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import Navbar from '@/components/Navbar';
import {
  Sparkles,
  BarChart3,
  TrendingUp,
  BrainCircuit,
  FileSpreadsheet,
  ArrowRight,
  ShieldCheck,
  Zap,
  Github,
  Linkedin,
  Layers,
  Lock,
  CheckCircle2,
  MessageSquare,
  Cpu
} from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';

// Carga dinámica de la consola 3D MIO-Dev
const MioDevCanvas = dynamic(() => import('@/components/canvas/MioDevCanvas'), {
  ssr: false,
  loading: () => (
    <div className="w-[360px] lg:w-[480px] h-[620px] lg:h-[780px] flex flex-col items-center justify-center font-mono text-xs font-bold text-gray-400 bg-white border-4 border-[#111] shadow-[8px_8px_0px_#111]">
      <span className="text-mio-violet font-mono text-xs tracking-widest uppercase mb-1">MIO-OS v2.6 BOOTING</span>
      <span className="text-[10px] text-gray-400">CARGANDO MIO-DEV 3D...</span>
    </div>
  )
});

// Mockup del dashboard de plataforma (cuando se activa el tab 'Vista Plataforma')
function HeroMockup() {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "end start"],
  });

  const rotateX = useTransform(scrollYProgress, [0, 0.5], [15, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [0.9, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.3], [0.6, 1]);

  return (
    <motion.div 
      ref={targetRef}
      style={{ rotateX, scale, opacity, transformPerspective: 1000 }}
      className="mt-12 max-w-5xl mx-auto w-full px-4 relative z-10"
    >
      <div className="bg-white border-4 border-[#111] shadow-[8px_8px_0px_#111] sm:shadow-[16px_16px_0px_#111] overflow-hidden">
        {/* Browser Top Bar */}
        <div className="h-10 sm:h-12 bg-gray-100 border-b-4 border-[#111] flex items-center px-4 gap-2">
          <div className="w-3 h-3 rounded-full bg-[#ff5f56] border-2 border-[#111]"></div>
          <div className="w-3 h-3 rounded-full bg-[#ffbd2e] border-2 border-[#111]"></div>
          <div className="w-3 h-3 rounded-full bg-[#27c93f] border-2 border-[#111]"></div>
          <div className="ml-4 flex-1 max-w-sm sm:max-w-md bg-white border-2 border-[#111] h-6 sm:h-7 px-3 flex items-center text-[10px] sm:text-xs font-mono font-bold text-gray-500 truncate">
            https://mio.app/dashboard/analytics-workspace
          </div>
        </div>

        {/* Workspace Content */}
        <div className="p-4 sm:p-6 bg-[#fafafc] flex flex-col gap-6">
           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b-4 border-[#111] pb-4">
              <div>
                 <span className="text-xs font-bold font-mono text-mio-violet bg-mio-violet/10 px-2 py-1 border border-mio-violet">MODELO ACTIVO: ARIMA + PROPHET</span>
                 <h3 className="text-xl sm:text-2xl font-black text-gray-900 mt-1">Reporte Predictivo de Operaciones</h3>
              </div>
              <div className="flex gap-2">
                 <div className="bg-mio-lime px-3 py-1 font-bold text-xs border-2 border-[#111] shadow-[2px_2px_0px_#111]">AutoML: OK</div>
                 <div className="bg-white px-3 py-1 font-bold text-xs border-2 border-[#111] shadow-[2px_2px_0px_#111]">R²: 0.984</div>
              </div>
           </div>

           <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white border-4 border-[#111] shadow-[4px_4px_0px_#111] p-4">
                 <span className="text-xs font-bold text-gray-500 font-mono">PROYECCIÓN Q4</span>
                 <div className="text-2xl sm:text-3xl font-black text-gray-900 mt-1">+34.8%</div>
              </div>
              <div className="bg-mio-lime border-4 border-[#111] shadow-[4px_4px_0px_#111] p-4">
                 <span className="text-xs font-bold text-gray-900 font-mono">CONFIANZA</span>
                 <div className="text-2xl sm:text-3xl font-black text-gray-900 mt-1">99.2%</div>
              </div>
              <div className="bg-mio-violet text-white border-4 border-[#111] shadow-[4px_4px_0px_#111] p-4">
                 <span className="text-xs font-bold text-mio-lime font-mono">ANOMALÍAS</span>
                 <div className="text-2xl sm:text-3xl font-black mt-1">0 Críticas</div>
              </div>
           </div>

           <div className="h-44 sm:h-56 bg-white border-4 border-[#111] shadow-[4px_4px_0px_#111] flex items-end p-4 gap-2 sm:gap-4 overflow-hidden">
              <div className="flex-1 h-1/4 bg-gray-200 border-2 border-[#111]"></div>
              <div className="flex-1 h-3/4 bg-gray-300 border-2 border-[#111]"></div>
              <div className="flex-1 h-1/2 bg-gray-400 border-2 border-[#111]"></div>
              <div className="flex-1 h-5/6 bg-mio-violet border-2 border-[#111]"></div>
              <div className="flex-1 h-full bg-mio-lime border-2 border-[#111]"></div>
           </div>
        </div>
      </div>
    </motion.div>
  );
}

// BentoGrid con arquitectura técnica completa y contenido enriquecido
function BentoGrid() {
  const [bentoTab, setBentoTab] = useState<'forecast' | 'cluster' | 'anomalies'>('forecast');

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
      {/* Header de Sección */}
      <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border-2 border-[#111] shadow-[3px_3px_0px_#111] mb-5 font-mono text-[11px] font-black uppercase tracking-widest text-mio-violet">
          <Cpu className="w-3.5 h-3.5 text-mio-violet" />
          <span>02 / ARQUITECTURA DE CÓMPUTO</span>
        </div>

        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-950 tracking-tight leading-[1.05] mb-4">
          Poder corporativo.<br />
          <span className="text-mio-violet">Diseño tangible.</span>
        </h2>

        <p className="text-base sm:text-lg text-gray-600 font-medium leading-relaxed">
          Eliminamos la fricción entre la recolección de datos y la toma de decisiones. Cuatro motores autónomos ensamblados en una sola plataforma.
        </p>
      </div>

      {/* Grid de 4 Celdas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
        
        {/* CELDA 1 (2 Columnas): Visualizador Interactivo AutoML */}
        <div className="lg:col-span-2 bg-white border-4 border-[#111] shadow-[6px_6px_0px_#111] sm:shadow-[8px_8px_0px_#111] p-6 sm:p-8 flex flex-col justify-between hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[6px_6px_0px_#111] transition-all">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-[#111] pb-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-mio-violet text-white border-2 border-[#111] shadow-[2px_2px_0px_#111] flex items-center justify-center">
                  <BrainCircuit className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-gray-950 tracking-tight">Motor AutoML Continuo</h3>
                  <span className="font-mono text-[11px] font-bold text-gray-500">SELECCIÓN Y ENTRENAMIENTO DINÁMICO</span>
                </div>
              </div>

              {/* Selector de modo interactivo */}
              <div className="flex bg-[#faf8f5] border-2 border-[#111] p-1 gap-1">
                {(['forecast', 'cluster', 'anomalies'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setBentoTab(m)}
                    className={`px-3 py-1 font-mono text-[10px] font-bold uppercase transition-all ${
                      bentoTab === m
                        ? 'bg-mio-lime text-black border border-[#111] shadow-[1px_1px_0px_#111]'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    {m === 'forecast' ? 'Forecasting' : m === 'cluster' ? 'K-Means' : 'Anomalías'}
                  </button>
                ))}
              </div>
            </div>

            {/* Pantalla interactiva interna */}
            <div className="bg-[#0b0914] border-2 border-[#111] p-4 text-white font-mono rounded-none">
              <div className="flex items-center justify-between text-[11px] text-gray-400 border-b border-gray-800 pb-2 mb-3">
                <span className="text-mio-lime font-bold">ALGORITMO EN EJECUCIÓN:</span>
                <span className="text-white font-bold">
                  {bentoTab === 'forecast' ? 'PROPHET + AUTO-ARIMA (Q4)' : bentoTab === 'cluster' ? 'K-MEANS (k=3 OPTIMIZADO)' : 'ISOLATION FOREST'}
                </span>
              </div>

              {/* Visualización según pestaña */}
              {bentoTab === 'forecast' && (
                <div className="h-36 flex items-end justify-between gap-2 pt-2 px-1">
                  {[28, 42, 36, 58, 52, 70, 65, 88, 80, 94, 98, 100].map((val, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center">
                      <div
                        className="w-full bg-gradient-to-t from-mio-violet to-mio-lime"
                        style={{ height: `${val * 1.2}px` }}
                      />
                    </div>
                  ))}
                </div>
              )}

              {bentoTab === 'cluster' && (
                <div className="h-36 flex items-center justify-around gap-4 px-4">
                  <div className="flex flex-col items-center gap-1.5 flex-1">
                    <span className="text-xs text-mio-lime font-bold">62%</span>
                    <div className="w-full h-24 bg-mio-lime border border-[#111]" />
                    <span className="text-[10px] text-gray-400 font-bold">VIP</span>
                  </div>
                  <div className="flex flex-col items-center gap-1.5 flex-1">
                    <span className="text-xs text-white font-bold">26%</span>
                    <div className="w-full h-16 bg-mio-violet border border-[#111]" />
                    <span className="text-[10px] text-gray-400 font-bold">Medio</span>
                  </div>
                  <div className="flex flex-col items-center gap-1.5 flex-1">
                    <span className="text-xs text-gray-400 font-bold">12%</span>
                    <div className="w-full h-8 bg-gray-700 border border-[#111]" />
                    <span className="text-[10px] text-gray-400 font-bold">Casual</span>
                  </div>
                </div>
              )}

              {bentoTab === 'anomalies' && (
                <div className="h-36 relative border border-dashed border-gray-800 p-2 overflow-hidden flex items-center justify-center">
                  <div className="absolute top-4 left-6 text-red-400 text-xs font-bold animate-pulse">
                    ● OUTLIER DETECTADO (Fila 842: Importe atípico)
                  </div>
                  <div className="w-full h-full flex items-center justify-around opacity-75">
                    {[40, 42, 39, 41, 120, 40, 43, 38, 41].map((val, idx) => (
                      <div
                        key={idx}
                        className={`w-3 ${val > 100 ? 'bg-red-500 animate-bounce' : 'bg-mio-lime'}`}
                        style={{ height: `${Math.min(val, 110)}px` }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <p className="text-sm text-gray-600 font-medium mt-5 leading-relaxed">
            MIO compara iterativamente múltiples familias de modelos estadísticos y escoge el que maximiza la métrica R² para tus datos particulares.
          </p>
        </div>

        {/* CELDA 2 (1 Columna): Ingesta Universal de Ultra-Velocidad */}
        <div className="bg-mio-lime border-4 border-[#111] shadow-[6px_6px_0px_#111] sm:shadow-[8px_8px_0px_#111] p-6 sm:p-8 flex flex-col justify-between hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[6px_6px_0px_#111] transition-all">
          <div>
            <div className="w-12 h-12 bg-white border-2 border-[#111] shadow-[2px_2px_0px_#111] flex items-center justify-center mb-6">
              <Zap className="w-6 h-6 text-gray-950" />
            </div>
            <span className="font-mono text-[10px] font-black text-gray-950 uppercase tracking-widest block mb-1">
              LATENCIA MÍNIMA
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-gray-950 mb-3 leading-tight tracking-tight">
              De archivo bruto a dashboard en 60s
            </h3>
            <p className="text-sm text-gray-900 font-medium leading-relaxed mb-6">
              Carga tus planillas .CSV o .XLSX sin limpiar. El pipeline parsea formatos de fecha rotos, imputa vacíos y genera visualizaciones autónomas.
            </p>
          </div>

          <div className="bg-white border-2 border-[#111] p-3 font-mono text-xs space-y-1.5 shadow-[2px_2px_0px_#111]">
            <div className="flex justify-between text-gray-600 text-[11px]">
              <span>Ingesta & Limpieza:</span>
              <span className="font-bold text-gray-950">0.42s</span>
            </div>
            <div className="flex justify-between text-gray-600 text-[11px]">
              <span>Entrenamiento ML:</span>
              <span className="font-bold text-gray-950">1.84s</span>
            </div>
            <div className="flex justify-between border-t-2 border-gray-200 pt-1 text-gray-950 font-bold text-xs">
              <span>Total Pipeline:</span>
              <span className="text-mio-violet font-black">Listo</span>
            </div>
          </div>
        </div>

        {/* CELDA 3 (1 Columna): Arquitectura Privada Zero-Knowledge */}
        <div className="bg-white border-4 border-[#111] shadow-[6px_6px_0px_#111] sm:shadow-[8px_8px_0px_#111] p-6 sm:p-8 flex flex-col justify-between hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[6px_6px_0px_#111] transition-all">
          <div>
            <div className="w-12 h-12 bg-[#ff5f56] text-white border-2 border-[#111] shadow-[2px_2px_0px_#111] flex items-center justify-center mb-6">
              <Lock className="w-6 h-6" />
            </div>
            <span className="font-mono text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">
              SEGURIDAD CORPORATIVA
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-gray-950 mb-3 leading-tight tracking-tight">
              Tus datos crudos nunca se guardan
            </h3>
            <p className="text-sm text-gray-600 font-medium leading-relaxed">
              El análisis se procesa de forma transitoria en memoria volátil protegida. Las planillas de tus clientes no se usan para entrenar modelos públicos.
            </p>
          </div>

          <div className="border-2 border-[#111] bg-[#faf8f5] p-3 mt-6 flex items-center gap-3 shadow-[2px_2px_0px_#111]">
            <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
            <span className="font-mono text-[11px] font-bold text-gray-800">
              Cifrado en tránsito y en reposo
            </span>
          </div>
        </div>

        {/* CELDA 4 (2 Columnas): Copiloto IA Conversacional */}
        <div className="lg:col-span-2 bg-[#0b0914] text-white border-4 border-[#111] shadow-[6px_6px_0px_#111] sm:shadow-[8px_8px_0px_#111] p-6 sm:p-8 flex flex-col justify-between hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[6px_6px_0px_#111] transition-all">
          <div>
            <div className="flex items-center justify-between border-b border-gray-800 pb-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-mio-violet text-white border border-mio-lime/40 flex items-center justify-center shadow-[2px_2px_0px_rgba(0,0,0,0.5)]">
                  <MessageSquare className="w-5 h-5 text-mio-lime" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">Copiloto Ejecutivo MIO</h3>
                  <span className="font-mono text-[11px] font-bold text-gray-400">CHATEÁ DIRECTAMENTE CON TUS TABLAS</span>
                </div>
              </div>
              <span className="font-mono text-[10px] bg-mio-lime/20 text-mio-lime border border-mio-lime/40 px-2.5 py-1 font-bold uppercase tracking-wider">
                LLM AGENT READY
              </span>
            </div>

            {/* Simulación de chat interactivo */}
            <div className="space-y-3 font-mono text-xs">
              {/* Mensaje Usuario */}
              <div className="bg-gray-900 border border-gray-800 p-3 text-gray-200 flex items-start gap-2.5">
                <span className="text-mio-lime font-bold">TÚ:</span>
                <span>¿Cuáles fueron los 2 productos con menor margen en el último trimestre?</span>
              </div>
              {/* Mensaje IA */}
              <div className="bg-mio-violet/20 border border-mio-violet/50 p-3.5 text-white flex items-start gap-2.5">
                <span className="text-mio-lime font-bold">MIO:</span>
                <div className="space-y-1">
                  <p>
                    Los productos con menor margen fueron <strong className="text-white">SKU-402 (11.2%)</strong> y <strong className="text-white">SKU-119 (14.8%)</strong> debido a un alza imprevista del 18% en costos logísticos.
                  </p>
                  <p className="text-[11px] text-mio-lime">
                    ✦ Generé una simulación de ajuste de precio sugerida (+6%) para recuperar margen sin perder demanda.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-400 font-medium mt-6 leading-relaxed">
            No pierdas horas creando fórmulas complejas: hacé preguntas en lenguaje natural y obtené respuestas de nivel consultor de datos en el acto.
          </p>
        </div>

      </div>
    </section>
  );
}

// Banner de compatibilidad de archivos
function FormatBanner() {
  return (
    <div className="w-full bg-[#111] text-white py-6 border-y-4 border-gray-900 overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <FileSpreadsheet className="w-8 h-8 text-mio-lime" />
          <div>
            <h4 className="text-lg font-black tracking-tight">Carga de Datos Universal</h4>
            <p className="text-xs text-gray-400 font-medium">Compatible con archivos .CSV y .XLSX (Excel)</p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <div className="bg-white/10 px-4 py-2 border-2 border-white/20 font-mono text-sm font-bold flex items-center gap-2">
            <span className="text-green-400">.xlsx</span>
          </div>
          <div className="bg-white/10 px-4 py-2 border-2 border-white/20 font-mono text-sm font-bold flex items-center gap-2">
            <span className="text-mio-lime">.csv</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// CÓMO FUNCIONA MIO (RESTAURADO CON EL STICKY SCROLL ORIGINAL)
// =========================================================================
function HowItWorks() {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end end"],
  });

  // Highlight logic for the 3 steps
  // 0 to 0.33 -> Step 1 active
  // 0.33 to 0.66 -> Step 2 active
  // 0.66 to 1 -> Step 3 active

  // Text Opacity
  const t1O = useTransform(scrollYProgress, [0, 0.3, 0.4], [1, 1, 0.3]);
  const t2O = useTransform(scrollYProgress, [0.2, 0.35, 0.65, 0.75], [0.3, 1, 1, 0.3]);
  const t3O = useTransform(scrollYProgress, [0.55, 0.7, 1], [0.3, 1, 1]);

  // Text Scale
  const t1S = useTransform(scrollYProgress, [0, 0.3, 0.4], [1.05, 1.05, 0.85]);
  const t2S = useTransform(scrollYProgress, [0.2, 0.35, 0.65, 0.75], [0.85, 1.05, 1.05, 0.85]);
  const t3S = useTransform(scrollYProgress, [0.55, 0.7, 1], [0.85, 1.05, 1.05]);

  // Right Visualizer Opacity
  const v1O = useTransform(scrollYProgress, [0, 0.3, 0.4], [1, 1, 0]);
  const v2O = useTransform(scrollYProgress, [0.25, 0.4, 0.6, 0.7], [0, 1, 1, 0]);
  const v3O = useTransform(scrollYProgress, [0.6, 0.75, 1], [0, 1, 1]);

  // Right Visualizer Scale
  const v1S = useTransform(scrollYProgress, [0, 0.3, 0.4], [1, 1, 0.8]);
  const v2S = useTransform(scrollYProgress, [0.25, 0.4, 0.6, 0.7], [0.8, 1, 1, 0.8]);
  const v3S = useTransform(scrollYProgress, [0.6, 0.75, 1], [0.8, 1, 1]);

  return (
    <section ref={targetRef} className="relative bg-[#fafafc] border-y-4 border-[#111]" style={{ height: '200vh' }}>
      <div className="sticky top-0 h-screen flex flex-col justify-center overflow-hidden">
        
        <div className="text-center absolute top-10 md:top-20 left-0 right-0 z-10">
          <h2 className="text-4xl md:text-5xl font-black text-gray-950 tracking-tighter mb-4 px-4">
            Cómo Funciona MIO
          </h2>
        </div>

        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center mt-20 md:mt-24">
          
          {/* Left Text (All 3 stacked, highlighting one by one) */}
          <div className="relative flex flex-col justify-center gap-6 md:gap-10">
            
            <motion.div style={{ opacity: t1O, scale: t1S, transformOrigin: 'left center' }} className="flex gap-4 md:gap-6 items-start">
              <div className="shrink-0 w-12 h-12 md:w-16 md:h-16 bg-blue-100 border-4 border-[#111] shadow-[4px_4px_0px_#111] flex items-center justify-center">
                <FileSpreadsheet className="w-6 h-6 md:w-8 md:h-8 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl md:text-4xl font-black text-gray-950 tracking-tight mb-1 md:mb-2">1. Subí tu CSV</h2>
                <p className="text-base md:text-lg text-gray-600 font-medium">Soltá tu archivo crudo. MIO limpia nulos y duplicados automáticamente.</p>
              </div>
            </motion.div>
            
            <motion.div style={{ opacity: t2O, scale: t2S, transformOrigin: 'left center' }} className="flex gap-4 md:gap-6 items-start">
              <div className="shrink-0 w-12 h-12 md:w-16 md:h-16 bg-mio-lime border-4 border-[#111] shadow-[4px_4px_0px_#111] flex items-center justify-center">
                <BrainCircuit className="w-6 h-6 md:w-8 md:h-8 text-gray-900" />
              </div>
              <div>
                <h2 className="text-2xl md:text-4xl font-black text-gray-950 tracking-tight mb-1 md:mb-2">2. Magia Neuronal</h2>
                <p className="text-base md:text-lg text-gray-600 font-medium">Nuestra IA escanea anomalías y proyecta el futuro sin que toques nada.</p>
              </div>
            </motion.div>

            <motion.div style={{ opacity: t3O, scale: t3S, transformOrigin: 'left center' }} className="flex gap-4 md:gap-6 items-start">
              <div className="shrink-0 w-12 h-12 md:w-16 md:h-16 bg-mio-violet border-4 border-[#111] shadow-[4px_4px_0px_#111] flex items-center justify-center">
                <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl md:text-4xl font-black text-gray-950 tracking-tight mb-1 md:mb-2">3. Decisión Rápida</h2>
                <p className="text-base md:text-lg text-gray-600 font-medium">Obtené un reporte narrado y gráficas listas para exportar a PDF.</p>
              </div>
            </motion.div>
            
          </div>

          {/* Right Visualizer */}
          <div className="relative h-64 md:h-[28rem] w-full flex items-center justify-center">
             <div className="w-full h-full max-w-sm md:max-w-md bg-white border-4 border-[#111] shadow-[8px_8px_0px_#111] md:shadow-[16px_16px_0px_#111] overflow-hidden relative flex items-center justify-center pointer-events-none">
                
                <motion.div style={{ opacity: v1O, scale: v1S }} className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-blue-50/20">
                   <div className="w-3/4 h-8 md:h-10 bg-white border-2 border-[#111] animate-pulse"></div>
                   <div className="w-2/3 h-8 md:h-10 bg-white border-2 border-[#111] animate-pulse" style={{ animationDelay: '200ms' }}></div>
                   <div className="w-3/4 h-8 md:h-10 bg-white border-2 border-[#111] animate-pulse" style={{ animationDelay: '400ms' }}></div>
                </motion.div>

                <motion.div style={{ opacity: v2O, scale: v2S }} className="absolute inset-0 flex items-center justify-center bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-mio-lime/20">
                   <div className="relative w-32 h-32 md:w-48 md:h-48 bg-white border-4 border-[#111] rounded-full flex items-center justify-center shadow-[4px_4px_0px_#111]">
                     <BrainCircuit className="w-16 h-16 md:w-24 md:h-24 text-gray-900 animate-pulse" />
                   </div>
                </motion.div>

                <motion.div style={{ opacity: v3O, scale: v3S }} className="absolute inset-0 flex flex-col justify-end gap-2 p-6 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-purple-50/50">
                   <div className="w-full h-1/3 bg-mio-violet border-2 border-[#111] shadow-[4px_4px_0px_#111]"></div>
                   <div className="w-full h-1/2 bg-mio-lime border-2 border-[#111] shadow-[4px_4px_0px_#111]"></div>
                </motion.div>

             </div>
          </div>

        </div>

      </div>
    </section>
  );
}

// Sección Quiénes Somos (Original MIO)
function AboutUs() {
  return (
    <section className="py-20 lg:py-32 bg-white border-t-4 border-[#111]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-gray-950 tracking-tighter mb-4">
            Quiénes Somos
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto font-medium">
            Estudiantes con la visión de democratizar la analítica de datos avanzada para emprendedores y PyMEs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Tadeo */}
          <div className="bg-[#fafafc] border-4 border-[#111] shadow-[8px_8px_0px_#111] p-8 flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-mio-violet rounded-full border-4 border-[#111] mb-6 flex items-center justify-center text-white text-3xl font-black">
              T
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-1">Tadeo Muñoz Garcés</h3>
            <p className="text-gray-500 font-bold text-sm mb-4">Co-Founder & Developer</p>
            <p className="text-gray-600 text-sm font-medium mb-6">
              Estudiante de Ciencia de Datos. Apasionado por analizar, visualizar y dar vida a los datos mediante arquitecturas de software sólidas e inteligencia artificial.
            </p>
            <div className="flex gap-4 mt-auto">
              <a href="https://github.com" target="_blank" rel="noreferrer" className="w-10 h-10 bg-white border-2 border-[#111] shadow-[2px_2px_0px_#111] flex items-center justify-center hover:translate-y-1 hover:shadow-none transition-all">
                <Github className="w-5 h-5 text-gray-900" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="w-10 h-10 bg-white border-2 border-[#111] shadow-[2px_2px_0px_#111] flex items-center justify-center hover:translate-y-1 hover:shadow-none transition-all">
                <Linkedin className="w-5 h-5 text-blue-600" />
              </a>
            </div>
          </div>

          {/* Milena */}
          <div className="bg-[#fafafc] border-4 border-[#111] shadow-[8px_8px_0px_#111] p-8 flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-mio-lime rounded-full border-4 border-[#111] mb-6 flex items-center justify-center text-black text-3xl font-black">
              M
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-1">Milena Abraham</h3>
            <p className="text-gray-500 font-bold text-sm mb-4">Co-Founder & Developer</p>
            <p className="text-gray-600 text-sm font-medium mb-6">
              Estudiante de Ciencia de Datos. Apasionada por analizar, visualizar y construir modelos predictivos para encontrar valor estratégico en el caos de la información.
            </p>
            <div className="flex gap-4 mt-auto">
              <a href="https://github.com" target="_blank" rel="noreferrer" className="w-10 h-10 bg-white border-2 border-[#111] shadow-[2px_2px_0px_#111] flex items-center justify-center hover:translate-y-1 hover:shadow-none transition-all">
                <Github className="w-5 h-5 text-gray-900" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="w-10 h-10 bg-white border-2 border-[#111] shadow-[2px_2px_0px_#111] flex items-center justify-center hover:translate-y-1 hover:shadow-none transition-all">
                <Linkedin className="w-5 h-5 text-blue-600" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// =========================================================================
// PÁGINA PRINCIPAL
// =========================================================================
export default function LandingPage() {
  const [heroTab, setHeroTab] = useState<'3d' | 'preview'>('3d');

  return (
    <div className="min-h-screen bg-[#fafafc] flex flex-col selection:bg-mio-lime selection:text-black">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-16 sm:pt-24 pb-12 lg:pt-32 lg:pb-16 overflow-hidden" style={{ perspective: '1200px' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-white border-2 sm:border-4 border-[#111] text-mio-violet text-xs sm:text-sm font-bold mb-6 sm:mb-10 shadow-[2px_2px_0px_#111] sm:shadow-[4px_4px_0px_#111]"
          >
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>Inteligencia Artificial para Negocios</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8, type: 'spring', damping: 12, stiffness: 100 }}
            className="text-4xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-gray-950 tracking-tighter max-w-6xl mx-auto leading-[1.1] sm:leading-[1.05] mb-6 sm:mb-8"
          >
            Convertí planillas de datos en <span style={{ backgroundImage: "linear-gradient(to right, #bdf559 45%, #815ae1 55%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>decisiones inteligentes.</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="text-base sm:text-xl text-gray-600 max-w-2xl mx-auto mb-10 sm:mb-12 font-medium leading-relaxed"
          >
            Subí tus datos. MIO limpia la información, corre modelos predictivos y selecciona automáticamente los gráficos más óptimos para vos en 60 segundos.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6"
          >
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-5 bg-mio-lime text-gray-950 font-black text-base sm:text-lg border-4 border-[#111] shadow-[4px_4px_0px_#111] sm:shadow-[6px_6px_0px_#111] hover:shadow-none hover:translate-y-[4px] hover:translate-x-[4px] sm:hover:translate-y-[6px] sm:hover:translate-x-[6px] transition-all flex items-center justify-center gap-3"
            >
              <span>Comenzar Gratis</span>
              <ArrowRight className="w-5 h-5" strokeWidth={3} />
            </Link>
          </motion.div>

        </div>

        {/* Switcher de Vista Hero (3D Hardware vs Plataforma) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 sm:mt-16 flex flex-col items-center relative z-20">
          <div className="inline-flex p-1.5 bg-white border-4 border-[#111] shadow-[6px_6px_0px_#111] gap-2">
            <button
              type="button"
              onClick={() => setHeroTab('3d')}
              className={`px-4 sm:px-6 py-2 sm:py-2.5 font-black text-xs sm:text-sm tracking-wider uppercase transition-all flex items-center gap-2 ${
                heroTab === '3d'
                  ? 'bg-mio-violet text-white border-2 border-[#111] shadow-[3px_3px_0px_#111] -translate-y-0.5'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Sparkles className="w-4 h-4 text-mio-lime" />
              <span>🕹️ MIO-Dev 3D</span>
            </button>
            <button
              type="button"
              onClick={() => setHeroTab('preview')}
              className={`px-4 sm:px-6 py-2 sm:py-2.5 font-black text-xs sm:text-sm tracking-wider uppercase transition-all flex items-center gap-2 ${
                heroTab === 'preview'
                  ? 'bg-mio-lime text-gray-950 border-2 border-[#111] shadow-[3px_3px_0px_#111] -translate-y-0.5'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-gray-900" />
              <span>💻 Vista Plataforma</span>
            </button>
          </div>

          <p className="text-xs font-mono font-bold text-gray-500 mt-3 text-center">
            {heroTab === '3d' 
              ? '✦ Hacé click en los botones físicos para cambiar de modo de análisis en la pantalla.' 
              : '✦ Navegación y vista previa en vivo del dashboard corporativo.'}
          </p>
        </div>

        {/* ============================================================ */}
        {/* VISTA 3D: POCKETFOLIO 3-COLUMNS EDITORIAL */}
        {/* ============================================================ */}
        {heroTab === '3d' ? (
          <div className="mt-6 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] items-center gap-8 lg:gap-12">

              {/* COLUMNA IZQUIERDA: Editorial */}
              <div className="hidden lg:flex flex-col justify-center text-left">
                {/* Eyebrow */}
                <div className="flex items-center gap-2 mb-5">
                  <span className="w-2 h-2 rounded-full bg-mio-lime border border-[#111]" />
                  <span className="text-[11px] font-mono font-black tracking-[0.2em] text-gray-400 uppercase">
                    01 / the pocket edition
                  </span>
                </div>

                {/* Headline */}
                <h2 className="text-4xl xl:text-5xl font-black text-gray-950 tracking-tight leading-[1.05] mb-4">
                  Small screen.<br />
                  <span className="italic" style={{ backgroundImage: "linear-gradient(to right, #815ae1, #bdf559)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                    Big decisions.
                  </span>
                </h2>

                {/* Descripción */}
                <p className="text-sm text-gray-600 font-medium leading-relaxed mb-8 max-w-xs">
                  Analítica predictiva en tu bolsillo. MIO entrena modelos AutoML, detecta anomalías y segmenta tus clientes — sin escribir una línea de código.
                </p>

                {/* Firma */}
                <div className="border-t-2 border-[#111] pt-4">
                  <div className="text-[10px] font-mono font-black text-gray-400 uppercase tracking-widest mb-0.5">
                    + MIO DATA ANALYTICS SYSTEM™
                  </div>
                  <div className="text-[10px] font-mono text-gray-400 font-medium">
                    Ciencia de Datos · Inteligencia Artificial
                  </div>
                </div>

                {/* Nota */}
                <div className="mt-6 relative">
                  <span className="italic font-semibold text-gray-400 text-sm">
                    Hecho para explorar. →
                  </span>
                </div>
              </div>

              {/* COLUMNA CENTRAL: Consola 3D Protagónica */}
              <div className="flex justify-center">
                <MioDevCanvas />
              </div>

              {/* COLUMNA DERECHA: Guía de Controles */}
              <div className="hidden lg:flex flex-col justify-center text-left">
                <div className="border-4 border-[#111] shadow-[6px_6px_0px_#111] p-5 bg-white">
                  <div className="flex items-center justify-between border-b-2 border-[#111] pb-2 mb-4">
                    <span className="text-[11px] font-mono font-black tracking-[0.15em] text-gray-900 uppercase">
                      HOW TO OPERATE
                    </span>
                    <span className="text-[9px] font-mono font-bold text-mio-violet">● V2.6</span>
                  </div>

                  <div className="space-y-4">
                    {/* D-PAD */}
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-[#1a1726] text-white flex items-center justify-center font-black text-base shrink-0 border-2 border-[#111] shadow-[2px_2px_0px_#111]">
                        +
                      </div>
                      <div>
                        <div className="text-xs font-black text-gray-900">D-PAD</div>
                        <div className="text-[11px] text-gray-500 font-medium">Navegar visualizaciones</div>
                      </div>
                    </div>

                    {/* Botón A */}
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-mio-lime border-2 border-[#111] shadow-[2px_2px_0px_#111] flex items-center justify-center font-black text-[11px] shrink-0 text-gray-900">
                        A
                      </div>
                      <div>
                        <div className="text-xs font-black text-gray-900">BOTÓN A</div>
                        <div className="text-[11px] text-gray-500 font-medium">Siguiente gráfico</div>
                      </div>
                    </div>

                    {/* Botón B */}
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-mio-violet border-2 border-[#111] shadow-[2px_2px_0px_#111] flex items-center justify-center font-black text-[11px] shrink-0 text-white">
                        B
                      </div>
                      <div>
                        <div className="text-xs font-black text-gray-900">BOTÓN B</div>
                        <div className="text-[11px] text-gray-500 font-medium">Gráfico anterior</div>
                      </div>
                    </div>

                    {/* START */}
                    <div className="flex items-start gap-3">
                      <div className="px-2 h-6 bg-white border-2 border-[#111] shadow-[1px_1px_0px_#111] flex items-center font-black text-[9px] shrink-0 text-gray-700 tracking-widest mt-0.5">
                        START
                      </div>
                      <div>
                        <div className="text-xs font-black text-gray-900">START</div>
                        <div className="text-[11px] text-gray-500 font-medium">Ejecutar AutoML Predict</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Acceso rápido a plataforma */}
                <button
                  type="button"
                  onClick={() => setHeroTab('preview')}
                  className="mt-5 flex items-center gap-2 text-gray-400 hover:text-mio-violet transition-colors cursor-pointer group text-left"
                >
                  <div className="w-8 h-8 border-2 border-gray-300 group-hover:border-mio-violet flex items-center justify-center transition-colors bg-white">
                    <BarChart3 className="w-4 h-4 text-gray-700 group-hover:text-mio-violet" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-gray-700">Ver dashboard en vivo →</div>
                    <div className="text-[10px] text-gray-400 font-medium">Explorá la plataforma completa</div>
                  </div>
                </button>
              </div>

            </div>
          </div>
        ) : (
          <HeroMockup />
        )}
      </section>

      {/* Banner de formatos */}
      <FormatBanner />

      {/* Cómo Funciona MIO (Sticky Scroll Original) */}
      <HowItWorks />

      {/* Bento Grid Features */}
      <BentoGrid />

      {/* Quiénes Somos */}
      <AboutUs />

      {/* Footer */}
      <footer className="py-12 bg-white border-t-4 border-[#111] text-center text-sm font-bold text-gray-500">
        <p>© 2026 MIO. Neo-Brutal Analytics. Creado con ❤️ en Argentina.</p>
      </footer>
    </div>
  );
}
