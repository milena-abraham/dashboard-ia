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
} from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';

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
      className="mt-20 relative z-0 max-w-5xl mx-auto w-full border-4 border-[#111] shadow-[12px_12px_0px_#111] bg-white aspect-[16/10] sm:aspect-video flex items-center justify-center overflow-hidden"
    >
      <div className="absolute inset-0 bg-gray-50 flex flex-col pointer-events-none">
        {/* Fake Browser Header */}
        <div className="h-12 border-b-4 border-[#111] bg-white flex items-center px-4 gap-3">
           <div className="w-4 h-4 rounded-full bg-red-400 border-2 border-[#111]" />
           <div className="w-4 h-4 rounded-full bg-yellow-400 border-2 border-[#111]" />
           <div className="w-4 h-4 rounded-full bg-mio-lime border-2 border-[#111]" />
           <div className="ml-4 h-6 w-1/3 bg-gray-100 border-2 border-[#111]" />
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
              <div className="flex gap-4 sm:gap-6 h-1/3">
                 <div className="flex-1 bg-mio-lime border-4 border-[#111] shadow-[4px_4px_0px_#111] p-4 flex flex-col justify-end">
                    <span className="font-bold text-xl sm:text-3xl text-gray-900 block border-b-4 border-[#111] w-1/2 mb-2"></span>
                 </div>
                 <div className="flex-1 bg-mio-violet text-white border-4 border-[#111] shadow-[4px_4px_0px_#111] p-4 flex flex-col justify-end">
                 </div>
              </div>
              <div className="flex-1 bg-white border-4 border-[#111] shadow-[4px_4px_0px_#111] flex items-end p-4 gap-4">
                 <div className="w-1/6 h-full bg-gray-200 border-2 border-[#111]"></div>
                 <div className="w-1/6 h-3/4 bg-gray-300 border-2 border-[#111]"></div>
                 <div className="w-1/6 h-1/2 bg-gray-400 border-2 border-[#111]"></div>
                 <div className="w-1/6 h-5/6 bg-mio-violet border-2 border-[#111]"></div>
                 <div className="w-1/6 h-full bg-mio-lime border-2 border-[#111]"></div>
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

  const y1 = useTransform(scrollYProgress, [0, 1], [150, 0]);
  const y2 = useTransform(scrollYProgress, [0.1, 1], [180, 0]);
  const y3 = useTransform(scrollYProgress, [0.2, 1], [210, 0]);
  const y4 = useTransform(scrollYProgress, [0.3, 1], [240, 0]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [0, 1]);

  return (
    <div ref={targetRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-extrabold text-gray-950 tracking-tighter mb-4">
          Una suite analítica en un solo click.
        </h2>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto font-medium">
          Robusto como una herramienta corporativa, simple como un chat.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[280px]">
        
        {/* Card 1: Large Feature */}
        <motion.div 
          style={{ y: y1, opacity, willChange: "transform, opacity" }}
          className="md:col-span-2 bg-white border-4 border-[#111] shadow-[8px_8px_0px_#111] p-8 flex flex-col justify-between group hover:shadow-none hover:translate-y-2 hover:translate-x-2 transition-all duration-300"
        >
          <div className="w-16 h-16 bg-mio-violet text-white flex items-center justify-center border-4 border-[#111] shadow-[4px_4px_0px_#111] mb-6">
            <BrainCircuit className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">Motores Predictivos (AutoML)</h3>
            <p className="text-gray-600 font-medium leading-relaxed max-w-md">
              MIO entrena modelos de Forecasting, Detección de Anomalías y Segmentación K-Means sin que escribas una sola línea de código Python.
            </p>
          </div>
        </motion.div>

        {/* Card 2: Small Feature */}
        <motion.div 
          style={{ y: y2, opacity, willChange: "transform, opacity" }}
          className="bg-mio-lime border-4 border-[#111] shadow-[8px_8px_0px_#111] p-8 flex flex-col justify-between group hover:shadow-none hover:translate-y-2 hover:translate-x-2 transition-all duration-300"
        >
          <div className="w-16 h-16 bg-white text-gray-900 flex items-center justify-center border-4 border-[#111] shadow-[4px_4px_0px_#111] mb-6">
            <Zap className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">Velocidad</h3>
            <p className="text-gray-800 font-medium">Auto-limpieza de datos y generación de dashboard en menos de 60 segundos.</p>
          </div>
        </motion.div>

        {/* Card 3: Small Feature */}
        <motion.div 
          style={{ y: y3, opacity, willChange: "transform, opacity" }}
          className="bg-white border-4 border-[#111] shadow-[8px_8px_0px_#111] p-8 flex flex-col justify-between group hover:shadow-none hover:translate-y-2 hover:translate-x-2 transition-all duration-300"
        >
          <div className="w-16 h-16 bg-red-400 text-white flex items-center justify-center border-4 border-[#111] shadow-[4px_4px_0px_#111] mb-6">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">Privacidad Total</h3>
            <p className="text-gray-600 font-medium">Tus CSVs crudos nunca se guardan. Solo extraemos agregados estadísticos.</p>
          </div>
        </motion.div>

        {/* Card 4: Large Feature */}
        <motion.div 
          style={{ y: y4, opacity, willChange: "transform, opacity" }}
          className="md:col-span-2 bg-gray-900 text-white border-4 border-[#111] shadow-[8px_8px_0px_#111] p-8 flex flex-col justify-between group hover:shadow-none hover:translate-y-2 hover:translate-x-2 transition-all duration-300"
        >
          <div className="w-16 h-16 bg-mio-violet flex items-center justify-center border-4 border-[#111] shadow-[4px_4px_0px_#111] mb-6">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">IA Generativa Integrada</h3>
            <p className="text-gray-300 font-medium leading-relaxed max-w-md">
              Chateá con tus datos. Gemini analiza las métricas, redacta un informe ejecutivo y redibuja los gráficos si se lo pedís.
            </p>
          </div>
        </motion.div>

      </div>
    </div>
  );
}

