/**
 * 最適化されたリスニング問題カード
 *
 * 最適化内容:
 * - memo による無駄な再レンダリング防止
 * - useMemo による計算結果のメモ化
 * - useCallback によるコールバック関数の最適化
 */

import React, { memo, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';

interface Question {
  id: string;
  title: string;
  difficulty: number;
  duration: number;
}

interface OptimizedQuestionCardProps {
  question: Question;
  isCompleted: boolean;
  correctAnswers: number;
  totalAttempts: number;
  isLoading?: boolean;
  onPress: (questionId: string) => void;
}

/**
 * メモ化されたコンポーネント
 * props が変わらなければ再レンダリングされない
 */
export const OptimizedQuestionCard = memo(
  ({
    question,
    isCompleted,
    correctAnswers,
    totalAttempts,
    isLoading = false,
    onPress,
  }: OptimizedQuestionCardProps) => {
    // 計算結果をメモ化（dependencies が変わるまでキャッシュ）
    const stats = useMemo(() => {
      const accuracy = totalAttempts > 0 ? (correctAnswers / totalAttempts) * 100 : 0;
      const difficultyLabel = getDifficultyLabel(question.difficulty);

      return {
        accuracy: Math.round(accuracy),
        difficultyLabel,
      };
    }, [correctAnswers, totalAttempts, question.difficulty]);

    // コールバックをメモ化（無駄なクロージャー生成を防止）
    const handlePress = useCallback(() => {
      onPress(question.id);
    }, [question.id, onPress]);

    // バックグラウンドカラーを計算（メモ化）
    const backgroundColor = useMemo(() => {
      if (!isCompleted) return '#ffffff';
      if (stats.accuracy >= 80) return '#e8f5e9'; // 緑
      if (stats.accuracy >= 60) return '#fff3e0'; // 橙
      return '#ffebee'; // 赤
    }, [isCompleted, stats.accuracy]);

    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor }]}
        onPress={handlePress}
        disabled={isLoading}
        activeOpacity={0.7}
      >
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator color="#0066cc" size="small" />
          </View>
        )}

        {/* タイトル */}
        <Text style={styles.title} numberOfLines={2}>
          {question.title}
        </Text>

        {/* 難易度 */}
        <View style={styles.difficultyContainer}>
          <Text style={styles.difficultyLabel}>{stats.difficultyLabel}</Text>
          <Text style={styles.duration}>{question.duration}分</Text>
        </View>

        {/* 成績情報 */}
        {isCompleted ? (
          <View style={styles.statsContainer}>
            <Text style={styles.statsText}>
              正答率: {stats.accuracy}% ({correctAnswers}/{totalAttempts})
            </Text>
          </View>
        ) : (
          <Text style={styles.notAttempted}>未実施</Text>
        )}
      </TouchableOpacity>
    );
  },
  // カスタム比較関数（オプション）
  // デフォルトではすべての props を浅い比較で検査
  // 必要に応じてここでカスタムロジックを追加
  (prevProps, nextProps) => {
    return (
      prevProps.question.id === nextProps.question.id &&
      prevProps.isCompleted === nextProps.isCompleted &&
      prevProps.correctAnswers === nextProps.correctAnswers &&
      prevProps.totalAttempts === nextProps.totalAttempts &&
      prevProps.isLoading === nextProps.isLoading
      // onPress は参照が変わるため比較しない（常に新しい関数が渡される可能性）
    );
  }
);

OptimizedQuestionCard.displayName = 'OptimizedQuestionCard';

/**
 * 難易度ラベルを取得（計算を避けるためメモ化）
 */
function getDifficultyLabel(difficulty: number): string {
  const labels: Record<number, string> = {
    1: '★☆☆☆☆',
    2: '★★☆☆☆',
    3: '★★★☆☆',
    4: '★★★★☆',
    5: '★★★★★',
  };
  return labels[difficulty] || '不明';
}

const styles = StyleSheet.create({
  card: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  difficultyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  difficultyLabel: {
    fontSize: 12,
    color: '#ff9800',
    fontWeight: '600',
  },
  duration: {
    fontSize: 12,
    color: '#999',
  },
  statsContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  statsText: {
    fontSize: 12,
    color: '#0066cc',
    fontWeight: '500',
  },
  notAttempted: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
});
