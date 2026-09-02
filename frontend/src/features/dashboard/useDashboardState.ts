import { Message as ChatMessage } from '@/components/DataChatbot';
import { useState, useEffect } from 'react';
import { AnalysisResponseSchema } from '@/types/analysis';
import { analyzeFile, generateNarrative } from '@/lib/api';
import toast from 'react-hot-toast';

export function useDashboardState() {
  const [file, setFile] = useState<File | null>(null);
  const [filesQueue, setFilesQueue] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResponseSchema | null>(null);
  const [isNarrativeExpanded, setIsNarrativeExpanded] = useState(true);
  const [generatingNarrative, setGeneratingNarrative] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

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
            filename: result.filename
          });
          setResult((prev: any) => ({
            ...prev,
            narrative: {
              text: narRes.text,
              source: narRes.source
            }
          }));
        } catch (err) {
          console.error("Error fetching narrative:", err);
          setResult((prev: any) => ({
            ...prev,
            narrative: { text: "No se pudo generar la narrativa.", source: "error" }
          }));
        } finally {
          setGeneratingNarrative(false);
        }
      }
    }
    fetchNarrative();
  }, [result]);

  const handleFileUpload = (files: File[]) => {
    setFilesQueue(files);
  };

  const processFile = async (f: File) => {
    setLoading(true);
    setFile(f);
    setResult(null);
    setChatMessages([]);
    try {
      const res = await analyzeFile(f, undefined, undefined, undefined);
      setResult(res);
      toast.success('Análisis completado');
    } catch (err: any) {
      toast.error(err.message || 'Error al analizar el archivo');
      setFile(null);
    } finally {
      setLoading(false);
      setFilesQueue((prev) => prev.slice(1));
    }
  };

  useEffect(() => {
    if (filesQueue.length > 0 && !loading) {
      processFile(filesQueue[0]);
    }
  }, [filesQueue, loading]);

  const handleChartOverride = (index: number, newChartData: any) => {
    setResult((prev) => {
      if (!prev) return prev;
      const newCharts = [...prev.charts];
      newCharts[index] = newChartData;
      return { ...prev, charts: newCharts };
    });
  };

  return {
    file,
    loading,
    result,
    isNarrativeExpanded,
    setIsNarrativeExpanded,
    chatMessages,
    setChatMessages,
    handleFileUpload,
    handleChartOverride
  };
}
