import { ApiResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.token = typeof window !== 'undefined' ? localStorage.getItem('life_rpg_token') : null;
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('life_rpg_token', token);
    } else {
      localStorage.removeItem('life_rpg_token');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const clientTimezone =
      typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'UTC';
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-Timezone': clientTimezone,
      ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
      ...((options.headers as Record<string, string>) || {}),
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: options.signal || controller.signal,
      });
      clearTimeout(timeoutId);

      const json = await response.json();
      if (!response.ok) {
        return {
          success: false,
          data: null as unknown as T,
          error: json.error || {
            code: `HTTP_${response.status}`,
            message: json.message || response.statusText || 'An unexpected error occurred.',
          },
        };
      }

      return json;
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      const errorMsg = err instanceof Error ? err.message : 'Network connection failed';
      return {
        success: false,
        data: null as unknown as T,
        error: {
          code: 'NETWORK_ERROR',
          message: errorMsg,
        },
      };
    }
  }

  get<T>(endpoint: string, headers?: Record<string, string>) {
    return this.request<T>(endpoint, { method: 'GET', headers });
  }

  post<T>(endpoint: string, body?: unknown, headers?: Record<string, string>) {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
      headers,
    });
  }

  patch<T>(endpoint: string, body?: unknown, headers?: Record<string, string>) {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
      headers,
    });
  }

  delete<T>(endpoint: string, headers?: Record<string, string>) {
    return this.request<T>(endpoint, { method: 'DELETE', headers });
  }
}

export const api = new ApiClient(API_BASE_URL);
