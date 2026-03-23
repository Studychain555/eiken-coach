import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '@/constants/theme';

interface TeacherQuickStatsProps {
  classStats?: {
    totalStudents: number;
    averageScore: number;
    averageProgressRate: number;
    totalStudyMinutes: number;
    completedAssignments?: number;
  };
}

export const TeacherQuickStats: React.FC<TeacherQuickStatsProps> = ({ classStats }) => {
  const stats = [
    {
      label: '生徒数',
      value: classStats?.totalStudents || 0,
      icon: '👥',
      color: '#2E5090',
    },
    {
      label: '今週の課題',
      value: classStats?.completedAssignments || 0,
      icon: '📚',
      color: '#4CAF50',
    },
    {
      label: '平均進捗率',
      value: `${classStats?.averageProgressRate || 0}%`,
      icon: '📊',
      color: '#FF9800',
    },
    {
      label: '本週学習',
      value: `${Math.round((classStats?.totalStudyMinutes || 0) / 60)}h`,
      icon: '⏱️',
      color: '#E91E63',
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>クイック統計</Text>

      <View style={styles.statsGrid}>
        {stats.map((stat, index) => (
          <View key={index} style={styles.statCard}>
            <Text style={styles.statIcon}>{stat.icon}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
            <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
          </View>
        ))}
      </View>

      {/* Summary Section */}
      <View style={styles.summarySection}>
        <Text style={styles.summaryTitle}>クラス概要</Text>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>平均スコア</Text>
          <Text style={styles.summaryValue}>
            {classStats?.averageScore?.toFixed(1) || 0}点
          </Text>
        </View>
        <View style={[styles.summaryItem, styles.summaryItemLast]}>
          <Text style={styles.summaryLabel}>学習状況</Text>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  (classStats?.averageProgressRate || 0) >= 80
                    ? '#4CAF50'
                    : (classStats?.averageProgressRate || 0) >= 50
                      ? '#FF9800'
                      : '#F44336',
              },
            ]}
          >
            <Text style={styles.statusText}>
              {(classStats?.averageProgressRate || 0) >= 80
                ? '順調'
                : (classStats?.averageProgressRate || 0) >= 50
                  ? '普通'
                  : '要注意'}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: Spacing.lg,
  },
  statsGrid: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  statCard: {
    backgroundColor: Colors.light.surfaceCard,
    borderRadius: 8,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: Spacing.sm,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.light.textSecondary,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  summarySection: {
    backgroundColor: Colors.light.surfaceCard,
    borderRadius: 8,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  summaryTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: Spacing.md,
    paddingBottom: Spacing.md,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderLight,
  },
  summaryItemLast: {
    borderBottomWidth: 0,
  },
  summaryLabel: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.light.text,
  },
  statusBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
