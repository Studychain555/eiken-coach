/**
 * Welcome Header Component
 * Displays greeting, date, and level badge
 */

import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Colors, Spacing, Typography, BorderRadius, DuolingoColors, NaturalColors } from '@/constants/theme';

const { width } = Dimensions.get('window');

interface WelcomeHeaderProps {
  userName: string;
  level: number;
  xp: number;
}

export default function WelcomeHeader({ userName, level, xp }: WelcomeHeaderProps) {
  const getDateString = () => {
    return new Date().toLocaleDateString('ja-JP', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Left side: Greeting and date */}
        <View style={styles.greetingSection}>
          <Text style={styles.greeting}>おはよう、{userName}さん！</Text>
          <Text style={styles.date}>{getDateString()}</Text>
        </View>

        {/* Right side: Level badge */}
        <View style={styles.levelBadgeContainer}>
          <View style={styles.levelBadge}>
            <Text style={styles.levelLabel}>Lv.</Text>
            <Text style={styles.levelNumber}>{level}</Text>
          </View>
          <Text style={styles.xpLabel}>{xp.toLocaleString()}XP</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
    backgroundColor: Colors.light.surfaceCard,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greetingSection: {
    flex: 1,
  },
  greeting: {
    ...Typography.h2,
    color: Colors.light.text,
    fontWeight: '800',
    marginBottom: Spacing.sm,
  },
  date: {
    ...Typography.bodySmall,
    color: Colors.light.textSecondary,
    fontWeight: '500',
  },
  levelBadgeContainer: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  levelBadge: {
    backgroundColor: DuolingoColors.warning,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 70,
  },
  levelLabel: {
    fontSize: 10,
    color: Colors.light.surfaceCard,
    fontWeight: '600',
  },
  levelNumber: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.light.surfaceCard,
    lineHeight: 28,
  },
  xpLabel: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
    fontWeight: '600',
  },
});
