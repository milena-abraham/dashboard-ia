import { AnalysisResult } from '@/types/analysis';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function analyzeFile(
  file: File,
  targetCol?: string
): Promise<AnalysisResult> {
  const formData = new FormData();
  formData.append('file', file);
  if (targetCol) {
    formData.append('target_column', targetCol);
  }

  const response = await fetch(`${API_URL}/analyze`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Error desconocido' }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }

  return response.json() as Promise<AnalysisResult>;
}

export async function exportPDF(data: AnalysisResult): Promise<Blob> {
  const response = await fetch(`${API_URL}/export/pdf`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Error al exportar PDF: HTTP ${response.status}`);
  }

  return response.blob();
}
