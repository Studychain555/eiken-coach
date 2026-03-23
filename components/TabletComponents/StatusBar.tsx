/**
 * Status Bar Component
 * Displays streak, hearts, and XP in a compact horizontal layout
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, Typography, BorderRadius, DuolingoColors } from '@/constants/theme';

interface StatusBarProps {
  streak: number;
  hearts: number;
  xp: number;
}

export default function StatusBar({ streak, hearts, xp }: StatusBarProps) {
  return (
    <View style={styles.container}>
      {/* Streak */}
      <View style={styles.statusItem}>
        <Text style={styles.icon}>🔥</Text>
        <View style={styles.statusContent}>
          <Text style={styles.statusLabel}>連続学習</Text>
          <Text style={styles.statusValue}>{streak}日</Text>
        </View>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Hearts */}
      <View style={styles.statusItem}>
        <Text style={styles.icon}>❤️</Text>
        <View style={styles.statusContent}>
          <Text style={styles.statusLabel}>ハート</Text>
          <Text style={styles.statusValue}>x{hearts}</Text>
        </View>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* XP */}
      <View style={styles.statusItem}>
        <Text style={styles.icon}>⭐</Text>
        <View style={styles.statusContent}>
          <Text style={styles.statusLabel}>経験値</Text>
          <Text style={styles.statusValue}>{xp.toLocaleString()}XP</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.light.background,
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.md,
  },
  statusItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.light.surfaceCard,
    borderRadius: BorderRadius.md,
  },
  icon: {
    fontSize: 20,
  },
  statusContent: {
    flex: 1,
  },
  statusLabel: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
    fontWeight: '500',
  },
  statusValue: {
    ...Typography.bodySmall,
    color: Colors.light.text,
    fontWeight: '700',
    marginTop: 2,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.light.border,
  },
});
