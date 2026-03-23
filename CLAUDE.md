# EigoMaster - Claude Code ガイドライン

このドキュメントはClaude Codeがこのプロジェクトを扱う際の参照ガイドです。
新規画面の作成・既存画面の修正の両方で適用します。

---

## 🎨 シャドーイングアプリ レスポンシブ設計ガイドライン

すべての画面で以下のルールに従うこと。新規画面の作成・既存画面の修正どちらにも適用する。

### 1. レイアウト原則

#### ビューポートフィット優先
- すべての画面は `height: 100dvh`（dynamic viewport height）を基準にビューポート内に収める
- ページ単位のスクロールは原則禁止。コンテンツが溢れる場合はメインコンテンツ領域のみスクロール可能にする

#### 3層レイアウト構造
すべての画面は以下の構造を基本とする：

```jsx
<Shell style={{ height: '100dvh', display: 'flex', flexDirection: 'column' }}>
  <Header style={{ flexShrink: 0 }} />        {/* 画面タイトル・ナビゲーション。常に表示 */}
  <Main style={{ flex: 1, overflowY: 'auto' }} /> {/* メインコンテンツ。ここだけスクロール可 */}
  <Footer style={{ flexShrink: 0 }} />         {/* アクションボタン・ナビゲーション。常に表示 */}
</Shell>
```

- **Header**: 画面タイトル、戻るボタン、プログレスバーなど
- **Main**: カード、リスト、練習UIなどの本体コンテンツ
- **Footer**: 「次へ」「完了」「スキップ」などのアクションボタン
- Mainのスクロールバーは非表示にする（`scrollbar-width: none` / `::-webkit-scrollbar { display: none }`)
- Mainの末尾にFooterと被らないための余白を確保すること（padding-bottom: Footer高さ + 16px）

#### コンテナ幅
全画面共通で中央寄せのコンテナを使用する：

```css
/* モバイル（〜767px） */
.container {
  max-width: 100%;
  padding: 0 20px;
  margin: 0 auto;
}

/* タブレット（768px〜1023px） */
@media (min-width: 768px) {
  .container {
    max-width: 560px;
  }
}

/* PC（1024px〜） */
@media (min-width: 1024px) {
  .container {
    max-width: 640px;
  }
}
```

---

### 2. ブレークポイントとスケーリング

3段階のブレークポイントを使用：

| 要素 | モバイル（〜767px） | タブレット（768〜1023px） | PC（1024px〜） |
|------|---|---|---|
| 画面タイトル | 26-28px / 800 | 30-32px / 800 | 34-36px / 800 |
| カード見出し | 18-20px / 700 | 22-24px / 700 | 24-26px / 700 |
| 本文 | 14-15px / 400 | 15-16px / 400 | 16-17px / 400 |
| ラベル・キャプション | 12px / 500 | 13px / 500 | 14px / 500 |
| カード内余白 | 24px 20px | 32px 28px | 40px 32px |
| カード角丸 | 16-20px | 20-24px | 24px |
| ボタン高さ | 48-52px | 52-56px | 56px |
| アイコン・再生ボタン | 44-48px | 48-52px | 52-56px |

---

### 3. デザイントークン

全画面で以下のCSS変数を使用すること。インラインスタイルでの色指定は禁止。

```css
:root {
  /* Colors */
  --color-primary: #2BBCB3;
  --color-primary-dark: #25A8A0;
  --color-primary-light: #E6FAF8;
  --color-primary-border: #C4F0EC;
  --color-bg: #F5F5F5;
  --color-card: #FFFFFF;
  --color-text-primary: #1A1A1A;
  --color-text-secondary: #555555;
  --color-text-muted: #888888;
  --color-text-disabled: #AAAAAA;
  --color-border: #E0E0E0;
  --color-surface: #F7F7F7;
  --color-surface-warm: #F3F3F0;

  /* Typography */
  --font-family: system-ui, -apple-system, "Hiragino Sans", "Hiragino Kaku Gothic ProN", Meiryo, sans-serif;

  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 12px;
  --spacing-lg: 16px;
  --spacing-xl: 24px;
  --spacing-2xl: 32px;
  --spacing-3xl: 40px;

  /* Radius */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 20px;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-card: 0 2px 16px rgba(0, 0, 0, 0.05);
  --shadow-button: 0 2px 8px rgba(43, 188, 179, 0.2);

  /* Transitions */
  --transition-fast: 0.15s ease;
  --transition-normal: 0.3s ease;
}
```

---

### 4. 共通コンポーネントルール

