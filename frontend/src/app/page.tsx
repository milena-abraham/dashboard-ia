'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
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


function FloatingIcons() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden hidden md:flex items-center justify-center z-[-1]">
      <motion.div 
        animate={{ y: [-15, 15, -15], rotate: [-5, 5, -5] }}
        transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
        className="absolute top-[20%] left-[10%] bg-white p-4 border-4 border-[#111] shadow-[6px_6px_0px_#111] rounded-none"
      >
        <BarChart3 className="w-10 h-10 text-mio-violet" />
      </motion.div>
      <motion.div 
        animate={{ y: [15, -15, 15], rotate: [5, -5, 5] }}
        transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
        className="absolute top-[30%] right-[10%] bg-mio-lime p-4 border-4 border-[#111] shadow-[6px_6px_0px_#111] rounded-none"
      >
        <TrendingUp className="w-10 h-10 text-gray-900" />
      </motion.div>
      <motion.div 
        animate={{ y: [-10, 10, -10], rotate: [-10, 10, -10] }}
        transition={{ repeat: Infinity, duration: 7, ease: "easeInOut" }}
        className="absolute bottom-[40%] left-[20%] bg-white p-4 border-4 border-[#111] shadow-[6px_6px_0px_#111] rounded-none"
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
    <div ref={targetRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
      <div className="text-center mb-12 sm:mb-16">
        <h2 className="text-4xl md:text-5xl font-black text-gray-950 tracking-tighter mb-4">
          Una suite analítica en un solo click.
        </h2>
        <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto font-medium">
          Robusto como una herramienta corporativa, simple como un chat.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-auto md:auto-rows-[280px]">
        
        {/* Card 1: Large Feature */}
        <motion.div 
          style={{ y: y1, opacity, willChange: "transform, opacity" }}
          className="md:col-span-2 bg-white border-4 border-[#111] shadow-[6px_6px_0px_#111] sm:shadow-[8px_8px_0px_#111] p-6 sm:p-8 flex flex-col justify-between group hover:shadow-none hover:translate-y-2 hover:translate-x-2 transition-all duration-300"
        >
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-mio-violet text-white flex items-center justify-center border-4 border-[#111] shadow-[4px_4px_0px_#111] mb-6">
            <BrainCircuit className="w-6 h-6 sm:w-8 sm:h-8" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-2 tracking-tight">Motores Predictivos (AutoML)</h3>
            <p className="text-sm sm:text-base text-gray-600 font-medium leading-relaxed max-w-md">
              MIO entrena modelos de Forecasting, Detección de Anomalías y Segmentación K-Means sin que escribas una sola línea de código Python.
            </p>
          </div>
        </motion.div>

        {/* Card 2: Small Feature */}
        <motion.div 
          style={{ y: y2, opacity, willChange: "transform, opacity" }}
          className="bg-mio-lime border-4 border-[#111] shadow-[6px_6px_0px_#111] sm:shadow-[8px_8px_0px_#111] p-6 sm:p-8 flex flex-col justify-between group hover:shadow-none hover:translate-y-2 hover:translate-x-2 transition-all duration-300"
        >
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white text-gray-900 flex items-center justify-center border-4 border-[#111] shadow-[4px_4px_0px_#111] mb-6">
            <Zap className="w-6 h-6 sm:w-8 sm:h-8" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-2 tracking-tight">Velocidad</h3>
            <p className="text-sm sm:text-base text-gray-800 font-bold">Limpieza y dashboard en menos de 60s.</p>
          </div>
        </motion.div>

        {/* Card 3: Small Feature */}
        <motion.div 
          style={{ y: y3, opacity, willChange: "transform, opacity" }}
          className="bg-white border-4 border-[#111] shadow-[6px_6px_0px_#111] sm:shadow-[8px_8px_0px_#111] p-6 sm:p-8 flex flex-col justify-between group hover:shadow-none hover:translate-y-2 hover:translate-x-2 transition-all duration-300"
        >
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-red-400 text-white flex items-center justify-center border-4 border-[#111] shadow-[4px_4px_0px_#111] mb-6">
            <ShieldCheck className="w-6 h-6 sm:w-8 sm:h-8" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-2 tracking-tight">Privacidad</h3>
            <p className="text-sm sm:text-base text-gray-600 font-medium">Tus CSVs crudos nunca se guardan.</p>
          </div>
        </motion.div>

        {/* Card 4: Large Feature */}
        <motion.div 
          style={{ y: y4, opacity, willChange: "transform, opacity" }}
          className="md:col-span-2 bg-gray-900 text-white border-4 border-[#111] shadow-[6px_6px_0px_#111] sm:shadow-[8px_8px_0px_#111] p-6 sm:p-8 flex flex-col justify-between group hover:shadow-none hover:translate-y-2 hover:translate-x-2 transition-all duration-300"
        >
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-mio-violet flex items-center justify-center border-4 border-[#111] shadow-[4px_4px_0px_#111] mb-6">
            <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-white mb-2 tracking-tight">IA Generativa Integrada</h3>
            <p className="text-sm sm:text-base text-gray-300 font-medium leading-relaxed max-w-md">
              Chateá con tus datos. Nuestra IA analiza las métricas, redacta un informe ejecutivo y redibuja los gráficos si se lo pedís.
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
    offset: ["start 85%", "center center"],
  });

  // Staggered parallax for steps
  const step1Y = useTransform(scrollYProgress, [0, 1], [50, 0]);
  const step2Y = useTransform(scrollYProgress, [0.2, 1], [50, 0]);
  const step3Y = useTransform(scrollYProgress, [0.4, 1], [50, 0]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [0, 1]);

  return (
    <section className="py-20 lg:py-32 bg-[#fafafc] border-t-4 border-[#111] overflow-hidden">
      <div ref={targetRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-gray-950 tracking-tighter mb-4">
            Cómo Funciona MIO
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto font-medium">
            Tres simples pasos para convertir datos crudos en decisiones estratégicas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Conector horizontal (solo desktop) */}
          <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-1 bg-gray-200 z-0"></div>

          {/* Paso 1 */}
          <motion.div style={{ y: step1Y, opacity, willChange: "transform, opacity" }} className="relative z-10 flex flex-col items-center text-center group">
            <div className="w-24 h-24 bg-white border-4 border-[#111] shadow-[6px_6px_0px_#111] rounded-none flex items-center justify-center mb-6 group-hover:-translate-y-2 group-hover:shadow-[8px_8px_0px_#111] transition-all">
              <FileSpreadsheet className="w-10 h-10 text-mio-lime" strokeWidth={2.5} />
            </div>
            <div className="bg-mio-violet text-white text-xs font-bold px-3 py-1 border-2 border-[#111] mb-3 shadow-[2px_2px_0px_#111]">PASO 1</div>
            <h4 className="text-xl font-black text-gray-900 mb-2">Subí tus Datos</h4>
            <p className="text-gray-600 font-medium">Cargá tu Excel o CSV de forma segura. No requiere pre-limpieza.</p>
          </motion.div>

          {/* Paso 2 */}
          <motion.div style={{ y: step2Y, opacity, willChange: "transform, opacity" }} className="relative z-10 flex flex-col items-center text-center group">
            <div className="w-24 h-24 bg-mio-lime border-4 border-[#111] shadow-[6px_6px_0px_#111] rounded-none flex items-center justify-center mb-6 group-hover:-translate-y-2 group-hover:shadow-[8px_8px_0px_#111] transition-all">
              <MousePointerClick className="w-10 h-10 text-gray-900" strokeWidth={2.5} />
            </div>
            <div className="bg-mio-violet text-white text-xs font-bold px-3 py-1 border-2 border-[#111] mb-3 shadow-[2px_2px_0px_#111]">PASO 2</div>
            <h4 className="text-xl font-black text-gray-900 mb-2">Elegí el Objetivo</h4>
            <p className="text-gray-600 font-medium">Seleccioná la columna que querés predecir o entender a fondo.</p>
          </motion.div>

          {/* Paso 3 */}
          <motion.div style={{ y: step3Y, opacity, willChange: "transform, opacity" }} className="relative z-10 flex flex-col items-center text-center group">
            <div className="w-24 h-24 bg-gray-900 border-4 border-[#111] shadow-[6px_6px_0px_#111] rounded-none flex items-center justify-center mb-6 group-hover:-translate-y-2 group-hover:shadow-[8px_8px_0px_#111] transition-all">
              <Download className="w-10 h-10 text-white" strokeWidth={2.5} />
            </div>
            <div className="bg-mio-lime text-gray-900 text-xs font-black px-3 py-1 border-2 border-[#111] mb-3 shadow-[2px_2px_0px_#111]">PASO 3</div>
            <h4 className="text-xl font-black text-gray-900 mb-2">Resultados Inmediatos</h4>
            <p className="text-gray-600 font-medium">MIO limpia, entrena, y te entrega un dashboard interactivo al instante.</p>
          </motion.div>

        </div>
      </div>
    </section>
  );
}

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
              <a href="#" className="w-10 h-10 bg-white border-2 border-[#111] shadow-[2px_2px_0px_#111] flex items-center justify-center hover:translate-y-1 hover:shadow-none transition-all">
                <Github className="w-5 h-5 text-gray-900" />
              </a>
              <a href="#" className="w-10 h-10 bg-white border-2 border-[#111] shadow-[2px_2px_0px_#111] flex items-center justify-center hover:translate-y-1 hover:shadow-none transition-all">
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
              <a href="#" className="w-10 h-10 bg-white border-2 border-[#111] shadow-[2px_2px_0px_#111] flex items-center justify-center hover:translate-y-1 hover:shadow-none transition-all">
                <Github className="w-5 h-5 text-gray-900" />
              </a>
              <a href="#" className="w-10 h-10 bg-white border-2 border-[#111] shadow-[2px_2px_0px_#111] flex items-center justify-center hover:translate-y-1 hover:shadow-none transition-all">
                <Linkedin className="w-5 h-5 text-blue-600" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#fafafc] flex flex-col selection:bg-mio-lime selection:text-black">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-16 sm:pt-24 pb-10 lg:pt-32 lg:pb-16 overflow-hidden" style={{ perspective: '1200px' }}>
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
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-gray-950 tracking-tighter max-w-5xl mx-auto leading-[1.1] sm:leading-[1.05] mb-6 sm:mb-8"
          >
            Convertí planillas de datos en <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-mio-lime to-mio-violet py-2">
              decisiones inteligentes.
            </span>
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

        {/* Scroll-scrubbing Mockup */}
        <HeroMockup />
        
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
      <footer className="py-12 bg-white border-t-4 border-[#111] text-center text-sm font-bold text-gray-500">
        <p>© 2026 MIO. Neo-Brutal Analytics. Creado con ❤️ en Argentina.</p>
      </footer>
    </div>
  );
}
