'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import FileUploader from '@/components/FileUploader';
import KPICards from '@/components/KPICards';

import ChartErrorBoundary from '@/components/ChartErrorBoundary';
import dynamic from 'next/dynamic';
const DynamicChartRenderer = dynamic(() => import('@/components/DynamicChartRenderer'), { ssr: false });
import InsightPanel from '@/components/InsightPanel';
import DataChatbot, { Message as ChatMessage } from '@/components/DataChatbot';
import LoadingAnalysis from '@/components/LoadingAnalysis';
import DataQualityBadge from '@/components/DataQualityBadge';
import { analyzeFile, exportPDF, exportPPTX } from '@/lib/api';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import {
  
  Bot,
  TrendingUp,
  Users,
  TriangleAlert,
  Target,
  FileText,
  Download,
  Presentation,
  RotateCcw,
  Sparkles,
  Save,
} from 'lucide-react';
import { AnalysisResult } from '@/types/analysis';

import { logSystemEvent } from '@/lib/logger';

function DashboardInner() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [filesQueue, setFilesQueue] = useState<File[]>([]);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const [targetCol, setTargetCol] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [downloadingPptx, setDownloadingPptx] = useState(false);
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

  // Restore saved project from localStorage or Firebase
  useEffect(() => {
    const projectId = searchParams.get('project');
    if (!projectId || result) return;

    const loadProjectData = async () => {
      try {
        const stored = localStorage.getItem(`mio_result_${projectId}`);
        if (stored) {
          setResult(JSON.parse(stored));
          toast.success('📂 Proyecto restaurado al instante');
          return;
        }

        if (authLoading) return; // Wait for Firebase Auth

        if (user) {
          setLoading(true);
          const docRef = doc(db, 'users', user.uid, 'analyses', projectId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists() && docSnap.data().result_data) {
            const dataStr = docSnap.data().result_data;
            setResult(JSON.parse(dataStr));
            try { localStorage.setItem(`mio_result_${projectId}`, dataStr); } catch(e) {}
            toast.success('☁️ Proyecto descargado de la nube');
          } else {
            toast.error('El proyecto fue eliminado o no existe en la nube.');
          }
        } else {
          toast.error('Iniciá sesión para abrir proyectos.');
        }
      } catch (e) {
        console.error('Error loading project:', e);
        toast.error('Error al restaurar el proyecto desde la nube.');
      } finally {
        setLoading(false);
      }
    };

    loadProjectData();
  }, [searchParams, user, authLoading, result]);

  // Log chat opened
  useEffect(() => {
    if (activeTab === 6 && !chatLogged) {
      logSystemEvent('chat_session_started', { uid: user?.uid });
      setChatLogged(true);
    }
  }, [activeTab, chatLogged, user]);

  



  const processQueue = async (queue: File[]) => {
    for (let i = 0; i < queue.length; i++) {
      setCurrentFileIndex(i);
      const file = queue[i];
      setLoading(true);
      setChatLogged(false);
      setChartOverrides({});
      setUploadProgress(0);
      setIsUploading(false);
      
      try {
        let data = await analyzeFile(file, undefined, undefined, targetCol || undefined);
        
        setResult(data);
        toast.success(`¡Análisis de ${file.name} completado con éxito!`);
        const metricsPayload = {
          forecast: data.forecast?.metrics || {},
          anomalies: data.anomalies?.metrics || {},
          features: data.feature_importance?.metrics || {},
          segmentation: data.segmentation?.metrics || {}
        };
        logSystemEvent('analysis_success', { filename: file.name, uid: user?.uid, metrics: metricsPayload });
        
        if (user) {
          try {
            const savePromise = addDoc(collection(db, 'users', user.uid, 'analyses'), {
              filename: data.filename || 'dataset',
              target_col: data.target_col || data.target_column || '',
              created_at: serverTimestamp(),
              result_data: JSON.stringify(data)
            });
            const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 8000));
            const docRef = await Promise.race([savePromise, timeout]) as any;
            if (docRef?.id) {
              try {
                localStorage.setItem(`mio_result_${docRef.id}`, JSON.stringify(data));
              } catch (storageErr) {
                console.warn('localStorage full');
              }
            }
            logSystemEvent('project_saved_auto', { uid: user.uid, filename: data.filename });
            toast.success('💾 Guardado automáticamente en Mis Proyectos');
          } catch (e) {
            console.error('Auto-save error:', e);
          }
        }
      } catch (err: any) {
        console.error(err);
        logSystemEvent('analysis_error', { filename: file.name, error: err.message, uid: user?.uid });
        toast.error(err.message || `Error al analizar ${file.name}`);
      } finally {
        setLoading(false);
      }
    }
  };
  const handleStartAnalysis = async () => {
    if (filesQueue.length === 0) {
      toast.error('Por favor seleccioná un archivo primero.');
      return;
    }
    await processQueue(filesQueue);
    // Vaciamos la cola al terminar para que el usuario pueda subir más si quiere, o lo dejamos.
    setFilesQueue([]);
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

  
  const handleDownloadPptx = async () => {
    if (!result) return;
    setDownloadingPptx(true);
    try {
      const blob = await exportPPTX({
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
      a.download = `presentacion_${result.filename}.pptx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success('PPTX descargado exitosamente');
    } catch (err) {
      console.error(err);
      toast.error('Error al generar el PPTX.');
    } finally {
      setDownloadingPptx(false);
    }
  };

  const handleReset = () => {
    setFilesQueue([]);
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
    if (!result || !result.charts || index < 0 || index >= result.charts.length) {
      toast.error('Asistente IA: No pude identificar ese gráfico.');
      return;
    }
    setChartOverrides(prev => ({ ...prev, [index]: chartData }));
    toast.success(`✏️ Gráfico ${index + 1} actualizado por el Asistente IA`);
  };

  const ADMIN_EMAILS = ['tadeomunozgarces@gmail.com', 'milenapabraham@gmail.com'];
  const isAdmin = user?.email && ADMIN_EMAILS.includes(user.email);


  return (
    <div className="min-h-screen bg-[#fafafc] flex flex-col">
      <Navbar />

      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        {loading ? (
          <LoadingAnalysis fileSize={filesQueue[currentFileIndex]?.size} isUploading={isUploading} uploadProgress={uploadProgress} currentFile={currentFileIndex + 1} totalFiles={filesQueue.length} />
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
              <FileUploader onFileSelect={(files) => setFilesQueue(files)} selectedFiles={filesQueue} />

              {filesQueue.length === 0 && (
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
                      setFilesQueue([sampleFile]);
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

              {filesQueue.length > 0 && (
                <div className="mt-6 pt-6 border-t-2 border-[#111] flex flex-col sm:flex-row items-end justify-between gap-4">
                  <div className="w-full sm:w-auto flex-1 max-w-sm">
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                      Métrica objetivo (opcional)
                    </label>
                    <input
                      type="text"
                      value={targetCol}
                      onChange={(e) => setTargetCol(e.target.value)}
                      placeholder="Ej: ventas, ingreso, precio"
                      className="w-full px-3.5 py-2 border-2 border-[#111] rounded-none text-sm focus:outline-none focus:ring-2 focus:ring-mio-violet text-gray-900"
                    />
                  </div>

                  <button
                    onClick={handleStartAnalysis}
                    className="w-full sm:w-auto px-8 py-2.5 rounded-none bg-mio-lime text-gray-900 font-bold text-sm border-2 border-[#111] shadow-[4px_4px_0px_#111] hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{filesQueue.length > 1 ? `Analizar ${filesQueue.length} archivos` : "Ejecutar Análisis Completo"}</span>
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
                  onClick={handleDownloadPptx}
                  disabled={downloadingPptx}
                  className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-none bg-mio-lime hover:bg-mio-lime/90 text-gray-900 text-xs font-semibold shadow-[4px_4px_0px_#111] transition-all disabled:opacity-50"
                >
                  <Presentation className="w-4 h-4" />
                  <span>{downloadingPptx ? 'Generando PPTX...' : 'Exportar PPTX'}</span>
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

            {/* Unified Bento Layout */}
            <div className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* Executive Summary at the top */}
                {result.narrative && (
                  <div className="md:col-span-12 bg-white p-6 md:p-8 rounded-none border border-[#111] border-2 shadow-[4px_4px_0px_#111]">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-mio-violet rounded-none">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-xl font-black uppercase tracking-tight">Resumen Ejecutivo</h3>
                    </div>
                    <div className="prose prose-sm md:prose-base max-w-none text-gray-700">
                      <p className="whitespace-pre-line leading-relaxed">{result.narrative.text}</p>
                    </div>
                  </div>
                )}
                
                {/* Exploratory Charts */}
                {result.charts && result.charts.length > 0 && result.charts.map((c, i) => {
                  const spanClass = i === 0 ? "md:col-span-12 lg:col-span-8" : 
                                  i === 1 ? "md:col-span-12 lg:col-span-4" : 
                                  "md:col-span-6 lg:col-span-4";
                  return (
                    <div key={i} className={`bg-white p-6 flex flex-col rounded-none border border-[#111] border-2 shadow-[4px_4px_0px_#111] transition-transform hover:-translate-y-1 hover:shadow-[6px_6px_0px_#111] ${spanClass}`}>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-lg font-black tracking-tight text-gray-900 leading-tight uppercase">{c.metadata?.title}</h4>
                      </div>
                      <p className="text-sm text-gray-500 mb-6 flex-1 font-medium">{c.metadata?.insight_subtitle}</p>
                      <div className="mt-auto relative w-full flex-1 min-h-[300px]">
                          <DynamicChartRenderer key={result.filename + i} payload={c} height="100%" />
                      </div>
                    </div>
                  );
                })}

                {/* Forecast (if exists) */}
                {result.forecast?.chart_data && (
                  <div className="md:col-span-12 bg-white p-6 md:p-8 rounded-none border border-[#111] border-2 shadow-[4px_4px_0px_#111]">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-mio-violet rounded-none">
                        <TrendingUp className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-xl font-black uppercase tracking-tight">Proyecciones Inteligentes</h3>
                    </div>
                    <div className="relative w-full min-h-[420px]">
                      <ChartErrorBoundary><DynamicChartRenderer key={`forecast-${result.filename}`} payload={result.forecast?.chart_data} height={420} /></ChartErrorBoundary>
                    </div>
                  </div>
                )}

                {/* Segmentation (if exists) */}
                {result.segmentation?.scatter_data && result.segmentation?.radar_data && (
                  <div className="md:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-none border border-[#111] border-2 shadow-[4px_4px_0px_#111]">
                      <div className="flex items-center gap-3 mb-6">
                        <Users className="w-5 h-5 text-mio-violet" />
                        <h3 className="text-xl font-black uppercase tracking-tight">Distribución</h3>
                      </div>
                      <div className="relative w-full min-h-[400px]">
                        <ChartErrorBoundary><DynamicChartRenderer key={`seg-scatter-${result.filename}`} payload={result.segmentation?.scatter_data} /></ChartErrorBoundary>
                      </div>
                    </div>
                    <div className="bg-white p-6 rounded-none border border-[#111] border-2 shadow-[4px_4px_0px_#111]">
                      <div className="flex items-center gap-3 mb-6">
                        <Target className="w-5 h-5 text-mio-violet" />
                        <h3 className="text-xl font-black uppercase tracking-tight">Perfil (Radar)</h3>
                      </div>
                      <div className="relative w-full min-h-[400px]">
                        <ChartErrorBoundary><DynamicChartRenderer key={`seg-radar-${result.filename}`} payload={result.segmentation?.radar_data} /></ChartErrorBoundary>
                      </div>
                    </div>
                  </div>
                )}

                {/* Anomalies (if exists) */}
                {result.anomalies?.chart_data && (
                  <div className="md:col-span-12 bg-white p-6 md:p-8 rounded-none border border-[#111] border-2 shadow-[4px_4px_0px_#111]">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-[#ff6b6b] rounded-none">
                        <TriangleAlert className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-xl font-black uppercase tracking-tight">Valores Atípicos (Anomalías)</h3>
                    </div>
                    <div className="relative w-full min-h-[400px]">
                      <ChartErrorBoundary><DynamicChartRenderer key={`anom-${result.filename}`} payload={result.anomalies?.chart_data} height={400} /></ChartErrorBoundary>
                    </div>
                  </div>
                )}

                {/* Feature Importance (if exists) */}
                {result.feature_importance?.chart_importance && (
                  <div className="md:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-none border border-[#111] border-2 shadow-[4px_4px_0px_#111]">
                      <div className="flex items-center gap-3 mb-6">
                        <Target className="w-5 h-5 text-mio-violet" />
                        <h3 className="text-xl font-black uppercase tracking-tight">Impacto Base (Gini)</h3>
                      </div>
                      <div className="relative w-full min-h-[420px]">
                        <ChartErrorBoundary><DynamicChartRenderer key={`feat-imp-${result.filename}`} payload={result.feature_importance?.chart_importance} height={420} /></ChartErrorBoundary>
                      </div>
                    </div>
                    {result.feature_importance?.chart_shap && (
                      <div className="bg-white p-6 rounded-none border border-[#111] border-2 shadow-[4px_4px_0px_#111]">
                        <div className="flex items-center gap-3 mb-6">
                          <Target className="w-5 h-5 text-[#bdf559]" />
                          <h3 className="text-xl font-black uppercase tracking-tight">Atribución (SHAP)</h3>
                        </div>
                        <div className="relative w-full min-h-[420px]">
                          <ChartErrorBoundary><DynamicChartRenderer key={`feat-shap-${result.filename}`} payload={result.feature_importance?.chart_shap} height={420} /></ChartErrorBoundary>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
              </div>
            </div>

            {/* AI Assistant Chatbot (Rendered unconditionally at the bottom) */}
            {isAdmin && (
              <div className="mt-8 mb-12">
                 <div className="bg-white p-6 md:p-8 rounded-none border border-[#111] border-2 shadow-[4px_4px_0px_#111]">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-mio-violet rounded-none">
                        <Bot className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-xl font-black uppercase tracking-tight">Asistente Interactivo IA</h3>
                    </div>
                    <DataChatbot context={result} charts={result.charts || []} messages={chatMessages} onMessagesChange={setChatMessages} onChartOverride={handleChartOverride} />
                 </div>
              </div>
            )}
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
