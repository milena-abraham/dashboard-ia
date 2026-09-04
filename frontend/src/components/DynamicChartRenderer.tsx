'use client';

import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';
import { neoBrutalistTheme } from '../lib/echartsNeoBrutalistTheme';

echarts.registerTheme('neo-brutalist', neoBrutalistTheme);

import { ChartSchema } from '@/types/analysis';

interface DynamicChartRendererProps {
  payload: ChartSchema;
  height?: string | number;
}

export default function DynamicChartRenderer({ payload, height = '100%' }: DynamicChartRendererProps) {
    const safeDataset = useMemo(() => {
        if (!payload || !payload.dataset) return null;
        const ds = JSON.parse(JSON.stringify(payload.dataset));
        if (ds.source && ds.dimensions) {
            if (payload.layoutDirectives.chartType === 'FanChart') {
                ds.source.forEach((row: any) => {
                    if (row.upper != null && row.lower != null && row.band_width == null) {
                        row.band_width = Math.max(0, row.upper - row.lower);
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
    const { layoutDirectives } = payload;
    const dataset = safeDataset;
    
    // Configuración Base
    const isLegendChart = ['FanChart', 'Scatter'].includes(layoutDirectives.chartType);
    const baseOptions: any = {
      dataset: dataset,
      grid: { 
        containLabel: true, 
        left: 12, 
        right: 25, 
        top: 20, 
        bottom: isLegendChart ? 45 : 25 
      },
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
        type: layoutDirectives.xAxisType,
        scale: layoutDirectives.xAxisType === 'value' || layoutDirectives.xAxisType === 'log',
        axisLabel: {
          hideOverlap: true,
          formatter: (value: any) => {
             if (layoutDirectives.xAxisType === 'value' || layoutDirectives.xAxisType === 'log') {
                if (Math.abs(value) >= 1000000) return (value / 1000000).toFixed(1) + 'M';
                if (Math.abs(value) >= 1000) return (value / 1000).toFixed(1) + 'K';
             }
             if (layoutDirectives.xAxisType === 'category' && layoutDirectives.highCardinality) {
                 return String(value).length > 10 ? String(value).substring(0, 10) + '...' : value;
             }
             if (layoutDirectives.xAxisType === 'time') {
                 // ECharts time axes pass timestamps (ms) to the formatter
                 const date = new Date(value);
                 return date.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' });
             }
             return String(value);
          }
        }
      },
      yAxis: {
        type: layoutDirectives.isLogScale ? 'log' : layoutDirectives.yAxisType,
        scale: layoutDirectives.yAxisType === 'value' || layoutDirectives.yAxisType === 'log',
        axisLabel: {
          hideOverlap: true,
          formatter: (value: any) => {
             if (layoutDirectives.yAxisType === 'value' || layoutDirectives.yAxisType === 'log') {
                if (Math.abs(value) >= 1000000) return (value / 1000000).toFixed(1) + 'M';
                if (Math.abs(value) >= 1000) return (value / 1000).toFixed(1) + 'K';
             }
             if (layoutDirectives.yAxisType === 'category' && layoutDirectives.highCardinality) {
                 return String(value).length > 15 ? String(value).substring(0, 15) + '...' : value;
             }
             return String(value);
          }
        }
      },
      series: []
    };

    switch (layoutDirectives.chartType) {
      case 'HorizontalBar': {
        const d0 = dataset.dimensions[0];
        const d1 = dataset.dimensions[1];
        const v0 = dataset.source[0] ? dataset.source[0][d0] : null;
        const isD0Num = typeof v0 === 'number';
        // If x is value and y is category, we map X -> Numeric, Y -> Category
        const numD = isD0Num ? d0 : d1;
        const catD = isD0Num ? d1 : d0;
        baseOptions.grid = { containLabel: true, left: 12, right: 40, top: 20, bottom: 25 };
        baseOptions.series = [{
          type: 'bar',
          barMaxWidth: 38,
          barCategoryGap: '25%',
          itemStyle: {
            color: '#815ae1',
            borderColor: '#111',
            borderWidth: 2
          },
          label: {
            show: true,
            position: 'right',
            fontWeight: 'bold',
            fontSize: 12,
            formatter: (p: any) => {
              const val = p.value ? p.value[numD] : p.value;
              if (typeof val === 'number') {
                if (Math.abs(val) >= 1000000) return (val / 1000000).toFixed(1) + 'M';
                if (Math.abs(val) >= 1000) return (val / 1000).toFixed(1) + 'K';
                return Number.isInteger(val) ? val.toString() : val.toFixed(1);
              }
              return String(val ?? '');
            }
          },
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

      case 'LineChart': {
        const xDim = dataset.dimensions[0];
        const yDims = dataset.dimensions.slice(1);
        const sourceRows = dataset?.source || [];

        const validValues = sourceRows.flatMap((row: any) =>
          yDims.map((dim: string) => {
            const val = row[dim];
            return typeof val === 'number' && !isNaN(val) ? val : null;
          }).filter((v: any): v is number => v !== null)
        );

        // Smart Y-axis framing: evita efecto electrocardiograma si la variación es pequeña
        if (validValues.length > 0) {
          const minVal = Math.min(...validValues);
          const maxVal = Math.max(...validValues);
          const range = maxVal - minVal;
          const meanVal = validValues.reduce((a: number, b: number) => a + b, 0) / validValues.length;
          const isTightRange = meanVal > 0 && (range / meanVal) < 0.25;

          if (isTightRange) {
            const pad = Math.max(range * 2.5, meanVal * 0.18);
            baseOptions.yAxis = {
              ...baseOptions.yAxis,
              min: (val: any) => Math.max(0, Math.floor((val.min - pad) * 10) / 10),
              max: (val: any) => Math.ceil((val.max + pad) * 10) / 10,
              scale: true,
            };
          } else {
            const pad = Math.max(range * 0.12, 1);
            baseOptions.yAxis = {
              ...baseOptions.yAxis,
              min: (val: any) => Math.max(minVal >= 0 ? 0 : -Infinity, Math.floor((val.min - pad) * 10) / 10),
              max: (val: any) => Math.ceil((val.max + pad) * 10) / 10,
              scale: true,
            };
          }
        }

        baseOptions.dataZoom = [
          {
            type: 'inside',
            filterMode: 'none',
          }
        ];

        baseOptions.tooltip = {
          trigger: 'axis',
          axisPointer: { type: 'line', lineStyle: { color: '#815ae1', width: 1.5, type: 'dashed' } },
          formatter: (params: any[]) => {
            if (!params || !params.length) return '';
            const p = params[0];
            const row = p.data;
            const dateStr = (row && row[xDim]) || p.axisValueLabel || p.name || '';
            let html = `<div style="font-weight:900;text-transform:uppercase;margin-bottom:6px;border-bottom:1px solid #ddd;padding-bottom:2px;">${dateStr}</div>`;
            params.forEach((param: any) => {
              const r = param.data;
              const yCol = param.seriesName || yDims[0];
              const val = r ? (r[yCol] ?? param.value) : param.value;
              if (val != null) {
                const color = param.color || '#18181b';
                html += `<div style="display:flex;justify-content:space-between;gap:14px;margin-bottom:2px;"><span><span style="display:inline-block;width:8px;height:8px;background:${color};margin-right:6px;"></span>${yCol}:</span><b>${typeof val === 'number' ? Number(val).toFixed(2) : val}</b></div>`;
              }
            });
            return html;
          }
        };

        const colors = ['#18181b', '#815ae1', '#06b6d4', '#10b981'];
        baseOptions.series = (yDims.length > 0 ? yDims : [dataset.dimensions[1]]).map((yCol: string, idx: number) => ({
          name: yCol,
          type: 'line',
          encode: { x: xDim, y: yCol },
          itemStyle: { color: colors[idx % colors.length] },
          lineStyle: { width: 2.5, color: colors[idx % colors.length] },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: idx === 0 ? 'rgba(24, 24, 27, 0.08)' : 'rgba(129, 90, 225, 0.08)' },
                { offset: 1, color: 'rgba(24, 24, 27, 0.00)' }
              ]
            }
          },
          showSymbol: false,
          smooth: 0.28,
          connectNulls: !layoutDirectives.hasTimeGaps
        }));

        if (yDims.length > 1) {
          baseOptions.legend = {
            show: true,
            bottom: 8,
            left: 'center',
            itemGap: 14,
            textStyle: { fontWeight: 'bold', fontSize: 12 }
          };
        }
        break;
      }
        
      case 'FanChart': { // Prophet Forecast
        const sourceRows = dataset?.source || [];
        const validValues = sourceRows.flatMap((d: any) => 
          [d.historical, d.forecast, d.lower, d.upper].filter((v: any) => typeof v === 'number' && !isNaN(v))
        );
        
        // Smart Y-axis framing: evita efecto electrocardiograma si la variación es pequeña
        if (validValues.length > 0) {
          const minVal = Math.min(...validValues);
          const maxVal = Math.max(...validValues);
          const range = maxVal - minVal;
          const meanVal = validValues.reduce((a: number, b: number) => a + b, 0) / validValues.length;
          const isTightRange = meanVal > 0 && (range / meanVal) < 0.25;
          
          if (isTightRange) {
            const pad = Math.max(range * 2.5, meanVal * 0.18);
            baseOptions.yAxis = {
              ...baseOptions.yAxis,
              min: (val: any) => Math.max(0, Math.floor((val.min - pad) * 10) / 10),
              max: (val: any) => Math.ceil((val.max + pad) * 10) / 10,
              scale: true,
            };
          } else {
            const pad = Math.max(range * 0.12, 1);
            baseOptions.yAxis = {
              ...baseOptions.yAxis,
              min: (val: any) => Math.max(minVal >= 0 ? 0 : -Infinity, Math.floor((val.min - pad) * 10) / 10),
              max: (val: any) => Math.ceil((val.max + pad) * 10) / 10,
              scale: true,
            };
          }
        }

        // Encontrar punto de transición para la línea divisoria
        const firstForecastIdx = sourceRows.findIndex((r: any) => r.forecast != null);
        const transitionDate = firstForecastIdx >= 0 ? sourceRows[firstForecastIdx]?.date : undefined;

        baseOptions.dataZoom = [
          {
            type: 'inside',
            filterMode: 'none',
          }
        ];

        baseOptions.tooltip = {
          trigger: 'axis',
          axisPointer: { type: 'line', lineStyle: { color: '#815ae1', width: 1.5, type: 'dashed' } },
          formatter: (params: any[]) => {
            if (!params || !params.length) return '';
            const dateStr = params[0].axisValueLabel || params[0].name;
            let html = `<div style="font-weight:900;text-transform:uppercase;margin-bottom:6px;border-bottom:1px solid #ddd;padding-bottom:2px;">${dateStr}</div>`;
            const row = params[0].data;
            if (row) {
              if (row.historical != null) {
                html += `<div style="display:flex;justify-content:space-between;gap:14px;margin-bottom:2px;"><span><span style="display:inline-block;width:8px;height:8px;background:#18181b;margin-right:6px;"></span>Histórico:</span><b>${Number(row.historical).toFixed(2)}</b></div>`;
              }
              if (row.forecast != null) {
                html += `<div style="display:flex;justify-content:space-between;gap:14px;color:#815ae1;margin-bottom:2px;"><span><span style="display:inline-block;width:8px;height:8px;background:#815ae1;margin-right:6px;"></span>Proyección:</span><b>${Number(row.forecast).toFixed(2)}</b></div>`;
              }
              if (row.lower != null) {
                html += `<div style="display:flex;justify-content:space-between;gap:14px;font-size:11px;color:#666;"><span>Límite Inferior:</span><b>${Number(row.lower).toFixed(2)}</b></div>`;
              }
              const upVal = row.upper != null ? row.upper : (row.lower != null && row.band_width != null ? row.lower + row.band_width : null);
              if (upVal != null) {
                html += `<div style="display:flex;justify-content:space-between;gap:14px;font-size:11px;color:#666;"><span>Límite Superior:</span><b>${Number(upVal).toFixed(2)}</b></div>`;
              }
            }
            return html;
          }
        };

        baseOptions.legend = {
          show: true,
          bottom: 8,
          left: 'center',
          itemGap: 20,
          data: ['Histórico', 'Proyección', 'Banda de Confianza'],
          textStyle: { fontWeight: 'bold', fontSize: 12 }
        };

        baseOptions.series = [
          {
            name: 'Histórico',
            type: 'line',
            encode: { x: 'date', y: 'historical' },
            itemStyle: { color: '#18181b' },
            lineStyle: { width: 2.5, color: '#18181b' },
            areaStyle: {
              color: {
                type: 'linear',
                x: 0, y: 0, x2: 0, y2: 1,
                colorStops: [
                  { offset: 0, color: 'rgba(24, 24, 27, 0.08)' },
                  { offset: 1, color: 'rgba(24, 24, 27, 0.00)' }
                ]
              }
            },
            showSymbol: false,
            smooth: 0.28,
          },
          {
            name: 'Proyección',
            type: 'line',
            encode: { x: 'date', y: 'forecast' },
            lineStyle: { type: 'dashed', width: 2.5, color: '#815ae1' },
            itemStyle: { color: '#815ae1' },
            showSymbol: false,
            smooth: 0.28,
            markLine: transitionDate ? {
              symbol: ['none', 'none'],
              silent: true,
              lineStyle: { color: '#815ae1', type: 'dashed', width: 1.5 },
              label: {
                show: true,
                position: 'insideEndTop',
                formatter: 'Proyección IA',
                color: '#815ae1',
                fontWeight: 'bold',
                fontSize: 10,
                backgroundColor: '#ffffff',
                borderColor: '#815ae1',
                borderWidth: 1.5,
                padding: [3, 6],
              },
              data: [{ xAxis: transitionDate }]
            } : undefined
          },
          {
            name: 'Límite Inferior',
            type: 'line',
            encode: { x: 'date', y: 'lower' },
            lineStyle: { opacity: 0 },
            showSymbol: false,
            stack: 'confidence-band',
            smooth: 0.28,
          },
          {
            name: 'Banda de Confianza',
            type: 'line',
            encode: { x: 'date', y: 'band_width' },
            lineStyle: { opacity: 0 },
            itemStyle: { color: '#815ae1' },
            areaStyle: { color: '#815ae1', opacity: 0.18 },
            showSymbol: false,
            stack: 'confidence-band',
            smooth: 0.28,
          }
        ];
        break;
      }

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
            const xDim = dataset.dimensions[0];
            const yDim = dataset.dimensions[1];
            const isTimeAxis = layoutDirectives.xAxisType === 'time';

            baseOptions.dataset = undefined;
            baseOptions.dataZoom = [
              {
                type: 'inside',
                filterMode: 'none',
              }
            ];

            baseOptions.tooltip = {
              trigger: 'item',
              formatter: (params: any) => {
                const pt = params.data || [];
                const xVal = pt[0];
                const yVal = pt[1];
                const isAnom = params.seriesName === 'Anomalía';
                const dotColor = isAnom ? '#ff6b6b' : '#815ae1';
                const statusLabel = isAnom ? 'ANOMALÍA DETECTADA' : 'REGISTRO NORMAL';
                
                let dateDisplay = String(xVal ?? '');
                if (isTimeAxis && xVal) {
                  const d = new Date(xVal);
                  if (!isNaN(d.getTime())) {
                    dateDisplay = d.toLocaleString('es-ES', { 
                      year: 'numeric', month: 'short', day: '2-digit', 
                      hour: '2-digit', minute: '2-digit' 
                    });
                  }
                }

                return `
                  <div style="font-weight:900;text-transform:uppercase;margin-bottom:6px;border-bottom:1px solid #ddd;padding-bottom:2px;">${dateDisplay}</div>
                  <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
                    <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${dotColor};"></span>
                    <span style="font-weight:bold;color:${dotColor};font-size:11px;">${statusLabel}</span>
                  </div>
                  <div style="display:flex;justify-content:space-between;gap:14px;">
                    <span>${yDim}:</span>
                    <b>${typeof yVal === 'number' ? yVal.toFixed(2) : yVal}</b>
                  </div>
                `;
              }
            };

            baseOptions.legend = {
              show: true,
              bottom: 8,
              left: 'center',
              itemGap: 20,
              data: ['Normal', 'Anomalía'],
              textStyle: { fontWeight: 'bold', fontSize: 12 }
            };

            baseOptions.series = [
              {
                name: 'Normal',
                type: 'scatter',
                data: dataset.source
                  .filter((s: any) => s._anomaly === 1)
                  .map((s: any) => [s[xDim], s[yDim]]),
                symbolSize: 6,
                itemStyle: { 
                  color: 'rgba(129, 90, 225, 0.45)',
                  borderColor: '#815ae1',
                  borderWidth: 1
                }
              },
              {
                name: 'Anomalía',
                type: 'scatter',
                data: dataset.source
                  .filter((s: any) => s._anomaly === -1)
                  .map((s: any) => [s[xDim], s[yDim]]),
                symbolSize: 11,
                itemStyle: { 
                  color: '#ff6b6b',
                  borderColor: '#111111',
                  borderWidth: 2
                },
                z: 10
              }
            ];
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
        const indicators = dataset.dimensions.slice(1).map((dim: string) => ({ name: String(dim) }));
        const radarData = dataset.source.map((row: any) => ({
            name: String(row._segment),
            value: dataset.dimensions.slice(1).map((dim: string) => row[dim])
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
        baseOptions.tooltip = {
          trigger: 'item',
          formatter: (params: any) => {
            const val = params.value ? params.value[dataset.dimensions[1]] : params.value;
            const percent = params.percent !== undefined ? ` (${params.percent}%)` : '';
            return `<b>${params.name}</b>: ${val}${percent}`;
          }
        };
        baseOptions.legend = {
          show: dataset.source.length <= 10,
          bottom: 8,
          left: 'center',
          itemGap: 14,
          textStyle: { fontWeight: 'bold', fontSize: 12 }
        };
        baseOptions.series = [{
          type: 'pie',
          radius: ['40%', '75%'],
          center: ['50%', '44%'],
          avoidLabelOverlap: true,
          itemStyle: {
            borderColor: '#111',
            borderWidth: 2
          },
          label: {
            show: true,
            formatter: '{b}\n{d}%',
            fontWeight: 'bold',
            fontSize: 13,
            color: '#111'
          },
          labelLine: {
            show: true,
            length: 12,
            length2: 10
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 15,
              fontWeight: 'bold'
            }
          },
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

  const h = typeof height === 'number' ? `${height}px` : (height === '100%' ? '420px' : (height || '420px'));

  return (
    <div style={{ width: '100%', height: h, minHeight: 400 }} className="w-full h-full flex-1">
      <ReactECharts
        option={options}
        theme="neo-brutalist"
        style={{ height: '100%', minHeight: 400, width: '100%' }}
        opts={{ renderer: 'canvas' }}
      />
    </div>
  );
}
