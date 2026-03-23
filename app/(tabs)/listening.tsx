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
import ShadowingScreen from '@/src/components/ShadowingScreen';
import type { ListeningQuestion } from '@/src/lib/listeningData';
import { Colors, Spacing, BorderRadius, Shadows, Typography, DuolingoColors, NaturalColors } from '@/constants/theme';
import { EnhancedProgressBar } from '@/components/EnhancedProgressBar';
import { ErrorScreen } from '@/src/components/ErrorScreen';
import { EmptyState } from '@/src/components/EmptyState';
import { SkeletonLoader } from '@/src/components/SkeletonLoader';

type Screen = 'list' | 'question' | 'result' | 'shadowing';

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
    isLoading,
    // Error handling
    syncError,
    setSyncError,
    retry,
  } = useListeningStore();

  const [screen, setScreen] = useState<Screen>('list');
  const [shadowingQuestion, setShadowingQuestion] = useState<ListeningQuestion | null>(null);

  useEffect(() => {
    if (questions.length === 0) {
      setQuestions(LISTENING_SAMPLE_DATA);
    }

    // デモモード: ゲーミフィケーション画面用のダミーデータ投入
    const demoUser = localStorage.getItem('eigomaster_demo_user');
    if (demoUser) {
      // ストア内のゲーミフィケーション状態を初期化（デモ用）
      try {
        // (既存の状態は保持し、ゲーミフィケーション値のみ設定)
        // useListeningStore の内部状態が初期化されているので、ここでは何もしない
        console.log('✅ デモモード: ゲーミフィケーション画面を表示');
      } catch (error) {
        console.error('デモモード初期化エラー:', error);
      }
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

  const handleShadowingStart = (question: ListeningQuestion) => {
    setShadowingQuestion(question);
    setScreen('shadowing');
  };

  const handleShadowingComplete = () => {
    setShadowingQuestion(null);
    setScreen('list');
  };

  const handleBackToList = () => {
    resetCurrentQuestion();
    setScreen('list');
  };

  if (screen === 'list') {
    // エラーハンドリング
    if (syncError) {
      return (
        <SafeAreaView style={styles.container}>
          <ErrorScreen
            title="同期に失敗しました"
            description={syncError}
            retryFn={retry}
          />
        </SafeAreaView>
      );
    }

    // ローディング中 - スケルトン表示
    if (questions.length === 0 || isLoading) {
      return (
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>🎧 リスニング練習</Text>
            <Text style={styles.subtitle}>英検準1級形式</Text>
          </View>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
          >
            <View style={styles.section}>
              <SkeletonLoader count={4} type="form" />
            </View>
          </ScrollView>
        </SafeAreaView>
      );
    }

    const stats = getTodayStats();
    const completionRate = (completedCount / totalCount) * 100;

    return (
      <SafeAreaView style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>🎧 リスニング練習</Text>
            <Text style={styles.subtitle}>英検準1級形式</Text>
          </View>

          {/* Completion Progress */}
          <View style={styles.section}>
            <EnhancedProgressBar
              percentage={completionRate}
              label="進捗"
              showPercentage={true}
              color={Colors.light.info}
            />
            <Text style={styles.progressLabel}>
              {completedCount} / {totalCount} 完了
            </Text>
          </View>

          {/* Today's Stats */}
          <View style={styles.section}>
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statEmoji}>🎯</Text>
                <Text style={styles.statValue}>{stats.attempted}</Text>
                <Text style={styles.statLabel}>出題</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statEmoji}>✅</Text>
                <Text style={styles.statValue}>{stats.correct}</Text>
                <Text style={styles.statLabel}>正解</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statEmoji}>📊</Text>
                <Text style={[styles.statValue, { color: Colors.light.success }]}>
                  {stats.accuracy}%
                </Text>
                <Text style={styles.statLabel}>正答率</Text>
              </View>
            </View>
          </View>

          {/* Question List */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>問題を選択</Text>
            {questions.length === 0 ? (
              <View style={styles.loadingContainer}>
                <SkeletonLoader count={3} type="list" />
              </View>
            ) : (
              questions.map((question, index) => {
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
                    activeOpacity={0.7}
                  >
                    <View style={styles.questionCardNumber}>
                      <Text style={styles.numberText}>Q{index + 1}</Text>
                    </View>

                    <View style={styles.questionCardContent}>
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
                        <Text style={[
                          styles.status,
                          isCompleted && styles.statusCompleted
                        ]}>
                          {isCompleted ? '完了' : '未完了'}
                        </Text>
                      </View>
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
        onShadowingStart={handleShadowingStart}
      />
    );
  }

  if (screen === 'shadowing' && shadowingQuestion) {
    return (
      <ShadowingScreen
        questionId={shadowingQuestion.id}
        attemptId={`attempt_${shadowingQuestion.id}_${Date.now()}`}
        script={shadowingQuestion.script}
        audioUrl={shadowingQuestion.audioUrl}
        onComplete={handleShadowingComplete}
        onBack={() => {
          setShadowingQuestion(null);
          setScreen('result');
        }}
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
    backgroundColor: NaturalColors.background,
  },
  header: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.light.text,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    fontWeight: '400',
  },
  section: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  progressLabel: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    fontWeight: '500',
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  statBox: {
    flex: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    backgroundColor: Colors.light.surfaceCard,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    ...Shadows.sm,
  },
  statEmoji: {
    fontSize: 24,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.text,
  },
  loadingContainer: {
    paddingVertical: Spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  questionCard: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.light.surfaceCard,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: Colors.light.border,
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
    ...Shadows.xs,
  },
  questionCardCompleted: {
    backgroundColor: Colors.light.primaryLight,
    borderColor: Colors.light.primary,
  },
  questionCardNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.light.primaryLight,
    borderWidth: 2,
    borderColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  numberText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  questionCardContent: {
    flex: 1,
  },
  questionCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  questionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
    flex: 1,
    lineHeight: 18,
  },
  resultIcon: {
    fontSize: 20,
    marginLeft: Spacing.lg,
  },
  questionCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  difficulty: {
    fontSize: 11,
    color: Colors.light.textSecondary,
    fontWeight: '500',
  },
  status: {
    fontSize: 11,
    color: Colors.light.warning,
    fontWeight: '600',
  },
  statusCompleted: {
    color: Colors.light.success,
  },
});
