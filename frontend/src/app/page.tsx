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
  MousePointerClick,
  Download
} from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';

const MioDevCanvas = dynamic(() => import('@/components/canvas/MioDevCanvas'), {
  ssr: false,
  loading: () => (
    <div className="w-[360px] lg:w-[480px] h-[620px] lg:h-[780px] flex flex-col items-center justify-center font-mono text-xs font-bold text-gray-400 bg-white/60 border-4 border-[#111] shadow-[6px_6px_0px_#111]">
      <span className="animate-pulse text-mio-violet mb-2">● HARDWARE BOOTING</span>
      <span className="text-[10px] text-gray-400">CARGANDO MIO-DEV 3D...</span>
    </div>
  )
});

// Físicas de resorte de alta gama (Spring Physics basadas en masa, rigidez e inercia real)
const springHeavy = { type: 'spring' as const, mass: 1.2, stiffness: 75, damping: 18 };
const springMedium = { type: 'spring' as const, mass: 0.8, stiffness: 105, damping: 15 };
const springSnappy = { type: 'spring' as const, mass: 0.35, stiffness: 280, damping: 16 };
const springGentle = { type: 'spring' as const, mass: 1.0, stiffness: 85, damping: 16 };

function FloatingIcons() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden hidden md:flex items-center justify-center z-[-1]">
      <motion.div 
        animate={{ y: [-18, 18, -18], rotate: [-6, 6, -6] }}
        transition={{ repeat: Infinity, duration: 7, ease: "easeInOut" }}
        className="absolute top-[20%] left-[8%] bg-white p-4 border-4 border-[#111] shadow-[6px_6px_0px_#111] rounded-none"
      >
        <BarChart3 className="w-10 h-10 text-mio-violet" />
      </motion.div>
      <motion.div 
        animate={{ y: [18, -18, 18], rotate: [6, -6, 6] }}
        transition={{ repeat: Infinity, duration: 9, ease: "easeInOut" }}
        className="absolute top-[28%] right-[8%] bg-mio-lime p-4 border-4 border-[#111] shadow-[6px_6px_0px_#111] rounded-none"
      >
        <TrendingUp className="w-10 h-10 text-gray-900" />
      </motion.div>
      <motion.div 
        animate={{ y: [-12, 12, -12], rotate: [-8, 8, -8] }}
        transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
        className="absolute bottom-[35%] left-[16%] bg-white p-4 border-4 border-[#111] shadow-[6px_6px_0px_#111] rounded-none"
      >
        <FileSpreadsheet className="w-10 h-10 text-blue-500" />
      </motion.div>
    </div>
  );
}

