import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Colors, Spacing, BorderRadius, Shadows, Typography } from '@/constants/theme';

interface FeedbackItem {
  phrase: string;
  tags: string[];
  explanation: string;
}

interface FeedbackData {
  material: string;
  taskNumber: number;
  reviewDate: string;
  reviewer: string;
  greeting: string;
  round: {
    number: number;
    accuracy: number;
    pronunciation: number;
  };
  goodPoints: FeedbackItem[];
  developmentPoints: FeedbackItem[];
}

interface ShadowingResultScreenProps {
  feedback?: FeedbackData;
  onNext?: () => void;
  onBack?: () => void;
}

const getScoreColor = (score: number) => {
  if (score >= 8.0) return '#2BBCB3';
  if (score >= 6.0) return '#F5A623';
  return '#E74C3C';
};

const SAMPLE_FEEDBACK: FeedbackData = {
  material: 'TOEIC® : Part3-2',
  taskNumber: 1,
  reviewDate: '2024/01/04',
  reviewer: 'AI',
  greeting:
    '日々のシャドーイングお疲れ様です！以下、TOEIC® : Part3-2 課題1のラウンド1の添削です✨',
  round: {
    number: 1,
    accuracy: 7.3,
    pronunciation: 7.4,
  },
  goodPoints: [
    {
      phrase: '流暢で自然なリズム',
      tags: ['改善されていました！'],
      explanation:
        '全体的に流暢で自然なリズムで発話できています。この調子で続けましょう！',
    },
    {
      phrase: '個々の単語の発音',
      tags: ['改善されていました！'],
      explanation: '個々の単語の発音が正確です。基礎がしっかりしています。',
    },
  ],
  developmentPoints: [
    {
      phrase: 'スクリプト全体の発話',
      tags: ['再確認しましょう！'],
      explanation:
        'スクリプトは89語ですが、発話は62語でした。スクリプト全体を発話するように心がけてください。まずは全文を通して読む練習から始めましょう。',
    },
    {
      phrase: '細部の正確性',
      tags: ['再確認しましょう！'],
      explanation:
        '正確性は73%です。特に「全体」の部分を確認してください。もう少し細部に注意を払うとさらに良くなります。',
    },
  ],
};

