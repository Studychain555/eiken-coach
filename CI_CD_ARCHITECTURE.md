# EigoMaster CI/CD アーキテクチャ

自動ビルド・デプロイパイプラインの技術詳細と設計思想です。

---

## システムアーキテクチャ

```
┌─────────────────────────────────────────────────────────────────┐
│                       GitHub Repository                         │
├─────────────────────────────────────────────────────────────────┤
│  develop ────┐                                                   │
│              ├─> Staging (自動) ──> TestFlight / Google Play    │
│  main ───────┤                                                   │
│              └─> Production (自動) -> App Store / Google Play    │
└─────────────────────────────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────────────────────────────┐
│                    GitHub Actions Workflows                     │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  test.yml   │  │ build-web.yml│  │ build-ios.yml│  ...      │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│   - Lint             - Build Web        - Build iOS            │
│   - Unit Tests       - Build Docs       - Submit to TF          │
│   - Security Scan    - Vercel Deploy                            │
└─────────────────────────────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────────────────────────────┐
│                    Build Infrastructure                         │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐    ┌──────────────────┐    ┌──────────┐ │
│  │   EAS Build      │    │  Vercel Build    │    │ Cloudflare
│  │ - iOS Simulator  │    │ - Web Static     │    │ - CDN    │
│  │ - iOS Device     │    │ - Analytics      │    │ - DDoS   │
│  │ - Android APK    │    │ - Auto Scaling   │    │ Protection
│  │ - Android AAB    │    └──────────────────┘    └──────────┘
│  └──────────────────┘
└─────────────────────────────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────────────────────────────┐
│                  Distribution Channels                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌────────────┐  ┌─────────────────┐  ┌──────────────────────┐ │
│  │ TestFlight │  │  Google Play    │  │  Web (eigomaster.app)
│  │ - QA Team  │  │  - Internal     │  │  - Production        │
│  │ - Beta     │  │  - Alpha        │  │  - Staging           │
│  │ - Dev      │  │  - Beta         │  │  - Development       │
│  └────────────┘  └─────────────────┘  └──────────────────────┘
└─────────────────────────────────────────────────────────────────┘
```

---

## ワークフロー詳細

### 1. テストワークフロー (`test.yml`)

```
トリガー: push (main, develop) / PR (main, develop)
│
├─ Unit Tests
│  ├─ Setup Node.js
│  ├─ npm ci
│  ├─ npm run lint
│  └─ npm run test (coverage付き)
│
├─ E2E Tests
│  ├─ Setup macOS
│  ├─ Setup Node.js & Expo
│  ├─ Verify build config
│  └─ eas --version
│
└─ Security Scan
   ├─ npm audit
   ├─ Secret scanning (Trufflehog)
   └─ SAST分析 (Code scanning)
```

**実行時間**: 約 10-15 分

**失敗時の対応**:
- PR コメントにエラー詳細を表示
- マージをブロック（設定時）

---

### 2. Web ビルド・デプロイワークフロー (`build-web.yml`)

```
トリガー: push (main, develop) / workflow_dispatch
│
├─ Setup
│  ├─ Checkout
│  ├─ Setup Node.js
│  └─ npm ci
│
├─ Environment Setup
│  ├─ main → .env.production
│  ├─ develop → .env.staging
│  └─ other → .env.development
│
├─ Build Web
│  └─ npm run web -- --mode=production
│
├─ Upload Artifacts
│  └─ Upload dist/ (5日間保持)
│
└─ Deploy
   ├─ Deploy to Vercel (develop, main)
   └─ Deploy to Cloudflare Pages (main only)
```

**実行時間**: 約 5-10 分

**デプロイ先**:

| ブランチ | Vercel | Cloudflare | 説明 |
|--------|--------|-----------|------|
| develop | preview | - | プレビュー版 |
| main | production | production | 本番環境 |
| その他 | preview | - | ブランチプレビュー |

---

### 3. iOS ビルド・デプロイワークフロー (`build-ios.yml`)

```
トリガー: push (main, develop) / workflow_dispatch
│
├─ Setup
│  ├─ Checkout
│  ├─ Setup Node.js
│  ├─ Setup Expo/EAS
│  └─ npm ci
│
├─ Environment Determination
│  ├─ main → profile: production
│  ├─ develop → profile: preview
│  └─ other → profile: development
│
├─ Authentication
│  └─ eas login --non-interactive
│
├─ Build
│  └─ eas build --platform ios --profile {profile} --wait
│
├─ Get Build ID
│  └─ Extract from eas build list
│
├─ Submit to TestFlight
│  ├─ main, develop のみ
│  └─ eas submit --platform ios --build-id {id}
│
└─ Notification
   ├─ Success → Slack #deployments
   └─ Failure → Slack #deployments
```

**実行時間**: 約 30-45 分

