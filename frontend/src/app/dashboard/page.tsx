'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import FileUploader from '@/components/FileUploader';
import KPICards from '@/components/KPICards';
import ChartRenderer from '@/components/ChartRenderer';
import InsightPanel from '@/components/InsightPanel';
import LoadingAnalysis from '@/components/LoadingAnalysis';
import DataQualityBadge from '@/components/DataQualityBadge';
import { analyzeFile, exportPDF } from '@/lib/api';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';
import {
  BarChart3,
  TrendingUp,
  Users,
  AlertTriangle,
  Target,
  FileText,
  Download,
  RotateCcw,
  Sparkles,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { AnalysisResult } from '@/types/analysis';

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [targetCol, setTargetCol] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleStartAnalysis = async () => {
    if (!file) {
      toast.error('Por favor seleccioná un archivo primero.');
      return;
    }

    setLoading(true);
    try {
      const data = await analyzeFile(file, targetCol || undefined);
      setResult(data);
      toast.success('¡Análisis completado con éxito!');

      // Guardar en Firestore si hay usuario
      if (user) {
        try {
          await addDoc(collection(db, 'users', user.uid, 'analyses'), {
            filename: data.filename,
            target_col: data.target_col,
            kpis: data.kpis,
            quality_score: data.profile.quality_score,
            narrative_text: data.narrative.text,
            created_at: serverTimestamp(),
          });
        } catch (firestoreErr) {
          console.warn('No se pudo guardar en Firestore (permisos o config):', firestoreErr);
        }
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Ocurrió un error al procesar el dataset.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!result) return;
    setDownloadingPdf(true);
    try {
      const blob = await exportPDF({
        filename: result.filename,
        target_col: result.target_col,
        kpis: result.kpis,
        narrative_text: result.narrative.text,
        profile: result.profile,
        anomaly_metrics: result.anomalies?.metrics || {},
        forecast_metrics: result.forecast?.metrics || {},
        segmentation_metrics: result.segmentation?.metrics || {},
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `informe_${result.filename}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success('PDF descargado exitosamente');
    } catch (err) {
      console.error(err);
      toast.error('Error al generar el PDF.');
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setTargetCol('');
    setActiveTab(0);
  };

  const tabs = [
    { label: 'Visualizaciones', icon: BarChart3 },
    { label: 'Proyecciones', icon: TrendingUp },
    { label: 'Segmentos', icon: Users },
    { label: 'Anomalías', icon: AlertTriangle },
    { label: 'Factores Clave', icon: Target },
    { label: 'Informe IA', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-[#fafafc] flex flex-col">
      <Navbar />

      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        {loading ? (
          <LoadingAnalysis />
        ) : !result ? (
          /* Estado 1: Subir Archivo */
          <div className="max-w-2xl mx-auto my-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
                Panel de Analítica & Machine Learning
              </h2>
              <p className="text-sm text-gray-500">
                Subí tu planilla para comenzar el análisis automático
              </p>
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm mb-6">
              <FileUploader onFileSelect={(f) => setFile(f)} selectedFile={file} />

              {file && (
                <div className="mt-6 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="w-full sm:w-auto">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                      Métrica objetivo (opcional)
                    </p>
                    <input
                      type="text"
                      value={targetCol}
                      onChange={(e) => setTargetCol(e.target.value)}
                      placeholder="Ej: ventas, ingreso, precio"
                      className="w-full sm:w-64 px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                    />
                  </div>

                  <button
                    onClick={handleStartAnalysis}
                    className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-sm shadow-md shadow-indigo-200 hover:shadow-indigo-300 hover:opacity-95 transition-all flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Ejecutar Análisis Completo</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Estado 2: Resultados del Dashboard */
          <div className="space-y-6">
            {/* Header del análisis */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-2xl font-bold text-gray-900">{result.filename}</h2>
                  <DataQualityBadge
                    score={result.profile.quality_score}
                    label={result.profile.quality_label}
                  />
                </div>
                <p className="text-sm text-gray-500">
                  Analizando foco en: <span className="font-semibold text-indigo-600">"{result.target_col}"</span> • {result.profile.n_rows} filas • {result.profile.n_cols} columnas
                </p>
              </div>

              <div className="flex items-center gap-2.5 w-full md:w-auto">
                <button
                  onClick={handleDownloadPdf}
                  disabled={downloadingPdf}
                  className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  <span>{downloadingPdf ? 'Generando PDF...' : 'Exportar PDF'}</span>
                </button>
                <button
                  onClick={handleReset}
                  className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Cargar otro archivo</span>
                </button>
              </div>
            </div>

            {/* KPIs */}
            <KPICards kpis={result.kpis} />

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-gray-200/80">
              {tabs.map((tab, idx) => {
                const Icon = tab.icon;
                const active = activeTab === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => setActiveTab(idx)}
                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                      active
                        ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab Contents */}
            <div className="pt-2">
              {/* Tab 0: Visualizaciones */}
              {activeTab === 0 && (
                <div className="grid md:grid-cols-2 gap-6">
                  {result.charts && result.charts.length > 0 ? (
                    result.charts.map((c, i) => (
                      <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                        <h4 className="text-base font-bold text-gray-900 mb-1">{c.title}</h4>
                        <p className="text-xs text-gray-400 mb-4">{c.description}</p>
                        <ChartRenderer figJson={c.fig_json} />
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 text-center py-12 text-gray-400">
                      No se encontraron gráficos automáticos para esta configuración.
                    </div>
                  )}
                </div>
              )}

              {/* Tab 1: Proyecciones */}
              {activeTab === 1 && (
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Proyección y Predicción Temporal</h3>
                      <p className="text-xs text-gray-500">Estimación de tendencia futura basada en series de tiempo</p>
                    </div>
                    {result.forecast?.metrics?.tendencia_pct !== undefined && (
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        result.forecast.metrics.tendencia_pct >= 0
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-red-50 text-red-700'
                      }`}>
                        Tendencia: {result.forecast.metrics.tendencia_pct}%
                      </span>
                    )}
                  </div>
                  <ChartRenderer figJson={result.forecast?.fig_json} height={420} />
                </div>
              )}

              {/* Tab 2: Segmentos */}
              {activeTab === 2 && (
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <h4 className="text-base font-bold text-gray-900 mb-2">Mapa de Segmentación 2D (PCA)</h4>
                    <ChartRenderer figJson={result.segmentation?.scatter_json} />
                  </div>
                  <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <h4 className="text-base font-bold text-gray-900 mb-2">Perfil Promedio por Segmento</h4>
                    <ChartRenderer figJson={result.segmentation?.profile_json} />
                  </div>
                </div>
              )}

              {/* Tab 3: Anomalías */}
              {activeTab === 3 && (
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Detección de Anomalías (Isolation Forest)</h3>
                    <p className="text-xs text-gray-500">Registros atípicos marcados para auditoría</p>
                  </div>
                  <ChartRenderer figJson={result.anomalies?.fig_json} height={400} />
                  {result.anomalies?.metrics?.anomalias_detalle && (
                    <div className="pt-4 border-t border-gray-100">
                      <h5 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3">
                        Detalle de casos detectados:
                      </h5>
                      <div className="space-y-2">
                        {result.anomalies.metrics.anomalias_detalle.map((d: string, idx: number) => (
                          <div key={idx} className="p-3 bg-red-50/50 border border-red-100 rounded-xl text-xs text-red-800">
                            ⚠️ {d}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 4: Factores Clave */}
              {activeTab === 4 && (
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <h4 className="text-base font-bold text-gray-900 mb-2">Impacto de Variables (LightGBM)</h4>
                    <ChartRenderer figJson={result.feature_importance?.fig_json} />
                  </div>
                  <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <h4 className="text-base font-bold text-gray-900 mb-2">Explicabilidad SHAP</h4>
                    <ChartRenderer figJson={result.feature_importance?.shap_json} />
                  </div>
                </div>
              )}

              {/* Tab 5: Informe IA */}
              {activeTab === 5 && (
                <InsightPanel
                  text={result.narrative?.text || 'Generando informe...'}
                  source={result.narrative?.source}
                />
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
