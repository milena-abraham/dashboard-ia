'use client';

import React from 'react';
import { FileSpreadsheet, Calendar, Target, Trash2, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProjectCardProps {
  project: {
    id: string;
    filename: string;
    target_col: string;
    created_at: any;
    quality_score: number;
    kpis: Record<string, any>;
    narrative_text?: string;
  };
  index: number;
  onDelete?: (id: string) => void;
}

export default function ProjectCard({ project, index, onDelete }: ProjectCardProps) {
  const date = project.created_at?.toDate
    ? project.created_at.toDate().toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })
    : 'Fecha desconocida';

  const kpiEntries = Object.entries(project.kpis || {}).slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="bg-white border-2 border-[#111] shadow-[4px_4px_0px_#111] hover:shadow-[6px_6px_0px_#111] hover:-translate-y-0.5 transition-all p-5 flex flex-col gap-4"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 bg-mio-lime border-2 border-[#111] flex items-center justify-center flex-shrink-0 shadow-[2px_2px_0px_#111]">
            <FileSpreadsheet className="w-5 h-5 text-gray-900" />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-gray-900 text-sm truncate">{project.filename}</h3>
            <div className="flex items-center gap-1 mt-0.5">
              <Target className="w-3 h-3 text-mio-violet flex-shrink-0" />
              <span className="text-xs text-mio-violet font-medium truncate">{project.target_col || 'Sin target'}</span>
            </div>
          </div>
        </div>
        <span className="flex-shrink-0 px-2 py-1 bg-mio-violet/10 text-mio-violet text-[10px] font-bold border border-mio-violet/30">
          Q: {Math.round(project.quality_score ?? 0)}%
        </span>
      </div>

      {/* KPIs */}
      {kpiEntries.length > 0 && (
        <div className="grid grid-cols-3 gap-2 border-t-2 border-[#111] pt-3">
          {kpiEntries.map(([label, val]) => (
            <div key={label} className="text-center">
              <p className="text-[10px] text-gray-500 truncate">{label}</p>
              <p className="text-sm font-bold text-gray-900 truncate">
                {typeof val === 'object' ? val?.value ?? '—' : val ?? '—'}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Narrative snippet */}
      {project.narrative_text && (
        <p className="text-[11px] text-gray-500 leading-relaxed line-clamp-2 border-t border-gray-100 pt-2">
          {project.narrative_text.slice(0, 120)}…
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between border-t-2 border-[#111] pt-3 mt-auto">
        <div className="flex items-center gap-1 text-[11px] text-gray-400">
          <Calendar className="w-3 h-3" />
          <span>{date}</span>
        </div>
        {onDelete && (
          <button
            onClick={() => onDelete(project.id)}
            className="flex items-center gap-1 text-[11px] text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 border border-red-200 transition-colors"
          >
            <Trash2 className="w-3 h-3" />
            Eliminar
          </button>
        )}
      </div>
    </motion.div>
  );
}
