import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import { PhraseFeedback } from '@/src/lib/aiScoringService';
import { NaturalColors, Spacing, BorderRadius } from '@/constants/theme';

interface PhraseDetailModalProps {
  visible: boolean;
  phrase: PhraseFeedback | null;
  onClose: () => void;
}

const ISSUE_ICONS: Record<string, string> = {
  linking: '🔗',
  reduction: '⬇️',
  stress: '💪',
  intonation: '📈',
  pronunciation: '🗣️',
};

const ISSUE_LABELS: Record<string, string> = {
  linking: 'リンキング',
  reduction: 'リダクション',
  stress: 'ストレス',
  intonation: 'イントネーション',
  pronunciation: '発音',
};

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'good':
      return '#52C41A'; // Green
    case 'needsWork':
      return '#FAAD14'; // Yellow
    case 'major':
      return '#F5222D'; // Red
    default:
      return '#999';
  }
};

const getStatusLabel = (status: string): string => {
  switch (status) {
    case 'good':
      return '✅ 良好';
    case 'needsWork':
      return '⚠️ 改善が必要';
    case 'major':
      return '❌ 大きな問題';
    default:
      return '評価';
  }
};

const getStatusBgColor = (status: string): string => {
  switch (status) {
    case 'good':
      return 'rgba(82, 196, 26, 0.08)';
    case 'needsWork':
      return 'rgba(250, 173, 20, 0.08)';
    case 'major':
      return 'rgba(245, 34, 45, 0.08)';
    default:
      return 'rgba(200, 200, 200, 0.08)';
  }
};

export default function PhraseDetailModal({
  visible,
  phrase,
  onClose,
}: PhraseDetailModalProps) {
  if (!phrase) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>フレーズ詳細</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Phrase Display */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>フレーズ</Text>
            <View
              style={[
                styles.phraseBox,
                {
                  backgroundColor: getStatusBgColor(phrase.status),
                  borderColor: getStatusColor(phrase.status),
                },
              ]}
            >
              <Text style={styles.phraseText}>{phrase.phrase}</Text>
            </View>
          </View>

          {/* Status */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>評価</Text>
            <View
              style={[
                styles.statusBox,
                {
                  borderLeftColor: getStatusColor(phrase.status),
                  backgroundColor: getStatusBgColor(phrase.status),
                },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  { color: getStatusColor(phrase.status) },
                ]}
              >
                {getStatusLabel(phrase.status)}
              </Text>
            </View>
          </View>

          {/* Correct Reading */}
          {phrase.correctReading && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>正しい読み方（カタカナ）</Text>
              <View style={styles.readingBox}>
                <Text style={styles.readingText}>{phrase.correctReading}</Text>
              </View>
            </View>
          )}

          {/* Your Version */}
          {phrase.yourVersion && phrase.yourVersion !== phrase.correctReading && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>あなたの読み方</Text>
              <View style={styles.readingBox}>
                <Text style={[styles.readingText, { color: '#C85C5C' }]}>
                  {phrase.yourVersion}
                </Text>
              </View>
            </View>
          )}

          {/* Issues */}
          {phrase.issues && phrase.issues.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>問題点と改善のコツ</Text>
              <View style={styles.issuesList}>
                {phrase.issues.map((issue, index) => (
                  <View key={index} style={styles.issueItem}>
                    <View style={styles.issueHeader}>
                      <Text style={styles.issueIcon}>
                        {ISSUE_ICONS[issue.type] || '💡'}
                      </Text>
                      <Text style={styles.issueType}>
                        {ISSUE_LABELS[issue.type] || issue.type}
                      </Text>
                    </View>
                    <Text style={styles.issueDescription}>
                      {issue.description}
                    </Text>
                    <View style={styles.tipBox}>
                      <Text style={styles.tipIcon}>💡</Text>
                      <Text style={styles.tipText}>{issue.tip}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Example */}
          {phrase.example && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>具体例</Text>
              <View style={styles.exampleBox}>
                <Text style={styles.exampleText}>{phrase.example}</Text>
              </View>
            </View>
          )}

          <View style={styles.spacer} />
        </ScrollView>

        {/* Close Button */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.closeMainButton} onPress={onClose}>
            <Text style={styles.closeMainButtonText}>閉じる</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NaturalColors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E6E1',
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    color: NaturalColors.textDark,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: NaturalColors.textDark,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: Spacing.xl,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: NaturalColors.textMedium,
    marginBottom: Spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  phraseBox: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
  },
  phraseText: {
    fontSize: 24,
    fontWeight: '700',
    color: NaturalColors.textDark,
    textAlign: 'center',
  },
  statusBox: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderLeftWidth: 4,
  },
  statusText: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
  },
  readingBox: {
    padding: Spacing.lg,
    backgroundColor: NaturalColors.cardBg,
    borderRadius: BorderRadius.lg,
    borderLeftWidth: 4,
    borderLeftColor: NaturalColors.primary,
  },
  readingText: {
    fontSize: 20,
    fontWeight: '600',
    color: NaturalColors.primary,
    textAlign: 'center',
    lineHeight: 28,
  },
  issuesList: {
    gap: Spacing.lg,
  },
  issueItem: {
    padding: Spacing.lg,
    backgroundColor: NaturalColors.cardBg,
    borderRadius: BorderRadius.lg,
    borderLeftWidth: 4,
    borderLeftColor: '#FAAD14',
  },
  issueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  issueIcon: {
    fontSize: 20,
  },
  issueType: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FAAD14',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  issueDescription: {
    fontSize: 14,
    color: NaturalColors.textDark,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  tipBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: 'rgba(250, 173, 20, 0.08)',
    borderRadius: BorderRadius.md,
    gap: Spacing.md,
  },
  tipIcon: {
    fontSize: 16,
    marginTop: 2,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: NaturalColors.textDark,
    lineHeight: 18,
  },
  exampleBox: {
    padding: Spacing.lg,
    backgroundColor: 'rgba(27, 155, 164, 0.08)',
    borderRadius: BorderRadius.lg,
    borderLeftWidth: 4,
    borderLeftColor: NaturalColors.primary,
  },
  exampleText: {
    fontSize: 13,
    color: NaturalColors.textDark,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  spacer: {
    height: Spacing.xl,
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: '#E8E6E1',
  },
  closeMainButton: {
    paddingVertical: Spacing.lg,
    backgroundColor: NaturalColors.primary,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  closeMainButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
