/**
 * WebAudioManager - HTML5 Audio API を使用したWeb版音声再生管理
 * CORS対応、リトライ、タイムアウト、フォールバック戦略を実装
 * デバッグログ機能付き
 */

import { debugLog as debugLogUtil } from './debugUtils';

export interface AudioManagerConfig {
  crossOrigin?: 'anonymous' | 'use-credentials';
  timeout?: number; // ミリ秒（デフォルト: 10000ms）
  retryAttempts?: number; // リトライ回数（デフォルト: 2）
  debugLog?: boolean; // デバッグログ出力
}

export interface PlaybackState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  error?: string;
}

type PlaybackStatusCallback = (state: PlaybackState) => void;
type ErrorCallback = (error: string) => void;

export class WebAudioManager {
  private audio: HTMLAudioElement;
  private playbackStatusCallbacks: Set<PlaybackStatusCallback> = new Set();
  private errorCallbacks: Set<ErrorCallback> = new Set();
  private config: Required<AudioManagerConfig>;
  private loadTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private currentRetry: number = 0;
  private primaryUrl: string = '';
  private fallbackUrls: string[] = [];

  constructor(config: AudioManagerConfig = {}) {
    this.config = {
      crossOrigin: config.crossOrigin || 'anonymous',
      timeout: config.timeout || 10000,
      retryAttempts: config.retryAttempts || 2,
      debugLog: config.debugLog ?? true,
    };

    this.audio = new Audio();
    this.audio.crossOrigin = this.config.crossOrigin;
    this.setupAudioEventListeners();

    this.log('WebAudioManager initialized', { config: this.config });
  }

  /**
   * 音声を読み込んで再生
   * @param url メインURL
   * @param fallbackUrls フォールバックURL（複数指定可能）
   */
  async play(url: string, fallbackUrls?: string[]): Promise<void> {
    this.primaryUrl = url;
    this.fallbackUrls = fallbackUrls || [];
    this.currentRetry = 0;

    this.log('Starting audio playback', { url, fallbackUrls });
    return this.attemptPlay();
  }

  /**
   * 再生を一時停止
   */
  pause(): void {
    this.audio.pause();
    this.log('Audio paused');
    this.notifyPlaybackStatus();
  }

  /**
   * 再生を停止
   */
  stop(): void {
    this.audio.pause();
    this.audio.currentTime = 0;
    this.log('Audio stopped');
    this.notifyPlaybackStatus();
  }

  /**
   * 再生速度を設定
   */
  setPlaybackRate(rate: number): void {
    const clampedRate = Math.max(0.25, Math.min(2.0, rate));
    this.audio.playbackRate = clampedRate;
    this.log('Playback rate set', { rate: clampedRate });
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
    this.audio.currentTime = Math.max(0, Math.min(time, this.audio.duration));
    this.log('Seeked to', { time: this.audio.currentTime });
  }

  /**
   * 音量を設定 (0-1)
   */
  setVolume(volume: number): void {
    this.audio.volume = Math.max(0, Math.min(1, volume));
    this.log('Volume set', { volume: this.audio.volume });
  }

  /**
   * 再生状態のコールバックを登録
   */
  onPlaybackStatusUpdate(callback: PlaybackStatusCallback): () => void {
    this.playbackStatusCallbacks.add(callback);
    this.log('Playback status callback registered');

    // アンサブスクライブ関数を返す
    return () => {
      this.playbackStatusCallbacks.delete(callback);
      this.log('Playback status callback unregistered');
    };
  }

  /**
   * エラーコールバックを登録
   */
  onError(callback: ErrorCallback): () => void {
    this.errorCallbacks.add(callback);
    this.log('Error callback registered');

    return () => {
      this.errorCallbacks.delete(callback);
      this.log('Error callback unregistered');
    };
  }

  /**
   * クリーンアップ（メモリ解放）
   */
  cleanup(): void {
    this.pause();
    this.audio.src = '';
    this.playbackStatusCallbacks.clear();
    this.errorCallbacks.clear();
    if (this.loadTimeoutId) {
      clearTimeout(this.loadTimeoutId);
    }
    this.log('Audio manager cleaned up');
  }

  // ====== Private Methods ======