export default function ShadowingResultScreen({
  feedback = SAMPLE_FEEDBACK,
  onNext,
  onBack,
}: ShadowingResultScreenProps) {
  const [expandedGood, setExpandedGood] = useState(true);
  const [expandedDevelopment, setExpandedDevelopment] = useState(true);

  const accuracyColor = getScoreColor(feedback.round.accuracy);
  const pronunciationColor = getScoreColor(feedback.round.pronunciation);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🎤 添削結果</Text>
        <Text style={styles.headerSubtitle}>Round {feedback.round.number}</Text>
      </View>

      {/* Main Content - Scrollable */}
      <ScrollView
        style={styles.mainContent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Summary Card */}
        <View style={styles.summaryCard}>
          {/* Material Info */}
          <Text style={styles.materialName}>{feedback.material}</Text>
          <Text style={styles.metaInfo}>
            課題番号 {feedback.taskNumber} ｜ 添削日 {feedback.reviewDate} ｜ 添削者{' '}
            {feedback.reviewer}
          </Text>

          {/* Score Section */}
          <View style={styles.scoreSection}>
            <View style={styles.scoreBox}>
              <Text style={styles.scoreLabel}>正確性</Text>
              <Text style={[styles.scoreValue, { color: accuracyColor }]}>
                {feedback.round.accuracy.toFixed(1)}
              </Text>
              <Text style={styles.scoreMax}>/10</Text>
              <View style={styles.scoreBar}>
                <View
                  style={[
                    styles.scoreBarFill,
                    {
                      width: `${(feedback.round.accuracy / 10) * 100}%`,
                      backgroundColor: accuracyColor,
                    },
                  ]}
                />
              </View>
            </View>
            <View style={styles.scoreBox}>
              <Text style={styles.scoreLabel}>発音</Text>
              <Text style={[styles.scoreValue, { color: pronunciationColor }]}>
                {feedback.round.pronunciation.toFixed(1)}
              </Text>
              <Text style={styles.scoreMax}>/10</Text>
              <View style={styles.scoreBar}>
                <View
                  style={[
                    styles.scoreBarFill,
                    {
                      width: `${(feedback.round.pronunciation / 10) * 100}%`,
                      backgroundColor: pronunciationColor,
                    },
                  ]}
                />
              </View>
            </View>
          </View>

          {/* Greeting Message */}
          <View style={styles.greetingBox}>
            <Text style={styles.greetingText}>{feedback.greeting}</Text>
          </View>
        </View>

        {/* Good Points Section */}
        <View style={styles.feedbackSection}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => setExpandedGood(!expandedGood)}
            activeOpacity={0.7}
          >
            <View style={styles.sectionTitleContainer}>
              <View style={styles.sectionBorder} />
              <Text style={[styles.sectionTitle, { color: '#2BBCB3' }]}>
                ✓ Good Points
              </Text>
            </View>
            <Text style={styles.toggleIcon}>{expandedGood ? '▲' : '▼'}</Text>
          </TouchableOpacity>

          {expandedGood && (
            <View style={styles.sectionContent}>
              {feedback.goodPoints.map((item, index) => (
                <View key={index} style={styles.feedbackItem}>
                  <View style={styles.tagRow}>
                    <View style={styles.badgeGood}>
                      <Text style={styles.badgeText}>✓ Good</Text>
                    </View>
                    {item.tags.map((tag, tagIdx) => (
                      <View key={tagIdx} style={styles.tagGood}>
                        <Text style={styles.tagText}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                  <Text style={styles.phrase}>{item.phrase}</Text>
                  <Text style={styles.explanation}>{item.explanation}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Development Points Section */}
        <View style={styles.feedbackSection}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => setExpandedDevelopment(!expandedDevelopment)}
            activeOpacity={0.7}
          >
            <View style={styles.sectionTitleContainer}>
              <View style={[styles.sectionBorder, { backgroundColor: '#E8553A' }]} />
              <Text style={[styles.sectionTitle, { color: '#E8553A' }]}>
                🔥 Development Points
              </Text>
            </View>
            <Text style={styles.toggleIcon}>{expandedDevelopment ? '▲' : '▼'}</Text>
          </TouchableOpacity>

          {expandedDevelopment && (
            <View style={[styles.sectionContent, styles.developmentBg]}>
              {feedback.developmentPoints.map((item, index) => (
                <View key={index} style={styles.feedbackItem}>
                  <View style={styles.tagRow}>
                    <View style={styles.badgeDevelopment}>
                      <Text style={styles.badgeTextDev}>🔥 Development</Text>
                    </View>
                    {item.tags.map((tag, tagIdx) => (
                      <View key={tagIdx} style={styles.tagDevelopment}>
                        <Text style={styles.tagTextDev}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                  <Text style={styles.phrase}>{item.phrase}</Text>
                  <Text style={styles.explanation}>{item.explanation}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.buttonSecondary} onPress={onBack}>
          <Text style={styles.buttonSecondaryText}>← 戻る</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buttonPrimary} onPress={onNext}>
          <Text style={styles.buttonPrimaryText}>次のラウンドへ →</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.light.text,
  },
  headerSubtitle: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    fontWeight: '500',
    marginTop: 4,
  },
  mainContent: {
    flex: 1,
  },
  summaryCard: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadows.sm,
  },
  materialName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 4,
  },
  metaInfo: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    fontWeight: '400',
    marginBottom: Spacing.md,
  },
  scoreSection: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  scoreBox: {
    flex: 1,
    backgroundColor: '#F9F9F9',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    fontWeight: '500',
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 2,
  },
  scoreMax: {
    fontSize: 11,
    color: Colors.light.textSecondary,
    fontWeight: '500',
    marginBottom: Spacing.sm,
  },
  scoreBar: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.light.border,
    overflow: 'hidden',
  },
  scoreBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  greetingBox: {
    backgroundColor: '#F5F5F5',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginTop: Spacing.md,
  },
  greetingText: {
    fontSize: 14,
    color: Colors.light.text,
    fontWeight: '500',
    lineHeight: 20,
  },
  feedbackSection: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.xs,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  sectionBorder: {
    width: 4,
    height: 28,
    backgroundColor: '#2BBCB3',
    borderRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  toggleIcon: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.textSecondary,
  },
  sectionContent: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  developmentBg: {
    backgroundColor: '#FFF0F0',
  },
  feedbackItem: {
    marginBottom: Spacing.lg,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  badgeGood: {
    backgroundColor: '#2BBCB3',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.md,
  },
  badgeText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  badgeDevelopment: {
    backgroundColor: '#E8553A',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.md,
  },
  badgeTextDev: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  tagGood: {
    backgroundColor: '#E6FAF8',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 11,
    color: '#2BBCB3',
    fontWeight: '600',
  },
  tagDevelopment: {
    backgroundColor: '#FFF0F0',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8553A',
  },
  tagTextDev: {
    fontSize: 11,
    color: '#E8553A',
    fontWeight: '600',
  },
  phrase: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: Spacing.sm,
  },
  explanation: {
    fontSize: 14,
    color: Colors.light.text,
    fontWeight: '400',
    lineHeight: 22,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    paddingBottom: Spacing.lg,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  buttonSecondary: {
    flex: 1,
    paddingVertical: Spacing.md,
    backgroundColor: '#F5F5F5',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.light.border,
    alignItems: 'center',
  },
  buttonSecondaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
  },
  buttonPrimary: {
    flex: 1,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.light.primary,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  buttonPrimaryText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
