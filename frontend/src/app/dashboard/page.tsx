'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import FileUploader from '@/components/FileUploader';
import KPICards from '@/components/KPICards';
import ChartRenderer from '@/components/ChartRenderer';
import InsightPanel from '@/components/InsightPanel';
import DataChatbot, { Message as ChatMessage } from '@/components/DataChatbot';
import LoadingAnalysis from '@/components/LoadingAnalysis';
import DataQualityBadge from '@/components/DataQualityBadge';
import { analyzeFile, exportPDF } from '@/lib/api';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';
import {
  BarChart3,
  Bot,
  TrendingUp,
  Users,
  AlertTriangle,
  Target,
  FileText,
  Download,
  RotateCcw,
  Sparkles,
  Save,
} from 'lucide-react';
import { AnalysisResult } from '@/types/analysis';

import { logSystemEvent } from '@/lib/logger';

function DashboardInner() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [targetCol, setTargetCol] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [savingProject, setSavingProject] = useState(false);
  const [chatLogged, setChatLogged] = useState(false);

  // Persistent chat state (lives in parent so tab changes don't reset it)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([{
    id: '1',
    role: 'assistant',
    content: '¡Hola! Soy **Asistente MIO**. He analizado tu archivo. ¿Qué te gustaría saber sobre los resultados? También podés pedirme que *modifique un gráfico*.'
  }]);

  // Chart overrides: map of chart index -> overridden chart_data
  const [chartOverrides, setChartOverrides] = useState<Record<number, any>>({});
  const originalCharts = result?.charts || [];

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Restore saved project from localStorage if ?project=ID is in the URL
  useEffect(() => {
    const projectId = searchParams.get('project');
    if (projectId) {
      try {
        const stored = localStorage.getItem(`mio_result_${projectId}`);
        if (stored) {
          const parsed = JSON.parse(stored) as AnalysisResult;
          setResult(parsed);
          toast.success('📂 Proyecto cargado correctamente');
        } else {
          toast.error('No se encontraron los datos de este proyecto en este navegador.');
        }
      } catch (e) {
        console.error('Error restaurando proyecto:', e);
        toast.error('Error al restaurar el proyecto.');
      }
    }
  }, [searchParams]);

  // Log chat opened
  useEffect(() => {
    if (activeTab === 6 && !chatLogged) {
      logSystemEvent('chat_session_started', { uid: user?.uid });
      setChatLogged(true);
    }
  }, [activeTab, chatLogged, user]);

  const handleStartAnalysis = async () => {
    if (!file) {
      toast.error('Por favor seleccioná un archivo primero.');
      return;
    }

    setLoading(true);
    setChatLogged(false);
    setChartOverrides({});
    try {
      const data = await analyzeFile(file, targetCol || undefined);
      setResult(data);
      toast.success('¡Análisis completado con éxito!');
      logSystemEvent('analysis_success', { 
        filename: file.name, 
        uid: user?.uid,
        metrics: {
          forecast: data.forecast?.metrics || {},
          segmentation: data.segmentation?.metrics || {},
          anomalies: data.anomalies?.metrics || {},
          feature_importance: data.feature_importance?.metrics || {}
        }
      });
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Ocurrió un error al procesar el dataset.');
      logSystemEvent('analysis_error', { filename: file.name, error: err.message, uid: user?.uid });
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
    setChatLogged(false);
    setChartOverrides({});
    setChatMessages([{
      id: '1',
      role: 'assistant',
      content: '¡Hola! Soy **Asistente MIO**. He analizado tu archivo. ¿Qué te gustaría saber sobre los resultados? También podés pedirme que *modifique un gráfico*.'
    }]);
  };

  const handleSaveProject = async () => {
    if (!result || !user) {
      toast.error('Necesitás estar logueado para guardar proyectos.');
      return;
    }
    setSavingProject(true);
    try {
      const savePromise = addDoc(collection(db, 'users', user.uid, 'analyses'), {
        filename: result.filename || 'dataset',
        target_col: result.target_col || (result as any).target_column || '',
        kpis: result.kpis || {},
        quality_score: result.profile?.quality_score ?? 0,
        narrative_text: result.narrative?.text?.slice(0, 500) || '',
        created_at: serverTimestamp(),
      });
      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout: Firestore no respondió. Verificá los permisos en la consola de Firebase.')), 8000)
      );
      const docRef = await Promise.race([savePromise, timeout]) as any;

      // Save full result to localStorage so the project can be reopened
      if (docRef?.id) {
        try {
          localStorage.setItem(`mio_result_${docRef.id}`, JSON.stringify(result));
        } catch (storageErr) {
          console.warn('localStorage full, skipping full result save:', storageErr);
        }
      }

      logSystemEvent('project_saved', { uid: user.uid, filename: result.filename });
      toast.success('✅ Proyecto guardado en Mis Proyectos');
    } catch (e: any) {
      console.error('Firestore save error:', e);
      if (e.message?.includes('Timeout')) {
        toast.error('⏱ Tiempo de espera agotado. Verificá los permisos de Firestore.');
      } else if (e.code === 'permission-denied') {
        toast.error('🔒 Sin permiso de escritura en Firestore. Actualizá las Rules en Firebase Console.');
      } else {
        toast.error(`Error: ${e.message || 'No se pudo guardar el proyecto.'}`);
      }
    } finally {
      setSavingProject(false);
    }
  };

  const handleChartOverride = (index: number, chartData: any) => {
    setChartOverrides(prev => ({ ...prev, [index]: chartData }));
    toast.success(`✏️ Gráfico ${index + 1} actualizado por el Asistente IA`);
  };

  const tabs = [
    { label: 'Visualizaciones', icon: BarChart3 },
    { label: 'Proyecciones', icon: TrendingUp },
    { label: 'Segmentos', icon: Users },
    { label: 'Anomalías', icon: AlertTriangle },
    { label: 'Factores Clave', icon: Target },
    { label: 'Informe IA', icon: FileText },
    { id: 'chat', label: 'Asistente IA', icon: Bot, hidden: true },
  ];

  return (
    <div className="min-h-screen bg-[#fafafc] flex flex-col">
      <Navbar />

      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        {loading ? (
          <LoadingAnalysis fileSize={file?.size} />
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

            <div className="bg-white p-6 sm:p-8 rounded-none border border-[#111] border-2 shadow-[4px_4px_0px_#111] mb-6">
              <FileUploader onFileSelect={(f) => setFile(f)} selectedFile={file} />

              {!file && (
                <div className="mt-4 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      const sampleCsv = `fecha,ventas,clientes,categoria,gasto_marketing,descuento_pct
2024-01-01,15400,120,Electrónica,2500,5
2024-01-02,18200,145,Electrónica,2800,10
2024-01-03,12100,98,Hogar,1500,0
2024-01-04,21300,160,Electrónica,3100,15
2024-01-05,19500,150,Hogar,2700,5
2024-01-06,24800,190,Indumentaria,3500,10
2024-01-07,26100,210,Electrónica,3800,20
2024-01-08,17200,135,Indumentaria,2200,5
2024-01-09,14900,115,Hogar,1800,0
2024-01-10,22500,175,Electrónica,3200,10
2024-01-11,28900,225,Indumentaria,4100,15
2024-01-12,31200,250,Electrónica,4500,25
2024-01-13,16400,130,Hogar,2000,5
2024-01-14,20100,155,Indumentaria,2900,10
2024-01-15,35000,280,Electrónica,5000,20`;
                      const blob = new Blob([sampleCsv], { type: 'text/csv' });
                      const sampleFile = new File([blob], 'ventas_retail_ejemplo.csv', { type: 'text/csv' });
                      setFile(sampleFile);
                      setTargetCol('ventas');
                      toast.success('Dataset de ejemplo cargado');
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-mio-violet hover:text-mio-violet/90 bg-white/70 hover:bg-indigo-100/70 px-4 py-2 rounded-none transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>O probá cargando un dataset de ejemplo de ventas</span>
                  </button>
                </div>
              )}

              {file && (
                <div className="mt-6 pt-6 border-t border-[#111] border-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="w-full sm:w-auto">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                      Métrica objetivo (opcional)
                    </p>
                    <input
                      type="text"
                      value={targetCol}
                      onChange={(e) => setTargetCol(e.target.value)}
                      placeholder="Ej: ventas, ingreso, precio"
                      className="w-full sm:w-64 px-3.5 py-2 border border-[#111] border-2 rounded-none text-sm focus:outline-none focus:ring-2 focus:ring-mio-violet text-gray-900"
                    />
                  </div>

                  <button
                    onClick={handleStartAnalysis}
                    className="w-full sm:w-auto px-8 py-3 rounded-none bg-gradient-to-r from-mio-lime to-[#c8ff6a] text-gray-900 font-semibold text-sm shadow-[6px_6px_0px_#111] shadow-mio-violet/30 hover:shadow-mio-violet/40 hover:opacity-95 transition-all flex items-center justify-center gap-2"
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
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-6 rounded-none border border-[#111] border-2 shadow-[4px_4px_0px_#111]">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-2xl font-bold text-gray-900">{result.filename}</h2>
                  <DataQualityBadge
                    score={result.profile.quality_score}
                    label={result.profile.quality_label}
                  />
                </div>
                <p className="text-sm text-gray-500">
                  Analizando foco en: <span className="font-semibold text-mio-violet">"{result.target_col}"</span> • {result.profile.n_rows} filas • {result.profile.n_cols} columnas
                </p>
              </div>

              <div className="flex items-center gap-2.5 w-full md:w-auto">
                <button
                  onClick={handleSaveProject}
                  disabled={savingProject}
                  className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-none bg-mio-lime text-gray-900 border-2 border-[#111] text-xs font-bold shadow-[3px_3px_0px_#111] hover:shadow-[1px_1px_0px_#111] hover:translate-y-[1px] transition-all disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{savingProject ? 'Guardando...' : 'Guardar Proyecto'}</span>
                </button>
                <button
                  onClick={handleDownloadPdf}
                  disabled={downloadingPdf}
                  className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-none bg-mio-violet hover:bg-mio-violet/90 text-white text-xs font-semibold shadow-[4px_4px_0px_#111] transition-all disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  <span>{downloadingPdf ? 'Generando PDF...' : 'Exportar PDF'}</span>
                </button>
                <button
                  onClick={handleReset}
                  className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-none bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Cargar otro archivo</span>
                </button>
              </div>
            </div>

            {/* KPIs */}
            <KPICards kpis={result.kpis} />

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-[#111] border-2/80">
              {tabs.map((tab, idx) => {
                const Icon = tab.icon;
                const active = activeTab === idx;
                if (tab.hidden) return null;
                return (
                  <button
                    key={idx}
                    onClick={() => setActiveTab(idx)}
                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-none text-xs font-semibold whitespace-nowrap transition-all ${
                      active
                        ? 'bg-mio-violet text-white shadow-[4px_4px_0px_#111] shadow-mio-violet/30'
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
                    result.charts.map((c, i) => {
                      const isOverridden = !!chartOverrides[i];
                      const activeChartData = isOverridden ? chartOverrides[i] : c.chart_data;
                      return (
                        <div key={i} className="bg-white p-6 rounded-none border border-[#111] border-2 shadow-[4px_4px_0px_#111]">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="text-base font-bold text-gray-900">{isOverridden ? (activeChartData.title || c.title) : c.title}</h4>
                            {isOverridden && (
                              <button
                                onClick={() => setChartOverrides(prev => { const n = {...prev}; delete n[i]; return n; })}
                                className="flex items-center gap-1 text-[11px] px-2 py-1 border border-gray-300 text-gray-500 hover:border-mio-violet hover:text-mio-violet transition-colors"
                                title="Restaurar gráfico original"
                              >
                                <RotateCcw className="w-3 h-3" /> Reset
                              </button>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 mb-4">{isOverridden ? '✏️ Modificado por Asistente IA' : c.description}</p>
                          <ChartRenderer key={result.filename + i} chartData={activeChartData} />
                        </div>
                      );
                    })
                  ) : (
                    <div className="col-span-2 text-center py-12 text-gray-400">
                      No se encontraron gráficos automáticos para esta configuración.
                    </div>
                  )}
                </div>
              )}

              {/* Tab 1: Proyecciones */}
              {activeTab === 1 && (
                <div className="bg-white p-6 sm:p-8 rounded-none border border-[#111] border-2 shadow-[4px_4px_0px_#111] space-y-6">
                  {result.forecast?.metrics?.error ? (
                    <div className="flex items-center justify-center h-48 bg-gray-50 border-2 border-dashed border-gray-300">
                      <p className="text-gray-500 font-bold">{result.forecast.metrics.error}</p>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">Proyección y Predicción Temporal</h3>
                          <p className="text-xs text-gray-500">Estimación de tendencia futura basada en series de tiempo</p>
                        </div>
                        <div className="flex gap-2">
                          {result.forecast?.metrics?.confianza && (
                            <span className={`px-3 py-1 text-xs font-bold ${result.forecast.metrics.confianza === 'Alta' ? 'bg-emerald-50 text-emerald-700' : result.forecast.metrics.confianza === 'Media' ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-700'}`}>
                              Confianza: {result.forecast.metrics.confianza}
                            </span>
                          )}
                          {result.forecast?.metrics?.tendencia_pct !== undefined && (
                            <span className={`px-3 py-1 rounded-none text-xs font-bold ${
                              result.forecast.metrics.tendencia_pct >= 0
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-red-50 text-red-700'
                            }`}>
                              Tendencia: {result.forecast.metrics.tendencia_pct}%
                            </span>
                          )}
                        </div>
                      </div>
                      <ChartRenderer key={`forecast-${result.filename}`} chartData={result.forecast?.chart_data} height={420} />
                      <div className="mt-4 p-3 bg-blue-50 border-l-4 border-blue-500 text-xs text-blue-800">
                        <strong>Aviso:</strong> Esta proyección se basa exclusivamente en el comportamiento histórico de tus datos usando el modelo {result.forecast?.metrics?.motor || 'Predictivo'} y no es una garantía del futuro. 
                        {result.forecast?.metrics?.mae !== undefined && ` Margen de error histórico (MAE): ${result.forecast.metrics.mae}`}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Tab 2: Segmentos */}
              {activeTab === 2 && (
                <div className="grid md:grid-cols-2 gap-6">
                  {result.segmentation?.metrics?.error ? (
                    <div className="col-span-2 flex items-center justify-center h-48 bg-gray-50 border-2 border-dashed border-gray-300">
                      <p className="text-gray-500 font-bold">{result.segmentation.metrics.error}</p>
                    </div>
                  ) : (
                    <>
                      <div className="bg-white p-6 rounded-none border border-[#111] border-2 shadow-[4px_4px_0px_#111]">
                        <h4 className="text-base font-bold text-gray-900 mb-2">Mapa de Segmentación 2D (PCA)</h4>
                        <ChartRenderer key={`seg-scatter-${result.filename}`} chartData={result.segmentation?.scatter_data} />
                      </div>
                      <div className="bg-white p-6 rounded-none border border-[#111] border-2 shadow-[4px_4px_0px_#111]">
                        <h4 className="text-base font-bold text-gray-900 mb-2">Perfil Promedio por Segmento</h4>
                        <ChartRenderer key={`seg-radar-${result.filename}`} chartData={result.segmentation?.radar_data} />
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Tab 3: Anomalías */}
              {activeTab === 3 && (
                <div className="bg-white p-6 sm:p-8 rounded-none border border-[#111] border-2 shadow-[4px_4px_0px_#111] space-y-6">
                  {result.anomalies?.metrics?.error ? (
                    <div className="flex items-center justify-center h-48 bg-gray-50 border-2 border-dashed border-gray-300">
                      <p className="text-gray-500 font-bold">{result.anomalies.metrics.error}</p>
                    </div>
                  ) : (
                    <>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Detección de Anomalías (Isolation Forest)</h3>
                        <p className="text-xs text-gray-500">Registros atípicos marcados para auditoría</p>
                      </div>
                      <ChartRenderer key={`anom-${result.filename}`} chartData={result.anomalies?.chart_data} height={400} />
                      {result.anomalies?.metrics?.anomalias_detalle && (
                        <div className="pt-4 border-t border-[#111] border-2">
                          <h5 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3">
                            Detalle de casos detectados:
                          </h5>
                          <div className="space-y-2">
                            {result.anomalies.metrics.anomalias_detalle.map((d: string, idx: number) => (
                              <div key={idx} className="p-3 bg-red-50/50 border border-red-100 rounded-none text-xs text-red-800">
                                ⚠️ {d}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Tab 4: Factores Clave */}
              {activeTab === 4 && (
                <div className="grid md:grid-cols-2 gap-6">
                  {result.feature_importance?.metrics?.error ? (
                    <div className="col-span-2 flex items-center justify-center h-48 bg-gray-50 border-2 border-dashed border-gray-300">
                      <p className="text-gray-500 font-bold">{result.feature_importance.metrics.error}</p>
                    </div>
                  ) : (
                    <>
                      <div className="bg-white p-6 rounded-none border border-[#111] border-2 shadow-[4px_4px_0px_#111]">
                        <h4 className="text-base font-bold text-gray-900 mb-2">Impacto de Variables (LightGBM)</h4>
                        <ChartRenderer key={`feat-imp-${result.filename}`} chartData={result.feature_importance?.chart_importance} />
                      </div>
                      <div className="bg-white p-6 rounded-none border border-[#111] border-2 shadow-[4px_4px_0px_#111]">
                        <h4 className="text-base font-bold text-gray-900 mb-2">Explicabilidad SHAP</h4>
                        <ChartRenderer key={`feat-shap-${result.filename}`} chartData={result.feature_importance?.chart_shap} />
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Tab 5: Informe IA */}
              {activeTab === 5 && (
                <InsightPanel
                  text={result.narrative?.text || 'Generando informe...'}
                  source={result.narrative?.source}
                />
              )}

              {/* Tab 6: Asistente IA — always rendered to persist chat state across tab changes */}
              <div className={activeTab === 6 ? '' : 'hidden'}>
                <DataChatbot
                  context={result}
                  charts={result.charts || []}
                  messages={chatMessages}
                  onMessagesChange={setChatMessages}
                  onChartOverride={handleChartOverride}
                />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#fafafc] flex items-center justify-center text-gray-400">Cargando...</div>}>
      <DashboardInner />
    </Suspense>
  );
}
