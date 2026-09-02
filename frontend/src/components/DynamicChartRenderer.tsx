import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';
import { neoBrutalistTheme } from '../lib/echartsNeoBrutalistTheme';

echarts.registerTheme('neo-brutalist', neoBrutalistTheme);

export interface AutoVizPayload {
  chart_id: string;
  metadata: { title: string; insight_subtitle: string; source_metric: string; };
  layout_directives: {
    chart_type: 'LineChart' | 'HorizontalBar' | 'Scatter' | 'Donut' | 'Tornado' | 'FanChart' | 'Boxplot' | 'Radar';
    x_axis_type: 'category' | 'value' | 'time' | 'log';
    y_axis_type: 'category' | 'value' | 'time' | 'log';
    is_log_scale: boolean;
    has_time_gaps: boolean; 
    high_cardinality: boolean; 
    show_confidence_bands: boolean;
  };
  dataset: { dimensions: string[]; source: Record<string, any>[]; };
}

interface DynamicChartRendererProps {
  payload: AutoVizPayload;
  height?: string | number;
}

export default function DynamicChartRenderer({ payload, height = '100%' }: DynamicChartRendererProps) {
    const safeDataset = useMemo(() => {
        if (!payload || !payload.dataset) return null;
        const ds = JSON.parse(JSON.stringify(payload.dataset));
        if (ds.source && ds.dimensions) {
            if (payload.layout_directives.chart_type === 'FanChart') {
                ds.source.forEach((row: any) => {
                    if (row.upper != null && row.lower != null) {
                        row.band_width = row.upper - row.lower;
                    } else {
                        row.band_width = null;
                    }
                });
                if (!ds.dimensions.includes('band_width')) ds.dimensions.push('band_width');
            }
            ds.source.forEach((row: any) => {
                ds.dimensions.forEach((dim: string) => {
                    if (typeof row[dim] === 'number' && (dim === ds.dimensions[0] || dim === 'feature' || dim === '_segment')) {
                        row[dim] = String(row[dim]);
                    }
                });
            });
        }
        return ds;
    }, [payload]);

  const options = useMemo(() => {
    if (!payload || !safeDataset) return {};
    const { layout_directives } = payload;
    const dataset = safeDataset;
    
    // Configuración Base
    const baseOptions: any = {
      dataset: dataset,
      grid: { containLabel: true, left: '5%', right: '5%', top: '15%', bottom: '10%' },
      tooltip: { 
          trigger: 'axis', 
          axisPointer: { type: 'shadow' },
          valueFormatter: (value: any) => {
              if (value == null) return '-';
              if (typeof value === 'number') {
                  return Number.isInteger(value) ? value.toString() : value.toFixed(2);
              }
              return String(value);
          }
      },
      xAxis: {
        type: layout_directives.x_axis_type,
        scale: true,
        axisLabel: {
          hideOverlap: true,
          formatter: (value: any) => {
             if (layout_directives.x_axis_type === 'value' || layout_directives.x_axis_type === 'log') {
                if (Math.abs(value) >= 1000000) return (value / 1000000).toFixed(1) + 'M';
                if (Math.abs(value) >= 1000) return (value / 1000).toFixed(1) + 'K';
             }
             if (layout_directives.x_axis_type === 'category' && layout_directives.high_cardinality) {
                 return String(value).length > 10 ? String(value).substring(0, 10) + '...' : value;
             }
             if (layout_directives.x_axis_type === 'time') {
                 // ECharts time axes pass timestamps (ms) to the formatter
                 const date = new Date(value);
                 return date.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' });
             }
             return String(value);
          }
        }
      },
      yAxis: {
        type: layout_directives.is_log_scale ? 'log' : layout_directives.y_axis_type,
        scale: true,
        axisLabel: {
          hideOverlap: true,
          formatter: (value: any) => {
             if (layout_directives.y_axis_type === 'value' || layout_directives.y_axis_type === 'log') {
                if (Math.abs(value) >= 1000000) return (value / 1000000).toFixed(1) + 'M';
                if (Math.abs(value) >= 1000) return (value / 1000).toFixed(1) + 'K';
             }
             if (layout_directives.y_axis_type === 'category' && layout_directives.high_cardinality) {
                 return String(value).length > 15 ? String(value).substring(0, 15) + '...' : value;
             }
             return String(value);
          }
        }
      },
      series: []
    };

    switch (layout_directives.chart_type) {
      case 'HorizontalBar': {
        const d0 = dataset.dimensions[0];
        const d1 = dataset.dimensions[1];
        const v0 = dataset.source[0] ? dataset.source[0][d0] : null;
        const isD0Num = typeof v0 === 'number';
        // If x is value and y is category, we map X -> Numeric, Y -> Category
        const numD = isD0Num ? d0 : d1;
        const catD = isD0Num ? d1 : d0;
        baseOptions.series = [{
          type: 'bar',
          encode: { x: numD, y: catD }
        }];
        break;
      }
        
      case 'Tornado': { // Divergent bar
        const td0 = dataset.dimensions[0];
        const td1 = dataset.dimensions[1];
        const tv0 = dataset.source[0] ? dataset.source[0][td0] : null;
        const tisD0Num = typeof tv0 === 'number';
        const tnumD = tisD0Num ? td0 : td1;
        const tcatD = tisD0Num ? td1 : td0;
        baseOptions.series = [{
          type: 'bar',
          encode: { x: tnumD, y: tcatD },
          itemStyle: {
              color: (params: any) => {
                  return params.value[dataset.dimensions[1]] >= 0 ? '#bdf559' : '#ff6b6b';
              }
          }
        }];
        break;
      }

      case 'LineChart':
        baseOptions.series = [{
          type: 'line',
          encode: { x: dataset.dimensions[0], y: dataset.dimensions[1] },
          connectNulls: !layout_directives.has_time_gaps
        }];
        break;
        
      case 'FanChart': // Prophet Forecast
        // dimensions: ["date", "historical", "forecast", "upper", "lower"]
        baseOptions.series = [
          {
            name: 'Histórico',
            type: 'line',
            encode: { x: 'date', y: 'historical' },
            itemStyle: { color: '#111111' },
            showSymbol: false
          },
          {
            name: 'Proyección',
            type: 'line',
            encode: { x: 'date', y: 'forecast' },
            lineStyle: { type: 'dashed' },
            itemStyle: { color: '#815ae1' },
            showSymbol: false
          },
          {
            name: 'Límite Inferior',
            type: 'line',
            encode: { x: 'date', y: 'lower' },
            lineStyle: { opacity: 0 },
            showSymbol: false,
            stack: 'confidence-band'
          },
          {
            name: 'Límite Superior',
            type: 'line',
            encode: { x: 'date', y: 'upper' },
            lineStyle: { opacity: 0 },
            areaStyle: { color: '#815ae1', opacity: 0.15 },
            showSymbol: false,
            stack: 'confidence-band'
          }
        ];
        break;

      case 'Scatter':
        if (dataset.dimensions.includes('_segment')) {
            // Multi-series for clustering
            const segments = Array.from(new Set(dataset.source.map((s: any) => s._segment)));
            baseOptions.dataset = undefined; // We construct series manually for multi-series scatter
            baseOptions.tooltip = { trigger: 'item' };
            baseOptions.series = segments.map(seg => ({
                name: String(seg),
                type: 'scatter',
                data: dataset.source.filter((s: any) => s._segment === seg).map((s: any) => [s._pca1, s._pca2]),
                itemStyle: { opacity: 0.8 }
            }));
            baseOptions.legend = { show: true, bottom: 0, padding: 0 };
        } else if (dataset.dimensions.includes('_anomaly')) {
            baseOptions.series = [
              {
                name: 'Normal',
                type: 'scatter',
                data: dataset.source.filter((s: any) => s._anomaly === 1).map((s: any) => [s[dataset.dimensions[0]], s[dataset.dimensions[1]]]),
                itemStyle: { color: '#815ae1', opacity: 0.6 }
              },
              {
                name: 'Anomalía',
                type: 'scatter',
                data: dataset.source.filter((s: any) => s._anomaly === -1).map((s: any) => [s[dataset.dimensions[0]], s[dataset.dimensions[1]]]),
                itemStyle: { color: '#ff6b6b', opacity: 1 },
                symbolSize: 10
              }
            ];
            baseOptions.legend = { show: true, bottom: 0 };
        } else {
            baseOptions.series = [{
              type: 'scatter',
              encode: { x: dataset.dimensions[0], y: dataset.dimensions[1] },
              itemStyle: { opacity: 0.6 }
            }];
        }
        break;
        
      case 'Radar':
        baseOptions.xAxis = { show: false };
        baseOptions.yAxis = { show: false };
        baseOptions.grid = undefined;
        baseOptions.tooltip = { trigger: 'item' };
        
        // ECharts Radar needs manual mapping
        const indicators = dataset.dimensions.slice(1).map(dim => ({ name: String(dim) }));
        const radarData = dataset.source.map(row => ({
            name: String(row._segment),
            value: dataset.dimensions.slice(1).map(dim => row[dim])
        }));
        
        baseOptions.radar = { indicator: indicators, shape: 'circle' };
        baseOptions.series = [{
            type: 'radar',
            data: radarData,
            areaStyle: { opacity: 0.1 }
        }];
        baseOptions.legend = { show: true, bottom: 0 };
        break;

      case 'Donut':
        baseOptions.xAxis = { show: false };
        baseOptions.yAxis = { show: false };
        baseOptions.grid = undefined;
        baseOptions.tooltip = { trigger: 'item' };
        baseOptions.legend = { show: dataset.source.length <= 15, bottom: 0 };
        baseOptions.series = [{
          type: 'pie',
          radius: ['40%', '70%'],
          encode: { itemName: dataset.dimensions[0], value: dataset.dimensions[1] }
        }];
        break;
        
      default:
        baseOptions.series = [{
          type: 'bar',
          encode: { x: dataset.dimensions[0], y: dataset.dimensions[1] }
        }];
    }

    return baseOptions;
  }, [payload]);

  if (!payload || !payload.dataset) {
    return <div className="text-gray-400">Datos no disponibles</div>;
  }

  const h = typeof height === 'number' ? `${height}px` : height;

  return (
    <div style={{ width: '100%', height: h, minHeight: '300px' }} className="w-full flex-1">
      <ReactECharts
        option={options}
        theme="neo-brutalist"
        style={{ height: '100%', width: '100%' }}
        opts={{ renderer: 'canvas' }}
      />
    </div>
  );
}
