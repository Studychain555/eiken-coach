# 📐 EigoMaster Shadoten デザインシステム仕様書

## 🎨 1. Color System（カラーシステム）

### プライマリパレット

| 名称 | Hex | RGB | 用途 |
|------|-----|-----|------|
| **Teal Header** | #1B9BA4 | rgb(27, 155, 164) | ヘッダー背景、主要アクセント、左ボーダー |
| **Good Points** | #1B9BA4 | rgb(27, 155, 164) | 正解フィードバック、成功表示 |
| **Development Points** | #E85D6F | rgb(232, 93, 111) | 改善フィードバック、エラー表示 |

### セカンダリパレット

| 名称 | Hex | RGB | 用途 |
|------|-----|-----|------|
| **Time Bonus** | #FAAD14 | rgb(250, 173, 20) | Time Bonus バー、重要表示 |
| **Brown Accent** | #8B6F47 | rgb(139, 111, 71) | Time Bonus 背景、セカンダリ要素 |
| **Content BG** | #F5F5F5 | rgb(245, 245, 245) | ページ背景、カード背景 |

### ニュートラルパレット

| 名称 | Hex | 用途 |
|------|-----|------|
| **White** | #FFFFFF | カード背景、テキスト背景 |
| **Dark Text** | #333333 | 本文テキスト |
| **Light Text** | #666666 | サブテキスト、補足説明 |
| **Border Light** | rgba(0,0,0,0.06) | ボーダー、区切り線 |

### フィードバックカラー

| 状態 | Hex | 用途 |
|------|-----|------|
| **Correct** | #52C41A | 正解時、成功状態 |
| **Incorrect** | #F5222D | 不正解時、エラー状態 |
| **Correct Circle** | #52C41A | ⭕ アイコン |
| **Incorrect X** | #F5222D | ✕ アイコン |

---

## 📝 2. Typography（タイポグラフィ）

### フォント

```javascript
// システムフォント（platform自動選択）
fonts: {
  sans: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto',
  serif: 'Georgia, "Times New Roman", serif',
  mono: 'SFMono-Regular, Menlo, Monaco, Consolas, monospace'
}
```

### タイポグラフィスケール

| レベル | サイズ | ウェイト | 用途 |
|--------|--------|----------|------|
| **h1 (Display)** | 32px | 800 | ページタイトル |
| **h2 (Heading)** | 28px | 700 | セクションタイトル |
| **h3 (Subheading)** | 24px | 700 | カードタイトル |
| **h4 (Title)** | 20px | 600 | セッションタイトル |
| **h5** | 18px | 600 | リスト項目タイトル |
| **h6** | 16px | 600 | ラベル |
| **Body** | 16px | 400 | 本文テキスト |
| **Body Medium** | 15px | 500 | 説明テキスト |
| **Body Small** | 14px | 400 | 補足説明 |
| **Caption** | 12px | 400 | メタ情報 |
| **Label** | 12px | 600 | ラベルテキスト |

---

## 🧩 3. Components（コンポーネント仕様）

### 3.1 Button（ボタン）

#### Primary Button
```
背景色: #1B9BA4 (Teal)
テキスト色: #FFFFFF
パディング: 12px (vertical) × 16px (horizontal)
コーナー: 12px rounded
シャドウ: 0 2px 4px rgba(0,0,0,0.1)
状態:
  - Default: 背景色 #1B9BA4
  - Hover: スケール 1.02
  - Active: スケール 0.98 + 背景暗化
  - Disabled: opacity 0.5
アニメーション: 100ms ease-out
```

#### Secondary Button
```
背景色: #FFFFFF (White)
テキスト色: #1B9BA4 (Teal)
ボーダー: 2px solid #1B9BA4
パディング: 12px × 16px
コーナー: 12px rounded
シャドウ: なし
```

### 3.2 Card（カード）

```
背景色: #FFFFFF
パディング: 16px (horizontal) × 12px (vertical)
コーナー: 12px rounded
左ボーダー: 5px solid #1B9BA4
シャドウ:
  - Offset: 0 2px
  - Opacity: 0.08
  - Radius: 4px
マージン下部: 16px
```

### 3.3 Feedback Card（フィードバックカード）