  /**
   * 再生を試行（リトライ機能付き）
   */
  private async attemptPlay(): Promise<void> {
    try {
      this.clearLoadTimeout();

      // URLのリストを構築
      const urlsToTry = [this.primaryUrl, ...this.fallbackUrls].filter(
        (u) => u && u.length > 0
      );

      if (urlsToTry.length === 0) {
        throw new Error('No valid URLs provided');
      }

      // 最初のURLを試行
      const url = urlsToTry[0];
      this.log('Attempting to load URL', { url, attempt: this.currentRetry + 1 });

      this.audio.src = url;

      // タイムアウトを設定
      this.setupLoadTimeout();

      // メタデータの読み込みを待つ
      await this.waitForCanPlay();

      // 再生開始
      this.clearLoadTimeout();
      await this.audio.play();

      this.log('Audio playback started successfully', { url });
      this.notifyPlaybackStatus();
    } catch (error) {
      this.clearLoadTimeout();
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.log('Play attempt failed', {
        error: errorMessage,
        attempt: this.currentRetry + 1,
        maxAttempts: this.config.retryAttempts,
      });

      // リトライロジック
      if (this.currentRetry < this.config.retryAttempts) {
        this.currentRetry++;
        this.log('Retrying playback', { attempt: this.currentRetry });

        // エクスポーネンシャルバックオフ
        const backoffMs = Math.min(1000 * Math.pow(2, this.currentRetry - 1), 5000);
        await new Promise((resolve) => setTimeout(resolve, backoffMs));

        return this.attemptPlay();
      }

      // すべてのリトライが失敗した場合
      const finalError = `Audio playback failed after ${this.config.retryAttempts + 1} attempts: ${errorMessage}`;
      this.log('All playback attempts failed', { error: finalError });
      this.notifyError(finalError);
      throw new Error(finalError);
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
        reject(new Error(`Failed to load audio: ${this.audio.error?.message || 'Unknown error'}`));
      };

      const timeout = setTimeout(() => {
        cleanup();
        reject(new Error(`Audio loading timeout (${this.config.timeout}ms)`));
      }, this.config.timeout);

      const cleanup = () => {
        this.audio.removeEventListener('canplay', handleCanPlay);
        this.audio.removeEventListener('error', handleError);
        clearTimeout(timeout);
      };

      this.audio.addEventListener('canplay', handleCanPlay, { once: true });
      this.audio.addEventListener('error', handleError, { once: true });

      // 既にcanplayの状態の場合
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
      this.log('Audio play event');
      this.notifyPlaybackStatus();
    });

    this.audio.addEventListener('pause', () => {
      this.log('Audio pause event');
      this.notifyPlaybackStatus();
    });

    this.audio.addEventListener('ended', () => {
      this.log('Audio ended');
      this.notifyPlaybackStatus();
    });

    this.audio.addEventListener('timeupdate', () => {
      this.notifyPlaybackStatus();
    });

    this.audio.addEventListener('durationchange', () => {
      this.log('Duration changed', { duration: this.audio.duration });
      this.notifyPlaybackStatus();
    });

    this.audio.addEventListener('error', () => {
      const error = this.audio.error?.message || 'Unknown audio error';
      this.log('Audio error event', { error });
      this.notifyError(error);
    });

    this.audio.addEventListener('loadstart', () => {
      this.log('Audio load start');
    });

    this.audio.addEventListener('loading', () => {
      this.log('Audio loading');
    });
  }

  /**
   * ロードタイムアウトをセットアップ
   */
  private setupLoadTimeout(): void {
    this.loadTimeoutId = setTimeout(() => {
      this.log('Load timeout occurred');
      this.audio.pause();
      this.notifyError(`Failed to load audio within ${this.config.timeout}ms`);
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
    const state: PlaybackState = {
      isPlaying: !this.audio.paused && !this.audio.ended,
      currentTime: this.audio.currentTime,
      duration: this.audio.duration || 0,
    };

    this.playbackStatusCallbacks.forEach((callback) => {
      try {
        callback(state);
      } catch (error) {
        this.log('Error in playback status callback', { error });
      }
    });
  }

  /**
   * エラーを通知
   */
  private notifyError(error: string): void {
    this.errorCallbacks.forEach((callback) => {
      try {
        callback(error);
      } catch (err) {
        this.log('Error in error callback', { error: err });
      }
    });
  }

  /**
   * ログ出力
   */
  private log(message: string, data?: any): void {
    if (this.config.debugLog) {
      debugLogUtil('WebAudioManager', message, data);
    }
  }
}

/**
 * シングルトンインスタンス（アプリケーション全体で共有）
 */
let sharedInstance: WebAudioManager | null = null;

export function getSharedAudioManager(config?: AudioManagerConfig): WebAudioManager {
  if (!sharedInstance) {
    sharedInstance = new WebAudioManager(config);
  }
  return sharedInstance;
}

/**
 * シングルトンをリセット
 */
export function resetSharedAudioManager(): void {
  if (sharedInstance) {
    sharedInstance.cleanup();
    sharedInstance = null;
  }
}
