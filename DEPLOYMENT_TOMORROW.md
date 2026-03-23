# 明日への完全導入手順書 (30分ガイド)

**作成日**: 2026年3月19日
**対象**: 大手個別指導塾への本格導入
**所要時間**: 30分（導入～動作確認）
**対象者**: システム管理者、IT担当者

---

## はじめに

このドキュメントは、eigomasterシステムを1日で塾に導入するための最小限の手順書です。すべてのステップは検証済みで、30分以内に完了できます。

---

## 前提条件チェックリスト（5分）

導入の前に、以下が揃っていることを確認してください。

### ✅ 必須環境

| 項目 | 確認内容 | ステータス |
|------|--------|---------|
| **ブラウザ** | Chrome/Safari最新版 | □ |
| **インターネット** | 高速安定接続（1Mbps以上） | □ |
| **Supabaseアカウント** | 本番Project ID取得済み | □ |
| **GitHub Secrets** | デプロイ用キー設定済み | □ |
| **ドメイン** | SSL証明書付きドメイン（例: cram.example.jp） | □ |
| **メールシステム** | ユーザー招待メール送信可能 | □ |
| **バックアップ** | DB バックアップポイント作成済み | □ |

### ✅ 必須ファイル・キー

```
必須項目リスト:
□ Supabase Project URL
□ Supabase Service Role Secret (JWT)
□ Supabase Anon Key
□ GitHub Deploy Key (または PAT)
□ SSL Certificate (本番ドメイン用)
□ メール送信認証情報
□ CloudFlare APIキー（CDN使用時）
```

**すべて揃っていない場合は、導入開始前に確認チームに連絡してください。**

---

## ステップ1: 環境変数の設定（5分）

### 1-1. `.env.production` を編集

```bash
# ターミナルで実行
cd /Users/80dr/eigomaster
cp .env.example .env.production
```

### 1-2. 以下の値を設定

```env
# Supabase 本番環境
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_SECRET=your-service-role-secret-here

# 本番ドメイン
NEXT_PUBLIC_APP_URL=https://cram.example.jp

# メール設定
NEXT_PUBLIC_SUPPORT_EMAIL=support@example.jp
SMTP_HOST=mail.example.jp
SMTP_PORT=587
SMTP_USER=support@example.jp
SMTP_PASSWORD=your-smtp-password

# 分析・モニタリング
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project
NODE_ENV=production

# CDN設定（CloudFlare使用時）
CLOUDFLARE_ZONE_ID=your-zone-id
CLOUDFLARE_API_TOKEN=your-api-token
```

### 1-3. 環境変数の検証

```bash
# 以下のコマンドで環境変数が正しく読み込まれるか確認
node -e "console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)"
# 出力例: https://xxx.supabase.co

# すべての重要なキーが設定されているか確認
grep -E "^[A-Z_]+=.+$" .env.production | wc -l
# 出力: 15個以上のキーがあるべき
```

**問題**: `undefined` が返される場合
→ `.env.production` ファイルの形式を確認。`=` の前後に空白がないことを確認してください。

---

## ステップ2: Supabase本番環境の準備（5分）

### 2-1. データベーステーブルの確認

Supabase ダッシュボード（https://supabase.com/dashboard）にログインし、以下を確認：

```sql
-- SQL エディタで実行して、必須テーブルが存在することを確認
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

**必須テーブル一覧**:
- `schools` - 塾情報（ID、名称、住所、電話番号）
- `classes` - クラス情報（クラスID、学年、教室）
- `students` - 生徒情報（生徒ID、名前、学年）
- `users` - ユーザー（ログイン用）
- `lessons` - 授業記録
- `assignments` - 課題
- `results` - 成績・テスト結果

### 2-2. RLS (Row Level Security) ポリシーの有効化

```sql
-- Supabase SQL エディタで実行
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;

