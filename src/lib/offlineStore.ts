/**
 * オフラインストア
 *
 * 機能:
 * - IndexedDB でローカルデータ保存
 * - オフライン時のデータ返却
 * - 再接続時の同期
 * - TTL（Time To Live）ベースの自動期限切れ
 */

import { debugError } from './debugUtils';

export interface StoredData<T> {
  key: string;
  data: T;
  timestamp: number;
  ttl: number; // ミリ秒
}

export interface SyncRecord {
  key: string;
  data: any;
  operation: 'create' | 'update' | 'delete';
  timestamp: number;
  synced: boolean;
}

/**
 * オフラインストア
 */
export class OfflineStore {
  private db: IDBDatabase | null = null;
  private isOnline: boolean = navigator.onLine;
  private pendingSync: Map<string, SyncRecord> = new Map();

  constructor() {
    this.initializeDatabase();
    this.setupOnlineOfflineListeners();
  }

  /**
   * データベースを初期化
   */
  private initializeDatabase(): void {
    if (typeof window === 'undefined' || typeof indexedDB === 'undefined') {
      debugError('OfflineStore', 'IndexedDB not available');
      return;
    }

    const request = indexedDB.open('EigoMasterDB', 1);

    request.onsuccess = (event) => {
      this.db = (event.target as IDBOpenDBRequest).result;
      debugError('OfflineStore', 'Database initialized successfully');
    };

    request.onerror = (event) => {
      debugError('OfflineStore', 'Database initialization failed', {
        error: (event.target as IDBOpenDBRequest).error,
      });
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // キャッシュストア
      if (!db.objectStoreNames.contains('cache')) {
        db.createObjectStore('cache', { keyPath: 'key' });
      }

      // 質問データ
      if (!db.objectStoreNames.contains('questions')) {
        db.createObjectStore('questions', { keyPath: 'id' });
      }

      // ユーザープログレス
      if (!db.objectStoreNames.contains('userProgress')) {
        db.createObjectStore('userProgress', { keyPath: 'id' });
      }

      // 未同期データ（オフラインで記録したデータ）
      if (!db.objectStoreNames.contains('syncQueue')) {
        db.createObjectStore('syncQueue', { keyPath: 'key' });
      }

      debugError('OfflineStore', 'Database upgraded');
    };
  }

  /**
   * オンライン・オフラインリスナーを設定
   */
  private setupOnlineOfflineListeners(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('online', () => {
      this.isOnline = true;
      debugError('OfflineStore', 'Device is now online');
      this.syncPendingData();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      debugError('OfflineStore', 'Device is now offline');
    });
  }

