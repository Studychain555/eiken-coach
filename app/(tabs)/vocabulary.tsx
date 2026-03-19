import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useVocabularyStore } from '@/src/stores/vocabularyStore';
import { VOCABULARY_SAMPLE_DATA } from '@/src/lib/vocabularyData';
import { Colors, Spacing, BorderRadius, Shadows, Typography, DuolingoColors } from '@/constants/theme';
import { EnhancedProgressBar, StepProgress, Milestone } from '@/components/EnhancedProgressBar';
import { OptimizedButton } from '@/components/OptimizedButton';
import { XPRewardSystem } from '@/src/components/XPRewardSystem';
import { DailyGoal } from '@/src/components/DailyGoal';
import { StreakBanner } from '@/src/components/StreakBanner';
import { ComboCounter } from '@/src/components/ComboCounter';

const { width } = Dimensions.get('window');

type Screen = 'stage-select' | 'test' | 'result';

export default function VocabularyScreen() {
  const router = useRouter();
  const {
    words,
    setWords,
    currentStage,
    setCurrentStage,
    masteredCount,
    getTodayStats,
    // Gamification fields
    hearts,
    maxHearts,
    currentLevel,
    totalXP,
    xpForNextLevel,
    streakDays,
    dailyGoal,
    comboCount,
  } = useVocabularyStore();

  const [screen, setScreen] = useState<Screen>('stage-select');

  useEffect(() => {
    // 初期化：単語データをロード
    if (words.length === 0) {
      setWords(VOCABULARY_SAMPLE_DATA);
    }
  }, []);

  const stagesCount = 20;
  const wordsPerStage = 100;

  const handleStartStage = (stage: number) => {
    setCurrentStage(stage);
    setScreen('test');
  };

  const handleBackToStageSelect = () => {
    setScreen('stage-select');
  };

  if (screen === 'stage-select') {
    const stats = getTodayStats();

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
            <Text style={styles.title}>📚 英単語マスター</Text>
            <Text style={styles.subtitle}>英検準1級 頻出単語</Text>
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
              <StreakBanner streakDays={streakDays} xpBonus={80} />
            </View>
          )}

          {/* Combo Counter */}
          {comboCount >= 2 && (
            <View style={styles.section}>
              <ComboCounter count={comboCount} visible={true} />
            </View>
          )}

          {/* Overall Progress */}
          <View style={styles.section}>
            <Milestone
              milestone={2000}
              current={masteredCount}
              unit="単語"
              icon="📚"
              color={Colors.light.primary}
            />
          </View>

          {/* Today's Stats */}
          <View style={styles.section}>
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statBoxEmoji}>🎯</Text>
                <Text style={styles.statBoxValue}>{stats.attempted}</Text>
                <Text style={styles.statBoxLabel}>出題</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statBoxEmoji}>✅</Text>
                <Text style={styles.statBoxValue}>{stats.correct}</Text>
                <Text style={styles.statBoxLabel}>正解</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statBoxEmoji}>📊</Text>
                <Text style={[styles.statBoxValue, { color: Colors.light.success }]}>
                  {stats.accuracy}%
                </Text>
                <Text style={styles.statBoxLabel}>正答率</Text>
              </View>
            </View>
          </View>

          {/* Difficulty Guide */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>難易度ガイド</Text>
            <View style={styles.difficultyGuide}>
              <View style={styles.difficultyItem}>
                <Text style={styles.difficultyEmoji}>⭐</Text>
                <Text style={styles.difficultyLabel}>初級</Text>
              </View>
              <View style={styles.difficultyItem}>
                <Text style={styles.difficultyEmoji}>⭐⭐⭐</Text>
                <Text style={styles.difficultyLabel}>中級</Text>
              </View>
              <View style={styles.difficultyItem}>
                <Text style={styles.difficultyEmoji}>⭐⭐⭐⭐⭐</Text>
                <Text style={styles.difficultyLabel}>上級</Text>
              </View>
            </View>
          </View>

          {/* Stages */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ステージを選択</Text>
            <View style={styles.stageGrid}>
              {Array.from({ length: stagesCount }, (_, i) => i + 1).map(
                (stage) => {
                  const isLocked = stage > 3;
                  const isCompleted = stage <= 1;

                  return (
                    <TouchableOpacity
                      key={stage}
                      style={[
                        styles.stageButton,
                        isLocked && styles.stageButtonDisabled,
                        isCompleted && styles.stageButtonCompleted,
                      ]}
                      onPress={() => handleStartStage(stage)}
                      disabled={isLocked}
                      activeOpacity={0.7}
                    >
                      {isCompleted && (
                        <Text style={styles.stageBadge}>✓</Text>
                      )}
                      <Text style={styles.stageButtonNumber}>{stage}</Text>
                      {isLocked && (
                        <Text style={styles.stageLock}>🔒</Text>
                      )}
                    </TouchableOpacity>
                  );
                }
              )}
            </View>
          </View>

          {/* Tips Box */}
          <View style={styles.section}>
            <View style={styles.tipsBox}>
              <Text style={styles.tipsEmoji}>💡</Text>
              <Text style={styles.tipsText}>
                1ステージ = 100語。同じ単語を3回連続正解で「修得」になります。
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (screen === 'test') {
    return (
      <VocabularyTestScreen
        stage={currentStage}
        onBack={handleBackToStageSelect}
        onTestComplete={() => setScreen('result')}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <VocabularyResultScreen onBack={handleBackToStageSelect} />
    </SafeAreaView>
  );
}

// テスト画面コンポーネント
function VocabularyTestScreen({
  stage,
  onBack,
  onTestComplete,
}: {
  stage: number;
  onBack: () => void;
  onTestComplete: () => void;
}) {
  const { words, currentWord, currentOptions, selectAnswer, moveToNextWord } =
    useVocabularyStore();

  const [answered, setAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);

  useEffect(() => {
    // ステージの単語を取得
    const stageWords = words.filter((w) => w.stage === stage);
    if (stageWords.length > 0 && !currentWord) {
      const firstWord = stageWords[0];
      const wrongAnswers = ['意味1', '意味2', '意味3'];
      const options = [
        { word: firstWord.meaning, isCorrect: true },
        ...wrongAnswers.map((w) => ({ word: w, isCorrect: false })),
      ].sort(() => Math.random() - 0.5);
      moveToNextWord(firstWord, options);
    }
  }, [stage, words, currentWord]);

  const handleSelectAnswer = (answer: string) => {
    setSelectedAnswer(answer);
    setAnswered(true);
    selectAnswer(answer);
  };

  const handleNext = () => {
    const stageWords = words.filter((w) => w.stage === stage);
    const nextIndex = questionIndex + 1;

    if (nextIndex < stageWords.length) {
      setQuestionIndex(nextIndex);
      const nextWord = stageWords[nextIndex];
      const wrongAnswers = ['意味1', '意味2', '意味3'];
      const options = [
        { word: nextWord.meaning, isCorrect: true },
        ...wrongAnswers.map((w) => ({ word: w, isCorrect: false })),
      ].sort(() => Math.random() - 0.5);
      moveToNextWord(nextWord, options);
      setAnswered(false);
      setSelectedAnswer(null);
    } else {
      onTestComplete();
    }
  };

  if (!currentWord) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>読み込み中...</Text>
      </View>
    );
  }

  const stageWords = words.filter((w) => w.stage === stage);
  const progress = ((questionIndex + 1) / stageWords.length) * 100;
  const isCorrect =
    selectedAnswer &&
    currentOptions.find((opt) => opt.word === selectedAnswer)?.isCorrect;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.testHeader}>
          <TouchableOpacity onPress={onBack}>
            <Text style={styles.backButton}>← 戻る</Text>
          </TouchableOpacity>
          <Text style={styles.stageTitle}>Stage {stage}</Text>
          <Text style={styles.progressText}>
            {questionIndex + 1} / {stageWords.length}
          </Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBar}>
            <View
              style={[styles.progressFill, { width: `${progress}%` }]}
            />
          </View>
        </View>

        {/* Question */}
        <View style={styles.questionContainer}>
          <Text style={styles.questionLabel}>英単語の意味は？</Text>
          <Text style={styles.word}>{currentWord.word}</Text>
          <Text style={styles.wordReading}>{currentWord.reading}</Text>
        </View>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {currentOptions.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionButton,
                selectedAnswer === option.word && styles.optionButtonSelected,
                answered &&
                  selectedAnswer === option.word &&
                  (option.isCorrect
                    ? styles.optionButtonCorrect
                    : styles.optionButtonWrong),
              ]}
              onPress={() => handleSelectAnswer(option.word)}
              disabled={answered}
            >
              <Text
                style={[
                  styles.optionText,
                  selectedAnswer === option.word && styles.optionTextSelected,
                ]}
              >
                {option.word}
              </Text>
              {answered && selectedAnswer === option.word && (
                <Text style={styles.resultEmoji}>
                  {option.isCorrect ? '✅' : '❌'}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Example & Feedback */}
        {answered && (
          <View style={styles.feedbackContainer}>
            <Text style={styles.feedbackLabel}>例文</Text>
            <Text style={styles.exampleSentence}>
              {currentWord.exampleSentence}
            </Text>
            <Text style={styles.exampleTranslation}>
              {currentWord.exampleTranslation}
            </Text>
          </View>
        )}

        {/* Next Button */}
        {answered && (
          <TouchableOpacity
            style={styles.nextButton}
            onPress={handleNext}
          >
            <Text style={styles.nextButtonText}>
              {questionIndex + 1 === stageWords.length ? '完了' : '次へ'}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// 結果画面コンポーネント
function VocabularyResultScreen({ onBack }: { onBack: () => void }) {
  const { getTodayStats } = useVocabularyStore();
  const stats = getTodayStats();

  return (
    <View style={styles.resultContainer}>
      <Text style={styles.resultTitle}>🎉 テスト完了！</Text>

      <View style={styles.resultStats}>
        <View style={styles.resultStatItem}>
          <Text style={styles.resultStatValue}>{stats.attempted}</Text>
          <Text style={styles.resultStatLabel}>出題</Text>
        </View>
        <View style={styles.resultStatItem}>
          <Text style={styles.resultStatValue}>{stats.correct}</Text>
          <Text style={styles.resultStatLabel}>正解</Text>
        </View>
        <View style={styles.resultStatItem}>
          <Text style={styles.resultStatValue}>{stats.accuracy}%</Text>
          <Text style={styles.resultStatLabel}>正答率</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.resultButton} onPress={onBack}>
        <Text style={styles.resultButtonText}>別のステージに進む</Text>
      </TouchableOpacity>
    </View>
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
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: Spacing.lg,
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
  statBoxEmoji: {
    fontSize: 24,
    marginBottom: Spacing.sm,
  },
  statBoxValue: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.primary,
    marginBottom: Spacing.xs,
  },
  statBoxLabel: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    fontWeight: '500',
  },
  difficultyGuide: {
    flexDirection: 'row',
    gap: Spacing.lg,
  },
  difficultyItem: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.light.surfaceCard,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    ...Shadows.xs,
  },
  difficultyEmoji: {
    fontSize: 18,
    marginBottom: Spacing.sm,
  },
  difficultyLabel: {
    fontSize: 12,
    color: Colors.light.text,
    fontWeight: '600',
    textAlign: 'center',
  },
  stageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.lg,
  },
  stageButton: {
    width: (width - 72) / 4,
    aspectRatio: 1,
    backgroundColor: Colors.light.primaryLight,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.light.primary,
    ...Shadows.xs,
  },
  stageButtonDisabled: {
    backgroundColor: Colors.light.backgroundAlt,
    borderColor: Colors.light.border,
    opacity: 0.6,
  },
  stageButtonCompleted: {
    backgroundColor: Colors.light.success,
    borderColor: Colors.light.success,
  },
  stageBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: Colors.light.success,
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    width: 24,
    height: 24,
    borderRadius: 12,
    textAlign: 'center',
    lineHeight: 24,
  },
  stageButtonNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  stageLock: {
    fontSize: 14,
    marginTop: Spacing.sm,
  },
  tipsBox: {
    flexDirection: 'row',
    padding: Spacing.lg,
    backgroundColor: Colors.light.primaryLight,
    borderLeftWidth: 4,
    borderLeftColor: Colors.light.warning,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xl,
  },
  tipsEmoji: {
    fontSize: 24,
    marginRight: Spacing.lg,
  },
  tipsText: {
    flex: 1,
    fontSize: 13,
    color: Colors.light.text,
    lineHeight: 20,
    fontWeight: '500',
  },

  // Test Screen
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    fontWeight: '500',
  },
  testHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.light.surfaceCard,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  backButton: {
    fontSize: 14,
    color: Colors.light.primary,
    fontWeight: '600',
  },
  stageTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
  },
  progressText: {
    fontSize: 13,
    color: Colors.light.textSecondary,
  },
  progressBarContainer: {
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
    marginTop: Spacing.lg,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.light.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: 8,
    backgroundColor: Colors.light.success,
    borderRadius: 4,
  },
  questionContainer: {
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
    backgroundColor: Colors.light.surfaceCard,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    ...Shadows.sm,
  },
  questionLabel: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: Spacing.lg,
    fontWeight: '500',
  },
  word: {
    fontSize: 36,
    fontWeight: '800',
    color: Colors.light.primary,
    marginBottom: Spacing.sm,
  },
  wordReading: {
    fontSize: 15,
    color: Colors.light.text,
    fontWeight: '500',
  },
  optionsContainer: {
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
    gap: Spacing.lg,
  },
  optionButton: {
    minHeight: 56,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.light.surfaceCard,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: Colors.light.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...Shadows.xs,
  },
  optionButtonSelected: {
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.primaryLight,
  },
  optionButtonCorrect: {
    backgroundColor: '#dcfce7',
    borderColor: Colors.light.success,
  },
  optionButtonWrong: {
    backgroundColor: '#fee2e2',
    borderColor: Colors.light.error,
  },
  optionText: {
    fontSize: 15,
    color: Colors.light.text,
    fontWeight: '500',
  },
  optionTextSelected: {
    color: Colors.light.primary,
    fontWeight: '600',
  },
  resultEmoji: {
    fontSize: 20,
  },
  feedbackContainer: {
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.light.primaryLight,
    borderLeftWidth: 4,
    borderLeftColor: Colors.light.warning,
    borderRadius: BorderRadius.lg,
  },
  feedbackLabel: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginBottom: Spacing.md,
    fontWeight: '600',
  },
  exampleSentence: {
    fontSize: 15,
    color: Colors.light.text,
    fontWeight: '500',
    lineHeight: 22,
    marginBottom: Spacing.md,
  },
  exampleTranslation: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    lineHeight: 20,
  },
  nextButton: {
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
    minHeight: 48,
    backgroundColor: Colors.light.primary,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.md,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },

  // Result Screen
  resultContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    backgroundColor: Colors.light.background,
  },
  resultTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: Colors.light.text,
    marginBottom: Spacing.xl,
    textAlign: 'center',
  },
  resultStats: {
    flexDirection: 'row',
    gap: Spacing.lg,
    marginBottom: Spacing.xl,
    width: '100%',
  },
  resultStatItem: {
    flex: 1,
    paddingVertical: Spacing.xl,
    backgroundColor: Colors.light.surfaceCard,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    ...Shadows.sm,
  },
  resultStatValue: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.light.primary,
    marginBottom: Spacing.sm,
  },
  resultStatLabel: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    fontWeight: '600',
  },
  resultButton: {
    width: '100%',
    minHeight: 48,
    backgroundColor: Colors.light.primary,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.md,
  },
  resultButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});
