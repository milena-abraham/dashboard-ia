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
  Cpu,
  Layers,
  CheckCircle2,
  Terminal,
  Clock,
  Lock,
  MessageSquare
} from 'lucide-react';
import { motion } from 'framer-motion';

// Carga dinámica del Canvas 3D para aislar Three.js del SSR
const MioDevCanvas = dynamic(() => import('@/components/canvas/MioDevCanvas'), {
  ssr: false,
  loading: () => (
    <div className="w-[360px] lg:w-[480px] h-[620px] lg:h-[780px] flex flex-col items-center justify-center font-mono text-xs font-bold text-gray-400 bg-white/70 border-4 border-[#111] shadow-[8px_8px_0px_#111]">
      <div className="w-8 h-8 border-4 border-mio-violet border-t-transparent animate-spin mb-4" />
      <span className="text-mio-violet font-mono text-xs tracking-widest uppercase mb-1">MIO-OS v2.6 BOOTING</span>
      <span className="text-[10px] text-gray-400">CARGANDO MODELO 3D...</span>
    </div>
  )
});

// Físicas de resorte de alta gama (Spring Physics con masa, inercia y rebote orgánico)
const springHeavy = { type: 'spring' as const, mass: 1.2, stiffness: 75, damping: 18 };
const springMedium = { type: 'spring' as const, mass: 0.8, stiffness: 110, damping: 15 };
const springSnappy = { type: 'spring' as const, mass: 0.35, stiffness: 280, damping: 16 };
const springGentle = { type: 'spring' as const, mass: 1.0, stiffness: 85, damping: 16 };

// =========================================================================
// 1. TICKER SUPERIOR DE TELEMETRÍA (Estilo Hardware de Estudio)
// =========================================================================
function TopTelemetryBar() {
  return (
    <div className="w-full bg-[#0b0914] text-white border-b-2 border-[#111] py-2 px-4 text-[10px] sm:text-[11px] font-mono tracking-widest flex items-center justify-between overflow-x-auto select-none">
      <div className="flex items-center gap-4 shrink-0">
        <span className="flex items-center gap-1.5 text-mio-lime">
          <span className="w-2 h-2 rounded-full bg-mio-lime animate-pulse inline-block" />
          SYSTEM OPERATIONAL
        </span>
        <span className="text-gray-500 hidden sm:inline">//</span>
        <span className="text-gray-300 hidden sm:inline">MIO DATA ANALYTICS PROTOCOL v2.6</span>
      </div>
      <div className="flex items-center gap-4 shrink-0 text-gray-400">
        <span className="hidden md:inline">LATENCIA: &lt;18MS</span>
        <span className="hidden md:inline">//</span>
        <span>AUTO-ML PIPELINE: ACTIVE</span>
      </div>
    </div>
  );
}

