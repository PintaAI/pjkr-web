import { HakgyoSDKConfig } from '../config';
import { ApiError, NetworkError } from '../errors';
import { ApiResponse } from '../types/api';
import { withRetry } from '../utils/retry';
import { logger } from '../utils/logger';
import { getAuthClient } from '../auth/client';

export class ApiClient {
  private config: HakgyoSDKConfig;

  constructor(config: HakgyoSDKConfig) {
    this.config = config;
  }

  public setConfig(config: HakgyoSDKConfig) {
    this.config = config;
  }

  private async getHeaders(contentType: string = 'application/json'): Promise<Headers> {
    const headers = new Headers();
    headers.append('Content-Type', contentType);
    headers.append('Accept', 'application/json');
    headers.append('Origin', this.config.baseURL);

    try {
        const authClient = getAuthClient();
        // Assuming getCookie returns a string or promise of string
        // Note: Check actual return type of getCookie in better-auth docs.
        // It says "const cookies = authClient.getCookie()".
        // It might be synchronous if it just formats stored values?
        // Or if it needs to access SecureStore (async), it must be async.
        // But guide shows no await.
        // However, better-auth client is platform aware.
        // Let's assume sync for now as per guide, but if it fails we check types.
        // Wait, SecureStore is async. How can it be sync?
        // Maybe it uses a cached value in memory?
        // If "disableCache: true", then it might need async?
        // Guide: "const cookies = authClient.getCookie();"
        
        // Let's try to inspect return type or handle promise if it is one.
        const cookiesResult = (authClient as any).getCookie();
        const cookies = cookiesResult instanceof Promise ? await cookiesResult : cookiesResult;

        if (cookies) {
             headers.append('Cookie', cookies);
        }
    } catch (e) {
        // Ignore if auth not init
    }

    return headers;
  }

  public async request<T>(
    method: string,
    path: string,
    body?: unknown,
    customHeaders?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    const url = `${this.config.baseURL}${path}`;
    
    return withRetry(async () => {
      try {
        const headers = await this.getHeaders();
        if (customHeaders) {
          Object.entries(customHeaders).forEach(([key, value]) => {
            headers.append(key, value);
          });
        }

        const options: RequestInit = {
          method,
          headers,
          body: body ? JSON.stringify(body) : undefined,
        };

        // Add timeout using AbortSignal.timeout() if configured
        if (this.config.api?.timeout) {
          options.signal = AbortSignal.timeout(this.config.api.timeout);
        }

        const response = await fetch(url, options);
        return await this.handleResponse<T>(response);

      } catch (error) {
        if (error instanceof ApiError) {
          throw error;
        }
        throw new NetworkError('Network request failed', error);
      }
    }, {
      retries: this.config.api?.retries,
      onRetry: (error, attempt) => {
        logger.warn(`Retrying request to ${path} (attempt ${attempt})`, error);
      },
      shouldRetry: (error: unknown) => {
        if (error instanceof ApiError) {
          // Don't retry 4xx errors, except 429 (Too Many Requests) or 408 (Request Timeout)
          if (error.status && error.status >= 400 && error.status < 500) {
            return error.status === 429 || error.status === 408;
          }
        }
        return true;
      }
    });
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    if (!response.ok) {
      let data;
      try {
        data = await response.json();
      } catch {
        data = null;
      }
      
      throw new ApiError(
        data?.message || data?.error || 'API request failed',
        response.status,
        data,
        data?.code
      );
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return {
        success: true,
        data: undefined,
      } as ApiResponse<T>;
    }

    const data = await response.json();
    logger.debug('API Response:', JSON.stringify(data, null, 2));
    return {
      success: true,
      data,
    };
  }

  public get<T>(path: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    let url = path;
    if (params) {
      const queryString = new URLSearchParams(
        Object.entries(params).reduce((acc, [key, value]) => {
          if (value !== undefined && value !== null) {
            acc[key] = String(value);
          }
          return acc;
        }, {} as Record<string, string>)
      ).toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }
    return this.request<T>('GET', url);
  }

  public post<T>(path: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>('POST', path, body);
  }

  public put<T>(path: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', path, body);
  }

  public patch<T>(path: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>('PATCH', path, body);
  }

  public delete<T>(path: string): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', path);
  }
}

export const apiClient = new ApiClient({ baseURL: '' });