#### カード
```css
.card {
  background: var(--color-card);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-card);
  padding: 24px 20px; /* モバイル */
}

@media (min-width: 768px) {
  .card {
    border-radius: var(--radius-xl);
    padding: 32px 28px;
  }
}

@media (min-width: 1024px) {
  .card {
    border-radius: 24px;
    padding: 40px 32px;
  }
}
```

#### ボタン（プライマリ）
```css
.button-primary {
  background: var(--color-primary);
  color: white;
  font-weight: 700;
  border-radius: var(--radius-md);
  border: none;
  cursor: pointer;
  min-height: 48px; /* モバイル */
  transition: background var(--transition-fast);
}

.button-primary:hover {
  background: var(--color-primary-dark);
}

@media (min-width: 768px) {
  .button-primary {
    min-height: 52px;
  }
}

@media (min-width: 1024px) {
  .button-primary {
    min-height: 56px;
  }
}
```

#### ボタン（セカンダリ）
```css
.button-secondary {
  background: var(--color-card);
  border: 1.5px solid var(--color-border);
  color: var(--color-text-secondary);
  font-weight: 600;
  border-radius: var(--radius-md);
  cursor: pointer;
  min-height: 48px;
  transition: background var(--transition-fast);
}

.button-secondary:hover {
  background: var(--color-bg);
}
```

#### 再生ボタン（丸型）
```css
.button-play {
  width: 48px; /* モバイル */
  height: 48px;
  border-radius: 50%;
  background: var(--color-primary);
  border: none;
  color: white;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
}

@media (min-width: 768px) {
  .button-play {
    width: 52px;
    height: 52px;
  }
}

@media (min-width: 1024px) {
  .button-play {
    width: 56px;
    height: 56px;
  }
}
```

#### ページインジケーター（ドット）
```css
.indicator {
  display: flex;
  gap: 8px;
  justify-content: center;
  align-items: center;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 4px;
  background: #D4D4D4;
  cursor: pointer;
  transition: all var(--transition-normal);
}

.dot-active {
  width: 28px;
  background: var(--color-primary);
}
```

---

### 5. CSS実装ルール

- インラインスタイルは使わない。CSS Modules、styled-components、またはグローバルCSSのいずれかを使用
- メディアクエリはモバイルファーストで記述（`min-width`ベース）
- 色・余白・角丸・シャドウは必ずCSS変数を参照
- アニメーションは`prefers-reduced-motion`を尊重する
- SafeArea対応: `env(safe-area-inset-bottom)`をFooterの下部paddingに加算

```css
.footer {
  padding-bottom: calc(16px + env(safe-area-inset-bottom));
}
```

---

### 6. アクセシビリティ

- すべてのインタラクティブ要素に`role` / `aria-label`を付与
- 再生ボタン: `aria-label="音声を再生"` / `"音声を一時停止"`
- ページインジケーター: `role="tablist"` + `role="tab"` + `aria-selected`
- ボタンのフォーカスリングを消さない（`:focus-visible`で表示）
- カラーコントラスト比: テキストは最低 4.5:1

---

### 7. 適用方法

#### 既存画面を修正する場合
1. まず上記の3層レイアウト構造に当てはめる
2. インラインスタイルをCSS変数ベースに置き換える
3. メディアクエリでタブレット・PCサイズを追加
4. スクロール挙動を検証（Mainのみスクロール可、Header/Footerは固定）

#### 新規画面を作成する場合
1. 3層レイアウト構造をテンプレートとして使用
2. デザイントークンのCSS変数を参照
3. ブレークポイント表に従ってサイズを指定
4. 共通コンポーネントルールに従う

---

## 📋 プロジェクト固有ルール

（以下は既存の MEMORY.md などから転記した内容です）

### Git フロー
- ブランチ: `develop`（デフォルト開発環境）, `main`（本番）
- PR作成: 作業ブランチ → `develop` のみ
- マージフロー: レビュー → ビルド確認 → rebase → マージ
- コンフリクト時は作業ブランチを優先

### コミット・プッシュ
- 作業完了時は**コマンド実行でコミット＆プッシュ**を行う
- ユーザーは「すぐに実行してください」という指示を出す

### 既存ファイル
- iCloud Drive は使わない。代わり `/tmp/cram-school-fix` などのクリーンクローン使用
- `esmExternals: false` が `next.config.mjs` に必須

---

## 🔄 これから適用する画面

以下の画面を順次このガイドラインに適応させる予定：

- [ ] ShadowingOnboarding（新作）→ 3層構造 + CSS変数化
- [ ] listening.tsx（既存）
- [ ] writing.tsx（既存）
- [ ] vocabulary.tsx（既存）
- [ ] settings.tsx（既存）
- [ ] teacher.tsx（既存）
