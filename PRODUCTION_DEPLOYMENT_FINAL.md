# 本番環境デプロイメント完全ガイド

**作成日**: 2026年3月19日
**対象**: インフラストラクチャエンジニア・システム管理者
**難易度**: 中級～上級
**デプロイ時間**: 2～4時間（セットアップ含む）

---

## 第1章: 本番環境の前提条件

### 1-1. サーバー要件

#### 最小要件

```yaml
CPU: 2コア（推奨: 4コア以上）
メモリ: 4GB（推奨: 8GB以上）
ストレージ: 50GB（SSD推奨）
ネットワーク帯域幅: 100Mbps 以上
稼働率: 99.5% 以上
```

#### 推奨構成

```yaml
【ウェブサーバー】
サーバー: Ubuntu 22.04 LTS / AlmaLinux 9
CPU: 4コア
メモリ: 8GB
ストレージ: 100GB SSD (NVMe推奨)

【データベース】
サーバー: PostgreSQL 15.x
レプリケーション: 高可用性構成
バックアップ: 日次 + リアルタイム同期

【キャッシュサーバー】
Redis 7.x (オプション)
メモリ: 4GB

【CDN/ロードバランサー】
CloudFlare / AWS CloudFront
DDoS対策あり
```

### 1-2. 必須ツール・ソフトウェア

```bash
# バージョン確認
node --version      # v18.17.0 以上
npm --version       # 9.0 以上
docker --version    # 24.0 以上（Docker使用時）
git --version       # 2.40 以上

# インストール
brew install node npm git

# Vercel CLI（推奨）
npm install -g vercel

# PM2（セルフホスト時）
npm install -g pm2

# Docker（コンテナ化使用時）
brew install docker
# または
# https://www.docker.com/products/docker-desktop/ からダウンロード
```

### 1-3. 必須キー・認証情報

```
□ Supabase Project URL
□ Supabase Service Role Secret (JWT Token)
□ Supabase Anon Key
□ GitHub Personal Access Token (デプロイ用)
□ SSH Private Key (デプロイ用)
□ SSL Certificate (本番ドメイン用)
□ SSL Private Key
□ メール送信用 SMTP 認証情報
□ CloudFlare API Token
□ 3rd Party API Keys (Sentry, Google Analytics等)
```

---

## 第2章: ドメイン・SSL設定

### 2-1. ドメイン登録（事前に完了）

```bash
# ドメイン例
example.jp          # ルートドメイン
cram.example.jp     # 本番環境用
api.cram.example.jp # API用
```

### 2-2. DNS設定

登録したドメインのDNS設定画面で以下を設定：

#### A レコード（ロードバランサー/ウェブサーバーのIP）

```
タイプ: A
ホスト: cram.example.jp
値: 123.45.67.89 (本番サーバーのIPアドレス)
TTL: 3600
```

#### AAAA レコード（IPv6）

```
タイプ: AAAA
ホスト: cram.example.jp
値: 2001:0db8:85a3::8a2e:0370:7334
TTL: 3600
```

#### MX レコード（メール受信用）

```
タイプ: MX
ホスト: @
値: mail.example.jp
優先度: 10
TTL: 3600
```

#### TXT レコード（SPF/DKIM認証）

```
タイプ: TXT
ホスト: @
値: v=spf1 include:sendgrid.net ~all
TTL: 3600
```

### 2-3. SSL証明書の取得

#### 自動取得（推奨：Let's Encrypt）

```bash
# Certbot をインストール
sudo apt-get install certbot python3-certbot-nginx

# SSL証明書を自動取得
sudo certbot certonly --standalone -d cram.example.jp -d api.cram.example.jp

# 証明書の場所
# /etc/letsencrypt/live/cram.example.jp/
# └── fullchain.pem
# └── privkey.pem
```

#### 自動更新設定

```bash
# Certbot の自動更新を設定
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

# 更新テスト
sudo certbot renew --dry-run
```

### 2-4. SSL証明書の検証

```bash
# 証明書の詳細確認
openssl s_client -connect cram.example.jp:443

# 有効期限確認
echo | openssl s_client -servername cram.example.jp -connect cram.example.jp:443 2>/dev/null | openssl x509 -noout -enddate
# 期待される出力: notAfter=Apr 18 12:34:56 2025 GMT
```

---

## 第3章: Vercel へのデプロイ（推奨方法）

### 3-1. Vercel プロジェクト設定

#### ステップ1: Vercel CLI でログイン

```bash
npm install -g vercel
vercel login
# ブラウザで認証を完了
```

