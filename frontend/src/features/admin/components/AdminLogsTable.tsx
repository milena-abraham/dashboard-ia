import React from 'react';
import { Search, Database } from 'lucide-react';
import LogDetailsRenderer from '@/components/LogDetailsRenderer';

interface AdminLogsTableProps {
  logs: any[];
  filteredLogs: any[];
  filterType: string;
  onFilterChange: (type: string) => void;
  search: string;
  onSearchChange: (search: string) => void;
}

function FilterButton({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 text-xs font-bold border-2 border-[#111] transition-all ${
        active
          ? 'bg-gray-900 text-white shadow-none translate-y-[2px]'
          : 'bg-white text-gray-600 shadow-[2px_2px_0px_#111] hover:bg-gray-50'
      }`}
    >
      {children}
    </button>
  );
}

export const AdminLogsTable: React.FC<AdminLogsTableProps> = ({
  logs,
  filteredLogs,
  filterType,
  onFilterChange,
  search,
  onSearchChange,
}) => {
  return (
    <div className="space-y-8">
      {/* Right Column: Interactive Table */}
      <div className="bg-white border-2 border-[#111] shadow-[6px_6px_0px_#111] flex flex-col h-[650px]">
        {/* Toolbar */}
        <div className="p-4 border-b-2 border-[#111] bg-gray-50 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="flex gap-2">
            <FilterButton active={filterType === 'all'} onClick={() => onFilterChange('all')}>
              Todos
            </FilterButton>
            <FilterButton active={filterType === 'auth'} onClick={() => onFilterChange('auth')}>
              Auth
            </FilterButton>
            <FilterButton active={filterType === 'analysis'} onClick={() => onFilterChange('analysis')}>
              Análisis
            </FilterButton>
            <FilterButton active={filterType === 'error'} onClick={() => onFilterChange('error')}>
              Errores
            </FilterButton>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar UID, error..."
              className="w-full pl-9 pr-4 py-2 text-sm border-2 border-[#111] focus:outline-none focus:ring-2 focus:ring-mio-violet/50"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto p-0">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 sticky top-0 border-b-2 border-[#111] shadow-sm">
              <tr>
                <th className="p-4 text-xs font-bold text-gray-900 uppercase">Hora</th>
                <th className="p-4 text-xs font-bold text-gray-900 uppercase">Evento</th>
                <th className="p-4 text-xs font-bold text-gray-900 uppercase">Detalle / Metadata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-gray-500">
                    No hay eventos para mostrar
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="p-4 text-sm text-gray-500 whitespace-nowrap">
                      {log.timestamp?.toDate ? log.timestamp.toDate().toLocaleTimeString() : '-'}
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center px-2 py-1 text-xs font-bold border-2 border-[#111] shadow-[2px_2px_0px_#111] ${
                          log.type.includes('error')
                            ? 'bg-red-400 text-white'
                            : log.type.includes('auth')
                            ? 'bg-mio-lime text-black'
                            : log.type.includes('chat')
                            ? 'bg-blue-400 text-white'
                            : 'bg-mio-violet text-white'
                        }`}
                      >
                        {log.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4 text-xs">
                      <LogDetailsRenderer log={log} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Model Metrics Section */}
      <div className="bg-white border-2 border-[#111] shadow-[6px_6px_0px_#111] flex flex-col max-h-[400px]">
        <div className="p-4 border-b-2 border-[#111] bg-mio-lime">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <Database className="w-5 h-5" />
            Métricas de Rendimiento de Modelos
          </h3>
        </div>
        <div className="flex-1 overflow-auto p-0">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 sticky top-0 border-b-2 border-[#111] shadow-sm">
              <tr>
                <th className="p-4 text-xs font-bold text-gray-900 uppercase">Dataset</th>
                <th className="p-4 text-xs font-bold text-gray-900 uppercase">Prophet (Predicción)</th>
                <th className="p-4 text-xs font-bold text-gray-900 uppercase">Isolation Forest (Anomalías)</th>
                <th className="p-4 text-xs font-bold text-gray-900 uppercase">LightGBM (Factores)</th>
                <th className="p-4 text-xs font-bold text-gray-900 uppercase">PCA (Segmentación)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {logs.filter((l) => l.type === 'analysis_success' && l.metrics).length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    No hay métricas de modelos aún
                  </td>
                </tr>
              ) : (
                logs
                  .filter((l) => l.type === 'analysis_success' && l.metrics)
                  .map((log) => (
                    <tr key={`metric-${log.id}`} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 text-xs font-bold text-gray-700">{log.filename || 'Desconocido'}</td>
                      <td className="p-4 text-xs text-gray-600">
                        {log.metrics.forecast?.error ? (
                          <span className="text-red-500">Error: {log.metrics.forecast.error}</span>
                        ) : log.metrics.forecast?.mae ? (
                          `MAE: ${log.metrics.forecast.mae} | MAPE: ${log.metrics.forecast.mape}%`
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="p-4 text-xs text-gray-600">
                        {log.metrics.anomalies?.error ? (
                          <span className="text-red-500">Error: {log.metrics.anomalies.error}</span>
                        ) : log.metrics.anomalies?.pct_anomalias !== undefined || log.metrics.anomalies?.pctAnomalias !== undefined ? (
                          `${log.metrics.anomalies.n_anomalias ?? log.metrics.anomalies.nAnomalias} anomalías (${log.metrics.anomalies.pct_anomalias ?? log.metrics.anomalies.pctAnomalias}%)`
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="p-4 text-xs text-gray-600">
                        {log.metrics.feature_importance?.error || log.metrics.featureImportance?.error ? (
                          <span className="text-red-500">Error: {log.metrics.feature_importance?.error || log.metrics.featureImportance?.error}</span>
                        ) : (log.metrics.feature_importance?.n_features || log.metrics.featureImportance?.nFeatures) ? (
                          `${log.metrics.feature_importance?.n_features || log.metrics.featureImportance?.nFeatures} variables analizadas`
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="p-4 text-xs text-gray-600">
                        {log.metrics.segmentation?.error ? (
                          <span className="text-red-500">Error: {log.metrics.segmentation.error}</span>
                        ) : (log.metrics.segmentation?.varianza_explicada_pca !== undefined || log.metrics.segmentation?.varianzaExplicadaPca !== undefined) ? (
                          `K=${log.metrics.segmentation.k} | Varianza PCA: ${log.metrics.segmentation.varianza_explicada_pca ?? log.metrics.segmentation.varianzaExplicadaPca}%`
                        ) : (
                          '-'
                        )}
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
