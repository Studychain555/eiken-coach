# EigoMaster ビルドパイプライン完全ガイド

EigoMaster の本番環境向けビルド・デプロイパイプラインが完成しました。このドキュメントは実装内容の概要です。

---

## 概要

EigoMaster のビルドパイプラインは GitHub Actions、EAS (Expo Application Services)、Vercel、Cloudflare を統合し、Web / iOS / Android をシームレスに本番環境へデプロイします。

```
GitHub (Push)
    ↓
GitHub Actions (自動テスト・ビルド)
    ├─ test.yml (ユニット・E2E・セキュリティ)
    ├─ build-web.yml (Web版ビルド・デプロイ)
    ├─ build-ios.yml (iOS版ビルド・提出)
    └─ build-android.yml (Android版ビルド・提出)
    ↓
Deployment (自動デプロイ)
    ├─ Vercel (Web - ステージング)
    ├─ Cloudflare Pages (Web - 本番)
    ├─ TestFlight (iOS)
    └─ Google Play (Android)
    ↓
Monitoring (監視・アラート)
    ├─ Sentry (エラーログ)
    ├─ Google Analytics (アナリティクス)
    └─ Slack (デプロイ通知)
```

---

## ファイル構成

### GitHub Actions ワークフロー

```
.github/workflows/
├── test.yml                 # テスト実行パイプライン
│   ├─ Unit Tests (npm test)
│   ├─ E2E Tests (iOS/Android)
│   └─ Security Scan (npm audit, Trufflehog)
│
├── build-web.yml            # Web版ビルド・デプロイ
│   ├─ npm ci & npm run web
│   ├─ Vercel デプロイ (develop, main)
│   └─ Cloudflare デプロイ (main)
│
├── build-ios.yml            # iOS版ビルド・TestFlight提出
│   ├─ eas build --platform ios
│   ├─ eas submit (TestFlight)
│   └─ Slack 通知
│
└── build-android.yml        # Android版ビルド・Google Play提出
    ├─ eas build --platform android
    ├─ eas submit (Google Play)
    └─ Slack 通知
```

### 設定ファイル

```
eigomaster/
├── .env.development         # 開発環境変数
├── .env.staging             # ステージング環境変数
├── .env.production          # 本番環境変数
├── app.json                 # アプリメタデータ（更新済み）
├── eas.json                 # EAS ビルド設定（更新済み）
└── metro.config.production.js
```

### デプロイスクリプト

```
scripts/
├── deploy.sh               # 本番デプロイ用スクリプト
│   ├─ 使用方法: ./scripts/deploy.sh -e production -p all -s
│   ├─ ドライラン: ./scripts/deploy.sh -e staging -p all -d
│   └─ 環境別対応: development, staging, production
│
└── rollback.sh             # ロールバックスクリプト
    ├─ 使用方法: ./scripts/rollback.sh -p ios
    └─ プラットフォーム: ios, android, all
```

### ドキュメント

```
docs/
├── BUILD_PIPELINE_README.md         # このファイル
├── BUILD_PIPELINE_QUICK_START.md    # 最小限クイックスタート
├── DEPLOYMENT_GUIDE.md              # 詳細デプロイガイド
├── CI_CD_ARCHITECTURE.md            # アーキテクチャ詳細
├── DEPLOYMENT_CHECKLIST.md          # 本番デプロイ前チェックリスト
└── GITHUB_SECRETS_SETUP.md          # GitHub Secrets 設定ガイド
```

---

## クイックスタート（5分）

### 1. GitHub Secrets セットアップ

```bash
# 秘密情報をすべて GitHub Secrets に設定
# Settings > Secrets and variables > Actions から以下を追加:

EAS_TOKEN                   # eas credentials --show
APPLE_ID                    # Apple Developer ID
APPLE_PASSWORD              # App-specific password
APPLE_TEAM_ID               # Apple Team ID
ASC_APP_ID                  # App Store Connect ID
GOOGLE_PLAY_API_KEY         # Google Service Account (Base64)
VERCEL_TOKEN                # Vercel API token
VERCEL_ORG_ID               # Vercel Organization ID
VERCEL_PROJECT_ID           # Vercel Project ID
CLOUDFLARE_API_TOKEN        # Cloudflare Pages token
CLOUDFLARE_ACCOUNT_ID       # Cloudflare Account ID
SLACK_WEBHOOK_URL           # Slack Incoming Webhook

# 詳細: ./GITHUB_SECRETS_SETUP.md を参照
```

### 2. ローカルセットアップ

