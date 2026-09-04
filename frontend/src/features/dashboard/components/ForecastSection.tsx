'use client';

import React, { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { TrendingUp, ShieldCheck } from 'lucide-react';
import { ChartSchema, ForecastMetricsSchema } from '@/types/analysis';
import ChartErrorBoundary from '@/components/ChartErrorBoundary';
import { ForecastTimeRangeFilter, ForecastTimeRange } from './ForecastTimeRangeFilter';
import { ForecastMetricsBar } from './ForecastMetricsBar';

const DynamicChartRenderer = dynamic(() => import('@/components/DynamicChartRenderer'), { ssr: false });

interface ForecastSectionProps {
  chartData?: ChartSchema;
  metrics?: ForecastMetricsSchema;
  filename: string;
}

export const ForecastSection: React.FC<ForecastSectionProps> = ({
  chartData,
  metrics,
  filename,
}) => {
  const [timeRange, setTimeRange] = useState<ForecastTimeRange>('ALL');

  const sourceRows = chartData?.dataset?.source || [];
  const hasMultipleRanges = sourceRows.length > 25;

  const precision = metrics?.precisionPct ?? (metrics?.mape != null ? Math.max(0, 100 - metrics.mape) : 95.0);
  const confidence = metrics?.confianza ?? (precision >= 85 ? 'Alta' : precision >= 70 ? 'Media' : 'Precaución');

  const filteredPayload = useMemo(() => {
    if (!chartData || timeRange === 'ALL' || !hasMultipleRanges) return chartData;
    const source = chartData.dataset?.source || [];

    const firstForecastIdx = source.findIndex((r: any) => r.forecast != null);
    const splitIdx = firstForecastIdx >= 0 ? firstForecastIdx : source.length;
    const splitDateStr = source[Math.max(0, splitIdx - 1)]?.date;
    if (!splitDateStr) return chartData;

    const endDate = new Date(splitDateStr).getTime();
    const daysMap: Record<string, number> = { '3M': 92, '6M': 183, '1Y': 365 };
    const cutoffMs = endDate - (daysMap[timeRange] || 365) * 24 * 60 * 60 * 1000;

    const filtered = source.filter((r: any, idx: number) => {
      if (idx >= splitIdx) return true;
      const t = new Date(r.date).getTime();
      return t >= cutoffMs;
    });

    return {
      ...chartData,
      dataset: {
        ...chartData.dataset,
        source: filtered,
      },
    };
  }, [chartData, timeRange, hasMultipleRanges]);

  if (!chartData) return null;

  return (
    <div className="md:col-span-12 bg-white p-6 md:p-8 rounded-none border border-[#111] border-2 shadow-[4px_4px_0px_#111]">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-mio-violet rounded-none border border-[#111]">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-black uppercase tracking-tight text-gray-900">
                Proyecciones Inteligentes
              </h3>
              {metrics?.frecuencia && (
                <span className="px-2 py-0.5 bg-[#fafafc] border border-[#111] text-[10px] font-black uppercase tracking-wider text-gray-700">
                  {metrics.frecuencia}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 font-medium">
              {chartData.metadata?.insightSubtitle || 'Modelo predictivo regularizado con bandas de confianza'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 self-start lg:self-auto">
          {hasMultipleRanges && (
            <ForecastTimeRangeFilter value={timeRange} onChange={setTimeRange} />
          )}

          {metrics?.confianza && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-[#111] bg-white shadow-[2px_2px_0px_#111] text-xs font-bold">
              <ShieldCheck className="w-4 h-4 text-mio-violet" />
              <span>Confianza: <strong className="uppercase">{confidence}</strong></span>
            </div>
          )}
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="relative w-full h-[450px]">
        <ChartErrorBoundary>
          <DynamicChartRenderer
            key={`forecast-${filename}-${timeRange}`}
            payload={filteredPayload}
            height={450}
          />
        </ChartErrorBoundary>
      </div>

      {/* Modular Prediction Metrics Bar */}
      {metrics && <ForecastMetricsBar metrics={metrics} />}
    </div>
  );
};
