import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { LineChart, BarChart, ProgressChart } from 'react-native-chart-kit';
import { AnalyticsEngine } from '@/src/lib/analyticsEngine';
import type { ClassStatistics, StudentProgress, WeeklyProgressData } from '@/src/stores/teacherStore';

interface TeacherAnalyticsProps {
  classStats: ClassStatistics | null;
  students: StudentProgress[];
  weeklyProgress: WeeklyProgressData[];
}

const { width } = Dimensions.get('window');
const chartWidth = width - 32;

export const TeacherAnalytics: React.FC<TeacherAnalyticsProps> = ({
  classStats,
  students,
  weeklyProgress,
}) => {
  // Calculate analytics
  const analytics = useMemo(() => {
    const scores = students.map((s) => s.listeningScore);
    const listeningScores = scores;
    const vocabularyScores = students.map((s) => s.vocabularyScore);
    const writingScores = students.map((s) => s.writingScore);

    return {
      listeningAvg: AnalyticsEngine.calculateAverage(listeningScores),
      vocabularyAvg: AnalyticsEngine.calculateAverage(vocabularyScores),
      writingAvg: AnalyticsEngine.calculateAverage(writingScores),
      listeningStdDev: AnalyticsEngine.calculateStdDev(listeningScores),
      vocabularyStdDev: AnalyticsEngine.calculateStdDev(vocabularyScores),
      writingStdDev: AnalyticsEngine.calculateStdDev(writingScores),
      scoreDistribution: AnalyticsEngine.getScoreDistribution(listeningScores),
      engagementRate: AnalyticsEngine.calculateEngagementRate(
        students.map((s) => ({ studyHours: s.studyHours }))
      ),
    };
  }, [students]);

  // Prepare chart data
  const weeklyChartData = useMemo(() => {
    if (weeklyProgress.length === 0) return null;

    return {
      labels: weeklyProgress.map((w) => w.date.slice(5)), // MM-DD format
      datasets: [
        {
          data: weeklyProgress.map((w) => w.listeningScore / 100),
          color: (opacity = 1) => `rgba(0, 102, 204, ${opacity})`,
          strokeWidth: 2,
        },
      ],
      legend: ['リスニング'],
    };
  }, [weeklyProgress]);

  // Score distribution chart
  const scoreDistributionData = useMemo(() => {
    return {
      labels: analytics.scoreDistribution.map((d) => d.range),
      datasets: [
        {
          data: analytics.scoreDistribution.map((d) => d.percentage / 100),
        },
      ],
    };
  }, [analytics.scoreDistribution]);

  // Skill comparison (listening, vocabulary, writing)
  const skillComparisonData = useMemo(() => {
    return {
      labels: ['リスニング', '単語', 'ライティング'],
      data: [
        analytics.listeningAvg / 100,
        analytics.vocabularyAvg / 100,
        analytics.writingAvg / 100,
      ],
      colors: ['#2563eb', '#16a34a', '#ea580c'],
    };
  }, [analytics]);

  // Top performers ranking
  const topPerformers = useMemo(() => {
    const ranked = AnalyticsEngine.rankStudents(
      students.map((s) => ({
        id: s.studentId,
        name: s.studentName,
        score: (s.listeningScore + s.vocabularyScore + s.writingScore) / 3,
      }))
    );
    return ranked.slice(0, 5);
  }, [students]);

  // At-risk students
  const atRiskStudents = useMemo(() => {
    return AnalyticsEngine.identifyAtRiskStudents(
      students.map((s) => ({
        id: s.studentId,
        name: s.studentName,
        score: (s.listeningScore + s.vocabularyScore + s.writingScore) / 3,
        studyHours: s.studyHours,
      }))
    );
  }, [students]);

  return (
    <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>
      {/* Class Overview */}
      {classStats && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>クラス概要</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>生徒数</Text>
              <Text style={styles.statValue}>{classStats.totalStudents}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>平均スコア</Text>
              <Text style={styles.statValue}>{classStats.averageScore.toFixed(0)}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>進捗率</Text>
              <Text style={styles.statValue}>{classStats.averageProgressRate}%</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>学習時間</Text>
              <Text style={styles.statValue}>{Math.round(classStats.totalStudyMinutes / 60)}h</Text>
            </View>
          </View>
        </View>
      )}

      {/* Engagement Rate */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>クラス参加率</Text>
        <View style={styles.engagementCard}>
          <View style={styles.engagementCircle}>
            <Text style={styles.engagementRate}>{analytics.engagementRate}%</Text>
            <Text style={styles.engagementLabel}>生徒が学習中</Text>
          </View>
        </View>
      </View>

      {/* Weekly Progress Chart */}
      {weeklyChartData && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>週間進捗（リスニング）</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <LineChart
              data={weeklyChartData}
              width={chartWidth}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
            />
          </ScrollView>
        </View>
      )}

      {/* Score Distribution */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>スコア分布</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <BarChart
            data={scoreDistributionData}
            width={chartWidth}
            height={220}
            chartConfig={{
              ...chartConfig,
              barPercentage: 0.7,
            }}
            style={styles.chart}
            yAxisLabel=""
            yAxisSuffix="%"
          />
        </ScrollView>
      </View>

      {/* Skill Comparison */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>スキル比較</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <ProgressChart
            data={skillComparisonData}
            width={chartWidth}
            height={220}
            chartConfig={chartConfig}
            hideLegend={false}
            style={styles.chart}
          />
        </ScrollView>
        <View style={styles.skillStatsContainer}>
          <View style={styles.skillStat}>
            <Text style={styles.skillLabel}>リスニング</Text>
            <Text style={styles.skillValue}>{analytics.listeningAvg.toFixed(1)}</Text>
            <Text style={styles.skillStdDev}>標準偏差: {analytics.listeningStdDev.toFixed(2)}</Text>
          </View>
          <View style={styles.skillStat}>
            <Text style={styles.skillLabel}>単語</Text>
            <Text style={styles.skillValue}>{analytics.vocabularyAvg.toFixed(1)}</Text>
            <Text style={styles.skillStdDev}>標準偏差: {analytics.vocabularyStdDev.toFixed(2)}</Text>
          </View>
          <View style={styles.skillStat}>
            <Text style={styles.skillLabel}>ライティング</Text>
            <Text style={styles.skillValue}>{analytics.writingAvg.toFixed(1)}</Text>
            <Text style={styles.skillStdDev}>標準偏差: {analytics.writingStdDev.toFixed(2)}</Text>
          </View>
        </View>
      </View>

      {/* Top Performers */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>成績優秀者 Top 5</Text>
        {topPerformers.length > 0 ? (
          topPerformers.map((student) => (
            <View key={student.studentId} style={styles.rankingItem}>
              <View style={styles.rankBadge}>
                <Text style={styles.rankNumber}>{student.rank}</Text>
              </View>
              <View style={styles.rankingInfo}>
                <Text style={styles.rankingName}>{student.studentName}</Text>
                <Text style={styles.rankingScore}>{student.score.toFixed(1)}/100</Text>
              </View>
              <View
                style={[
                  styles.scoreBar,
                  {
                    width: ((student.score / 100) * 100 + '%') as any,
                    backgroundColor: student.score >= 80 ? '#4CAF50' : '#FFC107',
                  },
                ]}
              />
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>データなし</Text>
        )}
      </View>

      {/* At-Risk Students */}
      {atRiskStudents.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: '#f44336' }]}>要注視の生徒</Text>
          {atRiskStudents.map((student) => (
            <TouchableOpacity
              key={student.studentId}
              style={[
                styles.atRiskItem,
                student.priority === 'high' && styles.atRiskItemHigh,
              ]}
            >
              <View style={styles.atRiskContent}>
                <Text style={styles.atRiskName}>{student.studentName}</Text>
                <Text style={styles.atRiskReason}>{student.reason}</Text>
              </View>
              <View
                style={[
                  styles.priorityBadge,
                  student.priority === 'high'
                    ? styles.priorityBadgeHigh
                    : styles.priorityBadgeMedium,
                ]}
              >
                <Text style={styles.priorityText}>{student.priority === 'high' ? '高' : '中'}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Score Distribution Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>スコア分布詳細</Text>
        {analytics.scoreDistribution.map((dist) => (
          <View key={dist.range} style={styles.distributionItem}>
            <Text style={styles.distributionLabel}>{dist.range}点</Text>
            <View style={styles.distributionBar}>
              <View
                style={[
                  styles.distributionFill,
                  { width: (dist.percentage + '%') as any },
                ]}
              />
            </View>
            <Text style={styles.distributionCount}>
              {dist.count}人 ({dist.percentage}%)
            </Text>
          </View>
        ))}
      </View>

      {/* Summary Statistics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>統計サマリー</Text>
        <View style={styles.summaryBox}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>クラスサイズ:</Text>
            <Text style={styles.summaryValue}>{students.length}名</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>平均学習時間:</Text>
            <Text style={styles.summaryValue}>
              {(students.reduce((a, s) => a + s.studyHours, 0) / students.length).toFixed(1)}h/週
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>クラス全体の進捗:</Text>
            <Text style={styles.summaryValue}>
              {(students.reduce((a, s) => a + s.progressRate, 0) / students.length).toFixed(0)}%
            </Text>
          </View>
        </View>
      </View>

      {/* Bottom padding */}
      <View style={{ height: 24 }} />
    </ScrollView>
  );
};

const chartConfig = {
  backgroundColor: '#ffffff',
  backgroundGradientFrom: '#ffffff',
  backgroundGradientTo: '#ffffff',
  color: (opacity = 1) => `rgba(0, 102, 204, ${opacity})`,
  strokeWidth: 2,
  barPercentage: 0.6,
  useShadowColorFromDataset: false,
  decimalPlaces: 1,
  propsForLabels: {
    fontSize: 12,
    fill: '#666',
  },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f9ff',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statCard: {
    flex: 1,
    minWidth: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0066cc',
  },
  engagementCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  engagementCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#f0f7ff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#0066cc',
  },
  engagementRate: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0066cc',
  },
  engagementLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  chart: {
    borderRadius: 12,
    marginVertical: 8,
  },
  skillStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  skillStat: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginRight: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  skillLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  skillValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0066cc',
    marginBottom: 4,
  },
  skillStdDev: {
    fontSize: 10,
    color: '#999',
  },
  rankingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  rankBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0066cc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  rankingInfo: {
    flex: 1,
  },
  rankingName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  rankingScore: {
    fontSize: 12,
    color: '#666',
  },
  scoreBar: {
    height: 6,
    borderRadius: 3,
    marginLeft: 12,
  },
  atRiskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff5f5',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  atRiskItemHigh: {
    backgroundColor: '#ffebee',
    borderLeftColor: '#f44336',
  },
  atRiskContent: {
    flex: 1,
  },
  atRiskName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  atRiskReason: {
    fontSize: 12,
    color: '#666',
  },
  priorityBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  priorityBadgeHigh: {
    backgroundColor: '#f44336',
  },
  priorityBadgeMedium: {
    backgroundColor: '#ffc107',
  },
  priorityText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  distributionItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  distributionLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
    fontWeight: '500',
  },
  distributionBar: {
    height: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 6,
  },
  distributionFill: {
    height: '100%',
    backgroundColor: '#0066cc',
  },
  distributionCount: {
    fontSize: 11,
    color: '#999',
  },
  summaryBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  summaryLabel: {
    fontSize: 13,
    color: '#666',
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0066cc',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 16,
  },
});
