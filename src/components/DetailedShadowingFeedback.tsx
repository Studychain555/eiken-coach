import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { PhraseFeedback, WordFeedback } from '@/src/lib/aiScoringService';
import { NaturalColors, Spacing, BorderRadius } from '@/constants/theme';
import PhraseDetailModal from './PhraseDetailModal';

interface DetailedShadowingFeedbackProps {
  script: string;
  pronunciationScore: number;
  rhythmScore: number;
  accuracyScore: number;
  overallFeedback: string;
  roundNumber: number;
  phraseFeedbacks?: PhraseFeedback[];
  wordFeedbacks?: WordFeedback[];
}

const { width } = Dimensions.get('window');

export default function DetailedShadowingFeedback({
  script,
  phraseFeedbacks,
  wordFeedbacks,
  pronunciationScore,
  rhythmScore,
  accuracyScore,
  overallFeedback,
  roundNumber,
}: DetailedShadowingFeedbackProps) {
  const [selectedPhrase, setSelectedPhrase] = useState<PhraseFeedback | null>(null);
  const [selectedWord, setSelectedWord] = useState<WordFeedback | null>(null);
  const [phraseModalVisible, setPhraseModalVisible] = useState(false);
  const [wordModalVisible, setWordModalVisible] = useState(false);

  const handlePhrasePress = (phrase: PhraseFeedback) => {
    setSelectedPhrase(phrase);
    setPhraseModalVisible(true);
  };

  const handleWordPress = (feedback: WordFeedback) => {
    setSelectedWord(feedback);
    setWordModalVisible(true);
  };

  // フレーズレベルのフィードバック表示か、ワード単位か判定
  const showPhraseLevel = phraseFeedbacks && phraseFeedbacks.length > 0;
  const showWordLevel = wordFeedbacks && wordFeedbacks.length > 0;

  // スクリプトの単語を分割
  const scriptWords = script.split(/\s+/);

  // スコアのスタイルを決定
  const getScoreColor = (score: number) => {
    if (score >= 8) return '#52A876'; // Success green
    if (score >= 6) return '#D4A574'; // Warning orange
    return '#C85C5C'; // Error red
  };

  const getPhraseStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return '#52C41A'; // Green
      case 'needsWork':
        return '#FAAD14'; // Yellow
      case 'major':
        return '#F5222D'; // Red
      default:
        return '#999';
    }
  };

  const getPhraseStatusBgColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'rgba(82, 196, 26, 0.1)';
      case 'needsWork':
        return 'rgba(250, 173, 20, 0.1)';
      case 'major':
        return 'rgba(245, 34, 45, 0.1)';
      default:
        return 'rgba(200, 200, 200, 0.08)';
    }
  };

  const getWordStatusColor = (status: string) => {
    switch (status) {
      case 'correct':
        return '#52A876'; // Natural green
      case 'incorrect':
        return '#C85C5C'; // Natural red
      case 'weak':
        return '#B8BFCA'; // Natural hint gray
      default:
        return '#2D3436'; // Natural dark
    }
  };

  const getWordStatusEmoji = (status: string) => {
    switch (status) {
      case 'correct':
        return '✓';
      case 'incorrect':
        return '✗';
      case 'weak':
        return '△';
      default:
        return '•';
    }
  };

  const getPhraseStatusLabel = (status: string): string => {
    switch (status) {
      case 'good':
        return '✅';
      case 'needsWork':
        return '⚠️';
      case 'major':
        return '❌';
      default:
        return '•';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.roundTitle}>ラウンド {roundNumber}</Text>
          <Text style={styles.subtitle}>詳細フィードバック</Text>
        </View>

        {/* Scores Section */}
        <View style={styles.scoresSection}>
          <View style={styles.scoreItem}>
            <Text style={styles.scoreLabel}>正確性</Text>
            <View style={styles.scoreBar}>
              <View
                style={[
                  styles.scoreBarFill,
                  {
                    width: `${accuracyScore * 10}%`,
                    backgroundColor: getScoreColor(accuracyScore),
                  },
                ]}
              />
            </View>
            <Text style={[styles.scoreValue, { color: getScoreColor(accuracyScore) }]}>
              {accuracyScore.toFixed(1)}/10
            </Text>
          </View>

          <View style={styles.scoreItem}>
            <Text style={styles.scoreLabel}>リズム</Text>
            <View style={styles.scoreBar}>
              <View
                style={[
                  styles.scoreBarFill,
                  {
                    width: `${rhythmScore * 10}%`,
                    backgroundColor: getScoreColor(rhythmScore),
                  },
                ]}
              />
            </View>
            <Text style={[styles.scoreValue, { color: getScoreColor(rhythmScore) }]}>
              {rhythmScore.toFixed(1)}/10
            </Text>
          </View>

          <View style={styles.scoreItem}>
            <Text style={styles.scoreLabel}>発音</Text>
            <View style={styles.scoreBar}>
              <View
                style={[
                  styles.scoreBarFill,
                  {
                    width: `${pronunciationScore * 10}%`,
                    backgroundColor: getScoreColor(pronunciationScore),
                  },
                ]}
              />
            </View>
            <Text style={[styles.scoreValue, { color: getScoreColor(pronunciationScore) }]}>
              {pronunciationScore.toFixed(1)}/10
            </Text>
          </View>
        </View>

        {/* Phrase-by-Phrase Feedback (if available) */}
        {showPhraseLevel && (
          <View style={styles.sentenceSection}>
            <Text style={styles.sectionTitle}>🎯 フレーズ単位の分析</Text>
            <View style={styles.phraseFeedbackList}>
              {phraseFeedbacks!.map((feedback, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handlePhrasePress(feedback)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.phraseCard,
                      {
                        backgroundColor: getPhraseStatusBgColor(feedback.status),
                        borderColor: getPhraseStatusColor(feedback.status),
                      },
                    ]}
                  >
                    {/* Phrase Header */}
                    <View style={styles.phraseCardHeader}>
                      <View style={styles.phraseInfo}>
                        <Text
                          style={[
                            styles.phraseText,
                            { color: getPhraseStatusColor(feedback.status) },
                          ]}
                        >
                          {getPhraseStatusLabel(feedback.status)} {feedback.phrase}
                        </Text>
                      </View>
                      <Text style={styles.phraseArrow}>→</Text>
                    </View>

                    {/* Correct Reading */}
                    {feedback.correctReading && (
                      <View style={styles.phraseReading}>
                        <Text style={styles.readingLabel}>正しい読み方:</Text>
                        <Text
                          style={[
                            styles.readingValue,
                            { color: getPhraseStatusColor(feedback.status) },
                          ]}
                        >
                          {feedback.correctReading}
                        </Text>
                      </View>
                    )}

                    {/* Issues Summary */}
                    {feedback.issues && feedback.issues.length > 0 && (
                      <View style={styles.phraseIssues}>
                        <Text style={styles.issuesLabel}>問題点:</Text>
                        <View style={styles.issuesTags}>
                          {feedback.issues.map((issue, issueIdx) => (
                            <View
                              key={issueIdx}
                              style={[
                                styles.issueTag,
                                {
                                  borderColor: getPhraseStatusColor(feedback.status),
                                },
                              ]}
                            >
                              <Text style={styles.issueTagText}>
                                {issue.type === 'linking' && '🔗'}
                                {issue.type === 'reduction' && '⬇️'}
                                {issue.type === 'stress' && '💪'}
                                {issue.type === 'intonation' && '📈'}
                                {issue.type === 'pronunciation' && '🗣️'}
                                {' '}
                                {issue.type === 'linking' && 'リンキング'}
                                {issue.type === 'reduction' && 'リダクション'}
                                {issue.type === 'stress' && 'ストレス'}
                                {issue.type === 'intonation' && 'イントネーション'}
                                {issue.type === 'pronunciation' && '発音'}
                              </Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    )}

                    {/* Tap to Details */}
                    <Text style={styles.tapToDetails}>タップで詳細表示</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Word-by-Word Feedback */}
        {showWordLevel && (
          <View style={styles.sentenceSection}>
            <Text style={styles.sectionTitle}>📝 各単語の評価</Text>
          <View style={styles.sentenceContainer}>
            {scriptWords.map((word, index) => {
              const feedback = wordFeedbacks!.find((f) =>
                f.word.toLowerCase() === word.toLowerCase()
              );
              const status = feedback?.status || 'correct';
              const statusEmoji = getWordStatusEmoji(status);

              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => feedback && handleWordPress(feedback)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.wordPill,
                      {
                        borderColor: getWordStatusColor(status),
                        backgroundColor:
                          status === 'correct'
                            ? 'rgba(82, 168, 118, 0.1)'
                            : status === 'incorrect'
                            ? 'rgba(200, 92, 92, 0.1)'
                            : 'rgba(184, 191, 202, 0.08)',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.wordText,
                        { color: getWordStatusColor(status) },
                      ]}
                    >
                      {statusEmoji} {word}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
          </View>
        )}

        {/* Overall Feedback */}
        <View style={styles.feedbackSection}>
          <Text style={styles.sectionTitle}>💡 全体コメント</Text>
          <View style={styles.feedbackBox}>
            <Text style={styles.feedbackText}>{overallFeedback}</Text>
          </View>
        </View>

        {/* Legend */}
        <View style={styles.legendSection}>
          <Text style={styles.sectionTitle}>📌 凡例</Text>
          <View style={styles.legendItems}>
            <View style={styles.legendItem}>
              <Text style={[styles.legendEmoji, { color: '#52A876' }]}>✓</Text>
              <Text style={styles.legendLabel}>正確</Text>
            </View>
            <View style={styles.legendItem}>
              <Text style={[styles.legendEmoji, { color: '#C85C5C' }]}>✗</Text>
              <Text style={styles.legendLabel}>不正確</Text>
            </View>
            <View style={styles.legendItem}>
              <Text style={[styles.legendEmoji, { color: '#B8BFCA' }]}>△</Text>
              <Text style={styles.legendLabel}>弱い/不自然</Text>
            </View>
          </View>
        </View>

        <View style={styles.spacer} />
      </ScrollView>

      {/* Phrase Detail Modal */}
      <PhraseDetailModal
        visible={phraseModalVisible}
        phrase={selectedPhrase}
        onClose={() => setPhraseModalVisible(false)}
      />

      {/* Word Detailed Feedback Modal */}
      <Modal
        visible={wordModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setWordModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>単語の詳細</Text>
            <View style={styles.spacerRight} />
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {selectedWord && (
              <>
                {/* Word Display */}
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>単語</Text>
                  <View
                    style={[
                      styles.wordHighlight,
                      {
                        borderColor: getStatusColor(selectedWord.status),
                        backgroundColor:
                          selectedWord.status === 'correct'
                            ? 'rgba(82, 168, 118, 0.15)'
                            : 'rgba(200, 92, 92, 0.15)',
                      },
                    ]}
                  >
                    <Text style={styles.wordHighlightText}>
                      {selectedWord.word}
                    </Text>
                    {selectedWord.tag && (
                      <View style={styles.tagBadge}>
                        <Text style={styles.tagText}>{selectedWord.tag}</Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Status */}
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>評価</Text>
                  <View
                    style={[
                      styles.statusBox,
                      {
                        borderLeftColor: getStatusColor(selectedWord.status),
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        { color: getStatusColor(selectedWord.status) },
                      ]}
                    >
                      {selectedWord.status === 'correct'
                        ? '✓ 正確に発音できています'
                        : selectedWord.status === 'incorrect'
                        ? '✗ 不正確な発音です'
                        : '△ 弱い/不自然な部分があります'}
                    </Text>
                  </View>
                </View>

                {/* Your Version */}
                {selectedWord.yourVersion && (
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>あなたの発音</Text>
                    <View style={styles.feedbackBox}>
                      <Text style={styles.feedbackBoxLabel}>聞こえた内容:</Text>
                      <Text style={styles.feedbackBoxText}>
                        {selectedWord.yourVersion}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Correct Version */}
                {selectedWord.correctPronunciation && (
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>正しい発音</Text>
                    <View
                      style={[
                        styles.feedbackBox,
                        { backgroundColor: 'rgba(82, 168, 118, 0.1)' },
                      ]}
                    >
                      <Text style={styles.feedbackBoxLabel}>カタカナ表記:</Text>
                      <Text style={[styles.feedbackBoxText, { color: '#52A876' }]}>
                        {selectedWord.correctPronunciation}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Why Incorrect */}
                {selectedWord.explanation && (
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>何が間違っていたのか</Text>
                    <View
                      style={[
                        styles.feedbackBox,
                        { backgroundColor: 'rgba(200, 92, 92, 0.08)' },
                      ]}
                    >
                      <Text style={styles.feedbackBoxText}>
                        {selectedWord.explanation}
                      </Text>
                    </View>
                  </View>
                )}

                {/* How to Improve */}
                {selectedWord.tip && (
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>改善のコツ</Text>
                    <View
                      style={[
                        styles.feedbackBox,
                        { backgroundColor: 'rgba(212, 165, 116, 0.1)' },
                      ]}
                    >
                      <Text style={styles.feedbackBoxText}>💡 {selectedWord.tip}</Text>
                    </View>
                  </View>
                )}

                <View style={styles.modalSpacer} />
              </>
            )}
          </ScrollView>

          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setWordModalVisible(false)}
          >
            <Text style={styles.modalCloseButtonText}>閉じる</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NaturalColors.background,
  },
  header: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  roundTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: NaturalColors.textDark,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: 14,
    color: NaturalColors.textMedium,
    fontWeight: '500',
  },
  scoresSection: {
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  scoreItem: {
    marginBottom: Spacing.lg,
  },
  scoreLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: NaturalColors.textMedium,
    marginBottom: Spacing.sm,
  },
  scoreBar: {
    height: 8,
    backgroundColor: '#E8E6E1',
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  scoreBarFill: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
  scoreValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  sentenceSection: {
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: NaturalColors.textDark,
    marginBottom: Spacing.lg,
  },
  phraseFeedbackList: {
    gap: Spacing.lg,
  },
  phraseCard: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    marginBottom: Spacing.sm,
  },
  phraseCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  phraseInfo: {
    flex: 1,
  },
  phraseText: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
  },
  phraseArrow: {
    fontSize: 18,
    color: NaturalColors.textMedium,
    marginLeft: Spacing.md,
  },
  phraseReading: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  readingLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: NaturalColors.textMedium,
    marginBottom: Spacing.sm,
  },
  readingValue: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
  },
  phraseIssues: {
    marginBottom: Spacing.md,
  },
  issuesLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: NaturalColors.textMedium,
    marginBottom: Spacing.sm,
  },
  issuesTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  issueTag: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  issueTagText: {
    fontSize: 12,
    fontWeight: '600',
    color: NaturalColors.textDark,
  },
  tapToDetails: {
    fontSize: 11,
    fontStyle: 'italic',
    color: NaturalColors.textMedium,
    marginTop: Spacing.md,
    textAlign: 'right',
  },
  sentenceContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  wordPill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
  },
  wordText: {
    fontSize: 14,
    fontWeight: '600',
  },
  feedbackSection: {
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  feedbackBox: {
    padding: Spacing.lg,
    backgroundColor: NaturalColors.cardBg,
    borderRadius: BorderRadius.lg,
    borderLeftWidth: 4,
    borderLeftColor: NaturalColors.primary,
  },
  feedbackBoxLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: NaturalColors.textMedium,
    marginBottom: Spacing.sm,
  },
  feedbackBoxText: {
    fontSize: 14,
    color: NaturalColors.textDark,
    lineHeight: 20,
  },
  feedbackText: {
    fontSize: 14,
    color: NaturalColors.textDark,
    lineHeight: 20,
  },
  legendSection: {
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  legendItems: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  legendItem: {
    alignItems: 'center',
  },
  legendEmoji: {
    fontSize: 20,
    marginBottom: Spacing.sm,
  },
  legendLabel: {
    fontSize: 12,
    color: NaturalColors.textMedium,
    fontWeight: '500',
  },
  spacer: {
    height: Spacing.xl,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: NaturalColors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E6E1',
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    color: NaturalColors.textDark,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: NaturalColors.textDark,
  },
  spacerRight: {
    width: 40,
  },
  modalContent: {
    flex: 1,
    padding: Spacing.xl,
  },
  modalSection: {
    marginBottom: Spacing.xl,
  },
  modalSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: NaturalColors.textDark,
    marginBottom: Spacing.lg,
  },
  wordHighlight: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  wordHighlightText: {
    fontSize: 24,
    fontWeight: '700',
    color: NaturalColors.textDark,
  },
  tagBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: 'rgba(27, 155, 164, 0.2)',
    borderRadius: BorderRadius.full,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
    color: NaturalColors.primary,
  },
  statusBox: {
    padding: Spacing.lg,
    backgroundColor: NaturalColors.cardBg,
    borderRadius: BorderRadius.lg,
    borderLeftWidth: 4,
  },
  statusText: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
  },
  modalCloseButton: {
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
    paddingVertical: Spacing.lg,
    backgroundColor: NaturalColors.primary,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalSpacer: {
    height: Spacing.xl,
  },
});
