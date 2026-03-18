/**
 * useAudioPlayer Hook
 * Web (HTML5 Audio) とモバイル (expo-av) の両方をサポートする統一インターフェース
 * エラーハンドリング・デバッグロギング・リトライ機能付き
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { Platform } from 'react-native';
import { Audio } from 'expo-av';
import { WebAudioManager, AudioManagerConfig, PlaybackState } from '@/src/lib/audioManager';
import { debugLog, debugError, debugWarn } from '@/src/lib/debugUtils';
import { handleError } from '@/src/lib/errorHandler';

export interface AudioPlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  isLoading: boolean;
  error: string | null;
  playbackRate: number;
}

export interface UseAudioPlayerOptions extends AudioManagerConfig {
  autoPlay?: boolean;
  onPlaybackStatusUpdate?: (state: AudioPlayerState) => void;
  onError?: (error: string) => void;
}

/**
 * Webプラットフォーム用のカスタムフック
 */
function useWebAudioPlayer(options: UseAudioPlayerOptions = {}) {
  const audioManagerRef = useRef<WebAudioManager | null>(null);
  const [state, setState] = useState<AudioPlayerState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    isLoading: false,
    error: null,
    playbackRate: 1.0,
  });

  const TAG = 'useWebAudioPlayer';

  // オーディオマネージャーの初期化
  useEffect(() => {
    try {
      const manager = new WebAudioManager({
        crossOrigin: 'anonymous',
        timeout: options.timeout || 10000,
        retryAttempts: options.retryAttempts || 2,
        debugLog: options.debugLog ?? true,
      });

      audioManagerRef.current = manager;
      debugLog(TAG, 'Audio manager initialized');

      // 再生状態の更新
      const unsubscribePlayback = manager.onPlaybackStatusUpdate((status: PlaybackState) => {
        setState((prev) => ({
          ...prev,
          isPlaying: status.isPlaying,
          currentTime: status.currentTime,
          duration: status.duration,
          isLoading: false,
        }));

        if (options.onPlaybackStatusUpdate) {
          try {
            options.onPlaybackStatusUpdate({
              isPlaying: status.isPlaying,
              currentTime: status.currentTime,
              duration: status.duration,
              isLoading: false,
              error: null,
              playbackRate: state.playbackRate,
            });
          } catch (err) {
            debugError(TAG, 'Error in playback status callback', err);
          }
        }
      });

      // エラーハンドリング
      const unsubscribeError = manager.onError((error: string) => {
        debugError(TAG, 'Audio error from manager', error);
        setState((prev) => ({
          ...prev,
          isPlaying: false,
          error,
          isLoading: false,
        }));

        if (options.onError) {
          try {
            options.onError(error);
          } catch (err) {
            debugError(TAG, 'Error in custom error handler', err);
          }
        }
      });

      return () => {
        unsubscribePlayback();
        unsubscribeError();
        manager.cleanup();
      };
    } catch (error) {
      debugError(TAG, 'Failed to initialize audio manager', error);
      const appError = handleError(error, TAG);
      setState((prev) => ({
        ...prev,
        error: appError.message,
      }));
      return undefined;
    }
  }, []);

  const play = useCallback(
    async (url: string, fallbackUrls?: string[]) => {
      if (!audioManagerRef.current) {
        const error = 'Audio manager not initialized';
        debugError(TAG, error);
        setState((prev) => ({ ...prev, error, isLoading: false }));
        return;
      }

      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      debugLog(TAG, 'Play requested', { url, fallbackUrlCount: fallbackUrls?.length || 0 });

      try {
        await audioManagerRef.current.play(url, fallbackUrls);
      } catch (error) {
        const appError = handleError(error, TAG, { url });
        debugError(TAG, 'Play failed', appError.originalError);
        setState((prev) => ({
          ...prev,
          error: appError.message,
          isLoading: false,
        }));
      }
    },
    []
  );

  const pause = useCallback(() => {
    if (!audioManagerRef.current) return;
    audioManagerRef.current.pause();
  }, []);

  const stop = useCallback(() => {
    if (!audioManagerRef.current) return;
    audioManagerRef.current.stop();
  }, []);

  const setPlaybackRate = useCallback((rate: number) => {
    if (!audioManagerRef.current) return;
    audioManagerRef.current.setPlaybackRate(rate);
    setState((prev) => ({ ...prev, playbackRate: rate }));
  }, []);

  const seek = useCallback((time: number) => {
    if (!audioManagerRef.current) return;
    audioManagerRef.current.seek(time);
  }, []);

  const setVolume = useCallback((volume: number) => {
    if (!audioManagerRef.current) return;
    audioManagerRef.current.setVolume(volume);
  }, []);

  return {
    ...state,
    play,
    pause,
    stop,
    seek,
    setPlaybackRate,
    setVolume,
  };
}

/**
 * モバイルプラットフォーム用のカスタムフック
 */
