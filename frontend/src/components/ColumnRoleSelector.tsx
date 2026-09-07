'use client';

import React, { useState, useMemo } from 'react';
import { CheckCircle, AlertCircle, Calendar, Hash, Tag, X, ChevronRight } from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ColumnRole = 'numeric' | 'categorical' | 'date' | 'identifier';

export interface ColumnDetail {
  name: string;
  inferred_type: string;
  n_unique: number;
  null_pct: number;
  sample_values: string[];
  suggested_role: ColumnRole;
}

export interface ProfileData {
  filename: string;
  n_rows_estimated: number;
  n_cols: number;
  quality_score: number;
  quality_label: string;
  suggested_targets: string[];
  columns: ColumnDetail[];
  preview_rows: Record<string, any>[];
  upload_id: string;
}

interface ColumnRoleSelectorProps {
  profileData: ProfileData;
  onConfirm: (targetCol: string, columnRoles: Record<string, ColumnRole>) => void;
  onCancel: () => void;
}

// ---------------------------------------------------------------------------
// Role config
// ---------------------------------------------------------------------------

const ROLES: { value: ColumnRole; label: string; icon: React.ReactNode; color: string }[] = [
  { value: 'numeric', label: 'Metrica Numerica', icon: <Hash className="w-3 h-3" />, color: 'bg-violet-100 text-violet-800 border-violet-300' },
  { value: 'categorical', label: 'Dimension', icon: <Tag className="w-3 h-3" />, color: 'bg-lime-100 text-lime-800 border-lime-300' },
  { value: 'date', label: 'Fecha', icon: <Calendar className="w-3 h-3" />, color: 'bg-cyan-100 text-cyan-800 border-cyan-300' },
  { value: 'identifier', label: 'Identificador/Ignorar', icon: <X className="w-3 h-3" />, color: 'bg-gray-100 text-gray-500 border-gray-300' },
];