#### ステップ2: プロジェクトを Vercel に接続

```bash
cd /path/to/eigomaster
vercel

# プロンプト:
# ? Set up and deploy "/path/to/eigomaster"? [Y/n] Y
# ? Which scope do you want to deploy to? [Your Team/Account]
# ? Link to existing project? [y/N] Y
# ? What's the name of your existing project? eigomaster-prod
```

#### ステップ3: 環境変数を設定

```bash
# Vercel CLI から直接設定
vercel env add NEXT_PUBLIC_SUPABASE_URL
# プロンプト: https://xxx.supabase.co

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
# プロンプト: eyJhbGc...

vercel env add SUPABASE_SERVICE_ROLE_SECRET
# プロンプト: eyJhbGc...

# すべての環境変数を一覧表示
vercel env list
```

または、Vercel ダッシュボードから設定：

```
https://vercel.com/dashboard
→ プロジェクト選択
→ Settings タブ
→ Environment Variables
→ Add New Variable
```

### 3-2. 本番環境へのデプロイ

#### デプロイ実行

```bash
# 本番環境へデプロイ
vercel --prod

# 出力例:
# ✓ Production: https://cram.example.jp
# ✓ Deployed to production. [2m30s]
```

#### デプロイの確認

```bash
# デプロイログの確認
vercel logs --prod

# リアルタイムのアクセスログ
vercel logs cram.example.jp
```

### 3-3. カスタムドメイン設定

```bash
# Vercel ダッシュボード:
# Settings → Domains
# → "Add Domain"
# → "cram.example.jp" を入力

# または CLI から:
vercel domains add cram.example.jp
```

DNS設定の確認：

```bash
# DNS が正しく設定されているか確認
dig cram.example.jp
# 期待される出力:
# cram.example.jp. 300 IN A 76.76.19.xxx
```

### 3-4. 自動デプロイ設定

Vercel は GitHub との連携で自動デプロイ可能：

```bash
# GitHub リポジトリを Vercel に接続
1. Vercel ダッシュボード → Settings → Git
2. GitHub リポジトリを選択
3. デプロイ設定:
   - Branch: main, staging
   - Auto-deploy: 有効
```

これで、GitHub にプッシュすると自動デプロイが開始します。

---

## 第4章: セルフホスト（PM2/Docker）

### 4-1. PM2 での本番デプロイ

#### ステップ1: Node.js 環境構築

```bash
# Ubuntu 22.04 の場合
sudo curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# バージョン確認
node --version  # v18.17.0 以上
npm --version   # 9.0 以上
```

#### ステップ2: PM2 インストール

```bash
sudo npm install -g pm2

# PM2 ログディレクトリを作成
sudo mkdir -p /var/log/eigomaster
sudo chown $USER:$USER /var/log/eigomaster
```

#### ステップ3: アプリケーションをビルド

```bash
cd /path/to/eigomaster

# 依存関係インストール
npm install --production

# 環境変数を確認・設定
cp .env.example .env.production

# ビルド実行
npm run build

# ビルド成功の確認
ls -la .next/
```

#### ステップ4: PM2 エコシステム設定

```bash
# ecosystem.config.js を作成
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
      PORT: 3000,
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_SECRET: process.env.SUPABASE_SERVICE_ROLE_SECRET,
    },

    // ログ設定
    error_file: '/var/log/eigomaster/error.log',
    out_file: '/var/log/eigomaster/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',

    // パフォーマンス設定
    max_memory_restart: '1G',
    max_old_space_size: 512,

    // 再起動設定
    autorestart: true,
    watch: false,
    ignore_watch: ['node_modules', '.next', 'logs'],

    // グレースフルシャットダウン
    kill_timeout: 5000,
    wait_ready: true,
  }]
};
EOF
```

#### ステップ5: PM2 で起動

```bash
# 起動
pm2 start ecosystem.config.js

# ステータス確認
pm2 status

# ログ確認
pm2 logs eigomaster-prod

# サーバー再起動後も自動起動する設定
pm2 startup
pm2 save
```

#### ステップ6: リバースプロキシ設定（Nginx）

```bash
# Nginx インストール
sudo apt-get install -y nginx

# Nginx 設定ファイルを作成
sudo nano /etc/nginx/sites-available/eigomaster.conf
```

