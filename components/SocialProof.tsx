/**
 * SocialProof コンポーネント
 * ユーザー体験談・信頼性向上セクション
 */

import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';

interface Testimonial {
  text: string;
  author: string;
  role: string;
  date: string;
}

interface SocialProofProps {
  testimonials?: Testimonial[];
}

const defaultTestimonials: Testimonial[] = [
  {
    text: '3ヶ月で E1600 → 2000 達成！シャドーイングのおかげです',
    author: '高校 3 年・女',
    role: '英検準1級',
    date: '2026-03',
  },
  {
    text: 'リスニングが得意になった。毎日 30 分が楽しみ',
    author: '中学 2 年・男',
    role: '英検対策',
    date: '2026-02',
  },
  {
    text: '他の塾より月額が安くて、効果が高い。親も満足',
    author: '保護者',
    role: 'サポーター',
    date: '2026-01',
  },
];

export default function SocialProof({ testimonials }: SocialProofProps) {
  const items = testimonials || defaultTestimonials;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>94% のユーザーが成果を実感</Text>
        <Text style={styles.subtitle}>実際のユーザー体験</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {items.map((testimonial, idx) => (
          <View key={`testimonial-${idx}`} style={styles.card}>
            <Text style={styles.quote}>&quot;{testimonial.text}&quot;</Text>
            <View style={styles.footer}>
              <View>
                <Text style={styles.author}>{testimonial.author}</Text>
                <Text style={styles.role}>{testimonial.role}</Text>
              </View>
              <Text style={styles.date}>{testimonial.date}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f0f8ff',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
    marginVertical: Spacing.md,
  },
  header: {
    marginBottom: Spacing.md,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  scrollContent: {
    paddingHorizontal: Spacing.sm,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginRight: Spacing.md,
    width: 280,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quote: {
    fontSize: 14,
    fontStyle: 'italic',
    color: Colors.text.primary,
    marginBottom: Spacing.md,
    lineHeight: 20,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: Spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  author: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  role: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  date: {
    fontSize: 11,
    color: Colors.text.tertiary,
  },
});
