/**
 * グローバルエラーハンドラー
 * アプリケーション全体のエラーを一元管理
 * Sentry統合、ユーザー通知、リトライロジックなど
 */

import { useAppStore } from '@/src/stores/appStore';
import { captureException, setSentryUser } from './sentry.config';
import { ErrorType, AppError, getUserFriendlyMessage } from './errorHandler';
import { debugError } from './debugUtils';

/**
 * エラー重大度のレベル
 */
export enum ErrorSeverity {
  LOW = 'low', // トースト表示
  MEDIUM = 'medium', // トースト表示 + ユーザー注意
  HIGH = 'high', // トースト表示 + ログ記録
  CRITICAL = 'critical', // モーダル表示 + リダイレクト候補
}

/**
 * リトライ可能なエラー
 */
export interface RetryableError {
  error: AppError;
  retryFn: () => Promise<any>;
  attempts: number;
  maxAttempts: number;
  backoffMs: number;
}

/**
 * エラーリスナー
 */
export type ErrorListener = (error: AppError) => void;

/**
 * グローバルエラーハンドラークラス
 */
export class GlobalErrorHandler {
  private errorQueue: Map<string, AppError> = new Map();
  private retryQueue: Map<string, RetryableError> = new Map();
  private errorListeners: Set<ErrorListener> = new Set();
  private notificationDelay: number = 0; // 通知を遅延させるための時間

  constructor() {
    this.setupGlobalErrorListeners();
  }

  /**
   * グローバルエラーリスナーの設定
   */
  private setupGlobalErrorListeners(): void {
    // 未処理のPromiseエラーをキャッチ
    if (typeof window !== 'undefined') {
      window.addEventListener('unhandledrejection', (event) => {
        const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
        this.registerError(
          {
            type: ErrorType.UNKNOWN,
            message: error.message,
            originalError: error,
            timestamp: new Date(),
            tag: 'UnhandledPromiseRejection',
          },
          undefined
        );
      });

      window.addEventListener('error', (event) => {
        this.registerError(
          {
            type: ErrorType.UNKNOWN,
            message: event.message,
            originalError: event.error,
            timestamp: new Date(),
            tag: 'GlobalErrorEvent',
          },
          undefined
        );
      });
    }
  }

