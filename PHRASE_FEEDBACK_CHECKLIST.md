# フレーズ単位フィードバック実装チェックリスト

## ✅ 実装完了項目

### コンポーネント作成・修正

- [x] **PhraseDetailModal.tsx** - 新規作成
  - フレーズ詳細表示用モーダル
  - ステータス別色分け
  - Issue タイプ別アイコン表示
  - 改善のコツ（tip）を目立つボックスで表示

- [x] **DetailedShadowingFeedback.tsx** - 修正
  - `phraseFeedbacks` プロップ追加
  - フレーズレベルセクション実装
  - `PhraseDetailModal` 統合
  - タップハンドラー実装

- [x] **ShadowingResultScreen.tsx** - 修正
  - `showDetailedModal` ステート追加
  - 「詳細な分析を見る」ボタン実装
  - `DetailedShadowingFeedback` への phraseFeedbacks 受け渡し

- [x] **ShadowingScreen.tsx** - 修正
  - `scoreShaddowingRecording()` 結果から `phraseFeedbacks` 取得
  - `addRecord()` に `phraseFeedbacks` と `wordFeedbacks` を含める

- [x] **shadowingStore.ts** - 修正
  - `ShadowingRecord` インターフェース更新
  - `syncToSupabase()` 更新（JSON stringify）
  - `loadFromSupabase()` 更新（JSON parse）
  - `initializeSync()` 更新（リアルタイム同期対応）

### スタイル・デザイン

- [x] ステータス別色分け実装
  - good: 緑 (#52C41A)
  - needsWork: 黄 (#FAAD14)
  - major: 赤 (#F5222D)

- [x] Issue タイプ別アイコン実装
  - 🔗 リンキング
  - ⬇️ リダクション
  - 💪 ストレス
  - 📈 イントネーション
  - 🗣️ 発音

- [x] フレーズカード UI 実装
  - フレーズテキスト
  - 正しい読み方（カタカナ）
  - 問題点タグ
  - タップインジケータ

- [x] PhraseDetailModal UI 実装
  - フレーズ表示
  - 評価ステータス
  - カタカナ読み（大きく）
  - ユーザーの読み方
  - 問題点詳細
  - 改善のコツ（💡ボックス）
  - 具体例

### データフロー

- [x] Claude API → phraseFeedbacks 取得（既存 `aiScoringService.ts`）
- [x] phraseFeedbacks → ShadowingRecord に保存
- [x] ShadowingRecord → Zustand ストア管理
- [x] DetailedShadowingFeedback へ phraseFeedbacks 受け渡し
- [x] PhraseDetailModal 表示時にデータ提供

### ドキュメント

- [x] PHRASE_FEEDBACK_IMPLEMENTATION.md - 詳細ガイド
- [x] PHRASE_FEEDBACK_CHECKLIST.md - このファイル

---

## 🔍 検証方法

### 1. TypeScript コンパイルチェック

```bash
cd /Users/80dr/eigomaster
npm run type-check
# または
tsc --noEmit
```

### 2. コンポーネント単体テスト

各コンポーネントのインポート・エクスポート確認:
```bash
# 構文エラーがないか確認
grep -n "export default" src/components/{ShadowingScreen,ShadowingResultScreen,DetailedShadowingFeedback,PhraseDetailModal}.tsx
```

### 3. ストア更新確認

```bash
# ShadowingRecord の新フィールドを確認
grep -A 5 "export interface ShadowingRecord" src/stores/shadowingStore.ts
```

### 4. ビルドテスト

```bash
cd /Users/80dr/eigomaster
npm run build
# または
expo build
```

---

## 🎯 期待される動作

### ユーザーフロー

1. **シャドーイング実行**
   - 7ラウンド完了
   - 各ラウンドで Claude AI が phraseFeedbacks を生成

2. **結果表示**
   - 平均スコア表示
   - 改善度表示

3. **詳細分析表示**
   - 「📝 詳細な分析を見る」ボタンをタップ
   - `DetailedShadowingFeedback` フルスクリーン表示

4. **フレーズレベル確認**
   - 「🎯 フレーズ単位の分析」セクション
   - 複数フレーズカード表示
   - ステータス別に色分け表示

5. **フレーズ詳細確認**
   - フレーズカードをタップ
   - `PhraseDetailModal` 表示
   - 全詳細情報表示（カタカナ読み、問題点、改善のコツ等）

6. **閉じて戻る**
   -「閉じる」ボタン → DetailedShadowingFeedback
   - もう一度フレーズカードをタップしたり、スクロールしたり
   - 最終的には ShadowingResultScreen に戻る

---

## ⚠️ 注意事項

### Supabase スキーマ更新（必要な場合）

以下のカラムが `shadowing_records` テーブルに存在することを確認してください：

```sql
-- 新規カラム追加（必要に応じて）
ALTER TABLE shadowing_records ADD COLUMN phrase_feedbacks JSONB;
ALTER TABLE shadowing_records ADD COLUMN word_feedbacks JSONB;
```

### モバイル環境でのテスト

- iOS/Android でのレイアウト確認
- タッチレスポンス確認
- モーダル表示・非表示のアニメーション確認
- スクロール動作確認

### パフォーマンス考慮

- phraseFeedbacks が大量の場合の表示パフォーマンス
- フレーズ数制限（推奨: 最大 10-15 フレーズ/ラウンド）
- JSON のシリアライズ・デシリアライズ負荷

---

## 🚀 デプロイ前チェック

- [ ] TypeScript コンパイルエラーなし
- [ ] ESLint 警告なし
- [ ] コンポーネント import 確認
- [ ] 型安全性確認（`any` の使用最小化）
- [ ] Supabase スキーマ更新完了
- [ ] 環境変数設定確認
- [ ] ローカルテスト完了
- [ ] ビルドテスト完了
- [ ] 本番環境プレビュー確認

---

## 📝 コードレビューポイント

### PhraseDetailModal.tsx

✅ 確認項目:
- [ ] Modal の open/close がスムーズか
- [ ] ステータス色が正確か
- [ ] アイコンが正しく表示されるか
- [ ] テキスト量が多い場合のスクロール対応

### DetailedShadowingFeedback.tsx

✅ 確認項目:
- [ ] phraseFeedbacks の存在判定（showPhraseLevel）
- [ ] wordFeedbacks の存在判定（showWordLevel）
- [ ] フレーズカードタップ時の handlePhrasePress 呼び出し
- [ ] 色分け関数（getPhraseStatusColor, getPhraseStatusBgColor）の正確性

### ShadowingResultScreen.tsx

✅ 確認項目:
- [ ] showDetailedModal ステートの初期化
- [ ] 詳細分析ボタンのタップハンドラー
- [ ] モーダルオーバーレイ（z-index: 999）
- [ ] DetailedShadowingFeedback へのプロップ受け渡し（全て正確か）

### shadowingStore.ts

✅ 確認項目:
- [ ] phraseFeedbacks と wordFeedbacks の型安全性
- [ ] JSON stringify/parse の エラーハンドリング
- [ ] Supabase sync の完全性

---

## 📞 サポート

何か問題が発生した場合：

1. **コンパイルエラー**: TypeScript 型を確認
2. **表示されない**: コンソールで console.log() で データフロー確認
3. **スタイル崩れ**: Spacing/BorderRadius/NaturalColors 定数を確認
4. **パフォーマンス**: phraseFeedbacks の サイズと数を確認

---

**実装完了日**: 2026-03-20
**バージョン**: 1.0.0
