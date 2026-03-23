# EigoMaster 本番デプロイガイド

本番環境への安全で確実なデプロイプロセスのドキュメントです。

## 概要

EigoMaster のデプロイパイプラインは以下の要素で構成されています：

| コンポーネント | 説明 | 対応OS |
|---|---|---|
| **Web版** | Expo Web + Vercel/Cloudflare | ブラウザ |
| **iOS版** | EAS Build + TestFlight | iOS 14+ |
| **Android版** | EAS Build + Google Play | Android 8+ |
| **CI/CD** | GitHub Actions | - |

---

## 前提条件

### 環境セットアップ

```bash
# Node.js & npm のインストール (v18以上)
node --version  # v18以上
npm --version   # v9以上

# EAS CLI のインストール
npm install -g eas-cli@latest expo-cli@latest

# EAS ログイン
eas login
# Expo アカウント認証情報を入力

# GitHub CLI（オプション）
brew install gh
gh auth login
```

### 必須の秘密情報

以下が GitHub Secrets に設定されていることを確認してください：

- `EAS_TOKEN` - EAS API トークン
- `APPLE_ID` - Apple 開発者 ID
- `APPLE_PASSWORD` - Apple アプリケーション固有パスワード
- `APPLE_TEAM_ID` - Apple Team ID
- `ASC_APP_ID` - App Store Connect ID
- `GOOGLE_PLAY_API_KEY` - Google Service Account (Base64)
- `VERCEL_TOKEN` - Vercel API トークン
- `CLOUDFLARE_API_TOKEN` - Cloudflare Pages トークン

詳細は [GITHUB_SECRETS_SETUP.md](./GITHUB_SECRETS_SETUP.md) を参照してください。

---

## デプロイフロー

### 1. 開発環境（develop ブランチ）

```
develop ブランチへのプッシュ
    ↓
GitHub Actions 自動実行
    ├─ Unit Tests 実行
    ├─ Web版ビルド（Staging）
    ├─ iOS版ビルド（Preview）
    └─ Android版ビルド（Preview）
    ↓
内部テスト（TestFlight / Google Play Internal）
```

### 2. ステージング環境（staging ブランチ）

```
staging ブランチへのプッシュ
    ↓
GitHub Actions 自動実行
    ├─ Security Scan
    ├─ Web版ビルド & Vercel デプロイ
    ├─ iOS版ビルド & TestFlight アップロード
    └─ Android版ビルド & Google Play 内部テスト版
    ↓
QA テスト
```

### 3. 本番環境（main ブランチ）

```
main ブランチへのプッシュ / タグプッシュ
    ↓
GitHub Actions 自動実行
    ├─ 全テスト実行
    ├─ Web版ビルド & Cloudflare Pages デプロイ
    ├─ iOS版ビルド & TestFlight 提出
    └─ Android版ビルド & Google Play 内部テスト版
    ↓
App Store Review（手動）
Google Play Review（手動）
```

---

## デプロイ方法

### CLI デプロイ（推奨）

最も簡単で確実な方法は、提供されているデプロイスクリプトを使用することです。

#### ステージングへのデプロイ

```bash
# Web版のみ
./scripts/deploy.sh -e staging -p web

# iOS版のみ
./scripts/deploy.sh -e staging -p ios

# 全プラットフォーム
./scripts/deploy.sh -e staging -p all

# ドライラン（実際のデプロイなし）
./scripts/deploy.sh -e staging -p all -d
```

#### 本番環境へのデプロイ

```bash
# Web版のみ
./scripts/deploy.sh -e production -p web

# 全プラットフォーム（ストア提出あり）
./scripts/deploy.sh -e production -p all -s

# 確認ダイアログ付き
./scripts/deploy.sh -e production -p all -s
# "本当に続行しますか? (yes/no):" が表示される
```

### GitHub Actions による自動デプロイ

#### 自動トリガー