```nginx
upstream eigomaster {
  server 127.0.0.1:3000;
  server 127.0.0.1:3001;
  server 127.0.0.1:3002;
  server 127.0.0.1:3003;
}

server {
  listen 80;
  listen [::]:80;
  server_name cram.example.jp;

  # HTTP から HTTPS へ強制リダイレクト
  return 301 https://$server_name$request_uri;
}

server {
  listen 443 ssl http2;
  listen [::]:443 ssl http2;
  server_name cram.example.jp;

  # SSL証明書
  ssl_certificate /etc/letsencrypt/live/cram.example.jp/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/cram.example.jp/privkey.pem;

  # SSL設定
  ssl_protocols TLSv1.2 TLSv1.3;
  ssl_ciphers HIGH:!aNULL:!MD5;
  ssl_prefer_server_ciphers on;

  # セキュリティヘッダー
  add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
  add_header X-Content-Type-Options "nosniff" always;
  add_header X-Frame-Options "DENY" always;
  add_header X-XSS-Protection "1; mode=block" always;

  # ロギング
  access_log /var/log/nginx/eigomaster-access.log;
  error_log /var/log/nginx/eigomaster-error.log;

  # リバースプロキシ設定
  location / {
    proxy_pass http://eigomaster;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;

    # タイムアウト設定
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;
  }

  # 静的ファイルキャッシュ
  location /_next/static {
    add_header Cache-Control "public, max-age=31536000, immutable" always;
    proxy_pass http://eigomaster;
  }

  # 公開ディレクトリ
  location /public {
    add_header Cache-Control "public, max-age=31536000, immutable" always;
    proxy_pass http://eigomaster;
  }
}
```

```bash
# Nginx 設定を有効化
sudo ln -s /etc/nginx/sites-available/eigomaster.conf /etc/nginx/sites-enabled/

# Nginx 設定をテスト
sudo nginx -t
# 期待される出力: nginx: configuration is OK

# Nginx を起動・再起動
sudo systemctl start nginx
sudo systemctl restart nginx

# 自動起動を有効化
sudo systemctl enable nginx
```

### 4-2. Docker でのデプロイ

#### ステップ1: Dockerfile を作成

```bash
cat > Dockerfile << 'EOF'
# ビルドステージ
FROM node:18-alpine AS builder

WORKDIR /app

# 依存関係をインストール
COPY package*.json ./
RUN npm ci

# 環境変数をコピー
COPY .env.production .env.production

# ビルド実行
COPY . .
RUN npm run build

# ビルド結果をディレクトリにコピー
RUN mkdir -p /build
RUN cp -r .next /build/
RUN cp -r public /build/
RUN cp package*.json /build/

# 本番ステージ
FROM node:18-alpine

WORKDIR /app

# セキュリティ: root 以外で実行
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# ビルド結果をコピー
COPY --from=builder /build/package*.json ./
COPY --from=builder /build/.next ./.next
COPY --from=builder /build/public ./public

# 本番用依存関係のみをインストール
RUN npm ci --only=production

# ユーザーを変更
USER nextjs

# ヘルスチェック
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# ポート公開
EXPOSE 3000

# アプリケーション起動
CMD ["npm", "start"]
EOF
```

#### ステップ2: Docker イメージをビルド

```bash
# イメージをビルド
docker build -t eigomaster:latest .

# イメージのサイズを確認
docker images | grep eigomaster
# 期待: eigomaster:latest を含む行が表示される
```

#### ステップ3: Docker コンテナを実行

```bash
# コンテナを実行（テスト用）
docker run -d \
  --name eigomaster-test \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e NEXT_PUBLIC_SUPABASE_URL='https://xxx.supabase.co' \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY='your-key' \
  -e SUPABASE_SERVICE_ROLE_SECRET='your-secret' \
  eigomaster:latest

# コンテナが起動したか確認
docker ps | grep eigomaster
```

#### ステップ4: Docker Compose での管理

```bash
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  eigomaster:
    build: .
    container_name: eigomaster-prod
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      NEXT_PUBLIC_SUPABASE_URL: ${NEXT_PUBLIC_SUPABASE_URL}
      NEXT_PUBLIC_SUPABASE_ANON_KEY: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}
      SUPABASE_SERVICE_ROLE_SECRET: ${SUPABASE_SERVICE_ROLE_SECRET}
    restart: always
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    volumes:
      - ./logs:/app/logs
    networks:
      - eigomaster-network

  nginx:
    image: nginx:latest
    container_name: eigomaster-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - /etc/letsencrypt:/etc/letsencrypt
    depends_on:
      - eigomaster
    networks:
      - eigomaster-network

networks:
  eigomaster-network:
    driver: bridge
EOF
```

