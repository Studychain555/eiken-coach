import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { EIKENLevel, EIKENLevelLabels, EIKENLevelDescriptions, EIKENLevelWordCounts } from '@/src/lib/eiken-vocabulary-schema';
import { Colors, Spacing, BorderRadius, Shadows, Typography } from '@/constants/theme';

interface EIKENLevelSelectorProps {
  selectedLevel?: EIKENLevel;
  onLevelSelect: (level: EIKENLevel) => void;
}

const LevelEmojis = {
  [EIKENLevel.PRE_2ND]: '🌱',
  [EIKENLevel.GRADE_2]: '🌿',
  [EIKENLevel.PRE_1ST]: '🌳',
  [EIKENLevel.GRADE_1]: '🏔️',
};

const LevelColors = {
  [EIKENLevel.PRE_2ND]: '#52C41A', // Green
  [EIKENLevel.GRADE_2]: '#1890FF', // Blue
  [EIKENLevel.PRE_1ST]: '#FA8C16', // Orange
  [EIKENLevel.GRADE_1]: '#F5222D', // Red
};

export function EIKENLevelSelector({ selectedLevel, onLevelSelect }: EIKENLevelSelectorProps) {
  const levels = [EIKENLevel.PRE_2ND, EIKENLevel.GRADE_2, EIKENLevel.PRE_1ST, EIKENLevel.GRADE_1];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🎓 英検レベル選択</Text>
        <Text style={styles.subtitle}>学習するレベルを選んでください</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.levelList}>
        {levels.map((level) => {
          const isSelected = selectedLevel === level;
          const wordCount = EIKENLevelWordCounts[level];
          const emoji = LevelEmojis[level];
          const color = LevelColors[level];

          return (
            <TouchableOpacity
              key={level}
              style={[
                styles.levelCard,
                isSelected && styles.levelCardSelected,
                { borderLeftColor: color, borderLeftWidth: 4 },
              ]}
              onPress={() => onLevelSelect(level)}
              activeOpacity={0.7}
            >
              <View style={styles.levelCardContent}>
                <View style={styles.levelHeader}>
                  <Text style={styles.levelEmoji}>{emoji}</Text>
                  <View style={styles.levelInfo}>
                    <Text style={styles.levelName}>{EIKENLevelLabels[level]}</Text>
                    <Text style={styles.levelDescription}>{EIKENLevelDescriptions[level]}</Text>
                  </View>
                  {isSelected && <Text style={styles.selectedBadge}>✓</Text>}
                </View>

                <View style={styles.levelFooter}>
                  <View style={styles.wordCountBadge}>
                    <Text style={styles.wordCountText}>
                      {wordCount.min.toLocaleString()}-{wordCount.max.toLocaleString()} 単語
                    </Text>
                  </View>
                  <Text style={styles.levelDifficulty}>難度: {getLevelDifficultyLabel(level)}</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

function getLevelDifficultyLabel(level: EIKENLevel): string {
  switch (level) {
    case EIKENLevel.PRE_2ND:
      return '初級';
    case EIKENLevel.GRADE_2:
      return '中級';
    case EIKENLevel.PRE_1ST:
      return '上級';
    case EIKENLevel.GRADE_1:
      return '最上級';
    default:
      return '不明';
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },

  header: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.light.surfaceCard,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },

  title: {
    ...Typography.h3,
    color: Colors.light.text,
    marginBottom: Spacing.xs,
  },

  subtitle: {
    ...Typography.bodySmall,
    color: Colors.light.textSecondary,
  },

  levelList: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },

  levelCard: {
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
    backgroundColor: Colors.light.surfaceCard,
    borderRadius: BorderRadius.lg,
    ...Shadows.md,
    borderLeftWidth: 4,
  },

  levelCardSelected: {
    backgroundColor: '#F0F7FF',
    borderColor: Colors.light.primary,
  },

  levelCardContent: {
    gap: Spacing.md,
  },

  levelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },

  levelEmoji: {
    fontSize: 40,
  },

  levelInfo: {
    flex: 1,
  },

  levelName: {
    ...Typography.h5,
    color: Colors.light.text,
    marginBottom: Spacing.xs,
  },

  levelDescription: {
    ...Typography.bodySmall,
    color: Colors.light.textSecondary,
  },

  selectedBadge: {
    fontSize: 24,
    color: Colors.light.success,
    fontWeight: '700',
  },

  levelFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },

  wordCountBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.light.backgroundAlt,
    borderRadius: BorderRadius.full,
  },

  wordCountText: {
    ...Typography.labelSmall,
    color: Colors.light.text,
  },

  levelDifficulty: {
    ...Typography.labelSmall,
    color: Colors.light.textSecondary,
  },
});
