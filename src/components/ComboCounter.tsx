/**
 * ComboCounter Component
 * Displays consecutive correct answers counter
 * Shows x2, x3, x5, x10 combo achievements
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DuolingoColors, Spacing, Typography, BorderRadius } from '@/constants/theme';

interface ComboCounterProps {
  count: number;
  visible?: boolean;
}

export const ComboCounter: React.FC<ComboCounterProps> = ({ count, visible = true }) => {
  if (!visible || count < 2) {
    return null;
  }

  // Determine milestone and color
  const isMilestone = count === 2 || count === 3 || count === 5 || count === 10;
  const backgroundColor = isMilestone ? DuolingoColors.combo : DuolingoColors.accent;

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Text style={styles.emoji}>🔥</Text>
      <Text style={styles.text}>{count}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.lg,
  },
  emoji: {
    fontSize: 24,
  },
  text: {
    fontSize: 18,
    fontWeight: 600,
    lineHeight: 24,
    color: '#FFFFFF',
  } as any,
});
