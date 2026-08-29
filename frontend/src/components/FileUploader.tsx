'use client';

import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileSpreadsheet, CheckCircle2 } from 'lucide-react';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
}

export default function FileUploader({ onFileSelect, selectedFile }: FileUploaderProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0]);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
    },
    multiple: false,
  });

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 ${
          isDragActive
            ? 'border-indigo-600 bg-indigo-50/50 scale-[1.01]'
            : selectedFile
            ? 'border-emerald-500 bg-emerald-50/30'
            : 'border-gray-200 hover:border-indigo-400 bg-white hover:bg-gray-50/50'
        }`}
      >
        <input {...getInputProps()} />

        {selectedFile ? (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4 shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-gray-900 mb-1">{selectedFile.name}</h4>
            <p className="text-sm text-gray-500 mb-4">
              {(selectedFile.size / 1024).toFixed(1)} KB • Archivo listo para analizar
            </p>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
              Hacé click o arrastrá otro para cambiarlo
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 shadow-sm group-hover:scale-105 transition-transform">
              <UploadCloud className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-gray-900 mb-1">
              {isDragActive ? 'Soltá tu archivo acá' : 'Arrastrá tu archivo Excel o CSV acá'}
            </h4>
            <p className="text-sm text-gray-500 max-w-sm mb-4">
              Soporta planillas de ventas, métricas de clientes, inventarios o balances (.csv, .xlsx, .xls)
            </p>
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 border border-indigo-100 px-3.5 py-1.5 rounded-lg">
              <FileSpreadsheet className="w-3.5 h-3.5" />
              O explorá tus archivos locales
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
