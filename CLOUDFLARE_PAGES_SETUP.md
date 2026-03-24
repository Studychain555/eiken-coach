# EigoMaster Cloudflare Pages デプロイ設定ガイド

## 概要

EigoMaster を Cloudflare Pages で自動デプロイする。GitHub Actions ワークフローから `main` ブランチへのプッシュ時に自動的に本番環境にデプロイされます。

**デプロイ先**: `https://eigomaster.pages.dev`

---

## Phase 3: GitHub Secrets 設定

### 手順

GitHub リポジトリの Settings → Secrets and variables → Actions で以下の Secrets を登録してください。

#### ステップバイステップ

1. **リポジトリページ**: https://github.com/Studychain555/eiken-coach
2. **Settings → Secrets and variables → Actions** を開く
3. **New repository secret** をクリック
4. 以下の Secrets を登録

### 必須 Secrets リスト

| Secret 名 | 説明 | 入手方法 | 例 |
|---|---|---|---|
| `CLOUDFLARE_API_TOKEN` | Cloudflare API トークン | [Cloudflare Dashboard → Token](https://dash.cloudflare.com/profile/api-tokens) | `v1.0z9a8...` |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare アカウント ID | [Cloudflare Dashboard → Account ID](https://dash.cloudflare.com) | `1234567890abcdef` |
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase 接続 URL | Supabase Project Settings | `https://xxxxx.supabase.co` |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anonymous キー | Supabase Project Settings | `eyJhbGc...` |
| `EXPO_PUBLIC_CLAUDE_API_KEY` | Claude API キー | [Anthropic Console](https://console.anthropic.com) | `sk-ant-...` |
| `EXPO_PUBLIC_WHISPER_API_KEY` | OpenAI Whisper API キー | [OpenAI Platform](https://platform.openai.com/api-keys) | `sk-...` |
| `EXPO_PUBLIC_SENTRY_DSN` | Sentry エラーログ DSN | [Sentry Project Settings](https://sentry.io) | `https://xxx@xxx.ingest.sentry.io/xxx` |
| `EXPO_PUBLIC_GA_MEASUREMENT_ID` | Google Analytics 計測 ID | Google Analytics | `G-XXXXXXXXXX` |

### Cloudflare API トークン取得方法

#### 1. Cloudflare Dashboard にログイン
- https://dash.cloudflare.com にアクセス

#### 2. API トークン作成
- **My Profile** → **API Tokens** → **Create Token**
- **Cloudflare Pages - Edit** テンプレートを選択（推奨）
  - または Custom Token を作成
  - 権限: `Account.Pages`, `Account.Workers`, `Account.Worker Routes`
- **Deploy Specific Pages Project** で `eigomaster` プロジェクトを選択

#### 3. トークンをコピー
- 生成されたトークンを GitHub Secrets に `CLOUDFLARE_API_TOKEN` として保存

#### 4. Account ID を確認
- Cloudflare Dashboard の右下に表示されている Account ID をコピー
- GitHub Secrets に `CLOUDFLARE_ACCOUNT_ID` として保存

### 既存本番環境変数の確認

以下の Secrets は既存のプロジェクト設定から取得してください：

- **Supabase**: Project Settings → API → Project URL, Anon Key
- **Claude API**: https://console.anthropic.com → API Keys
- **Whisper API**: https://platform.openai.com → API keys
- **Sentry**: Project Settings → Client Keys (DSN)
- **Google Analytics**: Admin → Property Settings → Measurement ID

---

## Phase 4: デプロイテスト & 本番公開

### テストの進め方

#### 4.1 GitHub Actions ワークフロー確認

1. **リポジトリ** → **Actions** タブを開く
2. **Deploy to Cloudflare Pages** ワークフローが表示されているか確認
3. GitHub Secrets が不足している場合、ワークフローはスキップされます

#### 4.2 ローカルテスト（推奨）

ローカルで本番ビルドをテストしてから GitHub にプッシュしてください：

```bash
# .env.production が正しく設定されているか確認
cat .env.production

# 本番ビルド実行
npm run build:web

# dist/ ディレクトリが生成されているか確認
ls -lah dist/
du -sh dist/
```

#### 4.3 GitHub にプッシュしてデプロイ

```bash
# main ブランチで作業している場合
git add -A
git commit -m "feat: prepare for Cloudflare Pages deployment

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
git push origin main
```

#### 4.4 デプロイ監視

1. **GitHub Actions** でワークフロー実行を監視
   - ❌ **Failed**: エラーログを確認（通常は Secrets 不足か環境変数の問題）
   - ✅ **Success**: Cloudflare Pages にデプロイ完了

2. **Cloudflare Pages ダッシュボード** で確認
   - https://dash.cloudflare.com → **Pages** → **eigomaster**
   - デプロイ履歴と最新デプロイの URL を確認

#### 4.5 本番環境で動作確認

**URL**: https://eigomaster.pages.dev

確認項目：
- [ ] ページが読み込まれるか（ブラウザで開く）
- [ ] Supabase との接続確認（ブラウザ開発者ツール → Network で API 呼び出しを確認）
- [ ] 環境変数が正しく注入されているか（Console で `window.ENV` が表示されるか）
- [ ] 認証フロー動作確認（ログイン画面で Supabase 認証が機能するか）
- [ ] API 呼び出し動作確認（音声認識、Claude API などが動作するか）
- [ ] ページパフォーマンス確認（LCP, FCP, CLS が良好か）

#### 4.6 エラー対応

**ワークフロー失敗時の確認項目**：

1. **Build エラー**
   - `npm run build:web` がローカルで成功するか再確認
   - 環境変数が不足していないか確認（.env.production 参照）

2. **Deploy エラー**
   - `CLOUDFLARE_API_TOKEN` が有効か確認
   - `CLOUDFLARE_ACCOUNT_ID` が正しいか確認
   - Cloudflare Pages プロジェクト `eigomaster` が存在するか確認

3. **環境変数エラー**
   - GitHub Secrets が存在するか確認
   - Secrets の値が正しいか確認（コピペミスなど）

---

## 補足: カスタムドメイン設定（オプション）

デフォルトでは `eigomaster.pages.dev` で公開されます。カスタムドメイン（例: `eigomaster.com`）を使用する場合：

1. Cloudflare ダッシュボード → Pages → eigomaster → **Custom domain**
2. ドメインを入力して **Save**
3. DNS レコードを追加（Cloudflare の指示に従う）

---

## トラブルシューティング

### GitHub Actions ワークフローが実行されない

**原因**: GitHub Secrets が不足している

**解決方法**: Phase 3 で記載した全 Secrets を確認・登録

### Build エラー: `npm ERR!`

**原因**: npm 依存関係の問題

**解決方法**:
```bash
rm -rf node_modules package-lock.json
npm install
npm run build:web
```

### Deploy エラー: `Unauthorized` または `403 Forbidden`

**原因**: Cloudflare API トークンが無効または権限不足

**解決方法**:
1. Cloudflare Dashboard で新しいトークンを生成
2. GitHub Secrets を更新

### デプロイ後もサイトが古いバージョンを表示

**原因**: Cloudflare キャッシュが残っている

**解決方法**:
1. Cloudflare Dashboard → Pages → eigomaster → **Purge Cache**
2. ブラウザキャッシュをクリア（Ctrl+Shift+Delete または Cmd+Shift+Delete）

---

## 参考資料

- [Cloudflare Pages ドキュメント](https://developers.cloudflare.com/pages/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)
- [GitHub Actions - Cloudflare Wrangler](https://github.com/cloudflare/wrangler-action)
- [Expo Web デプロイ](https://docs.expo.dev/distribution/publishing-websites/)

---

## 完了チェックリスト

- [ ] Phase 3: GitHub Secrets 登録完了
- [ ] Phase 4.1: GitHub Actions ワークフロー確認
- [ ] Phase 4.2: ローカルビルドテスト成功
- [ ] Phase 4.3: GitHub にプッシュ
- [ ] Phase 4.4: GitHub Actions デプロイ成功
- [ ] Phase 4.5: `eigomaster.pages.dev` で本番動作確認
- [ ] Supabase 接続確認
- [ ] 認証フロー確認
- [ ] API 呼び出し確認
- [ ] パフォーマンス良好か確認
