import React from 'react';
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

interface Props {
  onBack: () => void;
  onComplete: () => void;
}

const { width } = Dimensions.get('window');

export default function ShadowingResultScreen({ onBack, onComplete }: Props) {
  const { currentSession, getAverageScores, getRecords, getImprovement } =
    useShadowingStore();

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

        {/* Round Details */}
        <View style={styles.detailsContainer}>
          <Text style={styles.detailsTitle}>各ラウンドの評価</Text>
          {records.map((record) => (
            <View key={record.id} style={styles.roundDetail}>
              <View style={styles.roundDetailHeader}>
                <Text style={styles.roundDetailRound}>
                  Round {record.roundNumber}
                </Text>
                <Text style={styles.roundDetailScore}>
                  正確性: {record.accuracyScore}/10
                </Text>
              </View>
              <View style={styles.roundDetailScores}>
                <Text style={styles.detailScore}>
                  🎵 リズム: {record.rhythmScore}/10
                </Text>
                <Text style={styles.detailScore}>
                  🗣️ 発音: {record.pronunciationScore}/10
                </Text>
              </View>
              {record.feedback && (
                <Text style={styles.roundDetailFeedback}>
                  {record.feedback}
                </Text>
              )}
            </View>
          ))}
        </View>

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
  scoresContainer: {
    flexDirection: 'row',
    marginHorizontal: 24,
    marginTop: 16,
    gap: 12,
  },
  scoreCard: {
    flex: 1,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0066cc',
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
  overallScoreCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e6f4ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overallScoreValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#0066cc',
  },
  overallScoreLabel: {
    fontSize: 14,
    color: '#666',
  },
  overallScoreInfo: {
    flex: 1,
  },
  improvementText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  feedbackText: {
    fontSize: 13,
    color: '#666',
  },
  chartContainer: {
    marginHorizontal: 24,
    marginTop: 24,
    paddingHorizontal: 12,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  detailsContainer: {
    marginHorizontal: 24,
    marginTop: 24,
  },
  detailsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  roundDetail: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 10,
  },
  roundDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  roundDetailRound: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  roundDetailScore: {
    fontSize: 12,
    color: '#0066cc',
    fontWeight: '500',
  },
  roundDetailScores: {
    gap: 4,
    marginBottom: 8,
  },
  detailScore: {
    fontSize: 12,
    color: '#666',
  },
  roundDetailFeedback: {
    fontSize: 12,
    color: '#333',
    lineHeight: 16,
    fontStyle: 'italic',
  },
  buttonContainer: {
    marginHorizontal: 24,
    marginTop: 32,
    marginBottom: 40,
    gap: 12,
  },
  primaryButton: {
    paddingVertical: 12,
    backgroundColor: '#0066cc',
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  secondaryButton: {
    paddingVertical: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
});
