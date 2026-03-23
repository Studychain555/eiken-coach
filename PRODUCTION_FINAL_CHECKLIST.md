# EigoMaster 本番環境デプロイ最終チェックリスト

**更新日**: 2026-03-19
**対象バージョン**: v1.0.0
**予定リリース日**: 2026-03-26
**リリース責任者**: ________

---

## 📋 ステージ別チェックリスト

### ステージ 1: 事前準備（3月19-20日）

#### 1.1 環境・ツール確認

- [ ] Node.js v18.17.0 以上がインストール済み
  ```bash
  node --version  # v18.17.0 以上
  ```

- [ ] npm v9.0.0 以上がインストール済み
  ```bash
  npm --version  # v9.0.0 以上
  ```

- [ ] Expo CLI (EAS CLI) がインストール済み
  ```bash
  npm install -g eas-cli
  eas --version
  ```

- [ ] Git がインストール済みで、リポジトリにアクセス可能
  ```bash
  git --version
  git remote -v
  ```

#### 1.2 アカウント・認証確認

- [ ] Expo アカウント作成済み (https://expo.dev)
  ```bash
  eas login
  eas whoami
  ```

- [ ] Apple Developer Account 登録済み
  - Bundle ID: `com.eigomaster.app` を使用

- [ ] Google Play Developer Account 登録済み
  - Package: `com.eigomaster.app` を使用

- [ ] Vercel アカウント作成済み (https://vercel.com)
  ```bash
  npm install -g vercel
  vercel login
  ```

- [ ] GitHub Personal Access Token が準備済み（CI/CDで使用）

#### 1.3 環境変数確認

- [ ] `.env.production` が作成済みかつ記入済み
  ```bash
  cat .env.production  # 確認
  ```

- [ ] 必須環境変数がすべて設定済み
  - [ ] `EXPO_PUBLIC_SUPABASE_URL`
  - [ ] `EXPO_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] `EXPO_PUBLIC_CLAUDE_API_KEY`
  - [ ] `EXPO_PUBLIC_SENTRY_DSN`
  - [ ] `EXPO_PUBLIC_GA_MEASUREMENT_ID`

- [ ] 機密情報（API キー）が `.env.production` に含まれていない
  - [ ] `.gitignore` に `.env.production` が記載済み
  - [ ] GitHub Actions Secrets に登録済み

#### 1.4 ドキュメント確認

- [ ] `PRODUCTION_DEPLOYMENT_GUIDE.md` が整備済み
- [ ] `PRODUCTION_QA_CHECKLIST.md` が整備済み
- [ ] `RELEASE_NOTES.md` が整備済み
- [ ] `README.md` が更新済み

---

### ステージ 2: ビルド準備（3月20-21日）

#### 2.1 依存関係確認

- [ ] `npm ci` でインストール可能
  ```bash
  npm ci
  ```

- [ ] 依存関係に既知の脆弱性がない
  ```bash
  npm audit
  ```

- [ ] TypeScript コンパイルエラーがない
  ```bash
  npx tsc --noEmit
  ```

- [ ] ESLint チェック合格
  ```bash
  npm run lint
  ```

#### 2.2 バンドルサイズ確認

- [ ] 本番用ビルドサイズを測定
  ```bash
  npm run web -- --export --analyze
  ```

- [ ] iOS バンドルサイズ: < 50MB（目標: 45MB）
- [ ] Android バンドルサイズ: < 40MB（目標: 35MB）
- [ ] Web バンドルサイズ: < 3MB（gzip後: < 1MB）

#### 2.3 パフォーマンステスト

- [ ] Lighthouse スコア計測
  ```bash
  npm run web -- --export
  lighthouse https://localhost:3000 --view
  ```
  - [ ] Performance: > 85
  - [ ] Accessibility: > 90
  - [ ] Best Practices: > 85
  - [ ] SEO: > 85

- [ ] 初期ロード時間測定
  - [ ] Web: < 3秒
  - [ ] iOS: < 3秒（シミュレータ）
  - [ ] Android: < 3秒（エミュレータ）

#### 2.4 セキュリティチェック

- [ ] npm audit の脆弱性をすべて修正
  ```bash
  npm audit fix
  ```

- [ ] 機密情報がコード内に含まれていないか確認
  ```bash
  grep -r "sk-ant-" app src  # API キーが含まれていないか確認
  grep -r "eyJhbGci" app src  # JWT トークンが含まれていないか確認
  ```

- [ ] CORS 設定が正しいか確認（Supabase）
- [ ] RLS ポリシーが有効か確認（Supabase）
- [ ] API レート制限が設定済みか確認

---

### ステージ 3: ローカルテスト（3月21-23日）

#### 3.1 Web ビルドテスト

- [ ] ローカル Web ビルド実行
  ```bash
  npm run web
  ```

- [ ] http://localhost:8081 にアクセス可能
- [ ] ログイン画面が表示される
- [ ] 新規登録機能が動作する
- [ ] ホーム画面が表示される

#### 3.2 ブラウザテスト（各種）

**Chrome/Edge**
- [ ] ページが正常に表示される
- [ ] コンソールにエラーがない（F12開発者ツール）
- [ ] Network タブで HTTP 200 が返される

**Safari（macOS）**
- [ ] ページが正常に表示される
- [ ] Safari DevTools でエラーがない

**Firefox**
- [ ] ページが正常に表示される
- [ ] コンソールにエラーがない

#### 3.3 iOS シミュレータテスト

```bash
npm run ios
```

- [ ] iOS シミュレータが起動
- [ ] ホーム画面が表示される
- [ ] 全タブが機能する
- [ ] 音声再生が機能する（シミュレータ）

#### 3.4 Android エミュレータテスト

```bash
npm run android
```

- [ ] Android エミュレータが起動
- [ ] ホーム画面が表示される
- [ ] 全タブが機能する
- [ ] 音声再生が機能する

#### 3.5 機能テスト（ローカル）

**認証**
- [ ] ログイン画面で正常にログイン可能
- [ ] 新規登録が完了
- [ ] ログアウトが機能

**学習機能**
- [ ] 単語テストが動作
- [ ] リスニングが動作
- [ ] シャドーイングが動作
- [ ] ライティング添削が動作

**エラーハンドリング**
- [ ] ネットワークエラー時の処理を確認
- [ ] API エラー時の処理を確認
- [ ] タイムアウト時の処理を確認

---

### ステージ 4: EAS ビルド（3月23-24日）

#### 4.1 iOS ビルド

```bash
eas build --platform ios --release-channel production
```

- [ ] EAS ビルド開始
- [ ] ビルド完了（通常 20-30 分）
- [ ] ビルド ID をメモ（例: `abc123def456`）
- [ ] ビルドアーティファクト確認

**確認項目**
- [ ] Build ID: _______________
- [ ] Build URL: https://expo.dev/builds/...
- [ ] Status: ✅ FINISHED
- [ ] Size: ~45MB

#### 4.2 Android ビルド

```bash
eas build --platform android --release-channel production
```

- [ ] EAS ビルド開始
- [ ] ビルド完了（通常 15-20 分）
- [ ] ビルド ID をメモ
- [ ] ビルドアーティファクト確認

**確認項目**
- [ ] Build ID: _______________
- [ ] Build URL: https://expo.dev/builds/...
- [ ] Status: ✅ FINISHED
- [ ] Size: ~35MB

#### 4.3 ビルドの整合性確認

- [ ] iOS と Android のバージョン番号が一致
  - [ ] iOS: version 1.0.0
  - [ ] Android: versionCode 1

- [ ] 環境変数が正しく使用されているか確認
  - [ ] Supabase URL が本番環境である
  - [ ] API キーが本番環境である
  - [ ] デバッグモードが無効（false）である

---

### ステージ 5: TestFlight / 内部テスト配信（3月24-25日）

#### 5.1 iOS TestFlight 配信

**自動配信（推奨）**
```bash
eas submit --platform ios --latest
```

**または手動配信**
1. App Store Connect にログイン
2. ビルド選択
3. TestFlight 登録

- [ ] iOS ビルドを TestFlight にアップロード
- [ ] TestFlight で「テスト可能」状態に変わった
- [ ] テストユーザーに招待メール送信

#### 5.2 Android Google Play 内部テスト配信

**自動配信（推奨）**
```bash
eas submit --platform android --latest
```

**または手動配信**
1. Google Play Console にログイン
2. テスト → 内部テスト
3. ビルドアップロード

- [ ] Android ビルドを Google Play にアップロード
- [ ] 内部テスト登録完了
- [ ] テストユーザーにリンク共有

#### 5.3 テストユーザー登録

**iOS TestFlight**
- [ ] テスト用メールアドレス（3件以上）を追加
- [ ] 招待メール送信
- [ ] テストユーザーが受け取り確認

**Android Google Play**
- [ ] テスト用メールアドレス（3件以上）を Google Group 登録
- [ ] テストリンク作成・共有
- [ ] テストユーザーがアプリインストール確認

---

### ステージ 6: テスト実施（3月25日）

#### 6.1 基本機能テスト

- [ ] アプリが起動可能
- [ ] ログイン画面が表示
- [ ] ログイン可能
- [ ] ホーム画面が表示
- [ ] 各タブにアクセス可能

#### 6.2 QA チェックリスト実施

**参照**: `PRODUCTION_QA_CHECKLIST.md`

- [ ] 認証テスト（✅ 合格）
- [ ] 英単語テスト（✅ 合格）
- [ ] リスニング（✅ 合格）
- [ ] シャドーイング（✅ 合格）
- [ ] ライティング（✅ 合格）
- [ ] UI/UX（✅ 合格）
- [ ] ネットワーク（✅ 合格）
- [ ] パフォーマンス（✅ 合格）
- [ ] セキュリティ（✅ 合格）

#### 6.3 デバイス別テスト

**iOS**
- [ ] iPhone SE（小型）
- [ ] iPhone 15（中型）
- [ ] iPhone 15 Pro Max（大型）
- [ ] iPad（タブレット）

**Android**
- [ ] Samsung Galaxy A（中～低スペック）
- [ ] Google Pixel（標準スペック）
- [ ] Samsung Galaxy S23（高スペック）
- [ ] Samsung Galaxy Tab（タブレット）

#### 6.4 エラーハンドリングテスト

- [ ] ネットワークオフでのエラー表示
- [ ] API エラー（4xx, 5xx）での処理
- [ ] タイムアウトでの処理
- [ ] 再試行機能の動作
- [ ] エラーメッセージが日本語

#### 6.5 テスト報告書作成

- [ ] テスト結果を記録
- [ ] 発見されたバグを記録
- [ ] 各バグを分類（Critical/High/Medium/Low）
- [ ] クリティカルバグをすべて修正

---

### ステージ 7: ストア申請（3月26日）

#### 7.1 App Store 申請準備

**App Store Connect での作成**

- [ ] App Name: EigoMaster
- [ ] Bundle ID: com.eigomaster.app
- [ ] Primary Language: Japanese
- [ ] Category: Education
- [ ] Subcategory: Language Learning

**アプリ情報**

- [ ] 説明文：
  ```
  英検準1級対策の統合学習アプリです。

  特徴：
  ✓ 2,000語以上の英検準1級単語テスト
  ✓ 音声付きリスニング問題
  ✓ AI採点のシャドーイング練習
  ✓ ライティング自動添削機能
  ✓ 学習進捗の可視化
  ```

- [ ] キーワード: 英検, リスニング, 英単語, ライティング, 英語学習
- [ ] サポートメール: support@eigomaster.com
- [ ] 利用規約 URL: https://eigomaster.com/terms
- [ ] プライバシーポリシー URL: https://eigomaster.com/privacy

**スクリーンショット（5枚）**

- [ ] 1. ホーム画面
- [ ] 2. 単語テスト画面
- [ ] 3. リスニング画面
- [ ] 4. シャドーイング結果画面
- [ ] 5. ダッシュボード画面

**ビルド選択**

- [ ] TestFlight で検証済みのビルドを選択
- [ ] ビルド番号: 1

**App Store Connect で申請**

```bash
eas submit --platform ios --latest
```

または

1. App Store Connect にログイン
2. 「Build」から本番ビルド選択
3. 「Release」をクリック

- [ ] iOS App Store に申請

#### 7.2 Google Play 申請準備

**Google Play Console での作成**

- [ ] App Name: EigoMaster
- [ ] Package: com.eigomaster.app
- [ ] Default Language: English（UI は日本語）
- [ ] Category: Education

**アプリ情報**

- [ ] 短い説明（80文字）:
  ```
  英検準1級対策アプリ
  ```

- [ ] 詳細説明（4,000文字まで）:
  ```
  英検準1級対策の統合学習アプリです。

  機能：
  • 2,000語以上の英検準1級単語テスト（SM-2復習アルゴリズム）
  • AI採点のリスニング問題練習
  • 7ラウンドシャドーイング練習
  • ライティング自動採点機能
  • 学習進捗を可視化するダッシュボード

  対応デバイス: Android 8.0以上
  ```

- [ ] キーワード: 英検準1級, 英語学習, リスニング, 英単語, ライティング

**スクリーンショット（5枚）**

- [ ] 1. ホーム画面
- [ ] 2. 単語テスト画面
- [ ] 3. リスニング画面
- [ ] 4. シャドーイング結果画面
- [ ] 5. ダッシュボード画面

**ビルド選択**

- [ ] 内部テスト で検証済みのビルドを選択

**Google Play に申請**

```bash
eas submit --platform android --latest
```

または

1. Google Play Console にログイン
2. 「Release」 → 「本番環境」
3. ビルド選択 → 「Release」をクリック

- [ ] Google Play に申請

---

### ステージ 8: 審査待機（3月26-30日）

#### 8.1 App Store 審査

- [ ] 申請ステータスを確認
  - [ ] 「ウェイティング審査」: 通常 24-48 時間
  - [ ] 「審査中」: 審査ガイドラインをチェック
  - [ ] 「却下」: フィードバック確認 → 修正 → 再申請

- [ ] 申請中の注意事項
  - [ ] 新しい機能説明を最新版に更新する
  - [ ] リジェクトされた場合の修正対応を準備

#### 8.2 Google Play 審査

- [ ] 申請ステータスを確認
  - [ ] 「審査準備中」: 通常 1-4 時間
  - [ ] 「審査中」: 審査ガイドラインをチェック
  - [ ] 「却下」: フィードバック確認 → 修正 → 再申請

- [ ] 申請中の注意事項
  - [ ] 申請から 24 時間以内に却下されることがある
  - [ ] 却下された場合、修正対応を迅速に行う

#### 8.3 定期確認

- [ ] 1 日 1 回以上、審査状況を確認
- [ ] メール通知を監視
- [ ] 却下通知があれば、フィードバックを読む

---

### ステージ 9: リリース（3月30-31日予定）

#### 9.1 App Store リリース

**承認後**

1. App Store Connect にログイン
2. 「Build」から承認済みビルド確認
3. 「Release」をクリック

- [ ] 承認通知を受け取った
- [ ] App Store Connect で「Ready for Release」を確認
- [ ] 「Release」ボタンをクリック

**リリース完了**

- [ ] App Store での公開確認（通常 1-2 時間以内）
- [ ] App Store で「EigoMaster」を検索して確認

#### 9.2 Google Play リリース

**承認後**

1. Google Play Console にログイン
2. 本番トラック確認
3. ビルド選択 → 「Release」をクリック

- [ ] 承認通知を受け取った
- [ ] Google Play Console で「Ready to release」を確認
- [ ] 「Release」ボタンをクリック

**リリース完了**

- [ ] Google Play での公開確認（通常 1 時間以内）
- [ ] Google Play で「EigoMaster」を検索して確認

#### 9.3 Web リリース

```bash
npm run web -- --export
vercel --prod --token $VERCEL_TOKEN
```

- [ ] Web版ビルド完了
- [ ] Vercel デプロイ完了
- [ ] https://eigomaster.com にアクセス可能

---

### ステージ 10: 本番運用（3月31日以降）

#### 10.1 デプロイ直後の監視（24-48時間）

**監視項目**

- [ ] Sentry ダッシュボードでエラー監視
  - [ ] エラー数: < 100/日
  - [ ] Crash レート: < 0.1%

- [ ] ユーザー数の確認
  - [ ] Google Analytics でアクティブユーザーを監視
  - [ ] インストール数の推移を確認

- [ ] パフォーマンス確認
  - [ ] API レスポンス時間: < 2 秒
  - [ ] 音声読込時間: < 3 秒
  - [ ] メモリ使用量: < 100MB

#### 10.2 ユーザーフィードバック監視

- [ ] App Store レビュー・評価を確認
- [ ] Google Play レビュー・評価を確認
- [ ] サポートメール（support@eigomaster.com）を監視
- [ ] 高評価（4以上）の割合: > 80%

#### 10.3 クリティカルバグへの対応

**バグが発見された場合**

1. 深刻度を判定
   - [ ] Critical（アプリクラッシュ）: 即座に修正・リリース
   - [ ] High（機能使用不可）: 24 時間以内に修正
   - [ ] Medium（部分的問題）: 1 週間以内に修正

2. ホットフィックスを準備
   ```bash
   git checkout develop
   git pull
   # ... バグ修正 ...
   git push
   # ... ビルド・テスト ...
   # ... App Store/Google Play に再申請 ...
   ```

#### 10.4 定期リリーススケジュール

| タイミング | タスク | 例 |
|----------|--------|-----|
| **1 週間後** | v1.0.1 バグ修正版リリース | 軽微なバグ修正 |
| **2 週間後** | ユーザーフィードバック集約 | 高い要望機能を把握 |
| **1 ヶ月後** | v1.1.0 機能追加版計画 | オフラインモード等 |

---

## 📊 チェックリスト完了度

| ステージ | 進捗 | 完了日 |
|---------|------|--------|
| 1. 事前準備 | ☐ 0% | __________ |
| 2. ビルド準備 | ☐ 0% | __________ |
| 3. ローカルテスト | ☐ 0% | __________ |
| 4. EAS ビルド | ☐ 0% | __________ |
| 5. TestFlight/内部テスト | ☐ 0% | __________ |
| 6. テスト実施 | ☐ 0% | __________ |
| 7. ストア申請 | ☐ 0% | __________ |
| 8. 審査待機 | ☐ 0% | __________ |
| 9. リリース | ☐ 0% | __________ |
| 10. 本番運用 | ☐ 0% | __________ |
| **総合進捗** | **☐ 0%** | **__________** |

---

## 🔗 参考ドキュメント

| ドキュメント | 説明 |
|----------|------|
| PRODUCTION_DEPLOYMENT_GUIDE.md | デプロイメント詳細ガイド |
| PRODUCTION_QA_CHECKLIST.md | QA テスト詳細チェックリスト |
| RELEASE_NOTES.md | リリースノート |
| AUDIO_IMPLEMENTATION.md | 音声実装詳細 |
| IMPLEMENTATION_SUMMARY.md | 実装概要 |

---

## 👥 責任者情報

| 役職 | 名前 | メール | 署名 |
|------|------|--------|------|
| プロジェクトマネージャー | | | |
| 開発リード | | | |
| QA マネージャー | | | |
| DevOps / インフラ | | | |

---

## 📝 最終確認

**本チェックリストの確認日**: ____________

**確認者（署名）**: ________________________

**確認日**: ____________

**GO/NO-GO 判定**: ☐ GO  ☐ NO-GO

**NO-GO の場合の理由**:
```
_________________________________________________________________
_________________________________________________________________
```

---

**EigoMaster v1.0.0 本番環境デプロイ準備完了**
