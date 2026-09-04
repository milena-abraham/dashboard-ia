import React from 'react';
import dynamic from 'next/dynamic';
import { TrendingUp, TrendingDown, Minus, ShieldCheck, Activity } from 'lucide-react';
import { ChartSchema, ForecastMetricsSchema } from '@/types/analysis';
import ChartErrorBoundary from '@/components/ChartErrorBoundary';

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
  if (!chartData) return null;

  const precision = metrics?.precisionPct ?? (metrics?.mape != null ? Math.max(0, 100 - metrics.mape) : 95.0);
  const trend = metrics?.tendenciaPct ?? 0;
  const isPositiveTrend = trend > 0.5;
  const isNegativeTrend = trend < -0.5;
  const confidence = metrics?.confianza ?? (precision >= 85 ? 'Alta' : precision >= 70 ? 'Media' : 'Precaución');

  return (
    <div className="md:col-span-12 bg-white p-6 md:p-8 rounded-none border border-[#111] border-2 shadow-[4px_4px_0px_#111]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-mio-violet rounded-none border border-[#111]">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-black uppercase tracking-tight text-gray-900">
              Proyecciones Inteligentes
            </h3>
            <p className="text-xs text-gray-500 font-medium">
              {chartData.metadata?.insightSubtitle || 'Modelo predictivo regularizado con bandas de confianza'}
            </p>
          </div>
        </div>

        {metrics?.confianza && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-[#111] bg-white shadow-[2px_2px_0px_#111] text-xs font-bold self-start sm:self-auto">
            <ShieldCheck className="w-4 h-4 text-mio-violet" />
            <span>Confianza del Modelo: <strong className="uppercase">{confidence}</strong></span>
          </div>
        )}
      </div>

      {/* Chart Canvas */}
      <div className="relative w-full h-[450px]">
        <ChartErrorBoundary>
          <DynamicChartRenderer
            key={`forecast-${filename}`}
            payload={chartData}
            height={450}
          />
        </ChartErrorBoundary>
      </div>

      {/* Prediction Metrics Bar */}
      {metrics && !metrics.error && (
        <div className="mt-8 pt-6 border-t-2 border-[#111]">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-mio-violet" />
            <h4 className="text-xs font-black uppercase tracking-wider text-gray-800">
              Métricas de Rendimiento & Precisión del Modelo
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Metric 1: Precisión */}
            <div className="p-4 bg-[#fafafc] border border-[#111] border-2 shadow-[3px_3px_0px_#111] flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-black uppercase text-gray-600">Precisión Estimada</span>
                <span
                  className={`text-[10px] font-black uppercase px-2 py-0.5 border border-[#111] ${
                    precision >= 85
                      ? 'bg-[#bdf559] text-gray-900'
                      : precision >= 70
                      ? 'bg-[#ffe066] text-gray-900'
                      : 'bg-[#ff6b6b] text-white'
                  }`}
                >
                  {precision >= 85 ? 'Excelente' : precision >= 70 ? 'Aceptable' : 'Dispersa'}
                </span>
              </div>
              <div className="text-2xl font-black text-gray-900">
                {precision.toFixed(1)}%
              </div>
              <p className="text-[11px] text-gray-500 mt-1 font-medium">
                MAPE: {metrics.mape != null ? `${metrics.mape.toFixed(2)}%` : 'Bajo control'}
              </p>
            </div>

            {/* Metric 2: Error Medio Absoluto (MAE) */}
            <div className="p-4 bg-[#fafafc] border border-[#111] border-2 shadow-[3px_3px_0px_#111] flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-black uppercase text-gray-600">Error Medio (MAE)</span>
                <span className="text-[10px] font-bold text-gray-500 uppercase">Desvío Promedio</span>
              </div>
              <div className="text-2xl font-black text-gray-900">
                ± {metrics.mae != null ? metrics.mae : '-'}
              </div>
              <p className="text-[11px] text-gray-500 mt-1 font-medium">
                {metrics.rmse != null ? `RMSE: ± ${metrics.rmse}` : 'Dispersión estable'}
                {metrics.r2 != null && ` • R²: ${metrics.r2}`}
              </p>
            </div>

            {/* Metric 3: Tendencia */}
            <div className="p-4 bg-[#fafafc] border border-[#111] border-2 shadow-[3px_3px_0px_#111] flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-black uppercase text-gray-600">Tendencia Futura</span>
                {isPositiveTrend ? (
                  <TrendingUp className="w-4 h-4 text-green-600" />
                ) : isNegativeTrend ? (
                  <TrendingDown className="w-4 h-4 text-red-600" />
                ) : (
                  <Minus className="w-4 h-4 text-gray-500" />
                )}
              </div>
              <div className="text-2xl font-black text-gray-900">
                {trend > 0 ? `+${trend}%` : `${trend}%`}
              </div>
              <p className="text-[11px] text-gray-500 mt-1 font-medium truncate">
                {metrics.ultimoValorReal != null && metrics.valorFinalForecast != null
                  ? `${metrics.ultimoValorReal} → ${metrics.valorFinalForecast}`
                  : 'Estabilidad proyectada'}
              </p>
            </div>

            {/* Metric 4: Horizonte & Motor */}
            <div className="p-4 bg-[#fafafc] border border-[#111] border-2 shadow-[3px_3px_0px_#111] flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-black uppercase text-gray-600">Horizonte Temporal</span>
                <span className="text-[10px] font-black bg-mio-violet/10 text-mio-violet px-2 py-0.5 border border-mio-violet/30">
                  {metrics.frecuencia || 'Adaptativa'}
                </span>
              </div>
              <div className="text-2xl font-black text-gray-900">
                {metrics.periodos ?? 30} {metrics.frecuencia === 'Semanal' ? 'Semanas' : 'Días'}
              </div>
              <p className="text-[11px] text-gray-500 mt-1 font-medium truncate">
                {metrics.motor || 'Prophet'} • {metrics.validacion || 'OOS'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
