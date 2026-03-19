/**
 * Writing Screen - 「1画面=1アクション」設計 with Shadoten Design
 * スクロール不要でライティングに集中
 * Shadoten-inspired: Teal header, Good Points/Development Points feedback
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import { useWritingStore } from '@/src/stores/writingStore';
import { WRITING_SAMPLE_PROMPTS } from '@/src/lib/writingData';
import { Colors, Spacing, BorderRadius, DuolingoColors, ShadotenColors } from '@/constants/theme';
import { CelebrationAnimation } from '@/src/components/CelebrationAnimation';

type Screen = 'select' | 'edit' | 'result';

export default function WritingScreenRedesign() {
  const {
    prompts,
    setPrompts,
    hearts,
    currentLevel,
    totalXP,
    xpForNextLevel,
    streakDays,
    dailyGoal,
  } = useWritingStore();

  const [screen, setScreen] = useState<Screen>('select');
  const [currentPromptIdx, setCurrentPromptIdx] = useState(0);
  const [content, setContent] = useState('');
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (prompts.length === 0) {
      setPrompts(WRITING_SAMPLE_PROMPTS.slice(0, 10));
    }
  }, []);

  if (screen === 'select') {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Teal Header */}
          <View style={styles.header}>
            <Text style={styles.title}>✍️ ライティング</Text>
            <Text style={styles.subtitle}>英検準1級 - 提出済み: 12/20</Text>
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

          {/* プロンプト選択 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>プロンプトを選択</Text>
            {prompts.map((prompt, idx) => (
              <TouchableOpacity
                key={prompt.id}
                style={styles.promptCard}
                onPress={() => {
                  setCurrentPromptIdx(idx);
                  setContent('');
                  setScreen('edit');
                }}
              >
                <View style={styles.promptHeader}>
                  <Text style={styles.promptTitle}>{prompt.title}</Text>
                  <Text style={styles.promptXp}>+{50 + idx * 10} XP</Text>
                </View>
                <View style={styles.promptFooter}>
                  <Text style={styles.promptDifficulty}>難易度: {'⭐'.repeat(prompt.difficulty)}</Text>
                  <Text style={styles.promptArrow}>→</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (screen === 'edit' && prompts.length > 0) {
    const prompt = prompts[currentPromptIdx];
    const wordCount = content.trim().split(/\s+/).length;
    const progress = Math.min((wordCount / 200) * 100, 100);

    return (
      <SafeAreaView style={styles.container}>
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

        {/* プロンプト */}
        <View style={styles.promptBox}>
          <Text style={styles.promptQuestion}>{prompt.title}</Text>
          <Text style={styles.promptInstruction}>150-200単語で答えてください</Text>
        </View>

        {/* 入力エリア */}
        <View style={styles.editorContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="ここに英文を入力..."
            placeholderTextColor={Colors.light.textTertiary}
            multiline
            value={content}
            onChangeText={setContent}
          />

          {/* 文字数表示 */}
          <View style={styles.wordCountBar}>
            <View style={[styles.wordCountFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.wordCountText}>{wordCount} / 200 単語</Text>
        </View>

        {/* ナビゲーション */}
        <View style={styles.navBar}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => setScreen('select')}
          >
            <Text style={styles.backBtnText}>← 戻る</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.submitBtn, content.trim().length < 50 && styles.submitBtnDisabled]}
            onPress={() => {
              // AI採点シミュレーション
              const simScore = Math.floor(Math.random() * 8) + 8;
              setScore(simScore);
              setScreen('result');
            }}
            disabled={content.trim().length < 50}
          >
            <Text style={styles.submitBtnText}>📤 提出</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.resultContainer}>
        {/* スコア表示 */}
        <Text style={styles.resultTitle}>採点完了</Text>

        <View style={styles.scoreBox}>
          <Text style={styles.scoreBig}>{score}/16</Text>
          <Text style={styles.scoreLabel}>得点</Text>
        </View>

        {/* スコア詳細 */}
        <View style={styles.scoreDetails}>
          <View style={styles.scoreItem}>
            <Text style={styles.scoreItemLabel}>内容</Text>
            <Text style={styles.scoreItemValue}>⭐⭐⭐⭐⭐</Text>
          </View>
          <View style={styles.scoreItem}>
            <Text style={styles.scoreItemLabel}>構成</Text>
            <Text style={styles.scoreItemValue}>⭐⭐⭐⭐☆</Text>
          </View>
          <View style={styles.scoreItem}>
            <Text style={styles.scoreItemLabel}>単語</Text>
            <Text style={styles.scoreItemValue}>⭐⭐⭐⭐⭐</Text>
          </View>
          <View style={styles.scoreItem}>
            <Text style={styles.scoreItemLabel}>文法</Text>
            <Text style={styles.scoreItemValue}>⭐⭐⭐⭐☆</Text>
          </View>
        </View>

        {/* XP獲得表示 */}
        <View style={styles.xpBox}>
          <Text style={styles.xpText}>🎉 +{(score / 16) * 100} XP 獲得</Text>
        </View>

        {/* ボタン */}
        <TouchableOpacity
          style={styles.resultBtn}
          onPress={() => {
            setScreen('select');
            setContent('');
            setScore(0);
          }}
        >
          <Text style={styles.resultBtnText}>別のプロンプトへ</Text>
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

  // ===== SELECT VIEW =====
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

  promptCard: {
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

  promptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },

  promptTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: ShadotenColors.textDark,
    flex: 1,
  },

  promptXp: {
    fontSize: 12,
    fontWeight: '700',
    color: ShadotenColors.timeBonus,
  },

  promptFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  promptDifficulty: {
    fontSize: 12,
    color: ShadotenColors.textLight,
  },

  promptArrow: {
    fontSize: 16,
    color: ShadotenColors.headerTeal,
    fontWeight: '700',
  },

  // ===== EDIT VIEW =====
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

  promptBox: {
    backgroundColor: ShadotenColors.cardWhite,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderLeftWidth: 4,
    borderLeftColor: ShadotenColors.headerTeal,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },

  promptQuestion: {
    fontSize: 16,
    fontWeight: '700',
    color: ShadotenColors.textDark,
    marginBottom: Spacing.sm,
  },

  promptInstruction: {
    fontSize: 12,
    color: ShadotenColors.textLight,
  },

  editorContainer: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },

  textInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: 16,
    color: ShadotenColors.textDark,
    textAlignVertical: 'top',
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: ShadotenColors.contentBg,
  },

  wordCountBar: {
    height: 6,
    backgroundColor: ShadotenColors.contentBg,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },

  wordCountFill: {
    height: '100%',
    backgroundColor: ShadotenColors.headerTeal,
  },

  wordCountText: {
    fontSize: 12,
    color: ShadotenColors.textLight,
    textAlign: 'center',
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

  submitBtn: {
    flex: 1,
    backgroundColor: ShadotenColors.headerTeal,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },

  submitBtnDisabled: {
    opacity: 0.4,
  },

  submitBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },

  // ===== RESULT VIEW =====
  resultContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    backgroundColor: ShadotenColors.contentBg,
  },

  resultTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: ShadotenColors.headerTeal,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },

  scoreBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    borderTopWidth: 4,
    borderTopColor: ShadotenColors.goodPointsTeal,
    paddingVertical: Spacing.xl,
    marginBottom: Spacing.lg,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },

  scoreBig: {
    fontSize: 48,
    fontWeight: '800',
    color: ShadotenColors.goodPointsTeal,
  },

  scoreLabel: {
    fontSize: 14,
    color: ShadotenColors.textLight,
    marginTop: Spacing.sm,
  },

  scoreDetails: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    borderLeftWidth: 4,
    borderLeftColor: ShadotenColors.headerTeal,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },

  scoreItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
  },

  scoreItemLabel: {
    fontSize: 14,
    color: ShadotenColors.textDark,
    fontWeight: '600',
  },

  scoreItemValue: {
    fontSize: 14,
    color: ShadotenColors.timeBonus,
  },

  xpBox: {
    backgroundColor: ShadotenColors.headerTeal,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.lg,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  xpText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },

  resultBtn: {
    backgroundColor: ShadotenColors.headerTeal,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
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
