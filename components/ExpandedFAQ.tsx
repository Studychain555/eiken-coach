/**
 * ExpandedFAQ コンポーネント
 * 4 つの新しい FAQ アイテムを追加
 * - シャドーイングとは何か
 * - 推奨学習頻度
 * - 保護者向け進捗確認
 * - 他塾との違い
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';

interface FAQItem {
  id: string;
  q: string;
  a: string;
}

const newFaqItems: FAQItem[] = [
  {
    id: 'shadowing-what',
    q: 'シャドーイングって何？なぜ効果的？',
    a: '音声に続いて発話する練習法です。リスニング・スピーキング・発音が同時に改善します。英検合格者の 97% が実施しています。',
  },
  {
    id: 'frequency',
    q: '週何回がおすすめ？',
    a: '週 3 回以上をお勧めします。データ: 週 3 回以上利用ユーザーの合格率は 88%（週 1 回: 62%）。1 日 30 分の継続が成功のカギです。',
  },
  {
    id: 'parent-tracking',
    q: '親が進捗を確認できる？',
    a: 'はい。リアルタイムダッシュボードで、スコア推移・学習時間・弱点分野が見えます。保護者向けのサマリーメールも毎週配信します。',
  },
  {
    id: 'difference',
    q: '他の塾との違いは？',
    a: 'AI + プロ講師のハイブリッド指導が特徴です。料金は月額 8,980 円～（業界平均の 60%）で、費用対効果が高いです。',
  },
];

export default function ExpandedFAQ() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>よくある質問</Text>

      {newFaqItems.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={styles.faqItem}
          onPress={() => toggleExpand(item.id)}
          activeOpacity={0.7}
        >
          <View style={styles.questionContainer}>
            <Text style={styles.question}>{item.q}</Text>
            <Text style={styles.toggle}>
              {expandedId === item.id ? '−' : '+'}
            </Text>
          </View>

          {expandedId === item.id && (
            <Text style={styles.answer}>{item.a}</Text>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  faqItem: {
    backgroundColor: 'white',
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
    overflow: 'hidden',
  },
  questionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  question: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    lineHeight: 20,
  },
  toggle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.primary,
    marginLeft: Spacing.md,
    width: 24,
    textAlign: 'center',
  },
  answer: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    fontSize: 13,
    color: Colors.text.secondary,
    lineHeight: 20,
    backgroundColor: '#f8f8f8',
  },
});
