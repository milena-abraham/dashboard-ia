export class ApiError extends Error {
  public status: number;
  
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export const getBaseUrl = (): string => {
  // En el navegador de producción (dashboard-mio.vercel.app o cualquier dominio que no sea localhost)
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    const envUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL;
    if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
      const clean = envUrl.replace(/\/+$/, '');
      if (clean.endsWith('/api/v1') || clean.endsWith('/api')) return clean;
      return `${clean}/api`;
    }
    return 'https://dashboard-ia-1.onrender.com/api';
  }

  // En entorno local de desarrollo
  const envUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL;
  if (!envUrl) {
    return 'http://localhost:10000/api';
  }
  const clean = envUrl.replace(/\/+$/, '');
  if (clean.endsWith('/api/v1') || clean.endsWith('/api')) return clean;
  return `${clean}/api`;
};

async function fetchWithFallback(endpoint: string, init?: RequestInit): Promise<Response> {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}${endpoint}`;

  try {
    const response = await fetch(url, init);
    // Si la ruta v1 responde 404, reintento transparente con ruta legacy /api/
    if (response.status === 404 && url.includes('/api/v1/')) {
      const legacyUrl = url.replace('/api/v1/', '/api/');
      try {
        const legacyRes = await fetch(legacyUrl, init);
        return legacyRes;
      } catch {
        // Fallback falló, retornar respuesta original
      }
    }
    return response;
  } catch (err: any) {
    if (err.name === 'TypeError' && (err.message?.includes('fetch') || err.message?.includes('Load failed') || err.message?.includes('NetworkError'))) {
      try {
        const healthRes = await fetch('https://dashboard-ia-1.onrender.com/api/health', { method: 'GET', signal: AbortSignal.timeout(3500) });
        if (healthRes.status === 503 || healthRes.headers.get('x-render-routing')?.includes('hibernate')) {
          throw new ApiError(
            'El servidor en la nube de Render está despertando (plan gratuito). Por favor aguardá 30-60 segundos e intentá nuevamente.',
            503
          );
        }
      } catch (healthErr: any) {
        if (healthErr instanceof ApiError) throw healthErr;
      }
      throw new ApiError(
        'No se pudo conectar con el servidor en la nube. Verificá tu conexión o aguardá unos segundos si el servidor se está iniciando.',
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
    if (response.status === 502) {
      errorMessage = 'El servidor de Render se reinició o agotó temporalmente su memoria. Por favor reintentá en unos momentos.';
    } else if (response.status === 503 || response.headers.get('x-render-routing')?.includes('hibernate')) {
      errorMessage = 'El servidor en la nube de Render está despertando (plan gratuito). Por favor aguardá 30-60 segundos e intentá nuevamente.';
    } else if (response.status === 504) {
      errorMessage = 'El procesamiento excedió el tiempo límite del servidor. Por favor seleccioná un archivo más liviano.';
    } else if (response.status === 413) {
      errorMessage = 'El archivo supera el límite permitido por la red (máximo 100 MB). Por favor seleccioná un archivo más liviano.';
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
    const response = await fetchWithFallback(endpoint, {
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
    const response = await fetchWithFallback(endpoint, {
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
    const response = await fetchWithFallback(endpoint, {
      ...init,
      method: 'POST',
      headers,
      body: isFormData ? body : JSON.stringify(body),
    });
    return handleResponse<Blob>(response, true);
  }
};