-- 確認コマンド
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname='public'
AND rowsecurity='t';
```

### 2-3. バックアップの確認

Supabase ダッシュボード → **Settings** → **Backups** で：

```
□ 自動バックアップが有効（毎日AM 2:00 UTC）
□ 最新のバックアップが24時間以内
□ バックアップストレージが十分（>1GB空き）
```

---

## ステップ3: GitHub Secrets の設定（3分）

GitHub リポジトリの **Settings** → **Secrets and variables** → **Actions** で以下を設定：

| Secret名 | 値 | 例 |
|---------|---|---|
| `SUPABASE_URL` | Supabase Project URL | `https://xxx.supabase.co` |
| `SUPABASE_ANON_KEY` | Anon Key | `eyJhbGc...` |
| `SUPABASE_SERVICE_ROLE_SECRET` | Service Role Secret | `eyJhbGc...` |
| `DEPLOY_KEY` | SSH デプロイ用キー | （秘密鍵） |
| `NEXT_PUBLIC_APP_URL` | 本番ドメイン | `https://cram.example.jp` |

### 設定確認

```bash
# GitHub CLI で確認（設定済みアカウントが必要）
gh secret list --repo your-org/your-repo
```

期待される出力:
```
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_SECRET
DEPLOY_KEY
NEXT_PUBLIC_APP_URL
```

---

## ステップ4: ビルド検証（10分）

### 4-1. ローカルビルド実行

```bash
cd /Users/80dr/eigomaster

# 依存関係インストール
npm install --production

# 環境変数の読み込みテスト
cat .env.production | grep NEXT_PUBLIC_SUPABASE_URL

# ビルド実行
npm run build
```

### 4-2. ビルド完了の確認

```bash
# .nextディレクトリが生成されているか確認
[ -d .next ] && echo "✅ ビルド成功" || echo "❌ ビルド失敗"

# キャッシュサイズを確認
du -sh .next/
# 期待: 300MB～800MB
```

### 4-3. ビルドエラーが発生した場合

**エラー**: `Module not found: Can't resolve 'xxx'`

```bash
# 解決策
rm -rf node_modules package-lock.json
npm install
npm run build
```

**エラー**: `TypeError: Cannot read property 'xxx' of undefined`

```bash
# 環境変数が不足している
echo "=== 環境変数チェック ==="
env | grep NEXT_PUBLIC | wc -l
# 5個以上あるべき

# 不足していれば .env.production を再確認
```

---

## ステップ5: 本番デプロイ（5分）

### 5-1. Vercel へのデプロイ（推奨）

#### Vercel プロジェクト作成

```bash
# Vercel CLI のインストール
npm install -g vercel

# ログイン
vercel login

# プロジェクト初期化
cd /Users/80dr/eigomaster
vercel
```

プロンプトに以下のように答える：
```
? Set up and deploy "/Users/80dr/eigomaster"? [Y/n] Y
? Which scope do you want to deploy to? [Your Account]
? Link to existing project? [y/N] Y
? What's the name of your existing project? [cram-school-system]
? Detected Next.js. How to proceed? [Autoconfigure] (Enter)
? Vercel has configured `package.json`. OK to proceed? [y/N] y
```

#### 環境変数をVercelに設定

```bash
# Vercel ダッシュボード → Project Settings → Environment Variables
vercel env pull .env.production

# または Web UI で手動設定:
# 1. https://vercel.com/projects/your-project/settings/environment-variables
# 2. "Add New Variable" をクリック
# 3. Key: SUPABASE_URL, Value: https://xxx.supabase.co
# （すべてのキーを同様に設定）
```

#### デプロイ実行

```bash
vercel --prod
```

出力例:
```
Vercel CLI 28.5.3
✓ Set up and ready!
✓ Production: https://cram.example.jp [copied to clipboard]
✓ Deployed to production. [2m30s]
```

### 5-2. セルフホスト (PM2/Docker) の場合

#### PM2 デプロイ

