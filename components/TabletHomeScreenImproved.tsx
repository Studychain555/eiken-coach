/**
 * Improved Tablet Home Screen
 * 改善されたメッセージング & コンポーネント統合版
 * - ImprovedHeroHeader: 「シャドーイング」「94% 成果」を強調
 * - FeaturesReordered: シャドーイングを最優先
 * - SocialProof: ユーザー体験談
 * - ExpandedFAQ: 新しい 4 つの FAQ
 */

import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing } from '@/constants/theme';

// 改善されたコンポーネント
import ImprovedHeroHeader from './ImprovedHeroHeader';
import FeaturesReordered from './FeaturesReordered';
import SocialProof from './SocialProof';
import ExpandedFAQ from './ExpandedFAQ';

interface TabletHomeScreenImprovedProps {
  onRefresh?: () => void;
}

export default function TabletHomeScreenImproved({
  onRefresh,
}: TabletHomeScreenImprovedProps) {
  const router = useRouter();

  const handleCTAPress = () => {
    // CTA ボタン時のアクション
    console.log('CTA: 無料体験レッスン予約');
    // ナビゲーション例:
    // router.push('/free-trial');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        scrollEnabled={true}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* 1️⃣ 改善されたHeroセクション */}
        <ImprovedHeroHeader
          userName="User"
          onCTAPress={handleCTAPress}
        />

        {/* 2️⃣ 機能セクション（再構成：シャドーイング優先） */}
        <FeaturesReordered />

        {/* 3️⃣ Social Proof セクション（ユーザー体験談） */}
        <SocialProof />

        {/* 4️⃣ 拡張 FAQ セクション */}
        <ExpandedFAQ />

        {/* フッター */}
        <View style={styles.footer}>
          <View style={styles.footerContent}>
            <View style={styles.bulletPoint}>
              <View style={styles.bullet} />
              <Text style={styles.bulletText}>
                無料体験レッスンで効果を実感
              </Text>
            </View>
            <View style={styles.bulletPoint}>
              <View style={styles.bullet} />
              <Text style={styles.bulletText}>
                返金保証付きで安心
              </Text>
            </View>
            <View style={styles.bulletPoint}>
              <View style={styles.bullet} />
              <Text style={styles.bulletText}>
                毎日 30 分で確実な成長
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// テキストコンポーネント（外部依存なし）
function Text(props: any) {
  const { style, children, ...rest } = props;
  return (
    <view.Text style={style} {...rest}>
      {children}
    </view.Text>
  );
}

import * as view from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  footer: {
    backgroundColor: '#f8f9fa',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  footerContent: {
    gap: Spacing.md,
  },
  bulletPoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    marginRight: Spacing.md,
    marginTop: 6,
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
});