1. **develop ブランチへのプッシュ**
   - 自動的にステージング環境にデプロイ

2. **main ブランチへのプッシュ**
   - 自動的に本番環境にデプロイ（Web版のみ）
   - TestFlight/Google Play への提出は手動確認必須

#### 手動トリガー（Workflow Dispatch）

```bash
# GitHub CLI を使用
gh workflow run build-web.yml -f environment=production

# または GitHub UI で
# Actions タブ > 対象ワークフロー > "Run workflow"
```

### 手動デプロイ（詳細な制御が必要な場合）

#### Web版

```bash
# 環境ファイルのセットアップ
cp .env.production .env.local

# ビルド
npm run web -- --mode=production

# Vercel へのデプロイ
vercel --prod

# または Cloudflare Pages へデプロイ
wrangler pages deploy dist/
```

#### iOS版

```bash
# 環境設定
cp .env.production .env.local

# EAS ログイン
eas login

# ビルド
eas build --platform ios --profile production --wait

# ビルド ID を取得
BUILD_ID=$(eas build list --platform ios --limit 1 --json | jq -r '.[0].id')

# TestFlight へ提出
eas submit --platform ios --build-id $BUILD_ID --non-interactive
```

#### Android版

```bash
# 環境設定
cp .env.production .env.local

# EAS ログイン
eas login

# ビルド
eas build --platform android --profile production --wait

# ビルド ID を取得
BUILD_ID=$(eas build list --platform android --limit 1 --json | jq -r '.[0].id')

# Google Play へ提出
eas submit --platform android --build-id $BUILD_ID --non-interactive
```

---

## バージョン管理

### セマンティックバージョニング（SemVer）

```
MAJOR.MINOR.PATCH-PRERELEASE+BUILD
例: 1.0.5-alpha.1+build.123
```

### リリースタグの作成

```bash
# 次のバージョンを決定
# 例: 1.0.0 → 1.0.1 (パッチ)
#     1.0.0 → 1.1.0 (マイナー)
#     1.0.0 → 2.0.0 (メジャー)

# タグを作成してプッシュ
git tag -a v1.0.1 -m "Release version 1.0.1: 音声認識の改善"
git push origin v1.0.1

# または main ブランチにマージ後に tag を作成
git checkout main
git pull origin main
git tag -a v1.0.1 -m "Release version 1.0.1"
git push origin v1.0.1
```

### app.json と eas.json のバージョン同期

```bash
# 現在のバージョンを確認
grep '"version"' app.json

# バージョンを更新
npm version minor  # パッチ更新: patch, マイナー更新: minor, メジャー更新: major

# または手動更新
# app.json で "version" を更新
# eas.json でも同期させる
```

---

## デプロイ前のチェックリスト

### コード品質

- [ ] テストがすべてパス: `npm test`
- [ ] Linting エラーなし: `npm run lint`
- [ ] 型チェック成功: `npm run type-check` (TypeScript プロジェクトの場合)
- [ ] ビルド成功: `npm run build`
- [ ] セキュリティスキャン: `npm audit`

### 環境設定

- [ ] 環境ファイルが正しい (`.env.production` など)
- [ ] API エンドポイントが正しい
- [ ] データベース接続情報が正しい
- [ ] シークレット情報が GitHub Secrets に設定されている

### 機能確認

- [ ] 新機能が意図通りに動作
- [ ] バグ修正が確認された
- [ ] パフォーマンスが劣化していない
- [ ] 互換性が保たれている（古いiOS/Androidバージョンでも動作）

### ドキュメント

- [ ] CHANGELOG が更新されている
- [ ] README が最新版
- [ ] API ドキュメントが更新されている
- [ ] リリースノートが準備されている

---

## デプロイ後の確認

### Web版

