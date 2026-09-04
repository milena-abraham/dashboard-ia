import React from 'react';
import dynamic from 'next/dynamic';
import { Target } from 'lucide-react';
import { ChartSchema } from '@/types/analysis';
import ChartErrorBoundary from '@/components/ChartErrorBoundary';

const DynamicChartRenderer = dynamic(() => import('@/components/DynamicChartRenderer'), { ssr: false });

interface FeatureImportanceSectionProps {
  chartImportance?: ChartSchema;
  chartShap?: ChartSchema;
  filename: string;
}

export const FeatureImportanceSection: React.FC<FeatureImportanceSectionProps> = ({
  chartImportance,
  chartShap,
  filename,
}) => {
  if (!chartImportance) return null;

  return (
    <div className="md:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-none border border-[#111] border-2 shadow-[4px_4px_0px_#111]">
        <div className="flex items-center gap-3 mb-6">
          <Target className="w-5 h-5 text-mio-violet" />
          <h3 className="text-xl font-black uppercase tracking-tight">
            Impacto Base (Gini)
          </h3>
        </div>
        <div className="relative w-full h-[420px]">
          <ChartErrorBoundary>
            <DynamicChartRenderer
              key={`feat-imp-${filename}`}
              payload={chartImportance}
              height={420}
            />
          </ChartErrorBoundary>
        </div>
      </div>

      {chartShap && (
        <div className="bg-white p-6 rounded-none border border-[#111] border-2 shadow-[4px_4px_0px_#111]">
          <div className="flex items-center gap-3 mb-6">
            <Target className="w-5 h-5 text-[#bdf559]" />
            <h3 className="text-xl font-black uppercase tracking-tight">
              Atribución (SHAP)
            </h3>
          </div>
          <div className="relative w-full h-[420px]">
            <ChartErrorBoundary>
              <DynamicChartRenderer
                key={`feat-shap-${filename}`}
                payload={chartShap}
                height={420}
              />
            </ChartErrorBoundary>
          </div>
        </div>
      )}
    </div>
  );
};
