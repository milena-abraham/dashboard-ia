import React from 'react';
import DataQualityBadge from '@/components/DataQualityBadge';
import { AnalysisResponseSchema } from '@/types/analysis';
import { Download, Presentation, RotateCcw } from 'lucide-react';

interface DashboardHeaderProps {
  result: AnalysisResponseSchema;
  downloadingPdf: boolean;
  downloadingPptx: boolean;
  onDownloadPdf: () => void;
  onDownloadPptx: () => void;
  onReset: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  result,
  downloadingPdf,
  downloadingPptx,
  onDownloadPdf,
  onDownloadPptx,
  onReset,
}) => {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-6 rounded-none border border-[#111] border-2 shadow-[4px_4px_0px_#111]">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <h2 className="text-2xl font-bold text-gray-900">{result.filename}</h2>
          {result.profile && (
            <DataQualityBadge
              score={result.profile.qualityScore}
              label={result.profile.qualityLabel}
            />
          )}
        </div>
        <p className="text-sm text-gray-500">
          Analizando foco en: <span className="font-semibold text-mio-violet">"{result.targetCol || 'Automático'}"</span> • {result.profile?.nRows ?? 0} filas • {result.profile?.nCols ?? 0} columnas
        </p>
      </div>

      <div className="flex items-center gap-2.5 w-full md:w-auto">
        <button
          onClick={onDownloadPptx}
          disabled={downloadingPptx}
          className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-none bg-mio-lime hover:bg-mio-lime/90 text-gray-900 text-xs font-semibold shadow-[4px_4px_0px_#111] transition-all disabled:opacity-50"
        >
          <Presentation className="w-4 h-4" />
          <span>{downloadingPptx ? 'Generando PPTX...' : 'Exportar PPTX'}</span>
        </button>

        <button
          onClick={onDownloadPdf}
          disabled={downloadingPdf}
          className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-none bg-mio-violet hover:bg-mio-violet/90 text-white text-xs font-semibold shadow-[4px_4px_0px_#111] transition-all disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          <span>{downloadingPdf ? 'Generando PDF...' : 'Exportar PDF'}</span>
        </button>

        <button
          onClick={onReset}
          className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-none bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Cargar otro archivo</span>
        </button>
      </div>
    </div>
  );
};
