/**
 * Enhanced WebAudioManager
 * テスト・レビュー後の改善版
 * - エラーメッセージの改善
 * - メモリリーク防止の強化
 * - 詳細なロギング機能
 * - キャッシュメカニズム
 */

export interface AudioManagerConfig {
  crossOrigin?: 'anonymous' | 'use-credentials';
  timeout?: number;
  retryAttempts?: number;
  debugLog?: boolean;
  enableCache?: boolean; // キャッシュメカニズム
  cacheExpireMs?: number; // キャッシュ有効期限
  logLevel?: 'error' | 'warn' | 'info' | 'debug'; // ログレベル
}

export interface PlaybackState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  error?: string;
  buffered?: number; // バッファ率（0-1）
}

export interface AudioMetadata {
  url: string;
  duration?: number;
  format?: string;
  loadedAt?: number;
}

type PlaybackStatusCallback = (state: PlaybackState) => void;
type ErrorCallback = (error: AudioError) => void;

/**
 * 改善されたエラークラス
 */
export class AudioError extends Error {
  constructor(
    public code: string,
    public message: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'AudioError';
  }

  toString(): string {
    return `[${this.code}] ${this.message}${
      this.details ? ` (${JSON.stringify(this.details)})` : ''
    }`;
  }
}

/**
 * エラーコード定義
 */
const ERROR_CODES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',
  INVALID_URL: 'INVALID_URL',
  UNSUPPORTED_FORMAT: 'UNSUPPORTED_FORMAT',
  CORS_ERROR: 'CORS_ERROR',
  DECODE_ERROR: 'DECODE_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

/**
 * エラーメッセージテンプレート
 */
const ERROR_MESSAGES: Record<string, string> = {
  NETWORK_ERROR: 'ネットワーク接続エラーが発生しました。インターネット接続を確認してください。',
  TIMEOUT: '音声ファイルの読み込みがタイムアウトしました。ネットワーク速度が遅い可能性があります。',
  INVALID_URL: '指定されたURLが無効です。URLが正しいか確認してください。',
  UNSUPPORTED_FORMAT: 'このファイル形式はサポートされていません。MP3またはWAV形式をお使いください。',
  CORS_ERROR: 'CORS設定エラーが発生しました。サーバー管理者に連絡してください。',
  DECODE_ERROR: '音声ファイルのデコードに失敗しました。ファイルが破損していないか確認してください。',
  UNKNOWN_ERROR: '不明なエラーが発生しました。もう一度お試しください。',
};

/**
 * URLキャッシュ
 */
interface CacheEntry {
  url: string;
  metadata: AudioMetadata;
  timestamp: number;
}

export class EnhancedWebAudioManager {
  private audio: HTMLAudioElement;
  private playbackStatusCallbacks: Set<PlaybackStatusCallback> = new Set();
  private errorCallbacks: Set<ErrorCallback> = new Set();
  private config: Required<AudioManagerConfig>;
  private loadTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private currentRetry: number = 0;
  private primaryUrl: string = '';
  private fallbackUrls: string[] = [];
  private cache: Map<string, CacheEntry> = new Map();
  private metrics = {
    totalPlaybacks: 0,
    successfulPlaybacks: 0,
    failedPlaybacks: 0,
    totalRetries: 0,
    averageLoadTime: 0,
    errorCounts: new Map<string, number>(),
  };

  constructor(config: AudioManagerConfig = {}) {
    this.config = {
      crossOrigin: config.crossOrigin || 'anonymous',
      timeout: config.timeout || 10000,
      retryAttempts: config.retryAttempts || 2,
      debugLog: config.debugLog ?? true,
      enableCache: config.enableCache ?? true,
      cacheExpireMs: config.cacheExpireMs || 3600000, // 1時間
      logLevel: config.logLevel || 'info',
    };

    this.audio = new Audio();
    this.audio.crossOrigin = this.config.crossOrigin;
    this.setupAudioEventListeners();

    this.log(
      'EnhancedWebAudioManager initialized',
      {
        config: {
          timeout: this.config.timeout,
          retryAttempts: this.config.retryAttempts,
          enableCache: this.config.enableCache,
          logLevel: this.config.logLevel,
        },
      },
      'info'
    );
  }

  /**
   * 音声を再生
   */
  async play(url: string, fallbackUrls?: string[]): Promise<void> {
    this.metrics.totalPlaybacks++;
    this.primaryUrl = url;
    this.fallbackUrls = fallbackUrls || [];
    this.currentRetry = 0;

    // URLバリデーション
    if (!this.isValidUrl(url)) {
      const error = new AudioError(
        ERROR_CODES.INVALID_URL,
        ERROR_MESSAGES.INVALID_URL,
        { url }
      );
      this.notifyError(error);
      throw error;
    }

    this.log('Starting audio playback', { url, fallbackCount: fallbackUrls?.length || 0 }, 'info');

    try {
      await this.attemptPlay();
    } catch (error) {
      this.metrics.failedPlaybacks++;
      throw error;
    }
  }