**出力**:
- iOS アプリバイナリ（TestFlight アップロード可能な形式）
- ビルドID（後続のロールバック等で使用）

---

### 4. Android ビルド・デプロイワークフロー (`build-android.yml`)

```
トリガー: push (main, develop) / workflow_dispatch
│
├─ Setup
│  ├─ Checkout
│  ├─ Setup Node.js & Java 17
│  ├─ Setup Expo/EAS
│  └─ npm ci
│
├─ Environment Determination
│  ├─ main → profile: production
│  ├─ develop → profile: preview
│  └─ other → profile: development
│
├─ Authentication
│  └─ eas login --non-interactive
│
├─ Build
│  ├─ eas build --platform android --profile {profile}
│  └─ --wait (完了まで待機)
│
├─ Get Build ID
│  └─ Extract from eas build list JSON
│
├─ Deploy to Google Play
│  ├─ main, develop のみ
│  └─ eas submit (Internal Testing track)
│
└─ Notification
   ├─ Success → Slack #deployments
   └─ Failure → Slack #deployments
```

**実行時間**: 約 45-60 分

**出力形式**:
- AAB (Android App Bundle) - Google Play 用
- APK - テスト用

---

## 環境別設定

### 開発環境 (development)

**目的**: ローカル開発・即時テスト

```env
EXPO_PUBLIC_SUPABASE_URL=http://localhost:54321
EXPO_PUBLIC_ENV=development
EXPO_PUBLIC_DEBUG_MODE=true
NODE_ENV=development
```

**ビルドプロファイル**: development
- Distribution: internal
- Client: development (Hot reload 対応)
- リソースクラス: m1

---

### ステージング環境 (staging)

**目的**: QA・ユーザーテスト・リリース前検証

```env
EXPO_PUBLIC_SUPABASE_URL=https://staging-supabase.eigomaster.app
EXPO_PUBLIC_ENV=staging
EXPO_PUBLIC_DEBUG_MODE=false
NODE_ENV=production
```

**ビルドプロファイル**: preview
- Distribution: internal
- TestFlight / Google Play 内部テスト版への提出
- リソースクラス: m1

---

### 本番環境 (production)

**目的**: エンドユーザー向けリリース

```env
EXPO_PUBLIC_SUPABASE_URL=https://ziqskxtpypyhbqfmbmhi.supabase.co
EXPO_PUBLIC_ENV=production
EXPO_PUBLIC_DEBUG_MODE=false
NODE_ENV=production
```

**ビルドプロファイル**: production
- Distribution: store
- TestFlight / Google Play 内部テスト版への提出
- リソースクラス: m1 (iOS), medium (Android)

---

## 秘密情報管理

### GitHub Secrets の構成

```
GitHub Actions
│
├─ EAS_TOKEN (EAS Build 認証)
│  └─ ~/.eas から取得
│
├─ Apple認証情報
│  ├─ APPLE_ID (開発者ID)
│  ├─ APPLE_PASSWORD (アプリパスワード)
│  ├─ APPLE_TEAM_ID (Team ID)
│  └─ ASC_APP_ID (App Store Connect ID)
│
├─ Google認証情報
│  └─ GOOGLE_PLAY_API_KEY (Service Account JSON, Base64)
│
├─ Vercel認証情報
│  ├─ VERCEL_TOKEN (API Token)
│  ├─ VERCEL_ORG_ID (Organization ID)
│  └─ VERCEL_PROJECT_ID (Project ID)
│
├─ Cloudflare認証情報
│  ├─ CLOUDFLARE_API_TOKEN (API Token)
│  └─ CLOUDFLARE_ACCOUNT_ID (Account ID)
│
└─ Slack通知
   └─ SLACK_WEBHOOK_URL (Incoming Webhook)
```

### セキュリティベストプラクティス

1. **定期的なローテーション**
   - API トークン: 毎月更新
   - パスワード: 6ヶ月ごと更新
   - Service Account キー: 年 1 回更新

2. **最小権限の原則**
   - EAS_TOKEN: Build & Submit のみ
   - APPLE_PASSWORD: アプリケーション固有パスワード使用
   - GOOGLE_PLAY_API_KEY: プロジェクト限定

3. **監査ログ**
   - GitHub Actions ログ確認
   - Slack 通知による追跡
   - 定期的なアクセスレビュー

---

## ビルドアーティファクト管理

### 保持ポリシー

| アーティファクト | 保持期間 | 用途 |
|---|---|---|
| Web ビルド | 5 日 | デプロイ検証 |
| テストレポート | 30 日 | 監査・トレーサビリティ |
| ビルドログ | 90 日 | 問題調査 |
| リリースバイナリ | 無期限 | ロールバック対応 |

### ダウンロード・復旧

```bash
# 過去のアーティファクトをダウンロード
gh run download {run-id} -n {artifact-name}

# または
gh run download -n web-build -D ./artifacts

# 過去のビルドを確認
eas build list --platform ios --limit 10
```

