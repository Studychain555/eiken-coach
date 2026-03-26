/**
 * エラーログ統一管理
 * 構造化ログ、Sentry送信、ローカル保存、メトリクス記録
 */

import { AppError, ErrorType } from './errorHandler';
import { captureException } from './sentry.config';
import { debugError } from './debugUtils';

/**
 * エラーコンテキスト情報
 */
export interface ErrorContext {
  userId?: string;
  sessionId?: string;
  page?: string;
  action?: string;
  userAgent?: string;
  timestamp?: string;
  networkInfo?: {
    online: boolean;
    type?: 'wifi' | 'cellular' | 'unknown';
  };
  customData?: Record<string, any>;
}

/**
 * 構造化ログエントリ
 */
export interface StructuredLog {
  id: string;
  type: ErrorType;
  message: string;
  timestamp: string;
  context: ErrorContext;
  stackTrace?: string;
  statusCode?: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * エラーメトリクス
 */
export interface ErrorMetric {
  errorType: ErrorType;
  userId?: string;
  page?: string;
  timestamp: string;
  statusCode?: number;
}

/**
 * ローカルストレージのエラーログ用キー
 */
const STORAGE_KEY_PREFIX = 'error_log_';
const MAX_STORED_LOGS = 100;

/**
 * エラーログ管理クラス
 */
export class ErrorLogger {
  private storedLogs: StructuredLog[] = [];
  private metrics: ErrorMetric[] = [];

  constructor() {
    this.loadStoredLogs();
  }

  /**
   * エラーをログに記録
   */
  async logError(
    error: AppError,
    context: ErrorContext = {},
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ): Promise<void> {
    try {
      // 1. 構造化ログを作成
      const structuredLog = this.createStructuredLog(error, context, severity);

      // 2. Sentryに送信
      await this.sendToSentry(structuredLog);

      // 3. ローカルストレージに保存
      await this.saveToLocalStorage(structuredLog);

      // 4. メトリクスを記録
      this.recordMetric(structuredLog);

      debugError('ErrorLogger', `Error logged: ${error.type}`, {
        logId: structuredLog.id,
        severity,
        context: context.page,
      });
    } catch (err) {
      debugError('ErrorLogger', 'Failed to log error', err);
    }
  }

  /**
   * 構造化ログを作成
   */
  private createStructuredLog(
    error: AppError,
    context: ErrorContext,
    severity: 'low' | 'medium' | 'high' | 'critical'
  ): StructuredLog {
    return {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: error.type,
      message: error.message,
      timestamp: new Date().toISOString(),
      context: {
        ...context,
        timestamp: context.timestamp || new Date().toISOString(),
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      },
      stackTrace: error.originalError instanceof Error ? error.originalError.stack : undefined,
      statusCode: error.statusCode,
      severity,
    };
  }

  /**
   * Sentryに送信
   */
  private async sendToSentry(log: StructuredLog): Promise<void> {
    try {
      captureException(new Error(log.message), {
        type: log.type,
        severity: log.severity,
        logId: log.id,
        context: log.context,
        statusCode: log.statusCode,
      });
    } catch (err) {
      debugError('ErrorLogger', 'Failed to send to Sentry', err);
    }
  }

  /**
   * ローカルストレージに保存
   */
  private async saveToLocalStorage(log: StructuredLog): Promise<void> {
    try {
      if (typeof localStorage === 'undefined') {
        return;
      }

      this.storedLogs.push(log);

      // 古いログを削除
      if (this.storedLogs.length > MAX_STORED_LOGS) {
        this.storedLogs = this.storedLogs.slice(-MAX_STORED_LOGS);
      }

      // JSON化して保存
      const logsJson = JSON.stringify(this.storedLogs);
      localStorage.setItem(`${STORAGE_KEY_PREFIX}recent`, logsJson);
    } catch (err) {
      debugError('ErrorLogger', 'Failed to save to localStorage', err);
    }
  }