// =========================================================================
// 2. MOCKUP DE PLATAFORMA (Vista Dashboard alternativa)
// =========================================================================
function PlatformPreviewMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springHeavy}
      className="mt-8 max-w-5xl mx-auto w-full px-4"
    >
      <div className="bg-white border-4 border-[#111] shadow-[10px_10px_0px_#111] p-4 sm:p-6">
        {/* Barra de ventana estilo Mac neo-brutalista */}
        <div className="flex items-center justify-between border-b-2 border-[#111] pb-3 mb-5">
          <div className="flex gap-2">
            <div className="w-3.5 h-3.5 rounded-full bg-[#ff5f56] border border-[#111]" />
            <div className="w-3.5 h-3.5 rounded-full bg-[#ffbd2e] border border-[#111]" />
            <div className="w-3.5 h-3.5 rounded-full bg-[#27c93f] border border-[#111]" />
          </div>
          <span className="font-mono text-xs font-bold text-gray-500 tracking-wider uppercase">
            MIO ANALYTICS PLATFORM // LIVE WORKSPACE
          </span>
          <div className="w-12" />
        </div>

        {/* Dashboard Grid interno */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#faf8f5] border-2 border-[#111] p-4">
            <span className="font-mono text-[10px] text-gray-500 uppercase font-bold">Ingresos Proyectados</span>
            <div className="font-display text-2xl sm:text-3xl font-bold text-gray-950 mt-1 mb-2">$142,800 USD</div>
            <div className="text-xs font-mono font-bold text-mio-violet">+28.4% vs Mes Anterior</div>
          </div>
          <div className="bg-[#faf8f5] border-2 border-[#111] p-4">
            <span className="font-mono text-[10px] text-gray-500 uppercase font-bold">Anomalías de Stock</span>
            <div className="font-display text-2xl sm:text-3xl font-bold text-gray-950 mt-1 mb-2">0 Críticas</div>
            <div className="text-xs font-mono font-bold text-mio-lime bg-black px-2 py-0.5 inline-block">100% Normal</div>
          </div>
          <div className="bg-[#faf8f5] border-2 border-[#111] p-4">
            <span className="font-mono text-[10px] text-gray-500 uppercase font-bold">Cluster Predominante</span>
            <div className="font-display text-2xl sm:text-3xl font-bold text-gray-950 mt-1 mb-2">Clientes VIP</div>
            <div className="text-xs font-mono font-bold text-gray-600">62% Retención Activa</div>
          </div>
        </div>

        {/* Mockup de Gráfico */}
        <div className="mt-4 bg-[#0b0914] border-2 border-[#111] p-5 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-mio-lime animate-pulse" />
              <span className="font-mono text-xs font-bold text-mio-lime uppercase tracking-widest">
                AutoML Curve // Predicción ARIMA + Prophet
              </span>
            </div>
            <span className="font-mono text-[10px] text-gray-400">R² SCORE: 0.984</span>
          </div>
          <div className="h-44 w-full flex items-end gap-2 px-2 pb-2">
            {[35, 45, 40, 60, 55, 75, 70, 85, 90, 80, 95, 100].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                <div
                  className="w-full bg-gradient-to-t from-mio-violet to-mio-lime transition-all duration-300"
                  style={{ height: `${h}%` }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// =========================================================================
// 3. BENTO GRID V2 INTERACTIVO (Micro-Interfaces Funcionales sin bugs)
// =========================================================================
function BentoGridV2() {
  const [bentoTab, setBentoTab] = useState<'forecast' | 'cluster' | 'anomalies'>('forecast');

  return (
    <section className="py-28 sm:py-36 lg:py-44 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header de Sección */}
      <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={springGentle}
          className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border-2 border-[#111] shadow-[3px_3px_0px_#111] mb-5 font-mono text-[11px] font-bold uppercase tracking-widest text-mio-violet"
        >
          <Cpu className="w-3.5 h-3.5 text-mio-violet" />
          <span>02 / ARQUITECTURA DE CÓMPUTO</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ ...springHeavy, delay: 0.1 }}
          className="font-display text-4xl sm:text-5xl lg:text-6xl text-gray-950 font-bold tracking-tight leading-[1.05] mb-6"
        >
          Poder corporativo.<br />
          <span className="text-mio-violet">Diseño tangible.</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ ...springHeavy, delay: 0.2 }}
          className="font-sans text-base sm:text-lg text-gray-600 font-normal leading-relaxed"
        >
          Eliminamos la fricción entre la recolección de datos y la toma de decisiones. Cuatro motores autónomos ensamblados en una sola plataforma.
        </motion.p>
      </div>

      {/* Grid de 4 Celdas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
        
        {/* CELDA 1 (2 Columnas): Visualizador Interactivo AutoML */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={springHeavy}
          className="lg:col-span-2 bg-white border-4 border-[#111] shadow-[8px_8px_0px_#111] p-6 sm:p-8 flex flex-col justify-between"
        >
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-[#111] pb-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-mio-violet text-white border-2 border-[#111] shadow-[2px_2px_0px_#111] flex items-center justify-center">
                  <BrainCircuit className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display text-xl sm:text-2xl font-bold text-gray-950">Motor AutoML Continuo</h3>
                  <span className="font-mono text-[11px] text-gray-500">SELECCIÓN Y ENTRENAMIENTO DINÁMICO</span>
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
                <span className="text-white">
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
                    <span className="text-[10px] text-gray-400">VIP</span>
                  </div>
                  <div className="flex flex-col items-center gap-1.5 flex-1">
                    <span className="text-xs text-white font-bold">26%</span>
                    <div className="w-full h-16 bg-mio-violet border border-[#111]" />
                    <span className="text-[10px] text-gray-400">Medio</span>
                  </div>
                  <div className="flex flex-col items-center gap-1.5 flex-1">
                    <span className="text-xs text-gray-400 font-bold">12%</span>
                    <div className="w-full h-8 bg-gray-700 border border-[#111]" />
                    <span className="text-[10px] text-gray-400">Casual</span>
                  </div>
                </div>
              )}

              {bentoTab === 'anomalies' && (
                <div className="h-36 relative border border-dashed border-gray-800 p-2 overflow-hidden flex items-center justify-center">
                  <div className="absolute top-4 left-10 text-red-400 text-xs font-bold animate-pulse">
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

          <p className="font-sans text-sm text-gray-600 mt-5 leading-relaxed">
            MIO compara iterativamente múltiples familias de modelos estadísticos y escoge el que maximiza la métrica R² para tus datos particulares.
          </p>
        </motion.div>

        {/* CELDA 2 (1 Columna): Ingesta Universal de Ultra-Velocidad */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ ...springHeavy, delay: 0.1 }}
          className="bg-[#bdf559] border-4 border-[#111] shadow-[8px_8px_0px_#111] p-6 sm:p-8 flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 bg-white border-2 border-[#111] shadow-[2px_2px_0px_#111] flex items-center justify-center mb-6">
              <Zap className="w-6 h-6 text-gray-950" />
            </div>
            <span className="font-mono text-[10px] font-bold text-gray-950 uppercase tracking-widest block mb-1">
              LATENCIA MÍNIMA
            </span>
            <h3 className="font-display text-2xl sm:text-3xl font-bold text-gray-950 mb-3 leading-tight">
              De archivo bruto a dashboard en 60s
            </h3>
            <p className="font-sans text-sm text-gray-900 font-medium leading-relaxed mb-6">
              Carga tus planillas .CSV o .XLSX sin limpiar. El pipeline parsea formatos de fecha rotos, imputa vacíos y genera visualizaciones autónomas.
            </p>
          </div>

          <div className="bg-white border-2 border-[#111] p-3 font-mono text-xs space-y-1.5">
            <div className="flex justify-between text-gray-600 text-[11px]">
              <span>Ingesta & Limpieza:</span>
              <span className="font-bold text-gray-950">0.42s</span>
            </div>
            <div className="flex justify-between text-gray-600 text-[11px]">
              <span>Entrenamiento ML:</span>
              <span className="font-bold text-gray-950">1.84s</span>
            </div>
            <div className="flex justify-between border-t border-gray-300 pt-1 text-gray-950 font-bold text-xs">
              <span>Total Pipeline:</span>
              <span className="text-mio-violet">Listo</span>
            </div>
          </div>
        </motion.div>

        {/* CELDA 3 (1 Columna): Arquitectura Privada Zero-Knowledge */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ ...springHeavy, delay: 0.15 }}
          className="bg-white border-4 border-[#111] shadow-[8px_8px_0px_#111] p-6 sm:p-8 flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 bg-[#ff5f56] text-white border-2 border-[#111] shadow-[2px_2px_0px_#111] flex items-center justify-center mb-6">
              <Lock className="w-6 h-6" />
            </div>
            <span className="font-mono text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">
              SEGURIDAD CORPORATIVA
            </span>
            <h3 className="font-display text-2xl sm:text-3xl font-bold text-gray-950 mb-3 leading-tight">
              Tus datos crudos nunca se guardan
            </h3>
            <p className="font-sans text-sm text-gray-600 font-normal leading-relaxed">
              El análisis se procesa de forma transitoria en memoria volátil protegida. Las planillas de tus clientes no se usan para entrenar modelos públicos.
            </p>
          </div>

          <div className="border-2 border-[#111] bg-[#faf8f5] p-3 mt-6 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
            <span className="font-mono text-[11px] font-bold text-gray-800">
              Cifrado en tránsito y en reposo
            </span>
          </div>
        </motion.div>

        {/* CELDA 4 (2 Columnas): Copiloto IA Conversacional */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ ...springHeavy, delay: 0.2 }}
          className="lg:col-span-2 bg-[#0b0914] text-white border-4 border-[#111] shadow-[8px_8px_0px_#111] p-6 sm:p-8 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between border-b border-gray-800 pb-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-mio-violet text-white border border-mio-lime/40 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-mio-lime" />
                </div>
                <div>
                  <h3 className="font-display text-xl sm:text-2xl font-bold text-white">Copiloto Ejecutivo MIO</h3>
                  <span className="font-mono text-[11px] text-gray-400">CHATEÁ DIRECTAMENTE CON TUS TABLAS</span>
                </div>
              </div>
              <span className="font-mono text-[10px] bg-mio-lime/20 text-mio-lime border border-mio-lime/40 px-2 py-0.5 font-bold uppercase">
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
                    Los productos con menor margen fueron <strong>SKU-402 (11.2%)</strong> y <strong>SKU-119 (14.8%)</strong> debido a un alza imprevista del 18% en costos logísticos.
                  </p>
                  <p className="text-[11px] text-mio-lime">
                    ✦ Generé una simulación de ajuste de precio sugerida (+6%) para recuperar margen sin perder demanda.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <p className="font-sans text-sm text-gray-400 mt-6 leading-relaxed">
            No pierdas horas creando fórmulas complejas: hacé preguntas en lenguaje natural y obtené respuestas de nivel consultor de datos en el acto.
          </p>
        </motion.div>

      </div>
    </section>
  );
}

