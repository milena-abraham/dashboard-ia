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

  if (chartType === 'BoxPlot' || title.includes('dispersión') || title.includes('cuartiles') || title.includes('boxplot')) {
    return {
      whatItDoes: 'Compara la dispersión estadística, la mediana y los valores atípicos entre grupos o variables.',
      whatItShows: 'La línea central de la caja es la mediana (el 50% típico). La caja encierra la mitad central de los datos (IQR). Los bigotes marcan los límites normales y los puntos rojos señalan casos atípicos.',
      actionHint: 'Compará la altura y posición de las cajas: un grupo con la caja más arriba tiene valores superiores, y una caja más alta indica mayor variabilidad.',
    };
  }

  if (chartType === 'Scatter' || title.includes('relación') || title.includes('correlación')) {
    return {
      whatItDoes: 'Comprueba si dos variables se mueven juntas o si una influye sobre la otra.',
      whatItShows: 'La línea negra marca la dirección general. Si sube hacia la derecha, ambas variables crecen juntas. Si baja, van en sentido opuesto. Los puntos muestran cada dato real.',
      actionHint: 'Si la relación es clara, podés accionar sobre la variable horizontal para impulsar directamente la variable objetivo.',
    };
  }

  if (chartType === 'LineChart' || title.includes('evolución') || title.includes('tiempo') || title.includes('fecha')) {
    return {
      whatItDoes: 'Muestra cómo cambia esta métrica a lo largo de los días, semanas o meses.',
      whatItShows: 'La curva te indica si la tendencia general va subiendo o bajando, y si existen épocas del año con picos o caídas marcadas.',
      actionHint: 'Identificá los momentos con mayores subidas para anticipar recursos, compras o campañas con tiempo.',
    };
  }

  if (chartType === 'Donut' || chartType === 'Pie' || title.includes('composición') || title.includes('participación')) {
    return {
      whatItDoes: 'Muestra qué porcentaje aporta cada grupo sobre el total.',
      whatItShows: 'Te permite ver de un vistazo si tus resultados dependen de una sola categoría o si están bien repartidos.',
      actionHint: 'Si un solo grupo concentra más de la mitad del total, buscá diversificar para no depender de uno solo.',
    };
  }

  if (chartType === 'HorizontalBar' || title.includes('ranking') || title.includes('por ') || title.includes('top')) {
    return {
      whatItDoes: 'Compara el rendimiento de las diferentes opciones ordenadas de mayor a menor.',
      whatItShows: 'Las barras de arriba son las líderes indiscutidas y las que más volumen generan.',
      actionHint: 'Concentrate en las 3 primeras barras para conseguir la mayor parte de tus resultados.',
    };
  }

  // Distribución / Histograma general
  return {
    whatItDoes: 'Muestra en qué rango de números se agrupa la mayor parte de tus datos.',
    whatItShows: 'La barra más alta señala el valor más común y habitual; los extremos son los casos excepcionales o raros.',
    actionHint: 'Tomá decisiones y fijá metas basadas en el rango más frecuente y no en los valores aislados.',
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
          spanClass = 'md:col-span-6 lg:col-span-6';
        } else if (charts.length === 3) {
          spanClass = i === 0 ? 'md:col-span-12 lg:col-span-12' : 'md:col-span-6 lg:col-span-6';
        } else if (charts.length === 4) {
          spanClass = 'md:col-span-6 lg:col-span-6';
        } else if (charts.length === 5) {
          // Fila 1: 8 + 4 = 12 cols (2 gráficos destacados)
          // Fila 2: 4 + 4 + 4 = 12 cols (3 gráficos distribuidos)
          if (i === 0) spanClass = 'md:col-span-12 lg:col-span-8';
          else if (i === 1) spanClass = 'md:col-span-12 lg:col-span-4';
          else spanClass = 'md:col-span-6 lg:col-span-4';
        } else {
          const remainder = charts.length % 3;
          if (remainder === 1 && i === charts.length - 1) {
            spanClass = 'md:col-span-12 lg:col-span-12';
          } else if (remainder === 2 && i >= charts.length - 2) {
            spanClass = 'md:col-span-6 lg:col-span-6';
          } else {
            spanClass = 'md:col-span-6 lg:col-span-4';
          }
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

