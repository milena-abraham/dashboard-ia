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
  height?: number;
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
      borderWidth: 1
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
    ticks: { font: { size: 10 } }
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
    
    // Format: Scatter anomalies
    if (chartData.type === 'scatter' && chartData.normal) {
      const data = {
        datasets: [
          {
            label: 'Normal',
            data: chartData.normal.x.map((xVal: any, idx: number) => ({ x: xVal, y: chartData.normal.y[idx] })),
            backgroundColor: '#815ae1',
            pointRadius: 4,
          },
          {
            label: 'Anomalías',
            data: chartData.anomalies.x.map((xVal: any, idx: number) => ({ x: xVal, y: chartData.anomalies.y[idx] })),
            backgroundColor: '#fa709a',
            pointRadius: 5,
          }
        ]
      };
      const options = { ...chartDefaults, scales: { x: { ...cartesianScales.x, title: { display: true, text: chartData.x_label } }, y: { ...cartesianScales.y, title: { display: true, text: chartData.y_label } } } };
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

      if (chartData.type === 'bar_horizontal') {
        const hOptions = { 
            ...chartDefaults,
            indexAxis: 'y',
            scales: { x: cartesianScales.y, y: cartesianScales.x }
        };
        return <Bar data={data} options={hOptions} />;
      }
      if (chartData.type === 'doughnut') {
        const dOptions = { ...chartDefaults, cutout: '70%' };
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
    <div style={{ position: 'relative', width: '100%', height: `${height}px` }}>
      {renderedChart}
    </div>
  );
}