// =========================================================================
// 4. PIPELINE PASO A PASO ("DEL ARCHIVO AL RESULTADO")
// =========================================================================
function PipelineWalkthrough() {
  const steps = [
    {
      num: '01',
      title: 'Subí tu archivo bruto',
      desc: 'Soporta archivos .CSV y planillas .XLSX de Excel sin necesidad de estructuración previa.',
      tag: 'INGESTA UNIVERSAL'
    },
    {
      num: '02',
      title: 'Limpieza y Modelado',
      desc: 'El pipeline corre modelos predictivos, segmenta clusters y analiza la correlación de variables.',
      tag: 'CÓMPUTO AUTÓNOMO'
    },
    {
      num: '03',
      title: 'Tomá Decisiones',
      desc: 'Visualizá gráficos automáticos, descargá reportes en PDF/PPTX o consultá al asistente con IA.',
      tag: 'DASHBOARD EJECUTIVO'
    }
  ];

  return (
    <section className="py-24 sm:py-32 bg-white border-y-4 border-[#111]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-mio-violet mb-2 block">
              03 / EL PROCEDIMIENTO
            </span>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-gray-950 tracking-tight">
              Simple por fuera.<br />
              Riguroso por dentro.
            </h2>
          </div>
          <p className="font-sans text-base text-gray-600 max-w-md font-normal">
            Tres pasos claros diseñados para que directores, analistas y fundadores obtengan valor sin intermediarios técnicos.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, idx) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ ...springHeavy, delay: idx * 0.12 }}
              className="border-4 border-[#111] bg-[#faf8f5] shadow-[6px_6px_0px_#111] p-8 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between border-b-2 border-[#111] pb-4 mb-6">
                  <span className="font-display text-4xl font-black text-gray-950">{step.num}</span>
                  <span className="font-mono text-[10px] bg-white border border-[#111] px-2 py-1 font-bold text-gray-700">
                    {step.tag}
                  </span>
                </div>
                <h3 className="font-display text-2xl font-bold text-gray-950 mb-3 tracking-tight">
                  {step.title}
                </h3>
                <p className="font-sans text-sm text-gray-600 font-normal leading-relaxed">
                  {step.desc}
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-gray-300 font-mono text-[11px] text-gray-500 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-mio-lime border border-[#111]" />
                <span>Tiempo estimado: &lt; 20s</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// =========================================================================
// 5. DOSSIER DE FUNDADORES (About Us de Alto Nivel)
// =========================================================================
function FoundersDossier() {
  return (
    <section className="py-28 sm:py-36 lg:py-44 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16 sm:mb-24">
        <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-mio-violet mb-3 block">
          04 / LOS DESARROLLADORES
        </span>
        <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl text-gray-950 font-bold tracking-tight mb-4">
          Quiénes construyen MIO
        </h2>
        <p className="font-sans text-base sm:text-lg text-gray-600 max-w-2xl mx-auto font-normal leading-relaxed">
          Estudiantes de Ciencia de Datos con la obsesión de reemplazar el software empresarial complejo con herramientas ágiles, hermosas y tangibles.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-4xl mx-auto">
        {/* Tadeo */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={springHeavy}
          className="bg-white border-4 border-[#111] shadow-[8px_8px_0px_#111] p-8 sm:p-10 flex flex-col justify-between"
        >
          <div>
            <div className="w-20 h-20 bg-mio-violet text-white border-4 border-[#111] shadow-[4px_4px_0px_#111] flex items-center justify-center font-display text-3xl font-bold mb-6">
              T
            </div>
            <h3 className="font-display text-2xl sm:text-3xl font-bold text-gray-950 mb-1">
              Tadeo Muñoz Garcés
            </h3>
            <span className="font-mono text-xs font-bold text-mio-violet uppercase tracking-widest block mb-4">
              Co-Founder & Lead Engineer
            </span>
            <p className="font-sans text-sm text-gray-600 leading-relaxed font-normal mb-8">
              Estudiante de Ciencia de Datos. Especializado en diseño de arquitecturas de analítica, optimización de pipelines y renderizado 3D reactivo en la web.
            </p>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t-2 border-[#111]">
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="p-2.5 bg-[#faf8f5] border-2 border-[#111] shadow-[2px_2px_0px_#111] hover:bg-mio-lime transition-colors"
            >
              <Github className="w-4 h-4 text-gray-950" />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noreferrer"
              className="p-2.5 bg-[#faf8f5] border-2 border-[#111] shadow-[2px_2px_0px_#111] hover:bg-mio-violet hover:text-white transition-colors"
            >
              <Linkedin className="w-4 h-4" />
            </a>
          </div>
        </motion.div>

        {/* Milena */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ ...springHeavy, delay: 0.15 }}
          className="bg-white border-4 border-[#111] shadow-[8px_8px_0px_#111] p-8 sm:p-10 flex flex-col justify-between"
        >
          <div>
            <div className="w-20 h-20 bg-mio-lime text-gray-950 border-4 border-[#111] shadow-[4px_4px_0px_#111] flex items-center justify-center font-display text-3xl font-bold mb-6">
              M
            </div>
            <h3 className="font-display text-2xl sm:text-3xl font-bold text-gray-950 mb-1">
              Milena Abraham
            </h3>
            <span className="font-mono text-xs font-bold text-mio-violet uppercase tracking-widest block mb-4">
              Co-Founder & ML Research
            </span>
            <p className="font-sans text-sm text-gray-600 leading-relaxed font-normal mb-8">
              Estudiante de Ciencia de Datos. Enfocada en modelos predictivos de clustering, analítica aplicada a negocios y extracción de valor a partir de datos dispersos.
            </p>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t-2 border-[#111]">
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="p-2.5 bg-[#faf8f5] border-2 border-[#111] shadow-[2px_2px_0px_#111] hover:bg-mio-lime transition-colors"
            >
              <Github className="w-4 h-4 text-gray-950" />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noreferrer"
              className="p-2.5 bg-[#faf8f5] border-2 border-[#111] shadow-[2px_2px_0px_#111] hover:bg-mio-violet hover:text-white transition-colors"
            >
              <Linkedin className="w-4 h-4" />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// =========================================================================
// 6. CTA FINAL MONUMENTAL
// =========================================================================
function FinalCallToAction() {
  return (
    <section className="py-20 sm:py-28 bg-[#0b0914] text-white border-t-4 border-[#111] relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <span className="font-mono text-xs font-bold text-mio-lime uppercase tracking-[0.2em] mb-4 block">
          ✦ DISPONIBLE PARA TU EMPRESA HOY
        </span>
        <h2 className="font-display text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-[1.05] mb-6">
          Dejá de adivinar.<br />
          <span className="text-mio-lime">Empezá a predecir.</span>
        </h2>
        <p className="font-sans text-base sm:text-lg text-gray-400 max-w-xl mx-auto mb-10 font-normal leading-relaxed">
          Probá MIO gratis con tus propios archivos y obtené respuestas de negocio en menos de un minuto.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/login"
            className="w-full sm:w-auto px-10 py-5 bg-mio-lime text-gray-950 font-sans font-black text-lg border-4 border-[#111] shadow-[6px_6px_0px_#fff] hover:shadow-none hover:translate-x-[6px] hover:translate-y-[6px] transition-all flex items-center justify-center gap-3 tracking-tight"
          >
            <span>Crear Cuenta Gratis</span>
            <ArrowRight className="w-5 h-5" strokeWidth={3} />
          </Link>
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
    <div className="min-h-screen bg-[#faf8f5] flex flex-col selection:bg-mio-lime selection:text-black relative">
      {/* Textura analógica de grano SVG */}
      <div className="noise-overlay" aria-hidden="true" />

      {/* Barra de telemetría de hardware */}
      <TopTelemetryBar />

      {/* Barra de navegación */}
      <Navbar />

      {/* ================================================================ */}
      {/* HERO SECTION MONUMENTAL (POCKETFOLIO VIBE) */}
      {/* ================================================================ */}
      <section className="relative pt-16 sm:pt-24 pb-16 lg:pt-32 lg:pb-24 overflow-hidden" style={{ perspective: '1200px' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          
          {/* Eyebrow badge */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={springGentle}
            className="inline-flex items-center gap-2.5 px-4 py-2 bg-white border-2 sm:border-3 border-[#111] text-mio-violet text-xs sm:text-sm font-mono font-bold mb-8 sm:mb-10 shadow-[3px_3px_0px_#111] tracking-wide"
          >
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-mio-lime fill-mio-lime" />
            <span className="uppercase tracking-[0.15em] text-[11px] sm:text-xs">Inteligencia Artificial para Negocios</span>
          </motion.div>

          {/* Headline monumental en Syne */}
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springHeavy, delay: 0.1 }}
            className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-gray-950 font-extrabold tracking-tight max-w-6xl mx-auto leading-[1.02] mb-8"
          >
            Tus planillas de datos, <br className="hidden sm:inline" />
            <span style={{ backgroundImage: "linear-gradient(135deg, #7647eb 25%, #bdf559 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              convertidas en inteligencia viva.
            </span>
          </motion.h1>

          {/* Subtítulo */}
          <motion.p 
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springHeavy, delay: 0.2 }}
            className="font-sans text-base sm:text-xl text-gray-600 max-w-2xl mx-auto mb-12 font-normal leading-relaxed"
          >
            Subí tus datos. MIO limpia la información, entrena modelos predictivos autónomos y genera los gráficos óptimos para tu empresa en 60 segundos.
          </motion.p>

          {/* Botones de acción principales */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springHeavy, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6"
          >
            <Link
              href="/login"
              className="w-full sm:w-auto px-9 sm:px-11 py-4 sm:py-5 bg-mio-lime text-gray-950 font-sans font-black text-base sm:text-lg border-4 border-[#111] shadow-[5px_5px_0px_#111] sm:shadow-[6px_6px_0px_#111] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all flex items-center justify-center gap-3 tracking-tight"
            >
              <span>Comenzar Gratis</span>
              <ArrowRight className="w-5 h-5" strokeWidth={2.8} />
            </Link>
          </motion.div>

        </div>

        {/* Switcher de Vista Hero (3D Hardware vs Plataforma) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 sm:mt-16 flex flex-col items-center relative z-20">
          <div className="inline-flex p-1.5 bg-white border-4 border-[#111] shadow-[6px_6px_0px_#111] gap-2">
            <button
              type="button"
              onClick={() => setHeroTab('3d')}
              className={`px-5 sm:px-7 py-2.5 sm:py-3 font-mono font-bold text-xs sm:text-sm tracking-wider uppercase transition-all flex items-center gap-2 ${
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
              className={`px-5 sm:px-7 py-2.5 sm:py-3 font-mono font-bold text-xs sm:text-sm tracking-wider uppercase transition-all flex items-center gap-2 ${
                heroTab === 'preview'
                  ? 'bg-mio-lime text-gray-950 border-2 border-[#111] shadow-[3px_3px_0px_#111] -translate-y-0.5'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-gray-900" />
              <span>💻 Vista Plataforma</span>
            </button>
          </div>
        </div>

        {/* ============================================================ */}
        {/* VISTA 3D: POCKETFOLIO 3-COLUMNS EDITORIAL */}
        {/* ============================================================ */}
        {heroTab === '3d' ? (
          <div className="mt-8 sm:mt-12 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] items-center gap-8 lg:gap-14">

              {/* COLUMNA IZQUIERDA: Editorial */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={springHeavy}
                className="hidden lg:flex flex-col justify-center text-left"
              >
                {/* Eyebrow */}
                <div className="flex items-center gap-2.5 mb-6">
                  <span className="w-2.5 h-2.5 rounded-full bg-mio-lime border border-[#111]" />
                  <span className="text-[11px] font-mono font-bold tracking-[0.22em] text-gray-400 uppercase">
                    01 / the pocket edition
                  </span>
                </div>

                {/* Titular */}
                <h2 className="font-display text-4xl xl:text-5xl font-bold text-gray-950 tracking-tight leading-[1.04] mb-5">
                  Small screen.<br />
                  <span className="italic font-normal" style={{ backgroundImage: "linear-gradient(to right, #7647eb, #bdf559)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                    Big decisions.
                  </span>
                </h2>

                {/* Descripción */}
                <p className="font-sans text-sm text-gray-600 font-normal leading-relaxed mb-10 max-w-xs">
                  Analítica predictiva en tu bolsillo. MIO entrena modelos AutoML, detecta anomalías y segmenta tus clientes — sin escribir una sola línea de código.
                </p>

                {/* Firma de proyecto */}
                <div className="border-t-2 border-[#111] pt-5">
                  <div className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest mb-1">
                    + MIO DATA ANALYTICS SYSTEM™
                  </div>
                  <div className="text-[10px] font-mono text-gray-400">
                    Ciencia de Datos · Inteligencia Artificial
                  </div>
                </div>

                {/* Nota de invitación */}
                <div className="mt-8 relative">
                  <span className="font-mono text-xs font-bold text-mio-violet">
                    ✦ Hace click en los botones del dispositivo →
                  </span>
                </div>
              </motion.div>

              {/* COLUMNA CENTRAL: Consola 3D Protagónica */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={springHeavy}
                className="flex justify-center"
              >
                <MioDevCanvas />
              </motion.div>

              {/* COLUMNA DERECHA: Guía de Controles */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ ...springHeavy, delay: 0.15 }}
                className="hidden lg:flex flex-col justify-center text-left"
              >
                {/* Panel de Controles Neo-Brutalista */}
                <div className="border-4 border-[#111] shadow-[6px_6px_0px_#111] p-6 bg-white">
                  <div className="flex items-center justify-between border-b-2 border-[#111] pb-3 mb-5">
                    <span className="text-[11px] font-mono font-bold tracking-[0.2em] text-gray-900 uppercase">
                      HOW TO OPERATE
                    </span>
                    <span className="text-[9px] font-mono font-bold text-mio-violet">● V2.6</span>
                  </div>

                  <div className="space-y-4">
                    {/* D-PAD */}
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-[#1a1726] text-white flex items-center justify-center font-mono font-bold text-base shrink-0 border-2 border-[#111] shadow-[2px_2px_0px_#111]">
                        +
                      </div>
                      <div>
                        <div className="text-xs font-mono font-bold text-gray-900">D-PAD</div>
                        <div className="text-[11px] font-sans text-gray-500 font-normal">Navegar visualizaciones</div>
                      </div>
                    </div>

                    {/* Botón A */}
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-mio-lime border-2 border-[#111] shadow-[2px_2px_0px_#111] flex items-center justify-center font-mono font-bold text-[11px] shrink-0 text-gray-900">
                        A
                      </div>
                      <div>
                        <div className="text-xs font-mono font-bold text-gray-900">BOTÓN A</div>
                        <div className="text-[11px] font-sans text-gray-500 font-normal">Siguiente algoritmo</div>
                      </div>
                    </div>

                    {/* Botón B */}
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-mio-violet border-2 border-[#111] shadow-[2px_2px_0px_#111] flex items-center justify-center font-mono font-bold text-[11px] shrink-0 text-white">
                        B
                      </div>
                      <div>
                        <div className="text-xs font-mono font-bold text-gray-900">BOTÓN B</div>
                        <div className="text-[11px] font-sans text-gray-500 font-normal">Algoritmo anterior</div>
                      </div>
                    </div>

                    {/* START */}
                    <div className="flex items-start gap-3">
                      <div className="px-2.5 h-6 bg-white border-2 border-[#111] shadow-[1px_1px_0px_#111] flex items-center font-mono font-bold text-[9px] shrink-0 text-gray-700 tracking-widest mt-0.5">
                        START
                      </div>
                      <div>
                        <div className="text-xs font-mono font-bold text-gray-900">START</div>
                        <div className="text-[11px] font-sans text-gray-500 font-normal">Ejecutar AutoML Predict</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Acceso a la plataforma web */}
                <button
                  type="button"
                  onClick={() => setHeroTab('preview')}
                  className="mt-6 flex items-center gap-2.5 text-gray-400 hover:text-mio-violet transition-colors cursor-pointer group text-left"
                >
                  <div className="w-8 h-8 border-2 border-gray-300 group-hover:border-mio-violet flex items-center justify-center transition-colors bg-white">
                    <BarChart3 className="w-4 h-4 text-gray-700 group-hover:text-mio-violet" />
                  </div>
                  <div>
                    <div className="text-xs font-sans font-bold text-gray-800">Ver vista plataforma →</div>
                    <div className="text-[10px] font-mono text-gray-400">Inspeccioná la interfaz de escritorio</div>
                  </div>
                </button>
              </motion.div>

            </div>
          </div>
        ) : (
          <PlatformPreviewMockup />
        )}
      </section>

      {/* ================================================================ */}
      {/* BENTO GRID V2 INTERACTIVO */}
      {/* ================================================================ */}
      <BentoGridV2 />

      {/* ================================================================ */}
      {/* THE PIPELINE WALKTHROUGH */}
      {/* ================================================================ */}
      <PipelineWalkthrough />

      {/* ================================================================ */}
      {/* DOSSIER DE FUNDADORES (ABOUT US) */}
      {/* ================================================================ */}
      <FoundersDossier />

      {/* ================================================================ */}
      {/* CTA FINAL DE ALTA CONVERSIÓN */}
      {/* ================================================================ */}
      <FinalCallToAction />

      {/* ================================================================ */}
      {/* FOOTER */}
      {/* ================================================================ */}
      <footer className="py-16 bg-[#faf8f5] border-t-4 border-[#111] text-center">
        <p className="font-display text-xl text-gray-950 mb-2 tracking-tight">MIO Data Analytics System™</p>
        <p className="font-mono text-xs text-gray-500 uppercase tracking-widest">
          © 2026 · Neo-Brutal Machine Learning · Diseñado en Argentina.
        </p>
      </footer>
    </div>
  );
}
