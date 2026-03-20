import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/src/stores/authStore';
import { Colors, Spacing, BorderRadius, Shadows, Typography } from '@/constants/theme';
import { OptimizedButton } from '@/components/OptimizedButton';

export default function SettingsScreen() {
  const router = useRouter();
  const { user, signOut } = useAuthStore();

  const handleLogout = async () => {
    try {
      await signOut();
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>⚙️ 設定</Text>
        </View>

        {/* User Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>アカウント情報</Text>
          <View style={styles.settingCard}>
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>メールアドレス</Text>
              <Text style={styles.settingValue}>{user?.email || 'ログインしていません'}</Text>
            </View>
            <View style={styles.settingDivider} />
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>ユーザーID</Text>
              <Text style={styles.settingValue}>{user?.id?.substring(0, 8) || '-'}</Text>
            </View>
          </View>
        </View>

        {/* Learning Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>学習設定</Text>
          <View style={styles.settingCard}>
            <View style={styles.settingItem}>
              <View>
                <Text style={styles.settingLabel}>通知</Text>
                <Text style={styles.settingDesc}>学習リマインダーを受け取る</Text>
              </View>
              <Text style={styles.toggleText}>オン</Text>
            </View>
            <View style={styles.settingDivider} />
            <View style={styles.settingItem}>
              <View>
                <Text style={styles.settingLabel}>難易度</Text>
                <Text style={styles.settingDesc}>現在: 中級</Text>
              </View>
              <Text style={styles.toggleText}>変更</Text>
            </View>
            <View style={styles.settingDivider} />
            <View style={styles.settingItem}>
              <View>
                <Text style={styles.settingLabel}>ダークモード</Text>
                <Text style={styles.settingDesc}>目に優しいテーマ</Text>
              </View>
              <Text style={styles.toggleText}>オフ</Text>
            </View>
          </View>
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>アプリについて</Text>
          <View style={styles.settingCard}>
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>バージョン</Text>
              <Text style={styles.settingValue}>1.0.0</Text>
            </View>
            <View style={styles.settingDivider} />
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>キャッシュサイズ</Text>
              <Text style={styles.settingValue}>12 MB</Text>
            </View>
            <View style={styles.settingDivider} />
            <TouchableOpacity style={styles.settingItemButton}>
              <View>
                <Text style={styles.settingLabel}>プライバシーポリシー</Text>
              </View>
              <Text style={styles.linkArrow}>→</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout Button */}
        <View style={styles.section}>
          <OptimizedButton
            label="ログアウト"
            onPress={handleLogout}
            variant="danger"
            size="lg"
            fullWidth
            icon="🚪"
            iconPosition="left"
          />
        </View>

        {/* Support */}
        <View style={styles.supportSection}>
          <Text style={styles.supportText}>
            問題が発生した場合は、サポートまでお問い合わせください。
          </Text>
          <TouchableOpacity style={styles.supportButton}>
            <Text style={styles.supportButtonText}>お問い合わせ</Text>
          </TouchableOpacity>
        </View>
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
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.light.text,
  },
  section: {
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.light.textSecondary,
    marginBottom: Spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingCard: {
    backgroundColor: Colors.light.surfaceCard,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.sm,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  settingItemButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: Spacing.xs,
  },
  settingDesc: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginTop: Spacing.xs,
  },
  settingValue: {
    fontSize: 14,
    color: Colors.light.primary,
    fontWeight: '600',
  },
  settingDivider: {
    height: 1,
    backgroundColor: Colors.light.border,
  },
  toggleText: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    fontWeight: '600',
  },
  linkArrow: {
    fontSize: 16,
    color: Colors.light.primary,
    fontWeight: '600',
  },
  supportSection: {
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.light.primaryLight,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  supportText: {
    fontSize: 14,
    color: Colors.light.text,
    marginBottom: Spacing.md,
    textAlign: 'center',
    lineHeight: 20,
  },
  supportButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.light.primary,
    borderRadius: BorderRadius.lg,
  },
  supportButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
});
