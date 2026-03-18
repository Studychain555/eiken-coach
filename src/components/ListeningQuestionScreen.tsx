import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Audio } from 'expo-av';
import type { ListeningQuestion } from '@/src/lib/listeningData';
import { useListeningStore } from '@/src/stores/listeningStore';

const { width } = Dimensions.get('window');

interface Props {
  question: ListeningQuestion;
  onComplete: () => void;
  onBack: () => void;
}

type Screen = 'player' | 'answer' | 'result';

export default function ListeningQuestionScreen({
  question,
  onComplete,
  onBack,
}: Props) {
  const [screen, setScreen] = useState<Screen>('player');
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const soundRef = useRef<Audio.Sound | null>(null);

  const { recordAttempt } = useListeningStore();

  const playAudio = async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: question.audioUrl },
        { progressUpdateIntervalMillis: 100 }
      );

      soundRef.current = sound;
      await soundRef.current.setRateAsync(playbackRate, true);
      setIsPlaying(true);
      await soundRef.current.playAsync();
    } catch (error) {
      console.error('Audio playback error:', error);
      // デモ用: エラーを無視して進める
      setTimeout(() => setScreen('answer'), 3000);
    }
  };

  const handleSelectAnswer = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
    const isCorrect = answerIndex === question.correctAnswer;
    recordAttempt(question.id, answerIndex, isCorrect);
    setScreen('result');
  };

  if (screen === 'player') {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onBack}>
              <Text style={styles.backButton}>← 戻る</Text>
            </TouchableOpacity>
            <Text style={styles.questionTitle}>{question.title}</Text>
          </View>

          {/* Audio Player */}
          <View style={styles.playerContainer}>
            <Text style={styles.playerLabel}>音声を再生</Text>

            {/* Play Button */}
            <TouchableOpacity
              style={styles.playButton}
              onPress={playAudio}
              disabled={isPlaying}
            >
              <Text style={styles.playButtonIcon}>▶️</Text>
              <Text style={styles.playButtonText}>
                {isPlaying ? '再生中...' : '再生する'}
              </Text>
            </TouchableOpacity>

            {/* Playback Speed Controls */}
            <View style={styles.speedControlsContainer}>
              <Text style={styles.speedLabel}>再生速度</Text>
              <View style={styles.speedButtons}>
                {[0.5, 0.75, 1.0, 1.25, 1.5].map((rate) => (
                  <TouchableOpacity
                    key={rate}
                    style={[
                      styles.speedButton,
                      playbackRate === rate && styles.speedButtonActive,
                    ]}
                    onPress={() => setPlaybackRate(rate)}
                  >
                    <Text
                      style={[
                        styles.speedButtonText,
                        playbackRate === rate &&
                          styles.speedButtonTextActive,
                      ]}
                    >
                      {rate}x
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Waveform Visualization */}
            <View style={styles.waveformContainer}>
              {Array.from({ length: 30 }).map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.waveformBar,
                    isPlaying && styles.waveformBarAnimated,
                  ]}
                />
              ))}
            </View>
          </View>

          {/* Continue Button */}
          <TouchableOpacity
            style={styles.continueButton}
            onPress={() => setScreen('answer')}
          >
            <Text style={styles.continueButtonText}>次へ進む（回答）</Text>
          </TouchableOpacity>

          {/* Info */}
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              💡 何度でも再生できます。内容を理解してから回答へ進んでください。
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (screen === 'answer') {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => setScreen('player')}>
              <Text style={styles.backButton}>← 戻す</Text>
            </TouchableOpacity>
            <Text style={styles.questionTitle}>{question.title}</Text>
          </View>

          {/* Question */}
          <View style={styles.questionContainer}>
            <Text style={styles.questionText}>
              この音声の内容は何ですか？
            </Text>
          </View>

          {/* Options */}
          <View style={styles.optionsContainer}>
            {question.choices.map((choice, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionButton,
                  selectedAnswer === index && styles.optionButtonSelected,
                ]}
                onPress={() => handleSelectAnswer(index)}
              >
                <View style={styles.optionLetterCircle}>
                  <Text style={styles.optionLetter}>
                    {String.fromCharCode(65 + index)}
                  </Text>
                </View>
                <Text style={styles.optionText}>{choice}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Replay Button */}
          <TouchableOpacity
            style={styles.replayButton}
            onPress={() => setScreen('player')}
          >
            <Text style={styles.replayButtonText}>🎧 もう一度聞く</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Result Screen
  const isCorrect = selectedAnswer === question.correctAnswer;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Result Header */}
        <View style={styles.resultHeader}>
          <Text style={styles.resultEmoji}>{isCorrect ? '✅' : '❌'}</Text>
          <Text style={styles.resultTitle}>
            {isCorrect ? '正解！' : '不正解'}
          </Text>
        </View>

        {/* Answer Display */}
        <View style={styles.answerDisplayContainer}>
          <View style={styles.correctAnswerBox}>
            <Text style={styles.answerLabel}>正解</Text>
            <Text style={styles.answerText}>
              {String.fromCharCode(65 + question.correctAnswer)}.{' '}
              {question.choices[question.correctAnswer]}
            </Text>
          </View>

          {!isCorrect && selectedAnswer !== null && (
            <View style={styles.selectedAnswerBox}>
              <Text style={styles.answerLabel}>あなたの答え</Text>
              <Text style={styles.answerText}>
                {String.fromCharCode(65 + selectedAnswer)}.{' '}
                {question.choices[selectedAnswer]}
              </Text>
            </View>
          )}
        </View>

        {/* Explanation */}
        <View style={styles.explanationContainer}>
          <Text style={styles.explanationLabel}>解説</Text>
          <Text style={styles.explanationText}>{question.explanation}</Text>
        </View>

        {/* Script */}
        <View style={styles.scriptContainer}>
          <Text style={styles.scriptLabel}>スクリプト</Text>
          <Text style={styles.scriptText}>{question.script.trim()}</Text>
        </View>

        {/* Shadowing Promotion */}
        <View style={styles.shadowingPromoContainer}>
          <Text style={styles.shadowingPromoTitle}>次のステップ</Text>
          <Text style={styles.shadowingPromoText}>
            シャドーイング練習でさらに英語力を強化しましょう。正解した問題の音声に合わせて音読します。
          </Text>
          <TouchableOpacity
            style={styles.shadowingButton}
            onPress={() => {
              // シャドーイング画面へ遷移
              console.log('Shadowing started for question:', question.id);
              // 実装時：ShadowingScreen を render
            }}
          >
            <Text style={styles.shadowingButtonIcon}>🎤</Text>
            <Text style={styles.shadowingButtonText}>
              シャドーイングを始める（7回）
            </Text>
          </TouchableOpacity>
        </View>

        {/* Complete Button */}
        <TouchableOpacity style={styles.completeButton} onPress={onComplete}>
          <Text style={styles.completeButtonText}>完了</Text>
        </TouchableOpacity>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 12,
    gap: 12,
  },
  backButton: {
    fontSize: 14,
    color: '#0066cc',
    fontWeight: '600',
  },
  questionTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },

  // Player Screen
  playerContainer: {
    marginHorizontal: 24,
    marginTop: 24,
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  playerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 16,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: '#0066cc',
    borderRadius: 12,
    marginBottom: 20,
    gap: 8,
  },
  playButtonIcon: {
    fontSize: 24,
  },
  playButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  speedControlsContainer: {
    marginBottom: 20,
  },
  speedLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
  speedButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  speedButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  speedButtonActive: {
    backgroundColor: '#0066cc',
    borderColor: '#0066cc',
  },
  speedButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  speedButtonTextActive: {
    color: '#fff',
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 40,
    gap: 2,
  },
  waveformBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#ddd',
    borderRadius: 2,
  },
  waveformBarAnimated: {
    backgroundColor: '#0066cc',
  },
  continueButton: {
    marginHorizontal: 24,
    marginTop: 20,
    paddingVertical: 12,
    backgroundColor: '#0066cc',
    borderRadius: 8,
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  infoBox: {
    marginHorizontal: 24,
    marginTop: 16,
    marginBottom: 40,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff8f0',
    borderLeftWidth: 4,
    borderLeftColor: '#ff9500',
    borderRadius: 6,
  },
  infoText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },

  // Answer Screen
  questionContainer: {
    marginHorizontal: 24,
    marginTop: 24,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  optionsContainer: {
    marginHorizontal: 24,
    marginTop: 20,
    gap: 12,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    gap: 12,
  },
  optionButtonSelected: {
    backgroundColor: '#e6f4ff',
    borderColor: '#0066cc',
  },
  optionLetterCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionLetter: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  optionText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  replayButton: {
    marginHorizontal: 24,
    marginTop: 24,
    marginBottom: 40,
    paddingVertical: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignItems: 'center',
  },
  replayButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },

  // Result Screen
  resultHeader: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  resultEmoji: {
    fontSize: 64,
    marginBottom: 12,
  },
  resultTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  answerDisplayContainer: {
    marginHorizontal: 24,
    gap: 12,
  },
  correctAnswerBox: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#d4edda',
    borderLeftWidth: 4,
    borderLeftColor: '#28a745',
    borderRadius: 6,
  },
  selectedAnswerBox: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f8d7da',
    borderLeftWidth: 4,
    borderLeftColor: '#dc3545',
    borderRadius: 6,
  },
  answerLabel: {
    fontSize: 11,
    color: '#666',
    marginBottom: 4,
  },
  answerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  explanationContainer: {
    marginHorizontal: 24,
    marginTop: 24,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  explanationLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  explanationText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  scriptContainer: {
    marginHorizontal: 24,
    marginTop: 16,
    marginBottom: 40,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  scriptLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  scriptText: {
    fontSize: 13,
    color: '#555',
    lineHeight: 20,
  },
  shadowingPromoContainer: {
    marginHorizontal: 24,
    marginTop: 20,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff0e6',
    borderLeftWidth: 4,
    borderLeftColor: '#ff9500',
    borderRadius: 8,
  },
  shadowingPromoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  shadowingPromoText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    marginBottom: 12,
  },
  shadowingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    backgroundColor: '#ff9500',
    borderRadius: 6,
    gap: 6,
  },
  shadowingButtonIcon: {
    fontSize: 18,
  },
  shadowingButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  completeButton: {
    marginHorizontal: 24,
    marginBottom: 40,
    paddingVertical: 12,
    backgroundColor: '#0066cc',
    borderRadius: 8,
    alignItems: 'center',
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
