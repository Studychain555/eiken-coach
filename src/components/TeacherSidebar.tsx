import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Colors, Typography, Spacing } from '@/constants/theme';
import type { TabType } from './TeacherLayout';

interface TeacherSidebarProps {
  activeTab: TabType;
  onSelect: (tab: TabType) => void;
}

const menuItems: Array<{ id: TabType; label: string; icon: string }> = [
  { id: 'dashboard', label: 'ホーム', icon: '🏠' },
  { id: 'materials', label: '教材・課題', icon: '📚' },
  { id: 'tests', label: 'テスト・採点', icon: '✅' },
  { id: 'analytics', label: '学習分析', icon: '📊' },
  { id: 'students', label: '生徒管理', icon: '👥' },
  { id: 'settings', label: 'クラス設定', icon: '⚙️' },
  { id: 'reports', label: 'レポート', icon: '📋' },
];

export const TeacherSidebar: React.FC<TeacherSidebarProps> = ({ activeTab, onSelect }) => {
  return (
    <ScrollView style={styles.sidebar} showsVerticalScrollIndicator={false}>
      {/* Logo/Title */}
      <View style={styles.logoSection}>
        <Text style={styles.logoText}>EigoMaster</Text>
        <Text style={styles.subtitle}>講師管理画面</Text>
      </View>

      {/* Menu Items */}
      <View style={styles.menuContainer}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.menuItem, activeTab === item.id && styles.menuItemActive]}
            onPress={() => onSelect(item.id)}
            activeOpacity={0.7}
          >
            <Text style={styles.menuIcon}>{item.icon}</Text>
            <Text
              style={[
                styles.menuLabel,
                activeTab === item.id && styles.menuLabelActive,
              ]}
            >
              {item.label}
            </Text>
            {activeTab === item.id && <View style={styles.activeIndicator} />}
          </TouchableOpacity>
        ))}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>v1.0</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  sidebar: {
    flex: 1,
    backgroundColor: '#2E5090',
  },
  logoSection: {
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  logoText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '400',
  },
  menuContainer: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    marginVertical: Spacing.xs,
    borderRadius: 8,
    position: 'relative',
  },
  menuItemActive: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
  },
  menuIcon: {
    fontSize: 20,
    marginRight: Spacing.md,
  },
  menuLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  menuLabelActive: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  activeIndicator: {
    width: 3,
    height: 24,
    backgroundColor: '#4CAF50',
    borderRadius: 2,
    marginLeft: Spacing.sm,
  },
  footer: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
  },
});
