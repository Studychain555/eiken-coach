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
import { Colors, Spacing, BorderRadius, Shadows, Typography, DuolingoColors, NaturalColors } from '@/constants/theme';
import { EnhancedProgressBar, StepProgress, Milestone } from '@/components/EnhancedProgressBar';
import { OptimizedButton } from '@/components/OptimizedButton';
import { CelebrationAnimation } from '@/src/components/CelebrationAnimation';
import { ErrorScreen } from '@/src/components/ErrorScreen';
import { EmptyState } from '@/src/components/EmptyState';
import { EIKENLevelSelector } from '@/src/components/EIKENLevelSelector';
import { useEIKENVocabStore } from '@/src/stores/eikenVocabularyStore';
import { EIKENLevel, EIKENLevelLabels } from '@/src/lib/eiken-vocabulary-schema';
import { SkeletonLoader } from '@/src/components/SkeletonLoader';

const { width } = Dimensions.get('window');

type Screen = 'level-select' | 'stage-select' | 'test' | 'result';
type DifficultyTab = 'beginner' | 'intermediate' | 'advanced';

const STAGE_GROUPS: Record<DifficultyTab, { label: string; emoji: string; stages: number[] }> = {
  beginner: { label: '初級', emoji: '⭐', stages: Array.from({ length: 8 }, (_, i) => i + 1) },
  intermediate: { label: '中級', emoji: '⭐⭐⭐', stages: Array.from({ length: 6 }, (_, i) => i + 9) },
  advanced: { label: '上級', emoji: '⭐⭐⭐⭐⭐', stages: Array.from({ length: 6 }, (_, i) => i + 15) },
};