```bash
# Docker Compose で起動
docker-compose up -d

# ログを確認
docker-compose logs -f eigomaster

# コンテナの状態を確認
docker-compose ps
```

#### ステップ5: ローカルの Docker イメージを削除

```bash
# テスト用コンテナを停止・削除
docker stop eigomaster-test
docker rm eigomaster-test
```

---

## 第5章: セキュリティ設定確認

### 5-1. SSL/TLS 検証

```bash
# SSL証明書の確認
openssl s_client -connect cram.example.jp:443 -servername cram.example.jp

# 出力例:
# subject=CN = cram.example.jp
# issuer=C = US, O = Let's Encrypt, CN = R3
# Not Before: Mar 19 12:34:56 2026 GMT
# Not After : Jun 17 12:34:56 2026 GMT
```

### 5-2. セキュリティヘッダー検証

```bash
# セキュリティヘッダーの確認
curl -I https://cram.example.jp

# 確認すべきヘッダー:
# Strict-Transport-Security: max-age=31536000; includeSubDomains
# X-Content-Type-Options: nosniff
# X-Frame-Options: DENY
# X-XSS-Protection: 1; mode=block
# Content-Security-Policy: ...（必要に応じて）
```

### 5-3. HTTPS 強制リダイレクト

```bash
# HTTP アクセスが HTTPS にリダイレクトされるか確認
curl -I http://cram.example.jp

# 期待される出力:
# HTTP/1.1 301 Moved Permanently
# Location: https://cram.example.jp/
```

### 5-4. データベースセキュリティ

```bash
# Supabase の RLS ポリシーを確認
# Supabase ダッシュボード → Authentication → Policies

# 確認項目:
□ SELECT: 公開ポリシー（認証なしでOK）
□ INSERT/UPDATE: 認証ユーザーのみ
□ DELETE: 管理者のみ

# RLS が有効になっているか確認:
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';
```

### 5-5. 環境変数セキュリティ

```bash
# 環境変数にAPIキーが含まれていないか確認
cat .env.production | grep -E "SECRET|KEY|PASSWORD" | head -5

# 本番サーバーの環境変数を確認
env | grep SUPABASE
# 出力すべき項目:
# NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
# SUPABASE_SERVICE_ROLE_SECRET=eyJhbGc...
```

---

## 第6章: バックアップ戦略

### 6-1. Supabase の自動バックアップ確認

```
Supabase ダッシュボード:
Settings → Backups

確認項目:
□ 自動バックアップが有効
□ バックアップ頻度: 毎日（AM 2:00 UTC）
□ バックアップ保持期間: 35日間
□ 最新のバックアップが24時間以内
□ バックアップストレージ: 十分
```

### 6-2. 手動バックアップの取得

```bash
# pg_dump で手動バックアップ
pg_dump \
  --host=db.xxx.supabase.co \
  --username=postgres \
  --password \
  --format=custom \
  --file=/backup/supabase-backup-$(date +%Y%m%d).dump \
  postgres

# パスワードプロンプトでスーパーユーザーのパスワードを入力
```

### 6-3. 定期バックアップスクリプト

```bash
# バックアップスクリプトを作成
cat > /usr/local/bin/backup-eigomaster.sh << 'EOF'
#!/bin/bash

BACKUP_DIR="/backup/eigomaster"
DATE=$(date +%Y%m%d_%H%M%S)
DB_HOST="db.xxx.supabase.co"
DB_USER="postgres"
DB_PASSWORD="${SUPABASE_DB_PASSWORD}"

# バックアップディレクトリを作成
mkdir -p ${BACKUP_DIR}

# データベースバックアップ
PGPASSWORD=${DB_PASSWORD} pg_dump \
  --host=${DB_HOST} \
  --username=${DB_USER} \
  --format=custom \
  --file=${BACKUP_DIR}/db-backup-${DATE}.dump \
  postgres

# アプリケーションファイルバックアップ（オプション）
tar -czf ${BACKUP_DIR}/app-backup-${DATE}.tar.gz \
  /app/.next /app/public

# 30日以上前のバックアップを削除
find ${BACKUP_DIR} -name "*.dump" -mtime +30 -delete
find ${BACKUP_DIR} -name "*.tar.gz" -mtime +30 -delete

echo "Backup completed: ${DATE}"
EOF

# スクリプトを実行可能にする
chmod +x /usr/local/bin/backup-eigomaster.sh

# Cron ジョブで毎日実行
sudo crontab -e
# 追加:
# 0 3 * * * /usr/local/bin/backup-eigomaster.sh >> /var/log/eigomaster/backup.log 2>&1
```