  /**
   * 一時停止
   */
  pause(): void {
    this.audio.pause();
    this.log('Audio paused', {}, 'debug');
    this.notifyPlaybackStatus();
  }

  /**
   * 停止
   */
  stop(): void {
    this.audio.pause();
    this.audio.currentTime = 0;
    this.log('Audio stopped', {}, 'debug');
    this.notifyPlaybackStatus();
  }

  /**
   * 再生速度を設定
   */
  setPlaybackRate(rate: number): void {
    const clampedRate = Math.max(0.25, Math.min(2.0, rate));
    this.audio.playbackRate = clampedRate;
    this.log('Playback rate set', { requested: rate, applied: clampedRate }, 'debug');
  }

  /**
   * 現在の再生位置を取得
   */
  getCurrentTime(): number {
    return this.audio.currentTime;
  }

  /**
   * 再生位置をシーク
   */
  seek(time: number): void {
    const clampedTime = Math.max(0, Math.min(time, this.audio.duration));
    this.audio.currentTime = clampedTime;
    this.log('Seeked to', { requested: time, applied: clampedTime }, 'debug');
  }

  /**
   * 音量を設定 (0-1)
   */
  setVolume(volume: number): void {
    this.audio.volume = Math.max(0, Math.min(1, volume));
    this.log('Volume set', { volume: this.audio.volume }, 'debug');
  }

  /**
   * 再生状態コールバックを登録
   */
  onPlaybackStatusUpdate(callback: PlaybackStatusCallback): () => void {
    this.playbackStatusCallbacks.add(callback);
    this.log('Playback status callback registered', {}, 'debug');

    return () => {
      this.playbackStatusCallbacks.delete(callback);
      this.log('Playback status callback unregistered', {}, 'debug');
    };
  }

  /**
   * エラーコールバックを登録
   */
  onError(callback: ErrorCallback): () => void {
    this.errorCallbacks.add(callback);
    this.log('Error callback registered', {}, 'debug');

    return () => {
      this.errorCallbacks.delete(callback);
      this.log('Error callback unregistered', {}, 'debug');
    };
  }

  /**
   * メトリクスを取得
   */
  getMetrics() {
    return {
      ...this.metrics,
      cacheSize: this.cache.size,
    };
  }

  /**
   * キャッシュをクリア
   */
  clearCache(): void {
    this.cache.clear();
    this.log('Cache cleared', { previousSize: this.cache.size }, 'info');
  }

  /**
   * クリーンアップ
   */
  cleanup(): void {
    this.pause();
    this.audio.src = '';
    this.playbackStatusCallbacks.clear();
    this.errorCallbacks.clear();
    this.clearLoadTimeout();
    this.log('Audio manager cleaned up', { metrics: this.getMetrics() }, 'info');
  }

  // ====== Private Methods ======

  /**
   * 再生を試行（リトライ機能付き）
   */
  private async attemptPlay(): Promise<void> {
    try {
      this.clearLoadTimeout();

      const urlsToTry = [this.primaryUrl, ...this.fallbackUrls].filter(
        (u) => u && u.length > 0
      );

      if (urlsToTry.length === 0) {
        throw new AudioError(
          ERROR_CODES.INVALID_URL,
          ERROR_MESSAGES.INVALID_URL,
          { reason: 'No valid URLs provided' }
        );
      }

      const url = urlsToTry[0];
      this.log(
        'Attempting to load URL',
        { url, attempt: this.currentRetry + 1, maxAttempts: this.config.retryAttempts + 1 },
        'info'
      );

      // キャッシュから取得
      if (this.config.enableCache && this.isCached(url)) {
        const cached = this.cache.get(url)!;
        this.log('Using cached metadata', { url }, 'debug');
      }

      this.audio.src = url;
      this.setupLoadTimeout();
      await this.waitForCanPlay();

      this.clearLoadTimeout();
      await this.audio.play();

      this.metrics.successfulPlaybacks++;
      this.log('Audio playback started successfully', { url }, 'info');
      this.notifyPlaybackStatus();
    } catch (error) {
      this.clearLoadTimeout();

      let audioError: AudioError;

      if (error instanceof AudioError) {
        audioError = error;
      } else {
        const errorMessage = error instanceof Error ? error.message : String(error);
        audioError = this.categorizeError(errorMessage);
      }

      // エラーカウント
      const count = (this.metrics.errorCounts.get(audioError.code) || 0) + 1;
      this.metrics.errorCounts.set(audioError.code, count);

      this.log(
        'Play attempt failed',
        {
          error: audioError.toString(),
          attempt: this.currentRetry + 1,
          maxAttempts: this.config.retryAttempts + 1,
        },
        'warn'
      );

      // リトライロジック
      if (this.currentRetry < this.config.retryAttempts) {
        this.currentRetry++;
        this.metrics.totalRetries++;
        this.log('Retrying playback', { attempt: this.currentRetry }, 'info');

        const backoffMs = Math.min(1000 * Math.pow(2, this.currentRetry - 1), 5000);
        await new Promise((resolve) => setTimeout(resolve, backoffMs));

        return this.attemptPlay();
      }

      // すべてのリトライが失敗
      this.metrics.failedPlaybacks++;
      this.notifyError(audioError);
      throw audioError;
    }
  }

