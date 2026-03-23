/**
 * Shadowing Onboarding Page
 * 登録前シャドーイングチュートリアル画面
 */

import React from 'react';
import { SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import ShadowingOnboarding from '@/src/components/ShadowingOnboarding';

export default function ShadowingOnboardingPage() {
  const router = useRouter();

  const handleSkip = () => {
    // スキップボタンが押された場合、登録画面へ遷移
    router.push('/(auth)/register');
  };

  const handleComplete = () => {
    // 「始める」ボタンが押された場合、登録画面へ遷移
    router.push('/(auth)/register');
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ShadowingOnboarding
        onSkip={handleSkip}
        onComplete={handleComplete}
      />
    </SafeAreaView>
  );
}
