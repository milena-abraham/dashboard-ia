import { AnalysisResponseSchema, NarrativeSchema } from '@/types/analysis';
import { apiClient } from './apiClient';

export async function analyzeFile(
  file: File | null,
  fileUrl?: string,
  filenameOverride?: string,
  targetCol?: string,
  existingFilename?: string
): Promise<AnalysisResponseSchema> {
  const formData = new FormData();
  if (file) {
    formData.append('file', file);
  } else if (existingFilename) {
    formData.append('existing_filename', existingFilename);
  } else if (fileUrl) {
    formData.append('file_url', fileUrl);
    if (filenameOverride) {
      formData.append('filename_override', filenameOverride);
    }
  } else {
    throw new Error('Debe proveer un archivo o el nombre de un archivo existente.');
  }

  if (targetCol) {
    formData.append('target_col', targetCol);
  }

  return apiClient.post<AnalysisResponseSchema>('/analyze', formData);
}

export async function generateNarrative(data: any): Promise<NarrativeSchema> {
  return apiClient.post<NarrativeSchema>('/narrative', data);
}

export async function askGemini(message: string, context: any, charts?: any[]): Promise<{response: string, chart_override?: {index: number, chart_data: any} | null}> {
  return apiClient.post('/chat', { message, context, charts: charts || [] });
}

export async function exportPDF(data: any): Promise<Blob> {
  return apiClient.postBlob('/export/pdf', data);
}

export async function exportPPTX(data: any): Promise<Blob> {
  return apiClient.postBlob('/export/pptx', data);
}
