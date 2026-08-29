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

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#fafafc] flex flex-col selection:bg-indigo-500 selection:text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-24 lg:pt-24 lg:pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100/80 text-indigo-700 text-xs font-semibold mb-8 shadow-sm">
            <Sparkles className="w-4 h-4" />
            <span>Inteligencia Artificial aplicada a datos de negocio</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-gray-950 tracking-tight max-w-4xl mx-auto leading-[1.15] mb-6">
            Convertí tus planillas de datos en <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">decisiones inteligentes</span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
            Subí cualquier archivo Excel o CSV. Nuestro motor de Machine Learning limpia los datos, entrena modelos predictivos, genera gráficos y redacta informes ejecutivos en 60 segundos.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-base shadow-lg shadow-indigo-200 hover:shadow-indigo-300 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 group"
            >
              <span>Comenzar a Analizar Gratis</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white border border-gray-200/80 text-gray-800 font-semibold text-base hover:bg-gray-50 transition-all"
            >
              Ver Demo Interactiva
            </Link>
          </div>
        </div>
      </section>

      {/* 3 Pilares */}
      <section className="py-16 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Todo lo que necesitás sin programar una sola línea
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto text-sm">
              Diseñado para dueños de negocio, equipos de finanzas, ventas y marketing.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-gray-50/50 border border-gray-100 hover:shadow-lg hover:border-indigo-100 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-6">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Auto-Data Cleaning</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Detecta y corrige formatos de moneda, fechas, valores nulos y registros duplicados automáticamente antes de procesar.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-gray-50/50 border border-gray-100 hover:shadow-lg hover:border-purple-100 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center mb-6">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">4 Motores de Machine Learning</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Forecasting a 60 días, segmentación de clientes con K-Means, detección de anomalías con Isolation Forest y factores clave con LightGBM.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-gray-50/50 border border-gray-100 hover:shadow-lg hover:border-emerald-100 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-6">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Narrativa Ejecutiva con IA</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                La IA traduce números y métricas complejas a un informe ejecutivo claro con recomendaciones accionables para tu empresa.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pasos */}
      <section className="py-20 bg-[#fafafc]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-12">Cómo Funciona</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-indigo-600 text-white font-bold text-lg flex items-center justify-center mb-4 shadow-md shadow-indigo-200">
                1
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-1">Subí tu archivo</h4>
              <p className="text-sm text-gray-500 max-w-xs">Arrastrá cualquier Excel o CSV desde tu computadora.</p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-indigo-600 text-white font-bold text-lg flex items-center justify-center mb-4 shadow-md shadow-indigo-200">
                2
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-1">Elegí la métrica</h4>
              <p className="text-sm text-gray-500 max-w-xs">Seleccioná qué querés analizar (ej. Ventas, Ganancia o Churn).</p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-indigo-600 text-white font-bold text-lg flex items-center justify-center mb-4 shadow-md shadow-indigo-200">
                3
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-1">Obtené tu informe</h4>
              <p className="text-sm text-gray-500 max-w-xs">Visualizá el dashboard interactivo y descargá el PDF ejecutivo.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 bg-white border-t border-gray-100 text-center text-xs text-gray-400">
        <p>© 2026 Dashboard IA. Plataforma de analítica automatizada y Machine Learning.</p>
      </footer>
    </div>
  );
}
