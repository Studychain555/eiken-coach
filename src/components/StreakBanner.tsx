/**
 * StreakBanner Component
 * Displays daily streak with motivational message
 * Duolingo-style momentum visualization
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DuolingoColors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';
import { Colors } from '@/constants/theme';

interface StreakBannerProps {
  streakDays: number;
  xpBonus?: number;
  showMotivation?: boolean;
}

export const StreakBanner: React.FC<StreakBannerProps> = ({
  streakDays,
  xpBonus = 0,
  showMotivation = true,
}) => {
  if (streakDays === 0) {
    return null;
  }

  return (
    <View style={[styles.container as any, styles.shadow]}>
      <View style={styles.content}>
        <Text style={styles.flameEmoji}>🔥</Text>
        <View style={styles.textSection as any}>
          <Text style={styles.streakNumber}>{streakDays}日 連続学習!</Text>
          {xpBonus > 0 && (
            <Text style={styles.bonusText}>{xpBonus} ポイント更に獲得!</Text>
          )}
        </View>
      </View>
      {showMotivation && (
        <Text style={styles.motivationText}>明日も頑張ろう!</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: DuolingoColors.cardBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderTopWidth: 2,
    borderTopColor: DuolingoColors.streak,
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  flameEmoji: {
    fontSize: 32,
  },
  textSection: {
    flex: 1,
  },
  streakNumber: {
    fontSize: 18,
    fontWeight: 600,
    lineHeight: 24,
    color: Colors.light.text,
    marginBottom: Spacing.xs,
  } as any,
  bonusText: {
    fontSize: 14,
    fontWeight: 600,
    lineHeight: 20,
    color: DuolingoColors.accent,
  } as any,
  motivationText: {
    fontSize: 16,
    fontWeight: 400,
    lineHeight: 24,
    color: Colors.light.textSecondary,
    textAlign: 'center',
  } as any,
});
