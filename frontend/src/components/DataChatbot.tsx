'use client';

import React, { useState, useRef, useEffect } from 'react';
import { askGemini } from '@/lib/api';
import { Send, Bot, RotateCcw, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface DataChatbotProps {
  context: any;
  charts?: any[];
  messages: Message[];
  onMessagesChange: (msgs: Message[]) => void;
  onChartOverride?: (index: number, chartData: any) => void;
}

export default function DataChatbot({ context, charts, messages, onMessagesChange, onChartOverride }: DataChatbotProps) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    const newMessages: Message[] = [...messages, { id: Date.now().toString(), role: 'user', content: userMsg }];
    onMessagesChange(newMessages);
    setIsLoading(true);

    try {
      const result = await askGemini(userMsg, context, charts);
      const assistantMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: result.response };
      onMessagesChange([...newMessages, assistantMsg]);

      // Apply chart override if Gemini returned one
      if (result.chart_override && onChartOverride) {
        const { index, chart_data } = result.chart_override;
        if (typeof index === 'number' && chart_data) {
          onChartOverride(index, chart_data);
        }
      }
    } catch (error: any) {
      onMessagesChange([...newMessages, { id: (Date.now() + 1).toString(), role: 'assistant', content: `**Error**: ${error.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    onMessagesChange([{
      id: '1',
      role: 'assistant',
      content: '¡Chat reiniciado! Soy tu Asistente de Datos MIO. ¿En qué te puedo ayudar?'
    }]);
  };

  return (
    <div className="flex flex-col h-[560px] bg-white rounded-none border border-[#111] border-2 overflow-hidden shadow-[4px_4px_0px_#111]">
      {/* Header */}
      <div className="px-4 py-3 bg-mio-violet border-b-2 border-[#111] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Bot className="w-5 h-5 text-mio-lime" />
          <div>
            <h3 className="font-bold text-white text-sm">Asistente MIO</h3>
            <p className="text-white/60 text-[10px]">Powered by Gemini · Preguntale a tus datos</p>
          </div>
        </div>
        <button
          onClick={handleClearChat}
          title="Limpiar chat"
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/30 rounded-none transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          Reset
        </button>
      </div>
      
      {/* Suggestion pills */}
      {messages.length <= 1 && (
        <div className="px-4 pt-3 pb-1 flex flex-wrap gap-2 border-b border-gray-100">
          {['¿Cuáles son los KPIs más importantes?', '¿Qué anomalías encontraste?', '¿Qué me recomiendas?'].map(s => (
            <button
              key={s}
              onClick={() => { setInput(s); }}
              className="text-[11px] px-3 py-1 border border-mio-violet text-mio-violet hover:bg-mio-violet hover:text-white transition-colors rounded-none font-medium"
            >
              {s}
            </button>
          ))}
        </div>
      )}
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(msg => (
          <div key={msg.id} className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 flex-shrink-0 bg-mio-violet border-2 border-[#111] flex items-center justify-center">
                <Bot className="w-3.5 h-3.5 text-white" />
              </div>
            )}
            <div className={`max-w-[82%] px-4 py-3 border-2 border-[#111] text-sm leading-relaxed ${
              msg.role === 'user'
                ? 'bg-mio-lime text-gray-900 shadow-[2px_2px_0px_#111]'
                : 'bg-white text-gray-800 shadow-[2px_2px_0px_#111]'
            }`}>
              <div className="markdown-content">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {msg.content}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-2.5 justify-start">
            <div className="w-7 h-7 flex-shrink-0 bg-mio-violet border-2 border-[#111] flex items-center justify-center">
              <Bot className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="bg-white border-2 border-[#111] px-4 py-3 flex items-center gap-2 shadow-[2px_2px_0px_#111]">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-mio-violet" />
              <span className="text-sm text-gray-500 font-medium">Analizando...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t-2 border-[#111] bg-[#fafafa]">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Preguntale a tus datos o pedile que modifique un gráfico..."
            className="flex-1 bg-white border-2 border-[#111] rounded-none px-4 py-2.5 text-sm focus:outline-none focus:border-mio-violet transition-colors"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="p-2.5 bg-mio-violet text-white border-2 border-[#111] rounded-none hover:bg-mio-lime hover:text-[#111] disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-[2px_2px_0px_#111]"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[10px] text-gray-400 mt-1.5">Podés pedirle que "cambie el gráfico 1 a barras horizontales"</p>
      </div>
    </div>
  );
}
