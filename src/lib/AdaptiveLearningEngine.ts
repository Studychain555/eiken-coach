/**
 * Adaptive Learning Engine
 * Phase 9 - AI 適応的学習
 *
 * ユーザーの学習パターンを分析し、最適な学習順序を自動生成
 */

import { EIKENLevel } from './eiken-vocabulary-schema';

export interface UserLearningProfile {
  userId: string;
  currentLevel: EIKENLevel;
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'mixed';
  optimalDifficulty: 'easy' | 'medium' | 'hard' | 'mixed';
  peakLearningHour: number; // 0-23
  preferredSessionLength: number; // minutes
  retentionRate: number; // 0-100%
  avgAccuracy: number; // 0-100%
}

export interface AdaptiveQuestion {
  wordId: string;
  difficultyScore: number; // 0-10
  expectedSuccessRate: number; // 0-1
  reviewPriority: number; // 0-10 (higher = more urgent)
  recommendedReviewTime: Date;
  suggestedChoiceFormat: 'similar' | 'context' | 'difficulty' | 'mixed';
}

export interface LearningRecommendation {
  todaysSessions: AdaptiveQuestion[];
  suggestedLearningTime: string; // HH:MM
  estimatedDuration: number; // minutes
  focusArea: string; // 'vocabulary', 'pronunciation', 'pronunciation', 'context'
  motivationalMessage: string;
  nextMilestone: string;
}

/**
 * AI 適応的学習エンジン
 */
export class AdaptiveLearningEngine {
  private userProfile: UserLearningProfile;
  private learningHistory: Array<{
    wordId: string;
    correct: boolean;
    timeSpent: number;
    timestamp: Date;
  }> = [];

  constructor(userId: string) {
    this.userProfile = {
      userId,
      currentLevel: EIKENLevel.GRADE_2,
      learningStyle: 'mixed',
      optimalDifficulty: 'medium',
      peakLearningHour: 19, // 7 PM default
      preferredSessionLength: 30,
      retentionRate: 0,
      avgAccuracy: 0,
    };
  }

  /**
   * ユーザーの学習プロファイルを更新
   */
  updateUserProfile(data: Partial<UserLearningProfile>): void {
    this.userProfile = { ...this.userProfile, ...data };
  }

  /**
   * 学習履歴を記録
   */
  recordLearningActivity(wordId: string, correct: boolean, timeSpent: number): void {
    this.learningHistory.push({
      wordId,
      correct,
      timeSpent,
      timestamp: new Date(),
    });

    // 統計を更新
    this.updateStatistics();
  }

  /**
   * 統計情報を計算
   */
  private updateStatistics(): void {
    if (this.learningHistory.length === 0) return;

    const recentHistory = this.learningHistory.slice(-100); // 最新100件
    const correctCount = recentHistory.filter((h) => h.correct).length;
    const avgAccuracy = (correctCount / recentHistory.length) * 100;

    this.userProfile.avgAccuracy = avgAccuracy;

    // 難度を自動調整
    if (avgAccuracy > 85) {
      this.userProfile.optimalDifficulty = 'hard';
    } else if (avgAccuracy > 70) {
      this.userProfile.optimalDifficulty = 'medium';
    } else {
      this.userProfile.optimalDifficulty = 'easy';
    }

    // 学習スタイルを分析
    this.analyzeLearningstyle();

    // 最適な学習時間を検出
    this.detectPeakLearningHour();
  }

  /**
   * 学習スタイルを分析
   */
  private analyzeLearningstyle(): void {
    if (this.learningHistory.length < 10) return;

    const recent = this.learningHistory.slice(-50);
    const avgTimePerWord = recent.reduce((sum, h) => sum + h.timeSpent, 0) / recent.length;

    // シンプルな分析ロジック
    if (avgTimePerWord < 20) {
      this.userProfile.learningStyle = 'visual';
    } else if (avgTimePerWord > 60) {
      this.userProfile.learningStyle = 'auditory';
    } else {
      this.userProfile.learningStyle = 'kinesthetic';
    }
  }

