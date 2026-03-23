# jamroll 文字起こしデータ分析 - 実装ガイド

## 📋 概要

このガイドでは、jamroll API から取得した文字起こしデータを分析し、ユーザー像・使用目的を抽出するシステムの使用方法を説明します。

---

## 🎯 5つのフェーズ

### Phase 1: データ収集 ✅
- jamroll API からデータ取得
- Supabase に保存

**実装ファイル**:
- `src/lib/jamroll.ts` - jamroll API クライアント
- `scripts/import-jamroll-data.py` - Python インポートスクリプト
- `docs/JAMROLL_SUPABASE_SCHEMA.sql` - Supabase テーブル定義

### Phase 2: テキスト分析 ✅
- Claude API で文字起こしを分析
- ユーザー像・使用目的を構造化データとして抽出

**実装ファイル**:
- `src/lib/analyzeTranscription.ts` - Claude 分析エンジン
- `src/lib/analysisCache.ts` - メモリキャッシング

### Phase 3: 統計集計 ✅
- 分析結果を集計・統計化
- セグメント分析を実施

**実装ファイル**:
- `src/lib/aggregateAnalysis.ts` - 統計集計エンジン

### Phase 4: レポート生成 ✅
- Markdown レポート出力
- JSON データ出力

**実装ファイル**:
- `src/lib/generateAnalysisReport.ts` - レポート生成エンジン

### Phase 5: クリエイティブ戦略 📝
- 分析結果に基づきバナー・LP 改善ガイドを作成

**実装予定ファイル**:
- `docs/CREATIVE_STRATEGY.md` - クリエイティブ戦略ドキュメント

---

## 🔧 セットアップ

### 1. Supabase テーブル作成

```bash
# Supabase ダッシュボード → SQL Editor で実行
cat docs/JAMROLL_SUPABASE_SCHEMA.sql | supabase sql
```

または Supabase ダッシュボードの SQL Editor に SQL をコピー&ペーストして実行

### 2. 環境変数設定

`.env.local` に以下を追加:

```bash
# jamroll API
JAMROLL_API_KEY=your_jamroll_api_key_here

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # Node.js スクリプト用

# Claude API (分析用)
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

### 3. 依存パッケージインストール

```bash
# 既に npm install 済みの場合は不要
npm install @anthropic-ai/sdk supabase

# Python スクリプト用
pip install anthropic supabase python-dotenv
```

---

## 📊 使用方法

### **Phase 1: データインポート**

```bash
# Python スクリプトでデータインポート（jamroll → Supabase）
python3 scripts/import-jamroll-data.py
```

実行結果:
- `jamroll_transcriptions` テーブルに文字起こしデータを保存
- ログ: `/tmp/import_jamroll.log`

---

### **Phase 2-4: 分析・レポート生成**

```bash
# TypeScript スクリプトでバッチ分析実行
# （Supabase から未分析データを取得 → Claude で分析 → 保存）

npx ts-node scripts/analyze-jamroll-batch.ts \
  --batch-size 5 \
  --limit 100 \
  --output /tmp/analysis_result.json
```

**パラメータ**:
- `--batch-size`: 並列処理数（デフォルト: 5）
- `--limit`: 分析対象件数（デフォルト: 100）
- `--force`: キャッシュを無視して再分析
- `--output`: 結果ファイルの出力パス

**実行結果**:
- Supabase `user_analysis_cache` テーブルに分析結果を保存
- JSON ファイルに集計結果を出力

---

### **TypeScript コードでの利用**

```typescript
import { analyzeTranscription } from '@/lib/analyzeTranscription';
import { aggregateAnalyses } from '@/lib/aggregateAnalysis';
import { generateMarkdownReport } from '@/lib/generateAnalysisReport';

// 1. 単一の文字起こしを分析
const result = await analyzeTranscription(transcriptText);
// => { persona, usage_purpose, sentiment, key_phrases, confidence }

// 2. 複数の分析結果を集計
const aggregated = aggregateAnalyses([result1, result2, result3, ...]);
// => { personas, usage_purposes, top_keywords, segments, ... }