```bash
# npm スクリプトで確認
npm run lint                # コード品質チェック
npm run test                # テスト実行
npm run audit               # セキュリティ監査

# EAS ログイン確認
eas credentials --show
```

### 3. ステージングへデプロイ

```bash
# develop ブランチにプッシュするだけで自動デプロイ
git checkout develop
git add .
git commit -m "feat: add new feature"
git push origin develop

# GitHub Actions が自動実行
# 約 10-30 分でテスト・ビルド・デプロイ完了
# Slack チャネル #deployments で通知受信
```

### 4. 本番へデプロイ

```bash
# コマンド 1: デプロイスクリプト使用（推奨）
./scripts/deploy.sh -e production -p all -s

# コマンド 2: Git タグで自動デプロイ
git tag -a v1.0.5 -m "Release v1.0.5"
git push origin v1.0.5

# コマンド 3: main ブランチにマージ
git checkout main
git pull origin main
git merge develop
git push origin main

# いずれかの方法で GitHub Actions が実行開始
# 約 1-2 時間で全プラットフォーム本番デプロイ完了
```

---

## 環境別ビルド設定

### 開発環境（development）

**用途**: ローカル開発・即座テスト

```env
EXPO_PUBLIC_SUPABASE_URL=http://localhost:54321
EXPO_PUBLIC_ENV=development
EXPO_PUBLIC_DEBUG_MODE=true
NODE_ENV=development
```

**ビルドプロファイル**: development
- Distribution: internal（内部配布）
- Development Client（Hot Reload 対応）

**実行**: `npm run ios`, `npm run android`

### ステージング環境（staging）

**用途**: QA・ユーザーテスト・リリース前検証

```env
EXPO_PUBLIC_SUPABASE_URL=https://staging-supabase.eigomaster.app
EXPO_PUBLIC_ENV=staging
EXPO_PUBLIC_DEBUG_MODE=false
NODE_ENV=production
```

**ビルドプロファイル**: preview
- Distribution: internal
- TestFlight / Google Play 内部テスト版に自動提出
- リソースクラス: m1 (iOS), medium (Android)

**デプロイ**: `develop` ブランチへプッシュで自動

### 本番環境（production）

**用途**: エンドユーザー向けリリース

```env
EXPO_PUBLIC_SUPABASE_URL=https://ziqskxtpypyhbqfmbmhi.supabase.co
EXPO_PUBLIC_ENV=production
EXPO_PUBLIC_DEBUG_MODE=false
NODE_ENV=production
```

**ビルドプロファイル**: production
- Distribution: store（App Store / Google Play）
- リソースクラス: m1 (iOS), medium (Android)

**デプロイ**: `main` ブランチへプッシュで自動、または `./scripts/deploy.sh`

---

## デプロイパイプラインの実行フロー

### Web 版（test.yml + build-web.yml）

```
トリガー: push (main, develop)
    ↓
Setup: Node.js + npm ci
    ↓
Test: lint, unit test, security scan
    ↓
Build: npm run web -- --mode=production
    ↓
Deploy Vercel: develop → preview, main → production
Deploy Cloudflare: main → production
    ↓
実行時間: 10-15 分
```

### iOS 版（build-ios.yml）

```
トリガー: push (main, develop)
    ↓
Setup: Node.js + Expo + EAS
    ↓
Authentication: eas login
    ↓
Build: eas build --platform ios --profile {profile}
    ↓
Submit TestFlight: eas submit --build-id {id}
    ↓
Notify Slack: #deployments チャネルに通知
    ↓
実行時間: 30-45 分
```

### Android 版（build-android.yml）

```
トリガー: push (main, develop)
    ↓
Setup: Node.js + Java 17 + Expo + EAS
    ↓
Authentication: eas login
    ↓
Build: eas build --platform android --profile {profile}
    ↓
Submit Google Play: eas submit (internal testing)
    ↓
Notify Slack: #deployments チャネルに通知
    ↓
実行時間: 45-60 分
```

---

## npm スクリプトコマンド

