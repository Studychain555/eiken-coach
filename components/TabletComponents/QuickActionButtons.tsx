/**
 * Quick Action Buttons Component
 * 6 action buttons in 2 rows for easy navigation
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Colors, Spacing, Typography, BorderRadius, DuolingoColors } from '@/constants/theme';

const { width } = Dimensions.get('window');
const isTablet = width >= 600;
const buttonWidth = isTablet ? (width - Spacing.xl * 2 - Spacing.lg * 2) / 3 : (width - Spacing.xl * 2 - Spacing.lg) / 2;

interface QuickActionButtonsProps {
  onNavigate: (screen: string) => void;
}

interface ActionButton {
  id: string;
  icon: string;
  label: string;
  screen: string;
  color: string;
}

const actionButtons: ActionButton[] = [
  {
    id: 'listening',
    icon: '🎧',
    label: 'リスニング',
    screen: 'listening-redesign',
    color: DuolingoColors.primary,
  },
  {
    id: 'vocabulary',
    icon: '📚',
    label: '英単語',
    screen: 'vocabulary-redesign',
    color: DuolingoColors.warning,
  },
  {
    id: 'writing',
    icon: '✏️',
    label: 'ライティング',
    screen: 'writing-redesign',
    color: DuolingoColors.error,
  },
  {
    id: 'stats',
    icon: '📊',
    label: '統計',
    screen: 'learning-stats',
    color: DuolingoColors.success,
  },
  {
    id: 'settings',
    icon: '⚙️',
    label: '設定',
    screen: 'settings',
    color: Colors.light.textSecondary,
  },
  {
    id: 'parent',
    icon: '👨‍👩‍👧',
    label: '親向けダッシュボード',
    screen: 'parent-dashboard',
    color: DuolingoColors.primary,
  },
];

export default function QuickActionButtons({ onNavigate }: QuickActionButtonsProps) {
  const renderButton = (button: ActionButton) => (
    <TouchableOpacity
      key={button.id}
      style={[styles.actionButton, { borderColor: button.color }]}
      onPress={() => onNavigate(button.screen)}
      activeOpacity={0.7}
    >
      <View style={[styles.buttonIconContainer, { backgroundColor: `${button.color}20` }]}>
        <Text style={styles.buttonIcon}>{button.icon}</Text>
      </View>
      <Text style={[styles.buttonLabel, { color: button.color }]}>{button.label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>クイックアクション</Text>

      {/* First row - 3 buttons */}
      <View style={styles.buttonsRow}>
        {actionButtons.slice(0, 3).map((button) => renderButton(button))}
      </View>

      {/* Second row - 3 buttons */}
      <View style={styles.buttonsRow}>
        {actionButtons.slice(3, 6).map((button) => renderButton(button))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.light.background,
  },
  sectionTitle: {
    ...Typography.h5,
    color: Colors.light.text,
    fontWeight: '700',
    marginBottom: Spacing.lg,
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  actionButton: {
    flex: 1,
    minHeight: 100,
    backgroundColor: Colors.light.surfaceCard,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  buttonIconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonIcon: {
    fontSize: 24,
  },
  buttonLabel: {
    ...Typography.caption,
    fontWeight: '600',
    textAlign: 'center',
    maxWidth: 80,
  },
});
