/**
 * ModernHome - Simple, Clean Home Screen for High School Students
 * Focus: Reliability + Modern Design (Duolingo-inspired)
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useLearningStore } from '@/src/stores/learningStore';
import { useAuthStore } from '@/src/stores/authStore';

export default function ModernHome() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  const listeningProgress = useLearningStore(state => state.listeningProgress);
  const vocabularyProgress = useLearningStore(state => state.vocabularyProgress);
  const writingProgress = useLearningStore(state => state.writingProgress);
  const streakDays = useLearningStore(state => state.streakDays);
  const userId = useAuthStore(state => state.userId);
  const loadFromSupabase = useLearningStore(state => state.loadFromSupabase);

  useEffect(() => {
    const init = async () => {
      try {
        if (userId) {
          await loadFromSupabase();
        }
        setIsReady(true);
      } catch (err) {
        console.error('Load error:', err);
        setIsReady(true);
      }
    };
    init();
  }, [userId]);

  if (!isReady) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.loadingText}>読み込み中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>EigoMaster</Text>
        <Text style={styles.subGreeting}>英検準1級対策</Text>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Streak Section */}
        <View style={styles.streakSection}>
          <View style={styles.streakCard}>
            <Text style={styles.fireIcon}>🔥</Text>
            <Text style={styles.streakNumber}>{streakDays}</Text>
            <Text style={styles.streakLabel}>日連続学習</Text>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsSection}>
          <View style={styles.statBox}>
            <Text style={styles.statEmoji}>⭐</Text>
            <Text style={styles.statNum}>{streakDays * 100}</Text>
            <Text style={styles.statName}>XP</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statEmoji}>❤️</Text>
            <Text style={styles.statNum}>3</Text>
            <Text style={styles.statName}>ハート</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statEmoji}>🎯</Text>
            <Text style={styles.statNum}>50%</Text>
            <Text style={styles.statName}>達成度</Text>
          </View>
        </View>

        {/* Learning Cards */}
        <View style={styles.cardsSection}>
          <Text style={styles.sectionTitle}>学習を開始</Text>

          {/* Listening */}
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push('/(tabs)/listening')}
            activeOpacity={0.7}
          >
            <View style={styles.cardTop}>
              <Text style={styles.cardIcon}>🎧</Text>
              <View style={styles.cardBadge}>
                <Text style={styles.badgeText}>
                  {listeningProgress.completedQuestions || 0}/10
                </Text>
              </View>
            </View>
            <Text style={styles.cardTitle}>リスニング</Text>
            <Text style={styles.cardDesc}>英検準1級形式</Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.min((listeningProgress.completedQuestions || 0) / 10 * 100, 100)}%`,
                    backgroundColor: '#FF6B6B',
                  },
                ]}
              />
            </View>
            <Text style={styles.cardCta}>始める →</Text>
          </TouchableOpacity>

          {/* Vocabulary */}
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push('/(tabs)/vocabulary')}
            activeOpacity={0.7}
          >
            <View style={styles.cardTop}>
              <Text style={styles.cardIcon}>📚</Text>
              <View style={styles.cardBadge}>
                <Text style={styles.badgeText}>
                  {vocabularyProgress.masteredWords || 0}/2000
                </Text>
              </View>
            </View>
            <Text style={styles.cardTitle}>英単語</Text>
            <Text style={styles.cardDesc}>毎日50語</Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.min((vocabularyProgress.masteredWords || 0) / 2000 * 100, 100)}%`,
                    backgroundColor: '#4ECDC4',
                  },
                ]}
              />
            </View>
            <Text style={styles.cardCta}>続ける →</Text>
          </TouchableOpacity>

          {/* Writing */}
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push('/(tabs)/writing')}
            activeOpacity={0.7}
          >
            <View style={styles.cardTop}>
              <Text style={styles.cardIcon}>✏️</Text>
              <View style={styles.cardBadge}>
                <Text style={styles.badgeText}>
                  {writingProgress.submissions || 0}/20
                </Text>
              </View>
            </View>
            <Text style={styles.cardTitle}>ライティング</Text>
            <Text style={styles.cardDesc}>エッセイ練習</Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.min((writingProgress.submissions || 0) / 20 * 100, 100)}%`,
                    backgroundColor: '#FFE66D',
                  },
                ]}
              />
            </View>
            <Text style={styles.cardCta}>練習する →</Text>
          </TouchableOpacity>
        </View>

        {/* Motivational */}
        <View style={styles.motivationSection}>
          <View style={styles.motivationCard}>
            <Text style={styles.motivationTitle}>💡 毎日の習慣が合格へ</Text>
            <Text style={styles.motivationText}>
              {streakDays}日連続学習中！このペースなら120日で合格できます。
            </Text>
          </View>
        </View>

        <View style={styles.spacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFB',
  },
  scroll: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },

  // Header
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  greeting: {
    fontSize: 28,
    fontWeight: '800',
    color: '#2BBCB3',
    marginBottom: 4,
  },
  subGreeting: {
    fontSize: 14,
    color: '#999',
  },

  // Streak
  streakSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  streakCard: {
    backgroundColor: '#FF6B6B',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#FF6B6B',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  fireIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  streakNumber: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFF',
    lineHeight: 56,
  },
  streakLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
    marginTop: 4,
  },

  // Stats
  statsSection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  statEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  statNum: {
    fontSize: 22,
    fontWeight: '800',
    color: '#222',
  },
  statName: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    fontWeight: '600',
  },

  // Cards Section
  cardsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#222',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardIcon: {
    fontSize: 32,
  },
  cardBadge: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 10,
    paddingVertical: 6,
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
  cardDesc: {
    fontSize: 13,
    color: '#999',
    marginBottom: 12,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E8E8E8',
    borderRadius: 3,
    marginBottom: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  cardCta: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2BBCB3',
  },

  // Motivation
  motivationSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  motivationCard: {
    backgroundColor: '#FFF9E6',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FFE66D',
  },
  motivationTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#222',
    marginBottom: 8,
  },
  motivationText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    fontWeight: '500',
  },

  spacer: {
    height: 40,
  },
});
