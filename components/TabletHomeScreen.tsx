/**
 * Tablet-Optimized Home Screen
 * Simplified version to prevent infinite loops
 * Designed for tablet viewing (768px+) - fits on screen without scrolling
 */

import React from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Typography, BorderRadius, DuolingoColors } from '@/constants/theme';

interface TabletHomeScreenProps {
  onRefresh?: () => void;
}

export default function TabletHomeScreen({ onRefresh }: TabletHomeScreenProps) {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        scrollEnabled={true}
      >
        {/* Welcome Header */}
        <View style={styles.header}>
          <Text style={styles.welcomeText}>おはよう！</Text>
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>⭐ Lv.5</Text>
          </View>
        </View>

        {/* Status Bar */}
        <View style={styles.statusBar}>
          <Text style={styles.statusItem}>🔥 7日</Text>
          <Text style={styles.statusItem}>❤️ x3</Text>
          <Text style={styles.statusItem}>⭐ 1250XP</Text>
        </View>

        {/* Daily Goals */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>今日の目標</Text>
          <View style={styles.goalsContainer}>
            <View style={styles.goalCard}>
              <Text style={styles.goalIcon}>🎧</Text>
              <Text style={styles.goalTitle}>リスニング</Text>
              <Text style={styles.goalCount}>1</Text>
              <Text style={styles.goalXp}>+10XP</Text>
            </View>
            <View style={styles.goalCard}>
              <Text style={styles.goalIcon}>📚</Text>
              <Text style={styles.goalTitle}>英単語</Text>
              <Text style={styles.goalCount}>50</Text>
              <Text style={styles.goalXp}>+50XP</Text>
            </View>
            <View style={styles.goalCard}>
              <Text style={styles.goalIcon}>✏️</Text>
              <Text style={styles.goalTitle}>ライティング</Text>
              <Text style={styles.goalCount}>1</Text>
              <Text style={styles.goalXp}>+100XP</Text>
            </View>
          </View>
        </View>

        {/* Learning Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>学習進捗</Text>
          <View style={styles.statsCard}>
            <View style={styles.masteryCircle}>
              <Text style={styles.masteryPercentage}>46.9%</Text>
              <Text style={styles.masteryLabel}>習熟度</Text>
            </View>
            <View style={styles.statsItems}>
              <View style={styles.statRow}>
                <Text>🎧 リスニング</Text>
                <Text>0/10</Text>
              </View>
              <View style={styles.statRow}>
                <Text>📚 英単語</Text>
                <Text>145/250</Text>
              </View>
              <View style={styles.statRow}>
                <Text>✏️ ライティング</Text>
                <Text>12/20</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/(tabs)/listening')}
            >
              <Text style={styles.buttonText}>🎧 リスニング</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/(tabs)/vocabulary')}
            >
              <Text style={styles.buttonText}>📚 英単語</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/(tabs)/writing')}
            >
              <Text style={styles.buttonText}>✏️ ライティング</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom padding */}
        <View style={{ height: Spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
  },
  welcomeText: {
    ...Typography.h4,
    color: Colors.light.text,
    fontWeight: '700',
  },
  levelBadge: {
    backgroundColor: DuolingoColors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
  },
  levelText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.light.surfaceCard,
    marginHorizontal: Spacing.xl,
    marginVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  statusItem: {
    ...Typography.bodySmall,
    color: Colors.light.text,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.h5,
    color: Colors.light.text,
    fontWeight: '700',
    marginBottom: Spacing.lg,
  },
  goalsContainer: {
    flexDirection: 'row',
    gap: Spacing.lg,
  },
  goalCard: {
    flex: 1,
    backgroundColor: Colors.light.surfaceCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: DuolingoColors.primary,
  },
  goalIcon: {
    fontSize: 32,
    marginBottom: Spacing.sm,
  },
  goalTitle: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  goalCount: {
    ...Typography.h4,
    color: Colors.light.text,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  goalXp: {
    ...Typography.caption,
    color: DuolingoColors.primary,
    fontWeight: '700',
  },
  statsCard: {
    backgroundColor: Colors.light.surfaceCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  masteryCircle: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  masteryPercentage: {
    fontSize: 48,
    fontWeight: '900',
    color: DuolingoColors.primary,
  },
  masteryLabel: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
    fontWeight: '600',
    marginTop: Spacing.xs,
  },
  statsItems: {
    gap: Spacing.lg,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: Spacing.lg,
  },
  actionButton: {
    flex: 1,
    backgroundColor: DuolingoColors.primary,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
});
