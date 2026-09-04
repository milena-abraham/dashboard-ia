import React from 'react';
import dynamic from 'next/dynamic';
import { ChartSchema } from '@/types/analysis';

const DynamicChartRenderer = dynamic(() => import('@/components/DynamicChartRenderer'), { ssr: false });

interface ExploratoryChartsProps {
  charts?: ChartSchema[];
  filename: string;
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
            <div className="mt-auto relative w-full flex-1 h-[400px]">
              <DynamicChartRenderer key={`${filename}-${i}`} payload={c} />
            </div>
          </div>
        );
      })}
    </>
  );
};
