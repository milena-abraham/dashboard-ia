export class ApiError extends Error {
  public status: number;
  
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

const getBaseUrl = (): string => {
  const envUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL;
  if (!envUrl) {
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      return 'https://dashboard-ia-1.onrender.com/api';
    }
    return 'http://localhost:10000/api';
  }
  const clean = envUrl.replace(/\/+$/, '');
  if (clean.endsWith('/api/v1') || clean.endsWith('/api')) return clean;
  return `${clean}/api`;
};

const BASE_URL = getBaseUrl();

async function fetchWithFallback(url: string, init?: RequestInit): Promise<Response> {
  try {
    const response = await fetch(url, init);
    // If backend returns 404 on /api/v1/, auto-retry with legacy /api/ route
    if (response.status === 404 && url.includes('/api/v1/')) {
      const legacyUrl = url.replace('/api/v1/', '/api/');
      try {
        const legacyRes = await fetch(legacyUrl, init);
        return legacyRes;
      } catch {
        // fallback failed, return original response
      }
    }
    return response;
  } catch (err: any) {
    // If mixed content or localhost connection failed in production, try Render directly
    if (url.includes('localhost') && typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
      const remoteUrl = url.replace(/http:\/\/localhost:10000\/api(\/v1)?/, 'https://dashboard-ia-1.onrender.com/api');
      try {
        const remoteRes = await fetch(remoteUrl, init);
        if (remoteRes.ok) return remoteRes;
      } catch {}
    }
    if (err.name === 'TypeError' && (err.message?.includes('fetch') || err.message?.includes('Load failed'))) {
      throw new ApiError(
        'El servidor en la nube de Render está despertando (plan gratuito). Por favor aguardá 30-60 segundos e intentá nuevamente.',
        503
      );
    }
    throw err;
  }
}

async function handleResponse<T>(response: Response, isBlob: boolean = false): Promise<T> {
  const isJson = response.headers.get('content-type')?.includes('application/json');
  
  if (!response.ok) {
    let errorMessage = `HTTP Error ${response.status}`;
    if (response.status === 503 || response.headers.get('x-render-routing')?.includes('hibernate')) {
      errorMessage = 'El servidor de Render está iniciando su contenedor gratuito. Por favor aguardá 30-60 segundos e intentá nuevamente.';
    } else if (response.status === 413) {
      errorMessage = 'El archivo supera el límite permitido por la red (máx 100 MB). Por favor seleccioná un archivo más liviano.';
    } else if (isJson) {
      try {
        const errorData = await response.json();
        if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        }
      } catch (e) {
      }
    } else {
      errorMessage = await response.text();
    }
    throw new ApiError(errorMessage, response.status);
  }

  if (isBlob) {
    return (await response.blob()) as unknown as Promise<T>;
  }
  if (isJson) {
    return (await response.json()) as Promise<T>;
  }
  
  return (await response.text()) as unknown as Promise<T>;
}

export const apiClient = {
  get: async <T>(endpoint: string, init?: RequestInit): Promise<T> => {
    const response = await fetchWithFallback(`${BASE_URL}${endpoint}`, {
      ...init,
      method: 'GET',
    });
    return handleResponse<T>(response);
  },

  post: async <T>(endpoint: string, body?: any, init?: RequestInit): Promise<T> => {
    const isFormData = body instanceof FormData;
    const headers = new Headers(init?.headers);
    if (!isFormData && body) {
      headers.set('Content-Type', 'application/json');
    }
    const response = await fetchWithFallback(`${BASE_URL}${endpoint}`, {
      ...init,
      method: 'POST',
      headers,
      body: isFormData ? body : JSON.stringify(body),
    });
    return handleResponse<T>(response);
  },
  
  postBlob: async (endpoint: string, body?: any, init?: RequestInit): Promise<Blob> => {
    const isFormData = body instanceof FormData;
    const headers = new Headers(init?.headers);
    if (!isFormData && body) {
      headers.set('Content-Type', 'application/json');
    }
    const response = await fetchWithFallback(`${BASE_URL}${endpoint}`, {
      ...init,
      method: 'POST',
      headers,
      body: isFormData ? body : JSON.stringify(body),
    });
    return handleResponse<Blob>(response, true);
  }
};