export default function LandingPage() {
  // Hero text word-by-word animation
  const titleText = "Decisiones inteligentes.";
  const titleWords = titleText.split(" ");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const wordVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', damping: 12, stiffness: 100 } }
  };

  return (
    <div className="min-h-screen bg-[#fafafc] flex flex-col selection:bg-mio-lime selection:text-black">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-20 pb-10 lg:pt-32 lg:pb-16 overflow-hidden" style={{ perspective: '1200px' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border-4 border-[#111] text-mio-violet text-sm font-bold mb-10 shadow-[4px_4px_0px_#111]"
          >
            <Sparkles className="w-4 h-4" />
            <span>Inteligencia Artificial para Negocios</span>
          </motion.div>

          <motion.h1 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-5xl sm:text-7xl lg:text-8xl font-black text-gray-950 tracking-tighter max-w-5xl mx-auto leading-[1.05] mb-8"
          >
            Convertí planillas de datos en <br className="hidden md:block" />
            {titleWords.map((word, i) => (
              <motion.span key={i} variants={wordVariants} className="inline-block mr-3 text-transparent bg-clip-text bg-gradient-to-r from-mio-lime to-[#815ae1]">
                {word}
              </motion.span>
            ))}
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-12 font-medium leading-relaxed"
          >
            Subí un CSV. MIO limpia los datos, corre modelos de Machine Learning y arma tu dashboard ejecutivo en 60 segundos.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <Link
              href="/login"
              className="w-full sm:w-auto px-10 py-5 bg-mio-lime text-gray-950 font-black text-lg border-4 border-[#111] shadow-[6px_6px_0px_#111] hover:shadow-none hover:translate-y-[6px] hover:translate-x-[6px] transition-all flex items-center justify-center gap-3"
            >
              <span>Comenzar Gratis</span>
              <ArrowRight className="w-5 h-5" strokeWidth={3} />
            </Link>
          </motion.div>

        </div>

        {/* Scroll-scrubbing Mockup */}
        <HeroMockup />
        
      </section>

      {/* Bento Grid Features with Scroll Scrubbing */}
      <BentoGrid />

      {/* Footer */}
      <footer className="mt-auto py-12 bg-white border-t-4 border-[#111] text-center text-sm font-bold text-gray-500">
        <p>© 2026 MIO. Neo-Brutal Analytics.</p>
      </footer>
    </div>
  );
}
