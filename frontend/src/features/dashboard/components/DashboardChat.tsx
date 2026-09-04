import React from 'react';
import { Bot } from 'lucide-react';
import DataChatbot, { Message as ChatMessage } from '@/components/DataChatbot';
import { AnalysisResponseSchema, ChartSchema } from '@/types/analysis';

interface DashboardChatProps {
  isAdmin: boolean;
  result: AnalysisResponseSchema;
  charts: ChartSchema[];
  messages: ChatMessage[];
  onMessagesChange: (msgs: ChatMessage[]) => void;
  onChartOverride: (index: number, chartData: any) => void;
}

export const DashboardChat: React.FC<DashboardChatProps> = ({
  isAdmin,
  result,
  charts,
  messages,
  onMessagesChange,
  onChartOverride,
}) => {
  if (!isAdmin) return null;

  return (
    <div className="mt-8 mb-12">
      <div className="bg-white p-6 md:p-8 rounded-none border border-[#111] border-2 shadow-[4px_4px_0px_#111]">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-mio-violet rounded-none">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-xl font-black uppercase tracking-tight">
            Asistente Interactivo IA
          </h3>
        </div>
        <DataChatbot
          context={result}
          charts={charts}
          messages={messages}
          onMessagesChange={onMessagesChange}
          onChartOverride={onChartOverride}
        />
      </div>
    </div>
  );
};
