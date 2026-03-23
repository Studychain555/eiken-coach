/**
 * Enhanced Audio Player Component
 * Plays word pronunciation with caching and error handling
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  ActivityIndicator,
  Text,
  StyleSheet,
  AccessibilityInfo,
} from 'react-native';
import { Audio } from 'expo-av';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useGoogleTTS } from '@/src/lib/google-tts-service';

interface EnhancedAudioPlayerProps {
  word: string;
  reading?: string;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
  language?: string;
  onPlayStart?: () => void;
  onPlayEnd?: () => void;
  onError?: (error: Error) => void;
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 50,
    backgroundColor: '#E8F4F8',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  buttonLarge: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  buttonSmall: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  buttonPlayback: {
    backgroundColor: '#00BCD4',
  },
  label: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    fontWeight: '500',
  },
  loadingContainer: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: 8,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00BCD4',
  },
});

export const EnhancedAudioPlayer: React.FC<EnhancedAudioPlayerProps> = ({
  word,
  reading,
  size = 'medium',
  showLabel = true,
  language = 'en-US',
  onPlayStart,
  onPlayEnd,
  onError,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const { generateAudioUrl } = useGoogleTTS();

  // Cleanup sound on unmount
  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const handlePlayAudio = async () => {
    try {
      setIsLoading(true);
      onPlayStart?.();

      // Get audio URL (from cache or generate)
      const audioUrl = await generateAudioUrl(word, language);

      // Create and play sound
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: true }
      );

      setSound(newSound);
      setIsPlaying(true);

      // Handle playback end
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (!status.isLoaded) {
          return;
        }

        if (status.didJustFinish) {
          setIsPlaying(false);
          onPlayEnd?.();
        }
      });
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Audio playback error:', err);
      onError?.(err);

      // Optionally show user-friendly error message
      if (__DEV__) {
        console.warn('Failed to play audio for word:', word);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleStopAudio = async () => {
    try {
      if (sound && isPlaying) {
        await sound.stopAsync();
        setIsPlaying(false);
        onPlayEnd?.();
      }
    } catch (error) {
      console.error('Error stopping audio:', error);
    }
  };

  const getButtonSize = () => {
    switch (size) {
      case 'small':
        return 36;
      case 'large':
        return 56;
      case 'medium':
      default:
        return 44;
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'small':
        return 20;
      case 'large':
        return 28;
      case 'medium':
      default:
        return 24;
    }
  };

  const buttonSize = getButtonSize();
  const iconSize = getIconSize();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.button,
          size === 'large' && styles.buttonLarge,
          size === 'small' && styles.buttonSmall,
          isPlaying && styles.buttonPlayback,
          { height: buttonSize, width: buttonSize },
        ]}
        onPress={isPlaying ? handleStopAudio : handlePlayAudio}
        disabled={isLoading}
        accessible={true}
        accessibilityLabel={`Play pronunciation for ${word}`}
        accessibilityHint={reading ? `Pronunciation: ${reading}` : undefined}
        accessibilityRole="button"
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#00BCD4" />
          </View>
        ) : (
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons
              name={isPlaying ? 'pause' : 'volume-high'}
              size={iconSize}
              color={isPlaying ? '#FFF' : '#00BCD4'}
            />
          </View>
        )}
      </TouchableOpacity>

      {showLabel && !isLoading && (
        <Text style={styles.label}>
          {isPlaying ? '再生中' : '発音'}
        </Text>
      )}
    </View>
  );
};

/**
 * Inline audio player (for word lists)
 */
export const InlineAudioButton: React.FC<{
  word: string;
  onError?: (error: Error) => void;
}> = ({ word, onError }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { generateAudioUrl } = useGoogleTTS();

  const handlePlay = async () => {
    try {
      setIsLoading(true);
      const audioUrl = await generateAudioUrl(word);

      const { sound } = await Audio.Sound.createAsync({ uri: audioUrl });
      await sound.playAsync();

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      onError?.(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePlay}
      disabled={isLoading}
      style={{ padding: 8 }}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color="#00BCD4" />
      ) : (
        <MaterialCommunityIcons name="volume-high" size={20} color="#00BCD4" />
      )}
    </TouchableOpacity>
  );
};

export default EnhancedAudioPlayer;
