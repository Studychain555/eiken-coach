import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
} from 'react-native';
import { Colors, Typography, Spacing } from '@/constants/theme';
import { useAuthStore } from '@/src/stores/authStore';

interface TeacherHeaderProps {
  onToggleSidebar?: () => void;
}

export const TeacherHeader: React.FC<TeacherHeaderProps> = ({ onToggleSidebar }) => {
  const { user } = useAuthStore();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        {/* Left: Menu Toggle */}
        <TouchableOpacity
          style={styles.menuToggle}
          onPress={onToggleSidebar}
          activeOpacity={0.7}
        >
          <Text style={styles.toggleIcon}>☰</Text>
        </TouchableOpacity>

        {/* Center: Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.titleText}>講師ダッシュボード</Text>
          <Text style={styles.dateText}>{new Date().toLocaleDateString('ja-JP')}</Text>
        </View>

        {/* Right: User Menu */}
        <TouchableOpacity style={styles.userMenu} activeOpacity={0.7}>
          <View style={styles.userAvatar}>
            <Text style={styles.avatarText}>
              {(user?.email?.[0] || 'T').toUpperCase()}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.email?.split('@')[0] || '講師'}</Text>
            <Text style={styles.userRole}>講師</Text>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: Colors.light.surfaceCard,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    height: 60,
    backgroundColor: Colors.light.surfaceCard,
  },
  menuToggle: {
    padding: Spacing.sm,
    marginRight: Spacing.md,
  },
  toggleIcon: {
    fontSize: 24,
    color: Colors.light.text,
    fontWeight: '600',
  },
  titleContainer: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  titleText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
  },
  dateText: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  userMenu: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: Spacing.md,
    borderLeftWidth: 1,
    borderLeftColor: Colors.light.border,
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2E5090',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  userInfo: {
    justifyContent: 'center',
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
  },
  userRole: {
    fontSize: 11,
    color: Colors.light.textSecondary,
    marginTop: 1,
  },
});