function getRoleConfig(role: ColumnRole) {
  return ROLES.find((r) => r.value === role) ?? ROLES[0];
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ColumnRoleSelector({
  profileData,
  onConfirm,
  onCancel,
}: ColumnRoleSelectorProps) {
  const [roles, setRoles] = useState<Record<string, ColumnRole>>(() => {
    const initial: Record<string, ColumnRole> = {};
    profileData.columns.forEach((col) => {
      initial[col.name] = col.suggested_role;
    });
    return initial;
  });

  const [targetCol, setTargetCol] = useState<string>(
    profileData.suggested_targets[0] ?? ''
  );

  const numericColumns = useMemo(
    () => profileData.columns.filter((c) => roles[c.name] === 'numeric').map((c) => c.name),
    [roles, profileData.columns]
  );

  const hasValidTarget = targetCol && roles[targetCol] !== 'identifier';

  function handleRoleChange(colName: string, newRole: ColumnRole) {
    setRoles((prev) => ({ ...prev, [colName]: newRole }));
    // If this column was the target and it's now being marked as identifier, clear target
    if (colName === targetCol && newRole === 'identifier') {
      setTargetCol('');
    }
  }

  function handleConfirm() {
    if (!targetCol) return;
    onConfirm(targetCol, roles);
  }

  return (
    <div className="max-w-5xl mx-auto my-6">
      {/* Header */}
      <div className="bg-white border-2 border-[#111] shadow-[4px_4px_0px_#111] p-6 mb-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight mb-1">
              Vista Previa del Dataset
            </h2>
            <p className="text-sm text-gray-500">
              Confirma o ajusta el rol de cada columna antes de iniciar el analisis completo.
            </p>
          </div>
          <div className="text-right text-xs text-gray-500 font-medium space-y-0.5">
            <div><span className="font-black text-gray-900">{profileData.n_rows_estimated.toLocaleString()}</span> filas</div>
            <div><span className="font-black text-gray-900">{profileData.n_cols}</span> columnas</div>
            <div className={`inline-flex items-center gap-1 px-2 py-0.5 border font-bold text-xs ${
              profileData.quality_label === 'Alta' ? 'bg-lime-100 border-lime-400 text-lime-800' :
              profileData.quality_label === 'Media' ? 'bg-amber-100 border-amber-400 text-amber-800' :
              'bg-red-100 border-red-400 text-red-800'
            }`}>
              Calidad: {profileData.quality_score}/100
            </div>
          </div>
        </div>
      </div>

      {/* Target selector */}
      <div className="bg-[#bdf559] border-2 border-[#111] shadow-[4px_4px_0px_#111] p-4 mb-4">
        <p className="text-xs font-black text-gray-700 uppercase tracking-widest mb-2">
          Variable Objetivo (Target)
        </p>
        <div className="flex flex-wrap gap-2">
          {profileData.columns
            .filter((col) => roles[col.name] !== 'identifier')
            .map((col) => (
              <button
                key={col.name}
                onClick={() => setTargetCol(col.name)}
                className={`px-3 py-1.5 text-xs font-bold border-2 border-[#111] transition-all ${
                  targetCol === col.name
                    ? 'bg-[#111] text-white shadow-none translate-x-0.5 translate-y-0.5'
                    : 'bg-white text-gray-800 shadow-[2px_2px_0px_#111] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none'
                }`}
              >
                {targetCol === col.name && <CheckCircle className="inline w-3 h-3 mr-1" />}
                {col.name}
              </button>
            ))}
        </div>
        {!hasValidTarget && (
          <p className="text-xs text-gray-600 mt-2 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Selecciona la columna que quieres predecir o analizar.
          </p>
        )}
      </div>

      {/* Column table */}
      <div className="bg-white border-2 border-[#111] shadow-[4px_4px_0px_#111] overflow-hidden mb-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-[#111] bg-gray-50">
                <th className="text-left px-4 py-3 font-black text-gray-700 uppercase text-xs tracking-wider w-40">Columna</th>
                <th className="text-left px-4 py-3 font-black text-gray-700 uppercase text-xs tracking-wider">Muestra de datos</th>
                <th className="text-left px-4 py-3 font-black text-gray-700 uppercase text-xs tracking-wider w-12">Nulos</th>
                <th className="text-left px-4 py-3 font-black text-gray-700 uppercase text-xs tracking-wider">Rol</th>
                <th className="text-center px-4 py-3 font-black text-gray-700 uppercase text-xs tracking-wider w-20">Target</th>
              </tr>
            </thead>
            <tbody>
              {profileData.columns.map((col, idx) => {
                const currentRole = roles[col.name];
                const roleConfig = getRoleConfig(currentRole);
                const isTarget = targetCol === col.name;
                const isIgnored = currentRole === 'identifier';
                return (
                  <tr
                    key={col.name}
                    className={`border-b border-gray-200 transition-colors ${
                      isTarget ? 'bg-violet-50' : isIgnored ? 'bg-gray-50 opacity-60' : idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'
                    }`}
                  >
                    {/* Column name */}
                    <td className="px-4 py-3">
                      <div className="font-bold text-gray-900 text-xs truncate max-w-[140px]" title={col.name}>
                        {col.name}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">{col.n_unique} unicos</div>
                    </td>

                    {/* Sample values */}
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {col.sample_values.slice(0, 3).map((v, i) => (
                          <span
                            key={i}
                            className="inline-block px-1.5 py-0.5 bg-gray-100 border border-gray-300 text-gray-600 text-xs font-mono truncate max-w-[80px]"
                            title={v}
                          >
                            {v}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Null pct */}
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold ${col.null_pct > 20 ? 'text-red-600' : col.null_pct > 5 ? 'text-amber-600' : 'text-green-600'}`}>
                        {col.null_pct}%
                      </span>
                    </td>

                    {/* Role selector */}
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {ROLES.map((r) => (
                          <button
                            key={r.value}
                            onClick={() => handleRoleChange(col.name, r.value)}
                            className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-bold border transition-all ${
                              currentRole === r.value
                                ? `${r.color} border-2 shadow-[1px_1px_0px_#111]`
                                : 'bg-white text-gray-400 border-gray-200 hover:border-gray-400 hover:text-gray-600'
                            }`}
                          >
                            {r.icon}
                            <span className="hidden sm:inline">{r.label}</span>
                          </button>
                        ))}
                      </div>
                    </td>

                    {/* Target radio */}
                    <td className="px-4 py-3 text-center">
                      {!isIgnored && (
                        <button
                          onClick={() => setTargetCol(col.name)}
                          className={`w-5 h-5 border-2 border-[#111] flex items-center justify-center mx-auto transition-all ${
                            isTarget ? 'bg-[#111]' : 'bg-white hover:bg-gray-100'
                          }`}
                          title="Seleccionar como Target"
                        >
                          {isTarget && <div className="w-2 h-2 bg-[#bdf559]" />}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={onCancel}
          className="px-6 py-2.5 border-2 border-[#111] bg-white text-gray-700 font-bold text-sm shadow-[3px_3px_0px_#111] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
        >
          Cancelar
        </button>

        <div className="flex items-center gap-3">
          {targetCol && (
            <span className="text-xs font-bold text-gray-600">
              Target: <span className="text-violet-700">{targetCol}</span>
            </span>
          )}
          <button
            onClick={handleConfirm}
            disabled={!hasValidTarget}
            className={`inline-flex items-center gap-2 px-8 py-2.5 border-2 border-[#111] font-bold text-sm transition-all ${
              hasValidTarget
                ? 'bg-[#bdf559] text-gray-900 shadow-[4px_4px_0px_#111] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <ChevronRight className="w-4 h-4" />
            Confirmar y Analizar
          </button>
        </div>
      </div>
    </div>
  );
}