#### Good Points
```
背景色: #1B9BA4
パディング: 16px
コーナー: 8px rounded
テキスト色: #FFFFFF
構成:
  - タイトル: ✅ "正解!" (20px bold)
  - サブタイトル: "意味を正しく理解できました"
  - XP表示: "+10 XP" (18px bold)
アニメーション: スケール 0.8→1.0 (200ms)
```

#### Development Points
```
背景色: #E85D6F
パディング: 16px
コーナー: 8px rounded
テキスト色: #FFFFFF
構成:
  - タイトル: 🔥 "改善が必要"
  - サブタイトル: "もう一度聞いて、意味を確認しましょう"
アニメーション: スケール 0.8→1.0 (200ms)
```

### 3.4 Progress Bar（進捗バー）

```
背景色: rgba(0,0,0,0.08)
フィル色: #1B9BA4
高さ: 6px
コーナー: full (9999px)
アニメーション: smooth width transition (500ms)
```

### 3.5 Header（ヘッダー）

```
背景色: #1B9BA4
パディング: 16px (horizontal) × 24px (vertical)
テキスト色: #FFFFFF
構成:
  - タイトル: 20px 800 weight
  - サブタイトル: 12px 600 weight (opacity 0.8)
高さ: auto (content-based)
```

---

## 📏 4. Layout Grid & Spacing（レイアウト・スペーシング）

### Spacing Scale（スペーシングスケール）

```javascript
const spacing = {
  xs: 4,    // 4px
  sm: 8,    // 8px
  md: 12,   // 12px
  lg: 16,   // 16px
  xl: 24,   // 24px
  xxl: 32   // 32px
}
```

### Border Radius Scale（コーナーラディウス）

```javascript
const borderRadius = {
  sm: 4,      // 4px (小)
  md: 8,      // 8px (中)
  lg: 12,     // 12px (大)
  xl: 16,     // 16px (特大)
  full: 9999  // 完全円形
}
```

### レスポンシブブレークポイント

```javascript
breakpoints: {
  mobile: '0px',
  tablet: '768px',
  desktop: '1024px',
  wide: '1440px'
}
```

### ページグリッド

- **モバイル (0px~768px)**: 1列、ギャップ 12px
- **タブレット (768px~1024px)**: 2列、ギャップ 16px
- **デスクトップ (1024px~)**: 3列、ギャップ 16px

---

## ✨ 5. Animation Guidelines（アニメーション）

### Animation Timings（タイミング）

| 種類 | 期間 | Easing | 用途 |
|------|------|--------|------|
| **Tap Feedback** | 100ms | ease-out | ボタンクリック |
| **Slide In** | 300ms | ease-out | 画面遷移 in |
| **Bounce** | 400ms | cubic-bezier(0.68, -0.55, 0.265, 1.55) | セレブレーション |
| **Confetti** | 2500ms | linear | confetti 落下 |
| **Heart Pop** | 200ms | ease-out | ハートポップ |
| **XP Float** | 1000ms | ease-out | XP浮上 |

### Animation Patterns（アニメーションパターン）

#### Tap Feedback
```
状態: クリック時
アニメーション: scale 1.0 → 0.95 → 1.0
期間: 100ms
Easing: ease-out
```

#### Correct Answer
```
状態: 正解時
アニメーション:
  1. 背景フラッシュ (グリーン 0.3)
  2. confetti 表示
  3. Good Points card スケールアップ (0.8→1.0)
期間: 200ms + 2500ms
```

#### Incorrect Answer
```
状態: 不正解時
アニメーション:
  1. 背景フラッシュ (レッド 0.2)
  2. Development Points card スケールアップ
期間: 200ms
```

#### Level Up
```
状態: レベルアップ時
アニメーション:
  1. スケール + 回転 (0→360°)
  2. ✨ stars 表示
期間: 1500ms
```

---

## 📊 6. Component States（コンポーネント状態）

### Button States

```
┌─────────────────────────────────────┐
│ Button States                       │
├─────────────────────────────────────┤
│ Default:   #1B9BA4 bg, white text   │
│ Hover:     scale 1.02               │
│ Active:    scale 0.98               │
│ Disabled:  opacity 0.5              │
│ Loading:   spinner + disabled       │
└─────────────────────────────────────┘
```

### Card States

```
┌─────────────────────────────────────┐
│ Card States                         │
├─────────────────────────────────────┤
│ Default:   white bg + teal border   │
│ Hover:     shadow enhance           │
│ Selected:  border color bold        │
│ Loading:   skeleton animation       │
└─────────────────────────────────────┘
```