  /**
   * 最適な学習時間を検出
   */
  private detectPeakLearningHour(): void {
    // 時間帯別の正答率を計算
    const hourlyAccuracy: Record<number, { correct: number; total: number }> = {};

    for (let i = 0; i < 24; i++) {
      hourlyAccuracy[i] = { correct: 0, total: 0 };
    }

    this.learningHistory.forEach((record) => {
      const hour = record.timestamp.getHours();
      hourlyAccuracy[hour].total += 1;
      if (record.correct) {
        hourlyAccuracy[hour].correct += 1;
      }
    });

    // 最も精度が高い時間帯を見つける
    let bestHour = 19;
    let bestAccuracy = 0;

    for (let hour = 0; hour < 24; hour++) {
      if (hourlyAccuracy[hour].total === 0) continue;
      const accuracy = hourlyAccuracy[hour].correct / hourlyAccuracy[hour].total;
      if (accuracy > bestAccuracy) {
        bestAccuracy = accuracy;
        bestHour = hour;
      }
    }

    this.userProfile.peakLearningHour = bestHour;
  }

  /**
   * 推奨される学習セッションを生成
   */
  generateRecommendation(availableWords: any[]): LearningRecommendation {
    // 優先度を計算する
    const adaptiveQuestions = availableWords.map((word) =>
      this.calculateAdaptiveQuestion(word)
    );

    // 優先度でソート
    adaptiveQuestions.sort((a, b) => b.reviewPriority - a.reviewPriority);

    // セッション用に最適な数を選択
    const sessionQuestions = adaptiveQuestions.slice(
      0,
      Math.min(20, Math.ceil(this.userProfile.preferredSessionLength / 1.5))
    );

    // 次のマイルストーンを計算
    const nextMilestone = this.calculateNextMilestone();

    // モチベーショナルメッセージを生成
    const motivationalMessage = this.generateMotivationalMessage();

    return {
      todaysSessions: sessionQuestions,
      suggestedLearningTime: this.getSuggestedLearningTime(),
      estimatedDuration: this.userProfile.preferredSessionLength,
      focusArea: this.determineFocusArea(sessionQuestions),
      motivationalMessage,
      nextMilestone,
    };
  }

  /**
   * 適応的な問題を計算
   */
  private calculateAdaptiveQuestion(word: any): AdaptiveQuestion {
    // ユーザーの過去のパフォーマンスに基づいて難度を決定
    const userAttempts = this.learningHistory.filter((h) => h.wordId === word.id);
    const successRate =
      userAttempts.length === 0
        ? 0.5
        : userAttempts.filter((h) => h.correct).length / userAttempts.length;

    // 難度スコア（0-10）を計算
    const difficultyScore = this.calculateDifficultyScore(word, successRate);

    // 復習の優先度を計算
    const reviewPriority = this.calculateReviewPriority(word, successRate);

    // 推奨される選択肢形式を決定
    const suggestedChoiceFormat = this.decidechoiceFormat(difficultyScore, successRate);

    // 推奨復習時間を計算
    const recommendedReviewTime = this.calculateRecommendedReviewTime(word);

    return {
      wordId: word.id,
      difficultyScore,
      expectedSuccessRate: Math.max(0, successRate + 0.1), // 少し上昇を期待
      reviewPriority,
      recommendedReviewTime,
      suggestedChoiceFormat,
    };
  }

  /**
   * 難度スコアを計算
   */
  private calculateDifficultyScore(word: any, successRate: number): number {
    let score = word.difficulty || 3;

    if (successRate > 0.8) {
      score += 2; // 簡単に思える場合は難度を上げる
    } else if (successRate < 0.3) {
      score -= 1; // 難しすぎる場合は難度を下げる
    }

    return Math.max(0, Math.min(10, score));
  }

  /**
   * 復習優先度を計算
   */
  private calculateReviewPriority(word: any, successRate: number): number {
    // 苦手な単語を優先
    let priority = 5 - successRate * 5;

    // 最後の復習からの経過時間を考慮
    const lastAttempt = this.learningHistory
      .filter((h) => h.wordId === word.id)
      .pop();

    if (lastAttempt) {
      const daysSinceReview =
        (new Date().getTime() - lastAttempt.timestamp.getTime()) / (1000 * 60 * 60 * 24);
      priority += Math.min(5, daysSinceReview);
    }

    return Math.min(10, priority);
  }

  /**
   * 選択肢形式を決定
   */
  private decidechoiceFormat(
    difficulty: number,
    successRate: number
  ): 'similar' | 'context' | 'difficulty' | 'mixed' {
    if (difficulty > 7) return 'difficulty'; // 難しい問題は難度の高い選択肢
    if (successRate < 0.3) return 'similar'; // 苦手な単語は似た選択肢
    if (successRate > 0.7) return 'context'; // 得意な単語はコンテキスト重視
    return 'mixed';
  }

