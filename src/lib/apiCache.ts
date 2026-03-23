/**
 * APIキャッシング戦略 - Zustand + TTL を利用した実装
 *
 * 特徴:
 * - TTL（Time To Live）ベースの自動期限切れ
 * - キャッシュサイズの自動管理
 * - エラーレスポンスのキャッシュなし
 * - 手動クリアとタイムアウト自動クリアをサポート
 */

import { create } from 'zustand';

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // ミリ秒単位
}

interface ApiCacheState {
  cache: Map<string, CacheEntry<any>>;
  get: <T>(key: string, fetcher: () => Promise<T>, ttl?: number) => Promise<T>;
  set: <T>(key: string, data: T, ttl?: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  getStats: () => { size: number; keys: string[] };
}

// デフォルトキャッシュ設定
const DEFAULT_TTL = {
  STATIC: 24 * 60 * 60 * 1000, // 24時間: リスニング問題、単語リスト
  DYNAMIC: 5 * 60 * 1000,      // 5分: ユーザー進捗、統計
  SHORT: 60 * 1000,            // 1分: ユーザー認証情報
};

export const useApiCache = create<ApiCacheState>((set, get) => ({
  cache: new Map(),

  get: async <T,>(
    key: string,
    fetcher: () => Promise<T>,
    ttl = DEFAULT_TTL.DYNAMIC
  ): Promise<T> => {
    const { cache } = get();
    const entry = cache.get(key) as CacheEntry<T> | undefined;

    // キャッシュがあり、有効期限内
    if (entry) {
      const now = Date.now();
      if (now - entry.timestamp < entry.ttl) {
        console.log(`[Cache HIT] ${key}`);
        return entry.data;
      } else {
        // 期限切れキャッシュを削除
        console.log(`[Cache EXPIRED] ${key}`);
        cache.delete(key);
      }
    }

    // キャッシュなし or 期限切れ → フェッチ
    console.log(`[Cache MISS] ${key} - fetching...`);
    try {
      const data = await fetcher();
      get().set(key, data, ttl);
      return data;
    } catch (error) {
      console.error(`[Cache FETCH ERROR] ${key}:`, error);
      throw error;
    }
  },

  set: <T,>(key: string, data: T, ttl = DEFAULT_TTL.DYNAMIC) => {
    const cache = get().cache;
    cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });

    // キャッシュサイズが大きくなりすぎないように管理（最大100エントリ）
    if (cache.size > 100) {
      const entries = Array.from(cache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      const oldestKey = entries[0][0];
      cache.delete(oldestKey);
      console.log(`[Cache EVICTED] ${oldestKey} (size exceeded)`);
    }
  },

  remove: (key: string) => {
    const cache = get().cache;
    cache.delete(key);
    console.log(`[Cache REMOVED] ${key}`);
  },

  clear: () => {
    const cache = get().cache;
    const size = cache.size;
    cache.clear();
    console.log(`[Cache CLEARED] ${size} entries removed`);
  },

  getStats: () => {
    const cache = get().cache;
    return {
      size: cache.size,
      keys: Array.from(cache.keys()),
    };
  },
}));

/**
 * キャッシュキー定数
 * API呼び出し時は必ずこれらを使用すること
 */
export const CACHE_KEYS = {
  // リスニング
  LISTENING_QUESTIONS: 'listening:questions',
  LISTENING_PROGRESS: (userId: string) => `listening:progress:${userId}`,
  LISTENING_STATS: (userId: string) => `listening:stats:${userId}`,

  // 単語
  VOCABULARY_WORDS: 'vocabulary:words',
  VOCABULARY_PROGRESS: (userId: string) => `vocabulary:progress:${userId}`,
  VOCABULARY_MASTERED: (userId: string) => `vocabulary:mastered:${userId}`,

  // ライティング
  WRITING_TASKS: 'writing:tasks',
  WRITING_SUBMISSIONS: (userId: string) => `writing:submissions:${userId}`,

  // ユーザー
  USER_PROFILE: (userId: string) => `user:profile:${userId}`,
  USER_STATS: (userId: string) => `user:stats:${userId}`,
  USER_STREAK: (userId: string) => `user:streak:${userId}`,
};

/**
 * Supabase クエリとキャッシュを組み合わせるヘルパー
 */
export async function cachedSupabaseQuery<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl?: number
): Promise<T> {
  return useApiCache.getState().get(key, fetcher, ttl);
}

/**
 * キャッシュ管理ユーティリティ
 */
export const cacheUtils = {
  // ユーザー関連キャッシュをクリア（ログアウト時など）
  clearUserCache: (userId: string) => {
    const state = useApiCache.getState();
    const stats = state.getStats();
    stats.keys.forEach((key) => {
      if (key.includes(userId)) {
        state.remove(key);
      }
    });
  },

  // リスニング関連キャッシュをクリア
  clearListeningCache: () => {
    const state = useApiCache.getState();
    state.remove(CACHE_KEYS.LISTENING_QUESTIONS);
  },

  // 単語関連キャッシュをクリア
  clearVocabularyCache: () => {
    const state = useApiCache.getState();
    state.remove(CACHE_KEYS.VOCABULARY_WORDS);
  },

  // 全キャッシュをクリア
  clearAll: () => {
    useApiCache.getState().clear();
  },

  // キャッシュ統計を表示
  printStats: () => {
    const stats = useApiCache.getState().getStats();
    console.table({
      'Cache Size': stats.size,
      'Keys': stats.keys.join(', '),
    });
  },
};