  /**
   * ローカルストレージからログを読み込み
   */
  private loadStoredLogs(): void {
    try {
      if (typeof localStorage === 'undefined') {
        return;
      }

      const logsJson = localStorage.getItem(`${STORAGE_KEY_PREFIX}recent`);
      if (logsJson) {
        this.storedLogs = JSON.parse(logsJson);
      }
    } catch (err) {
      debugError('ErrorLogger', 'Failed to load stored logs', err);
    }
  }

  /**
   * メトリクスを記録
   */
  private recordMetric(log: StructuredLog): void {
    const metric: ErrorMetric = {
      errorType: log.type,
      userId: log.context.userId,
      page: log.context.page,
      timestamp: log.timestamp,
      statusCode: log.statusCode,
    };

    this.metrics.push(metric);

    // 最新1000件のみ保持
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }

    // Google Analyticsに送信（利用可能な場合）
    this.sendToAnalytics(metric);
  }

  /**
   * Google Analyticsに送信
   */
  private sendToAnalytics(metric: ErrorMetric): void {
    try {
      if (typeof window === 'undefined' || !(window as any).gtag) {
        return;
      }

      (window as any).gtag('event', 'error_occurred', {
        error_type: metric.errorType,
        page: metric.page,
        status_code: metric.statusCode,
      });
    } catch (err) {
      // 失敗は無視
    }
  }

  /**
   * 保存されたログを取得
   */
  getStoredLogs(filter?: {
    type?: ErrorType;
    userId?: string;
    page?: string;
    sinceMs?: number;
  }): StructuredLog[] {
    let logs = [...this.storedLogs];

    if (filter) {
      const now = Date.now();

      logs = logs.filter((log) => {
        if (filter.type && log.type !== filter.type) {
          return false;
        }
        if (filter.userId && log.context.userId !== filter.userId) {
          return false;
        }
        if (filter.page && log.context.page !== filter.page) {
          return false;
        }
        if (filter.sinceMs) {
          const logTime = new Date(log.timestamp).getTime();
          if (now - logTime > filter.sinceMs) {
            return false;
          }
        }
        return true;
      });
    }

    return logs;
  }

  /**
   * メトリクスサマリーを取得
   */
  getMetricsSummary(since?: {
    minutes?: number;
    hours?: number;
  }): {
    totalErrors: number;
    byType: Record<ErrorType, number>;
    byPage: Record<string, number>;
    byStatus: Record<number, number>;
  } {
    let metricsToAnalyze = [...this.metrics];

    if (since) {
      const now = Date.now();
      const sinceMs = (since.minutes || 0) * 60 * 1000 + (since.hours || 0) * 60 * 60 * 1000;
      metricsToAnalyze = metricsToAnalyze.filter((m) => {
        const mTime = new Date(m.timestamp).getTime();
        return now - mTime <= sinceMs;
      });
    }

    const summary = {
      totalErrors: metricsToAnalyze.length,
      byType: {} as Record<ErrorType, number>,
      byPage: {} as Record<string, number>,
      byStatus: {} as Record<number, number>,
    };

    metricsToAnalyze.forEach((m) => {
      // By Type
      summary.byType[m.errorType] = (summary.byType[m.errorType] || 0) + 1;

      // By Page
      if (m.page) {
        summary.byPage[m.page] = (summary.byPage[m.page] || 0) + 1;
      }

      // By Status Code
      if (m.statusCode) {
        const statusStr = String(m.statusCode);
        summary.byStatus[statusStr as any] = (summary.byStatus[statusStr as any] || 0) + 1;
      }
    });

    return summary;
  }

  /**
   * ログをクリア
   */
  clearLogs(): void {
    try {
      this.storedLogs = [];
      this.metrics = [];

      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(`${STORAGE_KEY_PREFIX}recent`);
      }

      debugError('ErrorLogger', 'All logs cleared');
    } catch (err) {
      debugError('ErrorLogger', 'Failed to clear logs', err);
    }
  }

  /**
   * ログをエクスポート（デバッグ用）
   */
  exportLogs(): {
    logs: StructuredLog[];
    summary: ReturnType<ErrorLogger['getMetricsSummary']>;
  } {
    return {
      logs: this.getStoredLogs(),
      summary: this.getMetricsSummary(),
    };
  }
}

// グローバルインスタンス
export const errorLogger = new ErrorLogger();

export default errorLogger;
