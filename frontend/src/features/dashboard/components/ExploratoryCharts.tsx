import React from 'react';
import dynamic from 'next/dynamic';
import { ChartSchema } from '@/types/analysis';
import { ChartLegendExplainer } from '@/components/ChartLegendExplainer';

const DynamicChartRenderer = dynamic(() => import('@/components/DynamicChartRenderer'), { ssr: false });

interface ExploratoryChartsProps {
  charts?: ChartSchema[];
  filename: string;
}

function getExploratoryChartGuide(c: ChartSchema) {
  const chartType = c.layoutDirectives?.chartType || '';
  const title = (c.metadata?.title || '').toLowerCase();

  if (chartType === 'LineChart' || title.includes('evolución') || title.includes('tiempo') || title.includes('fecha')) {
    return {
      whatItDoes: 'Rastrea la evolución temporal continua y la velocidad de cambio de la métrica en el calendario.',
      whatItShows: 'La trayectoria continua destaca picos de actividad, estacionalidad y si la dirección general del negocio es alcista o bajista.',
      actionHint: 'Identificá los meses o semanas con picos recurrentes para planificar stock, recursos o campañas de marketing con anticipación.',
    };
  }

  if (chartType === 'Donut' || chartType === 'Pie' || title.includes('composición') || title.includes('participación')) {
    return {
      whatItDoes: 'Mide la participación proporcional de cada categoría sobre el 100% del total acumulado.',
      whatItShows: 'La proporción de cada sección visualiza el nivel de concentración y la dependencia del negocio respecto a las categorías líderes.',
      actionHint: 'Si una sola categoría concentra más del 50% del volumen, considerá diversificar productos o canales para reducir el riesgo comercial.',
    };
  }

  if (chartType === 'HorizontalBar' || title.includes('ranking') || title.includes('por ') || title.includes('top')) {
    return {
      whatItDoes: 'Ordena y compara el rendimiento absoluto de las diferentes categorías de mayor a menor.',
      whatItShows: 'Las barras superiores representan a los líderes de facturación o volumen, evidenciando la brecha respecto a los segmentos rezagados.',
      actionHint: 'Focalizá tus esfuerzos comerciales en las 3 primeras barras para maximizar el retorno de inversión (Principio de Pareto 80/20).',
    };
  }

  // Distribución / Histograma general
  return {
    whatItDoes: 'Examina la dispersión estadística y la densidad de observaciones a lo largo del espectro de valores.',
    whatItShows: 'Las columnas más altas señalan el rango donde ocurre la mayoría de las operaciones; los extremos muestran valores mínimos y máximos.',
    actionHint: 'Alineá tus precios promedio o metas operativas alrededor del rango con mayor concentración de operaciones.',
  };
}

export const ExploratoryCharts: React.FC<ExploratoryChartsProps> = ({
  charts,
  filename,
}) => {
  if (!charts || charts.length === 0) return null;

  return (
    <>
      {charts.map((c, i) => {
        let spanClass = 'md:col-span-6 lg:col-span-4';
        if (charts.length === 1) {
          spanClass = 'md:col-span-12 lg:col-span-12';
        } else if (charts.length === 2) {
          spanClass = 'md:col-span-12 lg:col-span-6';
        } else if (charts.length === 3) {
          spanClass = i === 0 ? 'md:col-span-12 lg:col-span-12' : 'md:col-span-6 lg:col-span-6';
        } else {
          if (i === 0) spanClass = 'md:col-span-12 lg:col-span-8';
          else if (i === 1) spanClass = 'md:col-span-12 lg:col-span-4';
          else spanClass = 'md:col-span-6 lg:col-span-6';
        }

        const guide = getExploratoryChartGuide(c);

        return (
          <div
            key={`${filename}-chart-${i}`}
            className={`bg-white p-6 flex flex-col rounded-none border border-[#111] border-2 shadow-[4px_4px_0px_#111] transition-transform hover:-translate-y-1 hover:shadow-[6px_6px_0px_#111] ${spanClass}`}
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-lg font-black tracking-tight text-gray-900 leading-tight uppercase">
                {c.metadata?.title}
              </h4>
            </div>
            <p className="text-sm text-gray-500 mb-6 flex-1 font-medium">
              {c.metadata?.insightSubtitle}
            </p>
            <div className="mt-auto relative w-full flex-1 h-[420px]">
              <DynamicChartRenderer key={`${filename}-${i}`} payload={c} height={420} />
            </div>

            {/* Leyenda y Guía de Interpretación debajo del gráfico */}
            <ChartLegendExplainer
              whatItDoes={guide.whatItDoes}
              whatItShows={guide.whatItShows}
              actionHint={guide.actionHint}
              collapsible={true}
              defaultOpen={false}
            />
          </div>
        );
      })}
    </>
  );
};

