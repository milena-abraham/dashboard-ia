'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileSpreadsheet, CheckCircle2, FileJson, XCircle } from 'lucide-react';

interface FileUploaderProps {
  onFileSelect: (files: File[]) => void;
  selectedFiles: File[];
}

export default function FileUploader({ onFileSelect, selectedFiles }: FileUploaderProps) {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[], fileRejections: any[]) => {
    setErrorMsg(null);
    if (fileRejections.length > 0) {
      const err = fileRejections[0].errors[0];
      if (err.code === 'file-too-large') {
        setErrorMsg('El archivo es demasiado grande (Máx 500MB).');
      } else if (err.code === 'file-invalid-type') {
        setErrorMsg('Formato no soportado. Usá .csv, .xlsx, .xls o .json');
      } else {
        setErrorMsg(err.message);
      }
      return;
    }
    
    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive, isDragReject, isDragAccept } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/json': ['.json'],
    },
    multiple: true,
    maxSize: 500 * 1024 * 1024, // 500MB frontal
  });

  // Calculate dynamic classes for drag states
  let borderColor = 'border-[#111] hover:border-indigo-400';
  let bgColor = 'bg-white hover:bg-white/50';
  if (isDragReject) {
    borderColor = 'border-red-500 animate-pulse';
    bgColor = 'bg-red-50/50';
  } else if (isDragAccept) {
    borderColor = 'border-emerald-500 scale-[1.02]';
    bgColor = 'bg-emerald-50/50';
  } else if (isDragActive) {
    borderColor = 'border-mio-violet scale-[1.01]';
    bgColor = 'bg-mio-violet/10/50';
  } else if (selectedFiles.length > 0) {
    borderColor = 'border-emerald-500';
    bgColor = 'bg-emerald-50/30';
  }

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-none p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 ${borderColor} ${bgColor}`}
      >
        <input {...getInputProps()} />

        {selectedFiles.length > 0 ? (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-none bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4 shadow-[4px_4px_0px_#111]">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-gray-900 mb-1">
              {selectedFiles.length === 1 ? selectedFiles[0].name : `${selectedFiles.length} archivos seleccionados`}
            </h4>
            <p className="text-sm text-gray-500 mb-4">
              Cola lista para procesar • {(selectedFiles.reduce((acc, f) => acc + f.size, 0) / (1024 * 1024)).toFixed(2)} MB total
            </p>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-none border border-emerald-300">
              Hacé click o arrastrá para cambiar la selección
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className={`w-16 h-16 rounded-none flex items-center justify-center mb-4 shadow-[4px_4px_0px_#111] transition-transform ${isDragReject ? 'bg-red-100 text-red-500' : 'bg-mio-violet/10 text-mio-violet group-hover:scale-105'}`}>
              {isDragReject ? <XCircle className="w-8 h-8" /> : <UploadCloud className="w-8 h-8" />}
            </div>
            <h4 className={`text-lg font-bold mb-1 ${isDragReject ? 'text-red-600' : 'text-gray-900'}`}>
              {isDragReject ? 'Archivo no válido' : isDragAccept ? 'Soltá para cargar' : 'Arrastrá tus archivos acá'}
            </h4>
            
            {errorMsg ? (
              <p className="text-sm text-red-500 max-w-sm mb-4 font-semibold">{errorMsg}</p>
            ) : (
              <p className="text-sm text-gray-500 max-w-sm mb-4">
                Soporta archivos individuales o múltiples (.csv, .xlsx, .xls, .json)
              </p>
            )}
            
            <div className="flex gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-mio-violet bg-mio-violet/10 border border-mio-violet/20 px-3.5 py-1.5 rounded-none">
                <FileSpreadsheet className="w-3.5 h-3.5" />
                Explorar archivos
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-orange-600 bg-orange-100 border border-orange-200 px-3.5 py-1.5 rounded-none">
                <FileJson className="w-3.5 h-3.5" />
                JSON
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
