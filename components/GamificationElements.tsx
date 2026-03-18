import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Colors, Spacing, BorderRadius, Shadows, Typography } from '@/constants/theme';

interface BadgeProps {
  label: string;
  emoji: string;
  color?: 'gold' | 'silver' | 'bronze' | 'blue' | 'purple' | 'green';
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Achievement Badge Component
 * Displays achievement badges earned by users
 */
export function Badge({ label, emoji, color = 'blue', size = 'md' }: BadgeProps) {
  const sizeMap = {
    sm: {
      emojiSize: 24,
      textSize: 12,
      padding: Spacing.sm,
      emojiMargin: Spacing.xs,
    },
    md: {
      emojiSize: 32,
      textSize: 14,
      padding: Spacing.md,
      emojiMargin: Spacing.sm,
    },
    lg: {
      emojiSize: 40,
      textSize: 16,
      padding: Spacing.lg,
      emojiMargin: Spacing.md,
    },
  };

  const colorMap = {
    gold: { bg: '#fef3c7', border: '#fbbf24', text: '#92400e' },
    silver: { bg: '#f3f4f6', border: '#d1d5db', text: '#374151' },
    bronze: { bg: '#fed7aa', border: '#fb923c', text: '#7c2d12' },
    blue: { bg: '#dbeafe', border: '#0ea5e9', text: '#0c4a6e' },
    purple: { bg: '#e9d5ff', border: '#c084fc', text: '#581c87' },
    green: { bg: '#dcfce7', border: '#4ade80', text: '#166534' },
  };

  const config = sizeMap[size];
  const colorConfig = colorMap[color];

  return (
    <View
      style={[
        styles.badgeContainer,
        {
          backgroundColor: colorConfig.bg,
          borderColor: colorConfig.border,
          padding: config.padding,
        },
      ]}
    >
      <Text style={{ fontSize: config.emojiSize, marginBottom: config.emojiMargin }}>
        {emoji}
      </Text>
      <Text style={[styles.badgeLabel, { fontSize: config.textSize, color: colorConfig.text }]}>
        {label}
      </Text>
    </View>
  );
}

interface StreakDisplayProps {
  days: number;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Streak Display Component
 * Shows consecutive learning days with flame animation
 */
export function StreakDisplay({ days, size = 'md' }: StreakDisplayProps) {
  const sizeMap = {
    sm: { containerPadding: Spacing.sm, fontSize: 16, flameSize: 24 },
    md: { containerPadding: Spacing.md, fontSize: 20, flameSize: 32 },
    lg: { containerPadding: Spacing.lg, fontSize: 24, flameSize: 40 },
  };

  const config = sizeMap[size];

  return (
    <View style={[styles.streakContainer, { padding: config.containerPadding }]}>
      <Text style={{ fontSize: config.flameSize }}>🔥</Text>
      <View style={styles.streakContent}>
        <Text style={[styles.streakLabel, { fontSize: config.fontSize - 4 }]}>
          連続学習
        </Text>
        <Text style={[styles.streakValue, { fontSize: config.fontSize }]}>
          {days}日
        </Text>
      </View>
    </View>
  );
}

interface ProgressRingProps {
  percentage: number;
  size?: number;
  color?: string;
  backgroundColor?: string;
  showLabel?: boolean;
  labelFontSize?: number;
}

/**
 * Progress Ring Component
 * Circular progress indicator for learning goals
 */
export function ProgressRing({
  percentage,
  size = 120,
  color = Colors.light.primary,
  backgroundColor = Colors.light.border,
  showLabel = true,
  labelFontSize = 18,
}: ProgressRingProps) {
  const circumference = 2 * Math.PI * (size / 2 - 10);
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <View style={[styles.progressRingContainer, { width: size, height: size }]}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - 10}
          fill="none"
          stroke={backgroundColor}
          strokeWidth="8"
        />
        {/* Progress Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - 10}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      {showLabel && (
        <Text style={[styles.progressRingLabel, { fontSize: labelFontSize }]}>
          {percentage}%
        </Text>
      )}
    </View>
  );
}

interface AchievementCardProps {
  title: string;
  description: string;
  emoji: string;
  unlocked: boolean;
  progress?: number;
}

/**
 * Achievement Card Component
 * Shows a single achievement with unlock status
 */
export function AchievementCard({
  title,
  description,
  emoji,
  unlocked,
  progress,
}: AchievementCardProps) {
  const opacity = unlocked ? 1 : 0.5;

  return (
    <View
      style={[
        styles.achievementCard,
        {
          opacity,
          backgroundColor: unlocked ? Colors.light.surfaceCard : Colors.light.backgroundAlt,
        },
        Shadows.sm,
      ]}
    >
      <View
        style={[
          styles.achievementEmoji,
          {
            backgroundColor: unlocked ? Colors.light.primaryLight : Colors.light.border,
          },
        ]}
      >
        <Text style={styles.emojiText}>{emoji}</Text>
      </View>
      <View style={styles.achievementContent}>
        <Text style={styles.achievementTitle}>{title}</Text>
        <Text style={styles.achievementDescription}>{description}</Text>
        {progress !== undefined && !unlocked && (
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${progress}%`,
                  backgroundColor: Colors.light.warning,
                },
              ]}
            />
          </View>
        )}
      </View>
      {unlocked && (
        <Text style={styles.unlockedBadge}>✅</Text>
      )}
    </View>
  );
}

interface LevelBadgeProps {
  level: number;
  nextLevelProgress?: number;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Level Badge Component
 * Shows user learning level with progress to next level
 */
export function LevelBadge({ level, nextLevelProgress = 0, size = 'md' }: LevelBadgeProps) {
  const sizeMap = {
    sm: { size: 60, fontSize: 20, ringWidth: 3 },
    md: { size: 80, fontSize: 28, ringWidth: 4 },
    lg: { size: 120, fontSize: 32, ringWidth: 5 },
  };

  const config = sizeMap[size];
  const circumference = 2 * Math.PI * (config.size / 2 - config.ringWidth);
  const strokeDashoffset = circumference - (nextLevelProgress / 100) * circumference;

  return (
    <View
      style={[
        styles.levelBadgeContainer,
        {
          width: config.size,
          height: config.size,
        },
      ]}
    >
      <svg
        width={config.size}
        height={config.size}
        viewBox={`0 0 ${config.size} ${config.size}`}
      >
        <circle
          cx={config.size / 2}
          cy={config.size / 2}
          r={config.size / 2 - config.ringWidth}
          fill="none"
          stroke={Colors.light.border}
          strokeWidth={config.ringWidth}
        />
        <circle
          cx={config.size / 2}
          cy={config.size / 2}
          r={config.size / 2 - config.ringWidth}
          fill="none"
          stroke={Colors.light.primary}
          strokeWidth={config.ringWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${config.size / 2} ${config.size / 2})`}
        />
      </svg>
      <View style={styles.levelBadgeContent}>
        <Text style={[styles.levelNumber, { fontSize: config.fontSize }]}>
          {level}
        </Text>
        <Text style={styles.levelLabel}>LV.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  badgeContainer: {
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    justifyContent: 'center',
  },
  badgeLabel: {
    fontWeight: '600',
    textAlign: 'center',
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.primaryLight,
    borderRadius: BorderRadius.lg,
    borderLeftWidth: 4,
    borderLeftColor: Colors.light.streak,
  },
  streakContent: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  streakLabel: {
    color: Colors.light.textSecondary,
    fontWeight: '500',
  },
  streakValue: {
    color: Colors.light.streak,
    fontWeight: '700',
    marginTop: Spacing.xs,
  },
  progressRingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  progressRingLabel: {
    position: 'absolute',
    fontWeight: '700',
    color: Colors.light.primary,
  },
  achievementCard: {
    flexDirection: 'row',
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  achievementEmoji: {
    width: 64,
    height: 64,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.lg,
  },
  emojiText: {
    fontSize: 32,
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: Spacing.xs,
  },
  achievementDescription: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginBottom: Spacing.md,
  },
  progressBar: {
    height: 4,
    backgroundColor: Colors.light.border,
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: BorderRadius.sm,
  },
  unlockedBadge: {
    fontSize: 24,
    marginLeft: Spacing.md,
  },
  levelBadgeContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  levelBadgeContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelNumber: {
    fontWeight: '800',
    color: Colors.light.primary,
    marginBottom: -4,
  },
  levelLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.light.textSecondary,
  },
});
