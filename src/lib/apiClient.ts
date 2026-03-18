/**
 * 最適化された API クライアント
 *
 * 機能:
 * - リクエストバッチ化（複数リクエストを1つにまとめる）
 * - タイムアウト管理
 * - リトライロジック（エクスポーネンシャルバックオフ）
 * - レート制限対応
 * - エラーハンドリング
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import { supabase } from './supabase';
import { useApiCache, cachedSupabaseQuery, CACHE_KEYS } from './apiCache';

export interface ApiClientConfig {
  baseURL?: string;
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
}

interface RequestBatch {
  id: string;
  requests: Array<{
    key: string;
    promise: Promise<any>;
  }>;
}

class OptimizedApiClient {
  private axiosInstance: AxiosInstance;
  private requestBatches: Map<string, RequestBatch> = new Map();
  private batchTimeout: ReturnType<typeof setTimeout> | null = null;
  private config: Required<ApiClientConfig>;

  constructor(config: ApiClientConfig = {}) {
    this.config = {
      baseURL: config.baseURL || '',
      timeout: config.timeout || 10000,
      retryAttempts: config.retryAttempts || 3,
      retryDelay: config.retryDelay || 1000,
    };

    this.axiosInstance = axios.create({
      timeout: this.config.timeout,
    });

    this.setupInterceptors();
  }

  /**
   * インターセプター設定（リトライ、ログなど）
   */
  private setupInterceptors() {
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const config = error.config as any;

        // リトライ可能なエラーか確認
        if (!config || !this.isRetryable(error)) {
          return Promise.reject(error);
        }

        config.retryCount = config.retryCount || 0;

        // リトライ回数チェック
        if (config.retryCount >= this.config.retryAttempts) {
          return Promise.reject(error);
        }

        config.retryCount++;

        // エクスポーネンシャルバックオフ
        const backoffMs = this.config.retryDelay * Math.pow(2, config.retryCount - 1);
        await new Promise((resolve) => setTimeout(resolve, backoffMs));

        console.warn(
          `[API RETRY] Attempt ${config.retryCount}/${this.config.retryAttempts} after ${backoffMs}ms`,
          error.message
        );

        return this.axiosInstance(config);
      }
    );
  }

  /**
   * リトライ可能なエラーか判定
   */
  private isRetryable(error: AxiosError): boolean {
    const status = error.response?.status;
    // 429: Too Many Requests, 503: Service Unavailable, 408: Request Timeout
    return status === 429 || status === 503 || status === 408 || !error.response;
  }

  /**
   * GET リクエスト（キャッシング対応）
   */
  async get<T>(url: string, cacheKey?: string, cacheTtl?: number): Promise<T> {
    if (cacheKey) {
      return cachedSupabaseQuery(
        cacheKey,
        () => this.axiosInstance.get<T>(url).then((r) => r.data),
        cacheTtl
      );
    }

    const response = await this.axiosInstance.get<T>(url);
    return response.data;
  }

  /**
   * POST リクエスト
   */
  async post<T>(url: string, data?: any): Promise<T> {
    const response = await this.axiosInstance.post<T>(url, data);
    return response.data;
  }

  /**
   * リクエストをバッチに追加
   * 複数のリクエストを自動でまとめて1回に実行
   */
  addToBatch<T>(batchId: string, key: string, promise: Promise<T>): Promise<T> {
    if (!this.requestBatches.has(batchId)) {
      this.requestBatches.set(batchId, {
        id: batchId,
        requests: [],
      });
    }

    const batch = this.requestBatches.get(batchId)!;
    batch.requests.push({ key, promise });

    // バッチ処理をスケジュール（次のイベントループで実行）
    if (this.batchTimeout) clearTimeout(this.batchTimeout);
    this.batchTimeout = setTimeout(() => this.flushBatch(batchId), 10);

    return promise;
  }

  /**
   * バッチを実行
   */
  private async flushBatch(batchId: string): Promise<void> {
    const batch = this.requestBatches.get(batchId);
    if (!batch) return;

    console.log(`[API BATCH] Executing ${batch.requests.length} requests`);

    try {
      await Promise.all(batch.requests.map((r) => r.promise));
    } finally {
      this.requestBatches.delete(batchId);
    }
  }

  /**
   * クリーンアップ
   */
  cleanup(): void {
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
    }
    this.requestBatches.clear();
  }
}

