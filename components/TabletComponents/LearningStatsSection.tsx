/**
 * Learning Stats Section Component
 * Displays mastery percentage, skill breakdown, and estimated time
 */

import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ViewStyle,
} from 'react-native';
import { Colors, Spacing, Typography, BorderRadius, DuolingoColors } from '@/constants/theme';

const { width } = Dimensions.get('window');

interface SkillStat {
  name: string;
  completed: number;
  total: number;
  icon: string;
}

interface LearningStatsProps {
  masteryPercentage: number;
  stats: {
    listening: SkillStat;
    vocabulary: SkillStat;
    writing: SkillStat;
  };
  estimatedHours: number;
  todayMinutes: number;
}

export default function LearningStatsSection({
  masteryPercentage,
  stats,
  estimatedHours,
  todayMinutes,
}: LearningStatsProps) {
  const getProgressBarColor = (percentage: number): string => {
    if (percentage >= 80) return DuolingoColors.success;
    if (percentage >= 50) return DuolingoColors.warning;
    return DuolingoColors.error;
  };

  const skillOrder = ['listening', 'vocabulary', 'writing'] as const;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>学習進捗</Text>

      {/* Mastery Overview */}
      <View style={styles.masterySection}>
        <View style={styles.masteryCircle}>
          <Text style={styles.masteryPercentage}>{masteryPercentage}%</Text>
          <Text style={styles.masteryLabel}>習熟度</Text>
        </View>

        <View style={styles.masteryBarContainer}>
          <View
            style={[
              styles.masteryBar,
              {
                width: `${masteryPercentage}%`,
                backgroundColor: getProgressBarColor(masteryPercentage),
              },
            ]}
          />
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: DuolingoColors.success }]} />
            <Text style={styles.legendText}>完全習得</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: DuolingoColors.warning }]} />
            <Text style={styles.legendText}>学習中</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: DuolingoColors.error }]} />
            <Text style={styles.legendText}>計画中</Text>
          </View>
        </View>
      </View>

      {/* Skill Breakdown */}
      <View style={styles.skillsSection}>
        {skillOrder.map((skillKey) => {
          const skill = stats[skillKey];
          const percentage =
            skill.total > 0 ? Math.round((skill.completed / skill.total) * 100) : 0;
          const barColor = getProgressBarColor(percentage);

          return (
            <View key={skillKey} style={styles.skillRow}>
              <View style={styles.skillHeader}>
                <Text style={styles.skillIcon}>{skill.icon}</Text>
                <View style={styles.skillInfo}>
                  <Text style={styles.skillName}>{skill.name}</Text>
                  <Text style={styles.skillStats}>
                    {skill.completed}/{skill.total}
                  </Text>
                </View>
                <Text style={styles.skillPercentage}>{percentage}%</Text>
              </View>
              <View style={styles.skillBarContainer}>
                <View
                  style={[
                    styles.skillBar,
                    {
                      width: `${Math.max(5, percentage)}%`,
                      backgroundColor: barColor,
                    },
                  ]}
                />
              </View>
            </View>
          );
        })}
      </View>

      {/* Learning Time Info */}
      <View style={styles.timeInfoSection}>
        <View style={styles.timeInfoItem}>
          <Text style={styles.timeInfoIcon}>⏱️</Text>
          <View style={styles.timeInfoContent}>
            <Text style={styles.timeInfoLabel}>推定学習時間</Text>
            <Text style={styles.timeInfoValue}>
              {estimatedHours}～{Math.ceil(estimatedHours * 1.5)}時間
            </Text>
          </View>
        </View>
        <View style={styles.timeInfoItem}>
          <Text style={styles.timeInfoIcon}>📚</Text>
          <View style={styles.timeInfoContent}>
            <Text style={styles.timeInfoLabel}>本日の学習</Text>
            <Text style={styles.timeInfoValue}>{todayMinutes}分</Text>
          </View>
        </View>
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
  masterySection: {
    backgroundColor: Colors.light.surfaceCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  masteryCircle: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  masteryPercentage: {
    fontSize: 48,
    fontWeight: '900',
    color: DuolingoColors.primary,
    lineHeight: 56,
  },
  masteryLabel: {
    ...Typography.bodySmall,
    color: Colors.light.textSecondary,
    fontWeight: '600',
    marginTop: Spacing.xs,
  },
  masteryBarContainer: {
    height: 12,
    backgroundColor: Colors.light.border,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
  },
  masteryBar: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  legendColor: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
    fontWeight: '500',
  },
  skillsSection: {
    backgroundColor: Colors.light.surfaceCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  skillRow: {
    marginBottom: Spacing.lg,
  },
  skillHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  skillIcon: {
    fontSize: 20,
    marginRight: Spacing.md,
  },
  skillInfo: {
    flex: 1,
  },
  skillName: {
    ...Typography.bodySmall,
    color: Colors.light.text,
    fontWeight: '600',
  },
  skillStats: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
    fontWeight: '500',
    marginTop: 2,
  },
  skillPercentage: {
    ...Typography.bodySmall,
    color: Colors.light.primary,
    fontWeight: '700',
    minWidth: 40,
    textAlign: 'right',
  },
  skillBarContainer: {
    height: 6,
    backgroundColor: Colors.light.border,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  skillBar: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
  timeInfoSection: {
    backgroundColor: Colors.light.surfaceCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  timeInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  timeInfoIcon: {
    fontSize: 24,
  },
  timeInfoContent: {
    flex: 1,
  },
  timeInfoLabel: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
    fontWeight: '600',
  },
  timeInfoValue: {
    ...Typography.bodySmall,
    color: Colors.light.text,
    fontWeight: '700',
    marginTop: 2,
  },
});
