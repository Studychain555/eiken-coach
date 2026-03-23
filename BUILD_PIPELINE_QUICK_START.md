# EigoMaster ビルドパイプライン クイックスタート

本番環境へのデプロイを実施するための最小限の手順ガイドです。

---

## 1分間セットアップ

### 前提条件

```bash
# Node.js v18+ 確認
node --version

# npm 確認
npm --version

# Expo CLI インストール
npm install -g eas-cli@latest expo-cli@latest

# EAS ログイン
eas login
```

### GitHub Secrets の設定

GitHub リポジトリの **Settings > Secrets and variables > Actions** で以下を設定：

| Secret | 値 | 取得方法 |
|--------|---|--------|
| `EAS_TOKEN` | EAS トークン | `eas credentials --show` |
| `APPLE_ID` | Apple 開発者 ID | appleid.apple.com |
| `APPLE_PASSWORD` | App 固有パスワード | appleid.apple.com > Security |
| `APPLE_TEAM_ID` | Apple Team ID | developer.apple.com |
| `ASC_APP_ID` | App Store Connect ID | appstoreconnect.apple.com |
| `GOOGLE_PLAY_API_KEY` | Service Account JSON (Base64) | Google Cloud Console |
| `VERCEL_TOKEN` | Vercel API トークン | vercel.com/account/tokens |
| `VERCEL_ORG_ID` | Vercel Organization ID | Vercel ダッシュボード |
| `VERCEL_PROJECT_ID` | Vercel Project ID | Vercel Project Settings |
| `CLOUDFLARE_API_TOKEN` | Cloudflare Pages Token | dash.cloudflare.com |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare Account ID | dash.cloudflare.com |
| `SLACK_WEBHOOK_URL` | Slack Webhook URL | slack.com/apps |

詳細は [GITHUB_SECRETS_SETUP.md](./GITHUB_SECRETS_SETUP.md) を参照。

---

## デプロイパターン別ガイド

### パターン 1: ステージング Web 版のみ

```bash
# 最も簡単: develop ブランチにプッシュするだけ
git add .
git commit -m "feat: new feature"
git push origin develop

# GitHub Actions が自動実行
# 約 10 分後にステージング環境にデプロイ完了
```

### パターン 2: ステージング 全プラットフォーム

```bash
# develop ブランチにプッシュ
git add .
git commit -m "feat: new feature"
git push origin develop

# GitHub Actions が自動実行
# Web, iOS (TestFlight), Android (Google Play) にデプロイ
# 約 1-2 時間で完了
```

### パターン 3: 本番 Web 版のみ

```bash
# main ブランチにマージ
git checkout main
git pull origin main
git merge develop
git push origin main

# または Tag を作成
git tag -a v1.0.5 -m "Release v1.0.5"
git push origin v1.0.5

# GitHub Actions が自動実行
# 約 5-10 分で本番環境にデプロイ完了
```

### パターン 4: 本番 全プラットフォーム（推奨）

```bash
# CLI スクリプトで実行（最も安全）
./scripts/deploy.sh -e production -p all -s

# または手動で各プラットフォームを実行
git checkout main
git pull origin main
git merge develop
git push origin main

# Web デプロイ確認
./scripts/deploy.sh -e production -p web

# iOS + Android 提出
./scripts/deploy.sh -e production -p ios android -s
```

---

## GitHub Actions ワークフロー

### 自動トリガー

| ブランチ | トリガー | 動作 | 時間 |
|--------|--------|------|------|
| `develop` | push | ステージング全プラットフォーム | 1-2h |
| `main` | push | 本番 Web + Mobile 提出 | 1-2h |
| タグ `v*` | push | 本番 Web + Mobile 提出 | 1-2h |

### ワークフロー一覧

```
.github/workflows/
├── test.yml                 # テスト実行（自動）
│   ├─ Unit Tests
│   ├─ E2E Tests
│   └─ Security Scan
│
├── build-web.yml            # Web ビルド・デプロイ
│   ├─ Setup & Build
│   ├─ Vercel Deploy (develop, main)
│   └─ Cloudflare Deploy (main only)
│
├── build-ios.yml            # iOS ビルド・提出
│   ├─ Build
│   ├─ TestFlight Submit
│   └─ Slack Notification
│
└── build-android.yml        # Android ビルド・提出
    ├─ Build
    ├─ Google Play Submit
    └─ Slack Notification
```

### ワークフロー実行を監視

```bash
# GitHub CLI で監視
gh run list --repo your-org/eigomaster

# 詳細を確認
gh run view {run-id}

# ログを表示
gh run view {run-id} --log

# または GitHub UI
# https://github.com/your-org/eigomaster/actions
```

---

## ローカルビルド

### Web 版

```bash
# 開発版
npm run web

# 本番ビルド
npm run web -- --mode=production

# 出力先: dist/
```

### iOS 版（ローカル）

```bash
# EAS ビルド（クラウド）
eas build --platform ios --profile production --wait

# または iOS シミュレータで開発版実行
npm run ios
```

### Android 版（ローカル）

```bash
# EAS ビルド（クラウド）
eas build --platform android --profile production --wait

# または Android エミュレータで開発版実行
npm run android
```

---

## ロールバック

### Web 版

```bash
# 前のバージョンに戻す
git revert HEAD
git push origin main

# または Cloudflare ダッシュボードから直接ロールバック
# https://dash.cloudflare.com > Pages > eigomaster
```

### iOS / Android 版