export default function VocabularyScreen() {
  const router = useRouter();
  const {
    words,
    setWords,
    currentStage,
    setCurrentStage,
    masteredCount,
    getTodayStats,
    isLoading,
    // Error handling
    syncError,
    setSyncError,
    retry,
  } = useVocabularyStore();

  const { selectedLevel, setSelectedLevel, loadWordsForLevel } = useEIKENVocabStore();
  const [screen, setScreen] = useState<Screen>('level-select');
  const [selectedTab, setSelectedTab] = useState<DifficultyTab>('beginner');

  useEffect(() => {
    // 初期化：単語データをロード
    if (words.length === 0) {
      try {
        setWords(VOCABULARY_SAMPLE_DATA);
      } catch (error) {
        console.error('Failed to set words:', error);
        setSyncError('単語データの読み込みに失敗しました');
      }
    }
  }, []);

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
  if (words.length === 0 || isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>📚 英単語マスター</Text>
          <Text style={styles.subtitle}>単語を読み込み中...</Text>
        </View>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          <View style={styles.section}>
            <SkeletonLoader count={3} type="form" />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const handleSelectLevel = (level: EIKENLevel) => {
    setSelectedLevel(level);
    loadWordsForLevel(level);
    setScreen('stage-select');
  };

  const handleStartStage = (stage: number) => {
    setCurrentStage(stage);
    setScreen('test');
  };

  const handleBackToStageSelect = () => {
    setScreen('stage-select');
  };

  const handleBackToLevelSelect = () => {
    setScreen('level-select');
  };

  // Level Selection Screen
  if (screen === 'level-select') {
    return (
      <SafeAreaView style={styles.container}>
        <EIKENLevelSelector
          selectedLevel={selectedLevel}
          onLevelSelect={handleSelectLevel}
        />
      </SafeAreaView>
    );
  }

  if (screen === 'stage-select') {
    const stats = getTodayStats();
    const currentTab = STAGE_GROUPS[selectedTab];

    return (
      <SafeAreaView style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <View>
                <Text style={styles.title}>📚 英単語マスター</Text>
                <Text style={styles.subtitle}>{EIKENLevelLabels[selectedLevel]}</Text>
              </View>
              <TouchableOpacity
                style={styles.changeLevelButton}
                onPress={handleBackToLevelSelect}
              >
                <Text style={styles.changeLevelButtonText}>レベル変更</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Difficulty Tabs */}
          <View style={styles.section}>
            <View style={styles.difficultyTabs}>
              {(Object.entries(STAGE_GROUPS) as [DifficultyTab, typeof STAGE_GROUPS[DifficultyTab]][]).map(
                ([key, group]) => (
                  <TouchableOpacity
                    key={key}
                    style={[
                      styles.difficultyTab,
                      selectedTab === key && styles.difficultyTabActive,
                    ]}
                    onPress={() => setSelectedTab(key)}
                  >
                    <Text style={styles.difficultyTabEmoji}>{group.emoji}</Text>
                    <Text
                      style={[
                        styles.difficultyTabLabel,
                        selectedTab === key && styles.difficultyTabLabelActive,
                      ]}
                    >
                      {group.label}
                    </Text>
                  </TouchableOpacity>
                )
              )}
            </View>
          </View>

          {/* Stages Grid */}
          <View style={styles.section}>
            <View style={styles.stageGrid}>
              {currentTab.stages.map((stage: number) => {
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
              })}
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
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationType, setCelebrationType] = useState<'correct' | 'incorrect'>('correct');

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
    const isCorrect = currentOptions.find((opt) => opt.word === answer)?.isCorrect || false;

    // Trigger celebration animation
    setCelebrationType(isCorrect ? 'correct' : 'incorrect');
    setShowCelebration(true);

    // After animation, set answered state
    setTimeout(() => {
      setAnswered(true);
      setShowCelebration(false);
    }, 1200);

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
      <SafeAreaView style={styles.container}>
        <View style={styles.testHeader}>
          <TouchableOpacity onPress={onBack}>
            <Text style={styles.backButton}>← 戻る</Text>
          </TouchableOpacity>
          <Text style={styles.stageTitle}>読み込み中...</Text>
        </View>
        <View style={styles.loadingContainer}>
          <SkeletonLoader count={2} type="form" />
        </View>
      </SafeAreaView>
    );
  }

  const stageWords = words.filter((w) => w.stage === stage);
  const progress = ((questionIndex + 1) / stageWords.length) * 100;
  const isCorrect =
    selectedAnswer &&
    currentOptions.find((opt) => opt.word === selectedAnswer)?.isCorrect;

  return (
    <SafeAreaView style={styles.container}>
      {/* Celebration Animation Overlay */}
      <CelebrationAnimation
        type={celebrationType}
        trigger={showCelebration}
        onComplete={() => setShowCelebration(false)}
      />

      {/* Fixed Header */}
      <View style={styles.testHeader}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backButton}>← 戻る</Text>
        </TouchableOpacity>
        <Text style={styles.stageTitle}>Stage {stage}</Text>
        <Text style={styles.progressText}>
          {questionIndex + 1} / {stageWords.length}
        </Text>
      </View>

      {/* Fixed Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBar}>
          <View
            style={[styles.progressFill, { width: `${progress}%` }]}
          />
        </View>
      </View>

      {/* Scrollable Content Only */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollContent}
        contentContainerStyle={styles.scrollContentContainer}
      >
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
      </ScrollView>

      {/* Fixed Button at Bottom */}
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  statBox: {
    flex: 1,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.light.surfaceCard,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    ...Shadows.sm,
  },
  statBoxEmoji: {
    fontSize: 24,
  },
  statBoxValue: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  statBoxLabel: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    fontWeight: '500',
  },
  difficultyTabs: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  difficultyTab: {
    flex: 1,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.light.surfaceCard,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.light.border,
    ...Shadows.xs,
  },
  difficultyTabActive: {
    backgroundColor: Colors.light.primaryLight,
    borderColor: Colors.light.primary,
  },
  difficultyTabEmoji: {
    fontSize: 16,
  },
  difficultyTabLabel: {
    fontSize: 11,
    color: Colors.light.text,
    fontWeight: '500',
    textAlign: 'center',
  },
  difficultyTabLabelActive: {
    color: Colors.light.primary,
    fontWeight: '700',
  },
  stageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  stageButton: {
    width: (width - 56) / 5,
    aspectRatio: 1,
    backgroundColor: Colors.light.primaryLight,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.light.primary,
    marginBottom: Spacing.sm,
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
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  stageLock: {
    fontSize: 14,
    marginTop: Spacing.sm,
  },
  tipsBox: {
    flexDirection: 'row',
    padding: Spacing.md,
    backgroundColor: Colors.light.primaryLight,
    borderLeftWidth: 4,
    borderLeftColor: Colors.light.warning,
    borderRadius: BorderRadius.lg,
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
    backgroundColor: NaturalColors.background,
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
    paddingHorizontal: Spacing.lg,
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
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  progressBarContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    paddingBottom: Spacing.md,
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
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.light.surfaceCard,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    ...Shadows.sm,
  },
  questionLabel: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    fontWeight: '500',
  },
  word: {
    fontSize: 36,
    fontWeight: '800',
    color: Colors.light.primary,
  },
  wordReading: {
    fontSize: 15,
    color: Colors.light.text,
    fontWeight: '500',
  },
  optionsContainer: {
    gap: Spacing.md,
  },
  optionButton: {
    minHeight: 56,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
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
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.light.primaryLight,
    borderLeftWidth: 4,
    borderLeftColor: Colors.light.warning,
    borderRadius: BorderRadius.lg,
  },
  feedbackLabel: {
    fontSize: 11,
    color: Colors.light.textSecondary,
    fontWeight: '600',
  },
  exampleSentence: {
    fontSize: 14,
    color: Colors.light.text,
    fontWeight: '500',
    lineHeight: 20,
  },
  exampleTranslation: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    lineHeight: 18,
  },
  nextButton: {
    marginHorizontal: Spacing.lg,
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
    paddingHorizontal: Spacing.lg,
    backgroundColor: NaturalColors.background,
  },
  resultTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: Colors.light.text,
    textAlign: 'center',
  },
  resultStats: {
    flexDirection: 'row',
    gap: Spacing.sm,
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

  // Header enhancements for level selection
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  changeLevelButton: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    backgroundColor: Colors.light.primary,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  changeLevelButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },
});
