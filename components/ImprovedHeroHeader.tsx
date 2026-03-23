/**
 * ImprovedHeroHeader コンポーネント
 * 改善されたメッセージングを適用
 * - 「英検準1級合格・大学受験対策」を強調
 * - 「シャドーイング」を前面に
 * - 「94% のユーザーが成果を実感」と具体的な成果を表示
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';

interface ImprovedHeroHeaderProps {
  userName?: string;
  onCTAPress?: () => void;
}

export default function ImprovedHeroHeader({
  userName = 'ユーザー',
  onCTAPress,
}: ImprovedHeroHeaderProps) {
  return (
    <View style={styles.container}>
      {/* メインメッセージ */}
      <Text style={styles.mainHeading}>
        英検準1級合格・大学受験対策なら、シャドーイングで身につく英検コーチ
      </Text>

      {/* サブメッセージ */}
      <Text style={styles.subHeading}>
        週 3 回の学習で、平均 +35 点 UP。94% のユーザーが成果を実感
      </Text>

      {/* 実績表示 */}
      <View style={styles.statsContainer}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>94%</Text>
          <Text style={styles.statLabel}>成果実感</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>+35点</Text>
          <Text style={styles.statLabel}>平均向上</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>3ヶ月</Text>
          <Text style={styles.statLabel}>合格期間</Text>
        </View>
      </View>

      {/* CTA ボタン */}
      <TouchableOpacity
        style={styles.ctaButton}
        onPress={onCTAPress}
        activeOpacity={0.8}
      >
        <Text style={styles.ctaText}>無料体験レッスン予約</Text>
      </TouchableOpacity>

      {/* ウェルカムメッセージ */}
      <Text style={styles.welcomeText}>
        おかえりなさい、{userName}！今日も一緒に頑張りましょう
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f9fa',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: '#e0e0e0',
  },
  mainHeading: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primary,
    marginBottom: Spacing.md,
    lineHeight: 26,
  },
  subHeading: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.secondary,
    marginBottom: Spacing.md,
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: 'white',
    borderRadius: BorderRadius.md,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
  },
  ctaButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginVertical: Spacing.md,
    alignItems: 'center',
  },
  ctaText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
  welcomeText: {
    fontSize: 13,
    color: Colors.text.secondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