  /**
   * エラーを登録・処理
   */
  registerError(
    error: AppError,
    retryFn?: () => Promise<any>,
    context?: Record<string, any>
  ): void {
    // エラーID生成
    const errorId = `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    error.id = errorId;

    // 1. エラー重大度を計算
    const severity = this.calculateSeverity(error);

    // 2. Sentryに送信
    this.sendToSentry(error, context, severity);

    // 3. ユーザーに通知
    this.notifyUser(error, severity);

    // 4. リトライ可能な場合は登録
    if (retryFn && this.isRetryable(error)) {
      this.registerRetryable({
        error,
        retryFn,
        attempts: 0,
        maxAttempts: 3,
        backoffMs: 1000,
      });
    }

    // 5. イベント発火
    this.emit(error);

    // 6. エラーキューに追加
    this.errorQueue.set(errorId, error);

    // デバッグログ
    debugError('GlobalErrorHandler', `Error registered: ${error.type}`, {
      errorId,
      severity,
      hasRetry: !!retryFn,
      context,
    });
  }

  /**
   * エラー重大度を計算
   */
  private calculateSeverity(error: AppError): ErrorSeverity {
    // ステータスコードベース
    if (error.statusCode) {
      if (error.statusCode >= 500) return ErrorSeverity.CRITICAL;
      if (error.statusCode === 429) return ErrorSeverity.HIGH;
      if (error.statusCode === 401 || error.statusCode === 403) return ErrorSeverity.CRITICAL;
      if (error.statusCode >= 400) return ErrorSeverity.MEDIUM;
    }

    // エラータイプベース
    switch (error.type) {
      case ErrorType.NETWORK:
        return ErrorSeverity.HIGH;
      case ErrorType.TIMEOUT:
        return ErrorSeverity.MEDIUM;
      case ErrorType.PERMISSION:
        return ErrorSeverity.CRITICAL;
      case ErrorType.API_ERROR:
        return ErrorSeverity.CRITICAL;
      case ErrorType.VALIDATION:
        return ErrorSeverity.MEDIUM;
      default:
        return ErrorSeverity.MEDIUM;
    }
  }

  /**
   * Sentryに送信
   */
  private sendToSentry(error: AppError, context?: Record<string, any>, severity?: ErrorSeverity): void {
    try {
      if (error.originalError instanceof Error) {
        captureException(error.originalError, {
          type: error.type,
          userMessage: error.message,
          severity,
          ...context,
        });
      } else {
        captureException(new Error(error.message), {
          type: error.type,
          severity,
          ...context,
        });
      }
    } catch (err) {
      debugError('GlobalErrorHandler', 'Failed to send error to Sentry', err);
    }
  }

  /**
   * ユーザーに通知
   */
  private notifyUser(error: AppError, severity: ErrorSeverity): void {
    const appStore = useAppStore.getState();

    // 通知を遅延させる（同時多重通知を避ける）
    clearTimeout(this.notificationDelay as any);
    this.notificationDelay = window.setTimeout(() => {
      if (severity === ErrorSeverity.CRITICAL) {
        // モーダル表示（次画面遷移が必要）
        // TODO: ErrorModalStoreまたはグローバルModalコンポーネントに統合
        appStore.setGlobalError(error.message);
      } else {
        // トースト表示
        const type = severity === ErrorSeverity.HIGH ? 'warning' : 'error';
        appStore.addToast(error.message, type as any, 4000);
      }
    }, 100) as any;
  }

  /**
   * スマートリトライ実行
   */
  async retryWithBackoff(errorId: string): Promise<boolean> {
    const retryable = this.retryQueue.get(errorId);
    if (!retryable) {
      debugError('GlobalErrorHandler', `Retry not found for error: ${errorId}`);
      return false;
    }

    const backoff = retryable.backoffMs * Math.pow(2, retryable.attempts);

    try {
      debugError('GlobalErrorHandler', `Retrying error ${errorId} (attempt ${retryable.attempts + 1})`, {
        backoffMs: backoff,
      });

      await new Promise((resolve) => setTimeout(resolve, backoff));
      await retryable.retryFn();

      // リトライ成功
      this.retryQueue.delete(errorId);
      debugError('GlobalErrorHandler', `Retry successful for error: ${errorId}`);
      return true;
    } catch (err) {
      retryable.attempts++;

      if (retryable.attempts >= retryable.maxAttempts) {
        this.retryQueue.delete(errorId);
        debugError('GlobalErrorHandler', `Max retries exceeded for error: ${errorId}`, err);
        return false;
      }

      // 再帰的にリトライ
      return this.retryWithBackoff(errorId);
    }
  }

  /**
   * リトライ可能かチェック
   */
  private isRetryable(error: AppError): boolean {
    // リトライ不可なエラータイプ
    const nonRetryable = [
      ErrorType.PERMISSION,
      ErrorType.VALIDATION,
      ErrorType.NOT_FOUND,
    ];

    if (nonRetryable.includes(error.type)) {
      return false;
    }

    // ステータスコードベース
    if (error.statusCode) {
      // 5xx, 429, 503はリトライ可能
      return error.statusCode >= 500 || error.statusCode === 429 || error.statusCode === 503;
    }

    return true;
  }

  /**
   * リトライ可能なエラーを登録
   */
  private registerRetryable(retryable: RetryableError): void {
    const errorId = retryable.error.id || `retry-${Date.now()}`;
    this.retryQueue.set(errorId, retryable);
  }

  /**
   * エラーリスナー登録
   */
  onError(listener: ErrorListener): () => void {
    this.errorListeners.add(listener);

    // アンリスナー関数を返す
    return () => {
      this.errorListeners.delete(listener);
    };
  }

  /**
   * イベント発火
   */
  private emit(error: AppError): void {
    this.errorListeners.forEach((listener) => {
      try {
        listener(error);
      } catch (err) {
        debugError('GlobalErrorHandler', 'Error in error listener', err);
      }
    });
  }

  /**
   * ユーザー情報を設定（Sentry追跡用）
   */
  setUser(userId: string, email?: string, username?: string): void {
    try {
      setSentryUser(userId, email, username);
      debugError('GlobalErrorHandler', 'User information set for error tracking', {
        userId,
        email,
      });
    } catch (err) {
      debugError('GlobalErrorHandler', 'Failed to set user information', err);
    }
  }

  /**
   * エラーキューをクリア
   */
  clearErrorQueue(): void {
    this.errorQueue.clear();
    this.retryQueue.clear();
  }

  /**
   * エラー統計を取得
   */
  getStats(): {
    totalErrors: number;
    retryingErrors: number;
    errorTypes: Record<string, number>;
  } {
    const stats = {
      totalErrors: this.errorQueue.size,
      retryingErrors: this.retryQueue.size,
      errorTypes: {} as Record<string, number>,
    };

    this.errorQueue.forEach((error) => {
      stats.errorTypes[error.type] = (stats.errorTypes[error.type] || 0) + 1;
    });

    return stats;
  }
}

// グローバルインスタンス
export const globalErrorHandler = new GlobalErrorHandler();

/**
 * エラーハンドラー使用例
 *
 * import { globalErrorHandler } from '@/lib/globalErrorHandler';
 * import { handleError } from '@/lib/errorHandler';
 *
 * try {
 *   const data = await fetchData();
 * } catch (err) {
 *   globalErrorHandler.registerError(
 *     handleError(err, 'DataFetch', { url: '/api/data' }),
 *     () => fetchData() // リトライ関数
 *   );
 * }
 */

export default globalErrorHandler;