function useMobileAudioPlayer(options: UseAudioPlayerOptions = {}) {
  const soundRef = useRef<Audio.Sound | null>(null);
  const statusUpdateSubscriptionRef = useRef<any>(null);
  const [state, setState] = useState<AudioPlayerState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    isLoading: false,
    error: null,
    playbackRate: 1.0,
  });

  const TAG = 'useMobileAudioPlayer';

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (statusUpdateSubscriptionRef.current) {
        try {
          statusUpdateSubscriptionRef.current.remove();
        } catch (err) {
          debugError(TAG, 'Error removing status update subscription', err);
        }
      }
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch((err) => {
          debugError(TAG, 'Error unloading sound', err);
        });
      }
    };
  }, []);

  const play = useCallback(
    async (url: string, fallbackUrls?: string[]) => {
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));
        debugLog(TAG, 'Play requested', {
          url,
          fallbackUrlCount: fallbackUrls?.length || 0,
        });

        // 既存の音声をアンロード
        if (soundRef.current) {
          try {
            await soundRef.current.unloadAsync();
          } catch (err) {
            debugWarn(TAG, 'Error unloading previous sound', err);
          }
        }

        const urlsToTry = [url, ...(fallbackUrls || [])].filter((u) => u && u.length > 0);

        if (urlsToTry.length === 0) {
          throw new Error('No valid URLs provided');
        }

        let lastError: Error | null = null;

        for (let i = 0; i < urlsToTry.length; i++) {
          try {
            const currentUrl = urlsToTry[i];
            debugLog(TAG, `Attempting to load URL ${i + 1}/${urlsToTry.length}`, {
              url: currentUrl,
            });

            const { sound } = await Audio.Sound.createAsync(
              { uri: currentUrl },
              { progressUpdateIntervalMillis: 100 },
              (status) => {
                try {
                  if (status.isLoaded) {
                    setState((prev) => ({
                      ...prev,
                      isPlaying: status.isPlaying,
                      currentTime: status.positionMillis / 1000,
                      duration: (status.durationMillis || 0) / 1000,
                      isLoading: false,
                    }));

                    if (options.onPlaybackStatusUpdate) {
                      try {
                        options.onPlaybackStatusUpdate({
                          isPlaying: status.isPlaying,
                          currentTime: status.positionMillis / 1000,
                          duration: (status.durationMillis || 0) / 1000,
                          isLoading: false,
                          error: null,
                          playbackRate: state.playbackRate,
                        });
                      } catch (err) {
                        debugError(TAG, 'Error in playback status callback', err);
                      }
                    }
                  }
                } catch (err) {
                  debugError(TAG, 'Error in status update handler', err);
                }
              }
            );

            soundRef.current = sound;

            // 再生開始
            await sound.playAsync();

            setState((prev) => ({ ...prev, isLoading: false }));
            debugLog(TAG, 'Audio playback started successfully');
            return;
          } catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));
            debugWarn(TAG, `Failed to load URL ${i + 1}/${urlsToTry.length}`, {
              error: lastError.message,
            });

            if (i < urlsToTry.length - 1) {
              // 次のURLを試す前に待機
              await new Promise((resolve) => setTimeout(resolve, 1000));
            }
          }
        }

        // すべてのURLが失敗
        const errorMessage = lastError
          ? `Failed to load audio: ${lastError.message}`
          : 'Failed to load audio from all URLs';

        const appError = handleError(new Error(errorMessage), TAG);
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: appError.message,
        }));

        if (options.onError) {
          try {
            options.onError(appError.message);
          } catch (err) {
            debugError(TAG, 'Error in custom error handler', err);
          }
        }
      } catch (error) {
        const appError = handleError(error, TAG);
        debugError(TAG, 'Playback error', appError.originalError);

        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: appError.message,
        }));

        if (options.onError) {
          try {
            options.onError(appError.message);
          } catch (err) {
            debugError(TAG, 'Error in custom error handler', err);
          }
        }
      }
    },
    [options, state.playbackRate]
  );

  const pause = useCallback(async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.pauseAsync();
        debugLog(TAG, 'Audio paused');
      }
    } catch (error) {
      debugError(TAG, 'Pause error', error);
    }
  }, []);

  const stop = useCallback(async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        debugLog(TAG, 'Audio stopped');
      }
    } catch (error) {
      debugError(TAG, 'Stop error', error);
    }
  }, []);

  const setPlaybackRate = useCallback(
    async (rate: number) => {
      try {
        if (soundRef.current) {
          await soundRef.current.setRateAsync(rate, true);
          setState((prev) => ({ ...prev, playbackRate: rate }));
          debugLog(TAG, 'Playback rate set', { rate });
        }
      } catch (error) {
        debugError(TAG, 'Failed to set playback rate', error);
      }
    },
    []
  );

  const seek = useCallback(async (time: number) => {
    try {
      if (soundRef.current) {
        await soundRef.current.setPositionAsync(time * 1000);
        debugLog(TAG, 'Seeked to', { time });
      }
    } catch (error) {
      debugError(TAG, 'Seek error', error);
    }
  }, []);

  const setVolume = useCallback(async (volume: number) => {
    try {
      if (soundRef.current) {
        await soundRef.current.setVolumeAsync(volume);
        debugLog(TAG, 'Volume set', { volume });
      }
    } catch (error) {
      debugError(TAG, 'Volume error', error);
    }
  }, []);

  return {
    ...state,
    play,
    pause,
    stop,
    seek,
    setPlaybackRate,
    setVolume,
  };
}

/**
 * useAudioPlayer Hook - Platform別に自動選択
 */
export function useAudioPlayer(options: UseAudioPlayerOptions = {}) {
  if (Platform.OS === 'web') {
    return useWebAudioPlayer(options);
  } else {
    return useMobileAudioPlayer(options);
  }
}
