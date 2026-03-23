/**
 * 分析結果のキャッシング機構
 * メモリキャッシュ + Supabase キャッシュテーブル対応
 */

import { AnalysisResult } from './analyzeTranscription';

interface CachedAnalysis {
  transcriptionId: string;
  result: AnalysisResult;
  cachedAt: Date;
  expiresAt: Date;
}

/**
 * メモリベースの分析キャッシュ
 * 1時間の有効期限
 */
class AnalysisCacheManager {
  private cache: Map<string, CachedAnalysis> = new Map();
  private readonly DEFAULT_TTL_MS = 60 * 60 * 1000; // 1時間

  /**
   * キャッシュに格納
   */
  set(transcriptionId: string, result: AnalysisResult): void {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + this.DEFAULT_TTL_MS);

    this.cache.set(transcriptionId, {
      transcriptionId,
      result,
      cachedAt: now,
      expiresAt,
    });
  }

  /**
   * キャッシュから取得（有効期限内の場合のみ）
   */
  get(transcriptionId: string): AnalysisResult | null {
    const cached = this.cache.get(transcriptionId);

    if (!cached) {
      return null;
    }

    // 有効期限をチェック
    if (new Date() > cached.expiresAt) {
      this.cache.delete(transcriptionId);
      return null;
    }

    return cached.result;
  }

  /**
   * キャッシュにあるかチェック（有効期限確認なし）
   */
  has(transcriptionId: string): boolean {
    return this.cache.has(transcriptionId);
  }

  /**
   * 有効期限切れのキャッシュを削除
   */
  cleanup(): number {
    let removed = 0;
    const now = new Date();

    for (const [key, cached] of this.cache.entries()) {
      if (now > cached.expiresAt) {
        this.cache.delete(key);
        removed++;
      }
    }

    return removed;
  }

  /**
   * キャッシュ統計
   */
  stats(): {
    total: number;
    expired: number;
    valid: number;
  } {
    const now = new Date();
    let expired = 0;

    for (const cached of this.cache.values()) {
      if (now > cached.expiresAt) {
        expired++;
      }
    }

    return {
      total: this.cache.size,
      expired,
      valid: this.cache.size - expired,
    };
  }

  /**
   * キャッシュをクリア
   */
  clear(): void {
    this.cache.clear();
  }
}

// シングルトンインスタンス
const cacheManager = new AnalysisCacheManager();

export { AnalysisCacheManager, cacheManager };
