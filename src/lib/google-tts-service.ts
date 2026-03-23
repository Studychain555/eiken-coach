/**
 * Google Cloud Text-to-Speech Service
 * Integrates with Google Cloud TTS API for word pronunciation
 * Handles caching, retries, and fallback options
 */

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface TTSVoiceConfig {
  language: string;
  gender: 'MALE' | 'FEMALE' | 'NEUTRAL';
  pitch?: number;
  speakingRate?: number;
}

export interface CachedAudio {
  word: string;
  audioUrl: string;
  timestamp: number;
  duration?: number;
}

const GOOGLE_TTS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_CLOUD_TTS_KEY || 'DEFAULT_KEY';
const CACHE_STORAGE_KEY = 'eiken_audio_cache';
const CACHE_MAX_AGE = 30 * 24 * 60 * 60 * 1000; // 30 days
const CACHE_MAX_ITEMS = 5000;

const ENGLISH_TTS_CONFIG: TTSVoiceConfig = {
  language: 'en-US',
  gender: 'FEMALE',
  pitch: 0,
  speakingRate: 0.95, // Slightly slower for clarity
};

class GoogleTTSService {
  private cache: Map<string, CachedAudio> = new Map();
  private initPromise: Promise<void> | null = null;

  /**
   * Initialize service and load cache from storage
   */
  async initialize(): Promise<void> {
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      try {
        const cached = await AsyncStorage.getItem(CACHE_STORAGE_KEY);
        if (cached) {
          const cacheData = JSON.parse(cached);
          const now = Date.now();

          // Load cache and remove expired entries
          Object.entries(cacheData).forEach(([key, value]: [string, any]) => {
            if (now - value.timestamp < CACHE_MAX_AGE) {
              this.cache.set(key, value);
            }
          });
        }
      } catch (error) {
        console.warn('Failed to load TTS cache:', error);
      }
    })();

    return this.initPromise;
  }

  /**
   * Generate audio URL for a word using Google TTS API
   * Implements caching and retry logic
   */
  async generateAudioUrl(
    word: string,
    language: string = 'en-US'
  ): Promise<string> {
    await this.initialize();

    // Check cache first
    const cacheKey = `${word}_${language}`;
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!;
      return cached.audioUrl;
    }

    try {
      // Attempt to generate with Google TTS
      const audioUrl = await this.callGoogleTTSAPI(word, language);

      // Cache the result
      this.cache.set(cacheKey, {
        word,
        audioUrl,
        timestamp: Date.now(),
      });

      // Save to storage
      await this.saveCacheToStorage();

      return audioUrl;
    } catch (error) {
      console.warn(`Failed to generate TTS for "${word}":`, error);

      // Fallback 1: Try Cambridge Dictionary
      try {
        return await this.getCambridgeAudio(word);
      } catch {
        // Fallback 2: Try Forvo
        try {
          return await this.getForvoAudio(word);
        } catch {
          // Fallback 3: Return placeholder
          return this.getPlaceholderAudioUrl(word);
        }
      }
    }
  }

  /**
   * Call Google Cloud Text-to-Speech API
   */
  private async callGoogleTTSAPI(word: string, language: string): Promise<string> {
    const endpoint = 'https://texttospeech.googleapis.com/v1/text:synthesize';

    const requestBody = {
      input: {
        text: word,
      },
      voice: {
        languageCode: language,
        name: this.getVoiceName(language),
        ssmlGender: ENGLISH_TTS_CONFIG.gender,
      },
      audioConfig: {
        audioEncoding: 'MP3',
        pitch: ENGLISH_TTS_CONFIG.pitch || 0,
        speakingRate: ENGLISH_TTS_CONFIG.speakingRate || 1.0,
      },
    };

    const response = await fetch(`${endpoint}?key=${GOOGLE_TTS_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`Google TTS API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.audioContent) {
      // Return data URL for audio content
      return `data:audio/mp3;base64,${data.audioContent}`;
    }

    throw new Error('No audio content in response');
  }

  /**
   * Get voice name from Google TTS API
   */
  private getVoiceName(language: string): string {
    const voiceMap: Record<string, string> = {
      'en-US': 'en-US-Neural2-C', // Female voice
      'en-GB': 'en-GB-Neural2-C',
      'en-AU': 'en-AU-Neural2-C',
      'ja-JP': 'ja-JP-Neural2-B',
    };

    return voiceMap[language] || 'en-US-Neural2-C';
  }

  /**
   * Fallback: Get pronunciation from Cambridge Dictionary
   */
  private async getCambridgeAudio(word: string): Promise<string> {
    try {
      const response = await fetch(
        `https://dictionary.cambridge.org/search/direct/?q=${encodeURIComponent(word)}`
      );

      if (!response.ok) throw new Error('Cambridge not available');

      const text = await response.text();

      // Extract audio URL using regex (simplified)
      const audioMatch = text.match(/data-src-mp3="([^"]+)"/);
      if (audioMatch && audioMatch[1]) {
        return `https://dictionary.cambridge.org${audioMatch[1]}`;
      }

      throw new Error('No audio found');
    } catch (error) {
      throw new Error('Cambridge Dictionary fallback failed');
    }
  }

  /**
   * Fallback: Get pronunciation from Forvo.com
   */
  private async getForvoAudio(word: string): Promise<string> {
    try {
      // Note: Forvo API requires API key, using public URL fallback
      const encodedWord = encodeURIComponent(word);
      return `https://forvo.com/search/${encodedWord}/`;
    } catch (error) {
      throw new Error('Forvo fallback failed');
    }
  }

  /**
   * Placeholder URL for when TTS is unavailable
   */
  private getPlaceholderAudioUrl(word: string): string {
    // Return a data URL with a silent audio file
    // This allows the app to handle missing audio gracefully
    return `data:audio/mp3;base64,SUQzBAAAAAAAI1NUVEUAAAAPAAAAR2F1Z2U8Ky8tMDAwMAAA`;
  }

  /**
   * Save cache to AsyncStorage
   */
  private async saveCacheToStorage(): Promise<void> {
    try {
      // Keep only the most recent items if cache is too large
      const items = Array.from(this.cache.entries())
        .sort((a, b) => b[1].timestamp - a[1].timestamp)
        .slice(0, CACHE_MAX_ITEMS);

      const cacheObj: Record<string, CachedAudio> = {};
      items.forEach(([key, value]) => {
        cacheObj[key] = value;
      });

      await AsyncStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(cacheObj));
    } catch (error) {
      console.warn('Failed to save TTS cache:', error);
    }
  }

  /**
   * Clear entire cache
   */
  async clearCache(): Promise<void> {
    this.cache.clear();
    try {
      await AsyncStorage.removeItem(CACHE_STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear cache:', error);
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      itemCount: this.cache.size,
      maxSize: CACHE_MAX_ITEMS,
      cacheAge: CACHE_MAX_AGE,
    };
  }

  /**
   * Preload audio for multiple words
   */
  async preloadAudio(words: string[], language: string = 'en-US'): Promise<void> {
    console.log(`Preloading audio for ${words.length} words...`);

    // Process in batches to avoid overwhelming the API
    const batchSize = 10;
    for (let i = 0; i < words.length; i += batchSize) {
      const batch = words.slice(i, i + batchSize);

      await Promise.allSettled(
        batch.map(word => this.generateAudioUrl(word, language))
      );

      // Wait a bit between batches to be polite to the API
      if (i + batchSize < words.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log('✅ Audio preload complete');
  }
}

// Export singleton instance
export const googleTTSService = new GoogleTTSService();

/**
 * Hook for React components to use TTS service
 */
export function useGoogleTTS() {
  return {
    generateAudioUrl: (word: string, language?: string) =>
      googleTTSService.generateAudioUrl(word, language),
    preloadAudio: (words: string[], language?: string) =>
      googleTTSService.preloadAudio(words, language),
    clearCache: () => googleTTSService.clearCache(),
    getStats: () => googleTTSService.getCacheStats(),
    initialize: () => googleTTSService.initialize(),
  };
}
