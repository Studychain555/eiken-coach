/**
 * Parent Dashboard for EigoMaster
 * Shows child's learning progress and statistics
 * Supports multiple children and goal setting
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LineChart, ProgressChart } from 'react-native-chart-kit';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ToddlerTheme } from '@/src/constants/toddler-theme';

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: ToddlerTheme.colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: ToddlerTheme.colors.background,
  },
  headerGradient: {
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  header: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  childSelector: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 12,
  },
  childButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: ToddlerTheme.colors.border,
  },
  childButtonActive: {
    backgroundColor: ToddlerTheme.colors.primary,
    borderColor: ToddlerTheme.colors.primary,
  },
  childButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: ToddlerTheme.colors.textPrimary,
  },
  childButtonTextActive: {
    color: '#FFF',
  },
  sectionCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...ToddlerTheme.shadows.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: ToddlerTheme.colors.textPrimary,
    marginBottom: 12,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: ToddlerTheme.colors.divider,
  },
  statRowLast: {
    borderBottomWidth: 0,
  },
  statLabel: {
    fontSize: 14,
    color: ToddlerTheme.colors.textSecondary,
    fontWeight: '600',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: ToddlerTheme.colors.primary,
  },
  goalCard: {
    backgroundColor: ToddlerTheme.colors.primaryLight,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: ToddlerTheme.colors.primary,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: ToddlerTheme.colors.textPrimary,
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 158, 100, 0.3)',
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: ToddlerTheme.colors.primary,
  },
  goalText: {
    fontSize: 12,
    color: ToddlerTheme.colors.textSecondary,
  },
  achievementContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  achievementBadge: {
    alignItems: 'center',
    padding: 12,
    backgroundColor: ToddlerTheme.colors.secondaryLight,
    borderRadius: 8,
    minWidth: 80,
  },
  achievementEmoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  achievementLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: ToddlerTheme.colors.textSecondary,
    textAlign: 'center',
  },
  chartContainer: {
    alignItems: 'center',
    marginVertical: 12,
  },
  recommendationBox: {
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#FF6F00',
    marginBottom: 16,
  },
  recommendationText: {
    fontSize: 13,
    color: '#BF360C',
    lineHeight: 18,
  },
  reportButton: {
    backgroundColor: ToddlerTheme.colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  reportButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF',
  },
});

interface ChildProgress {
  childId: string;
  childName: string;
  totalWordsLearned: number;
  totalWordsReviewed: number;
  accuracyRate: number;
  streak: number;
  lastActive: Date;
  dailyGoal: number;
  weeklyProgress: number[];
  achievements: string[];
}

interface StudyStats {
  date: string;
  accuracy: number;
  wordCount: number;
}

const mockChildProgress: ChildProgress[] = [
  {
    childId: '1',
    childName: 'Taro',
    totalWordsLearned: 150,
    totalWordsReviewed: 450,
    accuracyRate: 82,
    streak: 12,
    lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    dailyGoal: 20,
    weeklyProgress: [12, 18, 15, 22, 20, 19, 16],
    achievements: ['first_word', 'week_streak', 'accuracy_80', 'hundred_words'],
  },
  {
    childId: '2',
    childName: 'Hanako',
    totalWordsLearned: 230,
    totalWordsReviewed: 680,
    accuracyRate: 88,
    streak: 25,
    lastActive: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
    dailyGoal: 25,
    weeklyProgress: [20, 25, 23, 26, 25, 24, 22],
    achievements: ['first_word', 'week_streak', 'accuracy_80', 'hundred_words', 'two_hundred_words', 'thirty_day_streak'],
  },
];

export default function ParentDashboardScreen() {
  const [selectedChild, setSelectedChild] = useState<string>('1');
  const [childData, setChildData] = useState<ChildProgress | null>(null);

  useEffect(() => {
    const child = mockChildProgress.find(c => c.childId === selectedChild);
    setChildData(child || null);
  }, [selectedChild]);

  if (!childData) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient
          colors={[ToddlerTheme.colors.primary, ToddlerTheme.colors.primaryDark]}
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
        >
          <Text style={{ fontSize: 16, color: '#FFF' }}>Loading...</Text>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  const weeklyData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        data: childData.weeklyProgress,
        color: () => ToddlerTheme.colors.primary,
        strokeWidth: 2,
      },
    ],
  };

  const progressData = {
    labels: ['正答率', 'レビュー完了', 'ストリーク'],
    data: [
      childData.accuracyRate / 100,
      Math.min(childData.totalWordsReviewed / 1000, 1),
      Math.min(childData.streak / 30, 1),
    ],
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={[ToddlerTheme.colors.primary, ToddlerTheme.colors.primaryDark]}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {childData.childName}さんの学習
          </Text>
          <Text style={styles.headerSubtitle}>
            学習進捗ダッシュボード
          </Text>
        </View>

        {/* Child selector */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.childSelector}>
          {mockChildProgress.map(child => (
            <TouchableOpacity
              key={child.childId}
              style={[
                styles.childButton,
                selectedChild === child.childId && styles.childButtonActive,
              ]}
              onPress={() => setSelectedChild(child.childId)}
            >
              <Text
                style={[
                  styles.childButtonText,
                  selectedChild === child.childId && styles.childButtonTextActive,
                ]}
              >
                {child.childName}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Overview stats */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>📊 学習統計</Text>

          <View style={[styles.statRow]}>
            <Text style={styles.statLabel}>学習した単語数</Text>
            <Text style={styles.statValue}>{childData.totalWordsLearned}</Text>
          </View>

          <View style={[styles.statRow]}>
            <Text style={styles.statLabel}>レビュー数</Text>
            <Text style={styles.statValue}>{childData.totalWordsReviewed}</Text>
          </View>

          <View style={[styles.statRow]}>
            <Text style={styles.statLabel}>正答率</Text>
            <Text style={styles.statValue}>{childData.accuracyRate}%</Text>
          </View>

          <View style={[styles.statRow, styles.statRowLast]}>
            <Text style={styles.statLabel}>学習ストリーク</Text>
            <Text style={styles.statValue}>{childData.streak}日</Text>
          </View>
        </View>

        {/* Daily goal */}
        <View style={styles.goalCard}>
          <Text style={styles.goalTitle}>📅 本日の目標</Text>
          <Text style={styles.goalText}>
            1日{childData.dailyGoal}語を学習しましょう
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${(childData.totalWordsReviewed % childData.dailyGoal) / childData.dailyGoal * 100}%` },
              ]}
            />
          </View>
          <Text style={styles.goalText}>
            本日: {childData.totalWordsReviewed % childData.dailyGoal} / {childData.dailyGoal}
          </Text>
        </View>

        {/* Weekly progress chart */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>📈 週間進捗</Text>
          <View style={styles.chartContainer}>
            <LineChart
              data={weeklyData}
              width={width - 64}
              height={220}
              chartConfig={{
                backgroundColor: 'transparent',
                backgroundGradientFrom: 'transparent',
                backgroundGradientTo: 'transparent',
                color: () => ToddlerTheme.colors.primary,
                labelColor: () => ToddlerTheme.colors.textSecondary,
                style: { borderRadius: 8 },
              }}
              bezier
            />
          </View>
        </View>

        {/* Achievements */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>🏆 達成バッジ</Text>
          <View style={styles.achievementContainer}>
            {childData.achievements.length > 0 ? (
              childData.achievements.map((achievement, idx) => (
                <View key={idx} style={styles.achievementBadge}>
                  <Text style={styles.achievementEmoji}>🎉</Text>
                  <Text style={styles.achievementLabel}>
                    {achievement.replace(/_/g, ' ')}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.goalText}>バッジをアンロック中...</Text>
            )}
          </View>
        </View>

        {/* Recommendations */}
        <View style={styles.recommendationBox}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: '#BF360C', marginBottom: 6 }}>
            💡 おすすめ
          </Text>
          <Text style={styles.recommendationText}>
            {childData.accuracyRate > 85
              ? `${childData.childName}さんは非常に良好な進度です。より難しいレベルに挑戦してみてください。`
              : childData.streak > 10
              ? `${childData.childName}さんは継続的に頑張っています。この調子です！`
              : `${childData.childName}さんのために毎日少しずつ練習することをお勧めします。`}
          </Text>
        </View>

        {/* Report button */}
        <TouchableOpacity style={styles.reportButton}>
          <Text style={styles.reportButtonText}>
            詳細レポートを表示
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
