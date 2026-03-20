/**
 * Legacy Home Screen (Mobile)
 * Original home screen for mobile devices (< 600px width)
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/src/stores/authStore';
import { useLearningStore } from '@/src/stores/learningStore';
import { Colors, Spacing, BorderRadius, Shadows, Typography } from '@/constants/theme';
import { StreakDisplay, LevelBadge } from '@/components/GamificationElements';
import { EnhancedProgressBar, Milestone } from '@/components/EnhancedProgressBar';

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2;

export default function LegacyHomeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const {
    listeningProgress,
    vocabularyProgress,
    writingProgress,
    streakDays,
  } = useLearningStore();

  const userName = user?.email?.split('@')[0] || 'ユーザー';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Header with Level Badge */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>おはよう、{userName}さん！</Text>
              <Text style={styles.date}>
                {new Date().toLocaleDateString('ja-JP', {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric',
                })}
              </Text>
            </View>
            <LevelBadge level={5} nextLevelProgress={65} size="md" />
          </View>
        </View>

        {/* Streak Display */}
        <View style={styles.section}>
          <StreakDisplay days={streakDays} size="md" />
        </View>

        {/* Daily Goals */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>今日の目標</Text>
          <View style={styles.goalsContainer}>
            <View style={[styles.goalItem, styles.goalItem1]}>
              <Text style={styles.goalEmoji}>🎧</Text>
              <Text style={styles.goalText}>1問</Text>
            </View>
            <View style={[styles.goalItem, styles.goalItem2]}>
              <Text style={styles.goalEmoji}>📚</Text>
              <Text style={styles.goalText}>50語</Text>
            </View>
            <View style={[styles.goalItem, styles.goalItem3]}>
              <Text style={styles.goalEmoji}>✍️</Text>
              <Text style={styles.goalText}>1問</Text>
            </View>
          </View>
        </View>

        {/* Learning Progress */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>学習進捗</Text>

          {/* Listening */}
          <TouchableOpacity
            style={styles.progressCard}
            onPress={() => router.push('/(tabs)/listening')}
            activeOpacity={0.7}
          >
            <View style={[styles.cardIcon, { backgroundColor: '#dbeafe' }]}>
              <Text style={styles.iconText}>🎧</Text>
            </View>
            <View style={styles.progressCardContent}>
              <View style={styles.progressCardHeader}>
                <Text style={styles.progressCardTitle}>リスニング</Text>
                <Text style={styles.progressCardStat}>
                  {listeningProgress.completedQuestions}/{listeningProgress.totalQuestions}
                </Text>
              </View>
              <EnhancedProgressBar
                percentage={(listeningProgress.completedQuestions / listeningProgress.totalQuestions) * 100}
                color={Colors.light.info}
                backgroundColor={Colors.light.border}
                height={6}
                showPercentage={false}
                style={{ marginTop: Spacing.sm }}
              />
              <Text style={styles.progressCardMeta}>
                今日: {listeningProgress.todayStudyMinutes}分
              </Text>
            </View>
          </TouchableOpacity>

          {/* Vocabulary */}
          <TouchableOpacity
            style={styles.progressCard}
            onPress={() => router.push('/(tabs)/vocabulary')}
            activeOpacity={0.7}
          >
            <View style={[styles.cardIcon, { backgroundColor: '#fef3c7' }]}>
              <Text style={styles.iconText}>📚</Text>
            </View>
            <View style={styles.progressCardContent}>
              <View style={styles.progressCardHeader}>
                <Text style={styles.progressCardTitle}>英単語</Text>
                <Text style={styles.progressCardStat}>
                  {vocabularyProgress.masteredWords}修得
                </Text>
              </View>
              <EnhancedProgressBar
                percentage={(vocabularyProgress.masteredWords / 2000) * 100}
                color={Colors.light.warning}
                backgroundColor={Colors.light.border}
                height={6}
                showPercentage={false}
                style={{ marginTop: Spacing.sm }}
              />
              <Text style={styles.progressCardMeta}>
                Stage {vocabularyProgress.currentStage} / 20
              </Text>
            </View>
          </TouchableOpacity>

          {/* Writing */}
          <TouchableOpacity
            style={styles.progressCard}
            onPress={() => router.push('/(tabs)/writing')}
            activeOpacity={0.7}
          >
            <View style={[styles.cardIcon, { backgroundColor: '#fecaca' }]}>
              <Text style={styles.iconText}>✍️</Text>
            </View>
            <View style={styles.progressCardContent}>
              <View style={styles.progressCardHeader}>
                <Text style={styles.progressCardTitle}>ライティング</Text>
                <Text style={styles.progressCardStat}>
                  {writingProgress.submissions}提出
                </Text>
              </View>
              <EnhancedProgressBar
                percentage={Math.round((parseFloat(String(writingProgress.averageScore)) / 16) * 100)}
                color={Colors.light.success}
                backgroundColor={Colors.light.border}
                height={6}
                label="スコア"
                showPercentage={true}
                style={{ marginTop: Spacing.sm }}
              />
              <Text style={styles.progressCardMeta}>
                平均スコア: {writingProgress.averageScore}点
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Weekly Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>週間統計</Text>
          <Milestone
            milestone={10}
            current={7}
            unit="時間"
            icon="⏱️"
            color={Colors.light.primary}
          />
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statEmoji}>📊</Text>
              <Text style={styles.statValue}>12h</Text>
              <Text style={styles.statLabel}>学習</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statEmoji}>✅</Text>
              <Text style={styles.statValue}>48</Text>
              <Text style={styles.statLabel}>問題</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statEmoji}>🎯</Text>
              <Text style={styles.statValue}>92%</Text>
              <Text style={styles.statLabel}>正答率</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
    backgroundColor: Colors.light.surfaceCard,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greeting: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.light.text,
    marginBottom: Spacing.sm,
  },
  date: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    fontWeight: '500',
  },
  section: {
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: Spacing.lg,
  },
  goalsContainer: {
    flexDirection: 'row',
    gap: Spacing.lg,
  },
  goalItem: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.light.surfaceCard,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    borderWidth: 2,
  },
  goalItem1: {
    borderColor: Colors.light.info,
    backgroundColor: Colors.light.primaryLight,
  },
  goalItem2: {
    borderColor: Colors.light.warning,
    backgroundColor: '#fffbeb',
  },
  goalItem3: {
    borderColor: Colors.light.error,
    backgroundColor: '#fee2e2',
  },
  goalEmoji: {
    fontSize: 24,
  },
  goalText: {
    fontSize: 13,
    color: Colors.light.text,
    fontWeight: '600',
    textAlign: 'center',
  },
  progressCard: {
    flexDirection: 'row',
    padding: Spacing.lg,
    backgroundColor: Colors.light.surfaceCard,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
    alignItems: 'flex-start',
    ...Shadows.sm,
  },
  cardIcon: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.lg,
  },
  iconText: {
    fontSize: 28,
  },
  progressCardContent: {
    flex: 1,
  },
  progressCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  progressCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  progressCardStat: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  progressCardMeta: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginTop: Spacing.sm,
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: Spacing.lg,
  },
  statCard: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.light.surfaceCard,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    ...Shadows.xs,
  },
  statEmoji: {
    fontSize: 28,
    marginBottom: Spacing.sm,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.primary,
    marginBottom: Spacing.xs,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    fontWeight: '500',
  },
});
