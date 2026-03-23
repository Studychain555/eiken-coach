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
      {/* Fixed Header */}
      <View style={styles.fixedHeader}>
        <Text style={styles.logoText}>EnglishNAVI</Text>
      </View>

      {/* Scrollable Main Content */}
      <ScrollView
        style={styles.mainContent}
        showsVerticalScrollIndicator={false}
        scrollEnabled={true}
        contentContainerStyle={{ paddingBottom: 20 }}
      >

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
              <View style={styles.goalCardLeft}>
                <Text style={styles.goalIcon}>🎧</Text>
                <View>
                  <Text style={styles.goalLevel}>英検準1級</Text>
                  <Text style={styles.goalTitle}>リスニング</Text>
                  <Text style={styles.goalXp}>+10XP</Text>
                </View>
              </View>
              <Text style={styles.goalCount}>1</Text>
            </View>
            <View style={styles.goalCard}>
              <View style={styles.goalCardLeft}>
                <Text style={styles.goalIcon}>📚</Text>
                <View>
                  <Text style={styles.goalLevel}>英検準1級</Text>
                  <Text style={styles.goalTitle}>英単語</Text>
                  <Text style={styles.goalXp}>+50XP</Text>
                </View>
              </View>
              <Text style={styles.goalCount}>50</Text>
            </View>
            <View style={styles.goalCard}>
              <View style={styles.goalCardLeft}>
                <Text style={styles.goalIcon}>✏️</Text>
                <View>
                  <Text style={styles.goalLevel}>英検準1級</Text>
                  <Text style={styles.goalTitle}>ライティング</Text>
                  <Text style={styles.goalXp}>+100XP</Text>
                </View>
              </View>
              <Text style={styles.goalCount}>1</Text>
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
    flexDirection: 'column',
  },
  fixedHeader: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.light.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
    flexShrink: 0,
  },
  logoText: {
    fontSize: 18,
    fontWeight: '800',
    color: DuolingoColors.primary,
    letterSpacing: 0.5,
  },
  mainContent: {
    flex: 1,
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.light.surfaceCard,
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
  },
  statusItem: {
    ...Typography.bodySmall,
    color: Colors.light.text,
    fontWeight: '600',
    fontSize: 12,
  },
  section: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  sectionTitle: {
    ...Typography.h5,
    color: Colors.light.text,
    fontWeight: '700',
    marginBottom: Spacing.md,
    fontSize: 16,
  },
  goalsContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  goalCard: {
    flex: 1,
    backgroundColor: Colors.light.surfaceCard,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: DuolingoColors.primary,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  goalCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  goalIcon: {
    fontSize: 20,
    marginBottom: 0,
  },
  goalLevel: {
    fontSize: 10,
    color: Colors.light.textMuted,
    fontWeight: '500',
    marginBottom: 2,
  },
  goalTitle: {
    ...Typography.caption,
    color: Colors.light.text,
    fontWeight: '600',
    marginBottom: 2,
    fontSize: 12,
  },
  goalCount: {
    ...Typography.h4,
    color: Colors.light.text,
    fontWeight: '700',
    marginBottom: 0,
    fontSize: 16,
  },
  goalXp: {
    ...Typography.caption,
    color: DuolingoColors.primary,
    fontWeight: '700',
    fontSize: 10,
  },
  statsCard: {
    backgroundColor: Colors.light.surfaceCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  masteryCircle: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  masteryPercentage: {
    fontSize: 36,
    fontWeight: '900',
    color: DuolingoColors.primary,
  },
  masteryLabel: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
    fontWeight: '600',
    marginTop: Spacing.xs,
    fontSize: 11,
  },
  statsItems: {
    gap: Spacing.md,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  actionButton: {
    flex: 1,
    backgroundColor: DuolingoColors.primary,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
});
