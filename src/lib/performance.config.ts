/**
 * パフォーマンスモニタリング設定
 * バンドルサイズ・メモリ・初期ロード時間の監視
 */

interface PerformanceMetrics {
  bundleSize: number;
  initialLoadTime: number;
  timeToInteractive: number;
  memoryUsage: number;
  cpuUsage: number;
}

interface ResourceMetrics {
  name: string;
  duration: number;
  size?: number;
  timestamp: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics;
  private resourceMetrics: ResourceMetrics[] = [];
  private startTime: number;
  private isProduction: boolean;

  constructor() {
    this.startTime = Date.now();
    this.isProduction = process.env.NODE_ENV === 'production';
    this.metrics = {
      bundleSize: 0,
      initialLoadTime: 0,
      timeToInteractive: 0,
      memoryUsage: 0,
      cpuUsage: 0,
    };
  }

  /**
   * バンドルサイズを記録
   */
  recordBundleSize(sizeInMB: number) {
    this.metrics.bundleSize = sizeInMB;
    this.logMetric('Bundle Size', `${sizeInMB.toFixed(2)}MB`);

    // 警告: 3MB以上の場合
    if (sizeInMB > 3) {
      console.warn(`⚠️ Large bundle size detected: ${sizeInMB.toFixed(2)}MB`);
    }
  }

  /**
   * 初期ロード時間を記録
   */
  recordInitialLoadTime() {
    const loadTime = Date.now() - this.startTime;
    this.metrics.initialLoadTime = loadTime;
    this.logMetric('Initial Load Time', `${loadTime}ms`);

    // 警告: 3秒以上の場合
    if (loadTime > 3000) {
      console.warn(`⚠️ Slow initial load: ${loadTime}ms`);
    }
  }

  /**
   * インタラクティブ時間を記録
   */
  recordTimeToInteractive() {
    const tti = Date.now() - this.startTime;
    this.metrics.timeToInteractive = tti;
    this.logMetric('Time to Interactive', `${tti}ms`);

    // 警告: 5秒以上の場合
    if (tti > 5000) {
      console.warn(`⚠️ Slow time to interactive: ${tti}ms`);
    }
  }

  /**
   * メモリ使用量を記録
   */
  recordMemoryUsage() {
    if (typeof performance !== 'undefined' && (performance as any).memory) {
      const memoryMB = (performance as any).memory.usedJSHeapSize / 1048576; // bytes to MB
      this.metrics.memoryUsage = memoryMB;
      this.logMetric('Memory Usage', `${memoryMB.toFixed(2)}MB`);

      // 警告: 100MB以上の場合
      if (memoryMB > 100) {
        console.warn(`⚠️ High memory usage: ${memoryMB.toFixed(2)}MB`);
      }
    }
  }

  /**
   * リソース読み込み時間を記録
   */
  recordResourceTiming(name: string, duration: number, size?: number) {
    const resource: ResourceMetrics = {
      name,
      duration,
      size,
      timestamp: Date.now(),
    };

    this.resourceMetrics.push(resource);
    this.logMetric(`Resource: ${name}`, `${duration.toFixed(2)}ms${size ? ` (${size}B)` : ''}`);

    // 警告: 1秒以上の場合
    if (duration > 1000) {
      console.warn(`⚠️ Slow resource load (${name}): ${duration.toFixed(2)}ms`);
    }
  }

  /**
   * API呼び出しのパフォーマンスを記録
   */
  recordAPICall(endpoint: string, duration: number, statusCode: number) {
    this.recordResourceTiming(`API: ${endpoint}`, duration);

    if (statusCode >= 400) {
      console.error(`❌ API Error (${endpoint}): ${statusCode} in ${duration.toFixed(2)}ms`);
    }

    // 警告: 2秒以上の場合
    if (duration > 2000) {
      console.warn(`⚠️ Slow API call (${endpoint}): ${duration.toFixed(2)}ms`);
    }
  }

  /**
   * 画像読み込みのパフォーマンスを記録
   */
  recordImageLoad(src: string, duration: number) {
    this.recordResourceTiming(`Image: ${src}`, duration);
  }

  /**
   * 音声読み込みのパフォーマンスを記録
   */
  recordAudioLoad(src: string, duration: number, fileSize: number) {
    this.recordResourceTiming(`Audio: ${src}`, duration, fileSize);
  }

  /**
   * スローネットワーク検出
   */
  detectSlowNetwork(speedMbps: number) {
    if (speedMbps < 1) {
      console.warn('⚠️ Slow network detected (< 1 Mbps)');
      return 'slow-2g';
    } else if (speedMbps < 3) {
      return 'slow-3g';
    } else if (speedMbps < 10) {
      return '4g';
    } else {
      return 'fast';
    }
  }

  /**
   * メトリクスレポートを取得
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * リソースメトリクスを取得
   */
  getResourceMetrics(): ResourceMetrics[] {
    return [...this.resourceMetrics];
  }

  /**
   * スローリソースを取得（> 1秒）
   */
  getSlowResources(): ResourceMetrics[] {
    return this.resourceMetrics.filter((r) => r.duration > 1000);
  }

  /**
   * パフォーマンスレポートを生成
   */
  generateReport(): string {
    const report = `
=== EigoMaster Performance Report ===
Environment: ${this.isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}
Timestamp: ${new Date().toISOString()}

📊 Core Metrics:
  - Bundle Size: ${this.metrics.bundleSize.toFixed(2)}MB
  - Initial Load Time: ${this.metrics.initialLoadTime}ms
  - Time to Interactive: ${this.metrics.timeToInteractive}ms
  - Memory Usage: ${this.metrics.memoryUsage.toFixed(2)}MB

📦 Resources Loaded: ${this.resourceMetrics.length}
Slow Resources (> 1s): ${this.getSlowResources().length}

${this.getSlowResources().length > 0 ? '⚠️ Slow Resources:\n' + this.getSlowResources().map((r) => `  - ${r.name}: ${r.duration.toFixed(2)}ms`).join('\n') : ''}

✅ Performance checks:
  - Bundle Size < 3MB: ${this.metrics.bundleSize < 3 ? '✓' : '✗'}
  - Initial Load < 3s: ${this.metrics.initialLoadTime < 3000 ? '✓' : '✗'}
  - TTI < 5s: ${this.metrics.timeToInteractive < 5000 ? '✓' : '✗'}
  - Memory < 100MB: ${this.metrics.memoryUsage < 100 ? '✓' : '✗'}
    `;

    return report;
  }

  /**
   * メトリクスをログ出力
   */
  private logMetric(label: string, value: string) {
    if (!this.isProduction) {
      console.log(`📈 ${label}: ${value}`);
    }
  }

  /**
   * すべてのメトリクスをリセット
   */
  reset() {
    this.metrics = {
      bundleSize: 0,
      initialLoadTime: 0,
      timeToInteractive: 0,
      memoryUsage: 0,
      cpuUsage: 0,
    };
    this.resourceMetrics = [];
    this.startTime = Date.now();
  }
}

// グローバルインスタンス
export const performanceMonitor = new PerformanceMonitor();

export default PerformanceMonitor;
