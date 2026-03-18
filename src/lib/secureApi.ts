/**
 * セキュアな API クライアント
 * CSRF 保護、レート制限、リクエスト検証を実装
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { CSRFTokenManager, RateLimiter, AuditLogger, SecurityConfig } from './securityManager';
import { retryWithExponentialBackoff } from './apiErrorHandler';

export interface SecureApiConfig extends AxiosRequestConfig {
  skipCsrfCheck?: boolean;
  skipRateLimit?: boolean;
  rateLimitKey?: string;
  maxRetries?: number;
}

export class SecureApiClient {
  private client: AxiosInstance;
  private baseURL: string;

  constructor(baseURL: string = process.env.EXPO_PUBLIC_API_URL || 'https://api.eigomaster.jp') {
    this.baseURL = baseURL;

    this.client = axios.create({
      baseURL,
      timeout: SecurityConfig.API_TIMEOUT_MS,
      maxBodyLength: SecurityConfig.MAX_REQUEST_SIZE,
      maxContentLength: SecurityConfig.MAX_REQUEST_SIZE,
    });

    // リクエストインターセプター
    this.client.interceptors.request.use(
      (config) => this.onRequest(config),
      (error) => this.onRequestError(error)
    );

    // レスポンスインターセプター
    this.client.interceptors.response.use(
      (response) => this.onResponse(response),
      (error) => this.onResponseError(error)
    );
  }

  /**
   * GET リクエスト
   */
  async get<T>(
    url: string,
    config?: SecureApiConfig
  ): Promise<AxiosResponse<T>> {
    return this.request<T>('GET', url, undefined, config);
  }

  /**
   * POST リクエスト
   */
  async post<T>(
    url: string,
    data?: any,
    config?: SecureApiConfig
  ): Promise<AxiosResponse<T>> {
    return this.request<T>('POST', url, data, config);
  }

  /**
   * PUT リクエスト
   */
  async put<T>(
    url: string,
    data?: any,
    config?: SecureApiConfig
  ): Promise<AxiosResponse<T>> {
    return this.request<T>('PUT', url, data, config);
  }

  /**
   * PATCH リクエスト
   */
  async patch<T>(
    url: string,
    data?: any,
    config?: SecureApiConfig
  ): Promise<AxiosResponse<T>> {
    return this.request<T>('PATCH', url, data, config);
  }

  /**
   * DELETE リクエスト
   */
  async delete<T>(
    url: string,
    config?: SecureApiConfig
  ): Promise<AxiosResponse<T>> {
    return this.request<T>('DELETE', url, undefined, config);
  }

  /**
   * プライベート: リクエスト実行
   */
  private async request<T>(
    method: string,
    url: string,
    data?: any,
    config: SecureApiConfig = {}
  ): Promise<AxiosResponse<T>> {
    const {
      skipCsrfCheck = false,
      skipRateLimit = false,
      rateLimitKey = url,
      maxRetries = 3,
      ...axiosConfig
    } = config;

    // レート制限チェック
    if (!skipRateLimit) {
      const canRequest = await RateLimiter.checkRateLimit(
        rateLimitKey,
        SecurityConfig.API_RATE_LIMIT,
        60 * 1000 // 1分
      );

      if (!canRequest) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
    }

    // CSRF チェック（安全でないメソッドのみ）
    if (!skipCsrfCheck && this.isUnsafeMethod(method)) {
      const csrfToken = await CSRFTokenManager.getToken();
      if (!csrfToken) {
        throw new Error('CSRF token not found');
      }
      axiosConfig.headers = {
        ...axiosConfig.headers,
        [CSRFTokenManager.getHeaderName()]: csrfToken,
      };
    }

    // リトライロジック付きでリクエスト実行
    return retryWithExponentialBackoff(
      () => this.client.request<T>({
        method,
        url,
        data,
        ...axiosConfig,
      }),
      maxRetries
    );
  }

  /**
   * リクエストインターセプター
   */
  private async onRequest(config: any): Promise<any> {
    // リクエスト ID を追加
    config.headers['X-Request-ID'] = this.generateRequestId();

    // タイムスタンプを追加
    config.headers['X-Request-Time'] = new Date().toISOString();

    // Content-Type を検証
    if (config.data && !config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json';
    }

    // リクエストサイズを検証
    if (config.data) {
      const size = this.estimateSize(config.data);
      if (size > SecurityConfig.MAX_REQUEST_SIZE) {
        throw new Error(`Request size exceeds limit: ${size} > ${SecurityConfig.MAX_REQUEST_SIZE}`);
      }
    }

    return config;
  }

  /**
   * リクエストエラーハンドラ
   */
  private onRequestError(error: any): Promise<any> {
    console.error('[SecureApiClient] Request error:', error);
    return Promise.reject(error);
  }

  /**
   * レスポンスインターセプター
   */
  private async onResponse(response: AxiosResponse): Promise<AxiosResponse> {
    // レスポンスヘッダを検証
    const requestId = response.config.headers['X-Request-ID'];
    if (requestId) {
      console.debug(`[SecureApiClient] Request ${requestId} succeeded`);
    }

    // レスポンスサイズを検証
    const size = this.estimateSize(response.data);
    if (size > SecurityConfig.MAX_REQUEST_SIZE) {
      throw new Error(`Response size exceeds limit: ${size} > ${SecurityConfig.MAX_REQUEST_SIZE}`);
    }

    return response;
  }

  /**
   * レスポンスエラーハンドラ
   */
  private async onResponseError(error: any): Promise<any> {
    console.error('[SecureApiClient] Response error:', error);

    // 監査ログを記録
    if (error.response) {
      const { status, config } = error.response;
      console.error(`[SecureApiClient] API error: ${status} ${config.url}`);
    }

    return Promise.reject(error);
  }

  /**
   * プライベート: リクエスト ID を生成
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * プライベート: データサイズを推定
   */
  private estimateSize(data: any): number {
    return new Blob([JSON.stringify(data)]).size;
  }

  /**
   * プライベート: 安全でないメソッドか判定
   */
  private isUnsafeMethod(method: string): boolean {
    return ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase());
  }
}

/**
 * グローバル API クライアントインスタンス
 */
export const secureApi = new SecureApiClient();

/**
 * API リクエスト用フック（React Native）
 */
export async function useSecureApi<T>(
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  url: string,
  data?: any,
  config?: SecureApiConfig
): Promise<T> {
  try {
    let response: AxiosResponse<T>;

    switch (method) {
      case 'GET':
        response = await secureApi.get<T>(url, config);
        break;
      case 'POST':
        response = await secureApi.post<T>(url, data, config);
        break;
      case 'PUT':
        response = await secureApi.put<T>(url, data, config);
        break;
      case 'PATCH':
        response = await secureApi.patch<T>(url, data, config);
        break;
      case 'DELETE':
        response = await secureApi.delete<T>(url, config);
        break;
      default:
        throw new Error(`Unsupported HTTP method: ${method}`);
    }

    return response.data;
  } catch (error) {
    console.error(`[SecureApi] ${method} ${url} failed:`, error);
    throw error;
  }
}
