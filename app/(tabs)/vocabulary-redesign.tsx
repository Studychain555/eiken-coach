/**
 * Vocabulary Screen - 「1画面=1アクション」設計 with Shadoten Design
 * スクロール不要で単語学習に集中
 * Shadoten-inspired: Teal header, Good Points/Development Points feedback
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useVocabularyStore } from '@/src/stores/vocabularyStore';
import { VOCABULARY_SAMPLE_DATA } from '@/src/lib/vocabularyData';
import { Colors, Spacing, BorderRadius, DuolingoColors, ShadotenColors } from '@/constants/theme';

type Screen = 'stage' | 'test' | 'result';

export default function VocabularyScreenRedesign() {
  const {
    words,
    setWords,
    hearts,
    currentLevel,
    totalXP,
    xpForNextLevel,
    streakDays,
    dailyGoal,
  } = useVocabularyStore();

  const [screen, setScreen] = useState<Screen>('stage');
  const [currentWordIdx, setCurrentWordIdx] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    if (words.length === 0) {
      setWords(VOCABULARY_SAMPLE_DATA.slice(0, 20));
    }
  }, []);

  if (screen === 'stage') {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Teal Header */}
          <View style={styles.header}>
            <Text style={styles.title}>📚 英単語</Text>
            <Text style={styles.subtitle}>2000単語習得へ - 1,450/2,000 完了</Text>
          </View>

          {/* ゲーミフィケーション統計 */}
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statEmoji}>❤️</Text>
              <Text style={styles.statValue}>{hearts}/3</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statEmoji}>⭐</Text>
              <Text style={styles.statValue}>Lv{currentLevel}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statEmoji}>🔥</Text>
              <Text style={styles.statValue}>{streakDays}日</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statEmoji}>🎯</Text>
              <Text style={styles.statValue}>{dailyGoal.completed}/{dailyGoal.target}</Text>
            </View>
          </View>

          {/* ユニット選択 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ユニットを選択</Text>
            {[1, 2, 3, 4, 5].map((unit) => (
              <TouchableOpacity
                key={unit}
                style={styles.unitCard}
                onPress={() => {
                  setCurrentWordIdx(0);
                  setScreen('test');
                }}
              >
                <View>
                  <Text style={styles.unitTitle}>Unit {unit}</Text>
                  <Text style={styles.unitSubtitle}>50単語 / {50 * (unit - 1) + 50}完了</Text>
                </View>
                <Text style={styles.unitXp}>+500 XP</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (screen === 'test' && words.length > 0) {
    const word = words[currentWordIdx];
    const progress = ((currentWordIdx + 1) / words.length) * 100;

    return (
      <SafeAreaView style={[styles.container, showResult && { backgroundColor: selectedIndex === 0 ? DuolingoColors.success + '15' : DuolingoColors.error + '15' }]}>
        {/* 上部：ゲーミフィケーション */}
        <View style={styles.topBar}>
          <View style={styles.hearts}>
            {[...Array(3)].map((_, i) => (
              <Text key={i} style={styles.heart}>
                {i < hearts ? '❤️' : '🤍'}
              </Text>
            ))}
          </View>
          <Text style={styles.level}>⭐ Lv.{currentLevel}</Text>
          <Text style={styles.streak}>🔥 {streakDays}</Text>
        </View>

        {/* 進捗 */}
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>{currentWordIdx + 1}/{words.length}</Text>

        {/* 中央：単語 */}
        <View style={styles.wordContainer}>
          <View style={styles.wordBox}>
            <Text style={styles.word}>{word.english}</Text>
            <Text style={styles.pronunciation}>{word.pronunciation}</Text>
          </View>

          {/* 結果フィードバック */}
          {showResult && (
            <View
              style={[
                styles.resultFeedback,
                selectedIndex === 0
                  ? { backgroundColor: DuolingoColors.success }
                  : { backgroundColor: DuolingoColors.error },
              ]}
            >
              <Text style={styles.resultText}>
                {selectedIndex === 0 ? '✅ 正解！' : '❌ 不正解'}
              </Text>
              {selectedIndex === 0 && <Text style={styles.xpText}>+10 XP</Text>}
            </View>
          )}
        </View>

        {/* 下部：選択肢 */}
        <View style={styles.optionsContainer}>
          {word.options?.map((option, idx) => (
            <TouchableOpacity
              key={idx}
              style={[
                styles.optionBtn,
                selectedIndex === idx && showResult
                  ? {
                      backgroundColor: idx === 0 ? DuolingoColors.success : DuolingoColors.error,
                      borderColor: idx === 0 ? DuolingoColors.success : DuolingoColors.error,
                    }
                  : {},
              ]}
              onPress={() => {
                setSelectedIndex(idx);
                setShowResult(true);
                setTimeout(() => {
                  if (currentWordIdx < words.length - 1) {
                    setCurrentWordIdx(currentWordIdx + 1);
                    setSelectedIndex(null);
                    setShowResult(false);
                  } else {
                    setScreen('result');
                  }
                }, 1500);
              }}
              disabled={showResult}
            >
              <Text style={[styles.optionText, selectedIndex === idx && showResult && { color: '#fff' }]}>
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ナビゲーション */}
        <View style={styles.navBar}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => setScreen('stage')}
          >
            <Text style={styles.backBtnText}>← 戻る</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.nextBtn, !showResult && styles.nextBtnDisabled]}
            disabled={!showResult}
          >
            <Text style={styles.nextBtnText}>次へ →</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.resultContainer}>
        <Text style={styles.resultTitle}>✅ 完了！</Text>
        <View style={styles.resultStats}>
          <Text style={styles.resultStat}>正解: {Math.floor(words.length * 0.8)}/{words.length}</Text>
          <Text style={styles.resultStat}>+{words.length * 10} XP 獲得</Text>
          <Text style={styles.resultStat}>習熟度: ▰▰▰▱ (3/4)</Text>
        </View>
        <TouchableOpacity
          style={styles.resultBtn}
          onPress={() => {
            setScreen('stage');
            setCurrentWordIdx(0);
            setSelectedIndex(null);
            setShowResult(false);
          }}
        >
          <Text style={styles.resultBtnText}>単語一覧へ</Text>
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

  // ===== STAGE SELECT =====
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

  unitCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.md,
    borderLeftWidth: 5,
    borderLeftColor: ShadotenColors.headerTeal,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },

  unitTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: ShadotenColors.textDark,
  },

  unitSubtitle: {
    fontSize: 12,
    color: ShadotenColors.textLight,
    marginTop: Spacing.xs,
  },

  unitXp: {
    fontSize: 14,
    fontWeight: '700',
    color: ShadotenColors.timeBonus,
  },

  // ===== TEST VIEW =====
  topBar: {
    backgroundColor: ShadotenColors.headerTeal,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },

  hearts: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },

  heart: {
    fontSize: 16,
  },

  level: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  streak: {
    fontSize: 12,
    fontWeight: '700',
    color: ShadotenColors.timeBonus,
  },

  progressBar: {
    height: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    backgroundColor: ShadotenColors.goodPointsTeal,
  },

  progressText: {
    fontSize: 12,
    color: ShadotenColors.textLight,
    textAlign: 'center',
  },

  wordContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
  },

  wordBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
    alignItems: 'center',
    marginBottom: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },

  word: {
    fontSize: 36,
    fontWeight: '800',
    color: ShadotenColors.headerTeal,
    marginBottom: Spacing.md,
  },

  pronunciation: {
    fontSize: 14,
    color: ShadotenColors.textLight,
    fontStyle: 'italic',
  },

  resultFeedback: {
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },

  resultText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },

  xpText: {
    fontSize: 14,
    color: '#fff',
    marginTop: Spacing.sm,
  },

  optionsContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    gap: Spacing.md,
  },

  optionBtn: {
    backgroundColor: ShadotenColors.contentBg,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: ShadotenColors.textLight,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },

  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: ShadotenColors.textDark,
  },

  navBar: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },

  backBtn: {
    flex: 1,
    backgroundColor: ShadotenColors.contentBg,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: ShadotenColors.headerTeal,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },

  backBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: ShadotenColors.headerTeal,
  },

  nextBtn: {
    flex: 1,
    backgroundColor: ShadotenColors.headerTeal,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },

  nextBtnDisabled: {
    opacity: 0.4,
  },

  nextBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
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
    borderLeftWidth: 5,
    borderLeftColor: ShadotenColors.headerTeal,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.06)',
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
    color: '#fff',
    textAlign: 'center',
  },
});
