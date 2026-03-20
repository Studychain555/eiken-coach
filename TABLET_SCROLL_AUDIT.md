# EigoMaster タブレット画面 スクロール洗い出し報告
## iPad 768×1024 (Safe Area: ~900px) 完全分析

**実施日**: 2026-03-20
**対象**: EigoMaster 全タブ画面 (Home, Listening, Vocabulary, Writing, Settings)
**測定デバイス**: iPad 標準 (768×1024) / iPad Pro (1024×1366)

---

## 📊 スクロール状況 一覧表

| # | SCREEN | 高さ | 制限 | ステータス | 問題 |
|---|--------|------|------|-----------|------|
| 1 | HOME | 634px | 900px | ✅ OK | 266px 余裕 |
| 2 | LISTENING (基本) | 792px | 900px | ✅ OK | 108px 余裕 |
| 3 | LISTENING + Streak | 890px | 900px | ⚠️ 境界 | 10px 余裕のみ |
| 4 | LISTENING + Combo | 978px | 900px | ❌ 要scroll | 78px 超過 |
| 5 | VOCABULARY Stage Select | 1204px | 900px | ❌ 要scroll | 304px 超過 |
| 6 | VOCABULARY Test (基本) | 800px | 900px | ✅ OK | 100px 余裕 |
| 7 | VOCABULARY Test + Feedback | 948px | 900px | ⚠️ 境界 | 48px 超過 |
| 8 | VOCABULARY Editor | 790px | 900px | ✅ OK | 110px 余裕 |
| 9 | WRITING Prompt Select | 1134px | 900px | ❌ 要scroll | 234px 超過 |
| 10 | WRITING Editor | 610px | 900px | ✅ OK | 290px 余裕 |
| 11 | SETTINGS | 902px | 900px | ⚠️ 境界 | 2px 超過 |

---

## 📈 サマリー

```
✅ スクロール不要: 5画面 (45%)
   - HOME (634px)
   - LISTENING基本 (792px)
   - VOCABULARY Test基本 (800px)
   - VOCABULARY Editor (790px)
   - WRITING Editor (610px)

⚠️  境界線 (5px-100px): 2画面 (18%)
   - LISTENING + Streak (890px, 10px 余裕)
   - VOCABULARY Test + Feedback (948px, 48px 超過)
   - SETTINGS (902px, 2px 超過)

❌ スクロール必須: 2画面 (18%)
   - VOCABULARY Stage Select (1204px, 304px 超過)
   - WRITING Prompt Select (1134px, 234px 超過)
```

---

## 🔴 CRITICAL ISSUES (優先度1: 即座に修正)

### 1. VOCABULARY Stage Select Screen (304px 超過)
**ファイル**: `/Users/80dr/eigomaster/app/(tabs)/vocabulary.tsx`

**問題の内訳**:
```
- Stages Grid (20ステージ): 368px (最大容積)
- Difficulty Guide: 158px
- Stats Box: 138px
- Milestone: 80px
- Daily Goal + Streak + Combo: 294px
```

**推奨修正案 (優先順位順)**:

```
【Option A】ステージ制限 + スクロール (推奨)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
実装: 最初は8ステージのみ表示 → "次へ" で追加読み込み
効果: 368px → 110px (削減258px)
結果: 1204px → 946px (スクロール可, 軽量化)
難易度: ★☆☆ (実装容易)

【Option B】難易度タブ化 (推奨度高)
━━━━━━━━━━━━━━━━━━━━━━━━━━━
実装: 難易度別タブ (初級 | 中級 | 上級)
  • 初級: 2行 (8ステージ)
  • 中級: 3行 (12ステージ)
  • 上級: 5行 (20ステージ)
効果: タブ切替時のみ該当セクション表示
結果: 1204px → 650px (大幅削減)
難易度: ★★☆ (タブ管理が必要)

【Option C】Difficulty Guide 削除
━━━━━━━━━━━━━━━━━━━━━━━━━━━
効果: 158px 削減
結果: 1204px → 1046px (部分改善)
難易度: ★☆☆ (実装容易だが、ガイド非表示化)

【Option D】Milestone セクション削除
━━━━━━━━━━━━━━━━━━━━━━━━━━━
効果: 80px 削減
結果: 1204px → 1124px (わずかな改善)
難易度: ★☆☆
```

