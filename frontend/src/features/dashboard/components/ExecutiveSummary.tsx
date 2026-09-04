import React from 'react';
import { FileText } from 'lucide-react';
import { NarrativeSchema } from '@/types/analysis';

interface ExecutiveSummaryProps {
  narrative: NarrativeSchema | null | undefined;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export const ExecutiveSummary: React.FC<ExecutiveSummaryProps> = ({
  narrative,
  isExpanded,
  onToggleExpand,
}) => {
  if (!narrative) return null;

  return (
    <div className="md:col-span-12 bg-white p-6 md:p-8 rounded-none border border-[#111] border-2 shadow-[4px_4px_0px_#111] transition-all">
      <div
        className="flex items-center justify-between mb-4 cursor-pointer"
        onClick={onToggleExpand}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-mio-violet rounded-none">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-xl font-black uppercase tracking-tight">
            Resumen Ejecutivo{' '}
            {narrative.source === 'pending' && (
              <span className="text-sm font-normal normal-case text-gray-500 ml-2 animate-pulse">
                (Generando...)
              </span>
            )}
          </h3>
        </div>
        <button
          type="button"
          className="text-gray-400 hover:text-gray-800 transition-colors"
        >
          {isExpanded ? (
            <span className="text-sm font-bold uppercase underline">Minimizar</span>
          ) : (
            <span className="text-sm font-bold uppercase underline">Expandir</span>
          )}
        </button>
      </div>

      {isExpanded && (
        <div className="prose prose-sm md:prose-base max-w-none text-gray-700 mt-4 border-t border-gray-100 pt-4">
          <p className="whitespace-pre-line leading-relaxed">
            {narrative.text || 'Sin contenido disponible.'}
          </p>
        </div>
      )}
    </div>
  );
};
