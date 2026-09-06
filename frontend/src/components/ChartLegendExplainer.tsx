import React, { useState } from 'react';
import { Info, ChevronDown, ChevronUp } from 'lucide-react';

export interface ChartLegendExplainerProps {
  whatItDoes: string;
  whatItShows: string;
  actionHint?: string;
  collapsible?: boolean;
  defaultOpen?: boolean;
}

export const ChartLegendExplainer: React.FC<ChartLegendExplainerProps> = ({
  whatItDoes,
  whatItShows,
  actionHint,
  collapsible = false,
  defaultOpen = true,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="mt-4 border-2 border-[#111] bg-[#fafafc] p-3 sm:p-4 text-xs shadow-[2px_2px_0px_#111]">
      <div 
        className={`flex items-center justify-between gap-2 ${collapsible ? 'cursor-pointer select-none' : ''}`}
        onClick={() => collapsible && setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 flex items-center justify-center bg-mio-violet text-white font-bold text-[10px] border border-[#111]">
            <Info className="w-3.5 h-3.5" />
          </div>
          <span className="font-mono font-black uppercase tracking-wider text-gray-900 text-[11px]">
            Guía de Interpretación
          </span>
        </div>
        {collapsible && (
          <button className="text-gray-500 hover:text-gray-900" aria-label="Toggle explainer">
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        )}
      </div>

      {isOpen && (
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-[#111]/15">
          <div className="bg-white p-2.5 border border-[#111]/30 flex flex-col justify-between">
            <div>
              <span className="font-mono font-bold text-gray-900 uppercase tracking-tight block mb-1 text-[10.5px]">
                Propósito del gráfico
              </span>
              <p className="text-gray-600 leading-relaxed font-medium">
                {whatItDoes}
              </p>
            </div>
          </div>

          <div className="bg-white p-2.5 border border-[#111]/30 flex flex-col justify-between">
            <div>
              <span className="font-mono font-bold text-gray-900 uppercase tracking-tight block mb-1 text-[10.5px]">
                Interpretación y lectura
              </span>
              <p className="text-gray-600 leading-relaxed font-medium">
                {whatItShows}
              </p>
            </div>
          </div>

          {actionHint && (
            <div className="md:col-span-2 bg-[#f4f4f6] p-2.5 border border-[#111]/30 flex items-start gap-2">
              <p className="text-gray-800 font-medium text-[11px] leading-snug">
                <strong className="font-mono font-black uppercase text-[10px] text-gray-900 mr-1.5">
                  Acción sugerida:
                </strong>
                {actionHint}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