  /**
   * 推奨復習時間を計算
   */
  private calculateRecommendedReviewTime(word: any): Date {
    const lastAttempt = this.learningHistory
      .filter((h) => h.wordId === word.id)
      .pop();

    if (!lastAttempt) {
      // 初回は明日
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow;
    }

    // SM2ベースのスケジュール
    const daysSinceReview =
      (new Date().getTime() - lastAttempt.timestamp.getTime()) / (1000 * 60 * 60 * 24);

    let interval = 1;
    if (daysSinceReview > 3) interval = 3;
    if (daysSinceReview > 7) interval = 7;
    if (daysSinceReview > 14) interval = 14;

    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + interval);
    return nextReview;
  }

  /**
   * 焦点分野を決定
   */
  private determineFocusArea(questions: AdaptiveQuestion[]): string {
    const avgDifficulty = questions.reduce((sum, q) => sum + q.difficultyScore, 0) / questions.length;

    if (avgDifficulty > 7) return '高難度単語の習得';
    if (avgDifficulty < 3) return '基礎語彙の強化';
    if (this.userProfile.learningStyle === 'auditory') return '発音と聞き取り';
    return 'バランス型学習';
  }

  /**
   * 推奨学習時間を取得
   */
  private getSuggestedLearningTime(): string {
    const hour = this.userProfile.peakLearningHour;
    return `${String(hour).padStart(2, '0')}:00`;
  }

  /**
   * 次のマイルストーンを計算
   */
  private calculateNextMilestone(): string {
    const mastered = this.learningHistory.filter(
      (h) => h.correct && this.learningHistory.filter((x) => x.wordId === h.wordId && x.correct).length >= 3
    ).length;

    if (mastered < 100) return `${100 - mastered}単語でレベルアップ`;
    if (mastered < 500) return `${500 - mastered}単語でマスター級`;
    return '最高レベル達成！';
  }

  /**
   * モチベーショナルメッセージを生成
   */
  private generateMotivationalMessage(): string {
    const messages = [
      '今日も頑張ろう！連続学習を続けることで、確実に成長します。',
      'あなたのペースで大丈夫。毎日少しずつ進めることが成功の秘訣です。',
      '最近の学習は素晴らしい！その調子で続けましょう。',
      '新しい単語を学ぶことで、世界が広がります。一緒に進みましょう。',
      '学習は投資です。今の努力が未来を変えます。',
      '難しい問題にぶつかっても、それは成長のチャンス。乗り越えましょう！',
      `あなたは既に${this.learningHistory.length}個の単語に取り組みました。素晴らしい！`,
      '今日の学習目標を達成できたら、自分を褒めてあげてください。',
    ];

    return messages[Math.floor(Math.random() * messages.length)];
  }

  /**
   * 学習効率レポートを生成
   */
  generateEfficiencyReport(): {
    accuracy: number;
    efficiency: number;
    consistency: number;
    recommendation: string;
  } {
    const accuracy = this.userProfile.avgAccuracy;
    const consistency = this.calculateConsistency();
    const efficiency = (accuracy * 0.6 + consistency * 0.4);

    let recommendation = '良い調子です。このペースを続けましょう。';
    if (efficiency > 80) {
      recommendation = 'その調子！あなたは天才的な学習者です。より難しい単語に挑戦してみてください。';
    } else if (efficiency < 50) {
      recommendation = '難度が高すぎるかもしれません。簡単な単語から始め直すことをお勧めします。';
    }

    return {
      accuracy: Math.round(accuracy),
      efficiency: Math.round(efficiency),
      consistency,
      recommendation,
    };
  }

  /**
   * 一貫性を計算（毎日の学習継続度）
   */
  private calculateConsistency(): number {
    if (this.learningHistory.length < 7) return 0;

    // 過去7日間のデータを確認
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const recentHistory = this.learningHistory.filter((h) => h.timestamp > sevenDaysAgo);

    // ユニークな日付数を数える
    const uniqueDays = new Set(
      recentHistory.map((h) => h.timestamp.toDateString())
    ).size;

    return (uniqueDays / 7) * 100;
  }
}

/**
 * グローバル インスタンス
 */
let globalEngine: AdaptiveLearningEngine | null = null;

export function getAdaptiveLearningEngine(userId: string): AdaptiveLearningEngine {
  if (!globalEngine) {
    globalEngine = new AdaptiveLearningEngine(userId);
  }
  return globalEngine;
}

export function resetAdaptiveLearningEngine(): void {
  globalEngine = null;
}
