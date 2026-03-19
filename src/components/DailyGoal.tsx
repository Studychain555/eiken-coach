/**
 * DailyGoal Component
 * Displays daily lesson goal with progress dots and XP reward
 * Duolingo-style motivational display
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, DuolingoColors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';

interface DailyGoalProps {
  target: number;
  completed: number;
  xpReward: number;
  onComplete?: () => void;
}

export const DailyGoal: React.FC<DailyGoalProps> = ({
  target,
  completed,
  xpReward,
  onComplete,
}) => {
  const isComplete = completed >= target;
  const progressPercentage = (completed / target) * 100;

  // Generate progress dots
  const dots = Array.from({ length: target }, (_, i) => (
    <View
      key={i}
      style={[
        styles.dot,
        {
          backgroundColor: i < completed ? DuolingoColors.success : DuolingoColors.lightBg,
        },
      ]}
    />
  ));

  React.useEffect(() => {
    if (isComplete && onComplete) {
      onComplete();
    }
  }, [isComplete]);

  return (
    <View style={[styles.container, styles.shadow]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🎯 本日のゴール</Text>
        {isComplete && <Text style={styles.checkmark}>✅</Text>}
      </View>

      {/* Goal text */}
      <Text style={styles.goalText}>
        {target} レッスン完了で
        <Text style={styles.xpText}> +{xpReward}XP</Text>
        獲得!
      </Text>

      {/* Progress dots */}
      <View style={styles.dotsContainer}>{dots}</View>

      {/* Progress text */}
      <Text style={styles.progressText}>
        {completed} / {target} 完了
      </Text>

      {/* Progress bar */}
      <View style={styles.progressBarContainer}>
        <View
          style={[
            styles.progressBar,
            {
              width: `${progressPercentage}%`,
              backgroundColor: isComplete ? DuolingoColors.success : DuolingoColors.accent,
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: DuolingoColors.cardBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: DuolingoColors.streak,
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: 16,
    fontWeight: 600,
    lineHeight: 24,
    color: Colors.light.text,
  } as any,
  checkmark: {
    fontSize: 20,
  },
  goalText: {
    fontSize: 16,
    fontWeight: 400,
    lineHeight: 24,
    color: Colors.light.textSecondary,
    marginBottom: Spacing.md,
  } as any,
  xpText: {
    color: DuolingoColors.accent,
    fontWeight: 600,
  } as any,
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  progressText: {
    fontSize: 14,
    fontWeight: 400,
    lineHeight: 20,
    color: Colors.light.textTertiary,
    marginBottom: Spacing.md,
    textAlign: 'center',
  } as any,
  progressBarContainer: {
    height: 6,
    backgroundColor: Colors.light.backgroundAlt,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
});
