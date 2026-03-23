/**
 * XPRewardSystem Component
 * Displays hearts, level, and XP information in header
 * Duolingo-style gamification header
 */

import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Colors, DuolingoColors, Spacing, Typography, BorderRadius } from '@/constants/theme';

interface XPRewardSystemProps {
  hearts: number;
  maxHearts: number;
  currentLevel: number;
  currentXP: number;
  xpForNextLevel: number;
  streakDays?: number;
}

export const XPRewardSystem: React.FC<XPRewardSystemProps> = ({
  hearts,
  maxHearts,
  currentLevel,
  currentXP,
  xpForNextLevel,
  streakDays = 0,
}) => {
  const xpProgressPercentage = (currentXP / (currentXP + xpForNextLevel)) * 100;

  // Generate heart display
  const heartDisplay = Array.from({ length: maxHearts }, (_, i) => (
    <Text key={i} style={styles.heart}>
      {i < hearts ? '❤️' : '🤍'}
    </Text>
  ));

  return (
    <View style={styles.container}>
      {/* Left section: Hearts */}
      <View style={styles.section}>
        <View style={styles.heartsContainer}>{heartDisplay}</View>
      </View>

      {/* Center section: Streak (if provided) */}
      {streakDays > 0 && (
        <View style={styles.streakContainer}>
          <Text style={styles.streakEmoji}>🔥</Text>
          <Text style={styles.streakText}>{streakDays}</Text>
        </View>
      )}

      {/* Right section: Level & XP */}
      <View style={styles.section}>
        <View style={styles.levelContainer}>
          <Text style={styles.levelEmoji}>⭐</Text>
          <View>
            <Text style={styles.levelText}>Lv.{currentLevel}</Text>
            {/* XP Progress mini bar */}
            <View style={styles.xpMiniBar}>
              <View
                style={[
                  styles.xpMiniProgress,
                  { width: `${Math.min(xpProgressPercentage, 100)}%` },
                ]}
              />
            </View>
            <Text style={styles.xpLabel}>
              {currentXP}/{currentXP + xpForNextLevel} XP
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: DuolingoColors.lightBg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  section: {
    flex: 1,
  },
  heartsContainer: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  heart: {
    fontSize: 20,
  },
  streakContainer: {
    alignItems: 'center',
    flex: 0,
  },
  streakEmoji: {
    fontSize: 20,
    marginBottom: Spacing.xs,
  },
  streakText: {
    fontSize: 12,
    fontWeight: 600,
    lineHeight: 16,
    color: DuolingoColors.streak,
    textAlign: 'center',
  } as any,
  levelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  levelEmoji: {
    fontSize: 18,
  },
  levelText: {
    fontSize: 12,
    fontWeight: 600,
    lineHeight: 16,
    color: Colors.light.text,
  } as any,
  xpMiniBar: {
    width: 60,
    height: 4,
    backgroundColor: Colors.light.backgroundAlt,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    marginTop: Spacing.xs,
  },
  xpMiniProgress: {
    height: '100%',
    backgroundColor: DuolingoColors.accent,
    borderRadius: BorderRadius.full,
  },
  xpLabel: {
    fontSize: 11,
    fontWeight: 400,
    lineHeight: 14,
    color: Colors.light.textTertiary,
    marginTop: Spacing.xs,
    textAlign: 'center',
  } as any,
});
