import React from 'react';
import dynamic from 'next/dynamic';
import { Target } from 'lucide-react';
import { ChartSchema } from '@/types/analysis';
import ChartErrorBoundary from '@/components/ChartErrorBoundary';
import { ChartLegendExplainer } from '@/components/ChartLegendExplainer';

const DynamicChartRenderer = dynamic(() => import('@/components/DynamicChartRenderer'), { ssr: false });

interface FeatureImportanceSectionProps {
  chartImportance?: ChartSchema;
  chartShap?: ChartSchema;
  filename: string;
}

export const FeatureImportanceSection: React.FC<FeatureImportanceSectionProps> = ({
  chartImportance,
  chartShap,
  filename,
}) => {
  if (!chartImportance) return null;

  return (
    <div className="md:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-none border border-[#111] border-2 shadow-[4px_4px_0px_#111] flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-6">
            <Target className="w-5 h-5 text-mio-violet" />
            <h3 className="text-xl font-black uppercase tracking-tight">
              Impacto Base (Gini)
            </h3>
          </div>
          <div className="relative w-full h-[420px]">
            <ChartErrorBoundary>
              <DynamicChartRenderer
                key={`feat-imp-${filename}`}
                payload={chartImportance}
                height={420}
              />
            </ChartErrorBoundary>
          </div>
        </div>

        <ChartLegendExplainer
          whatItDoes="Entrena un ensamble de árboles de decisión (LightGBM) para medir qué porcentaje del comportamiento de la variable objetivo es explicado por cada factor."
          whatItShows="Las barras más largas señalan las variables prioritarias del negocio (las palancas que más mueven el resultado final)."
          actionHint="Enfocá tus decisiones y promociones en las 3 variables líderes para maximizar el impacto comercial directo."
          collapsible={true}
          defaultOpen={false}
        />
      </div>

      {chartShap && (
        <div className="bg-white p-6 rounded-none border border-[#111] border-2 shadow-[4px_4px_0px_#111] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Target className="w-5 h-5 text-[#bdf559]" />
              <h3 className="text-xl font-black uppercase tracking-tight">
                Atribución (SHAP)
              </h3>
            </div>
            <div className="relative w-full h-[420px]">
              <ChartErrorBoundary>
                <DynamicChartRenderer
                  key={`feat-shap-${filename}`}
                  payload={chartShap}
                  height={420}
                />
              </ChartErrorBoundary>
            </div>
          </div>

          <ChartLegendExplainer
            whatItDoes="Aplica teoría de juegos cooperativos (Shapley Values) para desglosar la contribución neta y transparente de cada variable individual."
            whatItShows="Indica si un factor ejerce una presión alcista o bajista sobre la métrica, revelando no solo cuánto influye sino en qué dirección."
            actionHint="Utilizá esta atribución causal para sustentar decisiones estratégicas ante directores o inversores con total respaldo matemático."
            collapsible={true}
            defaultOpen={false}
          />
        </div>
      )}
    </div>
  );
};
