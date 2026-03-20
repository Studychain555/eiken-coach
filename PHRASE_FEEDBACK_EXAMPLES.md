# フレーズ単位フィードバック - コード実装例

## 例1: フレーズフィードバックのデータ構造

### 入力スクリプト
```
"The future will be shaped by our choices."
```

### 出力（phraseFeedbacks）

```json
[
  {
    "phrase": "The future will",
    "status": "good",
    "correctReading": "ザ フューチャー ウィル",
    "yourVersion": null,
    "issues": [],
    "example": null
  },
  {
    "phrase": "be shaped by",
    "status": "needsWork",
    "correctReading": "ビー シェイプド バイ",
    "yourVersion": "ビー シェップ バイ",
    "issues": [
      {
        "type": "reduction",
        "description": "「shaped」の「-ed」が弱くなっている（リダクション）",
        "tip": "「shap」+「d」ではなく「shāpd」で「d」を明確に発音してください。"
      },
      {
        "type": "linking",
        "description": "「by」の「b」が前の「shaped」と分離している",
        "tip": "「d」と「b」を繋げてスムーズに流す意識を持ちましょう。"
      }
    ],
    "example": "compared to: \"be changed by\" (正しい流暢さ)"
  },
  {
    "phrase": "our choices",
    "status": "major",
    "correctReading": "アワー チョイシズ",
    "yourVersion": "オア チョイス",
    "issues": [
      {
        "type": "pronunciation",
        "description": "「our」が「オア」と発音されていますが、正しくは「アワー」です。",
        "tip": "「ou」は長い「o」ではなく、「ah」+「ə」の二重母音です。口を丸くしすぎず、「アワー」と発音してください。"
      },
      {
        "type": "stress",
        "description": "「choices」の第1音節（choi）にストレスがないため、弱く聞こえます。",
        "tip": "「CHOices」のように第1音節を強くはっきり発音してください。"
      }
    ],
    "example": "正解: /ˈaʊər ˈtʃɔɪsɪz/ (強調: CHOices)"
  }
]
```

---

## 例2: DetailedShadowingFeedback での使用

### コンポーネント呼び出し

```typescript
// ShadowingResultScreen.tsx
{showDetailedModal !== null && (
  <DetailedShadowingFeedback
    script="The future will be shaped by our choices."
    pronunciationScore={8.5}
    rhythmScore={7.2}
    accuracyScore={6.8}
    overallFeedback="全体的に良い進捗です。リダクションとストレスパターンに注意を払いましょう。"
    roundNumber={3}
    phraseFeedbacks={[
      /* 上記の JSON データ */
    ]}
    wordFeedbacks={[/* 単語単位フィードバック */]}
  />
)}
```

### 画面レイアウト（テキスト表現）

```
┌─ DetailedShadowingFeedback ──────────────────────┐
│ ラウンド 3                                        │
│ 詳細フィードバック                                │
├──────────────────────────────────────────────────┤
│ 正確性   ████████░ 6.8/10                        │
│ リズム   ███████░░ 7.2/10                        │
│ 発音     ████████░ 8.5/10                        │
├──────────────────────────────────────────────────┤
│ 🎯 フレーズ単位の分析                             │
│                                                  │
│ ┌────────────────────────────────────────────┐  │
│ │ ✅ The future will                         │  │
│ │ 正しい読み方: ザ フューチャー ウィル        │  │
│ │ タップで詳細表示 →                         │  │
│ └────────────────────────────────────────────┘  │
│                                                  │
│ ┌────────────────────────────────────────────┐  │
│ │ ⚠️ be shaped by                            │  │
│ │ 正しい読み方: ビー シェイプド バイ         │  │
│ │ 問題点: [⬇️ リダクション] [🔗 リンキング] │  │
│ │ タップで詳細表示 →                         │  │
│ └────────────────────────────────────────────┘  │
│                                                  │
│ ┌────────────────────────────────────────────┐  │
│ │ ❌ our choices                             │  │
│ │ 正しい読み方: アワー チョイシズ            │  │
│ │ 問題点: [🗣️ 発音] [💪 ストレス]           │  │
│ │ タップで詳細表示 →                         │  │
│ └────────────────────────────────────────────┘  │
│                                                  │
├──────────────────────────────────────────────────┤
│ 💡 全体コメント                                  │
│ 全体的に良い進捗です。リダクションとストレス│  │
│ パターンに注意を払いましょう。                  │
└──────────────────────────────────────────────────┘
```

