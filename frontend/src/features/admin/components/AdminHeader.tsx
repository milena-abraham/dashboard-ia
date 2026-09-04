import React from 'react';
import { Database, Trash2 } from 'lucide-react';

interface AdminHeaderProps {
  cleaning: boolean;
  onCleanLogs: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ cleaning, onCleanLogs }) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 border-2 border-[#111] shadow-[6px_6px_0px_#111]">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Database className="w-8 h-8 text-mio-violet" />
          MIO Analytics
        </h1>
        <p className="text-sm text-gray-500 mt-2 font-medium">Panel de Control para Desarrolladores</p>
      </div>
      <button
        onClick={onCleanLogs}
        disabled={cleaning}
        className="flex items-center gap-2 bg-red-50 text-red-600 border-2 border-red-200 px-4 py-2 text-sm font-bold hover:bg-red-100 transition-colors disabled:opacity-50"
      >
        <Trash2 className="w-4 h-4" />
        {cleaning ? 'Limpiando...' : 'Purgar BD'}
      </button>
    </div>
  );
};
