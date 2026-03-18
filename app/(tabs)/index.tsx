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

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2;

export default function HomeScreen() {
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
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>こんにちは、{userName}さん！👋</Text>
          <Text style={styles.date}>{new Date().toLocaleDateString('ja-JP')}</Text>
        </View>

        {/* Streak */}
        <View style={styles.streakContainer}>
          <Text style={styles.streakIcon}>🔥</Text>
          <View>
            <Text style={styles.streakLabel}>連続学習</Text>
            <Text style={styles.streakValue}>{streakDays}日</Text>
          </View>
        </View>

        {/* Daily Goals */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>今日の目標</Text>
          <View style={styles.goalsContainer}>
            <View style={styles.goalItem}>
              <Text style={styles.goalEmoji}>🎧</Text>
              <Text style={styles.goalText}>リスニング 1問</Text>
            </View>
            <View style={styles.goalItem}>
              <Text style={styles.goalEmoji}>📚</Text>
              <Text style={styles.goalText}>単語 50語</Text>
            </View>
            <View style={styles.goalItem}>
              <Text style={styles.goalEmoji}>✍️</Text>
              <Text style={styles.goalText}>ライティング 1問</Text>
            </View>
          </View>
        </View>

        {/* Learning Cards */}
        <View style={styles.cardsSection}>
          <Text style={styles.sectionTitle}>学習進捗</Text>

          {/* Listening Card */}
          <TouchableOpacity
            style={[styles.card, { width: cardWidth }]}
            onPress={() => router.push('/(tabs)/listening')}
          >
            <Text style={styles.cardIcon}>🎧</Text>
            <Text style={styles.cardTitle}>リスニング</Text>
            <View style={styles.progressInfo}>
              <Text style={styles.progressNumber}>
                {listeningProgress.completedQuestions}/{listeningProgress.totalQuestions}
              </Text>
              <Text style={styles.progressLabel}>問題</Text>
            </View>
            <Text style={styles.studyTime}>{listeningProgress.todayStudyMinutes}分</Text>
          </TouchableOpacity>

          {/* Vocabulary Card */}
          <TouchableOpacity
            style={[styles.card, { width: cardWidth }]}
            onPress={() => router.push('/(tabs)/vocabulary')}
          >
            <Text style={styles.cardIcon}>📚</Text>
            <Text style={styles.cardTitle}>英単語</Text>
            <View style={styles.progressInfo}>
              <Text style={styles.progressNumber}>
                {vocabularyProgress.masteredWords}
              </Text>
              <Text style={styles.progressLabel}>修得</Text>
            </View>
            <Text style={styles.stageInfo}>Stage {vocabularyProgress.currentStage}</Text>
          </TouchableOpacity>

          {/* Writing Card */}
          <TouchableOpacity
            style={[styles.card, { width: cardWidth }]}
            onPress={() => router.push('/(tabs)/writing')}
          >
            <Text style={styles.cardIcon}>✍️</Text>
            <Text style={styles.cardTitle}>ライティング</Text>
            <View style={styles.progressInfo}>
              <Text style={styles.progressNumber}>{writingProgress.submissions}</Text>
              <Text style={styles.progressLabel}>提出</Text>
            </View>
            <Text style={styles.avgScore}>平均 {writingProgress.averageScore}</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>週間統計</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>12h</Text>
              <Text style={styles.statLabel}>学習時間</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>48</Text>
              <Text style={styles.statLabel}>問題数</Text>
            </View>
            <View style={styles.statItem}>
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
    backgroundColor: '#f5f9ff',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: '#999',
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 24,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff8f0',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#ff6b35',
  },
  streakIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  streakLabel: {
    fontSize: 12,
    color: '#999',
  },
  streakValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ff6b35',
  },
  section: {
    marginHorizontal: 24,
    marginTop: 24,
  },
  cardsSection: {
    marginHorizontal: 24,
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  goalsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  goalItem: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    alignItems: 'center',
    gap: 4,
  },
  goalEmoji: {
    fontSize: 20,
  },
  goalText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  card: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cardIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  progressInfo: {
    marginBottom: 8,
  },
  progressNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0066cc',
  },
  progressLabel: {
    fontSize: 12,
    color: '#999',
  },
  studyTime: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  stageInfo: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  avgScore: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0066cc',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
  },
});