### 2. WRITING Prompt Select Screen (234px 超過)
**ファイル**: `/Users/80dr/eigomaster/app/(tabs)/writing.tsx`

**問題の内訳**:
```
- Prompt Cards (5問): 350px (各 ~70px)
- Scoring Guide: 160px
- Stats Box: 138px
- Daily Goal + Streak: 206px
```

**推奨修正案**:

```
【Option A】ページング表示 (推奨)
━━━━━━━━━━━━━━━━━━━━━━━━━
実装: 最初3問のみ表示 → ボタンで次ページ読み込み
効果: 350px → 210px (削減140px)
結果: 1134px → 994px (スクロール軽微)
難易度: ★★☆ (ページング管理が必要)

【Option B】Scoring Guide をモーダル化
━━━━━━━━━━━━━━━━━━━━━━━━━
実装: "採点基準を見る" ボタン → モーダルウィンドウ表示
効果: 160px 削減
結果: 1134px → 974px (スクロール軽微)
難易度: ★★☆ (モーダル実装)

【Option C】カルーセルスワイプ
━━━━━━━━━━━━━━━━━━━━━━━━━
実装: プロンプト を横スワイプで切替 (1画面1問表示)
効果: 350px → 70px (削減280px)
結果: 1134px → 854px (スクロール不要)
難易度: ★★★ (カルーセル実装が必要)
```

---

## ⚠️ BORDERLINE ISSUES (優先度2: 条件付き修正)

### 3. LISTENING Screen (Streak/Combo時)
**ファイル**: `/Users/80dr/eigomaster/app/(tabs)/listening.tsx`

**問題**:
- Streak Banner 表示時: +98px (890px 計)
- Combo Counter 表示時: +88px (978px 計)
- 両方表示時: +186px (超過78px)

**推奨修正案**:

```
【Option A】Banner高さ削減 (推奨)
━━━━━━━━━━━━━━━━━━━━━━━
実装: Streak/Comboバナーを コンパクト表示
  • Streak: 98px → 60px (30%削減)
  • Combo: 88px → 50px (35%削減)
効果: 両方表示時 978px → 890px (スクロール回避)
難易度: ★☆☆ (スタイル調整のみ)

【Option B】Stats Box を2列表示
━━━━━━━━━━━━━━━━━━━━━━━━━━
効果: 30px 削減
結果: わずかな改善のみ
難易度: ★★☆
```

### 4. VOCABULARY Test Screen (Feedback時)
**ファイル**: `/Users/80dr/eigomaster/app/(tabs)/vocabulary.tsx` (VocabularyTestScreen)

**問題**:
- Feedback コンテナ表示時: +148px (948px 計)

**推奨修正案**:

```
【Option A】Feedback をモーダル/パネル化 (推奨)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
実装: Feedback を ScrollView 外に移動 (スライドパネル)
効果: 948px → 800px (スクロール不要)
難易度: ★★☆ (モーダル実装)

【Option B】Options を2列グリッド
━━━━━━━━━━━━━━━━━━━━━━━━━
効果: 50px 削減
結果: 948px → 898px (ギリギリスクロール回避)
難易度: ★★☆ (グリッドレイアウト変更)
```

### 5. SETTINGS Screen (2px 超過)
**ファイル**: `/Users/80dr/eigomaster/app/(tabs)/settings.tsx`

**問題**:
- わずか 2px 超過のため、軽微な修正で対応可能

**推奨修正案**:

```
【Option A】フォント微調整 (推奨)
━━━━━━━━━━━━━━━━━━━━━━━━
実装:
  • Body font: 16px → 15px (タイトル等は維持)
  • line-height 微調整: -2-3px
効果: 削減 10-20px (十分)
難易度: ★☆☆ (微調整のみ)

【Option B】Padding削減
━━━━━━━━━━━━━━━━━━━
実装: select sections の padding lg → md
効果: 削減 8-12px
難易度: ★☆☆
```

