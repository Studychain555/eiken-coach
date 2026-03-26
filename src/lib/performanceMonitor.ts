/**
 * パフォーマンス計測
 * Core Web Vitals、API応答時間、メモリ使用量を監視
 */

import { startPerformanceTrace, finishPerformanceTrace, captureAPIMetrics } from './sentry.config';
import { debugError } from './debugUtils';

/**
 * Core Web Vitals メトリクス
 */
export interface WebVitals {
  LCP?: number; // Largest Contentful Paint (ms)
  FID?: number; // First Input Delay (ms)
  CLS?: number; // Cumulative Layout Shift
  TTFB?: number; // Time to First Byte (ms)
}

/**
 * パフォーマンス計測結果
 */
export interface PerformanceMetrics {
  timestamp: string;
  webVitals: WebVitals;
  apiMetrics: {
    endpoint: string;
    duration: number;
    statusCode: number;
    cached: boolean;
  }[];
  memoryUsage?: {
    used: number;
    total: number;
    percentage: number;
  };
  errorRate: number; // エラー発生率 (%)
}

/**
 * パフォーマンス計測クラス
 */
export class PerformanceMonitor {
  private webVitals: WebVitals = {};
  private apiMetrics: PerformanceMetrics['apiMetrics'] = [];
  private errorCount: number = 0;
  private requestCount: number = 0;
  private observer?: PerformanceObserver;
  private baseline?: PerformanceMetrics;

  constructor() {
    this.initializeWebVitalsObserver();
  }

  /**
   * Web Vitals オブザーバーの初期化
   */
  private initializeWebVitalsObserver(): void {
    if (typeof window === 'undefined' || !window.PerformanceObserver) {
      return;
    }

    try {
      // Largest Contentful Paint
      const paintObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.webVitals.LCP = lastEntry.startTime;
      });

      paintObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // First Input Delay
      const interactionObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry: any) => {
          if (entry.processingDuration) {
            this.webVitals.FID = entry.processingDuration;
          }
        });
      });

      interactionObserver.observe({ entryTypes: ['first-input'] });

      // Layout Shift
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            this.webVitals.CLS = clsValue;
          }
        });
      });

      clsObserver.observe({ entryTypes: ['layout-shift'] });
    } catch (err) {
      debugError('PerformanceMonitor', 'Failed to initialize Web Vitals observer', err);
    }
  }

  /**
   * API呼び出しを計測
   */
  async measureAPICall<T>(
    fn: () => Promise<T>,
    endpoint: string,
    cached: boolean = false
  ): Promise<T> {
    const startTime = performance.now();
    let statusCode = 200;
    let hadError = false;

    const transaction = startPerformanceTrace(`API: ${endpoint}`);

    try {
      const result = await fn();
      return result;
    } catch (err) {
      hadError = true;
      statusCode = (err as any).statusCode || 500;
      throw err;
    } finally {
      const duration = performance.now() - startTime;

      // メトリクス記録
      this.apiMetrics.push({
        endpoint,
        duration: Math.round(duration),
        statusCode,
        cached,
      });

      // Sentryに送信
      finishPerformanceTrace(transaction);
      captureAPIMetrics(endpoint, duration, statusCode, hadError ? new Error(`HTTP ${statusCode}`) : undefined);

      // エラーカウント更新
      this.requestCount++;
      if (hadError) {
        this.errorCount++;
      }

      // 詳細ログ
      debugError('PerformanceMonitor', `API call: ${endpoint}`, {
        duration: Math.round(duration),
        statusCode,
        cached,
        hadError,
      });
    }
  }

  /**
   * メモリ使用量を計測
   */
  getMemoryUsage(): PerformanceMetrics['memoryUsage'] | undefined {
    if (typeof performance === 'undefined' || !(performance as any).memory) {
      return undefined;
    }

    try {
      const memory = (performance as any).memory;
      const used = Math.round(memory.usedJSHeapSize / 1024 / 1024);
      const total = Math.round(memory.jsHeapSizeLimit / 1024 / 1024);
      const percentage = (used / total) * 100;

      return {
        used,
        total,
        percentage: Math.round(percentage),
      };
    } catch (err) {
      return undefined;
    }
  }

  /**
   * タイミング計測を取得
   */
  getNavigationTiming(): {
    TTFB?: number;
    domReady?: number;
    pageLoad?: number;
  } {
    if (typeof performance === 'undefined') {
      return {};
    }

    try {
      const timing = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

      if (!timing) {
        return {};
      }

      return {
        TTFB: Math.round(timing.responseStart - timing.requestStart),
        domReady: Math.round(timing.domInteractive - timing.navigationStart),
        pageLoad: Math.round(timing.loadEventEnd - timing.navigationStart),
      };
    } catch (err) {
      return {};
    }
  }

  /**
   * パフォーマンスメトリクスを取得
   */
  getMetrics(): PerformanceMetrics {
    const errorRate = this.requestCount > 0 ? (this.errorCount / this.requestCount) * 100 : 0;
    const navigationTiming = this.getNavigationTiming();

    return {
      timestamp: new Date().toISOString(),
      webVitals: {
        ...this.webVitals,
        TTFB: navigationTiming.TTFB,
      },
      apiMetrics: this.apiMetrics,
      memoryUsage: this.getMemoryUsage(),
      errorRate: Math.round(errorRate * 100) / 100,
    };
  }

  /**
   * ベースラインを設定（改善前の基準値）
   */
  setBaseline(): void {
    this.baseline = this.getMetrics();
    debugError('PerformanceMonitor', 'Baseline metrics set', this.baseline);
  }

  /**
   * ベースラインと比較
   */
  compareWithBaseline(): {
    improved: Record<string, boolean>;
    changes: Record<string, { before: number; after: number; change: string }>;
  } {
    if (!this.baseline) {
      return { improved: {}, changes: {} };
    }

    const current = this.getMetrics();
    const changes: Record<string, any> = {};
    const improved: Record<string, boolean> = {};

    // LCP比較
    if (this.baseline.webVitals.LCP && current.webVitals.LCP) {
      const before = this.baseline.webVitals.LCP;
      const after = current.webVitals.LCP;
      const change = ((after - before) / before) * 100;
      changes.LCP = { before, after, change: `${change > 0 ? '+' : ''}${change.toFixed(1)}%` };
      improved.LCP = after < before;
    }

    // FID比較
    if (this.baseline.webVitals.FID && current.webVitals.FID) {
      const before = this.baseline.webVitals.FID;
      const after = current.webVitals.FID;
      const change = ((after - before) / before) * 100;
      changes.FID = { before, after, change: `${change > 0 ? '+' : ''}${change.toFixed(1)}%` };
      improved.FID = after < before;
    }

    // エラー率比較
    const beforeErrorRate = this.baseline.errorRate;
    const afterErrorRate = current.errorRate;
    const errorChange = afterErrorRate - beforeErrorRate;
    changes.errorRate = {
      before: beforeErrorRate,
      after: afterErrorRate,
      change: `${errorChange > 0 ? '+' : ''}${errorChange.toFixed(2)}%`,
    };
    improved.errorRate = afterErrorRate < beforeErrorRate;

    return { improved, changes };
  }

  /**
   * API呼び出し統計
   */
  getAPIStatistics(): {
    totalCalls: number;
    successRate: number;
    averageDuration: number;
    slowestEndpoints: Array<{ endpoint: string; duration: number }>;
    failingEndpoints: Array<{ endpoint: string; failures: number }>;
  } {
    const totalCalls = this.apiMetrics.length;
    const successfulCalls = this.apiMetrics.filter((m) => m.statusCode < 400).length;
    const successRate = totalCalls > 0 ? (successfulCalls / totalCalls) * 100 : 0;

    const totalDuration = this.apiMetrics.reduce((sum, m) => sum + m.duration, 0);
    const averageDuration = totalCalls > 0 ? Math.round(totalDuration / totalCalls) : 0;

    // 遅いエンドポイント
    const slowestEndpoints = [...this.apiMetrics]
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 5)
      .map((m) => ({ endpoint: m.endpoint, duration: m.duration }));

    // 失敗するエンドポイント
    const failingMap: Record<string, number> = {};
    this.apiMetrics.forEach((m) => {
      if (m.statusCode >= 400) {
        failingMap[m.endpoint] = (failingMap[m.endpoint] || 0) + 1;
      }
    });

    const failingEndpoints = Object.entries(failingMap)
      .map(([endpoint, failures]) => ({ endpoint, failures }))
      .sort((a, b) => b.failures - a.failures);

    return {
      totalCalls,
      successRate: Math.round(successRate * 100) / 100,
      averageDuration,
      slowestEndpoints,
      failingEndpoints,
    };
  }

  /**
   * メトリクスをリセット
   */
  reset(): void {
    this.webVitals = {};
    this.apiMetrics = [];
    this.errorCount = 0;
    this.requestCount = 0;
    debugError('PerformanceMonitor', 'Performance metrics reset');
  }

  /**
   * メトリクスをエクスポート
   */
  export(): {
    metrics: PerformanceMetrics;
    apiStats: ReturnType<PerformanceMonitor['getAPIStatistics']>;
    comparison?: ReturnType<PerformanceMonitor['compareWithBaseline']>;
  } {
    return {
      metrics: this.getMetrics(),
      apiStats: this.getAPIStatistics(),
      comparison: this.baseline ? this.compareWithBaseline() : undefined,
    };
  }
}

// グローバルインスタンス
export const performanceMonitor = new PerformanceMonitor();

export default performanceMonitor;