  /**
   * canplayイベントを待つ
   */
  private waitForCanPlay(): Promise<void> {
    return new Promise((resolve, reject) => {
      const handleCanPlay = () => {
        cleanup();
        resolve();
      };

      const handleError = () => {
        cleanup();
        const errorCode = this.audio.error?.code || 4;
        let audioError: AudioError;

        switch (errorCode) {
          case 1: // MEDIA_ERR_ABORTED
            audioError = new AudioError(
              ERROR_CODES.UNKNOWN_ERROR,
              'Audio loading was aborted',
              { code: errorCode }
            );
            break;
          case 2: // MEDIA_ERR_NETWORK
            audioError = new AudioError(
              ERROR_CODES.NETWORK_ERROR,
              ERROR_MESSAGES.NETWORK_ERROR,
              { code: errorCode }
            );
            break;
          case 3: // MEDIA_ERR_DECODE
            audioError = new AudioError(
              ERROR_CODES.DECODE_ERROR,
              ERROR_MESSAGES.DECODE_ERROR,
              { code: errorCode }
            );
            break;
          case 4: // MEDIA_ERR_SRC_NOT_SUPPORTED
            audioError = new AudioError(
              ERROR_CODES.UNSUPPORTED_FORMAT,
              ERROR_MESSAGES.UNSUPPORTED_FORMAT,
              { code: errorCode }
            );
            break;
          default:
            audioError = new AudioError(
              ERROR_CODES.UNKNOWN_ERROR,
              ERROR_MESSAGES.UNKNOWN_ERROR,
              { code: errorCode, message: this.audio.error?.message }
            );
        }

        reject(audioError);
      };

      const handleTimeout = () => {
        cleanup();
        const error = new AudioError(
          ERROR_CODES.TIMEOUT,
          ERROR_MESSAGES.TIMEOUT,
          { timeoutMs: this.config.timeout }
        );
        reject(error);
      };

      const timeout = setTimeout(handleTimeout, this.config.timeout);

      const cleanup = () => {
        this.audio.removeEventListener('canplay', handleCanPlay);
        this.audio.removeEventListener('error', handleError);
        clearTimeout(timeout);
      };

      this.audio.addEventListener('canplay', handleCanPlay, { once: true });
      this.audio.addEventListener('error', handleError, { once: true });

      if (this.audio.readyState >= 3) {
        cleanup();
        resolve();
      }
    });
  }

  /**
   * オーディオイベントリスナーのセットアップ
   */
  private setupAudioEventListeners(): void {
    this.audio.addEventListener('play', () => {
      this.log('Audio play event', {}, 'debug');
      this.notifyPlaybackStatus();
    });

    this.audio.addEventListener('pause', () => {
      this.log('Audio pause event', {}, 'debug');
      this.notifyPlaybackStatus();
    });

    this.audio.addEventListener('ended', () => {
      this.log('Audio ended', {}, 'debug');
      this.notifyPlaybackStatus();
    });

    this.audio.addEventListener('timeupdate', () => {
      this.notifyPlaybackStatus();
    });

    this.audio.addEventListener('durationchange', () => {
      this.log('Duration changed', { duration: this.audio.duration }, 'debug');
      this.notifyPlaybackStatus();
    });

    this.audio.addEventListener('progress', () => {
      const buffered = this.calculateBufferPercentage();
      this.log('Audio buffering', { buffered: `${buffered.toFixed(1)}%` }, 'debug');
    });

    this.audio.addEventListener('error', () => {
      const error = this.audio.error?.message || 'Unknown audio error';
      this.log('Audio error event', { error }, 'error');
    });

    this.audio.addEventListener('loadstart', () => {
      this.log('Audio load start', {}, 'debug');
    });
  }

  /**
   * ロードタイムアウトをセットアップ
   */
  private setupLoadTimeout(): void {
    this.loadTimeoutId = setTimeout(() => {
      this.log('Load timeout occurred', { timeoutMs: this.config.timeout }, 'warn');
      this.audio.pause();
      const error = new AudioError(
        ERROR_CODES.TIMEOUT,
        ERROR_MESSAGES.TIMEOUT,
        { timeoutMs: this.config.timeout }
      );
      this.notifyError(error);
    }, this.config.timeout);
  }