// 3. Markdown レポート生成
const report = generateMarkdownReport(
  aggregated,
  new Date('2026-03-01'),
  new Date('2026-03-21'),
  'EigoMaster'
);
fs.writeFileSync('/tmp/report.md', report);
```

---

## 📈 分析結果の例

### AnalysisResult（単一分析）

```typescript
{
  persona: {
    age_group: "high school",
    goal: "英検準1級合格",
    challenge: ["リスニング", "スピーキング"],
    motivation: "受験対策"
  },
  usage_purpose: {
    primary: "英検試験対策",
    secondary: ["発音改善", "スピーキング強化"],
    frequency: "週3回",
    session_focus: ["シャドーイング", "発音練習"]
  },
  sentiment: "positive",
  key_phrases: ["英検準1級", "シャドーイング", "リスニング"],
  confidence: 0.92
}
```

### AggregationResult（集計結果）

```typescript
{
  personas: {
    age_groups: { "high school": { count: 45, percentage: 30.0 } },
    goals: { "英検準1級合格": { count: 80, percentage: 53.3 } },
    challenges: { "リスニング": { count: 67, percentage: 44.7 } },
    motivations: { "受験対策": { count: 60, percentage: 40.0 } }
  },
  usage_purposes: {
    primary: { "英検試験対策": { count: 80, percentage: 53.3 } },
    session_focus: { "シャドーイング": { count: 85, percentage: 56.7 } },
    frequency: { "週3回": { count: 70, percentage: 46.7 } }
  },
  top_keywords: [
    { keyword: "英検", frequency: 120, percentage: 80.0 },
    { keyword: "シャドーイング", frequency: 85, percentage: 56.7 }
  ],
  total_transcriptions: 150,
  analyzed_count: 150,
  confidence_avg: 0.87,
  segments: [
    {
      id: "segment_high_school_英検準1級合格",
      name: "high school - 英検準1級合格",
      count: 45,
      percentage: 30.0,
      characteristics: ["リスニング", "シャドーイング"]
    }
  ]
}
```

---

## 🔍 トラブルシューティング

### Q: `JAMROLL_API_KEY` が見つからないエラー

**A**: `.env.local` に `JAMROLL_API_KEY` を設定してください

```bash
echo "JAMROLL_API_KEY=your_key_here" >> .env.local
```

### Q: Claude API のレート制限エラー

**A**: バッチサイズを削減または待機時間を増加させてください

```bash
npx ts-node scripts/analyze-jamroll-batch.ts --batch-size 2
```

### Q: Supabase 接続エラー

**A**: Supabase URL と キーが正しいか確認してください

```bash
# .env.local で確認
grep SUPABASE .env.local
```

---

## 📚 ファイル構成

```
eigomaster/
├── src/lib/
│   ├── jamroll.ts                      # jamroll API クライアント
│   ├── analyzeTranscription.ts         # Claude 分析エンジン
│   ├── analysisCache.ts                # キャッシング機構
│   ├── aggregateAnalysis.ts            # 統計集計エンジン
│   └── generateAnalysisReport.ts       # レポート生成エンジン
├── scripts/
│   ├── import-jamroll-data.py          # データインポート（Python）
│   └── analyze-jamroll-batch.ts        # バッチ分析（TypeScript）
├── docs/
│   ├── JAMROLL_SUPABASE_SCHEMA.sql     # Supabase テーブル定義
│   └── JAMROLL_ANALYSIS_GUIDE.md       # このファイル
```

---

## 🚀 実行例

### 完全な分析フロー

```bash
# 1. Supabase テーブル作成
# → Supabase ダッシュボードで実行

# 2. データインポート（jamroll → Supabase）
python3 scripts/import-jamroll-data.py

# 3. バッチ分析（Supabase から取得 → Claude で分析 → 保存）
npx ts-node scripts/analyze-jamroll-batch.ts \
  --batch-size 5 \
  --limit 100 \
  --output /tmp/analysis.json

# 4. レポート確認
cat /tmp/analysis.json | jq '.'
```

---

## 📊 期待成果

- ✅ ユーザー像の明確化（年齢層、学習目的、課題）
- ✅ 使用目的の把握（セッションフォーカス、頻度）
- ✅ セグメント分析（顧客セグメント特定）
- ✅ クリエイティブ戦略の策定（バナー・LP改善ガイド）
- ✅ KPI 改善（CTR +30-50% 期待）

---

## 🔐 セキュリティ

- ✅ API キーは環境変数で管理（コード に埋め込まない）
- ✅ Supabase RLS ポリシーで SELECT/INSERT/UPDATE 制限
- ✅ Claude API 分析は暗号化通信で実施

---

## 🎯 次ステップ

1. **Phase 5**: クリエイティブ戦略ドキュメント作成
   - バナー・LP 改善ガイド
   - メッセージング戦略
   - A/B テスト計画

2. **実装**: バナー・LP 改善
   - Hero Section テキスト更新
   - Social Proof セクション追加
   - 機能セクション再構成

3. **検証**: A/B テスト実施
   - CTR / CV 測定
   - ユーザー満足度確認

---

## 📞 サポート

質問・トラブルについては、プロジェクト管理者に相談してください。
