import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useShadowingStore } from '@/src/stores/shadowingStore';
import { LineChart } from 'react-native-chart-kit';
import DetailedShadowingFeedback from './DetailedShadowingFeedback';
import { NaturalColors, Spacing, BorderRadius } from '@/constants/theme';

interface Props {
  onBack: () => void;
  onComplete: () => void;
}

const { width } = Dimensions.get('window');

export default function ShadowingResultScreen({ onBack, onComplete }: Props) {
  const { currentSession, getAverageScores, getRecords, getImprovement } =
    useShadowingStore();
  const [expandedRound, setExpandedRound] = useState<number | null>(null);
  const [showDetailedModal, setShowDetailedModal] = useState<number | null>(null);

  if (!currentSession) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>データが見つかりません</Text>
      </SafeAreaView>
    );
  }

  const records = getRecords();
  const scores = getAverageScores();
  const improvement = getImprovement();

  // グラフ用データ
  const accuracyData = records
    .map((r) => r.accuracyScore || 0);
  const rhythmData = records
    .map((r) => r.rhythmScore || 0);
  const pronunciationData = records
    .map((r) => r.pronunciationScore || 0);

  const chartData = {
    labels: records.map((_, i) => `R${i + 1}`),
    datasets: [
      {
        data: accuracyData.length > 0 ? accuracyData : [0],
        color: () => '#0066cc',
        strokeWidth: 2,
      },
    ],
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>🎉 シャドーイング完了！</Text>
        </View>

        {/* Overall Scores */}
        <View style={styles.scoresContainer}>
          <View style={styles.scoreCard}>
            <Text style={styles.scoreLabel}>正確性</Text>
            <Text style={styles.scoreValue}>
              {scores.accuracy.toFixed(1)}/10
            </Text>
          </View>
          <View style={styles.scoreCard}>
            <Text style={styles.scoreLabel}>リズム</Text>
            <Text style={styles.scoreValue}>
              {scores.rhythm.toFixed(1)}/10
            </Text>
          </View>
          <View style={styles.scoreCard}>
            <Text style={styles.scoreLabel}>発音</Text>
            <Text style={styles.scoreValue}>
              {scores.pronunciation.toFixed(1)}/10
            </Text>
          </View>
        </View>

        {/* Overall Score */}
        <View style={styles.overallScoreContainer}>
          <View style={styles.overallScoreCircle}>
            <Text style={styles.overallScoreValue}>
              {scores.overall.toFixed(1)}
            </Text>
            <Text style={styles.overallScoreLabel}>/10</Text>
          </View>
          <View style={styles.overallScoreInfo}>
            <Text style={styles.improvementText}>
              📈 改善度: {improvement > 0 ? '+' : ''}{improvement.toFixed(1)}
            </Text>
            <Text style={styles.feedbackText}>
              {scores.overall >= 8
                ? '🌟 素晴らしい！'
                : scores.overall >= 6
                ? '👍 よくできました！'
                : '💪 もう少し練習しましょう'}
            </Text>
          </View>
        </View>

        {/* Chart */}
        {records.length > 1 && (
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>正確性の推移</Text>
            <LineChart
              data={chartData}
              width={width - 48}
              height={200}
              chartConfig={{
                backgroundColor: '#fff',
                backgroundGradientFrom: '#fff',
                backgroundGradientTo: '#fff',
                color: () => '#0066cc',
                labelColor: () => '#999',
                style: {
                  borderRadius: 8,
                },
                propsForDots: {
                  r: '5',
                  strokeWidth: '2',
                  stroke: '#0066cc',
                },
              }}
              bezier
            />
          </View>
        )}

        {/* Round Details - Summary View */}
        <View style={styles.detailsContainer}>
          <Text style={styles.detailsTitle}>📊 各ラウンドの評価</Text>
          {records.map((record) => (
            <TouchableOpacity
              key={record.id}
              style={[
                styles.roundDetail,
                expandedRound === record.roundNumber && styles.roundDetailExpanded,
              ]}
              onPress={() =>
                setExpandedRound(
                  expandedRound === record.roundNumber ? null : record.roundNumber
                )
              }
            >
              <View style={styles.roundDetailHeader}>
                <View>
                  <Text style={styles.roundDetailRound}>
                    ラウンド {record.roundNumber}
                  </Text>
                  <View style={styles.roundDetailScoresRow}>
                    <Text style={styles.detailScore}>
                      正確性: <Text style={{ color: '#52A876', fontWeight: '700' }}>
                        {(record.accuracyScore ?? 0).toFixed(1)}
                      </Text>
                    </Text>
                    <Text style={styles.detailScore}>
                      リズム: <Text style={{ color: '#D4A574', fontWeight: '700' }}>
                        {(record.rhythmScore ?? 0).toFixed(1)}
                      </Text>
                    </Text>
                  </View>
                </View>
                <View style={styles.expandIcon}>
                  <Text style={styles.expandIconText}>
                    {expandedRound === record.roundNumber ? '▼' : '▶'}
                  </Text>
                </View>
              </View>

              {expandedRound === record.roundNumber && (
                <View style={styles.expandedContent}>
                  {record.feedback && (
                    <View style={styles.feedbackBox}>
                      <Text style={styles.feedbackBoxTitle}>💡 詳細コメント</Text>
                      <Text style={styles.feedbackBoxText}>
                        {record.feedback}
                      </Text>
                    </View>
                  )}
                  <TouchableOpacity
                    style={styles.detailedButton}
                    onPress={() => setShowDetailedModal(record.roundNumber)}
                  >
                    <Text style={styles.detailedButtonText}>
                      📝 詳細な分析を見る
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Detailed Feedback Modal - Fullscreen DetailedShadowingFeedback */}
        {showDetailedModal !== null && (
          <View style={styles.modalOverlay}>
            <DetailedShadowingFeedback
              script={currentSession.script}
              pronunciationScore={records[showDetailedModal - 1]?.pronunciationScore ?? 0}
              rhythmScore={records[showDetailedModal - 1]?.rhythmScore ?? 0}
              accuracyScore={records[showDetailedModal - 1]?.accuracyScore ?? 0}
              overallFeedback={records[showDetailedModal - 1]?.feedback ?? ''}
              roundNumber={showDetailedModal}
              phraseFeedbacks={(records[showDetailedModal - 1] as any)?.phraseFeedbacks}
              wordFeedbacks={(records[showDetailedModal - 1] as any)?.wordFeedbacks}
            />
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={onBack}
          >
            <Text style={styles.secondaryButtonText}>← リスニングに戻る</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={onComplete}
          >
            <Text style={styles.primaryButtonText}>完了</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NaturalColors.background,
  },
  errorText: {
    fontSize: 16,
    color: NaturalColors.textMedium,
    textAlign: 'center',
    marginTop: 40,
  },
  header: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: NaturalColors.textDark,
  },
  scoresContainer: {
    flexDirection: 'row',
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.lg,
    gap: Spacing.md,
  },
  scoreCard: {
    flex: 1,
    paddingVertical: Spacing.lg,
    backgroundColor: NaturalColors.cardBg,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8E6E1',
  },
  scoreLabel: {
    fontSize: 12,
    color: NaturalColors.textMedium,
    marginBottom: Spacing.sm,
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: NaturalColors.primary,
  },
  overallScoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
    backgroundColor: NaturalColors.cardBg,
    borderRadius: BorderRadius.lg,
    gap: Spacing.lg,
    borderWidth: 1,
    borderColor: '#E8E6E1',
  },
  overallScoreCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(27, 155, 164, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overallScoreValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: NaturalColors.primary,
  },
  overallScoreLabel: {
    fontSize: 14,
    color: NaturalColors.textMedium,
  },
  overallScoreInfo: {
    flex: 1,
  },
  improvementText: {
    fontSize: 14,
    fontWeight: '600',
    color: NaturalColors.textDark,
    marginBottom: Spacing.sm,
  },
  feedbackText: {
    fontSize: 13,
    color: NaturalColors.textMedium,
  },
  chartContainer: {
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.xl,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.lg,
    backgroundColor: NaturalColors.cardBg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: '#E8E6E1',
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: NaturalColors.textDark,
    marginBottom: Spacing.lg,
  },
  detailsContainer: {
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: NaturalColors.textDark,
    marginBottom: Spacing.lg,
  },
  roundDetail: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: NaturalColors.cardBg,
    borderRadius: BorderRadius.lg,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E8E6E1',
  },
  roundDetailExpanded: {
    backgroundColor: 'rgba(27, 155, 164, 0.05)',
    borderColor: NaturalColors.primary,
  },
  roundDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 0,
  },
  roundDetailRound: {
    fontSize: 15,
    fontWeight: '700',
    color: NaturalColors.textDark,
    marginBottom: Spacing.sm,
  },
  roundDetailScoresRow: {
    flexDirection: 'row',
    gap: Spacing.lg,
  },
  roundDetailScore: {
    fontSize: 13,
    color: NaturalColors.primary,
    fontWeight: '600',
  },
  roundDetailScores: {
    gap: 4,
    marginBottom: 8,
  },
  detailScore: {
    fontSize: 13,
    color: NaturalColors.textMedium,
    fontWeight: '500',
  },
  roundDetailFeedback: {
    fontSize: 12,
    color: NaturalColors.textDark,
    lineHeight: 16,
    marginTop: Spacing.md,
  },
  expandIcon: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  expandIconText: {
    fontSize: 14,
    color: NaturalColors.textMedium,
    fontWeight: '600',
  },
  expandedContent: {
    marginTop: Spacing.lg,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: '#E8E6E1',
  },
  feedbackBox: {
    padding: Spacing.lg,
    backgroundColor: 'rgba(82, 168, 118, 0.08)',
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: '#52A876',
  },
  feedbackBoxTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: NaturalColors.textMedium,
    marginBottom: Spacing.sm,
  },
  feedbackBoxText: {
    fontSize: 13,
    color: NaturalColors.textDark,
    lineHeight: 18,
  },
  detailedButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    backgroundColor: NaturalColors.primary,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  detailedButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  buttonContainer: {
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.xxl,
    marginBottom: 40,
    gap: Spacing.md,
  },
  primaryButton: {
    paddingVertical: Spacing.lg,
    backgroundColor: NaturalColors.primary,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  secondaryButton: {
    paddingVertical: Spacing.lg,
    backgroundColor: NaturalColors.lightBg,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8E6E1',
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: NaturalColors.textDark,
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: NaturalColors.background,
    zIndex: 999,
  },
});
