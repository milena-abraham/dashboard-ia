'use client';

import React from 'react';
import { ArrowRight, Database, Link2 } from 'lucide-react';

interface JoinStep {
  left: string;
  right: string;
  key: string;
  type: string;
  rows_before: number;
  rows_after: number;
}

interface JoinSummary {
  tables_detected: string[];
  join_keys: string[];
  total_rows: number;
  total_columns?: number;
  message?: string;
  join_log: JoinStep[];
}

interface DatasetJoinPanelProps {
  joinSummary: JoinSummary;
}

function fmtNum(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return n.toLocaleString();
}

export default function DatasetJoinPanel({ joinSummary }: DatasetJoinPanelProps) {
  if (!joinSummary || joinSummary.tables_detected.length <= 1) return null;

  return (
    <div className="bg-white border-2 border-[#111] shadow-[4px_4px_0px_#111] p-5 mb-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-[#111]">
        <div className="w-8 h-8 bg-[#111] flex items-center justify-center">
          <Link2 className="w-4 h-4 text-[#bdf559]" />
        </div>
        <div>
          <h3 className="font-black text-gray-900 uppercase tracking-tight text-sm">
            Union Relacional Auto-Detectada
          </h3>
          <p className="text-xs text-gray-500">
            {joinSummary.tables_detected.length} tablas consolidadas en {fmtNum(joinSummary.total_rows)} filas
            {joinSummary.total_columns ? ` x ${joinSummary.total_columns} columnas` : ''}
          </p>
        </div>
      </div>

      {/* Tables diagram */}
      <div className="flex items-center gap-2 flex-wrap mb-4">
        {joinSummary.tables_detected.map((table, idx) => (
          <React.Fragment key={table}>
            <div className="flex items-center gap-1.5 px-3 py-2 bg-violet-50 border-2 border-violet-300 shadow-[2px_2px_0px_#111]">
              <Database className="w-3.5 h-3.5 text-violet-600" />
              <span className="text-xs font-black text-violet-800 uppercase">{table}</span>
            </div>
            {idx < joinSummary.tables_detected.length - 1 && (
              <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Join keys */}
      {joinSummary.join_keys.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-black text-gray-600 uppercase tracking-wider mb-1.5">
            Claves de Union
          </p>
          <div className="flex flex-wrap gap-2">
            {joinSummary.join_keys.map((key) => (
              <span
                key={key}
                className="inline-flex items-center gap-1 px-2 py-1 bg-[#bdf559] border-2 border-[#111] text-xs font-black text-gray-900 shadow-[1px_1px_0px_#111]"
              >
                <span className="font-mono">{key}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Join log */}
      {joinSummary.join_log.length > 0 && (
        <details className="group">
          <summary className="text-xs font-bold text-gray-500 cursor-pointer hover:text-gray-700 select-none">
            Ver detalle de uniones aplicadas ({joinSummary.join_log.length})
          </summary>
          <div className="mt-2 space-y-1.5">
            {joinSummary.join_log.map((step, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 text-xs bg-gray-50 border border-gray-200 px-3 py-2"
              >
                <span className="font-mono font-bold text-violet-700 uppercase">{step.type} JOIN</span>
                <span className="text-gray-500">
                  <span className="font-bold text-gray-700">{step.left}</span>
                  {' + '}
                  <span className="font-bold text-gray-700">{step.right}</span>
                  {' via '}
                  <code className="bg-gray-200 px-1 py-0.5 text-gray-800">{step.key}</code>
                </span>
                <span className="ml-auto text-gray-400">
                  {fmtNum(step.rows_before)} → <span className="font-bold text-gray-700">{fmtNum(step.rows_after)}</span> filas
                </span>
              </div>
            ))}
          </div>
        </details>
      )}

      {/* Message fallback */}
      {joinSummary.message && (
        <p className="text-xs text-gray-500 italic">{joinSummary.message}</p>
      )}
    </div>
  );
}
