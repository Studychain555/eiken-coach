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
import { Colors, Spacing, BorderRadius, Shadows, Typography, DuolingoColors } from '@/constants/theme';
import { EnhancedProgressBar } from '@/components/EnhancedProgressBar';
import { XPRewardSystem } from '@/src/components/XPRewardSystem';
import { DailyGoal } from '@/src/components/DailyGoal';
import { StreakBanner } from '@/src/components/StreakBanner';
import { ComboCounter } from '@/src/components/ComboCounter';

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
    // Gamification fields
    hearts,
    maxHearts,
    currentLevel,
    totalXP,
    xpForNextLevel,
    streakDays,
    dailyGoal,
    comboCount,
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
    const stats = getTodayStats();
    const completionRate = (completedCount / totalCount) * 100;

    return (
      <SafeAreaView style={styles.container}>
        {/* XP Reward System Header */}
        <XPRewardSystem
          hearts={hearts}
          maxHearts={maxHearts}
          currentLevel={currentLevel}
          currentXP={totalXP}
          xpForNextLevel={xpForNextLevel}
          streakDays={streakDays}
        />

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>🎧 リスニング練習</Text>
            <Text style={styles.subtitle}>英検準1級形式</Text>
          </View>

          {/* Daily Goal Banner */}
          <View style={styles.section}>
            <DailyGoal
              target={dailyGoal.target}
              completed={dailyGoal.completed}
              xpReward={50}
            />
          </View>

          {/* Streak Banner */}
          {streakDays > 0 && (
            <View style={styles.section}>
              <StreakBanner streakDays={streakDays} xpBonus={100} />
            </View>
          )}

          {/* Combo Counter */}
          {comboCount >= 2 && (
            <View style={styles.section}>
              <ComboCounter count={comboCount} visible={true} />
            </View>
          )}

          {/* Completion Progress */}
          <View style={styles.section}>
            <EnhancedProgressBar
              percentage={completionRate}
              label="進捗"
              showPercentage={true}
              color={Colors.light.info}
              style={{ marginBottom: Spacing.xl }}
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
                <ActivityIndicator size="large" color={Colors.light.primary} />
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
    backgroundColor: Colors.light.background,
  },
  header: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.light.text,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    fontWeight: '500',
  },
  section: {
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  progressLabel: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    fontWeight: '500',
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.lg,
  },
  statBox: {
    flex: 1,
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.light.surfaceCard,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    ...Shadows.sm,
  },
  statEmoji: {
    fontSize: 24,
    marginBottom: Spacing.sm,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.primary,
    marginBottom: Spacing.xs,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: Spacing.lg,
  },
  loadingContainer: {
    paddingVertical: Spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  questionCard: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.light.surfaceCard,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: Colors.light.border,
    alignItems: 'flex-start',
    ...Shadows.xs,
  },
  questionCardCompleted: {
    backgroundColor: Colors.light.primaryLight,
    borderLeftColor: Colors.light.success,
  },
  questionCardNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.lg,
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
    marginBottom: Spacing.md,
  },
  questionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.light.text,
    flex: 1,
  },
  resultIcon: {
    fontSize: 20,
    marginLeft: Spacing.lg,
  },
  questionCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.lg,
  },
  difficulty: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    fontWeight: '500',
  },
  status: {
    fontSize: 12,
    color: Colors.light.warning,
    fontWeight: '600',
  },
  statusCompleted: {
    color: Colors.light.success,
  },
});
