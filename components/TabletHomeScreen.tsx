/**
 * Tablet-Optimized Home Screen
 * Duolingo-like layout with welcome, status, goals, and learning stats
 * Designed for tablet viewing (768px+) - fits on screen without scrolling
 */

import React, { useMemo, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Dimensions,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/src/stores/authStore';
import { useLearningStore } from '@/src/stores/learningStore';
import { useListeningStore } from '@/src/stores/listeningStore';
import { useVocabularyStore } from '@/src/stores/vocabularyStore';
import { useWritingStore } from '@/src/stores/writingStore';
import { Colors, Spacing, BorderRadius, Typography, NaturalColors, DuolingoColors } from '@/constants/theme';

// Import sub-components
import WelcomeHeader from './TabletComponents/WelcomeHeader';
import StatusBar from './TabletComponents/StatusBar';
import DailyGoalsSection from './TabletComponents/DailyGoalsSection';
import LearningStatsSection from './TabletComponents/LearningStatsSection';
import QuickActionButtons from './TabletComponents/QuickActionButtons';

const { width, height } = Dimensions.get('window');
const isTablet = width >= 600;

interface TabletHomeScreenProps {
  onRefresh?: () => void;
}

export default function TabletHomeScreen({ onRefresh }: TabletHomeScreenProps) {
  const router = useRouter();
  const [refreshing, setRefreshing] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  // Store hooks
  const { user } = useAuthStore();
  const {
    listeningProgress,
    vocabularyProgress,
    writingProgress,
    streakDays,
    totalXP,
    currentLevel,
    hearts,
  } = useLearningStore();

  const listeningStats = useListeningStore((state) => ({
    completed: state.completedQuestions || 0,
    total: state.totalQuestions || 10,
    todayMinutes: state.todayStudyMinutes || 0,
  }));

  const vocabularyStats = useVocabularyStore((state) => ({
    mastered: state.masteredWords || 0,
    total: state.totalWords || 2000,
    currentStage: state.currentStage || 1,
  }));

  const writingStats = useWritingStore((state) => ({
    submissions: state.submissions || 0,
    averageScore: state.averageScore || 0,
    todaySubmissions: state.todaySubmissions || 0,
  }));

  // Calculate overall mastery percentage
  const masteryPercentage = useMemo(() => {
    const totalAttempted = (listeningStats.completed || 0) +
                          (vocabularyStats.mastered || 0) +
                          (writingStats.submissions || 0);
    const totalPossible = (listeningStats.total || 10) +
                         (vocabularyStats.total || 2000) +
                         (writingStats.submissions > 0 ? writingStats.submissions * 5 : 100);

    if (totalPossible === 0) return 0;
    return Math.round((totalAttempted / totalPossible) * 100);
  }, [listeningStats, vocabularyStats, writingStats]);

  // Estimate learning time (simplified: based on remaining items)
  const estimatedHours = useMemo(() => {
    const remainingListening = Math.max(0, listeningStats.total - listeningStats.completed);
    const remainingVocab = Math.max(0, vocabularyStats.total - vocabularyStats.mastered);
    const estimatedMinutes = (remainingListening * 2) + (remainingVocab * 0.5);
    return Math.ceil(estimatedMinutes / 60);
  }, [listeningStats, vocabularyStats]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      if (onRefresh) {
        await onRefresh();
      }
      // Simulate a small delay for better UX
      await new Promise((resolve) => setTimeout(resolve, 500));
    } finally {
      setRefreshing(false);
    }
  }, [onRefresh]);

  const userName = useMemo(() => {
    if (user?.name) return user.name;
    if (user?.email) return user.email.split('@')[0];
    return 'ユーザー';
  }, [user]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={DuolingoColors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={DuolingoColors.primary}
          />
        }
        scrollEnabled={true}
        nestedScrollEnabled={true}
      >
        {/* Welcome Header */}
        <WelcomeHeader
          userName={userName}
          level={currentLevel || 5}
          xp={totalXP || 0}
        />

        {/* Status Bar - Streak, Hearts, XP */}
        <StatusBar
          streak={streakDays || 0}
          hearts={hearts || 3}
          xp={totalXP || 0}
        />

        {/* Daily Goals Section - 3 cards horizontal */}
        <DailyGoalsSection
          listeningGoal={{
            count: 1,
            xpReward: 10,
            completed: listeningStats.completed > 0,
          }}
          vocabularyGoal={{
            count: 50,
            xpReward: 50,
            completed: vocabularyStats.mastered > 0,
          }}
          writingGoal={{
            count: 1,
            xpReward: 100,
            completed: writingStats.submissions > 0,
          }}
        />

        {/* Learning Stats Section */}
        <LearningStatsSection
          masteryPercentage={masteryPercentage}
          stats={{
            listening: {
              name: 'リスニング',
              completed: listeningStats.completed,
              total: listeningStats.total,
              icon: '🎧',
            },
            vocabulary: {
              name: '英単語',
              completed: vocabularyStats.mastered,
              total: vocabularyStats.total,
              icon: '📚',
            },
            writing: {
              name: 'ライティング',
              completed: writingStats.submissions,
              total: Math.max(20, writingStats.submissions * 2),
              icon: '✏️',
            },
          }}
          estimatedHours={estimatedHours}
          todayMinutes={listeningStats.todayMinutes || 0}
        />

        {/* Quick Action Buttons */}
        <QuickActionButtons
          onNavigate={(screen) => {
            router.push(`/(tabs)/${screen}`);
          }}
        />

        {/* Bottom padding */}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
  },
  bottomPadding: {
    height: Spacing.xl,
  },
});
