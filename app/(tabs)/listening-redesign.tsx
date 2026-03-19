/**
 * Listening Screen - 「1画面=1アクション」設計 with Shadoten Design
 * スクロール不要で集中力を維持する学習画面
 * Shadoten-inspired: Teal header, Good Points/Development Points feedback system
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import { useListeningStore } from '@/src/stores/listeningStore';
import { LISTENING_SAMPLE_DATA } from '@/src/lib/listeningData';
import { Colors, Spacing, BorderRadius, DuolingoColors, ShadotenColors, Typography } from '@/constants/theme';
import { CelebrationAnimation } from '@/src/components/CelebrationAnimation';

type Screen = 'list' | 'question' | 'result';

export default function ListeningScreenRedesign() {
  const {
    questions,
    setQuestions,
    hearts,
    currentLevel,
    totalXP,
    xpForNextLevel,
    streakDays,
    dailyGoal,
  } = useListeningStore();

  const [screen, setScreen] = useState<Screen>('list');
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [timeBonus, setTimeBonus] = useState(100);
  const [triggerCelebration, setTriggerCelebration] = useState(false);
  const [celebrationType, setCelebrationType] = useState<'confetti' | 'correct'>('confetti');
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  const playAudio = async (audioUrl: string) => {
    try {
      setIsPlaying(true);
      if (typeof window !== 'undefined') {
        // Web環境: HTML5 Audio API を使用
        if (!audioRef.current) {
          audioRef.current = new Audio(audioUrl);
        }
        audioRef.current.src = audioUrl;
        await audioRef.current.play();
      }
    } catch (error) {
      console.error('❌ 音声再生エラー:', error);
    } finally {
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    if (questions.length === 0) {
      setQuestions(LISTENING_SAMPLE_DATA);
    }
  }, []);

  if (screen === 'list') {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Teal Header */}
          <View style={styles.header}>
            <Text style={styles.title}>🎧 リスニング</Text>
            <Text style={styles.subtitle}>英検準1級 - 会話理解</Text>
          </View>

          {/* Gamification Stats */}
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statEmoji}>❤️</Text>
              <Text style={styles.statValue}>{hearts}/3</Text>
              <Text style={styles.statLabel}>ライフ</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statEmoji}>⭐</Text>
              <Text style={styles.statValue}>Lv{currentLevel}</Text>
              <Text style={styles.statLabel}>レベル</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statEmoji}>🔥</Text>
              <Text style={styles.statValue}>{streakDays}日</Text>
              <Text style={styles.statLabel}>ストリーク</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statEmoji}>🎯</Text>
              <Text style={styles.statValue}>{dailyGoal.completed}/{dailyGoal.target}</Text>
              <Text style={styles.statLabel}>今日</Text>
            </View>
          </View>

          {/* Question List */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>問題を選択</Text>
            {questions.map((q, idx) => (
              <TouchableOpacity
                key={q.id}
                style={styles.listItem}
                onPress={() => setScreen('question')}
              >
                <View style={styles.listItemNumber}>
                  <Text style={styles.listItemNumberText}>Q{idx + 1}</Text>
                </View>
                <View style={styles.listItemContent}>
                  <Text style={styles.listItemTitle}>{q.title}</Text>
                  <Text style={styles.listItemSubtitle}>難易度: {'⭐'.repeat(q.difficulty)}</Text>
                </View>
                <Text style={styles.listItemIcon}>→</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (screen === 'question' && questions.length > 0) {
    const question = questions[0];
    const progress = 10; // 1/10 questions
    const isCorrect = selectedIndex === 0;

    return (
      <SafeAreaView style={styles.container}>
        {/* Celebration Animation */}
        {showResult && isCorrect && (
          <CelebrationAnimation
            type="confetti"
            trigger={showResult && isCorrect}
            onComplete={() => {
              setTimeout(() => setScreen('result'), 500);
            }}
          />
        )}
        {/* Shadoten-style Teal Header with Time Bonus */}
        <View style={styles.tealHeader}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => setScreen('list')}>
              <Text style={styles.headerBackBtn}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Q1 / 10</Text>
          </View>

          {/* Time Bonus Indicator */}
          <View style={styles.timeBonusContainer}>
            <Text style={styles.timeBonusLabel}>⏱️</Text>
            <View style={styles.timeBonusBar}>
              <View style={[styles.timeBonusFill, { width: `${timeBonus}%` }]} />
            </View>
            <Text style={styles.timeBonusText}>{timeBonus}%</Text>
          </View>

          <View style={styles.headerRight}>
            <View style={styles.hearts}>
              {[...Array(3)].map((_, i) => (
                <Text key={i} style={styles.heart}>
                  {i < hearts ? '❤️' : '🤍'}
                </Text>
              ))}
            </View>
            <Text style={styles.headerStat}>Lv.{currentLevel}</Text>
          </View>
        </View>

        {/* Main Content - Large White Card */}
        <View style={styles.questionContainer}>
          {/* Audio Section */}
          <View style={styles.audioSection}>
            <TouchableOpacity
              style={styles.playButton}
              onPress={() => playAudio(question.audioUrl)}
              disabled={isPlaying}
            >
              <Text style={styles.playIcon}>{isPlaying ? '⏸️' : '🔊'}</Text>
            </TouchableOpacity>
            <Text style={styles.audioLabel}>{isPlaying ? '再生中...' : '音声を再生'}</Text>
            <TouchableOpacity
              style={styles.audioActionBtn}
              onPress={() => playAudio(question.audioUrl)}
              disabled={isPlaying}
            >
              <Text style={styles.audioActionText}>{isPlaying ? '停止中' : '遅い速度で再生'}</Text>
            </TouchableOpacity>
          </View>

          {/* Question Text */}
          <View style={styles.questionBox}>
            <Text style={styles.questionLabel}>質問</Text>
            <Text style={styles.questionText}>{question.title}</Text>
          </View>

          {/* Answer Options with Visual Feedback */}
          <View style={styles.optionsSection}>
            {question.choices?.map((option: string, idx: number) => {
              const isSelected = selectedIndex === idx && showResult;
              const isCorrect = idx === question.correctAnswer;

              return (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.optionBtn,
                    isSelected && isCorrect && styles.optionBtnCorrect,
                    isSelected && !isCorrect && styles.optionBtnIncorrect,
                  ]}
                  onPress={() => {
                    setSelectedIndex(idx);
                    setShowResult(true);
                    setTimeout(() => {
                      setScreen('result');
                    }, 1500);
                  }}
                  disabled={showResult}
                >
                  {/* Visual Indicator: Circle (correct) or X (incorrect) */}
                  <View style={styles.optionIndicator}>
                    {isSelected && isCorrect && (
                      <Text style={styles.correctCircle}>⭕</Text>
                    )}
                    {isSelected && !isCorrect && (
                      <Text style={styles.incorrectX}>✕</Text>
                    )}
                    {!isSelected && (
                      <Text style={styles.unselectedCircle}>○</Text>
                    )}
                  </View>
                  <Text style={[
                    styles.optionText,
                    isSelected && { color: '#fff', fontWeight: '600' }
                  ]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Result Feedback - Good Points / Development Points */}
          {showResult && (
            <View style={styles.feedbackSection}>
              {selectedIndex === 0 ? (
                <View style={[styles.feedbackCard, styles.goodPointsCard]}>
                  <Text style={styles.feedbackTitle}>✅ 正解!</Text>
                  <Text style={styles.feedbackSubtitle}>意味を正しく理解できました</Text>
                  <Text style={styles.xpGain}>+10 XP</Text>
                </View>
              ) : (
                <View style={[styles.feedbackCard, styles.developmentPointsCard]}>
                  <Text style={styles.feedbackTitle}>❌ 改善が必要</Text>
                  <Text style={styles.feedbackSubtitle}>もう一度聞いて、意味を確認しましょう</Text>
                  <Text style={styles.xpGain}>+0 XP</Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Navigation */}
        {!showResult && (
          <View style={styles.navBar}>
            <TouchableOpacity
              style={styles.navBtn}
              onPress={() => setScreen('list')}
            >
              <Text style={styles.navBtnText}>戻る</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.navBtn, styles.navBtnDisabled]}
              disabled={true}
            >
              <Text style={styles.navBtnText}>スキップ</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.navBtn, styles.navBtnSubmit]}
              disabled={true}
            >
              <Text style={styles.navBtnText}>提出する</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Celebration Animation on Result Screen */}
      <CelebrationAnimation
        type="confetti"
        trigger={true}
        onComplete={() => {}}
      />

      <View style={styles.resultContainer}>
        <Text style={styles.resultTitle}>✨ 完了!</Text>
        <View style={styles.resultStats}>
          <Text style={styles.resultStat}>正解: 7/10</Text>
          <Text style={styles.resultStat}>+70 XP 獲得</Text>
          <Text style={styles.resultStat}>🔥 連続3日達成!</Text>
        </View>
        <TouchableOpacity
          style={styles.resultBtn}
          onPress={() => {
            setScreen('list');
            setSelectedIndex(null);
            setShowResult(false);
            setTimeBonus(100);
          }}
        >
          <Text style={styles.resultBtnText}>リスニング一覧へ</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ShadotenColors.contentBg,
  },

  // ===== LIST VIEW =====
  header: {
    backgroundColor: ShadotenColors.headerTeal,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
  },

  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: Spacing.sm,
  },

  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },

  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    gap: Spacing.sm,
    backgroundColor: ShadotenColors.contentBg,
  },

  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },

  statEmoji: {
    fontSize: 24,
    marginBottom: Spacing.xs,
  },

  statValue: {
    fontSize: 14,
    fontWeight: '700',
    color: ShadotenColors.textDark,
  },

  statLabel: {
    fontSize: 11,
    color: ShadotenColors.textLight,
    marginTop: Spacing.xs,
    fontWeight: '500',
  },

  section: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: ShadotenColors.textDark,
    marginBottom: Spacing.md,
  },

  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: ShadotenColors.headerTeal,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },

  listItemNumber: {
    backgroundColor: ShadotenColors.headerTeal,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    marginRight: Spacing.md,
  },

  listItemNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  listItemContent: {
    flex: 1,
  },

  listItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: ShadotenColors.textDark,
  },

  listItemSubtitle: {
    fontSize: 12,
    color: ShadotenColors.textLight,
    marginTop: Spacing.xs,
  },

  listItemIcon: {
    fontSize: 16,
    color: ShadotenColors.headerTeal,
    fontWeight: '700',
  },

  // ===== QUESTION VIEW =====
  tealHeader: {
    backgroundColor: ShadotenColors.headerTeal,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    paddingTop: Spacing.md,
  },

  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },

  headerBackBtn: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '700',
  },

  headerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  timeBonusContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.md,
    gap: Spacing.sm,
  },

  timeBonusLabel: {
    fontSize: 12,
  },

  timeBonusBar: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },

  timeBonusFill: {
    height: '100%',
    backgroundColor: ShadotenColors.timeBonus,
    borderRadius: BorderRadius.full,
  },

  timeBonusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    minWidth: 35,
    textAlign: 'right',
  },

  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },

  hearts: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },

  heart: {
    fontSize: 16,
  },

  headerStat: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  questionContainer: {
    flex: 1,
    backgroundColor: ShadotenColors.cardWhite,
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },

  audioSection: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
    paddingBottom: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: ShadotenColors.contentBg,
  },

  playButton: {
    backgroundColor: ShadotenColors.headerTeal,
    borderRadius: BorderRadius.full,
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },

  playIcon: {
    fontSize: 32,
  },

  audioLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: ShadotenColors.textDark,
    marginBottom: Spacing.sm,
  },

  audioActionBtn: {
    backgroundColor: ShadotenColors.contentBg,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.md,
  },

  audioActionText: {
    fontSize: 12,
    color: ShadotenColors.headerTeal,
    fontWeight: '600',
  },

  questionBox: {
    marginBottom: Spacing.lg,
  },

  questionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: ShadotenColors.textLight,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: ShadotenColors.textDark,
    lineHeight: 28,
  },

  optionsSection: {
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },

  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderWidth: 2,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },

  optionBtnCorrect: {
    backgroundColor: ShadotenColors.goodPointsTeal,
    borderColor: ShadotenColors.goodPointsTeal,
  },

  optionBtnIncorrect: {
    backgroundColor: ShadotenColors.developmentPointsRed,
    borderColor: ShadotenColors.developmentPointsRed,
  },

  optionIndicator: {
    marginRight: Spacing.md,
    fontSize: 18,
  },

  correctCircle: {
    fontSize: 16,
    color: ShadotenColors.correctCircle,
    fontWeight: '700',
  },

  incorrectX: {
    fontSize: 16,
    color: ShadotenColors.incorrectX,
    fontWeight: '700',
  },

  unselectedCircle: {
    fontSize: 16,
    color: ShadotenColors.textLight,
  },

  optionText: {
    fontSize: 14,
    fontWeight: '600',
    color: ShadotenColors.textDark,
    flex: 1,
  },

  feedbackSection: {
    marginTop: Spacing.lg,
  },

  feedbackCard: {
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },

  goodPointsCard: {
    backgroundColor: ShadotenColors.goodPointsTeal,
  },

  developmentPointsCard: {
    backgroundColor: ShadotenColors.developmentPointsRed,
  },

  feedbackTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: Spacing.sm,
  },

  feedbackSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: Spacing.md,
    textAlign: 'center',
  },

  xpGain: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  navBar: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },

  navBtn: {
    flex: 1,
    backgroundColor: ShadotenColors.headerTeal,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },

  navBtnDisabled: {
    opacity: 0.5,
  },

  navBtnSubmit: {
    backgroundColor: ShadotenColors.goodPointsTeal,
  },

  navBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // ===== RESULT VIEW =====
  resultContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    backgroundColor: ShadotenColors.contentBg,
  },

  resultTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: ShadotenColors.headerTeal,
    marginBottom: Spacing.lg,
  },

  resultStats: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    borderLeftWidth: 4,
    borderLeftColor: ShadotenColors.headerTeal,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
    marginBottom: Spacing.xl,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },

  resultStat: {
    fontSize: 16,
    fontWeight: '600',
    color: ShadotenColors.textDark,
    marginVertical: Spacing.sm,
  },

  resultBtn: {
    backgroundColor: ShadotenColors.headerTeal,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  resultBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
});