---

## 第7章: 本番環境チェックリスト

### 起動前チェックリスト

```
【セットアップ】
□ サーバーのOS・ディストリビューションが決定している
□ 必要なツール（Node.js, Docker等）がインストール済み
□ ファイアウォール設定が完了している
□ SSH キーペアが生成済み

【ドメイン・ネットワーク】
□ ドメインが登録済み
□ DNS設定が完了（A, AAAA, MX, TXT レコード）
□ SSL証明書が取得済み（Let's Encrypt または商用）
□ SSL証明書が有効（期限確認）

【データベース】
□ Supabase Project が作成済み
□ データベーステーブルがすべて作成済み
□ RLS ポリシーが有効
□ 自動バックアップが有効
□ バックアップ容量が十分

【環境変数】
□ .env.production ファイルが正しく設定
□ すべての必須キー/シークレットが設定済み
□ APIキーが安全に保管（環境変数/シークレット管理）
□ 本番環境用のキーを使用（テスト用ではない）

【アプリケーション】
□ npm install が正常に完了
□ npm run build が成功
□ ビルドサイズが問題ない（<1GB推奨）
□ ビルドエラーがない（警告は許容）

【セキュリティ】
□ パスワードが8文字以上で複雑
□ SSH ポートが標準以外（例: 22 → 2222）
□ ファイアウォールで不要なポートを閉鎖
□ Supabase の RLS ポリシーが正しく設定
□ API キーの権限が最小限（不要な権限を削除）

【デプロイ】
□ デプロイ方法が決定（Vercel / PM2 / Docker）
□ デプロイプロセスが一度、テスト環境で検証済み
□ デプロイロールバック手順が準備済み
□ デプロイ担当者が複数人いる（冗長性）

【監視・ログ】
□ ログディレクトリが作成済み（/var/log/eigomaster）
□ ログローテーション設定が完了
□ エラートレーシング（Sentry）が設定済み
□ アクセスログが記録される

【バックアップ・復旧】
□ バックアップスクリプトが準備済み
□ バックアップが定期実行される
□ バックアップストレージが十分
□ 復旧テストが1度実施済み
□ 復旧手順書が準備済み

【ユーザー・チーム】
□ 管理者アカウントが作成済み
□ テストユーザーが作成済み
□ 講師/スタッフアカウント作成方法が確認済み
□ 緊急時の連絡先リストが準備済み
```

### デプロイ当日の実施項目

```
【24時間前】
□ 最終バックアップを取得
□ デプロイスクリプトを再確認
□ 緊急ロールバック手順を確認

【1時間前】
□ すべてのツール/サービスが稼働していることを確認
□ Supabase 接続テスト
□ GitHub リポジトリ最新版の確認

【デプロイ直前】
□ メンテナンスモードを有効化（オプション）
□ ファイアウォール設定を再確認

【デプロイ】
1. 本番環境にコードをプッシュ
2. 自動デプロイ（Vercel）または手動デプロイ（PM2/Docker）
3. デプロイログを監視

【デプロイ直後】
□ ブラウザでアクセス確認（3-5分待機）
□ ログにエラーがないか確認
□ 基本機能をテスト（ログイン、ダッシュボード表示等）
□ メンテナンスモードを無効化
□ 緊急連絡先に完了報告

【デプロイ後1時間】
□ エラーログを継続監視
□ Sentry でエラーがないか確認
□ ユーザーからの問い合わせを監視
```

---

## 第8章: トラブルシューティング

### 問題: デプロイ後、真っ白なページが表示される

```
原因: JavaScript読み込みエラー

対応:
1. ブラウザのコンソールを確認（F12 → Console）
2. エラーメッセージをメモ
3. Sentry でエラーを確認
4. 環境変数が正しいか再確認
5. ビルドログを確認（Vercel の場合）
6. 必要に応じてロールバック

ロールバック手順:
# Vercel の場合
vercel rollback

# Git の場合
git revert HEAD
git push origin main
```

### 問題: Supabase 接続エラー

```
エラーメッセージ:
"Error: connect ECONNREFUSED localhost:5432"

原因: Supabase Project URL が間違っている

対応:
1. Supabase ダッシュボード → Settings → API で Project URL を確認
2. 環境変数 NEXT_PUBLIC_SUPABASE_URL を再確認
3. 接続テスト:
   node -e "
   const { createClient } = require('@supabase/supabase-js');
   const client = createClient(
     process.env.NEXT_PUBLIC_SUPABASE_URL,
     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
   );
   client.auth.getSession().then(r => console.log('✅ 接続成功'));
   "
```

