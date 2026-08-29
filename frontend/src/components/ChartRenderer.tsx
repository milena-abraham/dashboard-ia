'use client';

import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';

const Plot = dynamic(() => import('react-plotly.js'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-80 bg-gray-50 animate-pulse rounded-2xl flex items-center justify-center text-gray-400 text-sm">
      Cargando visualización...
    </div>
  ),
});

interface ChartRendererProps {
  figJson: string | null | undefined;
  height?: number;
}

export default function ChartRenderer({ figJson, height = 380 }: ChartRendererProps) {
  const chartData = useMemo(() => {
    if (!figJson) return null;
    try {
      return typeof figJson === 'string' ? JSON.parse(figJson) : figJson;
    } catch (e) {
      console.error('Error parseando JSON de Plotly:', e);
      return null;
    }
  }, [figJson]);

  if (!chartData) {
    return (
      <div className="w-full h-72 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 text-sm border border-gray-100">
        Visualización no disponible para esta configuración
      </div>
    );
  }

  const layout = {
    ...chartData.layout,
    autosize: true,
    height,
    margin: { l: 40, r: 20, t: 40, b: 40, ...chartData.layout?.margin },
    paper_bgcolor: 'transparent',
    plot_bgcolor: 'transparent',
  };

  return (
    <div className="w-full overflow-hidden rounded-2xl">
      <Plot
        data={chartData.data || []}
        layout={layout}
        config={{ responsive: true, displayModeBar: false }}
        style={{ width: '100%', height: `${height}px` }}
        useResizeHandler={true}
      />
    </div>
  );
}