---

## エラーハンドリング・リトライ

### 自動リトライ

ネットワークエラーなど一時的なエラーの場合、以下の戦略が適用されます：

```yaml
# build-web.yml
- name: Build web
  run: npm run web -- --mode=production
  timeout-minutes: 30
  continue-on-error: false  # 失敗で停止
```

### 手動での対応フロー

```
ビルド失敗
  ↓
Slack 通知 (失敗詳細)
  ↓
エンジニアが原因調査
  ├─ コード問題 → fix コミット → 自動再実行
  ├─ 環境問題 → Secrets 更新 → 手動再実行
  └─ API 問題 → EAS/Vercel ダッシュボード確認 → サポート連絡
```

### Workflow Dispatch による手動トリガー

```bash
# GitHub CLI
gh workflow run build-ios.yml -f environment=production

# または GitHub UI
# Actions > Workflows > build-ios.yml > Run workflow
```

---

## パフォーマンス最適化

### キャッシング戦略

```yaml
# node_modules のキャッシング
- uses: actions/setup-node@v4
  with:
    cache: 'npm'  # 自動的に package-lock.json ベースのキャッシュ
```

**効果**: 初回 ~ 45秒、キャッシュヒット時 ~ 10秒

### 並列実行

```yaml
jobs:
  build-ios:
    runs-on: macos-latest
    ...
  build-android:
    runs-on: ubuntu-latest  # 別ランナーで並列実行
    ...
```

**利点**: iOS ビルドと Android ビルドが同時実行

### ランナーの選択

| プラットフォーム | ランナー | 理由 |
|---|---|---|
| iOS ビルド | macos-latest | Xcode が必要 |
| Android ビルド | ubuntu-latest | Android SDK が利用可能 |
| Web ビルド | ubuntu-latest | 軽量・高速 |
| テスト実行 | ubuntu-latest | 十分な性能 |

---

## 監視・アラート

### Slack 通知

```yaml
- name: Notify Slack (Success)
  if: success()
  uses: slackapi/slack-github-action@v1.24.0
  with:
    payload: |
      {
        "text": "iOS Build Successful",
        "blocks": [...]
      }
```

**通知内容**:
- ビルド結果（成功・失敗）
- プロファイル（開発・ステージング・本番）
- 実行時間
- コミット SHA

### ダッシュボード

```
Slack チャネル: #deployments
├─ 構成: iOS / Android / Web ビルド状況
├─ アラート: 失敗時は @channel 通知
└─ ログ: すべてのデプロイイベントを記録
```

### メトリクス追跡

```
エラー率 < 5% を目標
ビルド時間:
- Web: < 10 分
- iOS: 30-45 分
- Android: 45-60 分
デプロイ成功率: > 99%
```

---

## トラブルシューティング・デバッグ

### ログの確認

```bash
# GitHub Actions ログを表示
gh run view {run-id}
gh run view {run-id} --log

# または
gh run view {run-id} --log-failed
```

### ローカルでのワークフローテスト

```bash
# act をインストール
brew install act

# ローカルでワークフローを実行
act -l                                # 利用可能なジョブを一覧表示
act --job build-web                   # 特定のジョブを実行
act -s GITHUB_TOKEN=$(gh auth token)  # Secrets を使用して実行
```

### 詳細ログの有効化

```bash
# GitHub Actions でランナーログを有効化
# Settings > Actions > General > "Debug logging" を有効化

# または環境変数で有効化
ACTIONS_RUNNER_DEBUG: true
ACTIONS_STEP_DEBUG: true
```

---

## ベストプラクティス

1. **ブランチ戦略**
   - `main`: 本番環境、タグベースのリリース
   - `develop`: ステージング環境、常に最新
   - フィーチャーブランチ: `feature/*`, `fix/*`

2. **コミットメッセージ**
   - 例: `feat: audio component for shadowing`
   - Conventional Commits を採用

3. **PR プロセス**
   - すべての変更は PR を通して
   - CI パス必須
   - レビュー承認後にマージ

4. **リリース手順**
   - Version タグを作成（v1.0.5 など）
   - GitHub Releases でリリースノートを作成
   - 自動デプロイが開始

5. **ロールバック計画**
   - 前バージョンのビルドを常に保持
   - ロールバックスクリプトでワンコマンド実行
   - ロールバック時は新しいコミット・タグで記録

---

## まとめ

| 段階 | 自動化 | 承認 | 時間 |
|-----|------|------|------|
| テスト | ✓ | なし | 10分 |
| ステージング | ✓ | なし（自動） | 30分 |
| 本番 Web | ✓ | なし（自動） | 5分 |
| 本番 Mobile | ✓ | 手動確認 | 1時間 |

詳細は [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) を参照してください。