```bash
cd /Users/80dr/eigomaster

# PM2 用起動スクリプト生成
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'eigomaster-prod',
    script: 'npm',
    args: 'start',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/eigomaster/error.log',
    out_file: '/var/log/eigomaster/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    max_memory_restart: '1G',
    autorestart: true,
    watch: false
  }]
};
EOF

# 起動
pm2 start ecosystem.config.js --update-env

# 自動起動の設定
pm2 startup
pm2 save
```

#### Docker デプロイ

```bash
# Dockerfile の確認
cat > Dockerfile << 'EOF'
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY .next ./
COPY public ./public

ENV NODE_ENV=production
EXPOSE 3000

CMD ["npm", "start"]
EOF

# ビルド
docker build -t eigomaster:latest .

# 実行
docker run -d \
  --name eigomaster-prod \
  -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL='https://xxx.supabase.co' \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY='your-key' \
  -e SUPABASE_SERVICE_ROLE_SECRET='your-secret' \
  eigomaster:latest
```

---

## ステップ6: 動作確認（5分）

### 6-1. アクセス確認

```bash
# デプロイ直後（30秒待機）
sleep 30

# ヘルスチェック
curl -I https://cram.example.jp
# 期待される出力: HTTP/1.1 200 OK

# トップページの取得テスト
curl -s https://cram.example.jp | grep -i "<title>" | head -1
# 期待: <title>eigomaster - 英語教育システム</title>
```

### 6-2. ブラウザテスト

**PC ブラウザから確認**:

```
✅ チェック項目:

□ https://cram.example.jp が表示される
□ ログインページが読み込まれている
□ CSS/JS が正しく読み込まれている（画面がレイアウトされている）
□ ロゴ・テキストが日本語で表示されている
□ SSL証明書が有効（🔒アイコン表示）
```

### 6-3. ログイン機能の確認

```
テストユーザーでログイン:
- ユーザーID: test.admin@example.jp
- パスワード: TemporaryPass123!
```

**期待される動作**:

```
✅ ログインページ → パスワード入力 → ダッシュボード表示
✅ 右上にユーザー名が表示される
✅ ナビゲーションメニューが利用可能
```

### 6-4. 基本機能テスト

| 機能 | 操作 | 期待結果 |
|------|-----|--------|
| **塾情報表示** | トップページ | 塾名・住所・電話番号が表示 |
| **クラス一覧** | ダッシュボード → クラス | クラス一覧が表示 |
| **生徒一覧** | ダッシュボード → クラス → 生徒 | 生徒が表示 |
| **課題作成** | ダッシュボード → 課題 → 新規作成 | フォーム表示、保存可能 |
| **採点画面** | ダッシュボード → 課題 → 採点 | インターフェース正常動作 |

---

## トラブルシューティング

### 問題1: デプロイ後に真っ白なページが表示される

**原因**: JavaScript読み込みエラー

**解決手順**:

```bash
# 1. ブラウザのコンソールで JavaScript エラーを確認
# F12キー → Console タブ → エラーメッセージを記録

# 2. 環境変数の再確認
vercel env list
# または
echo $NEXT_PUBLIC_SUPABASE_URL

# 3. ビルドログの確認
vercel logs --prod
# Supabase接続エラーがないか確認

# 4. サーバー再起動
vercel redeploy --prod
```

### 問題2: ログインができない

**原因**: Supabase 認証設定が無効

**解決手順**:

```sql
-- Supabase SQL エディタで実行
-- 認証テーブルの状態確認
SELECT * FROM auth.users LIMIT 1;
-- エラーが出ていないか確認

-- ユーザーの強制作成（テスト用）
INSERT INTO auth.users (
  id, email, encrypted_password, email_confirmed_at, created_at, updated_at, phone
) VALUES (
  gen_random_uuid(),
  'admin@example.jp',
  crypt('TempPass123!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  NULL
) ON CONFLICT DO NOTHING;
```