function HeroMockup() {

  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "end center"],
  });

  const scale = useTransform(scrollYProgress, [0, 1], [0.8, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [0, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [100, 0]);
  const rotateX = useTransform(scrollYProgress, [0, 1], [15, 0]);

  return (
    <motion.div 
      ref={targetRef} 
      style={{ scale, opacity, y, rotateX, willChange: "transform, opacity" }}
      className="mt-16 sm:mt-24 relative z-0 max-w-5xl mx-auto w-full border-4 border-[#111] shadow-[8px_8px_0px_#111] sm:shadow-[16px_16px_0px_#111] bg-white aspect-[4/3] sm:aspect-video flex items-center justify-center overflow-hidden"
    >
      <div className="absolute inset-0 bg-gray-50 flex flex-col pointer-events-none">
        {/* Fake Browser Header */}
        <div className="h-10 sm:h-12 border-b-4 border-[#111] bg-white flex items-center px-4 gap-2 sm:gap-3">
           <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-red-400 border-2 border-[#111]" />
           <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-yellow-400 border-2 border-[#111]" />
           <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-mio-lime border-2 border-[#111]" />
           <div className="ml-2 sm:ml-4 h-4 sm:h-6 w-1/3 bg-gray-100 border-2 border-[#111]" />
        </div>
        {/* Fake Dashboard Body */}
        <div className="flex-1 p-4 sm:p-8 flex gap-4 sm:gap-6">
           {/* Sidebar */}
           <div className="hidden sm:flex w-1/4 bg-white border-4 border-[#111] shadow-[4px_4px_0px_#111] flex-col p-4 gap-4">
              <div className="w-full h-8 bg-gray-200 border-2 border-[#111]"></div>
              <div className="w-full h-8 bg-gray-100 border-2 border-[#111]"></div>
              <div className="w-full h-8 bg-gray-100 border-2 border-[#111]"></div>
           </div>
           
           {/* Main Content */}
           <div className="flex-1 flex flex-col gap-4 sm:gap-6">
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 h-1/2 sm:h-1/3">
                 <div className="flex-1 bg-mio-lime border-4 border-[#111] shadow-[4px_4px_0px_#111] p-4 flex flex-col justify-end">
                    <span className="font-bold text-xl sm:text-3xl text-gray-900 block border-b-4 border-[#111] w-1/2 mb-2"></span>
                 </div>
                 <div className="flex-1 bg-mio-violet text-white border-4 border-[#111] shadow-[4px_4px_0px_#111] p-4 flex flex-col justify-end">
                 </div>
              </div>
              <div className="flex-1 bg-white border-4 border-[#111] shadow-[4px_4px_0px_#111] flex items-end p-4 gap-2 sm:gap-4 overflow-hidden">
                 <div className="flex-1 h-1/4 bg-gray-200 border-2 border-[#111]"></div>
                 <div className="flex-1 h-3/4 bg-gray-300 border-2 border-[#111]"></div>
                 <div className="flex-1 h-1/2 bg-gray-400 border-2 border-[#111]"></div>
                 <div className="flex-1 h-5/6 bg-mio-violet border-2 border-[#111]"></div>
                 <div className="flex-1 h-full bg-mio-lime border-2 border-[#111]"></div>
              </div>
           </div>
        </div>
      </div>
    </motion.div>
  );
}

function BentoGrid() {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start 90%", "end center"],
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [80, 0]);
  const y2 = useTransform(scrollYProgress, [0.1, 1], [100, 0]);
  const y3 = useTransform(scrollYProgress, [0.2, 1], [120, 0]);
  const y4 = useTransform(scrollYProgress, [0.3, 1], [140, 0]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [0, 1]);

  return (
    <div ref={targetRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 lg:py-44">
      <div className="text-center mb-16 sm:mb-20">
        <span className="text-[11px] font-mono font-bold tracking-[0.2em] text-mio-violet uppercase mb-3 block">
          02 / Capacidades del Sistema
        </span>
        <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-gray-950 tracking-tight mb-5">
          Una suite analítica en un solo click.
        </h2>
        <p className="font-sans text-base sm:text-lg text-gray-600 max-w-2xl mx-auto font-normal leading-relaxed">
          Robusto como una infraestructura corporativa, simple como un chat.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 auto-rows-auto md:auto-rows-[300px]">
        
        {/* Card 1: Large Feature */}
        <motion.div 
          style={{ y: y1, opacity, willChange: "transform, opacity" }}
          whileHover={{ y: -4, x: -4 }}
          transition={springSnappy}
          className="md:col-span-2 bg-white border-4 border-[#111] shadow-[6px_6px_0px_#111] sm:shadow-[8px_8px_0px_#111] hover:shadow-[12px_12px_0px_#111] p-8 sm:p-10 flex flex-col justify-between transition-shadow cursor-default"
        >
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-mio-violet text-white flex items-center justify-center border-4 border-[#111] shadow-[4px_4px_0px_#111] mb-6">
            <BrainCircuit className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>
          <div>
            <h3 className="font-serif text-2xl sm:text-3xl text-gray-950 mb-2.5 tracking-tight">Motores Predictivos (AutoML)</h3>
            <p className="font-sans text-sm sm:text-base text-gray-600 font-normal leading-relaxed max-w-lg">
              MIO entrena modelos de Forecasting, Detección de Anomalías y Segmentación K-Means sin que escribas una sola línea de código Python.
            </p>
          </div>
        </motion.div>

        {/* Card 2: Small Feature */}
        <motion.div 
          style={{ y: y2, opacity, willChange: "transform, opacity" }}
          whileHover={{ y: -4, x: -4 }}
          transition={springSnappy}
          className="bg-mio-lime border-4 border-[#111] shadow-[6px_6px_0px_#111] sm:shadow-[8px_8px_0px_#111] hover:shadow-[12px_12px_0px_#111] p-8 sm:p-10 flex flex-col justify-between transition-shadow cursor-default"
        >
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white text-gray-900 flex items-center justify-center border-4 border-[#111] shadow-[4px_4px_0px_#111] mb-6">
            <Zap className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>
          <div>
            <h3 className="font-serif text-2xl sm:text-3xl text-gray-950 mb-2.5 tracking-tight">Velocidad</h3>
            <p className="font-sans text-sm sm:text-base text-gray-900 font-bold">Limpieza y dashboard completo en menos de 60 segundos.</p>
          </div>
        </motion.div>

        {/* Card 3: Small Feature */}
        <motion.div 
          style={{ y: y3, opacity, willChange: "transform, opacity" }}
          whileHover={{ y: -4, x: -4 }}
          transition={springSnappy}
          className="bg-white border-4 border-[#111] shadow-[6px_6px_0px_#111] sm:shadow-[8px_8px_0px_#111] hover:shadow-[12px_12px_0px_#111] p-8 sm:p-10 flex flex-col justify-between transition-shadow cursor-default"
        >
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#ff6b6b] text-white flex items-center justify-center border-4 border-[#111] shadow-[4px_4px_0px_#111] mb-6">
            <ShieldCheck className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>
          <div>
            <h3 className="font-serif text-2xl sm:text-3xl text-gray-950 mb-2.5 tracking-tight">Privacidad</h3>
            <p className="font-sans text-sm sm:text-base text-gray-600 font-normal">Tus archivos y datos crudos no se almacenan en servidores externos.</p>
          </div>
        </motion.div>

        {/* Card 4: Large Feature */}
        <motion.div 
          style={{ y: y4, opacity, willChange: "transform, opacity" }}
          whileHover={{ y: -4, x: -4 }}
          transition={springSnappy}
          className="md:col-span-2 bg-[#0b0914] text-white border-4 border-[#111] shadow-[6px_6px_0px_#111] sm:shadow-[8px_8px_0px_#111] hover:shadow-[12px_12px_0px_#111] p-8 sm:p-10 flex flex-col justify-between transition-shadow cursor-default"
        >
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-mio-violet flex items-center justify-center border-4 border-[#111] shadow-[4px_4px_0px_#111] mb-6">
            <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
          </div>
          <div>
            <h3 className="font-serif text-2xl sm:text-3xl text-white mb-2.5 tracking-tight">IA Generativa Integrada</h3>
            <p className="font-sans text-sm sm:text-base text-gray-300 font-normal leading-relaxed max-w-lg">
              Conversá con tus números. MIO analiza las métricas, redacta resúmenes ejecutivos y reconstruye los gráficos que necesites en tiempo real.
            </p>
          </div>
        </motion.div>

      </div>
    </div>
  );
}

function FormatBanner() {
  return (
    <div className="w-full bg-[#111] text-white py-6 border-y-4 border-gray-900 overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <FileSpreadsheet className="w-8 h-8 text-mio-lime" />
          <div>
            <h4 className="text-lg font-black tracking-tight">Carga de Datos Universal</h4>
            <p className="text-xs text-gray-400">Compatible con archivos .CSV y .XLSX (Excel)</p>
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
function AboutUs() {
  return (
    <section className="py-28 lg:py-44 bg-white border-t-4 border-[#111]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 sm:mb-20">
          <span className="text-[11px] font-mono font-bold tracking-[0.2em] text-mio-violet uppercase mb-3 block">
            04 / El Equipo
          </span>
          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-gray-950 tracking-tight mb-4">
            Quiénes Somos
          </h2>
          <p className="font-sans text-base sm:text-lg text-gray-600 max-w-2xl mx-auto font-normal leading-relaxed">
            Estudiantes con la visión de democratizar la analítica de datos avanzada para emprendedores y empresas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-4xl mx-auto">
          {/* Tadeo */}
          <motion.div 
            whileHover={{ y: -4, x: -4 }}
            transition={springSnappy}
            className="bg-[#faf8f5] border-4 border-[#111] shadow-[8px_8px_0px_#111] hover:shadow-[12px_12px_0px_#111] p-8 sm:p-10 flex flex-col items-center text-center transition-shadow cursor-default"
          >
            <div className="w-24 h-24 bg-mio-violet rounded-full border-4 border-[#111] shadow-[4px_4px_0px_#111] mb-6 flex items-center justify-center text-white text-3xl font-serif">
              T
            </div>
            <h3 className="font-serif text-2xl sm:text-3xl text-gray-900 mb-1 tracking-tight">Tadeo Muñoz Garcés</h3>
            <p className="font-mono text-xs font-bold text-mio-violet tracking-wider uppercase mb-5">Co-Founder & Developer</p>
            <p className="font-sans text-sm text-gray-600 font-normal leading-relaxed mb-8">
              Estudiante de Ciencia de Datos. Apasionado por analizar, visualizar y dar vida a los datos mediante arquitecturas de software sólidas e inteligencia artificial.
            </p>
            <div className="flex gap-4 mt-auto">
              <motion.a 
                whileHover={{ y: -2, x: -2 }}
                transition={springSnappy}
                href="#" 
                className="w-10 h-10 bg-white border-2 border-[#111] shadow-[2px_2px_0px_#111] flex items-center justify-center"
              >
                <Github className="w-5 h-5 text-gray-900" />
              </motion.a>
              <motion.a 
                whileHover={{ y: -2, x: -2 }}
                transition={springSnappy}
                href="#" 
                className="w-10 h-10 bg-white border-2 border-[#111] shadow-[2px_2px_0px_#111] flex items-center justify-center"
              >
                <Linkedin className="w-5 h-5 text-blue-600" />
              </motion.a>
            </div>
          </motion.div>

          {/* Milena */}
          <motion.div 
            whileHover={{ y: -4, x: -4 }}
            transition={springSnappy}
            className="bg-[#faf8f5] border-4 border-[#111] shadow-[8px_8px_0px_#111] hover:shadow-[12px_12px_0px_#111] p-8 sm:p-10 flex flex-col items-center text-center transition-shadow cursor-default"
          >
            <div className="w-24 h-24 bg-mio-lime rounded-full border-4 border-[#111] shadow-[4px_4px_0px_#111] mb-6 flex items-center justify-center text-black text-3xl font-serif">
              M
            </div>
            <h3 className="font-serif text-2xl sm:text-3xl text-gray-900 mb-1 tracking-tight">Milena Abraham</h3>
            <p className="font-mono text-xs font-bold text-mio-violet tracking-wider uppercase mb-5">Co-Founder & Developer</p>
            <p className="font-sans text-sm text-gray-600 font-normal leading-relaxed mb-8">
              Estudiante de Ciencia de Datos. Apasionada por analizar, visualizar y construir modelos predictivos para encontrar valor estratégico en el caos de la información.
            </p>
            <div className="flex gap-4 mt-auto">
              <motion.a 
                whileHover={{ y: -2, x: -2 }}
                transition={springSnappy}
                href="#" 
                className="w-10 h-10 bg-white border-2 border-[#111] shadow-[2px_2px_0px_#111] flex items-center justify-center"
              >
                <Github className="w-5 h-5 text-gray-900" />
              </motion.a>
              <motion.a 
                whileHover={{ y: -2, x: -2 }}
                transition={springSnappy}
                href="#" 
                className="w-10 h-10 bg-white border-2 border-[#111] shadow-[2px_2px_0px_#111] flex items-center justify-center"
              >
                <Linkedin className="w-5 h-5 text-blue-600" />
              </motion.a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default function LandingPage() {
  const [heroTab, setHeroTab] = useState<'3d' | 'preview'>('3d');

  return (
    <div className="min-h-screen bg-[#faf8f5] flex flex-col selection:bg-mio-lime selection:text-black relative">
      {/* Textura analógica de grano SVG de fondo */}
      <div className="noise-overlay" aria-hidden="true" />
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-20 sm:pt-28 pb-14 lg:pt-36 lg:pb-24 overflow-hidden" style={{ perspective: '1200px' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={springGentle}
            className="inline-flex items-center gap-2.5 px-4 py-2 bg-white border-2 sm:border-3 border-[#111] text-mio-violet text-xs sm:text-sm font-mono font-bold mb-8 sm:mb-12 shadow-[3px_3px_0px_#111] tracking-wide"
          >
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-mio-lime fill-mio-lime" />
            <span className="uppercase tracking-[0.15em] text-[11px] sm:text-xs">Inteligencia Artificial para Negocios</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springHeavy, delay: 0.1 }}
            className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-gray-950 tracking-tight max-w-6xl mx-auto leading-[1.04] mb-8 sm:mb-10"
          >
            Convertí planillas de datos en <span className="italic font-normal" style={{ backgroundImage: "linear-gradient(135deg, #7647eb 25%, #bdf559 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>decisiones inteligentes.</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springHeavy, delay: 0.25 }}
            className="font-sans text-base sm:text-xl text-gray-600 max-w-2xl mx-auto mb-12 sm:mb-16 font-normal leading-relaxed"
          >
            Subí tus datos. MIO limpia la información, entrena modelos predictivos y genera los gráficos óptimos para tu empresa en 60 segundos.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springHeavy, delay: 0.35 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6"
          >
            <motion.div
              whileHover={{ x: -2, y: -2 }}
              whileTap={{ x: 2, y: 2 }}
              transition={springSnappy}
            >
              <Link
                href="/login"
                className="w-full sm:w-auto px-9 sm:px-11 py-4 sm:py-5 bg-mio-lime text-gray-950 font-sans font-black text-base sm:text-lg border-4 border-[#111] shadow-[5px_5px_0px_#111] sm:shadow-[6px_6px_0px_#111] hover:shadow-none transition-shadow flex items-center justify-center gap-3 tracking-tight"
              >
                <span>Comenzar Gratis</span>
                <ArrowRight className="w-5 h-5" strokeWidth={2.8} />
              </Link>
            </motion.div>
          </motion.div>

        </div>

        {/* Switcher de Vista Hero */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 sm:mt-18 flex flex-col items-center relative z-20">
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
        </div>

        {/* Hero Content */}
        {heroTab === '3d' ? (
          // ============================================================
          // LAYOUT POCKETFOLIO: 3 columnas — editorial | consola | guía
          // ============================================================
          <div className="mt-8 sm:mt-12 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] items-center gap-8 lg:gap-14">

              {/* ─── COLUMNA IZQUIERDA: Editorial ─── */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={springHeavy}
                className="hidden lg:flex flex-col justify-center text-left"
              >
                {/* Eyebrow label */}
                <div className="flex items-center gap-2.5 mb-6">
                  <span className="w-2.5 h-2.5 rounded-full bg-mio-lime border border-[#111]" />
                  <span className="text-[11px] font-mono font-bold tracking-[0.22em] text-gray-400 uppercase">
                    01 / the pocket edition
                  </span>
                </div>

                {/* Headline editorial */}
                <h2 className="font-serif text-4xl xl:text-5xl text-gray-950 tracking-tight leading-[1.04] mb-5">
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

                {/* Nota curva estilo Pocketfolio */}
                <div className="mt-8 relative">
                  <span className="font-serif italic font-normal text-gray-400 text-base">
                    Hecho para explorar. →
                  </span>
                </div>
              </motion.div>

              {/* ─── COLUMNA CENTRAL: Consola 3D protagonista ─── */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={springHeavy}
                className="flex justify-center"
              >
                <MioDevCanvas />
              </motion.div>

              {/* ─── COLUMNA DERECHA: How To Operate ─── */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ ...springHeavy, delay: 0.15 }}
                className="hidden lg:flex flex-col justify-center text-left"
              >
                {/* Panel de controles estilo neo-brutalista MIO */}
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
                        <div className="text-[11px] font-sans text-gray-500 font-normal">Siguiente gráfico</div>
                      </div>
                    </div>

                    {/* Botón B */}
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-mio-violet border-2 border-[#111] shadow-[2px_2px_0px_#111] flex items-center justify-center font-mono font-bold text-[11px] shrink-0 text-white">
                        B
                      </div>
                      <div>
                        <div className="text-xs font-mono font-bold text-gray-900">BOTÓN B</div>
                        <div className="text-[11px] font-sans text-gray-500 font-normal">Gráfico anterior</div>
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

                {/* Link secundario con resorte */}
                <motion.div
                  whileHover={{ x: 3 }}
                  transition={springSnappy}
                  className="mt-6 flex items-center gap-2.5 text-gray-400 hover:text-mio-violet transition-colors cursor-pointer group"
                >
                  <div className="w-8 h-8 border-2 border-gray-300 group-hover:border-mio-violet flex items-center justify-center transition-colors bg-white">
                    <BarChart3 className="w-4 h-4 text-gray-700 group-hover:text-mio-violet" />
                  </div>
                  <div>
                    <div className="text-xs font-sans font-bold text-gray-800">Ver dashboard en vivo →</div>
                    <div className="text-[10px] font-mono text-gray-400">Explorá la plataforma completa</div>
                  </div>
                </motion.div>
              </motion.div>

            </div>
          </div>
        ) : (
          <HeroMockup />
        )}
        
      </section>

      {/* Format Banner */}
      <FormatBanner />

      {/* How It Works */}
      <HowItWorks />

      {/* Bento Grid Features */}
      <BentoGrid />

      {/* About Us */}
      <AboutUs />

      {/* Footer */}
      <footer className="py-16 bg-[#faf8f5] border-t-4 border-[#111] text-center">
        <p className="font-serif text-xl text-gray-950 mb-2 tracking-tight">MIO Data Analytics System™</p>
        <p className="font-mono text-xs text-gray-500 uppercase tracking-widest">© 2026 · Neo-Brutal Machine Learning · Diseñado en Argentina.</p>
      </footer>
    </div>
  );
}
