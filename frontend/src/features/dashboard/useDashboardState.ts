'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';

import { auth, db } from '@/lib/firebase';
import { logSystemEvent } from '@/lib/logger';
import { analyzeFile, generateNarrative, exportPDF, exportPPTX } from '@/lib/api';
import { AnalysisResponseSchema, ChartSchema } from '@/types/analysis';
import { Message as ChatMessage } from '@/components/DataChatbot';

const ADMIN_EMAILS = ['tadeomunozgarces@gmail.com', 'milenapabraham@gmail.com'];

export function useDashboardState() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [filesQueue, setFilesQueue] = useState<File[]>([]);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [activeFileSize, setActiveFileSize] = useState<number | undefined>(undefined);

  const [targetCol, setTargetCol] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResponseSchema | null>(null);

  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [downloadingPptx, setDownloadingPptx] = useState(false);
  const [savingProject, setSavingProject] = useState(false);
  const [chatLogged, setChatLogged] = useState(false);

  const [isNarrativeExpanded, setIsNarrativeExpanded] = useState(true);
  const [generatingNarrative, setGeneratingNarrative] = useState(false);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content:
        '¡Hola! Soy **Asistente MIO**. He analizado tu archivo. ¿Qué te gustaría saber sobre los resultados? También podés pedirme que *modifique un gráfico*.',
    },
  ]);

  const [chartOverrides, setChartOverrides] = useState<Record<number, any>>({});

  const searchParams = useSearchParams();

  // 1. Firebase Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. Restore saved project from localStorage or Firebase
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

        if (authLoading) return;

        if (user) {
          setLoading(true);
          const docRef = doc(db, 'users', user.uid, 'analyses', projectId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists() && docSnap.data().result_data) {
            const dataStr = docSnap.data().result_data;
            setResult(JSON.parse(dataStr));
            try {
              localStorage.setItem(`mio_result_${projectId}`, dataStr);
            } catch (e) {
              console.warn('LocalStorage error:', e);
            }
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

  // 2b. Restore active analysis on page reload without re-uploading file
  useEffect(() => {
    const projectId = searchParams.get('project');
    if (projectId || result || loading) return;

    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem('mio_active_analysis');
    if (saved) {
      try {
        const { filename, targetCol: savedTarget, fileSize: savedSize } = JSON.parse(saved);
        if (savedSize) setActiveFileSize(savedSize);
        if (filename) {
          setLoading(true);
          if (savedTarget) setTargetCol(savedTarget);
          analyzeFile(null, undefined, undefined, savedTarget || undefined, filename)
            .then((freshData) => {
              setResult(freshData);
              toast.success(`Datos actualizados desde el backend (${filename})`, { id: 'restore-analysis' });
            })
            .catch((err) => {
              console.warn('No se pudo recargar el archivo activo:', err);
              localStorage.removeItem('mio_active_analysis');
            })
            .finally(() => {
              setLoading(false);
            });
        }
      } catch (err) {
        console.error('Error reading mio_active_analysis:', err);
      }
    }
  }, [searchParams, result, loading]);

  // 3. Narrative generation effect
  useEffect(() => {
    async function fetchNarrative() {
      if (result && result.narrative?.source === 'pending' && !generatingNarrative) {
        setGeneratingNarrative(true);
        try {
          const narRes = await generateNarrative({
            profile: result.profile,
            kpis: result.kpis,
            anomalies: result.anomalies?.metrics,
            forecast: result.forecast?.metrics,
            segmentation: result.segmentation?.metrics,
            feature_importance: result.featureImportance?.metrics,
            target_col: result.targetCol,
            filename: result.filename,
          });
          setResult((prev: any) => {
            if (!prev) return prev;
            return {
              ...prev,
              narrative: {
                text: narRes.text,
                source: narRes.source,
              },
            };
          });
        } catch (err) {
          console.error('Error fetching narrative:', err);
          setResult((prev: any) => {
            if (!prev) return prev;
            return {
              ...prev,
              narrative: { text: 'No se pudo generar la narrativa.', source: 'error' },
            };
          });
        } finally {
          setGeneratingNarrative(false);
        }
      }
    }
    fetchNarrative();
  }, [result, generatingNarrative]);

  // 4. Process files queue
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
        const data = await analyzeFile(file, undefined, undefined, targetCol || undefined);
        setResult(data);
        setActiveFileSize(file.size);
        try {
          localStorage.setItem('mio_active_analysis', JSON.stringify({
            filename: data.filename,
            targetCol: data.targetCol || targetCol || '',
            fileSize: file.size,
          }));
        } catch (storageErr) {
          console.warn('LocalStorage error:', storageErr);
        }
        toast.success(`¡Análisis de ${file.name} completado con éxito!`);

        const metricsPayload = {
          forecast: data.forecast?.metrics || {},
          anomalies: data.anomalies?.metrics || {},
          features: data.featureImportance?.metrics || {},
          segmentation: data.segmentation?.metrics || {},
        };
        logSystemEvent('analysis_success', {
          filename: file.name,
          uid: user?.uid,
          metrics: metricsPayload,
        });

        if (user) {
          try {
            const savePromise = addDoc(collection(db, 'users', user.uid, 'analyses'), {
              filename: data.filename || 'dataset',
              targetCol: data.targetCol || (data as any).target_column || '',
              created_at: serverTimestamp(),
              result_data: JSON.stringify(data),
            });
            const timeout = new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Timeout')), 8000)
            );
            const docRef = ((await Promise.race([savePromise, timeout])) as any);
            if (docRef?.id) {
              try {
                localStorage.setItem(`mio_result_${docRef.id}`, JSON.stringify(data));
              } catch (storageErr) {
                console.warn('localStorage full');
              }
            }
            logSystemEvent('project_saved', { uid: user.uid, filename: data.filename, auto: true });
            toast.success('💾 Guardado automáticamente en Mis Proyectos');
          } catch (e) {
            console.error('Auto-save error:', e);
          }
        }
      } catch (err: any) {
        console.error(err);
        logSystemEvent('analysis_error', {
          filename: file.name,
          error: err.message,
          uid: user?.uid,
        });
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
    setFilesQueue([]);
  };

  const handleDownloadPdf = async () => {
    if (!result) return;
    setDownloadingPdf(true);
    try {
      const blob = await exportPDF({
        filename: result.filename,
        targetCol: result.targetCol,
        kpis: result.kpis,
        narrative_text: result.narrative?.text || '',
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
        targetCol: result.targetCol,
        kpis: result.kpis,
        narrative_text: result.narrative?.text || '',
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
    try {
      localStorage.removeItem('mio_active_analysis');
    } catch (e) {}
    setFilesQueue([]);
    setResult(null);
    setActiveFileSize(undefined);
    setTargetCol('');
    setChatLogged(false);
    setChartOverrides({});
    setChatMessages([
      {
        id: '1',
        role: 'assistant',
        content:
          '¡Hola! Soy **Asistente MIO**. He analizado tu archivo. ¿Qué te gustaría saber sobre los resultados? También podés pedirme que *modifique un gráfico*.',
      },
    ]);
  };

  const handleRefresh = async () => {
    if (!result?.filename) return;
    if (!activeFileSize && result?.profile?.nRows) {
      setActiveFileSize(result.profile.nRows * 95);
    }
    setLoading(true);
    try {
      const freshData = await analyzeFile(
        null,
        undefined,
        undefined,
        targetCol || result.targetCol || undefined,
        result.filename
      );
      setResult(freshData);
      toast.success('Gráficos y análisis recalculados con el backend');
    } catch (err: any) {
      toast.error('Error al refrescar análisis: ' + (err.message || 'Desconocido'));
    } finally {
      setLoading(false);
    }
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
        targetCol: result.targetCol || (result as any).target_column || '',
        kpis: result.kpis || {},
        qualityScore: result.profile?.qualityScore ?? 0,
        narrative_text: result.narrative?.text?.slice(0, 500) || '',
        created_at: serverTimestamp(),
      });
      const timeout = new Promise((_, reject) =>
        setTimeout(
          () =>
            reject(
              new Error(
                'Timeout: Firestore no respondió. Verificá los permisos en la consola de Firebase.'
              )
            ),
          8000
        )
      );
      const docRef = ((await Promise.race([savePromise, timeout])) as any);

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
    setChartOverrides((prev) => ({ ...prev, [index]: chartData }));
    toast.success(`✏️ Gráfico ${index + 1} actualizado por el Asistente IA`);
  };

  const handleLoadSample = (sampleFile: File, sampleTarget: string) => {
    setFilesQueue([sampleFile]);
    setTargetCol(sampleTarget);
  };

  const effectiveCharts: ChartSchema[] = (result?.charts || []).map((c, i) => chartOverrides[i] || c);
  const isAdmin = Boolean(user?.email && ADMIN_EMAILS.includes(user.email));

  return {
    user,
    authLoading,
    isAdmin,
    filesQueue,
    setFilesQueue,
    currentFileIndex,
    uploadProgress,
    isUploading,
    activeFileSize,
    targetCol,
    setTargetCol,
    loading,
    result,
    downloadingPdf,
    downloadingPptx,
    savingProject,
    isNarrativeExpanded,
    setIsNarrativeExpanded,
    chatMessages,
    setChatMessages,
    chartOverrides,
    effectiveCharts,
    handleStartAnalysis,
    handleDownloadPdf,
    handleDownloadPptx,
    handleReset,
    handleRefresh,
    handleSaveProject,
    handleChartOverride,
    handleLoadSample,
  };
}
