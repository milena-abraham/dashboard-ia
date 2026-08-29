import React from 'react';
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
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/ScrollReveal';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#fafafc] flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-24 lg:pt-24 lg:pb-32">
        <ScrollReveal direction="up" delay={0.1}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-none bg-white border border-mio-violet/20/80 text-mio-violet text-xs font-semibold mb-8 shadow-[4px_4px_0px_#111]">
            <Sparkles className="w-4 h-4" />
            <span>Inteligencia Artificial aplicada a datos de negocio</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-gray-950 tracking-tight max-w-4xl mx-auto leading-[1.15] mb-6">
            Convertí tus planillas de datos en <span className="text-transparent bg-clip-text bg-gradient-to-r from-mio-lime to-[#c8ff6a]">decisiones inteligentes</span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
            Subí cualquier archivo Excel o CSV. Nuestro motor de Machine Learning limpia los datos, entrena modelos predictivos, genera gráficos y redacta informes ejecutivos en 60 segundos.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-4 rounded-none bg-gradient-to-r from-mio-lime to-[#c8ff6a] text-gray-900 font-semibold text-base shadow-[4px_4px_0px_#111] hover:translate-y-[2px] transition-all flex items-center justify-center gap-2 group border-2 border-[#111]"
            >
              <span>Comenzar a Analizar Gratis</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-4 rounded-none bg-white border border-[#111] border-2 text-gray-800 font-semibold text-base shadow-[4px_4px_0px_#111] hover:bg-white hover:translate-y-[2px] transition-all"
            >
              Ver Demo Interactiva
            </Link>
          </div>
          </div>
        </ScrollReveal>
      </section>

      {/* 3 Pilares */}
      <section className="py-16 bg-white border-y border-[#111] border-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal direction="up">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                Todo lo que necesitás sin programar una sola línea
              </h2>
              <p className="text-gray-500 max-w-xl mx-auto text-sm">
                Diseñado para dueños de negocio, equipos de finanzas, ventas y marketing.
              </p>
            </div>
          </ScrollReveal>
          
          <StaggerContainer staggerDelay={0.15}>
            <div className="grid md:grid-cols-3 gap-8">
              <StaggerItem direction="up">
                <div className="p-8 rounded-none bg-white/50 border border-[#111] border-2 h-full shadow-[4px_4px_0px_#111] hover:shadow-[6px_6px_0px_#111] transition-all hover:-translate-y-1">
                  <div className="w-12 h-12 rounded-none bg-mio-violet/10 text-mio-violet flex items-center justify-center mb-6">
                    <Zap className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Auto-Data Cleaning</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Detecta y corrige formatos de moneda, fechas, valores nulos y registros duplicados automáticamente antes de procesar.
                  </p>
                </div>
              </StaggerItem>

              <StaggerItem direction="up">
                <div className="p-8 rounded-none bg-white/50 border border-[#111] border-2 h-full shadow-[4px_4px_0px_#111] hover:shadow-[6px_6px_0px_#111] transition-all hover:-translate-y-1">
                  <div className="w-12 h-12 rounded-none bg-mio-violet/10 text-mio-violet flex items-center justify-center mb-6">
                    <BrainCircuit className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">4 Motores de Machine Learning</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Forecasting a 60 días, segmentación de clientes con K-Means, detección de anomalías con Isolation Forest y factores clave con LightGBM.
                  </p>
                </div>
              </StaggerItem>

              <StaggerItem direction="up">
                <div className="p-8 rounded-none bg-white/50 border border-[#111] border-2 h-full shadow-[4px_4px_0px_#111] hover:shadow-[6px_6px_0px_#111] transition-all hover:-translate-y-1">
                  <div className="w-12 h-12 rounded-none bg-mio-violet/10 text-mio-violet flex items-center justify-center mb-6">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Narrativa Ejecutiva con IA</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    La IA traduce números y métricas complejas a un informe ejecutivo claro con recomendaciones accionables para tu empresa.
                  </p>
                </div>
              </StaggerItem>
            </div>
          </StaggerContainer>
        </div>
      </section>

      {/* Pasos */}
      <section className="py-20 bg-[#fafafc]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollReveal direction="up">
            <h2 className="text-3xl font-bold text-gray-900 mb-12">Cómo Funciona</h2>
          </ScrollReveal>
          
          <StaggerContainer staggerDelay={0.2}>
            <div className="grid md:grid-cols-3 gap-8">
              <StaggerItem direction="up">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-none bg-mio-violet text-white font-bold text-lg flex items-center justify-center mb-4 shadow-[4px_4px_0px_#111] border-2 border-[#111]">
                    1
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-1">Subí tu archivo</h4>
                  <p className="text-sm text-gray-500 max-w-xs">Arrastrá cualquier Excel o CSV desde tu computadora.</p>
                </div>
              </StaggerItem>

              <StaggerItem direction="up">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-none bg-mio-violet text-white font-bold text-lg flex items-center justify-center mb-4 shadow-[4px_4px_0px_#111] border-2 border-[#111]">
                    2
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-1">Elegí la métrica</h4>
                  <p className="text-sm text-gray-500 max-w-xs">Seleccioná qué querés analizar (ej. Ventas, Ganancia o Churn).</p>
                </div>
              </StaggerItem>

              <StaggerItem direction="up">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-none bg-mio-violet text-white font-bold text-lg flex items-center justify-center mb-4 shadow-[4px_4px_0px_#111] border-2 border-[#111]">
                    3
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-1">Obtené tu informe</h4>
                  <p className="text-sm text-gray-500 max-w-xs">Visualizá el dashboard interactivo y descargá el PDF ejecutivo.</p>
                </div>
              </StaggerItem>
            </div>
          </StaggerContainer>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 bg-white border-t border-[#111] border-2 text-center text-xs text-gray-400">
        <p>© 2026 MIO. Plataforma de analítica automatizada y Machine Learning.</p>
      </footer>
    </div>
  );
}
