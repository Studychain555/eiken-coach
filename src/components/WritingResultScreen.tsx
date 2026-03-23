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
import { useWritingStore } from '@/src/stores/writingStore';
import { CelebrationAnimation } from './CelebrationAnimation';

interface Props {
  onBack: () => void;
  onResubmit: () => void;
}

const { width } = Dimensions.get('window');

export default function WritingResultScreen({ onBack, onResubmit }: Props) {
  const { submissions } = useWritingStore();
  const [expandedSection, setExpandedSection] = useState<string | null>(
    'feedback'
  );
  const [showCelebration, setShowCelebration] = useState(true);

  // Auto-hide celebration after mount
  useEffect(() => {
    const timer = setTimeout(() => setShowCelebration(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  // 最新の提出を取得
  const latestSubmission = submissions[submissions.length - 1];

  if (!latestSubmission || !latestSubmission.score) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>採点結果が見つかりません</Text>
      </SafeAreaView>
    );
  }

  const score = latestSubmission.score;
  const maxScore = 16;
  const percentage = Math.round((score.totalScore / maxScore) * 100);

  // スコア比較用の視覚化
  const ScoreBar = ({ label, score, max = 4 }: { label: string; score: number; max?: number }) => (
    <View style={styles.scoreBarContainer}>
      <Text style={styles.scoreBarLabel}>{label}</Text>
      <View style={styles.scoreBarBackground}>
        <View
          style={[
            styles.scoreBarFill,
            { width: `${(score / max) * 100}%` },
          ]}
        />
      </View>
      <Text style={styles.scoreBarValue}>{score}/{max}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Celebration Animation Overlay */}
      <CelebrationAnimation
        type="confetti"
        trigger={showCelebration}
        onComplete={() => setShowCelebration(false)}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>📊 採点結果</Text>
        </View>

        {/* Overall Score */}
        <View style={styles.overallScoreContainer}>
          <View style={styles.scoreCircle}>
            <Text style={styles.scoreCircleValue}>{score.totalScore}</Text>
            <Text style={styles.scoreCircleMax}>/{maxScore}</Text>
          </View>
          <View style={styles.scoreInfo}>
            <Text style={styles.scorePercentage}>{percentage}%</Text>
            <Text style={styles.scoreMessage}>
              {percentage >= 80
                ? '🌟 優秀！'
                : percentage >= 60
                ? '👍 良好'
                : '💪 改善余地あり'}
            </Text>
          </View>
        </View>

        {/* Score Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>各観点の評価</Text>
          <ScoreBar label="内容（Content）" score={score.contentScore} />
          <ScoreBar label="構成（Organization）" score={score.structureScore} />
          <ScoreBar label="語彙（Vocabulary）" score={score.vocabularyScore} />
          <ScoreBar label="文法（Grammar）" score={score.grammarScore} />
        </View>

        {/* Feedback Section */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() =>
              setExpandedSection(
                expandedSection === 'feedback' ? null : 'feedback'
              )
            }
          >
            <Text style={styles.sectionTitle}>フィードバック</Text>
            <Text style={styles.expandIcon}>
              {expandedSection === 'feedback' ? '▼' : '▶'}
            </Text>
          </TouchableOpacity>
          {expandedSection === 'feedback' && (
            <View style={styles.feedbackContent}>
              <Text style={styles.feedbackText}>{score.feedback}</Text>
            </View>
          )}
        </View>

        {/* Corrections Section */}
        {score.corrections.length > 0 && (
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.sectionHeader}
              onPress={() =>
                setExpandedSection(
                  expandedSection === 'corrections' ? null : 'corrections'
                )
              }
            >
              <Text style={styles.sectionTitle}>
                修正提案（{score.corrections.length}件）
              </Text>
              <Text style={styles.expandIcon}>
                {expandedSection === 'corrections' ? '▼' : '▶'}
              </Text>
            </TouchableOpacity>
            {expandedSection === 'corrections' &&
              score.corrections.map((correction, index) => (
                <View key={index} style={styles.correctionItem}>
                  <View style={styles.correctionOriginal}>
                    <Text style={styles.correctionLabel}>誤り</Text>
                    <Text style={styles.correctionText}>
                      {correction.original}
                    </Text>
                  </View>
                  <View style={styles.correctionArrow}>
                    <Text>→</Text>
                  </View>
                  <View style={styles.correctionCorrected}>
                    <Text style={styles.correctionLabel}>修正</Text>
                    <Text style={styles.correctionText}>
                      {correction.corrected}
                    </Text>
                  </View>
                  {correction.explanation && (
                    <Text style={styles.correctionExplanation}>
                      {correction.explanation}
                    </Text>
                  )}
                </View>
              ))}
          </View>
        )}

        {/* Model Answer Section */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() =>
              setExpandedSection(
                expandedSection === 'model' ? null : 'model'
              )
            }
          >
            <Text style={styles.sectionTitle}>模範解答</Text>
            <Text style={styles.expandIcon}>
              {expandedSection === 'model' ? '▼' : '▶'}
            </Text>
          </TouchableOpacity>
          {expandedSection === 'model' && (
            <View style={styles.modelAnswerContent}>
              <Text style={styles.modelAnswerText}>
                {score.modelAnswer}
              </Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.resubmitButton}
            onPress={onResubmit}
          >
            <Text style={styles.resubmitButtonIcon}>✏️</Text>
            <Text style={styles.resubmitButtonText}>書き直す</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>← 問題選択に戻る</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f9ff',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 40,
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
  },
  overallScoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 24,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    gap: 16,
  },
  scoreCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e6f4ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreCircleValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#0066cc',
  },
  scoreCircleMax: {
    fontSize: 14,
    color: '#666',
  },
  scoreInfo: {
    flex: 1,
  },
  scorePercentage: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0066cc',
    marginBottom: 4,
  },
  scoreMessage: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    marginHorizontal: 24,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  expandIcon: {
    fontSize: 12,
    color: '#999',
  },
  scoreBarContainer: {
    marginBottom: 14,
  },
  scoreBarLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  scoreBarBackground: {
    height: 8,
    backgroundColor: '#ddd',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  scoreBarFill: {
    height: '100%',
    backgroundColor: '#0066cc',
  },
  scoreBarValue: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
  },
  feedbackContent: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  feedbackText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  correctionItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 10,
  },
  correctionOriginal: {
    marginBottom: 8,
  },
  correctionCorrected: {
    marginBottom: 8,
  },
  correctionLabel: {
    fontSize: 11,
    color: '#999',
    marginBottom: 3,
  },
  correctionText: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
  },
  correctionArrow: {
    fontSize: 12,
    color: '#0066cc',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  correctionExplanation: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 4,
    lineHeight: 16,
  },
  modelAnswerContent: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  modelAnswerText: {
    fontSize: 13,
    color: '#333',
    lineHeight: 20,
  },
  buttonContainer: {
    marginHorizontal: 24,
    marginTop: 32,
    marginBottom: 40,
    gap: 12,
  },
  resubmitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#0066cc',
    borderRadius: 8,
    gap: 8,
  },
  resubmitButtonIcon: {
    fontSize: 18,
  },
  resubmitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  backButton: {
    paddingVertical: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
});
