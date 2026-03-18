/**
 * パフォーマンス監視・測定ツール
 *
 * 機能:
 * - ページロード時間測定
 * - API レスポンス時間計測
 * - コンポーネントレンダリング時間測定
 * - パフォーマンスレポート生成
 */

interface PerformanceMeasurement {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

interface PerformanceReport {
  timestamp: number;
  measurements: PerformanceMeasurement[];
  summary: {
    initialLoadTime: number | null;
    averageApiResponseTime: number;
    slowestApiCall: { name: string; duration: number } | null;
    totalMeasurements: number;
  };
}

class PerformanceMonitor {
  private measurements: Map<string, PerformanceMeasurement> = new Map();
  private completedMeasurements: PerformanceMeasurement[] = [];
  private thresholds = {
    INITIAL_LOAD: 3000, // 3秒
    API_RESPONSE: 1000, // 1秒
    COMPONENT_RENDER: 100, // 100ms
  };

  /**
   * パフォーマンス測定を開始
   */
  start(name: string, metadata?: Record<string, any>): string {
    const id = `${name}_${Date.now()}`;
    this.measurements.set(id, {
      name,
      startTime: performance.now(),
      metadata,
    });
    return id;
  }

  /**
   * パフォーマンス測定を終了
   */
  end(id: string): number | null {
    const measurement = this.measurements.get(id);
    if (!measurement) {
      console.warn(`[Performance] Measurement ${id} not found`);
      return null;
    }

    const endTime = performance.now();
    const duration = endTime - measurement.startTime;

    measurement.endTime = endTime;
    measurement.duration = duration;

    // 完了した測定を記録
    this.completedMeasurements.push(measurement);
    this.measurements.delete(id);

    // 閾値を超えた場合は警告
    this.checkThresholds(measurement);

    console.log(
      `[Performance] ${measurement.name} completed in ${duration.toFixed(2)}ms`
    );

    return duration;
  }

  /**
   * 非同期処理のパフォーマンスを測定
   */
  async measureAsync<T>(
    name: string,
    fn: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    const id = this.start(name, metadata);
    try {
      return await fn();
    } finally {
      this.end(id);
    }
  }

  /**
   * 同期処理のパフォーマンスを測定
   */
  measureSync<T>(
    name: string,
    fn: () => T,
    metadata?: Record<string, any>
  ): T {
    const id = this.start(name, metadata);
    try {
      return fn();
    } finally {
      this.end(id);
    }
  }

  /**
   * 測定値が閾値を超えているかチェック
   */
  private checkThresholds(measurement: PerformanceMeasurement): void {
    if (!measurement.duration) return;

    let threshold = this.thresholds.COMPONENT_RENDER;

    if (measurement.name.includes('api') || measurement.name.includes('fetch')) {
      threshold = this.thresholds.API_RESPONSE;
    } else if (measurement.name.includes('initial') || measurement.name.includes('load')) {
      threshold = this.thresholds.INITIAL_LOAD;
    }

    if (measurement.duration > threshold) {
      console.warn(
        `[Performance WARNING] ${measurement.name} exceeded threshold: ${measurement.duration.toFixed(2)}ms > ${threshold}ms`
      );
    }
  }

  /**
   * レポートを生成
   */
  generateReport(): PerformanceReport {
    const apiCalls = this.completedMeasurements.filter((m) =>
      m.name.includes('api') || m.name.includes('fetch')
    );

    const initialLoad = this.completedMeasurements.find((m) =>
      m.name.includes('initial') || m.name.includes('load')
    );

    const slowestApi = apiCalls.reduce<
      { name: string; duration: number } | null
    >((prev, curr) => {
      if (!curr.duration) return prev;
      if (!prev) return { name: curr.name, duration: curr.duration };
      return curr.duration > prev.duration ? { name: curr.name, duration: curr.duration } : prev;
    }, null);

    const avgApiTime =
      apiCalls.length > 0
        ? apiCalls.reduce((sum, m) => sum + (m.duration || 0), 0) / apiCalls.length
        : 0;

    return {
      timestamp: Date.now(),
      measurements: this.completedMeasurements,
      summary: {
        initialLoadTime: initialLoad?.duration || null,
        averageApiResponseTime: avgApiTime,
        slowestApiCall: slowestApi,
        totalMeasurements: this.completedMeasurements.length,
      },
    };
  }

