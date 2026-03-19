/**
 * Demo Screen - 「1画面=1アクション」設計
 * スクロール不要で集中力を維持するゲーミフィケーション UI
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Colors, Spacing, BorderRadius, DuolingoColors, NaturalColors } from '@/constants/theme';
import { useAuthStore } from '@/src/stores/authStore';

const { width, height } = Dimensions.get('window');

export default function DemoScreen() {
  const [selectedRole, setSelectedRole] = useState<'student' | 'teacher' | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [streak, setStreak] = useState(7);
  const [combo, setCombo] = useState(0);
  const [showResult, setShowResult] = useState<'correct' | 'incorrect' | null>(null);

  // ロール選択ハンドラ
  const handleSelectRole = (role: 'student' | 'teacher') => {
    useAuthStore.setState({ role });
    setSelectedRole(role);
  };

  const questions = [
    { word: 'FLOURISH', meaning: '繁栄する', options: ['花を咲かせる', '繁栄する', '衰える', '枯れる'], correct: 1 },
    { word: 'AUDACIOUS', meaning: '大胆な', options: ['静か', '大胆な', '臆病な', '慎重な'], correct: 1 },
    { word: 'SERENE', meaning: '穏やかな', options: ['激しい', '穏やかな', '不安な', '混乱した'], correct: 1 },
    { word: 'BENEVOLENT', meaning: '慈善的な', options: ['悪意のある', '慈善的な', '無関心な', '冷酷な'], correct: 1 },
    { word: 'EPHEMERAL', meaning: 'はかない', options: ['永遠の', 'はかない', '堅い', '固い'], correct: 1 },
  ];

  const question = questions[currentQuestion];
  const totalQuestions = questions.length;
  const progress = ((currentQuestion + 1) / totalQuestions) * 100;

  const handleAnswer = (selectedIndex: number) => {
    const isCorrect = selectedIndex === question.correct;
    setShowResult(isCorrect ? 'correct' : 'incorrect');

    setTimeout(() => {
      if (isCorrect) {
        setXp(xp + 10);
        setCombo(combo + 1);
        if (combo + 1 >= 3) {
          setLevel(level + 1);
          setCombo(0);
        }
      } else {
        setHearts(Math.max(0, hearts - 1));
        setCombo(0);
      }

      if (currentQuestion < totalQuestions - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setShowResult(null);
      } else {
        // ゲーム終了画面へ
      }
    }, 1500);
  };

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setShowResult(null);
    }
  };

  const handleReset = () => {
    setCurrentQuestion(0);
    setHearts(3);
    setXp(0);
    setLevel(1);
    setStreak(7);
    setCombo(0);
    setShowResult(null);
  };

  // ロール選択画面
  if (!selectedRole) {
    return (
      <SafeAreaView style={styles.roleSelectContainer}>
        <View style={styles.roleSelectContent}>
          {/* ヘッダー */}
          <Text style={styles.roleSelectTitle}>🧪 デモモード</Text>
          <Text style={styles.roleSelectSubtitle}>
            どのロールでテストしますか？
          </Text>

          {/* Student ボタン */}
          <TouchableOpacity
            style={[styles.roleButton, styles.studentButton]}
            onPress={() => handleSelectRole('student')}
          >
            <Text style={styles.roleButtonEmoji}>🎓</Text>
            <View style={styles.roleButtonContent}>
              <Text style={styles.roleButtonTitle}>生徒として開始</Text>
              <Text style={styles.roleButtonDesc}>
                リスニング、単語、ライティング学習
              </Text>
            </View>
            <Text style={styles.roleButtonArrow}>→</Text>
          </TouchableOpacity>

          {/* Teacher ボタン */}
          <TouchableOpacity
            style={[styles.roleButton, styles.teacherButton]}
            onPress={() => handleSelectRole('teacher')}
          >
            <Text style={styles.roleButtonEmoji}>👨‍🏫</Text>
            <View style={styles.roleButtonContent}>
              <Text style={styles.roleButtonTitle}>講師として開始</Text>
              <Text style={styles.roleButtonDesc}>
                学生管理、成績分析ダッシュボード
              </Text>
            </View>
            <Text style={styles.roleButtonArrow}>→</Text>
          </TouchableOpacity>

          {/* 説明 */}
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              💡 切り替えたい場合は、画面を再読込してください
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // デモゲーム画面
  return (
    <SafeAreaView style={[styles.container, showResult === 'correct' && { backgroundColor: DuolingoColors.success + '15' }, showResult === 'incorrect' && { backgroundColor: DuolingoColors.error + '15' }]}>
      {/* ===== 上部：ゲーミフィケーション情報 ===== */}
      <View style={styles.topBar}>
        {/* ハート */}
        <View style={styles.hearts}>
          {[...Array(3)].map((_, i) => (
            <Text key={i} style={styles.heart}>
              {i < hearts ? '❤️' : '🤍'}
            </Text>
          ))}
        </View>

        {/* レベル＆XP */}
        <View style={styles.levelXp}>
          <Text style={styles.levelText}>⭐ Lv.{level}</Text>
          <Text style={styles.xpText}>+{xp} XP</Text>
        </View>

        {/* ストリーク */}
        <View style={styles.streak}>
          <Text style={styles.streakEmoji}>🔥</Text>
          <Text style={styles.streakText}>{streak}</Text>
        </View>
      </View>

      {/* ===== 進捗バー ===== */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {currentQuestion + 1} / {totalQuestions}
        </Text>
      </View>

      {/* ===== 中央：問題表示（スクロール不要） ===== */}
      <View style={styles.questionArea}>
        {/* 単語 */}
        <View style={styles.wordBox}>
          <Text style={styles.word}>{question.word}</Text>
          <Text style={styles.meaning}>{question.meaning}</Text>
        </View>

        {/* コンボ表示 */}
        {combo > 1 && (
          <View style={styles.comboBox}>
            <Text style={styles.comboText}>🔥 {combo} Combo!</Text>
          </View>
        )}

        {/* 結果フィードバック */}
        {showResult && (
          <View
            style={[
              styles.resultBox,
              showResult === 'correct'
                ? { backgroundColor: DuolingoColors.success }
                : { backgroundColor: DuolingoColors.error },
            ]}
          >
            <Text style={styles.resultText}>
              {showResult === 'correct' ? '✅ 正解!' : '❌ 不正解'}
            </Text>
            {showResult === 'correct' && (
              <Text style={styles.xpGainText}>+10 XP</Text>
            )}
          </View>
        )}
      </View>

      {/* ===== 下部：選択肢（4択） ===== */}
      <View style={styles.optionsArea}>
        {question.options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.optionButton,
              showResult === 'correct' && index === question.correct
                ? { ...styles.optionButtonCorrect }
                : showResult === 'incorrect' && index === question.correct
                ? { ...styles.optionButtonCorrect }
                : {},
            ]}
            onPress={() => handleAnswer(index)}
            disabled={showResult !== null}
          >
            <Text
              style={[
                styles.optionText,
                showResult === 'correct' && index === question.correct
                  ? { color: '#fff' }
                  : showResult === 'incorrect' && index === question.correct
                  ? { color: '#fff' }
                  : {},
              ]}
            >
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ===== 底部：ナビゲーション ===== */}
      <View style={styles.navBar}>
        <TouchableOpacity
          style={[styles.navButton, currentQuestion === 0 && styles.navButtonDisabled]}
          onPress={handlePrev}
          disabled={currentQuestion === 0}
        >
          <Text style={styles.navButtonText}>← 戻る</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.resetButton}
          onPress={handleReset}
        >
          <Text style={styles.resetButtonText}>🔄 リセット</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navButton, showResult === null && styles.navButtonDisabled]}
          onPress={() => {
            if (currentQuestion < totalQuestions - 1) {
              setCurrentQuestion(currentQuestion + 1);
              setShowResult(null);
            }
          }}
          disabled={showResult === null}
        >
          <Text style={styles.navButtonText}>次へ →</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // ===== ロール選択画面 =====
  roleSelectContainer: {
    flex: 1,
    backgroundColor: NaturalColors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },

  roleSelectContent: {
    width: '100%',
    maxWidth: 400,
    paddingHorizontal: Spacing.xl,
  },

  roleSelectTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: NaturalColors.textDark,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },

  roleSelectSubtitle: {
    fontSize: 16,
    color: NaturalColors.textMedium,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    fontWeight: '500',
  },

  roleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },

  studentButton: {
    backgroundColor: 'rgba(82, 168, 118, 0.1)',
    borderColor: '#52A876',
  },

  teacherButton: {
    backgroundColor: 'rgba(27, 155, 164, 0.1)',
    borderColor: NaturalColors.primary,
  },

  roleButtonEmoji: {
    fontSize: 40,
    marginRight: Spacing.lg,
  },

  roleButtonContent: {
    flex: 1,
  },

  roleButtonTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: NaturalColors.textDark,
    marginBottom: Spacing.xs,
  },

  roleButtonDesc: {
    fontSize: 13,
    color: NaturalColors.textMedium,
    fontWeight: '500',
  },

  roleButtonArrow: {
    fontSize: 24,
    color: NaturalColors.textMedium,
    marginLeft: Spacing.md,
  },

  infoBox: {
    backgroundColor: 'rgba(90, 146, 165, 0.1)',
    borderLeftWidth: 4,
    borderLeftColor: '#5A92A5',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.xl,
  },

  infoText: {
    fontSize: 13,
    color: '#5A92A5',
    fontWeight: '500',
  },

  // ===== デモゲーム画面 =====
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
  },

  // ===== 上部：ゲーミフィケーション =====
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },

  hearts: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },

  heart: {
    fontSize: 24,
  },

  levelXp: {
    alignItems: 'center',
    flex: 1,
  },

  levelText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.text,
  },

  xpText: {
    fontSize: 12,
    color: DuolingoColors.accent,
    fontWeight: '600',
    marginTop: 2,
  },

  streak: {
    alignItems: 'center',
  },

  streakEmoji: {
    fontSize: 20,
  },

  streakText: {
    fontSize: 14,
    fontWeight: '700',
    color: DuolingoColors.streak,
  },

  // ===== 進捗バー =====
  progressContainer: {
    paddingVertical: Spacing.md,
  },

  progressBar: {
    height: 6,
    backgroundColor: Colors.light.backgroundAlt,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },

  progressFill: {
    height: '100%',
    backgroundColor: DuolingoColors.success,
    borderRadius: BorderRadius.full,
  },

  progressText: {
    fontSize: 12,
    color: Colors.light.textTertiary,
    textAlign: 'center',
  },

  // ===== 中央：問題エリア =====
  questionArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },

  wordBox: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },

  word: {
    fontSize: 48,
    fontWeight: '800',
    color: DuolingoColors.primary,
    marginBottom: Spacing.md,
    letterSpacing: 2,
  },

  meaning: {
    fontSize: 20,
    color: Colors.light.textSecondary,
    fontWeight: '500',
  },

  comboBox: {
    backgroundColor: DuolingoColors.combo,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.lg,
  },

  comboText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },

  resultBox: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },

  resultText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },

  xpGainText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginTop: Spacing.sm,
  },

  // ===== 下部：選択肢 =====
  optionsArea: {
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },

  optionButton: {
    backgroundColor: DuolingoColors.lightBg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: DuolingoColors.primary,
    alignItems: 'center',
  },

  optionButtonCorrect: {
    backgroundColor: DuolingoColors.success,
    borderColor: DuolingoColors.success,
  },

  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },

  // ===== ナビゲーション =====
  navBar: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingBottom: Spacing.lg,
    paddingTop: Spacing.md,
  },

  navButton: {
    flex: 1,
    backgroundColor: DuolingoColors.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },

  navButtonDisabled: {
    opacity: 0.4,
  },

  navButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },

  resetButton: {
    flex: 1,
    backgroundColor: DuolingoColors.warning,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },

  resetButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
  },
});