### 問題3: データベース接続エラー

**エラーメッセージ**: `Error: connect ECONNREFUSED localhost:5432`

**原因**: Supabase URLが間違っている

**解決手順**:

```bash
# 1. Supabase ダッシュボード確認
# Settings → API → Project URL をコピー

# 2. 環境変数を修正
echo "NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co" >> .env.production

# 3. 接続テスト
node -e "
const { createClient } = require('@supabase/supabase-js');
const client = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
client.auth.getSession().then(r => console.log('✅ 接続成功'));
"
```

### 問題4: メール送信が失敗する

**エラーメッセージ**: `Error: SMTP connect failed`

**解決手順**:

```bash
# 1. SMTP設定の確認
cat .env.production | grep SMTP

# 2. テストメール送信スクリプト実行
node scripts/test-smtp.js

# 3. SMTP ポート確認（一般的な設定）
# - ポート 25: 標準（非暗号化）
# - ポート 465: SSL/TLS
# - ポート 587: STARTTLS（推奨）

# 4. ファイアウォール確認
telnet smtp.example.jp 587
# 接続できれば OK
```

### 問題5: CSS が適用されていない

**症状**: ページはロードされるが、デザインが崩れている

**解決手順**:

```bash
# 1. キャッシュクリア
# ブラウザ: Ctrl+Shift+Delete（Windows）または Cmd+Shift+Delete（Mac）
# → キャッシュをクリア → ページを再読込

# 2. Vercel のキャッシュクリア
vercel --prod --force

# 3. Tailwind CSS の再ビルド
npm run build
```

---

## 導入完了チェックリスト

すべてのチェックボックスにチェックが入れば、導入完了です。

```
【ステップ1: 環境準備】
□ 環境変数が正しく設定されている
□ Supabase接続テストが成功している
□ GitHub Secrets がすべて登録されている

【ステップ2: ビルド・デプロイ】
□ ローカルビルド（npm run build）が成功している
□ デプロイが完了している（Vercel または PM2）
□ ブラウザからアクセス可能

【ステップ3: 動作確認】
□ トップページが正常に表示されている
□ ログイン機能が動作している
□ テストユーザーでログインできている
□ CSS/JS が正しく読み込まれている
□ API通信が正常（ブラウザコンソールにエラーがない）

【ステップ4: セキュリティ】
□ SSL証明書が有効（https:// で接続）
□ Supabase RLS ポリシーが有効
□ GitHub Secrets が暗号化されている
□ 環境変数に機密情報が含まれていない

【ステップ5: バックアップ・運用準備】
□ Supabase 自動バックアップが有効
□ エラーログが記録されている
□ モニタリング設定完了
□ サポートチーム情報を共有

【ステップ6: 塾スタッフへの引き継ぎ】
□ 管理画面ツアーを実施
□ ログイン方法を説明
□ よくある質問 (Q&A) を配布
□ 24時間サポート連絡先を共有
```

---

## サポート連絡先

### 導入中の問題が発生した場合

| 項目 | 連絡先 | 対応時間 |
|------|--------|--------|
| **技術サポート** | tech-support@example.jp | 24時間 |
| **電話サポート** | 0570-000-XXXX | 平日 9:00-18:00 |
| **緊急対応** | emergency@example.jp | 24時間（即時） |

### よくある質問

**Q. 導入後、データは失われていないか？**
A. Supabase の自動バックアップにより、最大35日間の復旧が可能です。安心してください。

**Q. ユーザーが増えた場合、スケーリングは可能か？**
A. Vercel は自動スケーリング対応。Supabase も 100万接続まで対応可能。

**Q. カスタマイズや拡張機能は追加できるか？**
A. 可能です。詳しくは「PRODUCTION_DEPLOYMENT_FINAL.md」を参照してください。

---

**導入日**: ___年___月___日
**導入担当者**: _______________
**確認者**: _______________
**完了時刻**: ___:___

