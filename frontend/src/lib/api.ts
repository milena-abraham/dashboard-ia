import { AnalysisResult } from '@/types/analysis';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://dashboard-ia-1.onrender.com';

export async function analyzeFile(
  file: File,
  targetCol?: string
): Promise<AnalysisResult> {
  const formData = new FormData();
  formData.append('file', file);
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

export async function askGemini(message: string, context: any): Promise<{response: string}> {
  const response = await fetch(`${API_URL}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message, context }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.detail || 'Error al comunicarse con el asistente IA.');
  }

  return response.json();
}
