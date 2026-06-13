import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

const TOKEN_KEY = 'ig_token';

const api = axios.create({
  baseURL: '/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach Authorization header if token exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: unwrap { success, data } envelope; handle 401
api.interceptors.response.use(
  (response: AxiosResponse) => {
    const ct = String(response.headers['content-type'] || '');
    if (!ct.includes('application/json')) {
      return Promise.reject(new Error('Non-JSON response'));
    }
    const body = response.data;
    // Server wraps all responses as { success: true, data: ... }
    if (body && typeof body === 'object' && 'success' in body && 'data' in body) {
      return body.data;
    }
    return body;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Typed helper functions
export async function apiGet<T = unknown>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> {
  return api.get<T, T>(url, config);
}

export async function apiPost<T = unknown>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<T> {
  return api.post<T, T>(url, data, config);
}

export async function apiPut<T = unknown>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<T> {
  return api.put<T, T>(url, data, config);
}

export async function apiDelete<T = unknown>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> {
  return api.delete<T, T>(url, config);
}

export default api;
