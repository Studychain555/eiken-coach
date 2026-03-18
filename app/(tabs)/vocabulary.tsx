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
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>📚 英単語マスター</Text>
            <Text style={styles.subtitle}>英検準1級 頻出単語</Text>
          </View>

          {/* Stats */}
          <View style={styles.statsCard}>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>修得単語</Text>
              <Text style={styles.statValue}>{masteredCount} / 2,000</Text>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${(masteredCount / 2000) * 100}%` },
                ]}
              />
            </View>
          </View>

          {/* Today's Stats */}
          <View style={styles.todayStatsContainer}>
            {(() => {
              const stats = getTodayStats();
              return (
                <>
                  <View style={styles.todayStatItem}>
                    <Text style={styles.todayStatValue}>{stats.attempted}</Text>
                    <Text style={styles.todayStatLabel}>出題</Text>
                  </View>
                  <View style={styles.todayStatItem}>
                    <Text style={styles.todayStatValue}>{stats.correct}</Text>
                    <Text style={styles.todayStatLabel}>正解</Text>
                  </View>
                  <View style={styles.todayStatItem}>
                    <Text style={styles.todayStatValue}>{stats.accuracy}%</Text>
                    <Text style={styles.todayStatLabel}>正答率</Text>
                  </View>
                </>
              );
            })()}
          </View>

          {/* Stages */}
          <View style={styles.stagesSection}>
            <Text style={styles.sectionTitle}>ステージを選択</Text>
            <View style={styles.stageGrid}>
              {Array.from({ length: stagesCount }, (_, i) => i + 1).map(
                (stage) => (
                  <TouchableOpacity
                    key={stage}
                    style={[
                      styles.stageButton,
                      stage <= 3 && styles.stageButtonActive,
                    ]}
                    onPress={() => handleStartStage(stage)}
                    disabled={stage > 3}
                  >
                    <Text style={styles.stageButtonNumber}>{stage}</Text>
                    {stage > 3 && (
                      <Text style={styles.stageLock}>🔒</Text>
                    )}
                  </TouchableOpacity>
                )
              )}
            </View>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              💡 1ステージ = 100語。同じ単語を3回連続正解で「修得」になります。
            </Text>
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
  statsCard: {
    marginHorizontal: 24,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0066cc',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#eee',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#0066cc',
  },
  todayStatsContainer: {
    flexDirection: 'row',
    marginHorizontal: 24,
    marginTop: 12,
    gap: 12,
  },
  todayStatItem: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    alignItems: 'center',
  },
  todayStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0066cc',
  },
  todayStatLabel: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  stagesSection: {
    marginHorizontal: 24,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  stageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  stageButton: {
    width: (width - 72) / 4,
    aspectRatio: 1,
    backgroundColor: '#e8f4ff',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#b3d9ff',
  },
  stageButtonActive: {
    backgroundColor: '#0066cc',
    borderColor: '#0052a3',
  },
  stageButtonNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0066cc',
  },
  stageButtonActive: {
    backgroundColor: '#0066cc',
    borderColor: '#0052a3',
  },
  stageButtonNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0066cc',
  },
  stageButtonActive: {
    backgroundColor: '#0066cc',
    borderColor: '#0052a3',
  },
  stageLock: {
    fontSize: 16,
    marginTop: 4,
  },
  infoBox: {
    marginHorizontal: 24,
    marginTop: 24,
    marginBottom: 40,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff8f0',
    borderLeftWidth: 4,
    borderLeftColor: '#ff9500',
    borderRadius: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
  },

  // Test Screen
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  testHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 12,
  },
  backButton: {
    fontSize: 14,
    color: '#0066cc',
    fontWeight: '600',
  },
  stageTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  progressText: {
    fontSize: 13,
    color: '#999',
  },
  progressBarContainer: {
    marginHorizontal: 24,
    marginBottom: 24,
  },
  questionContainer: {
    marginHorizontal: 24,
    marginBottom: 24,
    paddingHorizontal: 16,
    paddingVertical: 24,
    backgroundColor: '#fff',
    borderRadius: 12,
    alignItems: 'center',
  },
  questionLabel: {
    fontSize: 14,
    color: '#999',
    marginBottom: 12,
  },
  word: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  wordReading: {
    fontSize: 14,
    color: '#666',
  },
  optionsContainer: {
    marginHorizontal: 24,
    marginBottom: 24,
    gap: 12,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionButtonSelected: {
    borderColor: '#0066cc',
    backgroundColor: '#e6f4ff',
  },
  optionButtonCorrect: {
    backgroundColor: '#d4edda',
    borderColor: '#28a745',
  },
  optionButtonWrong: {
    backgroundColor: '#f8d7da',
    borderColor: '#dc3545',
  },
  optionText: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  optionTextSelected: {
    color: '#0066cc',
  },
  resultEmoji: {
    fontSize: 18,
  },
  feedbackContainer: {
    marginHorizontal: 24,
    marginBottom: 24,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff8f0',
    borderRadius: 8,
  },
  feedbackLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
  exampleSentence: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    lineHeight: 20,
    marginBottom: 8,
  },
  exampleTranslation: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  nextButton: {
    marginHorizontal: 24,
    marginBottom: 40,
    paddingVertical: 12,
    backgroundColor: '#0066cc',
    borderRadius: 8,
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },

  // Result Screen
  resultContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  resultTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 24,
  },
  resultStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  resultStatItem: {
    flex: 1,
    paddingVertical: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    alignItems: 'center',
  },
  resultStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0066cc',
    marginBottom: 4,
  },
  resultStatLabel: {
    fontSize: 12,
    color: '#999',
  },
  resultButton: {
    width: '100%',
    paddingVertical: 12,
    backgroundColor: '#0066cc',
    borderRadius: 8,
    alignItems: 'center',
  },
  resultButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
