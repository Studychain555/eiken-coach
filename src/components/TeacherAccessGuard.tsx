/**
 * TeacherAccessGuard コンポーネント
 * 講師（teacher/admin）ロールのアクセス制御を提供
 * 権限がないユーザーはホーム画面にリダイレクト
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/src/stores/authStore';
import { NaturalColors, Spacing } from '@/constants/theme';

interface TeacherAccessGuardProps {
  children: React.ReactNode;
  requiredRole?: 'teacher' | 'admin';
}

/**
 * 講師ページへのアクセス制御
 * student ロールのユーザーはホームにリダイレクト
 */
export default function TeacherAccessGuard({
  children,
  requiredRole = 'teacher',
}: TeacherAccessGuardProps) {
  const role = useAuthStore(state => state.role);
  const router = useRouter();
  const allowedRoles = requiredRole === 'admin' ? ['admin'] : ['teacher', 'admin'];
  const hasAccess = role ? allowedRoles.includes(role) : false;

  useEffect(() => {
    if (!hasAccess) {
      console.warn('[TeacherAccessGuard] Access denied');
      router.replace('/(tabs)');
    }
  }, [hasAccess, router]);

  if (!hasAccess) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>🔒 アクセス制限</Text>
          <Text style={styles.text}>このページは講師向け管理画面です</Text>
          <Text style={styles.subText}>公開版では学習画面から利用してください</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.replace('/(tabs)')}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>ホームへ戻る</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // 権限がある場合（teacher/admin）
  return <>{children}</>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NaturalColors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: NaturalColors.textDark,
    marginBottom: Spacing.lg,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    color: NaturalColors.textDark,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  subText: {
    fontSize: 14,
    color: NaturalColors.textMedium,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  button: {
    backgroundColor: NaturalColors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: 999,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
});
