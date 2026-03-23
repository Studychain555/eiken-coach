/**
 * Learning Statistics Dashboard Component
 * Detailed view of learning progress (similar to reference Image 2)
 * Can be used as a separate page or modal
 */

import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Colors, Spacing, Typography, BorderRadius, DuolingoColors } from '@/constants/theme';

const { width } = Dimensions.get('window');

interface LearningStatsDashboardProps {
  title?: string;
  masteryPercentage: number;
  skills: Array<{
    name: string;
    icon: string;
    completed: number;
    total: number;
    lastStudied?: string;
    timeSpent?: number;
  }>;
  estimatedHours?: number;
  todayMinutes?: number;
  onClose?: () => void;
  showBackButton?: boolean;
}

export default function LearningStatsDashboard({
  title = '2次関数の学習成況',
  masteryPercentage,
  skills,
  estimatedHours = 5,
  todayMinutes = 45,
  onClose,
  showBackButton = true,
}: LearningStatsDashboardProps) {
  const getPercentageColor = (percentage: number): string => {
    if (percentage >= 80) return DuolingoColors.success;
    if (percentage >= 50) return DuolingoColors.warning;
    return DuolingoColors.error;
  };

  const masteryColor = useMemo(() => getPercentageColor(masteryPercentage), [masteryPercentage]);

  // Calculate circular progress (for visual effect)
  const circleRadius = 80;
  const circumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circumference - (masteryPercentage / 100) * circumference;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        {showBackButton && (
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.backButton}>
              <Text style={styles.backButtonText}>← 戻る</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{title}</Text>
          </View>
        )}

        {/* Mastery Overview Section */}
        <View style={styles.masteryOverviewSection}>
          <Text style={styles.sectionTitle}>習熟度</Text>

          {/* Large Percentage Display */}
          <View style={styles.percentageContainer}>
            <View style={styles.percentageCircle}>
              <Text style={[styles.percentageText, { color: masteryColor }]}>
                {masteryPercentage}%
              </Text>
            </View>

            {/* Progress Bar Below */}
            <View style={styles.progressBarWrapper}>
              <View
                style={[
                  styles.progressBar,
                  {
                    width: `${masteryPercentage}%`,
                    backgroundColor: masteryColor,
                  },
                ]}
              />
            </View>

            {/* Status Text */}
            <Text style={styles.statusText}>
              {masteryPercentage >= 80
                ? '習得完了'
                : masteryPercentage >= 50
                  ? '学習中'
                  : '計画中'}
            </Text>
          </View>

          {/* Legend */}
          <View style={styles.legendSection}>
            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View style={[styles.colorBox, { backgroundColor: DuolingoColors.success }]} />
                <Text style={styles.legendLabel}>100% 完全習得</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.colorBox, { backgroundColor: DuolingoColors.warning }]} />
                <Text style={styles.legendLabel}>50% 学習中</Text>
              </View>
            </View>
            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View style={[styles.colorBox, { backgroundColor: DuolingoColors.error }]} />
                <Text style={styles.legendLabel}>0% 計画中</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.colorBox, { backgroundColor: Colors.light.border }]} />
                <Text style={styles.legendLabel}>未開始</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Skill Breakdown Section */}
        <View style={styles.skillBreakdownSection}>
          <Text style={styles.sectionTitle}>スキル別詳細</Text>

          {skills.map((skill, index) => {
            const skillPercentage =
              skill.total > 0 ? Math.round((skill.completed / skill.total) * 100) : 0;
            const skillColor = getPercentageColor(skillPercentage);

            return (
              <View key={index} style={styles.skillDetailCard}>
                {/* Skill Header */}
                <View style={styles.skillDetailHeader}>
                  <View style={styles.skillDetailTitleSection}>
                    <Text style={styles.skillDetailIcon}>{skill.icon}</Text>
                    <View style={styles.skillDetailTitles}>
                      <Text style={styles.skillDetailName}>{skill.name}</Text>
                      <Text style={styles.skillDetailStats}>
                        {skill.completed} / {skill.total} 完了
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.skillDetailPercentage, { color: skillColor }]}>
                    {skillPercentage}%
                  </Text>
                </View>

                {/* Progress Bar */}
                <View style={styles.skillDetailBarContainer}>
                  <View
                    style={[
                      styles.skillDetailBar,
                      {
                        width: `${Math.max(5, skillPercentage)}%`,
                        backgroundColor: skillColor,
                      },
                    ]}
                  />
                </View>

                {/* Meta Info */}
                {(skill.lastStudied || skill.timeSpent) && (
                  <View style={styles.skillDetailMeta}>
                    {skill.lastStudied && (
                      <Text style={styles.skillDetailMetaText}>
                        最終学習: {skill.lastStudied}
                      </Text>
                    )}
                    {skill.timeSpent && (
                      <Text style={styles.skillDetailMetaText}>
                        学習時間: {skill.timeSpent}分
                      </Text>
                    )}
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Learning Time Estimate Section */}
        <View style={styles.timeEstimateSection}>
          <Text style={styles.sectionTitle}>学習予測</Text>

          <View style={styles.timeEstimateCard}>
            <View style={styles.timeEstimateItem}>
              <Text style={styles.timeEstimateIcon}>⏱️</Text>
              <View style={styles.timeEstimateContent}>
                <Text style={styles.timeEstimateLabel}>推定学習時間</Text>
                <Text style={styles.timeEstimateValue}>
                  {estimatedHours}～{Math.ceil(estimatedHours * 1.5)}時間
                </Text>
              </View>
            </View>

            <View style={styles.timeEstimateItem}>
              <Text style={styles.timeEstimateIcon}>📚</Text>
              <View style={styles.timeEstimateContent}>
                <Text style={styles.timeEstimateLabel}>本日の学習</Text>
                <Text style={styles.timeEstimateValue}>{todayMinutes}分</Text>
              </View>
            </View>
          </View>

          {/* Trend Indicator */}
          <View style={styles.trendIndicator}>
            <Text style={styles.trendText}>📈 学習ペース: 順調に進んでいます</Text>
          </View>
        </View>

        {/* Recent Activity Section */}
        <View style={styles.activitySection}>
          <Text style={styles.sectionTitle}>最近の活動</Text>

          {[
            { date: '今日 14:30', skill: 'リスニング', mastery: 75 },
            { date: '昨日 10:15', skill: '英単語', mastery: 68 },
            { date: '2日前 16:45', skill: 'ライティング', mastery: 82 },
            { date: '3日前 09:20', skill: 'リスニング', mastery: 71 },
          ].map((activity, index) => (
            <View key={index} style={styles.activityItem}>
              <View style={styles.activityMeta}>
                <Text style={styles.activityDate}>{activity.date}</Text>
                <Text style={styles.activitySkill}>{activity.skill}</Text>
              </View>
              <View style={styles.activityProgress}>
                <View
                  style={[
                    styles.activityProgressBar,
                    {
                      width: `${activity.mastery}%`,
                      backgroundColor: getPercentageColor(activity.mastery),
                    },
                  ]}
                />
              </View>
              <Text style={styles.activityMastery}>{activity.mastery}%</Text>
            </View>
          ))}
        </View>

        {/* Bottom Padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollContent: {
    paddingBottom: Spacing.xl,
  },
  header: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.light.surfaceCard,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  backButton: {
    padding: Spacing.sm,
  },
  backButtonText: {
    ...Typography.bodySmall,
    color: DuolingoColors.primary,
    fontWeight: '600',
  },
  headerTitle: {
    ...Typography.h4,
    color: Colors.light.text,
    fontWeight: '700',
    flex: 1,
  },
  masteryOverviewSection: {
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
  percentageContainer: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  percentageCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: Colors.light.surfaceCard,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    borderWidth: 2,
    borderColor: Colors.light.border,
  },
  percentageText: {
    fontSize: 56,
    fontWeight: '900',
    lineHeight: 64,
  },
  progressBarWrapper: {
    width: '100%',
    height: 16,
    backgroundColor: Colors.light.border,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
  },
  progressBar: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
  statusText: {
    ...Typography.bodySmall,
    color: Colors.light.textSecondary,
    fontWeight: '600',
  },
  legendSection: {
    width: '100%',
    backgroundColor: Colors.light.surfaceCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  colorBox: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  legendLabel: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
    fontWeight: '500',
  },
  skillBreakdownSection: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
  },
  skillDetailCard: {
    backgroundColor: Colors.light.surfaceCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: DuolingoColors.primary,
  },
  skillDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  skillDetailTitleSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  skillDetailIcon: {
    fontSize: 24,
  },
  skillDetailTitles: {
    flex: 1,
  },
  skillDetailName: {
    ...Typography.bodySmall,
    color: Colors.light.text,
    fontWeight: '700',
  },
  skillDetailStats: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
    fontWeight: '500',
    marginTop: 2,
  },
  skillDetailPercentage: {
    ...Typography.h5,
    fontWeight: '700',
  },
  skillDetailBarContainer: {
    height: 8,
    backgroundColor: Colors.light.border,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  skillDetailBar: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
  skillDetailMeta: {
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    gap: Spacing.sm,
  },
  skillDetailMetaText: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
    fontWeight: '500',
  },
  timeEstimateSection: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
  },
  timeEstimateCard: {
    backgroundColor: Colors.light.surfaceCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  timeEstimateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  timeEstimateIcon: {
    fontSize: 28,
  },
  timeEstimateContent: {
    flex: 1,
  },
  timeEstimateLabel: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
    fontWeight: '600',
  },
  timeEstimateValue: {
    ...Typography.bodySmall,
    color: Colors.light.text,
    fontWeight: '700',
    marginTop: 2,
  },
  trendIndicator: {
    backgroundColor: DuolingoColors.success + '20',
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  trendText: {
    ...Typography.bodySmall,
    color: DuolingoColors.success,
    fontWeight: '600',
  },
  activitySection: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.surfaceCard,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  activityMeta: {
    minWidth: 100,
  },
  activityDate: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
    fontWeight: '600',
  },
  activitySkill: {
    ...Typography.bodySmall,
    color: Colors.light.text,
    fontWeight: '600',
    marginTop: 2,
  },
  activityProgress: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.light.border,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  activityProgressBar: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
  activityMastery: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
    fontWeight: '700',
    minWidth: 35,
    textAlign: 'right',
  },
  bottomPadding: {
    height: Spacing.xl,
  },
});
