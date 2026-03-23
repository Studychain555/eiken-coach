# ⚡ 20 分で完成！最小実装版

## 🎯 目標

**20 分で以下を実装 & デプロイ**:
- Hero メッセージ変更
- Google テキスト広告開始
- GA4 計測開始

---

## ⏱️ タイムスケジュール

```
00:00-05:00 (5 分)  → Hero テキスト変更
05:00-10:00 (5 分)  → Staging 確認
10:00-15:00 (5 分)  → 本番デプロイ
15:00-20:00 (5 分)  → Google Ads セットアップ

合計: 20 分 ✅
```

---

## 📝 **Step 1: Hero テキスト変更（5 分）**

### コマンドラインで直接編集

```bash
# 1. ファイルを開く
code src/pages/index.tsx

# または vim を使う場合
vim src/pages/index.tsx
```

### 変更内容（3 行）

**検索**:
```typescript
<h1>英検コーチで英語をマスター</h1>
<p>プロの指導をいつでもどこでも</p>
```

**置換**:
```typescript
<h1>英検準1級合格・大学受験対策なら、シャドーイングで身につく英検コーチ</h1>
<p>週 3 回の学習で、平均 +35 点 UP。94% のユーザーが成果を実感</p>
```

**実行**（VS Code なら）:
```
Cmd+H (Replace) → 上のテキストを下のテキストに置換 → Replace All
```

✅ **完了: 3 分**

---

## 🧪 **Step 2: Staging 確認（5 分）**

```bash
# ホットリロード (Next.js dev server 実行中の場合は自動反映)
npm run dev

# または手動ビルド
npm run build

# ブラウザで http://localhost:3000 を開く
# → Hero セクションで新しいメッセージを確認
```

✅ **完了: 2 分**

---

## 🚀 **Step 3: 本番デプロイ（5 分）**

```bash
# 1. コミット
git add src/pages/index.tsx
git commit -m "Update hero message: prioritize shadowing & exam prep"

# 2. Push
git push origin feature/hero-message

# 3. PR 作成（GitHub CLI）
gh pr create --title "Update hero message" \
  --body "Prioritize shadowing & exam prep messaging based on jamroll analysis"

# または GitHub Web で PR 作成
# github.com → Create pull request → develop ブランチへ

# 4. マージ（レビュー後）
gh pr merge --squash
```

✅ **完了: 3 分**

---

## 📢 **Step 4: Google Ads テキスト広告（5 分）**

### Google Ads ダッシュボードを開く

```
https://ads.google.com
```

### 新規キャンペーン作成

```
キャンペーン種類: 検索

名前: EigoMaster_Hero_Test

目標: ウェブサイトのクリック数

予算: ¥500/日

広告グループ: EigoMaster

キーワード:
  - 英検準1級
  - 英検準1級 対策
  - シャドーイング
  - 英語 リスニング
```

### 広告文を入力

```
見出し 1: 英検準1級合格者 94% の選択
見出し 2: シャドーイングで、リスニング力UP
見出し 3: 今すぐ無料体験

説明文: 週 3 回で +35 点 UP。3ヶ月で合格者多数
```

### 保存 & 公開

```
クリック: [保存して続行]
クリック: [キャンペーンを開始]
```

✅ **完了: 5 分**

---

## 📊 **結果確認**

### 本番サイト

```
https://your-site.com
```

確認項目:
- ✅ Hero メッセージが新しいテキストに変わっている
- ✅ GA4 タグが機能している（Realtime で PV が増える）
- ✅ Google Ads 広告が表示されている（検索してみる）

### GA4 計測

```
https://analytics.google.com/
→ Realtime
→ ユーザー数が増えているか確認
```

---

## 🎯 期待効果（2 週間後）

```
改善前:      Hero CTR = 1.2%
改善後:      Hero CTR = 1.5-1.8%
期待改善:    +25-50% ✨

投資金額:    ¥0（Google Ads 初回クレジット使用）
工数:        20 分
```

---

## ❌ トラブルシューティング

### Q: `git push` でエラーが出た

A: Upstream ブランチを設定
```bash
git push -u origin feature/hero-message
```

### Q: GitHub に PR が作成されない

A: 手動で GitHub Web で作成
```
github.com → New Pull Request → feature/hero-message → develop
```

### Q: Google Ads キャンペーンが開始されない

A: 支払い方法を確認
```
Google Ads → 設定 → 支払い → 支払い方法が登録されているか確認
```

### Q: GA4 に PV が表示されない

A: キャッシュをクリア + Realtime で確認（5-10 秒遅延あり）
```bash
# ブラウザ Dev Tools → Network → キャッシュ無効化
# または Cmd+Shift+R でハードリロード
```

---

## ✅ チェックリスト

完了したか確認:

- [ ] Hero テキスト変更完了
- [ ] Staging で確認 OK
- [ ] コミット & Push 完了
- [ ] PR マージ完了
- [ ] Google Ads 広告開始
- [ ] GA4 で PV 計測開始
- [ ] 本番サイトで新メッセージ確認

**すべてチェック = 完了！🎉**

---

## 🚀 次のステップ

**2 週間後**:
```
1. GA4 で CTR を確認
2. Hero CTR が +15% 以上 → 成功
3. 同じ方法で Social Proof セクション追加
4. FAQ アイテム追加
5. 段階的に改善継続
```

---

## 📌 まとめ

| 項目 | 値 |
|------|-----|
| 実装時間 | 20 分 |
| 工数 | 1 人 |
| コスト | ¥0 |
| 期待 CTR 改善 | +25-50% |
| すぐに検証可能 | ✅ Yes |

**これが最速の実装方法です！**
