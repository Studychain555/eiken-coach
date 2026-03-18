# EigoMaster デプロイメントチェックリスト

## ✅ Day 7 完成チェック

### 環境設定
- [ ] `.env.local` にすべての環境変数を設定
  - `EXPO_PUBLIC_SUPABASE_URL`
  - `EXPO_PUBLIC_SUPABASE_ANON_KEY`
  - `EXPO_PUBLIC_CLAUDE_API_KEY`
  - `EXPO_PUBLIC_WHISPER_API_KEY`

### Supabase 設定
- [ ] Supabase プロジェクトが作成済み
- [ ] DB スキーマ SQL がすべて実行済み
  - `supabase/migrations/001_initial_schema.sql`
- [ ] RLS ポリシーが設定済み
- [ ] サンプルデータ（単語、問題、プロンプト）が投入済み

### ビルド確認
- [ ] `npm run web` でエラーなく起動
- [ ] 全ページのナビゲーション動作確認
- [ ] 認証フロー（ログイン・新規登録）動作確認

### 機能テスト
- [ ] **Day 2: 認証・ホーム**
  - [ ] ログイン画面で正常にログイン可能
  - [ ] 新規登録で自動プロフィール作成
  - [ ] ホーム画面に統計表示

- [ ] **Day 3: 英単語テスト**
  - [ ] ステージ選択表示
  - [ ] 4択問題の正誤判定
  - [ ] SM-2 復習アルゴリズム動作
  - [ ] 結果画面の統計表示

- [ ] **Day 4: リスニング問題**
  - [ ] 問題一覧表示
  - [ ] 音声再生・速度調整
  - [ ] 4択回答機能
  - [ ] 正解表示 + スクリプト確認

- [ ] **Day 5: シャドーイング**
  - [ ] 7回ラウンド制御
  - [ ] 音声再生・録音機能
  - [ ] AI 添削（ダミースコア）
  - [ ] 結果グラフ表示

- [ ] **Day 6: ライティング添削**
  - [ ] 問題選択画面
  - [ ] テキスト入力・カメラ撮影
  - [ ] AI 採点結果表示
  - [ ] フィードバック・模範解答表示

- [ ] **Day 7: エラーハンドリング**
  - [ ] ネットワークエラー時の表示
  - [ ] API エラーの適切なメッセージ表示
  - [ ] ローディング状態の統一

### UI/UX 最終調整
- [ ] ダークモード動作確認
- [ ] タブレット対応確認（iPad）
- [ ] 画面遷移アニメーション確認
- [ ] ボタンのタップフィードバック確認
- [ ] テキストサイズの可読性確認

### ストア申請準備

#### iOS (App Store)
- [ ] `app.json` に `bundleIdentifier` 設定
- [ ] `buildNumber` を "1" に設定
- [ ] プライバシーポリシーを準備
- [ ] スクリーンショット（5枚）を準備
- [ ] アプリ説明文を日本語で記載

#### Android (Google Play)
- [ ] `app.json` に `package` 設定
- [ ] `versionCode` を 1 に設定
- [ ] プライバシーポリシーを準備
- [ ] スクリーンショット（5枚）を準備
- [ ] アプリ説明文を日本語で記載

### API キー設定
- [ ] Claude API キーが有効
- [ ] Whisper API キーが有効（音声認識使用時）
- [ ] 本番環境でのレート制限を確認

### パフォーマンス最適化
- [ ] 画像最適化（アイコン、スプラッシュ）
- [ ] バンドルサイズ確認
- [ ] 初期ローディング時間測定
- [ ] メモリ使用量確認

---

## 📦 ビルドとリリース

### ローカルビルド
```bash
# Web テスト
npm run web

# iOS シミュレータ
npm run ios

# Android エミュレータ
npm run android
```

### EAS ビルド（Expo サービス）
```bash
# インストール
npm install -g eas-cli

# ログイン
eas login

# ビルド設定
eas build --platform ios
eas build --platform android
```

### TestFlight / 内部テスト配信
```bash
# iOS: TestFlight
eas build --platform ios --release-channel production

# Android: Google Play 内部テスト
eas build --platform android --release-channel production
```

---

## 🚀 本番リリース手順

### 1. 最終テスト（2日間）
- [ ] TestFlight で iOS テスト
- [ ] Google Play 内部テストで Android テスト
- [ ] 本社・チームメンバーに配布して確認

### 2. ストア申請
- [ ] App Store に申請
- [ ] Google Play に申請
- [ ] 申請コメント「初回リリース」と記載

### 3. リリース待機（3-7日）
- [ ] App Store 審査待ち
- [ ] Google Play 審査待ち

### 4. リリース後
- [ ] ユーザーサポート準備
- [ ] バグ報告チャネル設置
- [ ] 更新スケジュール計画

---

## 📊 初期リリース後の改善計画（Phase 2）

### Week 2
- [ ] ユーザーフィードバック収集
- [ ] バグ修正リリース（v1.0.1）

### Week 3-4
- [ ] 教師管理画面実装
- [ ] ランキング機能実装
- [ ] ダークモード完全対応

### Week 5-6
- [ ] オフラインモード実装
- [ ] 音声ファイルのローカルキャッシュ

---

## 🆘 トラブルシューティング

### ビルドエラー
```bash
# キャッシュクリア
npm cache clean --force
rm -rf node_modules package-lock.json

# 再インストール
npm install
```

### API エラー
- Supabase JWT の有効性確認
- CORS 設定確認
- ネットワーク接続確認

### パーミッションエラー
- iOS: Info.plist 確認
- Android: AndroidManifest.xml 確認
- ユーザーにパーミッション許可を要求

---

## 📞 サポート連絡先

- **Expo**: https://docs.expo.dev
- **Supabase**: https://supabase.com/docs
- **React Native**: https://reactnative.dev/docs

---

**デプロイ準備完了: 2026-03-26**