  /**
   * レポートを表示
   */
  printReport(): void {
    const report = this.generateReport();

    console.log('\n=== Performance Report ===');
    console.log(`Timestamp: ${new Date(report.timestamp).toISOString()}`);
    console.log(`Total Measurements: ${report.summary.totalMeasurements}`);

    if (report.summary.initialLoadTime !== null) {
      console.log(`Initial Load Time: ${report.summary.initialLoadTime.toFixed(2)}ms`);
    }

    console.log(`Average API Response Time: ${report.summary.averageApiResponseTime.toFixed(2)}ms`);

    if (report.summary.slowestApiCall) {
      console.log(
        `Slowest API Call: ${report.summary.slowestApiCall.name} (${report.summary.slowestApiCall.duration.toFixed(2)}ms)`
      );
    }

    console.table(
      report.measurements.map((m) => ({
        Name: m.name,
        Duration: m.duration ? `${m.duration.toFixed(2)}ms` : 'N/A',
        Metadata: m.metadata ? JSON.stringify(m.metadata) : '-',
      }))
    );

    console.log('========================\n');
  }

  /**
   * 測定値をクリア
   */
  clear(): void {
    this.measurements.clear();
    this.completedMeasurements = [];
    console.log('[Performance] Measurements cleared');
  }

  /**
   * 測定値の統計情報を取得
   */
  getStats() {
    const measurements = this.completedMeasurements;
    if (measurements.length === 0) return null;

    const durations = measurements
      .map((m) => m.duration)
      .filter((d) => d !== undefined) as number[];

    const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
    const min = Math.min(...durations);
    const max = Math.max(...durations);
    const p95 = this.calculatePercentile(durations, 0.95);

    return {
      count: measurements.length,
      average: avg.toFixed(2),
      min: min.toFixed(2),
      max: max.toFixed(2),
      p95: p95.toFixed(2),
    };
  }

  /**
   * パーセンタイル値を計算
   */
  private calculatePercentile(values: number[], percentile: number): number {
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil(sorted.length * percentile) - 1;
    return sorted[Math.max(0, index)];
  }
}

// シングルトンインスタンス
let sharedMonitor: PerformanceMonitor | null = null;

export function getPerformanceMonitor(): PerformanceMonitor {
  if (!sharedMonitor) {
    sharedMonitor = new PerformanceMonitor();
  }
  return sharedMonitor;
}

export function resetPerformanceMonitor(): void {
  if (sharedMonitor) {
    sharedMonitor.clear();
    sharedMonitor = null;
  }
}

/**
 * React Hooks用パフォーマンス測定
 */
export function usePerformanceTracking(componentName: string) {
  const monitor = getPerformanceMonitor();

  const trackAsync = async <T,>(
    name: string,
    fn: () => Promise<T>
  ): Promise<T> => {
    return monitor.measureAsync(`${componentName}:${name}`, fn);
  };

  const trackSync = <T,>(name: string, fn: () => T): T => {
    return monitor.measureSync(`${componentName}:${name}`, fn);
  };

  return {
    trackAsync,
    trackSync,
    getReport: () => monitor.generateReport(),
    printReport: () => monitor.printReport(),
  };
}

/**
 * API呼び出しの計測ヘルパー
 */
export async function measureApiCall<T>(
  apiName: string,
  apiCall: () => Promise<T>
): Promise<T> {
  return getPerformanceMonitor().measureAsync(`api:${apiName}`, apiCall);
}
