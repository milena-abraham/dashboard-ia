'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { TriangleAlert, ShieldAlert } from 'lucide-react';
import { ChartSchema, AnomalyMetricsSchema } from '@/types/analysis';
import ChartErrorBoundary from '@/components/ChartErrorBoundary';

const DynamicChartRenderer = dynamic(() => import('@/components/DynamicChartRenderer'), { ssr: false });

interface AnomaliesSectionProps {
  chartData?: ChartSchema;
  metrics?: AnomalyMetricsSchema;
  filename: string;
}

export const AnomaliesSection: React.FC<AnomaliesSectionProps> = ({
  chartData,
  metrics,
  filename,
}) => {
  if (!chartData) return null;

  const count = metrics?.nAnomalias ?? 0;
  const pct = metrics?.pctAnomalias ?? 0;

  return (
    <div className="md:col-span-12 bg-white p-6 md:p-8 rounded-none border border-[#111] border-2 shadow-[4px_4px_0px_#111]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#ff6b6b] rounded-none border border-[#111]">
            <TriangleAlert className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-black uppercase tracking-tight text-gray-900">
              Valores Atípicos (Anomalías)
            </h3>
            <p className="text-xs text-gray-500 font-medium">
              {chartData.metadata?.insightSubtitle || 'Detección no supervisada con Isolation Forest'}
            </p>
          </div>
        </div>

        {count > 0 && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-[#111] bg-[#fff5f5] shadow-[2px_2px_0px_#111] text-xs font-bold text-gray-900 self-start sm:self-auto">
            <ShieldAlert className="w-4 h-4 text-[#ff6b6b]" />
            <span>
              <strong>{count}</strong> casos atípicos ({pct}%)
            </span>
          </div>
        )}
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

