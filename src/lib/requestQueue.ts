/**
 * リクエストキューイングシステム
 *
 * 機能:
 * - 並行リクエスト数制限（デフォルト5件同時）
 * - 優先度ベースの実行順序
 * - リクエストキャンセル機構
 * - リクエスト統計情報
 */

import { debugError } from './debugUtils';

export type RequestPriority = 'high' | 'normal' | 'low';

export interface QueuedRequest<T> {
  id: string;
  fn: () => Promise<T>;
  priority: number;
  context: {
    url: string;
    method?: string;
    userId?: string;
  };
  resolve: (value: T) => void;
  reject: (reason?: any) => void;
  timestamp: number;
}

export interface RequestQueueStats {
  totalRequests: number;
  activeRequests: number;
  queuedRequests: number;
  completedRequests: number;
  failedRequests: number;
  averageWaitTime: number;
}

/**
 * リクエストキューイングシステム
 */
export class RequestQueue {
  private readonly maxConcurrent: number;
  private activeRequests: number = 0;
  private requestQueue: QueuedRequest<any>[] = [];
  private completedRequests: number = 0;
  private failedRequests: number = 0;
  private totalWaitTime: number = 0;
  private cancelledRequests: Set<string> = new Set();

  constructor(maxConcurrent: number = 5) {
    this.maxConcurrent = maxConcurrent;
    debugError('RequestQueue', `Initialized with max concurrent requests: ${maxConcurrent}`);
  }

  /**
   * リクエストをキューに追加
   */
  async enqueue<T>(
    fn: () => Promise<T>,
    priority: RequestPriority = 'normal',
    context: { url: string; method?: string; userId?: string } = { url: 'unknown' }
  ): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const requestId = this.generateRequestId();

      const queuedRequest: QueuedRequest<T> = {
        id: requestId,
        fn,
        priority: this.priorityToNumber(priority),
        context,
        resolve,
        reject,
        timestamp: Date.now(),
      };

      this.requestQueue.push(queuedRequest);

      // 優先度順でソート（優先度が高いものが先）
      this.requestQueue.sort((a, b) => b.priority - a.priority);

      debugError('RequestQueue', `Request enqueued: ${requestId}`, {
        priority,
        url: context.url,
        queueSize: this.requestQueue.length,
        activeRequests: this.activeRequests,
      });

      this.processNext();
    });
  }

  /**
   * キューの次のリクエストを処理
   */
  private async processNext(): Promise<void> {
    // キューが空か、最大並行数に達している場合は終了
    if (this.activeRequests >= this.maxConcurrent || this.requestQueue.length === 0) {
      return;
    }

    this.activeRequests++;
    const request = this.requestQueue.shift()!;

    // キャンセル済みリクエストはスキップ
    if (this.cancelledRequests.has(request.id)) {
      this.activeRequests--;
      this.cancelledRequests.delete(request.id);
      this.processNext();
      return;
    }

    const waitTime = Date.now() - request.timestamp;
    this.totalWaitTime += waitTime;

    debugError('RequestQueue', `Processing request: ${request.id}`, {
      url: request.context.url,
      waitTime,
      activeRequests: this.activeRequests,
      queueSize: this.requestQueue.length,
    });

    try {
      const result = await request.fn();
      request.resolve(result);
      this.completedRequests++;

      debugError('RequestQueue', `Request completed: ${request.id}`, {
        url: request.context.url,
        duration: Date.now() - (request.timestamp + waitTime),
      });
    } catch (error) {
      request.reject(error);
      this.failedRequests++;

      debugError('RequestQueue', `Request failed: ${request.id}`, {
        url: request.context.url,
        error: error instanceof Error ? error.message : String(error),
      });
    } finally {
      this.activeRequests--;
      this.processNext();
    }
  }

  /**
   * リクエストをキャンセル
   */
  cancelRequest(requestId: string): void {
    this.cancelledRequests.add(requestId);

    const index = this.requestQueue.findIndex((r) => r.id === requestId);
    if (index !== -1) {
      const request = this.requestQueue[index];
      this.requestQueue.splice(index, 1);
      request.reject(new Error(`Request cancelled: ${requestId}`));
      debugError('RequestQueue', `Request cancelled: ${requestId}`);
    }
  }

  /**
   * 優先度の数値に変換
   */
  private priorityToNumber(priority: RequestPriority): number {
    const priorityMap = { high: 3, normal: 2, low: 1 };
    return priorityMap[priority] || 2;
  }

  /**
   * リクエストIDを生成
   */
  private generateRequestId(): string {
    return `req-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * キューの統計情報を取得
   */
  getStats(): RequestQueueStats {
    const averageWaitTime =
      this.completedRequests > 0
        ? this.totalWaitTime / this.completedRequests
        : 0;

    return {
      totalRequests: this.completedRequests + this.failedRequests + this.requestQueue.length,
      activeRequests: this.activeRequests,
      queuedRequests: this.requestQueue.length,
      completedRequests: this.completedRequests,
      failedRequests: this.failedRequests,
      averageWaitTime,
    };
  }

  /**
   * キューをクリア
   */
  clear(): void {
    const size = this.requestQueue.length;
    this.requestQueue.forEach((request) => {
      request.reject(new Error('Request queue cleared'));
    });
    this.requestQueue = [];
    this.cancelledRequests.clear();
    debugError('RequestQueue', `Queue cleared (${size} requests rejected)`);
  }

  /**
   * キューのサイズを取得
   */
  size(): number {
    return this.requestQueue.length;
  }

  /**
   * アクティブなリクエスト数を取得
   */
  getActiveCount(): number {
    return this.activeRequests;
  }
}

// シングルトンインスタンス
let sharedQueue: RequestQueue | null = null;

/**
 * グローバルリクエストキューを取得
 */
export function getRequestQueue(maxConcurrent?: number): RequestQueue {
  if (!sharedQueue) {
    sharedQueue = new RequestQueue(maxConcurrent);
  }
  return sharedQueue;
}

/**
 * リクエストキューをリセット
 */
export function resetRequestQueue(): void {
  if (sharedQueue) {
    sharedQueue.clear();
    sharedQueue = null;
  }
}

/**
 * 使用例:
 *
 * import { getRequestQueue } from '@/lib/requestQueue';
 *
 * const queue = getRequestQueue();
 * const data = await queue.enqueue(
 *   () => fetchUserData(),
 *   'high',
 *   { url: '/api/user', method: 'GET', userId: 'user123' }
 * );
 *
 * // 統計情報を取得
 * console.log(queue.getStats());
 */
