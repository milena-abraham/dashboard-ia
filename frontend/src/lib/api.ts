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

  const cleanBaseUrl = API_URL.replace(/\/+$/, '');
  const endpoint = cleanBaseUrl.endsWith('/api') ? `${cleanBaseUrl}/analyze` : `${cleanBaseUrl}/api/analyze`;

  const response = await fetch(endpoint, {
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
  const cleanBaseUrl = API_URL.replace(/\/+$/, '');
  const endpoint = cleanBaseUrl.endsWith('/api') ? `${cleanBaseUrl}/export/pdf` : `${cleanBaseUrl}/api/export/pdf`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Error al exportar PDF: HTTP ${response.status}`);
  }

  return response.blob();
}