```bash
# テスト関連
npm test                  # Jest ユニットテスト
npm run lint              # ESLint コード品質チェック
npm audit                 # セキュリティ監査
npm audit fix             # 脆弱性修正

# ローカル開発
npm start                 # Expo Metro サーバー起動
npm run ios               # iOS シミュレータ起動
npm run android           # Android エミュレータ起動
npm run web               # Web 開発サーバー起動

# ビルド・デプロイ
npm run build             # EAS ビルド (iOS + Android)
npm run build:web         # Web ビルド
npm run build:ios         # iOS ビルドのみ
npm run build:android     # Android ビルドのみ
npm run submit            # テストフライト・Google Play 提出
npm run submit:ios        # iOS 提出のみ
npm run submit:android    # Android 提出のみ

# スクリプト実行
npm run deploy            # ./scripts/deploy.sh を実行
npm run rollback          # ./scripts/rollback.sh を実行

# CI/CD 用
npm run ci:test           # CI テスト実行
npm run ci:build          # CI ビルド実行
```

---

## ドキュメント体系

| ドキュメント | 対象 | 概要 |
|-----------|------|------|
| **BUILD_PIPELINE_QUICK_START.md** | 急いでいる | 最小限のセットアップ・デプロイ手順 |
| **DEPLOYMENT_GUIDE.md** | デプロイ実施者 | 詳細なデプロイプロセス・トラブルシューティング |
| **CI_CD_ARCHITECTURE.md** | 技術者・保守担当 | ワークフロー設計・性能最適化・ベストプラクティス |
| **DEPLOYMENT_CHECKLIST.md** | デプロイ前確認 | チェックリスト形式の本番デプロイ前検証 |
| **GITHUB_SECRETS_SETUP.md** | セットアップ担当 | GitHub Secrets の設定方法・トレンドライン |

---

## よくある作業パターン

### パターン 1: バグ修正リリース（v1.0.1）

```bash
# ローカルで修正
git checkout -b fix/critical-bug

# 修正・テスト完了
npm run test
npm run lint

# Commit & PR
git add .
git commit -m "fix: critical bug in audio playback"
git push origin fix/critical-bug
# GitHub で PR を create → develop へマージ

# ステージング自動テスト
# develop へマージ後 GitHub Actions 自動実行

# 本番リリース
git tag -a v1.0.1 -m "Hotfix: audio playback issue"
git push origin v1.0.1
# 自動デプロイ開始

# App Store / Google Play で審査確認
```

### パターン 2: 新機能リリース（v1.1.0）

```bash
# 複数ブランチで並行開発
git checkout -b feature/shadowing-ai
git checkout -b feature/word-frequency

# 開発完了
git add .
git commit -m "feat: add AI-powered shadowing feedback"
git push origin feature/shadowing-ai

# PR & Code Review
# develop へマージ後、CI テスト実行

# ステージングで QA テスト
# 1-2 週間テスト期間

# 本番リリース
git tag -a v1.1.0 -m "New: AI Shadowing Feedback, Word Frequency"
git push origin v1.1.0

# リリースノート作成
# GitHub Releases で詳細記載

# デプロイ実行
./scripts/deploy.sh -e production -p all -s
```

### パターン 3: セキュリティパッチ（v1.0.2）

```bash
# 緊急ブランチ
git checkout -b security/xss-vulnerability

# 修正
npm audit fix

# 即座テスト
npm run test:security

# Commit
git commit -m "security: patch XSS vulnerability in text input"
git push origin security/xss-vulnerability

# PR → develop へマージ

# 即座本番デプロイ
git tag -a v1.0.2 -m "Security Patch: XSS Vulnerability"
git push origin v1.0.2

# 監視強化
# Sentry で詳細監視開始
```

---

## トラブルシューティング

### GitHub Actions が実行されない

**原因**: ワークフロー構文エラーまたはトリガー条件未合致

```bash
# 確認方法
gh workflow list
gh run list --repo your-org/eigomaster

# ワークフロー ファイル構文チェック
# https://yamllint.com/

# トリガー確認
# .github/workflows/*.yml の "on:" セクションを確認
```

### ビルド失敗: "Invalid credentials"

```bash
# 原因: Apple ID または Google Play 認証情報が無効

# 対応
gh secret set APPLE_PASSWORD --body "new-app-password"
gh secret set GOOGLE_PLAY_API_KEY --body "$(cat service-account.json | base64 -w 0)"

# 再実行
gh run retry {run-id}
```

### デプロイ失敗: "Network timeout"

```bash
# 原因: 一時的なネットワーク問題

# 対応: キャッシュクリア＆再試行
eas build --platform ios --clear-cache
gh run retry {run-id}
```

### ロールバック失敗

```bash
# 原因: 古いビルド ID がない

# 確認
eas build list --platform ios --limit 10

# ビルド ID を指定して手動提出
eas submit --platform ios --build-id {build-id}
```

詳細は [CI_CD_ARCHITECTURE.md](./CI_CD_ARCHITECTURE.md) の **トラブルシューティング** セクションを参照。

