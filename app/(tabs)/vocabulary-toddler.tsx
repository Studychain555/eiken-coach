/**
 * Toddler-Friendly Vocabulary Learning Screen
 * Warm colors, large text, simple navigation, supportive feedback
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';
import { ToddlerTheme, FriendlyMessages, ToddlerEmojis } from '@/src/constants/toddler-theme';
import { useEIKENVocabStore } from '@/src/stores/eikenVocabularyStore';
import EnhancedAudioPlayer from '@/src/components/EnhancedAudioPlayer';
import WordInsightPanel from '@/src/components/WordInsightPanel';

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: ToddlerTheme.colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: ToddlerTheme.colors.background,
  },
  headerGradient: {
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  header: {
    alignItems: 'center',
  },
  levelBadge: {
    backgroundColor: ToddlerTheme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: ToddlerTheme.borderRadius.full,
    marginBottom: 8,
  },
  levelText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
    fontWeight: '600',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFF',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  wordCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    ...ToddlerTheme.shadows.md,
    borderLeftWidth: 4,
    borderLeftColor: ToddlerTheme.colors.secondary,
  },
  wordDisplay: {
    alignItems: 'center',
    marginBottom: 24,
  },
  wordText: {
    fontSize: 32,
    fontWeight: '700',
    color: ToddlerTheme.colors.textPrimary,
    marginBottom: 8,
  },
  pronunciationText: {
    fontSize: 16,
    color: ToddlerTheme.colors.textSecondary,
    fontStyle: 'italic',
    marginBottom: 12,
  },
  audioButtonContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  meaningContainer: {
    backgroundColor: ToddlerTheme.colors.primaryLight,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: ToddlerTheme.colors.primary,
  },
  meaningLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: ToddlerTheme.colors.textSecondary,
    marginBottom: 6,
  },
  meaningText: {
    fontSize: 20,
    fontWeight: '700',
    color: ToddlerTheme.colors.textPrimary,
  },
  exampleContainer: {
    backgroundColor: ToddlerTheme.colors.secondaryLight,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 3,
    borderLeftColor: ToddlerTheme.colors.secondary,
  },
  exampleLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: ToddlerTheme.colors.textSecondary,
    marginBottom: 8,
  },
  exampleText: {
    fontSize: 16,
    color: ToddlerTheme.colors.textPrimary,
    lineHeight: 24,
    marginBottom: 8,
  },
  choicesContainer: {
    gap: 12,
    marginBottom: 16,
  },
  choiceButton: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 2,
    backgroundColor: '#FFF',
    borderColor: ToddlerTheme.colors.border,
  },
  choiceButtonCorrect: {
    backgroundColor: '#B2DFDB',
    borderColor: '#00796B',
  },
  choiceButtonIncorrect: {
    backgroundColor: '#FFCCCC',
    borderColor: '#C62828',
  },
  choiceText: {
    fontSize: 16,
    fontWeight: '600',
    color: ToddlerTheme.colors.textPrimary,
    textAlign: 'center',
  },
  feedbackContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  feedbackEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  feedbackText: {
    fontSize: 18,
    fontWeight: '700',
    color: ToddlerTheme.colors.success,
    textAlign: 'center',
  },
  nextButton: {
    backgroundColor: ToddlerTheme.colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
  },
  progressBar: {
    height: 8,
    backgroundColor: ToddlerTheme.colors.border,
    borderRadius: 4,
    marginBottom: 24,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: ToddlerTheme.colors.primary,
  },
  emoji: {
    fontSize: 24,
    marginRight: 8,
  },
});

interface VocabularyWord {
  id: string;
  word: string;
  reading: string;
  meaningJP: string;
  exampleSentence: string;
  exampleTranslation: string;
  choices: Array<{
    id: string;
    meaning: string;
    isCorrect: boolean;
  }>;
}

export default function VocabularyToddlerScreen() {
  const {
    selectedLevel,
    currentWords,
    currentWordIndex,
    selectAnswer,
    moveToNextWord,
    loadWordsForLevel,
  } = useEIKENVocabStore();

  const [isAnswered, setIsAnswered] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string>('');
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    loadWordsForLevel(selectedLevel);
  }, [selectedLevel, loadWordsForLevel]);

  if (!currentWords || currentWords.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient
          colors={[ToddlerTheme.colors.primary, ToddlerTheme.colors.primaryDark]}
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
        >
          <MaterialCommunityIcons
            name="book-open"
            size={64}
            color="#FFF"
            style={{ marginBottom: 16 }}
          />
          <Text style={{ fontSize: 20, fontWeight: '700', color: '#FFF', textAlign: 'center' }}>
            単語を読み込み中...
          </Text>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  const currentWord: VocabularyWord = currentWords[currentWordIndex];
  const progress = ((currentWordIndex + 1) / currentWords.length) * 100;

  const handleSelectChoice = (choiceId: string) => {
    if (isAnswered) return;

    setSelectedChoice(choiceId);
    const { isCorrect } = selectAnswer(choiceId);
    setIsAnswered(true);

    // Show appropriate feedback
    if (isCorrect) {
      const messages = FriendlyMessages.correct;
      setFeedback(messages[Math.floor(Math.random() * messages.length)]);
    } else {
      const messages = FriendlyMessages.incorrect;
      setFeedback(messages[Math.floor(Math.random() * messages.length)]);
    }
  };

  const handleNext = () => {
    moveToNextWord();
    setIsAnswered(false);
    setSelectedChoice(null);
    setFeedback('');
    setAnimationKey(prev => prev + 1);
  };

  const correctChoice = currentWord.choices.find(c => c.isCorrect);
  const selectedChoiceObj = currentWord.choices.find(c => c.id === selectedChoice);
  const isCorrect = selectedChoiceObj?.isCorrect ?? false;

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={[ToddlerTheme.colors.primary, ToddlerTheme.colors.primaryDark]}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>📚 {selectedLevel}</Text>
          </View>
          <Text style={styles.title}>英単語</Text>
          <Text style={styles.subtitle}>楽しく学ぼう！</Text>
          <View style={styles.statsBar}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>単語</Text>
              <Text style={styles.statValue}>{currentWordIndex + 1}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>合計</Text>
              <Text style={styles.statValue}>{currentWords.length}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>正解率</Text>
              <Text style={styles.statValue}>{'--'}</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Progress bar */}
        <View style={styles.progressBar}>
          <View
            style={[styles.progressFill, { width: `${progress}%` }]}
          />
        </View>

        {/* Word card */}
        <View style={styles.wordCard}>
          <View style={styles.wordDisplay}>
            <Text style={styles.wordText}>{currentWord.word}</Text>
            <Text style={styles.pronunciationText}>/{currentWord.reading}/</Text>
            <View style={styles.audioButtonContainer}>
              <EnhancedAudioPlayer
                word={currentWord.word}
                reading={currentWord.reading}
                size="large"
                showLabel={true}
              />
            </View>
          </View>

          {/* Meaning */}
          <View style={styles.meaningContainer}>
            <Text style={styles.meaningLabel}>意味</Text>
            <Text style={styles.meaningText}>{currentWord.meaningJP}</Text>
          </View>

          {/* Example sentence */}
          <View style={styles.exampleContainer}>
            <Text style={styles.exampleLabel}>使い方</Text>
            <Text style={styles.exampleText}>{currentWord.exampleSentence}</Text>
            <Text style={[styles.exampleText, { color: ToddlerTheme.colors.textSecondary }]}>
              {currentWord.exampleTranslation}
            </Text>
          </View>

          {/* Multiple choice questions */}
          <View style={styles.choicesContainer}>
            {currentWord.choices.map((choice) => (
              <TouchableOpacity
                key={choice.id}
                style={[
                  styles.choiceButton,
                  selectedChoice === choice.id &&
                    (choice.isCorrect
                      ? styles.choiceButtonCorrect
                      : styles.choiceButtonIncorrect),
                ]}
                onPress={() => handleSelectChoice(choice.id)}
                disabled={isAnswered}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  {selectedChoice === choice.id && (
                    <Text style={styles.emoji}>
                      {choice.isCorrect ? '✅' : '❌'}
                    </Text>
                  )}
                  <Text style={styles.choiceText}>{choice.meaning}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Feedback */}
          {isAnswered && (
            <View style={styles.feedbackContainer}>
              <Text style={styles.feedbackEmoji}>
                {isCorrect ? ToddlerEmojis.excited : ToddlerEmojis.thinking}
              </Text>
              <Text style={styles.feedbackText}>{feedback}</Text>
              {!isCorrect && (
                <Text style={{ fontSize: 14, color: ToddlerTheme.colors.textSecondary, marginTop: 8 }}>
                  正解: {correctChoice?.meaning}
                </Text>
              )}
            </View>
          )}

          {/* Next button */}
          {isAnswered && (
            <TouchableOpacity
              style={styles.nextButton}
              onPress={handleNext}
            >
              <Text style={styles.nextButtonText}>
                {currentWordIndex + 1 < currentWords.length ? '次へ →' : '完了！🎉'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Word insights */}
        <WordInsightPanel
          word={currentWord.word}
          meaning={currentWord.meaningJP}
          exampleSentence={currentWord.exampleSentence}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
