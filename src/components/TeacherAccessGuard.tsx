/**
 * TeacherAccessGuard コンポーネント
 * 講師（teacher/admin）ロールのアクセス制御を提供
 * 権限がないユーザーはホーム画面にリダイレクト
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/src/stores/authStore';
import { NaturalColors, Spacing, BorderRadius } from '@/constants/theme';

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

  useEffect(() => {
    // ロール確認：student の場合はホームにリダイレクト
    if (role && role === 'student') {
      console.warn('[TeacherAccessGuard] Access denied: insufficient role');
      router.replace('/(tabs)/');
    }
  }, [role, router]);

  // ロール確認中（loading）
  if (!role) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.text}>読み込み中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // 権限がない場合（student）
  if (role === 'student') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>🔒 アクセス制限</Text>
          <Text style={styles.text}>このページにアクセスする権限がありません</Text>
          <Text style={styles.subText}>講師のみがアクセス可能です</Text>
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
  },
});
