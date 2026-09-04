import React from 'react';
import dynamic from 'next/dynamic';
import { Users, Target } from 'lucide-react';
import { ChartSchema } from '@/types/analysis';
import ChartErrorBoundary from '@/components/ChartErrorBoundary';

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
      <div className="bg-white p-6 rounded-none border border-[#111] border-2 shadow-[4px_4px_0px_#111]">
        <div className="flex items-center gap-3 mb-6">
          <Users className="w-5 h-5 text-mio-violet" />
          <h3 className="text-xl font-black uppercase tracking-tight">Distribución</h3>
        </div>
        <div className="relative w-full min-h-[400px]">
          <ChartErrorBoundary>
            <DynamicChartRenderer
              key={`seg-scatter-${filename}`}
              payload={scatterData}
            />
          </ChartErrorBoundary>
        </div>
      </div>
      <div className="bg-white p-6 rounded-none border border-[#111] border-2 shadow-[4px_4px_0px_#111]">
        <div className="flex items-center gap-3 mb-6">
          <Target className="w-5 h-5 text-mio-violet" />
          <h3 className="text-xl font-black uppercase tracking-tight">Perfil (Radar)</h3>
        </div>
        <div className="relative w-full min-h-[400px]">
          <ChartErrorBoundary>
            <DynamicChartRenderer
              key={`seg-radar-${filename}`}
              payload={radarData}
            />
          </ChartErrorBoundary>
        </div>
      </div>
    </div>
  );
};
