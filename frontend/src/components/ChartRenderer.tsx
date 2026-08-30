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
import { Line, Bar, Doughnut, Radar, Scatter } from 'react-chartjs-2';

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
  Filler
);

interface ChartRendererProps {
  chartData: any;
  height?: number;
}

const COLORS = [
  "#815ae1", "#bdf559", "#a282fa", "#d4fc88", 
  "#613eb5", "#92d433", "#c6b0f7"
];

// PATRON 1: chartDefaults shared config
const chartDefaults: any = {
  responsive: true,
  maintainAspectRatio: false,
  animation: { duration: 500 }, // Reduce animation time for performance
  normalized: true, // Huge performance boost for Chart.js
  plugins: {
    legend: {
      position: 'bottom' as const,
    },
    tooltip: {
      mode: 'index',
      intersect: false,
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

export default function ChartRenderer({ chartData, height = 300 }: ChartRendererProps) {
  const renderedChart = useMemo(() => {
    if (!chartData) return null;

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
      const options = { ...chartDefaults };
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
          x: { title: { display: true, text: chartData.x_label || 'X' } },
          y: { title: { display: true, text: chartData.y_label || 'Y' } }
        }
      };
      return <Scatter data={data} options={options} />;
    }
    
    // Format: Scatter anomalies
    if (chartData.type === 'scatter' && chartData.normal) {
      const data = {
        datasets: [
          {
            label: 'Normal',
            data: chartData.normal.x.map((xVal: any, idx: number) => ({ x: xVal, y: chartData.normal.y[idx] })),
            backgroundColor: '#815ae1',
          },
          {
            label: 'Anomalías',
            data: chartData.anomalies.x.map((xVal: any, idx: number) => ({ x: xVal, y: chartData.anomalies.y[idx] })),
            backgroundColor: '#fa709a',
            pointRadius: 6,
          }
        ]
      };
      const options = { ...chartDefaults, scales: { x: { title: { display: true, text: chartData.x_label } }, y: { title: { display: true, text: chartData.y_label } } } };
      return <Scatter data={data} options={options} />;
    }

    // Format: Timeseries (from anomalies)
    if (chartData.type === 'timeseries' && chartData.normal) {
        const labels = Array.from(new Set([...chartData.normal.x, ...chartData.anomalies.x])).sort() as string[];
        const isDense = labels.length > 200;
        
        // Map data to full timeline
        const normalData = labels.map(l => {
            const idx = chartData.normal.x.indexOf(l);
            return idx !== -1 ? chartData.normal.y[idx] : null;
        });
        const anomData = labels.map(l => {
            const idx = chartData.anomalies.x.indexOf(l);
            return idx !== -1 ? chartData.anomalies.y[idx] : null;
        });

        const data = {
            labels,
            datasets: [
                {
                    label: 'Normal',
                    data: normalData,
                    backgroundColor: 'rgba(129, 90, 225, 0.3)', // Light transparent purple
                    pointRadius: isDense ? 2 : 4,
                    showLine: false, // CRITICAL: turns off the ugly zigzag line
                    borderWidth: 0
                },
                {
                    label: 'Anomalías',
                    data: anomData,
                    backgroundColor: '#fa709a',
                    pointStyle: 'rectRot',
                    pointRadius: isDense ? 4 : 6,
                    showLine: false,
                    borderWidth: 0
                }
            ]
        };
        return <Line data={data} options={{ ...chartDefaults }} />;
    }

    // Format: Radar
    if (chartData.type === 'radar') {
      const labels = chartData.metrics || chartData.labels;
      
      const datasets = Object.keys(chartData.datasets).map((key, i) => {
          let rawData = [];
          if (Array.isArray(chartData.datasets)) {
              rawData = chartData.datasets[i].data;
          } else {
              rawData = chartData.datasets[key];
          }
          const label = Array.isArray(chartData.datasets) ? chartData.datasets[i].label : key;
          
          return {
            label: label,
            data: rawData,
            borderColor: COLORS[i % COLORS.length],
            backgroundColor: COLORS[i % COLORS.length] + '40', // 25% opacity
            _raw: rawData // PATRON 4: Guardamos datos originales
          };
      });

      const data = { labels, datasets };
      
      // PATRON 3 & 4
      const options = {
        ...chartDefaults,
        plugins: {
          ...chartDefaults.plugins,
          tooltip: {
            callbacks: {
              label: function(ctx: any) {
                const val = ctx.raw;
                return ` ${ctx.dataset.label}: ${val}`;
              }
            }
          },
          legend: {
            position: 'bottom',
            onClick: function(e: any, legendItem: any, legend: any) {
              const index = legendItem.datasetIndex;
              const chart = legend.chart;
              chart.isDatasetVisible(index) ? chart.hide(index) : chart.show(index);
              
              // Renormalización omitida aquí para simplificar, pero se podría agregar
              chart.update();
            }
          }
        }
      };
      return <Radar data={data} options={options} />;
    }

    // Standard Bars/Doughnuts
    if (chartData.labels && chartData.datasets) {
      const data = {
        labels: chartData.labels,
        datasets: chartData.datasets.map((ds: any, i: number) => ({
          ...ds,
          backgroundColor: chartData.type === 'doughnut' ? COLORS : COLORS[i % COLORS.length]
        }))
      };

      const options = { ...chartDefaults };

      if (chartData.type === 'bar_horizontal') {
        options.indexAxis = 'y';
        return <Bar data={data} options={options} />;
      }
      if (chartData.type === 'doughnut') {
        options.cutout = '70%';
        return <Doughnut data={data} options={options} />;
      }
      return <Bar data={data} options={options} />;
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
    <div style={{ position: 'relative', width: '100%', height: `${height}px` }}>
      {renderedChart}
    </div>
  );
}
