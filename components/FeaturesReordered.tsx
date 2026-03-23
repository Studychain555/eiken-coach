/**
 * FeaturesReordered コンポーネント
 * 優先度順に再構成:
 * 1️⃣ シャドーイング (56.7% - 最重要)
 * 2️⃣ リスニング演習 (40%)
 * 3️⃣ ライティング添削 (30%)
 * 4️⃣ 単語学習 (セカンダリ)
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';

interface Feature {
  id: string;
  icon: string;
  title: string;
  description: string;
  details: string;
  order: number;
  featured?: boolean;
}

const features: Feature[] = [
  {
    id: 'shadowing',
    icon: '🎤',
    title: 'シャドーイング',
    description: '毎日のシャドーイングで、リスニング力 UP 50%',
    details: 'プロの朗読に続いて発話。AI が発音・イントネーションを評価。',
    order: 1,
    featured: true,
  },
  {
    id: 'listening',
    icon: '👂',
    title: 'リスニング演習',
    description: '英検本番レベルの問題を毎日練習',
    details: '英検本番レベルの問題を毎日練習。解説動画付き。',
    order: 2,
  },
  {
    id: 'writing',
    icon: '✍️',
    title: 'ライティング添削',
    description: 'AI + プロ講師による二段階添削',
    details: 'AI の文法チェック + プロ講師による表現添削。',
    order: 3,
  },
  {
    id: 'vocabulary',
    icon: '📚',
    title: '単語学習',
    description: '毎日 5 分で 20 語。反復学習で定着率 90%',
    details: 'スペースド・リピティション で効率的に暗記。',
    order: 4,
  },
];

export default function FeaturesReordered() {
  const sortedFeatures = [...features].sort((a, b) => a.order - b.order);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>主要機能</Text>

      <ScrollView
        scrollEnabled={false}
        contentContainerStyle={styles.featuresContainer}
      >
        {sortedFeatures.map((feature) => (
          <View
            key={feature.id}
            style={[
              styles.card,
              feature.featured && styles.cardFeatured,
            ]}
          >
            <Text style={styles.icon}>{feature.icon}</Text>

            <View style={styles.content}>
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.description}>{feature.description}</Text>
              <Text style={styles.details}>{feature.details}</Text>
            </View>

            {feature.featured && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>⭐ 最優先</Text>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  featuresContainer: {
    gap: Spacing.md,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardFeatured: {
    backgroundColor: '#f0f8ff',
    borderWidth: 2,
    borderColor: Colors.primary,
    padding: Spacing.lg,
  },
  icon: {
    fontSize: 32,
    marginRight: Spacing.md,
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  description: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  details: {
    fontSize: 13,
    color: Colors.text.secondary,
    lineHeight: 18,
  },
  badge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    marginLeft: Spacing.sm,
  },
  badgeText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 11,
  },
});
