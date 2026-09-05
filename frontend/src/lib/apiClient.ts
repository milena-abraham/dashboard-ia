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
      return 'https://dashboard-ia-1.onrender.com/api/v1';
    }
    return 'http://localhost:10000/api/v1';
  }
  const clean = envUrl.replace(/\/+$/, '');
  if (clean.endsWith('/api/v1')) return clean;
  if (clean.endsWith('/api')) return `${clean}/v1`;
  return `${clean}/api/v1`;
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
        if (legacyRes.ok) {
          return legacyRes;
        }
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
    throw err;
  }
}

async function handleResponse<T>(response: Response, isBlob: boolean = false): Promise<T> {
  const isJson = response.headers.get('content-type')?.includes('application/json');
  
  if (!response.ok) {
    let errorMessage = `HTTP Error ${response.status}`;
    if (isJson) {
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
