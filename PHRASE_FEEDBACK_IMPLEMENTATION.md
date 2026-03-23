# フレーズ単位シャドーイングフィードバック実装ガイド

## 概要

英検準1級向けのシャドーイング学習において、フレーズ単位（2-5語）での詳細なフィードバック表示を実装しました。ユーザーは「この文句はこう読むべき」と視覚的・直感的に理解できるようになります。

## 実装内容

### 1. **新規コンポーネント: PhraseDetailModal.tsx**

フレーズをタップした時に表示するモーダルコンポーネント。

**特徴:**
- ✅ フレーズ（2-5語）を大きく表示
- ✅ ステータス（good/needsWork/major）で色分け
  - `good`: 緑 (#52C41A)
  - `needsWork`: 黄 (#FAAD14)
  - `major`: 赤 (#F5222D)
- ✅ 正しい読み方をカタカナで大きく表示
- ✅ ユーザーの読み方（異なる場合）
- ✅ 問題点をアイコン+ラベル+説明で表示
  - 🔗 リンキング（単語間の連結）
  - ⬇️ リダクション（音の削減）
  - 💪 ストレス（強弱アクセント）
  - 📈 イントネーション（イントネーション）
  - 🗣️ 発音（音の発音）
- ✅ 改善のコツ（tip）を目立つボックスで表示
- ✅ 具体例（example）を記載

**ファイルパス:**
```
/Users/80dr/eigomaster/src/components/PhraseDetailModal.tsx
```

### 2. **修正: DetailedShadowingFeedback.tsx**

既存の単語単位フィードバック表示を拡張。

**変更点:**
- ✅ インターフェース更新：`phraseFeedbacks` と `wordFeedbacks` の両方をサポート
- ✅ フレーズレベルのセクション追加（「🎯 フレーズ単位の分析」）
- ✅ 各フレーズカード表示：
  - フレーズテキスト（ステータスでアイコン色分け）
  - 正しい読み方（カタカナ）
  - 問題点タグ（linking/reduction/stress等）
  - 「タップで詳細表示」インジケータ
- ✅ `PhraseDetailModal` をインポート・統合
- ✅ タップ時に `PhraseDetailModal` を表示
- ✅ 既存の単語単位フィードバックは条件分岐で表示（`showWordLevel`）

**ファイルパス:**
```
/Users/80dr/eigomaster/src/components/DetailedShadowingFeedback.tsx
```

### 3. **修正: ShadowingResultScreen.tsx**

ラウンド結果画面から詳細分析へのアクセス実装。

**変更点:**
- ✅ `showDetailedModal` ステート追加
- ✅ 「📝 詳細な分析を見る」ボタン→ `DetailedShadowingFeedback` フルスクリーン表示
- ✅ `phraseFeedbacks` と `wordFeedbacks` をレコードから取得して渡す
- ✅ モーダルオーバーレイスタイル追加

**ファイルパス:**
```
/Users/80dr/eigomaster/src/components/ShadowingResultScreen.tsx
```

### 4. **修正: ShadowingScreen.tsx**

スコアリング結果から詳細フィードバックを取得・保存。

**変更点:**
- ✅ `addRecord()` 呼び出し時に `phraseFeedbacks` と `wordFeedbacks` を含める
- ✅ `result.phraseFeedbacks` と `result.wordFeedbacks` をレコードに保存

**ファイルパス:**
```
/Users/80dr/eigomaster/src/components/ShadowingScreen.tsx
```

### 5. **修正: shadowingStore.ts**

Zustand ストア：レコード型とSync機能の更新。

**変更点:**
- ✅ `ShadowingRecord` インターフェースに `phraseFeedbacks` と `wordFeedbacks` を追加
- ✅ `syncToSupabase()` 更新：JSON stringify で保存
- ✅ `loadFromSupabase()` 更新：JSON parse で復元
- ✅ `initializeSync()` 更新：リアルタイム同期に対応

**ファイルパス:**
```
/Users/80dr/eigomaster/src/stores/shadowingStore.ts
```

### 6. **更新: aiScoringService.ts**（既存、確認済）

`phraseFeedbacks` の構造体定義とダミー生成関数：

```typescript
export interface PhraseFeedback {
  phrase: string;                      // フレーズ（例："the future will be"）
  status: 'good' | 'needsWork' | 'major';
  correctReading?: string;             // カタカナ読み（例："ザ フューチャー ウィル ビー"）
  yourVersion?: string;                // ユーザーの読み方
  issues: {
    type: 'linking' | 'reduction' | 'stress' | 'intonation' | 'pronunciation';
    description: string;               // 具体的な問題説明
    tip: string;                       // 改善のコツ（日本語）
  }[];
  example?: string;                    // 具体例
}
```

## データフロー

```
ShadowingScreen
  ↓
scoreShaddowingRecording(script, transcript)
  ↓
Claude API（フレーズ分析を返す）
  ↓
ScoringResult { phraseFeedbacks: [...], ... }
  ↓
addRecord({ phraseFeedbacks, ... })  // Zustand ストアに保存
  ↓
ShadowingResultScreen
  ↓
「📝 詳細な分析を見る」をタップ
  ↓
DetailedShadowingFeedback
  ├→ 「🎯 フレーズ単位の分析」セクション表示
  │   ├→ フレーズカード1
  │   ├→ フレーズカード2
  │   └→ フレーズカード...
  │
  └→ フレーズをタップ
      ↓
      PhraseDetailModal（全詳細表示）
```

## UI/UX デザイン

### ステータス別色分け

| ステータス | 色 | 意味 |
|-----------|-----|------|
| `good` | 緑 (#52C41A) | ✅ 正しく発音できている |
| `needsWork` | 黄 (#FAAD14) | ⚠️ 改善が必要 |
| `major` | 赤 (#F5222D) | ❌ 大きな問題がある |

### Issue Type アイコン

| Type | アイコン | 説明 |
|------|---------|------|
| `linking` | 🔗 | 単語間の連結（/t/ + vowel等） |
| `reduction` | ⬇️ | リダクション（schwa reduction等） |
| `stress` | 💪 | ワードストレス・センテンスストレス |
| `intonation` | 📈 | イントネーション・抑揚 |
| `pronunciation` | 🗣️ | 個々の音の発音精度 |

### フレーズカードの見た目

```
┌─────────────────────────────────────┐
│ ✅ the future will be              │ ← ステータスアイコン + フレーズ
├─────────────────────────────────────┤
│ 正しい読み方:                        │
│ ザ フューチャー ウィル ビー          │ ← 大きく目立つ
├─────────────────────────────────────┤
│ 問題点:                              │
│ [🔗 リンキング] [💪 ストレス]       │
├─────────────────────────────────────┤
│ タップで詳細表示 →                   │
└─────────────────────────────────────┘
```

### PhraseDetailModal の見た目

```
┌──────────────────────────────────────┐
│ ✕       フレーズ詳細       [spacer]  │
├──────────────────────────────────────┤
│                                      │
│ フレーズ                              │
│ ┌──────────────────────────────────┐ │
│ │  the future will be              │ │
│ └──────────────────────────────────┘ │
│                                      │
│ 評価                                  │
│ ┌──────────────────────────────────┐ │
│ │ ⚠️ 改善が必要                     │ │
│ └──────────────────────────────────┘ │
│                                      │
│ 正しい読み方（カタカナ）             │
│ ┌──────────────────────────────────┐ │
│ │  ザ フューチャー ウィル ビー      │ │
│ └──────────────────────────────────┘ │
│                                      │
│ 問題点と改善のコツ                    │
│ ┌──────────────────────────────────┐ │
│ │ 🔗 リンキング                     │ │
│ │ 「will」と「be」を繋ぐ時に...    │ │
│ │ ┌────────────────────────────┐  │ │
│ │ │ 💡 「r」の音を明確に...    │  │ │
│ │ └────────────────────────────┘  │ │
│ └──────────────────────────────────┘ │
│                                      │
│           [  閉じる  ]                │
└──────────────────────────────────────┘
```

## 使用技術

- **React Native**: UI コンポーネント
- **Zustand**: 状態管理（フィードバック情報の永続化）
- **TypeScript**: 型安全性
- **NaturalColors/Spacing/BorderRadius**: テーマ定数（既存）

## テストシナリオ

### シナリオ1: フレーズレベルのフィードバック表示

1. シャドーイング7ラウンド完了
2. 結果画面で「📝 詳細な分析を見る」をタップ
3. `DetailedShadowingFeedback` が表示される
4. 「🎯 フレーズ単位の分析」セクションが表示される
5. 複数のフレーズカードが表示される
6. **期待結果**: ステータス別に色分けされたフレーズカードが見やすく表示される

### シナリオ2: フレーズ詳細モーダル表示

1. フレーズカードをタップ
2. `PhraseDetailModal` が画面いっぱいに表示される
3. フレーズ、評価、カタカナ読み、問題点、改善のコツが詳しく表示される
4. 「閉じる」をタップして戻る
5. **期待結果**: 学習者が「何が問題なのか」「どう改善すべきか」を明確に理解できる

### シナリオ3: 単語単位フィードバックも表示

1. `wordFeedbacks` がある場合、「📝 各単語の評価」セクションも表示
2. フレーズ → 単語の段階的な分析が可能
3. **期待結果**: 粒度の異なるフィードバックが並行表示される

## 今後の拡張案

- [ ] オーディオWaveform表示（ユーザーの音声と正解の音声を比較）
- [ ] リプレイ機能（該当フレーズの音声を再生）
- [ ] 発音スペクトログラム表示（周波数解析）
- [ ] フレーズごとのスコア個別表示
- [ ] ソーシャルシェア機能（「この表現が得意」「この表現が苦手」の共有）
- [ ] AIによる追加説明（「なぜこの読み方？」の理由を自然言語で説明）

## トラブルシューティング

### Q: phraseFeedbacks が表示されない

**A:** 以下を確認してください:
1. `aiScoringService.ts` で `generatePhraseFeedbacks()` が実行されているか
2. `ShadowingScreen.tsx` で `addRecord()` に `phraseFeedbacks` を渡しているか
3. `DetailedShadowingFeedback` コンポーネントが `phraseFeedbacks` プロップを受け取っているか

### Q: フレーズカードの色が正しくない

**A:** `getPhraseStatusColor()` と `getPhraseStatusBgColor()` の値を確認:
- `good`: rgba(82, 196, 26, 0.1) 背景 + #52C41A 枠
- `needsWork`: rgba(250, 173, 20, 0.1) 背景 + #FAAD14 枠
- `major`: rgba(245, 34, 45, 0.1) 背景 + #F5222D 枠

### Q: Issue アイコンが表示されない

**A:** `ISSUE_ICONS` と `ISSUE_LABELS` の keys が issue.type と一致しているか確認:
```typescript
const ISSUE_ICONS: Record<string, string> = {
  linking: '🔗',
  reduction: '⬇️',
  stress: '💪',
  intonation: '📈',
  pronunciation: '🗣️',
};
```

## まとめ

このフレーズ単位フィードバック実装により、英検準1級受験者が以下を実現できます：

✅ **視覚的理解**: 色分けされたステータスで瞬時に判断
✅ **詳細な学習**: フレーズ→問題点→改善のコツの段階的学習
✅ **学習効率向上**: 発音練習の焦点が明確化
✅ **動機付け向上**: 達成感（good）と改善ポイント（needsWork/major）の明確な提示

---

**最終更新**: 2026-03-20
**実装者**: Claude AI
**テスト状況**: 準備完了（実際の実行テストは必要）
