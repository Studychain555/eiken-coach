import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useListeningStore } from '@/src/stores/listeningStore';

interface Props {
  onBack: () => void;
}

export default function ListeningResultScreen({ onBack }: Props) {
  const { attempts, getTodayStats, getAccuracy } = useListeningStore();
  const todayStats = getTodayStats();
  const overallAccuracy = getAccuracy();

  return (
    <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>
      {/* Title */}
      <View style={styles.header}>
        <Text style={styles.title}>📊 学習結果</Text>
      </View>

      {/* Today's Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>今日の成績</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{todayStats.attempted}</Text>
            <Text style={styles.statLabel}>出題</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{todayStats.correct}</Text>
            <Text style={styles.statLabel}>正解</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{todayStats.accuracy}%</Text>
            <Text style={styles.statLabel}>正答率</Text>
          </View>
        </View>
      </View>

      {/* Overall Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>全体の正答率</Text>
        <View style={styles.accuracyContainer}>
          <View style={styles.accuracyCircle}>
            <Text style={styles.accuracyValue}>{overallAccuracy}%</Text>
          </View>
          <View style={styles.accuracyInfo}>
            <Text style={styles.accuracyLabel}>
              {attempts.length} 問中{' '}
              {attempts.filter((a) => a.isCorrect).length} 問正解
            </Text>
            <Text style={styles.accuracyMessage}>
              {overallAccuracy >= 80
                ? '🌟 素晴らしい成績です！'
                : overallAccuracy >= 60
                ? '👍 順調に進んでいます'
                : '💪 もう少しです！'}
            </Text>
          </View>
        </View>
      </View>

      {/* Attempts History */}
      {attempts.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>試行履歴</Text>
          {attempts.slice(-5).reverse().map((attempt, index) => (
            <View
              key={index}
              style={[
                styles.attemptCard,
                attempt.isCorrect && styles.attemptCardCorrect,
              ]}
            >
              <View style={styles.attemptIcon}>
                <Text style={styles.attemptEmoji}>
                  {attempt.isCorrect ? '✅' : '❌'}
                </Text>
              </View>
              <View style={styles.attemptInfo}>
                <Text style={styles.attemptQuestion}>
                  問題 {attempt.questionId}
                </Text>
                <Text style={styles.attemptTime}>
                  {new Date(attempt.createdAt).toLocaleTimeString('ja-JP')}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>← 問題一覧に戻る</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
    paddingBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  section: {
    marginHorizontal: 24,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0066cc',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
  },
  accuracyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 20,
    gap: 16,
  },
  accuracyCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e6f4ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  accuracyValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0066cc',
  },
  accuracyInfo: {
    flex: 1,
  },
  accuracyLabel: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    marginBottom: 8,
  },
  accuracyMessage: {
    fontSize: 13,
    color: '#666',
  },
  attemptCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ddd',
  },
  attemptCardCorrect: {
    backgroundColor: '#f0f9ff',
    borderLeftColor: '#28a745',
  },
  attemptIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  attemptEmoji: {
    fontSize: 20,
  },
  attemptInfo: {
    flex: 1,
  },
  attemptQuestion: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  attemptTime: {
    fontSize: 12,
    color: '#999',
  },
  buttonContainer: {
    marginHorizontal: 24,
    marginTop: 32,
    marginBottom: 40,
    gap: 12,
  },
  backButton: {
    paddingVertical: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
});