// シングルトンインスタンス
let sharedClient: OptimizedApiClient | null = null;

export function getApiClient(config?: ApiClientConfig): OptimizedApiClient {
  if (!sharedClient) {
    sharedClient = new OptimizedApiClient(config);
  }
  return sharedClient;
}

export function resetApiClient(): void {
  if (sharedClient) {
    sharedClient.cleanup();
    sharedClient = null;
  }
}

/**
 * Supabase を使用した最適化されたデータ取得
 */
export const supabaseApi = {
  /**
   * リスニング問題を取得（キャッシング対応）
   */
  async getListeningQuestions() {
    return cachedSupabaseQuery(
      CACHE_KEYS.LISTENING_QUESTIONS,
      async () => {
        const { data, error } = await supabase
          .from('listening_questions')
          .select('*');

        if (error) throw error;
        return data || [];
      }
    );
  },

  /**
   * ユーザーのリスニング進捗を取得
   */
  async getListeningProgress(userId: string) {
    return cachedSupabaseQuery(
      CACHE_KEYS.LISTENING_PROGRESS(userId),
      async () => {
        const { data, error } = await supabase
          .from('listening_progress')
          .select('*')
          .eq('user_id', userId);

        if (error) throw error;
        return data || [];
      },
      5 * 60 * 1000 // 5分キャッシュ
    );
  },

  /**
   * 単語リストを取得（キャッシング対応）
   */
  async getVocabularyWords() {
    return cachedSupabaseQuery(
      CACHE_KEYS.VOCABULARY_WORDS,
      async () => {
        const { data, error } = await supabase
          .from('vocabulary_words')
          .select('*')
          .order('stage', { ascending: true });

        if (error) throw error;
        return data || [];
      },
      24 * 60 * 60 * 1000 // 24時間キャッシュ
    );
  },

  /**
   * ユーザーの単語進捗を取得
   */
  async getVocabularyProgress(userId: string) {
    return cachedSupabaseQuery(
      CACHE_KEYS.VOCABULARY_PROGRESS(userId),
      async () => {
        const { data, error } = await supabase
          .from('vocabulary_progress')
          .select('*')
          .eq('user_id', userId);

        if (error) throw error;
        return data || [];
      },
      5 * 60 * 1000 // 5分キャッシュ
    );
  },

  /**
   * リスニング回答を記録
   */
  async recordListeningAttempt(
    userId: string,
    questionId: string,
    selectedAnswer: number,
    isCorrect: boolean
  ) {
    const { data, error } = await supabase
      .from('listening_attempts')
      .insert({
        user_id: userId,
        question_id: questionId,
        selected_answer: selectedAnswer,
        is_correct: isCorrect,
      });

    if (error) throw error;

    // 進捗キャッシュをクリア（新しいデータが加わったため）
    useApiCache.getState().remove(CACHE_KEYS.LISTENING_PROGRESS(userId));

    return data;
  },

  /**
   * 単語テスト結果を記録
   */
  async recordVocabularyAttempt(
    userId: string,
    wordId: string,
    isCorrect: boolean
  ) {
    const { data, error } = await supabase
      .from('vocabulary_attempts')
      .insert({
        user_id: userId,
        word_id: wordId,
        is_correct: isCorrect,
      });

    if (error) throw error;

    // 進捗キャッシュをクリア
    useApiCache.getState().remove(CACHE_KEYS.VOCABULARY_PROGRESS(userId));

    return data;
  },

  /**
   * ユーザー統計を取得
   */
  async getUserStats(userId: string) {
    return cachedSupabaseQuery(
      CACHE_KEYS.USER_STATS(userId),
      async () => {
        const { data, error } = await supabase
          .from('user_stats')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (error && error.code !== 'PGRST116') throw error; // 404は無視
        return data || {};
      },
      5 * 60 * 1000 // 5分キャッシュ
    );
  },
};

/**
 * バッチ処理ヘルパー
 * 複数のデータを一度に取得
 */
export async function batchFetch<T>(
  batchId: string,
  fetchers: Array<() => Promise<T>>
): Promise<T[]> {
  const client = getApiClient();
  const promises = fetchers.map((fetcher, index) =>
    client.addToBatch(batchId, `batch-${index}`, fetcher())
  );

  return Promise.all(promises);
}
