# GitHub Secrets 設定ガイド

EigoMaster を CI/CD パイプラインで自動ビルド・デプロイするために必要な GitHub Secrets の設定方法です。

## セットアップ手順

1. GitHub リポジトリの **Settings** に移動
2. 左サイドバーで **Secrets and variables** > **Actions** をクリック
3. **New repository secret** ボタンをクリック
4. 以下の Secrets を順番に設定します

---

## 必須 Secrets

### 1. EAS Build & Submit

#### `EAS_TOKEN`
- **説明**: EAS (Expo Application Services) のアクセストークン
- **取得方法**:
  ```bash
  eas login
  # ログイン後、トークンを表示:
  eas credentials --show
  ```
- **用途**: iOS/Android のビルドと提出を自動化

#### `APPLE_ID`
- **説明**: Apple ID のメールアドレス
- **例**: `developer@example.com`
- **用途**: TestFlight へのアップロード

#### `APPLE_PASSWORD`
- **説明**: Apple ID のパスワード（またはアプリケーション固有パスワード）
- **推奨**: アプリケーション固有パスワードを使用
- **取得方法**:
  1. [appleid.apple.com](https://appleid.apple.com) にログイン
  2. **Security** > **App-specific passwords** を選択
  3. 新しいアプリケーション固有パスワードを生成

#### `APPLE_TEAM_ID`
- **説明**: Apple Developer Team ID
- **取得方法**:
  1. [developer.apple.com](https://developer.apple.com) にログイン
  2. **Account** > **Membership** を確認
- **例**: `XXXXXXXXXX` (10文字)

#### `ASC_APP_ID`
- **説明**: App Store Connect のアプリケーション ID
- **取得方法**:
  1. [appstoreconnect.apple.com](https://appstoreconnect.apple.com) にログイン
  2. アプリを選択し、**App Information** > **App ID** をコピー
- **例**: `1234567890`

#### `GOOGLE_PLAY_API_KEY`
- **説明**: Google Play Console の Service Account JSON (Base64 エンコード)
- **取得方法**:
  1. [Google Cloud Console](https://console.cloud.google.com) にログイン
  2. **Service Accounts** > 新しいサービスアカウントを作成
  3. JSON キーをダウンロード
  4. Base64 エンコード: `cat service-account.json | base64 -w 0`
- **用途**: Google Play への内部テスト版アップロード

---

### 2. Web ホスティング

#### `VERCEL_TOKEN`
- **説明**: Vercel API トークン
- **取得方法**:
  1. [vercel.com/account/tokens](https://vercel.com/account/tokens) にアクセス
  2. **Create** をクリック
  3. トークンをコピー

#### `VERCEL_ORG_ID`
- **説明**: Vercel 組織 ID
- **確認方法**: Vercel ダッシュボードの URL から取得
  - `https://vercel.com/dashboard?orgId=VERCEL_ORG_ID`

#### `VERCEL_PROJECT_ID`
- **説明**: Vercel プロジェクト ID
- **取得方法**:
  1. プロジェクトを Vercel にインポート
  2. Project Settings > **Project ID** をコピー

#### `CLOUDFLARE_API_TOKEN`
- **説明**: Cloudflare Pages API トークン
- **取得方法**:
  1. [dash.cloudflare.com](https://dash.cloudflare.com) にログイン
  2. **Account > API Tokens** をクリック
  3. **Create Token** > **Cloudflare Pages – Deploy** を選択
  4. スコープを設定し、トークンを作成

#### `CLOUDFLARE_ACCOUNT_ID`
- **説明**: Cloudflare Account ID
- **取得方法**:
  1. [dash.cloudflare.com](https://dash.cloudflare.com) にログイン
  2. 右側バー上部の **Account ID** をコピー

---

### 3. 通知 & モニタリング

#### `SLACK_WEBHOOK_URL`
- **説明**: Slack の Incoming Webhook URL
- **取得方法**:
  1. Slack ワークスペースで **Apps** を開く
  2. **Incoming Webhooks** を検索し、追加
  3. チャネルを選択（例: #deployments）
  4. Webhook URL をコピー
- **用途**: ビルド成功/失敗を Slack に通知

#### `SENTRY_AUTH_TOKEN` (オプション)
- **説明**: Sentry のアプリケーションキー
- **取得方法**:
  1. [sentry.io](https://sentry.io) にログイン
  2. **Account Settings** > **Auth Tokens** を確認
- **用途**: エラー監視とデプロイ追跡

---

## Secrets 設定スクリプト

以下のスクリプトを使用して、一括で Secrets を設定できます：

```bash
#!/bin/bash
# set-secrets.sh

REPO="your-github-org/eigomaster"

# EAS
gh secret set EAS_TOKEN --body "$(cat ~/.eas/credentials.json | jq -r '.token')" --repo $REPO

# Apple
gh secret set APPLE_ID --body "your-apple-id@example.com" --repo $REPO
gh secret set APPLE_PASSWORD --body "xxxx-xxxx-xxxx-xxxx" --repo $REPO
gh secret set APPLE_TEAM_ID --body "XXXXXXXXXX" --repo $REPO
gh secret set ASC_APP_ID --body "1234567890" --repo $REPO

# Google Play
gh secret set GOOGLE_PLAY_API_KEY --body "$(cat service-account.json | base64 -w 0)" --repo $REPO

# Vercel
gh secret set VERCEL_TOKEN --body "your-vercel-token" --repo $REPO
gh secret set VERCEL_ORG_ID --body "your-org-id" --repo $REPO
gh secret set VERCEL_PROJECT_ID --body "your-project-id" --repo $REPO

# Cloudflare
gh secret set CLOUDFLARE_API_TOKEN --body "your-cloudflare-token" --repo $REPO
gh secret set CLOUDFLARE_ACCOUNT_ID --body "your-account-id" --repo $REPO

# Slack
gh secret set SLACK_WEBHOOK_URL --body "https://hooks.slack.com/services/..." --repo $REPO

echo "✓ All secrets configured"
```

---

## 環境変数ファイルの検証

Secrets が正しく設定されたかどうかを確認するには：

```bash
# Secrets のリスト表示
gh secret list --repo your-github-org/eigomaster

# 個別の Secret を確認（値は表示されない）
gh secret view EAS_TOKEN --repo your-github-org/eigomaster
```

---

## セキュリティベストプラクティス

1. **秘密情報の保護**
   - Secrets をコミットしない
   - `.env.local` をGitIgnoreに含める

2. **トークンのローテーション**
   - 定期的に（毎月）トークンを更新
   - 漏洩時は即座に無効化

3. **アクセス制限**
   - Secrets は必要最小限のワークフローでのみ使用
   - リポジトリへのアクセスを制限

4. **監査ログ**
   - GitHub Actions の実行ログを確認
   - 不審なデプロイがないか定期的にチェック

---

## トラブルシューティング

### ビルド失敗時

1. **"Invalid credentials"**
   - Apple ID / パスワードを再確認
   - アプリケーション固有パスワードを使用しているか確認

2. **"Build not found"**
   - EAS_TOKEN が有効か確認
   - `eas credentials --show` で認証情報を確認

3. **"Webhook delivery failed"**
   - SLACK_WEBHOOK_URL が正しいか確認
   - Slack チャネルのアクセス権限を確認

### デバッグ方法

```bash
# ローカルでのテスト
export EAS_TOKEN="your-token"
eas build list --platform ios

# Secrets の確認
act -l  # GitHub Actions ローカルテスト
```

---

## 参考リンク

- [GitHub Actions - Using Secrets](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions)
- [EAS Build & Submit Documentation](https://docs.expo.dev/build/introduction/)
- [Vercel API Reference](https://vercel.com/docs/rest-api)
- [Cloudflare Pages API](https://developers.cloudflare.com/pages/platform/api/)
