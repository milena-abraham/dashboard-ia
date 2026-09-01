'use client';

import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Chart, Line, Bar, Doughnut, Radar, Scatter } from 'react-chartjs-2';

import { BoxPlotController, BoxAndWiskers } from '@sgratzl/chartjs-chart-boxplot';
import { formatNumber } from '@/lib/formatters';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Tooltip,
  Legend,
  Filler,
  BoxPlotController,
  BoxAndWiskers
);

interface ChartRendererProps {
  chartData: any;
  height?: number | string;
}

const COLORS = [
  "#815ae1", "#bdf559", "#a282fa", "#d4fc88", 
  "#613eb5", "#92d433", "#c6b0f7"
];

ChartJS.defaults.font.family = "'Inter', system-ui, sans-serif";
ChartJS.defaults.color = '#4b5563';

// PATRON 1: chartDefaults shared config
const chartDefaults: any = {
  responsive: true,
  maintainAspectRatio: false,
  animation: { duration: 600, easing: 'easeOutQuart' }, 
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: {
        usePointStyle: true,
        padding: 20,
        font: { weight: 'bold', size: 11 }
      }
    },
    tooltip: {
      // Default tooltips work best across mixed chart types
      intersect: true,
      mode: 'nearest',
      backgroundColor: '#111111',
      titleFont: { size: 13, weight: 'bold' },
      bodyFont: { size: 12 },
      padding: 12,
      cornerRadius: 0, // Neo-brutalist sharp edges
      boxPadding: 4,
      borderColor: 'rgba(255,255,255,0.1)',
      borderWidth: 1,
      callbacks: {
        label: function(ctx: any) {
          const val = ctx.raw;
          if (typeof val === 'number') return ` ${ctx.dataset.label || ''}: ${formatNumber(val)}`;
          if (val && typeof val === 'object' && val.median !== undefined) {
             return ` ${ctx.dataset.label || ''}: Min: ${formatNumber(val.min)}, Q1: ${formatNumber(val.q1)}, Med: ${formatNumber(val.median)}, Q3: ${formatNumber(val.q3)}, Max: ${formatNumber(val.max)}`;
          }
          return ` ${ctx.dataset.label || ''}: ${val}`;
        }
      }
    }
  },
  // PATRON 2: Hover dimming effect
  onHover: function(e: any, activeElements: any[], chart: any) {
    const datasets = chart.data.datasets;
    let needsUpdate = false;
    
    if (activeElements.length === 0) {
      datasets.forEach((dataset: any) => {
        if (dataset._isDimmed) {
          dataset.backgroundColor = dataset._origBg;
          dataset.borderColor = dataset._origBorder;
          dataset._isDimmed = false;
          needsUpdate = true;
        }
      });
      if (needsUpdate) chart.update();
      return;
    }
    const activeDatasetIndex = activeElements[0].datasetIndex;
    datasets.forEach((dataset: any, i: number) => {
      if (!dataset._origBg) {
        dataset._origBg = dataset.backgroundColor;
        dataset._origBorder = dataset.borderColor;
      }
      if (i === activeDatasetIndex) {
        if (dataset._isDimmed) {
          dataset.backgroundColor = dataset._origBg;
          dataset.borderColor = dataset._origBorder;
          dataset._isDimmed = false;
          needsUpdate = true;
        }
      } else {
        if (!dataset._isDimmed) {
          dataset.backgroundColor = Array.isArray(dataset._origBg) 
            ? dataset._origBg.map(() => 'rgba(200, 200, 200, 0.2)') 
            : 'rgba(200, 200, 200, 0.2)';
          dataset.borderColor = Array.isArray(dataset._origBorder)
            ? dataset._origBorder.map(() => 'rgba(200, 200, 200, 0.2)')
            : 'rgba(200, 200, 200, 0.2)';
          dataset._isDimmed = true;
          needsUpdate = true;
        }
      }
    });
    if (needsUpdate) chart.update();
  }
};