---

## 例3: PhraseDetailModal での詳細表示

### ユーザーがフレーズをタップ

```typescript
// "be shaped by" フレーズカードをタップ時
const handlePhrasePress = (phrase: PhraseFeedback) => {
  // phrase = {
  //   phrase: "be shaped by",
  //   status: "needsWork",
  //   correctReading: "ビー シェイプド バイ",
  //   yourVersion: "ビー シェップ バイ",
  //   issues: [...]
  // }
  setSelectedPhrase(phrase);
  setPhraseModalVisible(true);
};
```

### モーダル表示内容

```
┌──── PhraseDetailModal ────────────────────────┐
│ ✕          フレーズ詳細              [spacer]│
├───────────────────────────────────────────────┤
│                                               │
│ フレーズ                                      │
│ ┌──────────────────────────────────────────┐ │
│ │         be shaped by                     │ │
│ └──────────────────────────────────────────┘ │
│                                               │
│ 評価                                          │
│ ┌──────────────────────────────────────────┐ │
│ │ ⚠️ 改善が必要                             │ │
│ └──────────────────────────────────────────┘ │
│                                               │
│ 正しい読み方（カタカナ）                      │
│ ┌──────────────────────────────────────────┐ │
│ │  ビー シェイプド バイ                      │ │
│ │  (ストレス: シェイプド)                    │ │
│ └──────────────────────────────────────────┘ │
│                                               │
│ あなたの読み方                                │
│ ┌──────────────────────────────────────────┐ │
│ │  ビー シェップ バイ                        │ │
│ └──────────────────────────────────────────┘ │
│                                               │
│ 問題点と改善のコツ                            │
│                                               │
│ ┌──────────────────────────────────────────┐ │
│ │ ⬇️ リダクション                           │ │
│ │                                          │ │
│ │ 「shaped」の「-ed」が弱くなっている。     │ │
│ │ リダクション現象が起きています。         │ │
│ │                                          │ │
│ │ ┌────────────────────────────────────┐  │ │
│ │ │ 💡 「shap」+「d」ではなく        │  │ │
│ │ │ 「shāpd」で「d」を明確に        │  │ │
│ │ │ 発音してください。               │  │ │
│ │ └────────────────────────────────────┘  │ │
│ └──────────────────────────────────────────┘ │
│                                               │
│ ┌──────────────────────────────────────────┐ │
│ │ 🔗 リンキング                             │ │
│ │                                          │ │
│ │ 「by」の「b」が前の「shaped」と分離      │ │
│ │ している                                 │ │
│ │                                          │ │
│ │ ┌────────────────────────────────────┐  │ │
│ │ │ 💡 「d」と「b」を繋げてスムーズ  │  │ │
│ │ │ に流す意識を持ちましょう。       │  │ │
│ │ └────────────────────────────────────┘  │ │
│ └──────────────────────────────────────────┘ │
│                                               │
│ 具体例                                        │
│ ┌──────────────────────────────────────────┐ │
│ │ 正解: "be changed by" と比較してみる    │ │
│ │ （流暢な音声パターンの参考）              │ │
│ └──────────────────────────────────────────┘ │
│                                               │
│              [  閉じる  ]                      │
└───────────────────────────────────────────────┘
```

---

## 例4: Zustand ストア更新

### レコード保存時

```typescript
// ShadowingScreen.tsx
const result = await scoreShaddowingRecording(
  script,
  dummyTranscript,
  currentRound,
  apiKey
);

// result には phraseFeedbacks が含まれる
// {
//   accuracyScore: 6.8,
//   rhythmScore: 7.2,
//   pronunciationScore: 8.5,
//   feedback: "...",
//   phraseFeedbacks: [...],
//   wordFeedbacks: [...],
//   corrections: [...]
// }

addRecord({
  id: `record_${currentRound}_${Date.now()}`,
  attemptId,
  roundNumber: currentRound,
  audioUrl: uri,
  transcript: dummyTranscript,
  accuracyScore: Math.round(result.accuracyScore * 10) / 10,
  rhythmScore: Math.round(result.rhythmScore * 10) / 10,
  pronunciationScore: Math.round(result.pronunciationScore * 10) / 10,
  feedback: result.feedback,
  phraseFeedbacks: result.phraseFeedbacks,  // ✅ 保存
  wordFeedbacks: result.wordFeedbacks,      // ✅ 保存
  createdAt: new Date(),
});
```

