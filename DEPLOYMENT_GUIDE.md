# Cloudflare Pages デプロイメントガイド

## 🚀 デプロイ完了

EigoMaster Web アプリケーションは Cloudflare Pages にデプロイされています。

## 🔑 環境変数設定（必須）

Cloudflare Pages ダッシュボードで以下の環境変数を設定してください：

### 本番環境変数（Production）

```
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...（Supabaseから取得）
EXPO_PUBLIC_CLAUDE_API_KEY=sk-ant-...（Claude APIキー）
EXPO_PUBLIC_WHISPER_API_KEY=...（Whisper APIキー）
EXPO_PUBLIC_SENTRY_DSN=https://...@sentry.io/...（Sentryプロジェクト）
EXPO_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX（Google Analytics）
EXPO_PUBLIC_ENV=production
NODE_ENV=production
```

### 設定方法

1. Cloudflare ダッシュボード → Pages
2. プロジェクト選択 → Settings
3. Environment variables セクション
4. Add variable で上記の環境変数を追加

## 🌐 アクセスURL

デプロイ完了後、以下の URL でアクセス可能：

```
https://eigomaster.pages.dev
```

## ✅ ビルド設定

- Build command: `npm run build:web`
- Build directory: `dist`
- Node.js version: 22.x

## 🔄 自動デプロイ

mainブランチにコミット/プッシュするたびに自動的にビルド・デプロイが実行されます。
