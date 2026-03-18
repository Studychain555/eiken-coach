/**
 * メモリ管理ユーティリティ
 *
 * 機能:
 * - メモリリーク検出
 * - ガベージコレクション最適化
 * - リソース生成命期管理
 */

interface MemorySnapshot {
  timestamp: number;
  heapUsed: number;
  heapTotal: number;
  external: number;
  rss: number;
}

class MemoryManager {
  private snapshots: MemorySnapshot[] = [];
  private maxSnapshots = 100;
  private isMonitoring = false;
  private monitorInterval: ReturnType<typeof setInterval> | null = null;
  private listeners: Set<(snapshot: MemorySnapshot) => void> = new Set();

  /**
   * メモリ監視を開始
   * @param intervalMs 監視間隔（ミリ秒）
   */
  startMonitoring(intervalMs = 5000): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.monitorInterval = setInterval(() => {
      const snapshot = this.takeSnapshot();
      this.snapshots.push(snapshot);

      // 古いスナップショットを削除
      if (this.snapshots.length > this.maxSnapshots) {
        this.snapshots.shift();
      }

      // リスナーに通知
      this.listeners.forEach((listener) => listener(snapshot));

      // メモリ使用量が閾値を超えた場合は警告
      if (snapshot.heapUsed > 150 * 1024 * 1024) {
        // 150MB以上
        console.warn(
          `[Memory WARNING] Heap usage exceeded 150MB: ${(snapshot.heapUsed / 1024 / 1024).toFixed(2)}MB`
        );
      }
    }, intervalMs);

    console.log(`[Memory Manager] Monitoring started (interval: ${intervalMs}ms)`);
  }

  /**
   * メモリ監視を停止
   */
  stopMonitoring(): void {
    if (!this.isMonitoring) return;

    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
    }

    this.isMonitoring = false;
    console.log('[Memory Manager] Monitoring stopped');
  }

  /**
   * メモリスナップショットを取得
   */
  private takeSnapshot(): MemorySnapshot {
    const memUsage = process.memoryUsage?.();

    return {
      timestamp: Date.now(),
      heapUsed: memUsage?.heapUsed || 0,
      heapTotal: memUsage?.heapTotal || 0,
      external: memUsage?.external || 0,
      rss: memUsage?.rss || 0,
    };
  }

  /**
   * メモリ変化を監視
   */
  onMemoryChange(listener: (snapshot: MemorySnapshot) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * メモリリークを検出（上昇傾向をチェック）
   */
  detectMemoryLeak(windowSize = 10): boolean {
    if (this.snapshots.length < windowSize) return false;

    const recent = this.snapshots.slice(-windowSize);
    let increaseCount = 0;

    for (let i = 1; i < recent.length; i++) {
      if (recent[i].heapUsed > recent[i - 1].heapUsed) {
        increaseCount++;
      }
    }

    // 80%以上のサンプルでメモリが増加している場合
    const hasLeak = increaseCount > windowSize * 0.8;

    if (hasLeak) {
      console.warn(
        `[Memory Leak Detection] Potential leak detected: ${increaseCount}/${windowSize} samples increased`
      );
    }

    return hasLeak;
  }

  /**
   * メモリ統計を取得
   */
  getStats() {
    if (this.snapshots.length === 0) {
      return null;
    }

    const first = this.snapshots[0];
    const last = this.snapshots[this.snapshots.length - 1];
    const avg = this.snapshots.reduce((sum, s) => sum + s.heapUsed, 0) / this.snapshots.length;
    const max = Math.max(...this.snapshots.map((s) => s.heapUsed));
    const min = Math.min(...this.snapshots.map((s) => s.heapUsed));

    return {
      startHeapUsed: first.heapUsed,
      currentHeapUsed: last.heapUsed,
      delta: last.heapUsed - first.heapUsed,
      avgHeapUsed: avg,
      maxHeapUsed: max,
      minHeapUsed: min,
      sampleCount: this.snapshots.length,
      displayText: {
        current: `${(last.heapUsed / 1024 / 1024).toFixed(2)}MB`,
        avg: `${(avg / 1024 / 1024).toFixed(2)}MB`,
        max: `${(max / 1024 / 1024).toFixed(2)}MB`,
        delta: `${((last.heapUsed - first.heapUsed) / 1024 / 1024).toFixed(2)}MB`,
      },
    };
  }

  /**
   * メモリ統計を表示
   */
  printStats(): void {
    const stats = this.getStats();
    if (!stats) {
      console.log('[Memory Manager] No statistics available');
      return;
    }

    console.table({
      'Current Memory': stats.displayText.current,
      'Average Memory': stats.displayText.avg,
      'Max Memory': stats.displayText.max,
      'Delta': stats.displayText.delta,
      'Samples': stats.sampleCount,
    });
  }

  /**
   * 全スナップショットをクリア
   */
  clear(): void {
    this.snapshots = [];
    console.log('[Memory Manager] Snapshots cleared');
  }
}

// シングルトンインスタンス
let sharedInstance: MemoryManager | null = null;

export function getMemoryManager(): MemoryManager {
  if (!sharedInstance) {
    sharedInstance = new MemoryManager();
  }
  return sharedInstance;
}

/**
 * バッチ処理用ヘルパー
 * 大量データを処理する際に、GCの時間を作る
 */
export async function processBatchWithMemoryGC<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  batchSize = 100,
  delayMs = 10
): Promise<R[]> {
  const results: R[] = [];

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(processor));
    results.push(...batchResults);

    // GCが働く時間を与える
    if (i + batchSize < items.length) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  return results;
}

/**
 * リソース自動クリーンアップ用デコレータ
 */
export class AutoCleanup {
  private cleanupFunctions: Array<() => void | Promise<void>> = [];

  add(fn: () => void | Promise<void>): void {
    this.cleanupFunctions.push(fn);
  }

  async cleanup(): Promise<void> {
    for (const fn of this.cleanupFunctions) {
      try {
        await fn();
      } catch (error) {
        console.error('[AutoCleanup] Error during cleanup:', error);
      }
    }
    this.cleanupFunctions = [];
  }
}

/**
 * React Hooks用メモリリーク検出
 */
export function useMemoryMonitoring(componentName: string) {
  const memoryManager = getMemoryManager();

  // マウント時に監視開始
  if (typeof window !== 'undefined') {
    // ブラウザ環境では performance.memory を使用
    try {
      const perfMemory = (performance as any).memory;
      if (perfMemory) {
        console.log(
          `[${componentName}] Memory: ${(perfMemory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB / ${(perfMemory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)}MB`
        );
      }
    } catch (error) {
      // パフォーマンスメモリAPI非対応
    }
  }

  return {
    getStats: () => memoryManager.getStats(),
    printStats: () => memoryManager.printStats(),
    detectLeak: () => memoryManager.detectMemoryLeak(),
  };
}
