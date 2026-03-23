/**
 * OfflineBanner Component
 * ネットワーク接続状態を表示するバナー
 * 常にアプリトップに配置
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { Colors, Spacing, Typography } from '@/constants/theme';

interface OfflineBannerProps {
  isOnline: boolean;
  onDismiss?: () => void;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({
  isOnline,
  onDismiss,
}) => {
  const [showMessage, setShowMessage] = React.useState(!isOnline);
  const heightAnim = React.useRef(new Animated.Value(isOnline ? 0 : 48)).current;
  const [messageType, setMessageType] = React.useState<'offline' | 'online'>(
    isOnline ? 'online' : 'offline'
  );

  useEffect(() => {
    if (!isOnline) {
      // Show offline banner
      setMessageType('offline');
      setShowMessage(true);
      Animated.timing(heightAnim, {
        toValue: 48,
        duration: 300,
        useNativeDriver: false,
      }).start();
    } else {
      // Show online message, then dismiss after 2 seconds
      setMessageType('online');
      Animated.timing(heightAnim, {
        toValue: 48,
        duration: 300,
        useNativeDriver: false,
      }).start();

      const timer = setTimeout(() => {
        Animated.timing(heightAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }).start(() => {
          setShowMessage(false);
          onDismiss?.();
        });
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isOnline, heightAnim, onDismiss]);

  if (!showMessage) {
    return null;
  }

  const isOffline = messageType === 'offline';
  const backgroundColor = isOffline ? '#ffebee' : '#e8f5e9';
  const textColor = isOffline ? '#c62828' : '#2e7d32';
  const icon = isOffline ? '📡' : '✓';
  const message = isOffline
    ? 'インターネット接続がありません'
    : '接続されました';

  return (
    <Animated.View
      style={[
        styles.container,
        {
          height: heightAnim,
          backgroundColor,
        },
      ]}
    >
      <View style={styles.content}>
        <Text style={styles.icon}>{icon}</Text>
        <Text style={[styles.message, { color: textColor }]}>{message}</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  icon: {
    fontSize: 16,
  },
  message: {
    ...Typography.bodySmall,
    fontWeight: '600',
  },
});