const cartesianScales = {
  x: {
    grid: { display: false, drawBorder: false },
    ticks: { font: { size: 10 } }
  },
  y: {
    border: { dash: [4, 4], display: false },
    grid: { color: '#f3f4f6' },
    ticks: { 
      font: { size: 10 },
      callback: function(value: any) { return formatNumber(value); }
    }
  }
};

export default function ChartRenderer({ chartData, height = 300 }: ChartRendererProps) {
  const renderedChart = useMemo(() => {
    if (!chartData) return null;
    
    // Check if chartData represents "No data" state
    if (
        (Array.isArray(chartData.labels) && chartData.labels.length === 0) ||
        (Array.isArray(chartData.datasets) && chartData.datasets.length === 0)
    ) {
        return null;
    }

    // Format: Forecast
    if (chartData.forecast_values) {
      const isDense = chartData.labels.length > 200;
      const data = {
        labels: chartData.labels,
        datasets: [
          {
            label: 'Real',
            data: chartData.real_values,
            borderColor: '#613eb5',
            backgroundColor: '#613eb5',
            tension: 0.4,
            spanGaps: true,
            pointRadius: isDense ? 0 : 3,
            borderWidth: isDense ? 1 : 2
          },
          {
            label: 'Proyección',
            data: chartData.forecast_values,
            borderColor: '#815ae1',
            borderDash: [5, 5],
            tension: 0.4,
            spanGaps: true,
            pointRadius: isDense ? 0 : 3,
            borderWidth: isDense ? 1 : 2
          },
          {
            label: 'Límite Superior',
            data: chartData.upper_band,
            borderColor: 'transparent',
            backgroundColor: 'rgba(102, 126, 234, 0.15)',
            fill: '+1',
            pointRadius: 0,
            tension: 0.4
          },
          {
            label: 'Límite Inferior',
            data: chartData.lower_band,
            borderColor: 'transparent',
            backgroundColor: 'transparent',
            fill: false,
            pointRadius: 0,
            tension: 0.4
          }
        ]
      };
      const options = { 
        ...chartDefaults,
        scales: cartesianScales,
        plugins: {
          ...chartDefaults.plugins,
          tooltip: {
            mode: 'index',
            intersect: false
          }
        }
      };
      return <Line data={data} options={options} />;
    }

    // Format: Scatter (Segmentation/Anomalies)
    if (chartData.type === 'scatter' && chartData.segments) {
      const datasets = Object.keys(chartData.segments).map((seg, i) => ({
        label: seg,
        data: chartData.segments[seg].x.map((xVal: any, idx: number) => ({
          x: xVal,
          y: chartData.segments[seg].y[idx]
        })),
        backgroundColor: COLORS[i % COLORS.length]
      }));
      const data = { datasets };
      const options = {
        ...chartDefaults,
        scales: {
          x: { ...cartesianScales.x, title: { display: true, text: chartData.x_label || 'X' } },
          y: { ...cartesianScales.y, title: { display: true, text: chartData.y_label || 'Y' } }
        }
      };
      return <Scatter data={data} options={options} />;
    }
    
    // Format: Scatter anomalies / trends
    if (chartData.type === 'scatter' && chartData.normal) {
      const isDense = chartData.normal.x.length > 500;
      const datasets: any[] = [
        {
          label: 'Normal',
          data: chartData.normal.x.map((xVal: any, idx: number) => ({ x: xVal, y: chartData.normal.y[idx] })),
          backgroundColor: 'rgba(129, 90, 225, 0.4)', // Baja opacidad anti-overplotting
          pointRadius: isDense ? 2 : 4,
          borderWidth: 0,
        }
      ];
      
      if (chartData.anomalies) {
        datasets.push({
          label: 'Anomalías',
          data: chartData.anomalies.x.map((xVal: any, idx: number) => ({ x: xVal, y: chartData.anomalies.y[idx] })),
          backgroundColor: '#fa709a', // Color sólido para anomalías (destacan)
          pointRadius: isDense ? 3 : 5,
          borderWidth: 1,
          borderColor: '#fff'
        });
      }

      const data = { datasets };
      const options = { ...chartDefaults, scales: { x: { ...cartesianScales.x, title: { display: true, text: chartData.x_label } }, y: { ...cartesianScales.y, title: { display: true, text: chartData.y_label } } } };
      return <Scatter data={data} options={options} />;
    }

    // Format: Timeseries (from anomalies)
    if (chartData.type === 'timeseries' && chartData.normal) {
        const normalX = chartData.normal.x || [];
        const anomX = chartData.anomalies?.x || [];
        const labels = Array.from(new Set([...normalX, ...anomX])).sort() as string[];
        const isDense = labels.length > 200;
        
        // Map data to full timeline
        const normalData = labels.map(l => {
            const idx = normalX.indexOf(l);
            return idx !== -1 ? chartData.normal.y[idx] : null;
        });
        const anomData = labels.map(l => {
            const idx = anomX.indexOf(l);
            return idx !== -1 ? chartData.anomalies.y[idx] : null;
        });

        const data = {
            labels,
            datasets: [
                {
                    label: 'Normal',
                    data: normalData,
                    backgroundColor: 'rgba(129, 90, 225, 0.6)', // Light transparent purple
                    pointRadius: isDense ? 2 : 4,
                    showLine: false, // CRITICAL: turns off the ugly zigzag line
                    borderWidth: 0
                },
                {
                    label: 'Anomalías',
                    data: anomData,
                    backgroundColor: '#fa709a',
                    pointStyle: 'rectRot',
                    pointRadius: isDense ? 3 : 5,
                    showLine: false,
                    borderWidth: 0
                }
            ]
        };
        const options = { 
            ...chartDefaults,
            plugins: {
                ...chartDefaults.plugins,
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            }
        };
        return <Line data={data} options={options} />;
    }

    // Format: Radar
    if (chartData.type === 'radar') {
      const labels = chartData.metrics || chartData.labels;
      
      const datasets = Object.keys(chartData.datasets).map((key, i) => {
          let rawData = [];
          let realData = null;
          if (Array.isArray(chartData.datasets)) {
              rawData = chartData.datasets[i].data;
              realData = chartData.datasets[i].real_data;
          } else {
              rawData = chartData.datasets[key];
          }
          const label = Array.isArray(chartData.datasets) ? chartData.datasets[i].label : key;
          
          return {
            label: label,
            data: rawData,
            borderColor: COLORS[i % COLORS.length],
            backgroundColor: COLORS[i % COLORS.length] + '40', // 25% opacity
            _raw: rawData, // PATRON 4: Guardamos datos originales
            _realData: realData
          };
      });

      const data = { labels, datasets };
      
      const options = {
        ...chartDefaults,
        plugins: {
          ...chartDefaults.plugins,
          tooltip: {
            callbacks: {
              label: function(ctx: any) {
                const val = ctx.dataset._realData ? ctx.dataset._realData[ctx.dataIndex] : ctx.raw;
                return ` ${ctx.dataset.label}: ${formatNumber(val)}`;
              }
            }
          },
          legend: {
            display: false // Usamos leyenda HTML externa
          }
        }
      };
      return (
        <div className="flex flex-col h-full">
            <div className="flex-1 min-h-0 relative">
                <Radar data={data} options={options} />
            </div>
            <div className="mt-4 flex flex-wrap gap-2 justify-center">
                {datasets.map((ds: any, i: number) => (
                    <div key={i} className="flex items-center text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded-sm border border-gray-100">
                        <span className="w-3 h-3 inline-block mr-2 rounded-full" style={{backgroundColor: ds.borderColor}}></span>
                        {ds.label}
                    </div>
                ))}
            </div>
        </div>
      );
    }


    // Format: Boxplot
    if (chartData.type === 'boxplot') {
      const data = {
        labels: chartData.labels,
        datasets: chartData.datasets.map((ds: any) => ({
          ...ds,
          backgroundColor: 'rgba(200, 255, 106, 0.8)',
          borderColor: '#111',
          borderWidth: 2,
          itemBackgroundColor: '#815ae1'
        }))
      };
      
      const options = {
        ...chartDefaults,
        scales: cartesianScales
      };
      // @sgratzl/chartjs-chart-boxplot can be rendered via generic Chart component or typed if available
      // However, react-chartjs-2 provides <Chart type="boxplot" ... /> for custom controllers
      // Need to import Chart from react-chartjs-2
      return <Chart type="boxplot" data={data as any} options={options} />;
    }

    // Standard Bars/Doughnuts
    if (chartData.labels && chartData.datasets) {
      const data = {
        labels: chartData.labels,
        datasets: chartData.datasets.map((ds: any, i: number) => ({
          ...ds,
          backgroundColor: chartData.type === 'doughnut' ? COLORS : COLORS[i % COLORS.length],
          borderRadius: chartData.type !== 'doughnut' ? 4 : 0
        }))
      };

      const options = { ...chartDefaults };

      if (chartData.type === 'bar_horizontal' || chartData.type === 'tornado') {
        const isTornado = chartData.type === 'tornado';
        
        // For tornado, make positive green/purple and negative red/orange
        if (isTornado) {
            data.datasets[0].backgroundColor = data.datasets[0].data.map((val: number) => 
                val >= 0 ? '#bdf559' : '#fa709a'
            );
            data.datasets[0].borderColor = '#111';
            data.datasets[0].borderWidth = 1;
        }

        const hOptions = { 
            ...chartDefaults,
            indexAxis: 'y',
            scales: { 
                x: cartesianScales.y, 
                y: {
                    ...cartesianScales.x,
                    ticks: {
                        ...cartesianScales.x.ticks,
                        // Truncado algoritmico en el eje Y
                        callback: function(value: any, index: number, ticks: any) {
                            const label = this.getLabelForValue(value);
                            return label.length > 15 ? label.substring(0, 15) + '...' : label;
                        }
                    }
                }
            },
            plugins: {
                ...chartDefaults.plugins,
                tooltip: {
                    callbacks: {
                        // Rescata el nombre completo en el tooltip
                        title: function(ctx: any) {
                            return ctx[0].label;
                        },
                        label: function(ctx: any) {
                            const val = ctx.raw;
                            const prefix = isTornado ? (val >= 0 ? 'Impacto Positivo: ' : 'Impacto Negativo: ') : 'Valor: ';
                            return ` ${prefix}${formatNumber(val)}`;
                        }
                    }
                }
            }
        };
        return <Bar data={data} options={hOptions as any} />;
      }
      if (chartData.type === 'doughnut') {
        const dOptions = { 
            ...chartDefaults, 
            cutout: '70%',
            plugins: {
                ...chartDefaults.plugins,
                legend: {
                    ...chartDefaults.plugins.legend,
                    position: chartData.labels.length > 5 ? 'right' : 'bottom',
                    display: chartData.labels.length <= 15 // Ocultar si hay demasiadas leyendas
                }
            }
        };
        return <Doughnut data={data} options={dOptions} />;
      }
      if (chartData.type === 'line_area') {
        // Line chart with gradient fill
        const lData = {
          labels: chartData.labels,
          datasets: chartData.datasets.map((ds: any, i: number) => ({
            ...ds,
            borderColor: COLORS[i % COLORS.length],
            backgroundColor: 'rgba(129, 90, 225, 0.15)',
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 6
          }))
        };
        const lOptions = { 
            ...chartDefaults, 
            scales: cartesianScales,
            plugins: { ...chartDefaults.plugins, tooltip: { mode: 'index', intersect: false } }
        };
        return <Line data={lData} options={lOptions} />;
      }
      
      const bOptions = { ...chartDefaults, scales: cartesianScales };
      return <Bar data={data} options={bOptions} />;
    }

    return null;
  }, [chartData]);

  if (!renderedChart) {
    return (
      <div className="w-full h-72 bg-white rounded-none flex items-center justify-center text-gray-400 text-sm border border-[#111] border-2">
        Visualización no disponible para esta configuración
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: height === '100%' ? '100%' : `${height}px`, minHeight: '300px' }}>
      {renderedChart}
    </div>
  );
}