```bash
# サイトの読み込み確認
curl -I https://eigomaster.app

# キャッシュクリア（必要に応じて）
curl -X POST https://api.cloudflare.com/client/v4/zones/{zone_id}/purge_cache \
  -H "Authorization: Bearer $CLOUDFLARE_TOKEN" \
  -d '{"purge_everything":true}'
```

### iOS版

```bash
# TestFlight アップロードの確認
# https://appstoreconnect.apple.com > TestFlight > EigoMaster > ビルド確認

# 内部テスター向けのテスト実施
# メール: "新しいiOS版テストビルドが利用可能です" の確認
```

### Android版

```bash
# Google Play Console での確認
# https://play.google.com/console > EigoMaster > 内部テスト版

# テスターデバイスでの検証
# Google Play > アプリ内テスト > デバイスでインストール
```

### 監視とアラート

```bash
# エラーログの確認（Sentry）
# https://sentry.io > EigoMaster > Release

# アナリティクスの確認
# https://analytics.google.com > EigoMaster

# ダウンタイムモニタリング
# Cloudflare Analytics > EigoMaster > Uptime
```

---

## トラブルシューティング

### ビルドエラー

#### "Network error" または "Timeout"

```bash
# ネットワーク接続を確認
ping google.com

# キャッシュをクリア
eas build --platform ios --profile production --wait --clear-cache

# または
rm -rf ~/.eas node_modules
npm ci
```

#### "Invalid Apple credentials"

```bash
# Apple ID とパスワードを再入力
eas login

# 秘密情報を更新
gh secret set APPLE_PASSWORD --body "new-app-specific-password"
```

### デプロイエラー

#### "Vercel deployment failed"

```bash
# Vercel ログを確認
vercel logs --tail

# デプロイを再試行
vercel --prod --force
```

#### "Cloudflare Pages deployment failed"

```bash
# Cloudflare ダッシュボードでビルドログを確認
# https://dash.cloudflare.com > Pages > eigomaster > Build

# 問題を修正後、再度デプロイ
wrangler pages deploy dist/
```

### 提出エラー

#### TestFlight "Rejection: Guideline 2.1 - Performance"

1. App Store Connect でリジェクト理由を確認
2. アプリをビルド・テスト
3. 修正内容をコミット
4. 新しいビルドを作成・提出

#### Google Play "Policy violation"

1. Google Play Console でリジェクト理由を確認
2. ポリシー違反を修正
3. バージョンコードを増やしてビルド
4. 新しいビルドを提出

---

## ロールバック手順

### Web版

```bash
# 前のバージョンにロールバック
# Vercel
vercel rollback

# または Cloudflare
git revert HEAD
git push origin main
```

### iOS版

```bash
# TestFlight でロールバック
# App Store Connect > TestFlight > 前のビルドを選択 > 提出

# または CLI
./scripts/rollback.sh -p ios
```

### Android版

```bash
# Google Play でロールバック
# Google Play Console > アプリ > 内部テスト版 > 前のビルドを選択

# または CLI
./scripts/rollback.sh -p android
```

---

## パフォーマンス最適化

### Web版 CDN キャッシング

```javascript
// vercel.json または cloudflare.json
{
  "headers": [
    {
      "source": "/static/:path*",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/:path*",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=3600, must-revalidate"
        }
      ]
    }
  ]
}
```

### モバイルアプリサイズ最適化

```bash
# ビルドサイズの確認
eas build --platform ios --analyze

# バンドルサイズを分析
npx react-native bundle --platform ios --dev false --reset-cache --analyze-hrm
```

---

## まとめ

| タスク | コマンド | 時間 |
|---|---|---|
| ステージング Web | `./scripts/deploy.sh -e staging -p web` | 5分 |
| ステージング モバイル | `./scripts/deploy.sh -e staging -p all` | 30分 |
| 本番 Web | `./scripts/deploy.sh -e production -p web` | 5分 |
| 本番 モバイル | `./scripts/deploy.sh -e production -p all -s` | 1時間 |

詳細は各セクションを参照してください。
