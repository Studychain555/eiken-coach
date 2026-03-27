/**
 * ModernListeningView - Modern UI for Listening Practice
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { ModernCard, ModernButton, ModernSection, ModernStatBox } from './ModernUI';

interface ModernListeningViewProps {
  completedCount: number;
  totalCount: number;
  todayStats: {
    attempted: number;
    correct: number;
    accuracy: number;
  };
  onStartQuestion: (id: string) => void;
  questions: any[];
}

export const ModernListeningView: React.FC<ModernListeningViewProps> = ({
  completedCount,
  totalCount,
  todayStats,
  onStartQuestion,
  questions,
}) => {
  const completionRate = (completedCount / totalCount) * 100;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Stats */}
      <View style={styles.statsGrid}>
        <ModernStatBox
          icon="🎧"
          value={todayStats.attempted}
          label="出題数"
          color="#FF6B6B"
        />
        <ModernStatBox
          icon="✅"
          value={todayStats.correct}
          label="正解"
          color="#4ECDC4"
        />
        <ModernStatBox
          icon="📊"
          value={`${todayStats.accuracy}%`}
          label="正答率"
          color="#FFE66D"
        />
      </View>

      {/* Progress Section */}
      <ModernSection title="進捗">
        <ModernCard>
          <View style={styles.progressContent}>
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${completionRate}%` },
                  ]}
                />
              </View>
            </View>
            <View style={styles.progressInfo}>
              <Text style={styles.progressLabel}>
                {completedCount} / {totalCount} 完了
              </Text>
              <Text style={styles.progressPercent}>
                {Math.round(completionRate)}%
              </Text>
            </View>
          </View>
        </ModernCard>
      </ModernSection>

      {/* Questions Section */}
      <ModernSection title="問題">
        {questions.slice(0, 5).map((question, index) => (
          <ModernCard
            key={question.id}
            onPress={() => onStartQuestion(question.id)}
            highlight={!question.completed}
          >
            <View style={styles.questionCard}>
              <View style={styles.questionLeft}>
                <Text style={styles.questionNum}>Q{index + 1}</Text>
                <View>
                  <Text style={styles.questionTitle}>
                    {question.title || 'リスニング問題'}
                  </Text>
                  <Text style={styles.questionDifficulty}>
                    難易度: ★{'★'.repeat((question.difficulty || 1) - 1)}
                  </Text>
                </View>
              </View>
              <View
                style={[
                  styles.questionStatus,
                  question.completed && styles.questionCompleted,
                ]}
              >
                <Text style={styles.questionStatusIcon}>
                  {question.completed ? '✅' : '→'}
                </Text>
              </View>
            </View>
          </ModernCard>
        ))}
        {questions.length > 5 && (
          <Text style={styles.moreText}>他 {questions.length - 5} 問</Text>
        )}
      </ModernSection>

      {/* Action Button */}
      <View style={styles.actionSection}>
        <ModernButton
          label="🎧 リスニング練習を開始"
          onPress={() => onStartQuestion(questions[0]?.id)}
          icon="▶️"
        />
      </View>

      <View style={styles.spacer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFB',
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
  },
  progressContent: {
    gap: 16,
  },
  progressBarContainer: {
    gap: 8,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#E8E8E8',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#2BBCB3',
    borderRadius: 4,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  progressPercent: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2BBCB3',
  },
  questionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  questionLeft: {
    flex: 1,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  questionNum: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2BBCB3',
    minWidth: 40,
  },
  questionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#222',
    marginBottom: 4,
  },
  questionDifficulty: {
    fontSize: 12,
    color: '#999',
  },
  questionStatus: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
  },
  questionCompleted: {
    backgroundColor: '#E8F5E9',
  },
  questionStatusIcon: {
    fontSize: 18,
    fontWeight: '700',
  },
  moreText: {
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 8,
  },
  actionSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  spacer: {
    height: 40,
  },
});
