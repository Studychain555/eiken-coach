/**
 * HomeScreenV2 - Redesigned for High School Students
 * Modern, colorful, gamified learning experience (Duolingo-inspired)
 */

import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';
import { useLearningStore } from '@/src/stores/learningStore';
import { useAuthStore } from '@/src/stores/authStore';

interface HomeScreenV2Props {
  onRefresh?: () => void;
}

export default function HomeScreenV2({ onRefresh }: HomeScreenV2Props) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  const listeningProgress = useLearningStore(state => state.listeningProgress);
  const vocabularyProgress = useLearningStore(state => state.vocabularyProgress);
  const writingProgress = useLearningStore(state => state.writingProgress);
  const streakDays = useLearningStore(state => state.streakDays);
  const userId = useAuthStore(state => state.userId);
  const loadFromSupabase = useLearningStore(state => state.loadFromSupabase);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        if (userId) {
          await loadFromSupabase();
        }
      } catch (err) {
        console.error('Failed to load learning data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [userId, loadFromSupabase]);

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
          <Text style={styles.loadingText}>学習データを読み込み中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const completionRate = ((listeningProgress.completedQuestions + vocabularyProgress.masteredWords + writingProgress.submissions) / 100) * 100;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>おはよう！👋</Text>
          <Text style={styles.appName}>EigoMaster</Text>
        </View>
        <TouchableOpacity style={styles.settingsButton}>
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Streak Card - Gamification */}
        <View style={styles.streakCard}>
          <View style={styles.streakContent}>
            <Text style={styles.streakLabel}>🔥 学習ストリーク</Text>
            <Text style={styles.streakNumber}>{streakDays}</Text>
            <Text style={styles.streakDays}>日連続</Text>
          </View>
          <View style={styles.streakBadge}>
            <Text style={styles.streakBadgeIcon}>🏆</Text>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, styles.statCardBlue]}>
            <Text style={styles.statIcon}>⭐</Text>
            <Text style={styles.statValue}>{streakDays * 100}</Text>
            <Text style={styles.statLabel}>XP</Text>
          </View>
          <View style={[styles.statCard, styles.statCardGreen]}>
            <Text style={styles.statIcon}>❤️</Text>
            <Text style={styles.statValue}>3</Text>
            <Text style={styles.statLabel}>ハート</Text>
          </View>
          <View style={[styles.statCard, styles.statCardPurple]}>
            <Text style={styles.statIcon}>🎯</Text>
            <Text style={styles.statValue}>{Math.round(completionRate)}%</Text>
            <Text style={styles.statLabel}>達成度</Text>
          </View>
        </View>

        {/* Recommended Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>今日のおすすめ</Text>

          {/* Main Action Cards */}
          <View style={styles.cardsContainer}>
            {/* Listening Card */}
            <TouchableOpacity
              style={[styles.learningCard, styles.listeningCard]}
              onPress={() => handleNavigation('/(tabs)/listening')}
              activeOpacity={0.8}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardIcon}>🎧</Text>
                <View style={styles.cardBadge}>
                  <Text style={styles.badgeText}>
                    {listeningProgress.completedQuestions}/10
                  </Text>
                </View>
              </View>
              <Text style={styles.cardTitle}>リスニング</Text>
              <Text style={styles.cardSubtitle}>英検準1級対策</Text>
              <View style={styles.cardProgress}>
                <View
                  style={[
                    styles.progressBar,
                    {
                      width: `${(listeningProgress.completedQuestions / 10) * 100}%`,
                      backgroundColor: '#FF6B6B',
                    },
                  ]}
                />
              </View>
              <Text style={styles.cardAction}>始める →</Text>
            </TouchableOpacity>

            {/* Vocabulary Card */}
            <TouchableOpacity
              style={[styles.learningCard, styles.vocabularyCard]}
              onPress={() => handleNavigation('/(tabs)/vocabulary')}
              activeOpacity={0.8}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardIcon}>📚</Text>
                <View style={styles.cardBadge}>
                  <Text style={styles.badgeText}>
                    {vocabularyProgress.masteredWords || 0}/2000
                  </Text>
                </View>
              </View>
              <Text style={styles.cardTitle}>英単語</Text>
              <Text style={styles.cardSubtitle}>毎日50語マスター</Text>
              <View style={styles.cardProgress}>
                <View
                  style={[
                    styles.progressBar,
                    {
                      width: `${(vocabularyProgress.masteredWords / 2000) * 100}%`,
                      backgroundColor: '#4ECDC4',
                    },
                  ]}
                />
              </View>
              <Text style={styles.cardAction}>続ける →</Text>
            </TouchableOpacity>

            {/* Writing Card */}
            <TouchableOpacity
              style={[styles.learningCard, styles.writingCard]}
              onPress={() => handleNavigation('/(tabs)/writing')}
              activeOpacity={0.8}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardIcon}>✏️</Text>
                <View style={styles.cardBadge}>
                  <Text style={styles.badgeText}>
                    {writingProgress.submissions || 0}/20
                  </Text>
                </View>
              </View>
              <Text style={styles.cardTitle}>ライティング</Text>
              <Text style={styles.cardSubtitle}>エッセイ練習</Text>
              <View style={styles.cardProgress}>
                <View
                  style={[
                    styles.progressBar,
                    {
                      width: `${(writingProgress.submissions / 20) * 100}%`,
                      backgroundColor: '#FFE66D',
                    },
                  ]}
                />
              </View>
              <Text style={styles.cardAction}>練習する →</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Motivational Section */}
        <View style={styles.motivationalCard}>
          <Text style={styles.motivationalTitle}>💡 今日のTips</Text>
          <Text style={styles.motivationalText}>
            毎日10分の学習で、英検準1級合格まで最短120日！
          </Text>
          <Text style={styles.motivationalSmall}>
            {streakDays}日連続で学習中。このまま頑張ろう！
          </Text>
        </View>

        {/* Bottom Spacer */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  greeting: {
    fontSize: 14,
    color: '#999',
    marginBottom: 4,
  },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.light.primary,
    letterSpacing: -0.5,
  },
  settingsButton: {
    padding: 8,
  },
  settingsIcon: {
    fontSize: 24,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.light.textSecondary,
  },

  // Streak Card
  streakCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FF6B6B',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#FF6B6B',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  streakContent: {
    flex: 1,
  },
  streakLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
    marginBottom: 8,
  },
  streakNumber: {
    fontSize: 48,
    fontWeight: '900',
    color: '#fff',
    lineHeight: 56,
  },
  streakDays: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
  },
  streakBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  streakBadgeIcon: {
    fontSize: 40,
  },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  statCardBlue: {
    backgroundColor: '#E3F2FD',
  },
  statCardGreen: {
    backgroundColor: '#E8F5E9',
  },
  statCardPurple: {
    backgroundColor: '#F3E5F5',
  },
  statIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    fontWeight: '600',
  },

  // Section
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#222',
    marginBottom: 12,
    letterSpacing: -0.3,
  },

  // Cards Container
  cardsContainer: {
    gap: 12,
  },
  learningCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 4,
    elevation: 3,
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  listeningCard: {
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: '#FFE0E0',
  },
  vocabularyCard: {
    backgroundColor: '#F0FFFE',
    borderWidth: 1,
    borderColor: '#D0F0ED',
  },
  writingCard: {
    backgroundColor: '#FFFEF0',
    borderWidth: 1,
    borderColor: '#FFF9D9',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardIcon: {
    fontSize: 32,
  },
  cardBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#666',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#222',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#999',
    marginBottom: 12,
    fontWeight: '500',
  },
  cardProgress: {
    height: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    borderRadius: 3,
    marginBottom: 12,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  cardAction: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.light.primary,
  },

  // Motivational Card
  motivationalCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#FFE66D',
    elevation: 2,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  motivationalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#222',
    marginBottom: 8,
  },
  motivationalText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    marginBottom: 8,
    fontWeight: '500',
  },
  motivationalSmall: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },

  // Bottom Spacer
  bottomSpacer: {
    height: 40,
  },
});