### Feedback States

```
┌─────────────────────────────────────┐
│ Feedback States                     │
├─────────────────────────────────────┤
│ Good:      #1B9BA4 bg, white text   │
│ Bad:       #E85D6F bg, white text   │
│ Warning:   #FAAD14 bg, dark text    │
│ Info:      #1B9BA4 bg, white text   │
└─────────────────────────────────────┘
```

---

## 🎯 7. Design Patterns（デザインパターン）

### 「1画面 = 1アクション」原則

- **スクロール不要**: メインコンテンツは viewport に収まる
- **単一焦点**: 1画面につき 1つの主要アクション
- **明確なフロー**: ナビゲーションボタンで次のステップへ

### Good Points / Development Points フレームワーク

```
┌─ Feedback Card ─────────────────────┐
│                                      │
│  [背景色] [タイトル+アイコン]        │
│           [説明テキスト]             │
│           [例示or改善案]            │
│                                      │
└──────────────────────────────────────┘
```

### Time Bonus インジケーター

```
┌─ Time Bonus Bar ────────────────────┐
│  ⏱️ [グレー背景] [茶色フィル] 95%   │
│                                      │
│  時間内に回答すると bonus XP 獲得    │
└──────────────────────────────────────┘
```

---

## 📋 8. Implementation Checklist（実装チェックリスト）

### ビジュアル完成度

- [ ] 色がピクセルパーフェクト（Hex コード一致）
- [ ] タイポグラフィサイズ・ウェイト一致
- [ ] スペーシング・パディングが 4px グリッド統一
- [ ] ボーダーラディウス値が定義に準拠
- [ ] シャドウ値が仕様書通り
- [ ] ダークモード対応（あれば）

### インタラクション

- [ ] ボタンホバー・アクティブ状態がある
- [ ] フィードバックが 200ms 以内に表示
- [ ] アニメーション滑らか（60fps）
- [ ] タップレスポンス（100ms以内）
- [ ] 状態遷移が自然

### アクセシビリティ

- [ ] コントラスト比 4.5:1 以上（WCAG AA）
- [ ] テキストサイズ 14px 以上（モバイル）
- [ ] タップターゲット 44×44px 以上
- [ ] キーボード操作可能
- [ ] スクリーンリーダー対応

### パフォーマンス

- [ ] 初期読込 < 3秒
- [ ] アニメーション jank なし
- [ ] メモリリーク なし
- [ ] 大量データでも滑らか

### レスポンシブ

- [ ] モバイル (375px) で正常表示
- [ ] タブレット (768px) で正常表示
- [ ] デスクトップ (1024px) で正常表示
- [ ] 画像が正しくスケール

---

## 🚀 9. Usage Examples（使用例）

### Button 使用例

```jsx
// Primary Button
<TouchableOpacity style={styles.primaryBtn}>
  <Text style={styles.primaryBtnText}>次へ</Text>
</TouchableOpacity>

// Secondary Button
<TouchableOpacity style={styles.secondaryBtn}>
  <Text style={styles.secondaryBtnText}>キャンセル</Text>
</TouchableOpacity>
```

### Card 使用例

```jsx
<View style={styles.card}>
  <Text style={styles.cardTitle}>タイトル</Text>
  <Text style={styles.cardBody}>説明テキスト</Text>
</View>
```

### Feedback Card 使用例

```jsx
// Good Points
<View style={[styles.feedbackCard, styles.goodPointsCard]}>
  <Text style={styles.feedbackTitle}>✅ 正解!</Text>
  <Text style={styles.feedbackBody}>説明</Text>
</View>

// Development Points
<View style={[styles.feedbackCard, styles.developmentPointsCard]}>
  <Text style={styles.feedbackTitle}>🔥 改善が必要</Text>
  <Text style={styles.feedbackBody}>説明</Text>
</View>
```

---

## 📚 References（参考資料）

- Shadoten デザイン参考画像: [19+ screenshots]
- Color Picker: [Hex codes verified]
- Animation Spec: React Native Animated API
- Accessibility: WCAG 2.1 AA

---

**最終更新**: 2026-03-19
**バージョン**: 1.0
**ステータス**: ✅ 実装準備完了
