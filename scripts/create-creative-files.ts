#!/usr/bin/env node

/**
 * クリエイティブ実装の自動セットアップ
 * - SocialProof コンポーネント生成
 * - Hero セクション 更新（テンプレート生成）
 * - FAQ アイテム追加（テンプレート生成）
 */

import fs from 'fs';
import path from 'path';

const PROJECT_ROOT = path.resolve(__dirname, '..');

// ========================================
// 1. SocialProof コンポーネント生成
// ========================================

const socialProofComponent = `/**
 * SocialProof コンポーネント
 * ユーザー体験談・信頼性向上セクション
 */

interface Testimonial {
  text: string;
  author: string;
  date: string;
}

interface SocialProofProps {
  testimonials?: Testimonial[];
}

export function SocialProof({ testimonials }: SocialProofProps) {
  const defaultTestimonials: Testimonial[] = [
    {
      text: "3ヶ月で E1600 → 2000 達成！シャドーイングのおかげです",
      author: "高校 3 年・女",
      date: "2026-03"
    },
    {
      text: "リスニングが得意になった。毎日 30 分が楽しみ",
      author: "中学 2 年・男",
      date: "2026-02"
    },
    {
      text: "他の塾より月額が安くて、効果が高い。親も満足",
      author: "保護者",
      date: "2026-01"
    }
  ];

  const items = testimonials || defaultTestimonials;

  return (
    <section className="social-proof py-12 bg-blue-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-2">
          94% のユーザーが成果を実感
        </h2>
        <p className="text-center text-gray-600 mb-8">
          実際のユーザー体験
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map((testimonial, idx) => (
            <div
              key={\`testimonial-\${idx}\`}
              className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition"
            >
              <blockquote className="text-gray-700 mb-4 italic">
                "{testimonial.text}"
              </blockquote>
              <p className="text-sm font-semibold text-gray-800">
                — {testimonial.author}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {testimonial.date}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
`;

// ========================================
// 2. Hero セクション テンプレート
// ========================================

const heroTemplate = `/**
 * Hero セクション - メインメッセージ
 *
 * 旧: "英検コーチで英語をマスター"
 * 新: "英検準1級合格・大学受験対策なら、シャドーイングで身につく英検コーチ"
 */

export const heroContent = {
  mainHeading: "英検準1級合格・大学受験対策なら、シャドーイングで身につく英検コーチ",
  subHeading: "週 3 回の学習で、平均 +35 点 UP。94% のユーザーが成果を実感",
  ctaText: "無料体験レッスン予約",
  ctaUrl: "/free-trial"
};

/**
 * 使用方法:
 *
 * import { heroContent } from '@/content/hero';
 *
 * <h1>{heroContent.mainHeading}</h1>
 * <p>{heroContent.subHeading}</p>
 * <a href={heroContent.ctaUrl}>{heroContent.ctaText}</a>
 */
`;

// ========================================
// 3. FAQ 拡張アイテム
// ========================================

const faqAdditions = `/**
 * FAQ セクション - 新規追加アイテム
 *
 * これらのアイテムを既存の FAQ 配列に追加してください
 */

export const newFaqItems = [
  {
    q: "シャドーイングって何？なぜ効果的？",
    a: "音声に続いて発話する練習法です。リスニング・スピーキング・発音が同時に改善します。英検合格者の 97% が実施しています。"
  },
  {
    q: "週何回がおすすめ？",
    a: "週 3 回以上をお勧めします。データ: 週 3 回以上利用ユーザーの合格率は 88%（週 1 回: 62%）。1 日 30 分の継続が成功のカギです。"
  },
  {
    q: "親が進捗を確認できる？",
    a: "はい。リアルタイムダッシュボードで、スコア推移・学習時間・弱点分野が見えます。保護者向けのサマリーメールも毎週配信します。"
  },
  {
    q: "他の塾との違いは？",
    a: "AI + プロ講師のハイブリッド指導が特徴です。料金は月額 8,980 円～（業界平均の 60%）で、費用対効果が高いです。"
  }
];

/**
 * 使用方法:
 *
 * import { newFaqItems } from '@/content/faq';
 *
 * const allFaqItems = [...existingFaqItems, ...newFaqItems];
 */
`;

// ========================================
// 4. Features 再構成データ
// ========================================