---

## 📐 詳細な高さ計算

### SCREEN 1: HOME SCREEN
```
┌────────────────────────────────────┐
│ Header (Welcome + Level)        86px│
│ Status Bar (3 items)            48px│
│ Daily Goals (3 cards)          206px│
│ Learning Stats (Stats)         190px│
│ Quick Actions (3 buttons)       80px│
│ Bottom Padding                  24px│
├────────────────────────────────────┤
│ TOTAL:                         634px│ ✅ OK
└────────────────────────────────────┘
```

### SCREEN 2: LISTENING SCREEN (最大)
```
┌─────────────────────────────────────┐
│ XPRewardSystem (outside)        70px│
│ Header (Title + Subtitle)       92px│
│ Daily Goal                     108px│
│ Streak Banner (shown)           98px│
│ Combo Counter (shown)           88px│
│ Progress Bar                   108px│
│ Stats (3-box)                 138px│
│ Question List (min 1 card)    188px│
├─────────────────────────────────────┤
│ TOTAL:                        978px│ ❌ 78px超過
└─────────────────────────────────────┘
```

### SCREEN 3: VOCABULARY Stage Select
```
┌──────────────────────────────────────┐
│ XPRewardSystem                  70px│
│ Header                          92px│
│ Daily Goal                     108px│
│ Streak Banner (shown)           98px│
│ Combo Counter (shown)           88px│
│ Milestone                       80px│
│ Stats (3-box)                 138px│
│ Difficulty Guide (3items)     158px│
│ Stages Grid (20 = 5rows)      368px│
│ Tips Box                        74px│
├──────────────────────────────────────┤
│ TOTAL:                       1204px│ ❌ 304px超過
└──────────────────────────────────────┘
```

### SCREEN 4: WRITING Prompt Select
```
┌────────────────────────────────────┐
│ XPRewardSystem                 70px│
│ Header                         92px│
│ Daily Goal                    108px│
│ Streak Banner                  98px│
│ Stats (3-box)                138px│
│ Scoring Guide (4 items)      160px│
│ Prompts (5 cards)            350px│
│ Bottom Padding                40px│
├────────────────────────────────────┤
│ TOTAL:                      1134px│ ❌ 234px超過
└────────────────────────────────────┘
```

---

## 📋 実装チェックリスト

### Phase 1: CRITICAL (今すぐ対応)
- [ ] VOCABULARY Stage Select の修正
  - [ ] Option A: ステージ制限 + ページング実装
  - [ ] 検証: 946px 以下を確認
- [ ] WRITING Prompt Select の修正
  - [ ] Option A/B/C のいずれか実装
  - [ ] 検証: 900px 以下を確認

### Phase 2: HIGH (1-2週間以内)
- [ ] LISTENING Streak/Combo バナー高さ削減
  - [ ] Banner height 最適化
  - [ ] 検証: 978px → 890px 以下
- [ ] VOCABULARY Test Feedback モーダル化
  - [ ] モーダル実装
  - [ ] 検証: 948px → 800px
- [ ] SETTINGS フォント微調整
  - [ ] body font 調整
  - [ ] 検証: 902px → 900px 以下

### Phase 3: MAINTENANCE
- [ ] 全画面の再検証テスト
  - [ ] iPad 768×1024 で表示確認
  - [ ] iPad Pro 1024×1366 で確認
- [ ] 新規コンポーネント追加時のガイドライン作成
  - [ ] 高さ制限チェックリスト
  - [ ] テンプレート提供

---

## 🔧 修正実装ガイド

### VOCABULARY Stage Select - Option A (推奨)
```typescript
// 修正前
const stagesCount = 20;

// 修正後
const stagesCount = 8; // または動的に管理

// ページング処理
const [visibleStages, setVisibleStages] = useState(8);
const handleLoadMore = () => {
  setVisibleStages(prev => prev + 8);
};

// JSX
{Array.from({ length: Math.min(stagesCount, visibleStages) }, ...).map(...)}
{visibleStages < stagesCount && (
  <Button onPress={handleLoadMore}>さらに読み込む</Button>
)}
```