### 問題: メール送信が失敗する

```
エラーメッセージ:
"Error: SMTP connect failed"

対応:
1. SMTP設定を確認:
   cat .env.production | grep SMTP

2. ファイアウォールで SMTP ポート（25, 465, 587）が開いているか確認:
   telnet smtp.example.jp 587

3. SMTP認証情報を再確認:
   - ホスト名
   - ポート番号
   - ユーザー名
   - パスワード

4. テストメール送信:
   node scripts/test-smtp.js
```

### 問題: CSS が適用されていない

```
症状: ページはロードされるが、レイアウトが崩れている

対応:
1. ブラウザキャッシュをクリア（Ctrl+Shift+Delete）
2. Vercel のキャッシュをクリア:
   vercel --prod --force

3. リビルド:
   npm run build

4. Tailwind CSS の設定を確認:
   cat tailwind.config.js
```

---

## 第9章: 運用・監視・保守

### 9-1. 日次チェック項目

```
【毎朝】
□ アプリケーションが起動しているか確認
  curl -I https://cram.example.jp

□ エラーログをチェック
  tail -50 /var/log/eigomaster/error.log

□ ディスク使用量を確認
  df -h
  # 使用率: 80%未満が理想

□ メモリ使用量を確認
  free -h
  # 使用率: 80%未満が理想

【毎晩】
□ バックアップが正常に実行されたか確認
  ls -lh /backup/eigomaster/ | head -5

□ Sentry でエラーがないか確認
  https://sentry.io/dashboard
```

### 9-2. 定期保守スケジュール

```
【毎週】
□ ログローテーション実行
□ 古いログファイルを削除（30日以上前）
□ セキュリティパッチの確認

【毎月】
□ SSL証明書の有効期限を確認
□ バックアップストレージ容量を確認
□ システム負荷テスト実行

【3ヶ月ごと】
□ セキュリティ監査（Snyk, npm audit）
□ パフォーマンスプロファイリング
□ アップデート可能なパッケージの確認

【6ヶ月ごと】
□ インフラストラクチャの見直し（CPU, メモリ増強の必要性）
□ コスト最適化の検討
□ 災害復旧テスト
```

### 9-3. 性能監視

```bash
# CPU使用率の監視
top -b -n 1 | head -20

# メモリプロファイリング
node --max_old_space_size=4096 node_modules/.bin/next start

# レスポンス時間の測定
curl -w "@curl-format.txt" -o /dev/null -s https://cram.example.jp
# 期待: レスポンスタイム < 1000ms

# 並行接続数の測定
# (load testing tool: Apache Bench, wrk等を使用)
ab -n 1000 -c 10 https://cram.example.jp/
```

---

## 第10章: チェックリスト（最終確認）

```
【本番環境への移行前】

□ 開発環境での全機能テスト完了
□ ステージング環境での負荷テスト完了
□ セキュリティテスト完了
□ バックアップ・復旧テスト完了
□ パフォーマンステスト完了（レスポンス時間< 1秒）

【本番環境デプロイ後】

□ トップページが正常に表示される
□ ログイン機能が動作する
□ 基本機能（生徒管理、課題、採点）が動作する
□ SSL証明書が有効（ブラウザで🔒表示）
□ エラーログにエラーがない
□ パフォーマンスが期待値内
□ バックアップが成功している
□ モニタリングツール（Sentry）が稼働している

【ユーザー・チーム側】

□ 管理者がシステムにログインできる
□ 講師がシステムにログインできる
□ テスト生徒が登録されている
□ テスト課題が作成できる
□ テスト採点が実行できる
□ 緊急連絡先が全スタッフに共有済み
```

---

## サポート・問い合わせ

| 項目 | 連絡先 | 対応時間 |
|------|--------|--------|
| **技術サポート** | tech-support@example.jp | 24時間 |
| **緊急対応** | emergency@example.jp | 24時間（即時） |
| **デプロイ相談** | deployment-team@example.jp | 平日 9:00-18:00 |

---

**最後に: 本番環境は「火」です**

本番環境への変更は、常に慎重に進めてください。
テスト環境での十分な検証を経て、初めて本番へ移行します。

もし問題が発生した場合は、決してパニックになることなく、
冷静に対応してください。ロールバック機能があります。

eigomasterチーム一同、あなたの成功をサポートします！

