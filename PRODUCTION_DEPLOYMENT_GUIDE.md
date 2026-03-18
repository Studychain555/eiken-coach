# EigoMaster 本番環境デプロイメントガイド

**最終更新**: 2026-03-19
**バージョン**: 1.0.0
**ステータス**: ✅ 本番対応準備完了

---

## 📋 目次

1. [事前準備](#事前準備)
2. [環境設定](#環境設定)
3. [ビルド最適化](#ビルド最適化)
4. [モバイルビルド](#モバイルビルド)
5. [Web デプロイ](#webデプロイ)
6. [品質保証](#品質保証)
7. [デプロイ手順](#デプロイ手順)
8. [本番運用](#本番運用)

---

## 事前準備

### 1. 開発環境確認

```bash
# Node.js バージョン確認（v18以上推奨）
node --version  # v18.17.0以上

# npm バージョン確認
npm --version   # v9.0.0以上

# Expo CLI インストール
npm install -g eas-cli@latest

# eas-cli バージョン確認
eas --version
```

### 2. アカウント設定

**Expo アカウント**
- Expo Web: https://expo.dev
- メールアドレス確認済み
- 2要素認証有効化

**Apple Developer Account**
- 年間$99の開発者登録完了
- App Store Connect にログイン可能
- 証明書・プロビジョニングプロファイル準備

**Google Play Developer Account**
- 年間$25の開発者登録完了
- Google Play Console にログイン可能
- Service Account キー準備（JSON形式）

### 3. 証明書・キーの準備

**iOS の場合**
```bash
# EAS で管理する場合（推奨）
eas credentials

# または Apple Developer Portal で手動管理
# 1. App ID を作成: com.eigomaster.app
# 2. 開発証明書 (.cer) をダウンロード
# 3. プロビジョニングプロファイル (.mobileprovision) をダウンロード
```

**Android の場合**
```bash
# キーストア生成（初回のみ）
keytool -genkey -v -keystore eigomaster-key.jks \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias eigomaster-key

# または EAS で管理
eas credentials
```

---

## 環境設定

### 1. 本番環境変数設定

`.env.production` ファイルは既に作成済みです。確認・更新してください：

```bash
# Supabase 本番環境
EXPO_PUBLIC_SUPABASE_URL=https://ziqskxtpypyhbqfmbmhi.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Sentry エラーログ
EXPO_PUBLIC_SENTRY_DSN=https://your-project@sentry.io/project-id

# Google Analytics
EXPO_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Claude API（本番用キー）
EXPO_PUBLIC_CLAUDE_API_KEY=sk-ant-api03-...

# 環境フラグ
NODE_ENV=production
EXPO_PUBLIC_DEBUG_MODE=false
```

### 2. Sentry 統合設定

**Sentry に新規プロジェクト作成**
```
1. https://sentry.io にログイン
2. 「Projects」 → 「Create Project」
3. Platform: React Native
4. Alert rules 有効化
5. DSN（Sentry URL）をコピー
```

**Sentry Team メンバー設定**
```
1. Settings → Integrations
2. Slack: チーム通知用に設定
3. Email: クリティカルエラーのメール通知
4. PagerDuty: オンコール対応用（オプション）
```

### 3. Google Analytics 統合

**Google Analytics 新規プロパティ作成**
```
1. https://analytics.google.com にログイン
2. 新規プロパティ作成
3. アプリ（iOS/Android）を選択
4. Measurement ID（G-XXXXXXXXXX）をコピー
```

---

## ビルド最適化

### 1. バンドルサイズ削減

**不要な依存関係を確認・削除**

```bash
# 依存関係のサイズ確認
npm list --depth=0

# 不要なパッケージ削除
npm uninstall [package-name]
```

**重い依存関係の置き換え**

| 重い | 軽量な代替案 |
|------|----------|
| moment.js | date-fns, day.js |
| lodash | lodash-es（Tree-shakeableバージョン） |
| axios | fetch API（バンドルに含まれない） |

### 2. コード分割（Code Splitting）

既に Expo Router が自動的にコード分割を実施しています。確認：

```bash
# ビルド時のバンドルサイズを確認
eas build --platform ios --release-channel production --analyze
```

### 3. 画像最適化

**アイコン・スプラッシュ画像の最適化**

```bash
# PNG/JPEG の圧縮
npm install -g imagemin-cli

imagemin assets/images/*.png --out-dir=assets/images
imagemin assets/images/*.jpg --out-dir=assets/images

# WebP 変換（さらなる削減）
cwebp assets/images/*.png -o assets/images/%.webp
```

**推奨サイズ**
- アイコン: 1024x1024px（PNG）
- スプラッシュ: 1242x2436px（PNG）
- サムネイル: 512x512px（PNG）

### 4. Hermes エンジン設定（Android）

App.json に以下を追加してパフォーマンス向上：

```json
{
  "android": {
    "enableHermes": true
  }
}
```

---

## モバイルビルド

### 1. iOS ビルド準備

**build.json 確認**

```json
{
  "build": {
    "production": {
      "ios": {
        "resourceClass": "m1",
        "buildType": "client",
        "provisioning": "automatic"
      }
    }
  }
}
```

**ビルド実行**

```bash
# EAS ビルド開始
eas build --platform ios --release-channel production

# または ローカルビルド
xcodebuild -workspace ios/EigoMaster.xcworkspace \
  -scheme EigoMaster \
  -configuration Release \
  -derivedDataPath ios/build
```

### 2. Android ビルド準備

**build.json 確認**

```json
{
  "build": {
    "production": {
      "android": {
        "buildType": "apk",
        "keystorePassword": "$KEYSTORE_PASSWORD",
        "keyPassword": "$KEY_PASSWORD",
        "keyAlias": "eigomaster-key"
      }
    }
  }
}
```

**環境変数設定（EAS Build用）**

```bash
# EAS にシークレット設定
eas secret:create --scope project --name KEYSTORE_PASSWORD
eas secret:create --scope project --name KEY_PASSWORD
```

**ビルド実行**

```bash
# EAS ビルド開始
eas build --platform android --release-channel production

# または ローカルビルド
./gradlew assembleRelease
```

### 3. TestFlight / Google Play 内部テスト配信

**iOS (TestFlight)**

```bash
# ビルド完了後、自動的に TestFlight に送信
eas submit --platform ios --latest

# または、手動で App Store Connect にアップロード
xcode-select --install  # コマンドラインツル導入
```

**Android (Google Play 内部テスト)**

```bash
# ビルド完了後、Google Play に送信
eas submit --platform android --latest

# または、手動で Google Play Console にアップロード
```

### 4. テストユーザー招待

**iOS (TestFlight)**
```
1. App Store Connect にログイン
2. 「Build」 → 「TestFlight」
3. テストユーザーを追加
4. 招待メール送信
```

**Android (Google Play)**
```
1. Google Play Console にログイン
2. テスト → 内部テスト
3. テスターを追加
4. テストリンク共有
```

---

## Web デプロイ

### 1. Vercel へのデプロイ

**Vercel アカウント設定**

```bash
# Vercel CLI インストール
npm install -g vercel

# Vercel ログイン
vercel login

# プロジェクトをリンク
vercel link

# 環境変数設定
vercel env add EXPO_PUBLIC_SUPABASE_URL
vercel env add EXPO_PUBLIC_SUPABASE_ANON_KEY
vercel env add EXPO_PUBLIC_CLAUDE_API_KEY
```

**自動デプロイ設定**

```bash
# 本番環境設定（vercel.json）
cat > vercel.json << 'EOF'
{
  "buildCommand": "npm run web -- --export",
  "env": {
    "NODE_ENV": "production"
  },
  "public": true,
  "regions": ["sfo1"],
  "crons": [
    {
      "path": "/api/health",
      "schedule": "0 */6 * * *"
    }
  ]
}
EOF
```

**デプロイ実行**

```bash
# 本番環境へのデプロイ
vercel --prod

# または GitHub との連携を設定して自動デプロイ
```

### 2. Cloudflare CDN 設定

**Cloudflare で新規サイト追加**

```
1. https://dash.cloudflare.com にログイン
2. 「Websites」 → 「Add a domain」
3. eigomaster.com を登録
4. Cloudflare ネームサーバーに切り替え
```

**キャッシング設定**

```json
{
  "caching": {
    "default_ttl": 86400,
    "browser_ttl": 1800,
    "rules": [
      {
        "path": "/api/*",
        "ttl": 0,
        "cache_control": "no-cache"
      },
      {
        "path": "/assets/*",
        "ttl": 31536000,
        "cache_control": "public, max-age=31536000"
      }
    ]
  }
}
```

### 3. HTTPS・DNS 設定

**SSL/TLS 設定**

```
1. Cloudflare Dashboard → SSL/TLS
2. Full (strict) モード選択
3. 証明書は Cloudflare が自動管理
```

**DNS A レコード設定**

```
eigomaster.com → Vercel のグローバル IP
*.eigomaster.com → Cloudflare CNAME
```

---

## 品質保証

### 1. E2E テスト実装

**Detox フレームワーク設定**

```bash
# インストール
npm install --save-dev detox-cli detox detox-config

# テスト実行
detox test e2e
```

**主要テストシナリオ**

| シナリオ | 説明 | 期待結果 |
|--------|------|--------|
| ログイン | ユーザー認証フロー | 認証成功、ホーム画面表示 |
| 英単語テスト | 4択問題の解答 | 正誤判定、統計更新 |
| リスニング | 音声再生・回答 | 音声再生、スコア計算 |
| ライティング | 解答入力・採点 | AI採点結果表示 |
| エラーハンドリング | ネットワークエラー | エラーメッセージ表示、リトライ可能 |

### 2. パフォーマンステスト

**初期ロード時間計測**

```bash
# Lighthouse でパフォーマンス測定
npm install -g lighthouse

lighthouse https://eigomaster.com --view

# 目標スコア
# Performance: 90以上
# Accessibility: 90以上
# Best Practices: 90以上
# SEO: 90以上
```

**メモリ・CPU 使用量計測**

```bash
# デバイスモニタリング
npm run profile

# 結果: < 100MB メモリ、< 20% CPU
```

### 3. セキュリティテスト

**依存関係脆弱性スキャン**

```bash
# npm audit
npm audit

# npm audit fix
npm audit fix

# OWASP Top 10 チェック
npm install -g snyk
snyk test
```

**API セキュリティ確認**

```
✓ HTTPS 通信のみ
✓ API キーは環境変数で管理
✓ CORS ホワイトリスト設定
✓ レート制限実装
✓ SQL インジェクション対策（Supabase）
```

---

## デプロイ手順

### Phase 1: 事前確認（1-2日）

- [ ] すべての環境変数を `.env.production` に設定
- [ ] Sentry・Google Analytics を設定
- [ ] 開発者アカウント・証明書を準備
- [ ] デバッグモードを無効化（`EXPO_PUBLIC_DEBUG_MODE=false`）
- [ ] バンドルサイズを確認（< 3MB）

### Phase 2: ビルド（1-2日）

```bash
# 1. ローカルビルドテスト
npm run web
npm run ios
npm run android

# 2. EAS ビルド
eas build --platform ios --release-channel production
eas build --platform android --release-channel production

# 3. ビルド成功確認
# → ビルドID をメモして保持
```

### Phase 3: TestFlight / 内部テスト（3-7日）

```bash
# iOS TestFlight
eas submit --platform ios --latest

# Android Google Play 内部テスト
eas submit --platform android --latest
```

**テストチェックリスト**
- [ ] ログイン・ログアウト動作確認
- [ ] すべての機能が正常に動作
- [ ] 音声再生がスムーズ
- [ ] 画像が正常に表示
- [ ] エラーハンドリングが機能
- [ ] パフォーマンスが良好

### Phase 4: ストア申請（1日）

```bash
# iOS App Store
eas submit --platform ios

# Android Google Play
eas submit --platform android
```

**申請情報**

| 項目 | 内容 |
|------|------|
| アプリ名 | EigoMaster |
| カテゴリ | 教育 |
| 説明 | 英検準1級対策の統合学習アプリ |
| キーワード | 英検, リスニング, 英単語, ライティング |
| プライバシーポリシー | https://eigomaster.com/privacy |
| サポートメール | support@eigomaster.com |
| リリースノート | v1.0.0 初回リリース |

### Phase 5: 審査待機（3-7日）

**App Store**
- 審査期間: 通常 24-48 時間
- 却下時の修正対応

**Google Play**
- 審査期間: 通常 1-4 時間
- 自動審査システム

### Phase 6: リリース（1日）

```bash
# App Store
# 1. App Store Connect にログイン
# 2. 「Build」から本番ビルドを選択
# 3. 「Release」をクリック

# Google Play
# 1. Google Play Console にログイン
# 2. Version release をクリック
# 3. 本番トラックに昇格
```

---

## 本番運用

### 1. デプロイ直後の監視（24-48時間）

**監視項目**

```
✓ Sentry エラー数
✓ ユーザーセッション数
✓ API レスポンス時間
✓ Crash レート
✓ ユーザー評価・フィードバック
```

**アラート設定**

```
エラー数 > 100/h → Slack 通知
Crash レート > 0.5% → 緊急メール
API レスポンス > 2s → ダッシュボード表示
```

### 2. ロールバック計画

**ロールバック手順**

```bash
# 1. 前バージョンを確認
eas build:list

# 2. 前バージョンをストアに戻す
eas submit --platform ios --id previous-build-id

# 3. 問題分析とホットフィックス
git checkout v1.0.0
# ... バグ修正 ...
git tag v1.0.1
```

### 3. 定期的なメンテナンス

| 頻度 | タスク |
|------|--------|
| **日次** | Sentry ダッシュボード確認、クラッシュログ確認 |
| **週次** | パフォーマンス指標確認、ユーザーフィードバック集約 |
| **月次** | 依存関係アップデート、セキュリティパッチ適用 |
| **四半期** | 大規模機能アップデート、UI/UX改善 |

### 4. バージョン管理

**セマンティックバージョニング（SemVer）**

```
v1.0.0 → v1.0.1  : バグ修正
v1.0.0 → v1.1.0  : 機能追加（後方互換）
v1.0.0 → v2.0.0  : 大規模変更（後方互換破棄）
```

**リリースノート例**

```markdown
## v1.0.1 (2026-03-25)

### 修正
- 音声再生時のタイムアウトバグを修正
- ログイン画面の日本語テキスト表示を改善
- メモリリークを修正

### 改善
- ネットワークエラーメッセージを日本語に変更
- 初期ロード時間を 500ms 短縮

### 既知の問題
- 低速ネットワーク（<1Mbps）でのビデオ読み込み時間が長い
```

---

## トラブルシューティング

### ビルドエラー

**エラー: "Xcode version is too old"**

```bash
xcode-select --install
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
```

**エラー: "Pod install failed"**

```bash
cd ios
rm Pods Podfile.lock
pod install --repo-update
cd ..
```

### デプロイエラー

**エラー: "Certificate error"**

```bash
# EAS credentials を再設定
eas credentials --platform ios
eas credentials --platform android
```

**エラー: "Bundle size too large"**

```bash
# 依存関係を確認
npm ls --depth=0

# 不要なパッケージを削除
npm uninstall [heavy-package]
```

### ランタイムエラー

**Supabase 接続エラー**

1. `.env.production` の URL を確認
2. Supabase プロジェクトのステータスを確認
3. RLS ポリシーを確認

**Claude API エラー**

1. API キーが有効か確認
2. 使用可能な API クレジットを確認
3. レート制限を確認

---

## まとめ

✅ **本番環境デプロイ準備完了**

このガイドに従うことで、EigoMaster を安全かつ確実に本番環境にデプロイできます。

**次のステップ**

1. `.env.production` を最終確認
2. ローカルビルドテスト実行
3. EAS ビルド開始
4. TestFlight / 内部テスト開始
5. ストア申請

**サポート**

問題が発生した場合は、以下を確認してください：

- [Expo ドキュメント](https://docs.expo.dev)
- [EAS Build ガイド](https://docs.expo.dev/build/introduction/)
- [Sentry ドキュメント](https://docs.sentry.io)

---

**本番デプロイ準備日**: 2026-03-19
**予定リリース日**: 2026-04-02
**デプロイ責任者**: Engineering Team