---

## 監視・アラート

### Slack 通知の設定

ビルド成功・失敗時に Slack チャネル `#deployments` へ自動通知：

```
[SUCCESS] iOS Build Successful
Build ID: xxxxx
Environment: production
Time: 2026-03-19 18:45 JST

---

[FAILURE] Web Build Failed
Error: npm run web failed
Branch: main
Commit: abc123def456
```

### Sentry エラーログ監視

```
https://sentry.io/organizations/{org}/issues/?project=eigomaster

リアルタイム エラー・クラッシュ監視
- エラーレート監視（アラート: > 1%）
- クラッシュレート監視（アラート: > 0.1%）
- パフォーマンス監視
- リリース追跡
```

### Google Analytics 監視

```
https://analytics.google.com

デプロイ前後のユーザー行動追跡
- ユーザー数・セッション数
- エラーレート
- ページロード時間
- コンバージョン率
```

---

## セキュリティ考慮事項

### 秘密情報管理

- ✓ GitHub Secrets で管理（コミットしない）
- ✓ `.env.local` は `.gitignore` に含める
- ✓ API キーのローテーション（毎月）
- ✓ Slack webhook URL は安全に保管

### コード品質・脆弱性

- ✓ GitHub Actions で自動 `npm audit`
- ✓ Trufflehog で秘密情報スキャン
- ✓ OWASP Top 10 対応
- ✓ 定期的なセキュリティレビュー

### デプロイ安全対策

- ✓ 本番デプロイは業務時間内
- ✓ チェックリスト検証必須
- ✓ ロールバック計画を常に用意
- ✓ デプロイ後 24 時間監視

---

## パフォーマンス・コスト最適化

### GitHub Actions

- キャッシング: npm モジュール自動キャッシュ（10-20秒削減）
- 並列実行: iOS + Android 同時ビルド（実行時間短縮）
- ランナー選択: 最適なマシンタイプ選択（コスト最適化）

### EAS Build

- リソースクラス: m1 (iOS), medium (Android)
- キャッシング: Gradle・Cocoapods キャッシュ活用
- 並列ビルド: 複数プロジェクト対応

### Web デプロイ

- CDN キャッシング: Vercel/Cloudflare での静的コンテンツキャッシュ
- イメージ最適化: 自動リサイズ・WebP 変換
- バンドル最適化: Code splitting・Tree shaking

---

## 今後の拡張

### Phase 2: 高度な自動化

```
- Canary デプロイ（段階的ロールアウト）
- A/B テスト自動化
- パフォーマンスレグレッション検出
- 自動ロールバック（エラーレート > 5% で）
```

### Phase 3: 監視・分析強化

```
- Cloud Build Dashboard
- カスタムメトリクス収集
- コスト最適化分析
- デプロイレポート自動生成
```

### Phase 4: コラボレーション

```
- リリース計画の可視化
- Jira・GitHub Issues 連携
- Changelog 自動生成
- リリースノート自動作成
```

---

## サポート・参照

| リソース | URL |
|---------|-----|
| GitHub Actions ドキュメント | https://docs.github.com/en/actions |
| EAS Build & Submit | https://docs.expo.dev/build/introduction/ |
| Vercel デプロイ | https://vercel.com/docs |
| Cloudflare Pages | https://developers.cloudflare.com/pages/ |
| Slack Webhooks | https://api.slack.com/messaging/webhooks |

---

## チェックリスト

ビルドパイプラインのセットアップが完了したことを確認：

- [x] GitHub Actions ワークフロー 4 個を追加
- [x] 環境別 `.env` ファイルを作成
- [x] `eas.json` を本番対応に更新
- [x] デプロイスクリプト 2 個を作成
- [x] ドキュメント 5 個を作成
- [x] npm スクリプトを更新
- [ ] GitHub Secrets を設定
- [ ] ステージング環境でテスト実行
- [ ] 本番デプロイを実施

---

## 次のステップ

1. **セットアップ**: [GITHUB_SECRETS_SETUP.md](./GITHUB_SECRETS_SETUP.md) に従い GitHub Secrets を設定
2. **テスト**: `develop` ブランチへプッシュしてステージング環境でテスト
3. **デプロイ**: チェックリスト確認後、`main` ブランチへマージして本番デプロイ
4. **監視**: Slack・Sentry・Google Analytics で本番環境を監視

---

**最終更新**: 2026-03-19
**作成**: Claude AI (claude-opus-4-6)
**対象**: EigoMaster v1.0+