  /**
   * データをキャッシュに保存
   */
  async cacheData<T>(
    key: string,
    data: T,
    ttlMs: number = 3600000 // デフォルト1時間
  ): Promise<void> {
    if (!this.db) {
      debugError('OfflineStore', 'Database not initialized');
      return;
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');

      const storedData: StoredData<T> = {
        key,
        data,
        timestamp: Date.now(),
        ttl: ttlMs,
      };

      const request = store.put(storedData);

      request.onsuccess = () => {
        debugError('OfflineStore', `Data cached: ${key}`, { ttlMs });
        resolve();
      };

      request.onerror = () => {
        debugError('OfflineStore', `Failed to cache data: ${key}`);
        reject(request.error);
      };
    });
  }

  /**
   * キャッシュからデータを取得
   */
  async getCachedData<T>(key: string): Promise<T | null> {
    if (!this.db) {
      return null;
    }

    return new Promise((resolve) => {
      const transaction = this.db!.transaction(['cache'], 'readonly');
      const store = transaction.objectStore('cache');
      const request = store.get(key);

      request.onsuccess = () => {
        const item = request.result as StoredData<T> | undefined;

        if (!item) {
          resolve(null);
          return;
        }

        // TTLをチェック
        const age = Date.now() - item.timestamp;
        if (age > item.ttl) {
          // 期限切れ：削除して null を返す
          this.removeCachedData(key);
          resolve(null);
        } else {
          debugError('OfflineStore', `Data retrieved from cache: ${key}`, { age });
          resolve(item.data);
        }
      };

      request.onerror = () => {
        debugError('OfflineStore', `Failed to get cached data: ${key}`);
        resolve(null);
      };
    });
  }

  /**
   * キャッシュからデータを削除
   */
  async removeCachedData(key: string): Promise<void> {
    if (!this.db) {
      return;
    }

    return new Promise((resolve) => {
      const transaction = this.db!.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      const request = store.delete(key);

      request.onsuccess = () => {
        debugError('OfflineStore', `Data removed from cache: ${key}`);
        resolve();
      };
    });
  }

  /**
   * オフラインで記録したデータを登録
   */
  async recordOfflineAction<T>(
    key: string,
    data: T,
    operation: 'create' | 'update' | 'delete'
  ): Promise<void> {
    if (!this.db) {
      return;
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['syncQueue'], 'readwrite');
      const store = transaction.objectStore('syncQueue');

      const syncRecord: SyncRecord = {
        key,
        data,
        operation,
        timestamp: Date.now(),
        synced: false,
      };

      const request = store.put(syncRecord);

      request.onsuccess = () => {
        this.pendingSync.set(key, syncRecord);
        debugError('OfflineStore', `Offline action recorded: ${operation} ${key}`);
        resolve();
      };

      request.onerror = () => {
        debugError('OfflineStore', `Failed to record offline action: ${key}`);
        reject(request.error);
      };
    });
  }

  /**
   * 再接続時に未同期データを同期
   */
  async syncPendingData(): Promise<void> {
    if (!this.isOnline) {
      return;
    }

    debugError('OfflineStore', `Syncing ${this.pendingSync.size} pending records`);

    const records = Array.from(this.pendingSync.values());

    for (const record of records) {
      try {
        // 実装時にはここでサーバーに送信
        debugError('OfflineStore', `Synced: ${record.operation} ${record.key}`);

        // 同期済みとしてマーク
        await this.markSynced(record.key);
        this.pendingSync.delete(record.key);
      } catch (error) {
        debugError('OfflineStore', `Sync failed for ${record.key}`, error);
        // エラーが発生した場合はリトライ待機
        break;
      }
    }

    debugError('OfflineStore', `Sync completed. Remaining: ${this.pendingSync.size}`);
  }

  /**
   * 同期済みとしてマーク
   */
  private async markSynced(key: string): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve) => {
      const transaction = this.db!.transaction(['syncQueue'], 'readwrite');
      const store = transaction.objectStore('syncQueue');
      const request = store.get(key);

      request.onsuccess = () => {
        const record = request.result as SyncRecord | undefined;
        if (record) {
          record.synced = true;
          store.put(record);
        }
        resolve();
      };
    });
  }

  /**
   * デバイスがオンラインか確認
   */
  getOnlineStatus(): boolean {
    return this.isOnline;
  }

  /**
   * 未同期データの数を取得
   */
  getPendingSyncCount(): number {
    return this.pendingSync.size;
  }

  /**
   * キャッシュをクリア
   */
  async clearCache(): Promise<void> {
    if (!this.db) {
      return;
    }

    return new Promise((resolve) => {
      const transaction = this.db!.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      const request = store.clear();

      request.onsuccess = () => {
        debugError('OfflineStore', 'Cache cleared');
        resolve();
      };
    });
  }

  /**
   * すべてのデータをクリア
   */
  async clearAll(): Promise<void> {
    if (!this.db) {
      return;
    }

    return new Promise((resolve) => {
      const transaction = this.db!.transaction(
        ['cache', 'questions', 'userProgress', 'syncQueue'],
        'readwrite'
      );

      transaction.oncomplete = () => {
        debugError('OfflineStore', 'All data cleared');
        resolve();
      };

      transaction.objectStore('cache').clear();
      transaction.objectStore('questions').clear();
      transaction.objectStore('userProgress').clear();
      transaction.objectStore('syncQueue').clear();
    });
  }
}

// シングルトンインスタンス
let sharedOfflineStore: OfflineStore | null = null;

/**
 * オフラインストアを取得
 */
export function getOfflineStore(): OfflineStore {
  if (!sharedOfflineStore) {
    sharedOfflineStore = new OfflineStore();
  }
  return sharedOfflineStore;
}

/**
 * 使用例:
 *
 * import { getOfflineStore } from '@/lib/offlineStore';
 *
 * const store = getOfflineStore();
 *
 * // データをキャッシュに保存
 * await store.cacheData('questions', questionsData, 24 * 60 * 60 * 1000);
 *
 * // キャッシュからデータを取得
 * const cached = await store.getCachedData('questions');
 *
 * // オフラインで記録したデータを登録
 * await store.recordOfflineAction('user:answers', answerData, 'create');
 *
 * // 再接続時に同期
 * await store.syncPendingData();
 */