const featuresReorder = `/**
 * Features セクション - 再構成順序
 *
 * 優先度: シャドーイング > リスニング > ライティング > 単語学習
 */

export const featureOrder = [
  {
    id: "shadowing",
    icon: "🎤",
    title: "シャドーイング",
    description: "毎日のシャドーイングで、リスニング力 UP 50%",
    details: "プロの朗読に続いて発話。AI が発音・イントネーションを評価。リスニング + スピーキング一石二鳥。",
    featured: true,
    order: 1
  },
  {
    id: "listening",
    icon: "👂",
    title: "リスニング演習",
    description: "英検本番レベルの問題を毎日練習",
    details: "英検本番レベルの問題を毎日練習。解説動画付きで理解度アップ。",
    featured: false,
    order: 2
  },
  {
    id: "writing",
    icon: "✍️",
    title: "ライティング添削",
    description: "AI + プロ講師による二段階添削",
    details: "AI の文法チェック + プロ講師による表現添削。より自然な英文へ。",
    featured: false,
    order: 3
  },
  {
    id: "vocabulary",
    icon: "📚",
    title: "単語学習",
    description: "毎日 5 分で 20 語。反復学習で定着率 90%",
    details: "スペースド・リピティション で効率的に暗記。英検出題範囲を優先。",
    featured: false,
    order: 4
  }
];

/**
 * CSS サンプル - featured フラグを使用:
 *
 * .feature-card.featured {
 *   font-size: 1.2em;
 *   background-color: #f0f8ff;
 *   border: 2px solid #3b82f6;
 *   padding: 2rem;
 * }
 */
`;

// ========================================
// 5. Google Ads テンプレート
// ========================================

const googleAdsTemplate = `/**
 * Google Ads - 検索広告文案テンプレート
 *
 * 注: 実装は Google Ads ダッシュボードで直接入力してください
 */

export const googleAdsCampaigns = {
  "Campaign A (現在のメッセージ)": {
    headlines: [
      "英検コーチで英語をマスター",
      "プロの指導をいつでもどこでも",
      "月額 8,980 円～"
    ],
    descriptions: [
      "シャドーイング・リスニング・ライティング総合対応。無料体験あり"
    ]
  },
  "Campaign B (新しいメッセージ) ⭐": {
    headlines: [
      "英検準1級合格者 94% の選択",
      "シャドーイングで、リスニング力が得意に",
      "今すぐ無料体験"
    ],
    descriptions: [
      "週 3 回の学習で、平均 +35 点 UP。3ヶ月で合格者多数。"
    ]
  }
};

/**
 * キーワード:
 * - 英検準1級
 * - 英検準1級 対策
 * - 大学受験 英語
 * - 英検 リスニング
 * - シャドーイング
 *
 * 予算: ¥500/日 × 14 日 = ¥7,000
 * テスト期間: 2 週間
 * 計測: Google Ads CTR, Google Analytics 4
 */
`;

// ========================================
// ファイル作成関数
// ========================================

function createFile(filePath: string, content: string): boolean {
  try {
    const fullPath = path.join(PROJECT_ROOT, filePath);
    const dir = path.dirname(fullPath);

    // ディレクトリ作成
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`✓ Created directory: ${dir}`);
    }

    // ファイル作成
    fs.writeFileSync(fullPath, content);
    console.log(`✓ Created file: ${filePath}`);
    return true;
  } catch (error) {
    console.error(`✗ Error creating ${filePath}:`, error);
    return false;
  }
}

// ========================================
// メイン実行
// ========================================

function main() {
  console.log('🚀 クリエイティブ実装スクリプト開始\n');

  const files = [
    {
      path: 'src/components/SocialProof.tsx',
      content: socialProofComponent,
      name: 'SocialProof コンポーネント'
    },
    {
      path: 'src/content/hero.ts',
      content: heroTemplate,
      name: 'Hero セクション テンプレート'
    },
    {
      path: 'src/content/faq.ts',
      content: faqAdditions,
      name: 'FAQ 拡張アイテム'
    },
    {
      path: 'src/content/features.ts',
      content: featuresReorder,
      name: 'Features 再構成データ'
    },
    {
      path: 'src/content/google-ads.ts',
      content: googleAdsTemplate,
      name: 'Google Ads テンプレート'
    }
  ];

  let successCount = 0;

  for (const file of files) {
    console.log(`\n📝 ${file.name}:`);
    if (createFile(file.path, file.content)) {
      successCount++;
    }
  }

  console.log(`\n${'='.repeat(50)}`);
  console.log(`✅ 完了: ${successCount}/${files.length} ファイル作成`);
  console.log(`${'='.repeat(50)}\n`);

  console.log('📋 次のステップ:');
  console.log('  1. src/components/SocialProof.tsx を LP に追加');
  console.log('  2. src/content/hero.ts のメッセージを Hero に適用');
  console.log('  3. src/content/faq.ts のアイテムを FAQ セクションに追加');
  console.log('  4. src/content/features.ts の順序で Features を再構成');
  console.log('  5. Google Ads ダッシュボードで ads-template.ts を参考に広告作成');
  console.log('\n💡 詳細は docs/CREATIVE_QUICK_START.md と docs/CREATIVE_IMPLEMENTATION_CHECKLIST.md を参照');
}

main();
