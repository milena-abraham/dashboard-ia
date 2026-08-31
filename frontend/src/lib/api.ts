import { AnalysisResult } from '@/types/analysis';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://dashboard-ia-1.onrender.com';

export async function analyzeFile(
  file: File | null,
  fileUrl?: string,
  filenameOverride?: string,
  targetCol?: string
): Promise<AnalysisResult> {
  const formData = new FormData();
  if (file) {
    formData.append('file', file);
  } else if (fileUrl) {
    formData.append('file_url', fileUrl);
    if (filenameOverride) {
      formData.append('filename_override', filenameOverride);
    }
  } else {
    throw new Error('Debe proveer un archivo o una URL');
  }

  if (targetCol) {
    formData.append('target_col', targetCol);
  }

  const response = await fetch(`${API_URL}/api/analyze`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Error desconocido' }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }

  return response.json() as Promise<AnalysisResult>;
}

export async function generateNarrative(data: any): Promise<{text: string, source: string}> {
  const response = await fetch(`${API_URL}/api/narrative`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Error al generar narrativa: HTTP ${response.status}`);
  }

  return response.json();
}

export async function exportPDF(data: any): Promise<Blob> {
  const response = await fetch(`${API_URL}/api/export/pdf`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Error al exportar PDF: HTTP ${response.status}`);
  }

  return response.blob();
}

export async function askGemini(message: string, context: any, charts?: any[]): Promise<{response: string, chart_override?: {index: number, chart_data: any} | null}> {
  const response = await fetch(`${API_URL}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message, context, charts: charts || [] }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.detail || 'Error al comunicarse con el asistente IA.');
  }

  return response.json();
}

export async function exportPPTX(data: any): Promise<Blob> {
  const response = await fetch(`${API_URL}/api/export/pptx`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Error al exportar PPTX: HTTP ${response.status}`);
  }

  return await response.blob();
}
