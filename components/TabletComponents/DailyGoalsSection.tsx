/**
 * Daily Goals Section Component
 * Displays 3 learning goal cards in horizontal layout
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Colors, Spacing, Typography, BorderRadius, DuolingoColors } from '@/constants/theme';

const { width } = Dimensions.get('window');
const isTablet = width >= 600;
const cardWidth = isTablet ? (width - Spacing.xl * 2 - Spacing.lg * 2) / 3 : (width - Spacing.xl * 2 - Spacing.lg) / 2;

interface GoalItem {
  count: number;
  xpReward: number;
  completed: boolean;
}

interface DailyGoalsSectionProps {
  listeningGoal: GoalItem;
  vocabularyGoal: GoalItem;
  writingGoal: GoalItem;
}

export default function DailyGoalsSection({
  listeningGoal,
  vocabularyGoal,
  writingGoal,
}: DailyGoalsSectionProps) {
  const renderGoalCard = (
    icon: string,
    title: string,
    count: number,
    xpReward: number,
    completed: boolean,
    color: string,
  ) => (
    <View key={title} style={[styles.goalCard, { borderColor: color }]}>
      <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <Text style={styles.goalTitle}>{title}</Text>
      <Text style={styles.goalCount}>{count}</Text>
      <View style={styles.progressDots}>
        {[0, 1, 2].map((i) => (
          <View
            key={i}
            style={[
              styles.dot,
              {
                backgroundColor:
                  i < (completed ? count : 0)
                    ? color
                    : Colors.light.border,
              },
            ]}
          />
        ))}
      </View>
      <Text style={styles.xpReward}>+{xpReward}XP</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>今日の目標</Text>
      <View style={styles.goalsContainer}>
        {renderGoalCard(
          '🎧',
          'リスニング',
          listeningGoal.count,
          listeningGoal.xpReward,
          listeningGoal.completed,
          DuolingoColors.primary,
        )}
        {renderGoalCard(
          '📚',
          '英単語',
          vocabularyGoal.count,
          vocabularyGoal.xpReward,
          vocabularyGoal.completed,
          DuolingoColors.warning,
        )}
        {renderGoalCard(
          '✏️',
          'ライティング',
          writingGoal.count,
          writingGoal.xpReward,
          writingGoal.completed,
          DuolingoColors.error,
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.light.background,
  },
  sectionTitle: {
    ...Typography.h5,
    color: Colors.light.text,
    fontWeight: '700',
    marginBottom: Spacing.lg,
  },
  goalsContainer: {
    flexDirection: 'row',
    gap: Spacing.lg,
  },
  goalCard: {
    flex: 1,
    backgroundColor: Colors.light.surfaceCard,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 150,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  icon: {
    fontSize: 24,
  },
  goalTitle: {
    ...Typography.bodySmall,
    color: Colors.light.textSecondary,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  goalCount: {
    ...Typography.h4,
    color: Colors.light.text,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  progressDots: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  xpReward: {
    ...Typography.caption,
    color: Colors.light.primary,
    fontWeight: '700',
  },
});
