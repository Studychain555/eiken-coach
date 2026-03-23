/**
 * 仮想スクロール対応の問題リスト
 *
 * 最適化内容:
 * - FlatList による仮想スクロール（大量データを効率的に表示）
 * - 初期描画最小化
 * - バッチ更新
 */

import React, { memo, useCallback } from 'react';
import {
  FlatList,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ListRenderItem,
  ViewToken,
} from 'react-native';
import { OptimizedQuestionCard } from './OptimizedQuestionCard';

interface Question {
  id: string;
  title: string;
  difficulty: number;
  duration: number;
}

interface QuestionProgress {
  questionId: string;
  isCompleted: boolean;
  correctAnswers: number;
  totalAttempts: number;
}

interface VirtualizedQuestionListProps {
  questions: Question[];
  progress: Record<string, QuestionProgress>;
  isLoading?: boolean;
  onQuestionPress: (questionId: string) => void;
  onEndReached?: () => void;
  isLoadingMore?: boolean;
}

/**
 * 仮想スクロール対応リスト（メモ化）
 */
export const VirtualizedQuestionList = memo(
  ({
    questions,
    progress,
    isLoading = false,
    onQuestionPress,
    onEndReached,
    isLoadingMore = false,
  }: VirtualizedQuestionListProps) => {
    // リストアイテムレンダラー（メモ化）
    const renderItem: ListRenderItem<Question> = useCallback(
      ({ item }) => {
        const questionProgress = progress[item.id] || {
          questionId: item.id,
          isCompleted: false,
          correctAnswers: 0,
          totalAttempts: 0,
        };

        return (
          <OptimizedQuestionCard
            question={item}
            isCompleted={questionProgress.isCompleted}
            correctAnswers={questionProgress.correctAnswers}
            totalAttempts={questionProgress.totalAttempts}
            isLoading={isLoading}
            onPress={onQuestionPress}
          />
        );
      },
      [progress, isLoading, onQuestionPress]
    );

    // キー抽出（FlatList のパフォーマンス最適化に必須）
    const keyExtractor = useCallback((item: Question) => item.id, []);

    // スクロール終了時のコールバック
    const handleEndReached = useCallback(() => {
      if (onEndReached && !isLoadingMore) {
        onEndReached();
      }
    }, [onEndReached, isLoadingMore]);

    // ビューポート内のアイテム更新時のコールバック（デバッグ用）
    const handleViewableItemsChanged = useCallback(
      ({ viewableItems }: { viewableItems: ViewToken[] }) => {
        // 必要に応じて表示範囲内のアイテムをトラッキング
        // console.log('[VirtualizedList] Viewable items:', viewableItems.length);
      },
      []
    );

    return (
      <View style={styles.container}>
        {questions.length === 0 && !isLoading ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>問題がありません</Text>
          </View>
        ) : (
          <FlatList
            data={questions}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            style={styles.list}
            contentContainerStyle={styles.contentContainer}
            // 仮想スクロール最適化
            initialNumToRender={10} // 初期表示は10行のみ
            maxToRenderPerBatch={20} // 一度に最大20行を描画
            updateCellsBatchingPeriod={50} // バッチ更新の間隔（ms）
            removeClippedSubviews={true} // 見えないアイテムをメモリから削除
            // スクロール動作
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.5} // スクロール終了 50% 手前で検出
            scrollEventThrottle={16} // スクロールイベント頻度（16ms ≒ 60fps）
            onViewableItemsChanged={handleViewableItemsChanged}
            viewabilityConfig={{
              itemVisiblePercentThreshold: 50, // 50%以上見えているとビジブルと判定
            }}
            // ロード中表示
            ListFooterComponent={
              isLoadingMore ? (
                <View style={styles.footerLoader}>
                  <ActivityIndicator color="#0066cc" size="small" />
                  <Text style={styles.loadingText}>読み込み中...</Text>
                </View>
              ) : null
            }
            // パフォーマンス最適化
            bounces={true}
            showsVerticalScrollIndicator={true}
          />
        )}
      </View>
    );
  }
);

VirtualizedQuestionList.displayName = 'VirtualizedQuestionList';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  footerLoader: {
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 12,
    color: '#0066cc',
  },
});