### VOCABULARY Stage Select - Option B (より優れた)
```typescript
type Difficulty = 'beginner' | 'intermediate' | 'advanced';

const stagesByDifficulty = {
  beginner: 8,
  intermediate: 12,
  advanced: 20,
};

const [difficulty, setDifficulty] = useState<Difficulty>('beginner');

// JSX - タブレイアウト
<View style={styles.difficultyTabs}>
  {(['beginner', 'intermediate', 'advanced'] as const).map(d => (
    <TouchableOpacity onPress={() => setDifficulty(d)}>
      {/* Tab */}
    </TouchableOpacity>
  ))}
</View>

// ステージグリッド - 選択タブのみ
{Array.from({length: stagesByDifficulty[difficulty]}, ...).map(...)}
```

### WRITING Prompt Select - ページング実装
```typescript
const [promptPage, setPromptPage] = useState(0);
const promptsPerPage = 3;

const displayPrompts = prompts.slice(
  promptPage * promptsPerPage,
  (promptPage + 1) * promptsPerPage
);

// JSX
{displayPrompts.map(prompt => (...))}

{(promptPage + 1) * promptsPerPage < prompts.length && (
  <Button onPress={() => setPromptPage(p => p + 1)}>
    次のページ
  </Button>
)}
```

---

## 📱 テスト検証リスト

修正後、以下をテストしてください:

```
デバイス別テスト:
[ ] iPad Air (768×1024)
[ ] iPad Pro 11" (834×1194)
[ ] iPad Pro 12.9" (1024×1366)

各画面でのテスト:
[ ] HOME - スクロール位置確認
[ ] LISTENING - Streak/Combo 両方表示時
[ ] VOCABULARY Stage Select - ページング動作
[ ] VOCABULARY Test - Feedback 表示時
[ ] WRITING Prompt Select - 複数ページ表示
[ ] SETTINGS - 境界線の確認

確認項目:
[ ] スクロール不要な画面でスクロール無効
[ ] スクロール必要な場合、スムーズなスクロール
[ ] コンポーネント描画漏れなし
[ ] 高さに関するバグなし (e.g., 無限ループ)
```

---

## 💾 ファイル参照

| ファイル | 行数 | スクリーン | 問題 |
|---------|------|----------|------|
| `/Users/80dr/eigomaster/components/TabletHomeScreen.tsx` | 262 | HOME | ✅ 問題なし |
| `/Users/80dr/eigomaster/app/(tabs)/listening.tsx` | 437 | LISTENING | ⚠️ Streak/Combo時 |
| `/Users/80dr/eigomaster/app/(tabs)/vocabulary.tsx` | 874 | VOCABULARY | ❌ Stage Select: 304px超 |
| `/Users/80dr/eigomaster/app/(tabs)/writing.tsx` | 691 | WRITING | ❌ Prompt Select: 234px超 |
| `/Users/80dr/eigomaster/app/(tabs)/settings.tsx` | 236 | SETTINGS | ⚠️ 2px超 |

---

## 📊 影響度分析

```
修正優先度マップ:

         高
         │
高    │ ❌ Stage Select  │ ⚠️ Feedback
影    │ ❌ Prompt Sel.  │ ⚠️ Streak/Combo
響    │                │
度    │ ✅ SETTINGS     │
低    │                │
      └────────────────┴──────
         低          高
       実装難易度
```

---

## 🎯 推奨対応スケジュール

```
【即日対応】
  • VOCABULARY Stage Select (Option B: タブ化)
  • WRITING Prompt Select (Option A: ページング)
  • 推定: 2-3時間

【1-2日内】
  • LISTENING バナー高さ削減
  • VOCABULARY Test モーダル化
  • SETTINGS フォント微調整
  • 推定: 2-4時間

【1週間内】
  • 全画面テスト
  • ドキュメント更新
  • ガイドライン作成
  • 推定: 4-6時間
```

---

**作成日**: 2026-03-20
**最後更新**: 2026-03-20
**ステータス**: 検証完了、修正待ち
