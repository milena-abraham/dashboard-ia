import React from 'react';
import dynamic from 'next/dynamic';
import { TriangleAlert } from 'lucide-react';
import { ChartSchema } from '@/types/analysis';
import ChartErrorBoundary from '@/components/ChartErrorBoundary';

const DynamicChartRenderer = dynamic(() => import('@/components/DynamicChartRenderer'), { ssr: false });

interface AnomaliesSectionProps {
  chartData?: ChartSchema;
  filename: string;
}

export const AnomaliesSection: React.FC<AnomaliesSectionProps> = ({
  chartData,
  filename,
}) => {
  if (!chartData) return null;

  return (
    <div className="md:col-span-12 bg-white p-6 md:p-8 rounded-none border border-[#111] border-2 shadow-[4px_4px_0px_#111]">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-[#ff6b6b] rounded-none">
          <TriangleAlert className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-xl font-black uppercase tracking-tight">
          Valores Atípicos (Anomalías)
        </h3>
      </div>
      <div className="relative w-full h-[420px]">
        <ChartErrorBoundary>
          <DynamicChartRenderer
            key={`anom-${filename}`}
            payload={chartData}
            height={420}
          />
        </ChartErrorBoundary>
      </div>
    </div>
  );
};
