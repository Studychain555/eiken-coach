/**
 * ErrorScreen Component
 * 専用エラー表示画面 - API失敗、同期失敗時に使用
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';

interface ErrorScreenProps {
  title: string;
  description: string;
  retryFn: () => Promise<void> | void;
  isLoading?: boolean;
  icon?: 'warning' | 'error' | 'offline';
  showHomeButton?: boolean;
}

export const ErrorScreen: React.FC<ErrorScreenProps> = ({
  title,
  description,
  retryFn,
  isLoading = false,
  icon = 'error',
  showHomeButton = true,
}) => {
  const router = useRouter();
  const [isRetrying, setIsRetrying] = React.useState(false);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await retryFn();
    } catch (error) {
      console.error('Retry failed:', error);
    } finally {
      setIsRetrying(false);
    }
  };

  const getIcon = () => {
    switch (icon) {
      case 'warning':
        return '⚠️';
      case 'offline':
        return '📡';
      default:
        return '🔧';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Icon */}
        <Text style={styles.icon}>{getIcon()}</Text>

        {/* Title */}
        <Text style={styles.title}>{title}</Text>

        {/* Description */}
        <Text style={styles.description}>{description}</Text>

        {/* Loading indicator */}
        {(isLoading || isRetrying) && (
          <ActivityIndicator
            size="large"
            color={Colors.light.primary}
            style={styles.loader}
          />
        )}

        {/* Retry Button */}
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={handleRetry}
          disabled={isLoading || isRetrying}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonText}>
            {isRetrying ? '再度お試し中...' : '再度お試し'}
          </Text>
        </TouchableOpacity>

        {/* Home Button */}
        {showHomeButton && (
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={() => router.push('/(tabs)')}
            disabled={isLoading || isRetrying}
            activeOpacity={0.7}
          >
            <Text style={styles.secondaryButtonText}>ホーム画面へ</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  icon: {
    fontSize: 64,
    marginBottom: Spacing.lg,
  },
  title: {
    ...Typography.h3,
    color: '#d32f2f',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  description: {
    ...Typography.body,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Spacing.xl,
  },
  loader: {
    marginVertical: Spacing.xl,
  },
  button: {
    width: '100%',
    minHeight: 48,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.lg,
    ...Shadows.md,
  },
  primaryButton: {
    backgroundColor: Colors.light.primary,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
});