  /**
   * ロードタイムアウトをクリア
   */
  private clearLoadTimeout(): void {
    if (this.loadTimeoutId) {
      clearTimeout(this.loadTimeoutId);
      this.loadTimeoutId = null;
    }
  }

  /**
   * 再生状態を通知
   */
  private notifyPlaybackStatus(): void {
    const bufferedPercentage = this.calculateBufferPercentage();

    const state: PlaybackState = {
      isPlaying: !this.audio.paused && !this.audio.ended,
      currentTime: this.audio.currentTime,
      duration: this.audio.duration || 0,
      buffered: bufferedPercentage,
    };

    this.playbackStatusCallbacks.forEach((callback) => {
      try {
        callback(state);
      } catch (error) {
        this.log('Error in playback status callback', { error }, 'error');
      }
    });
  }

  /**
   * エラーを通知
   */
  private notifyError(error: AudioError): void {
    this.errorCallbacks.forEach((callback) => {
      try {
        callback(error);
      } catch (err) {
        this.log('Error in error callback', { error: err }, 'error');
      }
    });
  }

  /**
   * URLをバリデーション
   */
  private isValidUrl(url: string): boolean {
    if (!url || url.length === 0) {
      return false;
    }
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * エラーを分類
   */
  private categorizeError(errorMessage: string): AudioError {
    if (errorMessage.includes('CORS')) {
      return new AudioError(ERROR_CODES.CORS_ERROR, ERROR_MESSAGES.CORS_ERROR, {
        originalMessage: errorMessage,
      });
    } else if (errorMessage.includes('timeout')) {
      return new AudioError(ERROR_CODES.TIMEOUT, ERROR_MESSAGES.TIMEOUT, {
        originalMessage: errorMessage,
      });
    } else if (
      errorMessage.includes('network') ||
      errorMessage.includes('NetworkError')
    ) {
      return new AudioError(ERROR_CODES.NETWORK_ERROR, ERROR_MESSAGES.NETWORK_ERROR, {
        originalMessage: errorMessage,
      });
    } else if (errorMessage.includes('decode') || errorMessage.includes('not supported')) {
      return new AudioError(ERROR_CODES.DECODE_ERROR, ERROR_MESSAGES.DECODE_ERROR, {
        originalMessage: errorMessage,
      });
    } else {
      return new AudioError(ERROR_CODES.UNKNOWN_ERROR, ERROR_MESSAGES.UNKNOWN_ERROR, {
        originalMessage: errorMessage,
      });
    }
  }

  /**
   * バッファ率を計算
   */
  private calculateBufferPercentage(): number {
    if (
      !this.audio.buffered ||
      this.audio.duration === 0 ||
      this.audio.duration === Infinity
    ) {
      return 0;
    }

    try {
      for (let i = 0; i < this.audio.buffered.length; i++) {
        const start = this.audio.buffered.start(i);
        const end = this.audio.buffered.end(i);

        if (start <= this.audio.currentTime && this.audio.currentTime <= end) {
          return end / this.audio.duration;
        }
      }
    } catch (e) {
      // バッファ情報の取得に失敗
    }

    return 0;
  }

  /**
   * URLがキャッシュされているか確認
   */
  private isCached(url: string): boolean {
    const cached = this.cache.get(url);
    if (!cached) return false;

    const age = Date.now() - cached.timestamp;
    const isExpired = age > this.config.cacheExpireMs;

    if (isExpired) {
      this.cache.delete(url);
      return false;
    }

    return true;
  }

  /**
   * ログ出力
   */
  private log(message: string, data?: any, level: string = 'info'): void {
    if (!this.config.debugLog) return;

    const logLevels = ['error', 'warn', 'info', 'debug'];
    const currentLevelIndex = logLevels.indexOf(this.config.logLevel);
    const messageLevelIndex = logLevels.indexOf(level);

    if (messageLevelIndex > currentLevelIndex) return;

    const timestamp = new Date().toISOString();
    const prefix = `[EnhancedWebAudioManager ${timestamp}] [${level.toUpperCase()}]`;

    if (level === 'error') {
      console.error(prefix, message, data);
    } else if (level === 'warn') {
      console.warn(prefix, message, data);
    } else {
      console.log(prefix, message, data);
    }
  }
}

/**
 * シングルトンインスタンス
 */
let sharedInstance: EnhancedWebAudioManager | null = null;

export function getSharedEnhancedAudioManager(
  config?: AudioManagerConfig
): EnhancedWebAudioManager {
  if (!sharedInstance) {
    sharedInstance = new EnhancedWebAudioManager(config);
  }
  return sharedInstance;
}

export function resetEnhancedAudioManager(): void {
  if (sharedInstance) {
    sharedInstance.cleanup();
    sharedInstance = null;
  }
}
