import React from 'react';
import dynamic from 'next/dynamic';
import { PieChart, BarChart3 } from 'lucide-react';
import { ChartSchema } from '@/types/analysis';
import ChartErrorBoundary from '@/components/ChartErrorBoundary';
import { ChartLegendExplainer } from '@/components/ChartLegendExplainer';

const DynamicChartRenderer = dynamic(() => import('@/components/DynamicChartRenderer'), { ssr: false });

interface SegmentationSectionProps {
  scatterData?: ChartSchema;
  radarData?: ChartSchema;
  filename: string;
}

export const SegmentationSection: React.FC<SegmentationSectionProps> = ({
  scatterData,
  radarData,
  filename,
}) => {
  if (!scatterData || !radarData) return null;

  return (
    <div className="md:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-none border border-[#111] border-2 shadow-[4px_4px_0px_#111] flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-6">
            <PieChart className="w-5 h-5 text-mio-violet" />
            <h3 className="text-xl font-black uppercase tracking-tight">
              {scatterData.metadata?.title || 'Distribución de Segmentos'}
            </h3>
          </div>
          <div className="relative w-full h-[460px]">
            <ChartErrorBoundary>
              <DynamicChartRenderer
                key={`seg-dist-${filename}`}
                payload={scatterData}
                height={460}
              />
            </ChartErrorBoundary>
          </div>
        </div>

        <ChartLegendExplainer
          whatItDoes="El algoritmo de aprendizaje no supervisado K-Means agrupa registros con comportamientos afines sin preconceptos humanos."
          whatItShows="La proporción del gráfico circular revela el peso demográfico de cada segmento (ej. grupo mayoritario vs nichos selectos)."
          actionHint="Enfocá recursos en el cluster principal para retención masiva y diseñá programas premium para los grupos de mayor valor."
          collapsible={true}
          defaultOpen={false}
        />
      </div>

      <div className="bg-white p-6 rounded-none border border-[#111] border-2 shadow-[4px_4px_0px_#111] flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-6">
            <BarChart3 className="w-5 h-5 text-mio-violet" />
            <h3 className="text-xl font-black uppercase tracking-tight">
              {radarData.metadata?.title || 'Perfil de Segmentos'}
            </h3>
          </div>
          <div className="relative w-full h-[460px]">
            <ChartErrorBoundary>
              <DynamicChartRenderer
                key={`seg-prof-${filename}`}
                payload={radarData}
                height={460}
              />
            </ChartErrorBoundary>
          </div>
        </div>

        <ChartLegendExplainer
          whatItDoes="Compara las métricas promedio de cada cluster para trazar una radiografía precisa de sus hábitos y preferencias."
          whatItShows="Las barras comparativas destacan las variables donde cada grupo sobresale (ticket alto, sensibilidad a descuentos o frecuencia)."
          actionHint="Creá campañas de marketing segmentadas personalizando el mensaje para la necesidad específica de cada cluster."
          collapsible={true}
          defaultOpen={false}
        />
      </div>
    </div>
  );
};
