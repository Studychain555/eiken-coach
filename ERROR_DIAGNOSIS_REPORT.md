# 本番環境 エラー診断レポート

**生成日時**: 2026/3/27 0:18:24
**環境**: production

## ❌ エラー

### MISSING_ENV_VAR
- **説明**: 必須環境変数が定義されていません: EXPO_PUBLIC_SUPABASE_URL
- **重大度**: critical
- **対策**: .env.production ファイルに EXPO_PUBLIC_SUPABASE_URL を設定してください

### MISSING_ENV_VAR
- **説明**: 必須環境変数が定義されていません: EXPO_PUBLIC_SUPABASE_ANON_KEY
- **重大度**: critical
- **対策**: .env.production ファイルに EXPO_PUBLIC_SUPABASE_ANON_KEY を設定してください

### MISSING_ENV_VAR
- **説明**: 必須環境変数が定義されていません: EXPO_PUBLIC_SENTRY_DSN
- **重大度**: critical
- **対策**: .env.production ファイルに EXPO_PUBLIC_SENTRY_DSN を設定してください

### SUPABASE_CONFIG_MISSING
- **説明**: Supabaseの設定が不完全です
- **重大度**: critical
- **対策**: Supabase プロジェクトの URL と公開キーを確認してください

## ⚠️  警告

- Sentry DSN が設定されていません。エラー追跡が無効です。

## ✅ チェック結果

| チェック項目 | 結果 |
|---|---|
| supabaseConfig | ❌ NG |
| sentryConfig | ❌ NG |
| envVariables | ❌ NG |
| buildFiles | ✅ OK |
| networkConnectivity | ❌ NG |

## 📋 次のステップ

1. 環境変数を設定してください (.env.production ファイル)
2. Supabase の設定を確認してください