### Supabase 同期時

```typescript
// shadowingStore.ts syncToSupabase()
const recordsToSave = currentSession.records.map((record) => ({
  id: record.id,
  user_id: userId,
  attempt_id: record.attemptId,
  round_number: record.roundNumber,
  audio_url: record.audioUrl,
  transcript: record.transcript,
  accuracy_score: record.accuracyScore,
  rhythm_score: record.rhythmScore,
  pronunciation_score: record.pronunciationScore,
  feedback: record.feedback,
  phrase_feedbacks: record.phraseFeedbacks
    ? JSON.stringify(record.phraseFeedbacks)  // ✅ JSON化
    : null,
  word_feedbacks: record.wordFeedbacks
    ? JSON.stringify(record.wordFeedbacks)    // ✅ JSON化
    : null,
  created_at: record.createdAt.toISOString(),
}));

await supabase.from('shadowing_records').upsert(recordsToSave, {
  onConflict: 'id',
});
```

---

## 例5: 複数ラウンドのフレーズフィードバック比較

### ラウンド1

```
✅ "The future will"
✅ "be shaped by"
⚠️  "our choices"
```

### ラウンド3

```
✅ "The future will"
⚠️  "be shaped by"  ← 少し改善（good → needsWork）
✅ "our choices"     ← 大きく改善（major → good）
```

**学習者の視点:**
- 「ラウンド1で major だった our choices がラウンド3で good に!」
- 「be shaped by はまだ改善が必要だから もっと練習しよう」
- **達成感と継続的な改善ポイントが同時に見える**

---

## 例6: CSS-in-JS スタイルの実装パターン

### status 別色の動的適用

```typescript
// DetailedShadowingFeedback.tsx
const getPhraseStatusColor = (status: string) => {
  switch (status) {
    case 'good':
      return '#52C41A'; // Green
    case 'needsWork':
      return '#FAAD14'; // Yellow
    case 'major':
      return '#F5222D'; // Red
    default:
      return '#999';
  }
};

// 使用例
<View
  style={[
    styles.phraseCard,
    {
      backgroundColor: getPhraseStatusBgColor(feedback.status),
      borderColor: getPhraseStatusColor(feedback.status),
    },
  ]}
>
  {/* ... */}
</View>
```

---

## 例7: issue type 別の表示ロジック

### Issue type マッピング

```typescript
const ISSUE_ICONS: Record<string, string> = {
  linking: '🔗',      // 単語間の連結
  reduction: '⬇️',    // 音の削減
  stress: '💪',       // アクセント
  intonation: '📈',   // イントネーション
  pronunciation: '🗣️', // 音の発音
};

const ISSUE_LABELS: Record<string, string> = {
  linking: 'リンキング',
  reduction: 'リダクション',
  stress: 'ストレス',
  intonation: 'イントネーション',
  pronunciation: '発音',
};

// JSX での使用
{feedback.issues.map((issue, idx) => (
  <View key={idx} style={styles.issueTag}>
    <Text style={styles.issueTagText}>
      {ISSUE_ICONS[issue.type]} {ISSUE_LABELS[issue.type]}
    </Text>
  </View>
))}
```

**出力例:**
```
[🔗 リンキング] [⬇️ リダクション]
```

---

## まとめ: 実装のポイント

| ポイント | 実装内容 |
|--------|--------|
| **データ構造** | `PhraseFeedback[]` インターフェース |
| **表示層** | `DetailedShadowingFeedback` + `PhraseDetailModal` |
| **状態管理** | Zustand `useShadowingStore` に phraseFeedbacks を保存 |
| **AI 評価** | `scoreShaddowingRecording()` から phraseFeedbacks を取得 |
| **ユーザー体験** | 色分け + アイコン + 段階的な詳細情報 |
| **パフォーマンス** | JSON シリアライズで Supabase に保存 |

---

**バージョン**: 1.0.0
**最終更新**: 2026-03-20
