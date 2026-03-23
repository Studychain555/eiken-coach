/**
 * Shadowing Tutorial - Shadoten Design
 * シャドーイング学習法の説明・チュートリアル画面
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Spacing, BorderRadius, ShadotenColors } from '@/constants/theme';

const { width } = Dimensions.get('window');

type TutorialStep = 'intro' | 'what' | 'benefits' | 'flow' | 'ready';

interface StepContent {
  title: string;
  description: string;
  icon: string;
  details: string[];
}

const TUTORIAL_STEPS: Record<TutorialStep, StepContent> = {
  intro: {
    title: 'シャドーイングへようこそ',
    description: '英語リスニング力を最短で伸ばす、最強の学習法を紹介します',
    icon: '🎧',
    details: [],
  },
  what: {
    title: 'シャドーイングとは？',
    description: '音声を聞きながら、同時に口で繰り返す学習法です',
    icon: '📢',
    details: [
      '✓ 英語の音声を聞く',
      '✓ 少し遅れて、同じ内容を口で繰り返す',
      '✓ スクリプトを見ずに行う（重要！）',
      '✓ 繰り返す',
    ],
  },
  benefits: {
    title: 'シャドーイングのメリット',
    description: 'なぜシャドーイングが効果的なのか？',
    icon: '⭐',
    details: [
      '🎯 リスニング力が飛躍的に向上',
      '🗣️ 発音・イントネーションが改善',
      '⚡ 英語のリズム感を習得',
      '🧠 スピーキング力も同時に上達',
      '💪 短期間で実力が付く',
    ],
  },
  flow: {
    title: 'EigoMasterでの学習の流れ',
    description: '3ステップで効率的に学習できます',
    icon: '📖',
    details: [
      '1️⃣ 音声再生 → 意味理解',
      '   リスニング問題で内容を確認',
      '',
      '2️⃣ シャドーイング練習',
      '   音声を聞きながら繰り返す',
      '',
      '3️⃣ フィードバック確認',
      '   発音・リズムの改善点をチェック',
    ],
  },
  ready: {
    title: '準備完了！',
    description: 'これからシャドーイングで、英語力を爆上げしよう！',
    icon: '🚀',
    details: [
      '毎日少しずつ続けることが大切',
      '最初は遅い速度から始めても OK',
      'シャドーイングは必ず上達します',
      '楽しみながら学習しましょう！',
    ],
  },
};

const STEP_ORDER: TutorialStep[] = ['intro', 'what', 'benefits', 'flow', 'ready'];

export default function ShadowingTutorial() {
  const router = useRouter();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const currentStep = STEP_ORDER[currentStepIndex];
  const stepContent = TUTORIAL_STEPS[currentStep];
  const totalSteps = STEP_ORDER.length;
  const progressPercent = ((currentStepIndex + 1) / totalSteps) * 100;

  const handleNext = () => {
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleRegister = () => {
    router.push('/(auth)/register');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Teal Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>シャドーイング入門</Text>
        <Text style={styles.headerSubtitle}>
          {currentStepIndex + 1} / {totalSteps}
        </Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
        </View>
      </View>

      {/* Main Content */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Icon */}
        <Text style={styles.icon}>{stepContent.icon}</Text>

        {/* Title */}
        <Text style={styles.title}>{stepContent.title}</Text>

        {/* Description */}
        <Text style={styles.description}>{stepContent.description}</Text>

        {/* Details Card */}
        {stepContent.details.length > 0 && (
          <View style={styles.detailsCard}>
            {stepContent.details.map((detail, idx) => (
              <View key={idx} style={styles.detailItem}>
                <Text style={styles.detailText}>{detail}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Special Content for each step */}
        {currentStep === 'intro' && (
          <View style={styles.introContent}>
            <View style={styles.featureBox}>
              <Text style={styles.featureTitle}>🎯 このアプリの特徴</Text>
              <Text style={styles.featureText}>
                • AIが発音をリアルタイムで評価{'\n'}
                • プロの講師による詳しい解説{'\n'}
                • 段階的なレベル調整{'\n'}
                • 毎日の学習記録
              </Text>
            </View>
          </View>
        )}

        {currentStep === 'ready' && (
          <View style={styles.readyContent}>
            <View style={styles.tipsCard}>
              <Text style={styles.tipsTitle}>💡 シャドーイングのコツ</Text>
              <Text style={styles.tipText}>
                • 完璧を目指さない{'\n'}
                • 継続が最も大切{'\n'}
                • 楽しむことを優先{'\n'}
                • 定期的に復習する
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Navigation Buttons */}
      <View style={styles.navContainer}>
        {currentStepIndex === STEP_ORDER.length - 1 ? (
          <View style={styles.registerSection}>
            <TouchableOpacity
              style={styles.registerBtn}
              onPress={handleRegister}
              activeOpacity={0.8}
            >
              <Text style={styles.registerBtnText}>登録する</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.skipBtn}
              onPress={() => router.push('/(auth)/login')}
              activeOpacity={0.8}
            >
              <Text style={styles.skipBtnText}>ログイン</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[
                styles.navBtn,
                currentStepIndex === 0 && styles.navBtnDisabled,
              ]}
              onPress={handlePrev}
              disabled={currentStepIndex === 0}
              activeOpacity={0.7}
            >
              <Text style={styles.navBtnText}>← 戻る</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.nextBtn}
              onPress={handleNext}
              activeOpacity={0.8}
            >
              <Text style={styles.nextBtnText}>次へ →</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ShadotenColors.contentBg,
  },

  // Header
  header: {
    backgroundColor: ShadotenColors.headerTeal,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  headerSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.lg,
  },

  // Progress Bar
  progressContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },

  progressBar: {
    height: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    backgroundColor: ShadotenColors.headerTeal,
    borderRadius: BorderRadius.full,
  },

  // Content
  content: {
    flex: 1,
  },

  contentContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
  },

  icon: {
    fontSize: 80,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },

  title: {
    fontSize: 28,
    fontWeight: '800',
    color: ShadotenColors.textDark,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },

  description: {
    fontSize: 16,
    fontWeight: '600',
    color: ShadotenColors.textLight,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: 24,
  },

  // Details Card
  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    borderLeftWidth: 4,
    borderLeftColor: ShadotenColors.headerTeal,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },

  detailItem: {
    marginBottom: Spacing.sm,
    paddingVertical: Spacing.sm,
  },

  detailText: {
    fontSize: 15,
    fontWeight: '500',
    color: ShadotenColors.textDark,
    lineHeight: 24,
  },

  // Intro Content
  introContent: {
    marginTop: Spacing.lg,
  },

  featureBox: {
    backgroundColor: ShadotenColors.goodPointsTeal,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },

  featureTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: Spacing.md,
  },

  featureText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.95)',
    lineHeight: 24,
  },

  // Ready Content
  readyContent: {
    marginTop: Spacing.lg,
  },

  tipsCard: {
    backgroundColor: ShadotenColors.timeBonus,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },

  tipsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333333',
    marginBottom: Spacing.md,
  },

  tipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
    lineHeight: 24,
  },

  // Navigation
  navContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.06)',
    backgroundColor: '#FFFFFF',
  },

  buttonRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },

  navBtn: {
    flex: 1,
    backgroundColor: ShadotenColors.contentBg,
    borderWidth: 2,
    borderColor: ShadotenColors.headerTeal,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },

  navBtnDisabled: {
    opacity: 0.5,
  },

  navBtnText: {
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  nextBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Register Section
  registerSection: {
    gap: Spacing.md,
  },

  registerBtn: {
    backgroundColor: ShadotenColors.headerTeal,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },

  registerBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  skipBtn: {
    backgroundColor: ShadotenColors.contentBg,
    borderWidth: 2,
    borderColor: ShadotenColors.headerTeal,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },

  skipBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: ShadotenColors.headerTeal,
  },
});