```bash
# 1 コマンドでロールバック
./scripts/rollback.sh -p ios    # iOS のみ
./scripts/rollback.sh -p android  # Android のみ
./scripts/rollback.sh -p all     # 両方

# 対話的に確認される
# "本当に続行しますか? (yes/no):"
```

---

## 環境変数の管理

### ローカル開発

```bash
cp .env.development .env.local
# .env.local を編集（ローカル API キーなど）
```

### ステージング環境

```bash
cp .env.staging .env.local
# CI/CD でも自動的にロード
```

### 本番環境

```bash
cp .env.production .env.local
# 秘密情報は GitHub Secrets から自動注入
```

### 秘密情報の追加

```bash
# 1. GitHub Secrets に追加
gh secret set MY_SECRET --body "value" --repo your-org/eigomaster

# 2. ワークフローで使用
env:
  MY_VAR: ${{ secrets.MY_SECRET }}
```

---

## ビルド設定の詳細

### app.json（アプリメタデータ）

```json
{
  "expo": {
    "name": "EigoMaster",
    "slug": "eigomaster",
    "version": "1.0.5",           // セマンティックバージョニング
    "runtimeVersion": "1.0.5",
    "owner": "eigomaster",
    "ios": {
      "bundleIdentifier": "com.eigomaster.app",
      "buildNumber": "5"           // ビルド番号（整数）
    },
    "android": {
      "package": "com.eigomaster.app",
      "versionCode": 5            // ビルド番号（整数）
    }
  }
}
```

### eas.json（EAS ビルド設定）

```json
{
  "build": {
    "development": {
      "env": {
        "EXPO_PUBLIC_ENV": "development"
      }
    },
    "preview": {
      "env": {
        "EXPO_PUBLIC_ENV": "staging"
      }
    },
    "production": {
      "env": {
        "EXPO_PUBLIC_ENV": "production"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "ascAppId": "6739265486",
        "bundleIdentifier": "com.eigomaster.app"
      },
      "android": {
        "androidPackage": "com.eigomaster.app",
        "track": "internal"
      }
    }
  }
}
```

---

## トラブルシューティング

### ビルド失敗: "Invalid credentials"

```bash
# Apple ID / パスワードを再設定
gh secret set APPLE_ID --body "your-apple-id@example.com"
gh secret set APPLE_PASSWORD --body "xxxx-xxxx-xxxx-xxxx"

# または EAS で再認証
eas logout
eas login
```

### ビルド失敗: "Network timeout"

```bash
# キャッシュをクリア
eas build --platform ios --profile production --clear-cache

# または手動で再試行
gh run retry {run-id}
```

### デプロイ失敗: "Vercel token invalid"

```bash
# Vercel トークンを再生成
# https://vercel.com/account/tokens

# GitHub Secrets を更新
gh secret set VERCEL_TOKEN --body "new-token"
```

### GitHub Actions が実行されない

```bash
# ワークフローファイルの構文をチェック
# https://github.com/your-org/eigomaster/actions

# または自動実行のトリガーをチェック
# push branches が正しいか確認
# develop / main への push で自動実行
```

---

## よくある質問（FAQ）

### Q: デプロイにどのくらい時間がかかる？

```
Web 版: 5-10 分
iOS 版: 30-45 分
Android 版: 45-60 分
全プラットフォーム: 1-2 時間
```

### Q: ビルドをスキップできる？

可能。コミットメッセージに `[skip ci]` を含める：

```bash
git commit -m "docs: update README [skip ci]"
git push origin main
```

### Q: 夜間にデプロイしたい？

GitHub Actions の **Schedule** トリガーを追加：

```yaml
on:
  schedule:
    - cron: '0 22 * * FRI'  # 毎週金曜日 22:00 JST
```

### Q: ロールバックはどのくらい時間がかかる？

```
Web 版: 5-10 分
iOS/Android 版: 30-45 分（TestFlight/Google Play 提出後）
```

### Q: CI/CD なしで手動ビルド・デプロイできる？

可能。`./scripts/deploy.sh` を実行：

```bash
./scripts/deploy.sh -e production -p web

# またはドライランで検証
./scripts/deploy.sh -e production -p all -d
```

---

## 緊急時の対応

### サーバーがダウン

```bash
# 本番 DB バックアップの確認
supabase db backup list

# または前バージョンにロールバック
./scripts/rollback.sh -p all
```

### セキュリティ脆弱性発見

```bash
# 即座に Secrets を無効化（複数プラットフォーム持つ場合）
gh secret delete EXPOSED_SECRET

# パッチを適用してデプロイ
git commit -m "security: patch XSS vulnerability"
git push origin main
```

### データベース破損

```bash
# Supabase バックアップから復旧
supabase db restore

# または本番環境を完全リセット（重大な場合のみ）
# サポートに連絡
```

---

## 次のステップ

1. **本番デプロイ実施**
   - チェックリスト確認: [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)
   - デプロイガイド: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

2. **監視・アラート設定**
   - Sentry エラーログ
   - Google Analytics
   - Slack 通知

3. **ユーザーサポート準備**
   - バグレポートチャネル
   - FAQ ページ
   - 定期更新スケジュール

---

## 参考リンク

- 環境変数設定: [GITHUB_SECRETS_SETUP.md](./GITHUB_SECRETS_SETUP.md)
- アーキテクチャ詳細: [CI_CD_ARCHITECTURE.md](./CI_CD_ARCHITECTURE.md)
- 完全デプロイガイド: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- 技術スタック: [app.json](./app.json), [eas.json](./eas.json)

---

**最終更新**: 2026-03-19
