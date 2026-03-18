import React, { useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

/**
 * Skeleton Loader Component
 * Shows a shimmer effect while content is loading
 */
export function SkeletonLoader({
  width = '100%',
  height = 20,
  borderRadius: radius = BorderRadius.md,
  style,
}: SkeletonLoaderProps) {
  const shimmerAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 0.9],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius: radius,
          opacity,
        },
        style,
      ]}
    />
  );
}

interface SkeletonCardProps {
  count?: number;
  style?: any;
}

/**
 * Skeleton Card Loader
 * Shows multiple skeleton lines for card content
 */
export function SkeletonCard({ count = 3, style }: SkeletonCardProps) {
  return (
    <View style={[styles.card, style]}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={styles.line}>
          <SkeletonLoader
            width={i === count - 1 ? '70%' : '100%'}
            height={i === 0 ? 24 : 16}
            style={{ marginBottom: i === count - 1 ? 0 : Spacing.md }}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: Colors.light.border,
  },
  card: {
    padding: Spacing.lg,
    backgroundColor: Colors.light.surfaceCard,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
  },
  line: {
    marginBottom: Spacing.md,
  },
});
