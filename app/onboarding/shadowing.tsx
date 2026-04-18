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
    // スキップ後はそのまま学習画面へ移動
    router.push('/(tabs)');
  };

  const handleComplete = () => {
    // 「始める」後はそのまま学習画面へ移動
    router.push('/(tabs)');
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
