import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useListeningStore } from '@/src/stores/listeningStore';
import { LISTENING_SAMPLE_DATA } from '@/src/lib/listeningData';
import ListeningQuestionScreen from '@/src/components/ListeningQuestionScreen';
import ListeningResultScreen from '@/src/components/ListeningResultScreen';

type Screen = 'list' | 'question' | 'result';

const DIFFICULTY_LABELS: Record<number, string> = {
  1: '★☆☆☆☆',
  2: '★★☆☆☆',
  3: '★★★☆☆',
  4: '★★★★☆',
  5: '★★★★★',
};

export default function ListeningScreen() {
  const {
    questions,
    setQuestions,
    currentQuestion,
    moveToQuestion,
    resetCurrentQuestion,
    progress,
    getTodayStats,
    completedCount,
    totalCount,
  } = useListeningStore();

  const [screen, setScreen] = useState<Screen>('list');

  useEffect(() => {
    if (questions.length === 0) {
      setQuestions(LISTENING_SAMPLE_DATA);
    }
  }, []);

  const handleStartQuestion = (questionId: string) => {
    const question = questions.find((q) => q.id === questionId);
    if (question) {
      moveToQuestion(question);
      setScreen('question');
    }
  };

  const handleQuestionComplete = () => {
    resetCurrentQuestion();
    setScreen('result');
  };

  const handleBackToList = () => {
    resetCurrentQuestion();
    setScreen('list');
  };

  if (screen === 'list') {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>🎧 リスニング練習</Text>
            <Text style={styles.subtitle}>英検準1級形式</Text>
          </View>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>完了</Text>
              <Text style={styles.statValue}>
                {completedCount}/{totalCount}
              </Text>
            </View>
            {(() => {
              const stats = getTodayStats();
              return (
                <>
                  <View style={styles.statCard}>
                    <Text style={styles.statLabel}>今日</Text>
                    <Text style={styles.statValue}>{stats.attempted}</Text>
                  </View>
                  <View style={styles.statCard}>
                    <Text style={styles.statLabel}>正答率</Text>
                    <Text style={styles.statValue}>{stats.accuracy}%</Text>
                  </View>
                </>
              );
            })()}
          </View>

          {/* Question List */}
          <View style={styles.questionsSection}>
            <Text style={styles.sectionTitle}>問題を選択</Text>
            {questions.length === 0 ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0066cc" />
              </View>
            ) : (
              questions.map((question) => {
                const questionProgress = progress[question.id];
                const isCompleted = questionProgress?.isCompleted || false;
                const isCorrect = questionProgress?.isCorrect;

                return (
                  <TouchableOpacity
                    key={question.id}
                    style={[
                      styles.questionCard,
                      isCompleted && styles.questionCardCompleted,
                    ]}
                    onPress={() => handleStartQuestion(question.id)}
                  >
                    <View style={styles.questionCardHeader}>
                      <Text style={styles.questionTitle}>{question.title}</Text>
                      {isCompleted && (
                        <Text style={styles.resultIcon}>
                          {isCorrect ? '✅' : '❌'}
                        </Text>
                      )}
                    </View>

                    <View style={styles.questionCardFooter}>
                      <Text style={styles.difficulty}>
                        {DIFFICULTY_LABELS[question.difficulty]}
                      </Text>
                      <Text style={styles.status}>
                        {isCompleted ? '完了' : '未完了'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (screen === 'question' && currentQuestion) {
    return (
      <ListeningQuestionScreen
        question={currentQuestion}
        onComplete={handleQuestionComplete}
        onBack={handleBackToList}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ListeningResultScreen onBack={handleBackToList} />
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
    paddingBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#999',
  },
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: 24,
    marginTop: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0066cc',
  },
  questionsSection: {
    marginHorizontal: 24,
    marginTop: 24,
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  loadingContainer: {
    paddingVertical: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  questionCard: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#ddd',
  },
  questionCardCompleted: {
    backgroundColor: '#f0f9ff',
  },
  questionCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  questionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  resultIcon: {
    fontSize: 18,
    marginLeft: 8,
  },
  questionCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  difficulty: {
    fontSize: 12,
    color: '#666',
  },
  status: {
    fontSize: 12,
    color: '#0066cc',
    fontWeight: '500',
  },
});
