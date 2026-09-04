import React from 'react';
import FileUploader from '@/components/FileUploader';
import { Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

interface DashboardUploaderProps {
  filesQueue: File[];
  targetCol: string;
  onFilesSelected: (files: File[]) => void;
  onTargetColChange: (val: string) => void;
  onStartAnalysis: () => void;
  onLoadSampleData: (file: File, target: string) => void;
}

export const DashboardUploader: React.FC<DashboardUploaderProps> = ({
  filesQueue,
  targetCol,
  onFilesSelected,
  onTargetColChange,
  onStartAnalysis,
  onLoadSampleData,
}) => {
  const handleLoadSample = () => {
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
    onLoadSampleData(sampleFile, 'ventas');
    toast.success('Dataset de ejemplo cargado');
  };

  return (
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
        <FileUploader onFileSelect={onFilesSelected} selectedFiles={filesQueue} />

        {filesQueue.length === 0 && (
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={handleLoadSample}
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
                onChange={(e) => onTargetColChange(e.target.value)}
                placeholder="Ej: ventas, ingreso, precio"
                className="w-full px-3.5 py-2 border-2 border-[#111] rounded-none text-sm focus:outline-none focus:ring-2 focus:ring-mio-violet text-gray-900"
              />
            </div>

            <button
              onClick={onStartAnalysis}
              className="w-full sm:w-auto px-8 py-2.5 rounded-none bg-mio-lime text-gray-900 font-bold text-sm border-2 border-[#111] shadow-[4px_4px_0px_#111] hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>
                {filesQueue.length > 1
                  ? `Analizar ${filesQueue.length} archivos`
                  : 'Ejecutar Análisis Completo'}
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
