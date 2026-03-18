# EigoMaster - セットアップ完全ガイド

**対象者**: 開発者、デプロイエンジニア
**推定時間**: 30～60分
**最終更新**: 2026-03-19

---

## 目次

1. [前提条件](#前提条件)
2. [ローカル開発環境](#ローカル開発環境)
3. [Supabaseセットアップ](#supabaseセットアップ)
4. [環境変数設定](#環境変数設定)
5. [開発サーバー起動](#開発サーバー起動)
6. [本番環境デプロイ](#本番環境デプロイ)
7. [トラブルシューティング](#トラブルシューティング)

---

## 前提条件

### システム要件

```
OS: macOS 10.15+ / Windows 10+ / Linux
メモリ: 4GB以上（推奨8GB以上）
ディスク: 5GB以上の空き容量
インターネット: 安定した接続
```

### 必須ソフトウェア

```bash
# Node.js 18+ (npm 9+)
node --version    # v18.0.0 以上
npm --version     # 9.0.0 以上

# Git
git --version

# (iOS開発の場合) Xcode Command Line Tools
xcode-select --install

# (Android開発の場合) Android Studio
# Java: Java 11+
java -version
```

### アカウント

- [ ] GitHub アカウント（オプション）
- [ ] Supabase アカウント（必須）
- [ ] Claude API キー（オプション：demo時のみ）

---

## ローカル開発環境

### ステップ1: リポジトリクローン

```bash
# リポジトリをクローン
git clone https://github.com/your-org/eigomaster.git
cd eigomaster

# ブランチ確認
git branch
# * main
#   develop

# develop ブランチで作業（推奨）
git checkout develop
git pull origin develop
```

### ステップ2: 依存関係のインストール

```bash
# npm キャッシュクリア（トラブル時）
npm cache clean --force

# 依存関係インストール
npm install

# インストール確認
npm list --depth=0

# 出力例:
# ├── @expo/vector-icons@15.0.3
# ├── @react-navigation/bottom-tabs@7.4.0
# ├── @supabase/supabase-js@2.99.2
# ├── axios@1.13.6
# ├── expo@54.0.33
# ├── expo-av@16.0.8
# ├── react@19.1.0
# ├── react-native@0.81.5
# ├── zustand@5.0.12
# └── ... (その他)
```

### ステップ3: TypeScriptコンパイル確認

```bash
# TypeScript コンパイル
npx tsc --noEmit

# 出力:
# ✓ コンパイル成功（エラーなし）
```

### ステップ4: ESLint 検査

```bash
# コード品質検査（オプション）
npm run lint

# 出力:
# ✓ すべてのファイルをチェック完了
```

---

## Supabaseセットアップ

### ステップ1: Supabaseプロジェクト作成

1. https://supabase.com にアクセス
2. 「Start your project」をクリック
3. 以下を入力:

```
プロジェクト名: eigomaster-dev
リージョン: Asia-Tokyo (ap-northeast-1)
データベースパスワード: [強力なパスワード]
                      例: P@ssw0rd!2026AbC#XyZ
```

4. 「Create new project」をクリック
5. プロジェクトが作成されるまで待機（3～5分）

### ステップ2: Supabase プロジェクト設定

プロジェクトダッシュボード → Settings:

```
✓ API URL: https://xxx.supabase.co
✓ Anon Key: eyJhbGc... (公開キー)
✓ Service Role Secret: eyJhbGc... (秘密キー - サーバーサイドのみ)
```

### ステップ3: データベーススキーマセットアップ

#### 方法1: SQL Editor 経由（推奨）

1. Supabase Dashboard → SQL Editor
2. 「+ New Query」をクリック
3. 以下のスクリプトをコピー:

```sql
-- ファイル: supabase/migrations/001_initial_schema.sql
-- (以下、ファイル内容をすべてコピー)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('student', 'teacher', 'admin')),
  display_name TEXT NOT NULL,
  class_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Classes table
CREATE TABLE classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  teacher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  school_name TEXT,
  invite_code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ... (その他のテーブル定義)
```

4. 「Run」をクリック
5. 完了を待機

#### 方法2: SQL ファイルアップロード

```bash
# コマンドライン
psql -h [hostname] -U postgres -d [database] \
  -f supabase/migrations/001_initial_schema.sql
```

### ステップ4: 拡張スキーマの適用

```sql
-- ファイル: supabase/migrations/002_enhanced_schema.sql
-- (上記と同じ手順で実行)
```

### ステップ5: 認証設定

Supabase Dashboard → Authentication → Providers:

```
✓ Email: ON
✓ Email Confirmations: ON (メール確認必須)
✓ Redirect URL: http://localhost:8081 (開発)
              https://eigomaster.app (本番)
```

### ステップ6: ストレージバケット作成

Supabase Dashboard → Storage:

```
バケット1: audio-files
  - Public: ✓ ON
  - 説明: リスニング音声ファイル

バケット2: writing-images
  - Public: ✓ ON
  - 説明: ライティング手書き画像

バケット3: submissions
  - Public: OFF
  - 説明: ユーザー提出ファイル
```

### ステップ7: Row Level Security (RLS) 有効化

```sql
-- Supabase → SQL Editor で実行
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE listening_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE listening_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE shadowing_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE vocabulary_words ENABLE ROW LEVEL SECURITY;
ALTER TABLE vocabulary_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE writing_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE writing_submissions ENABLE ROW LEVEL SECURITY;
```

### ステップ8: RLS ポリシー設定

```sql
-- profiles: ユーザーは自分のプロフィールのみ読取可能
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- listening_questions: 認証ユーザーは読取可能
CREATE POLICY "All authenticated users can read questions" ON listening_questions
  FOR SELECT USING (auth.role() = 'authenticated');

-- listening_attempts: ユーザーは自分の試行のみ読取可能
CREATE POLICY "Users can read own attempts" ON listening_attempts
  FOR SELECT USING (auth.uid() = user_id);

-- vocabulary_progress: ユーザーは自分の進捗のみ読取可能
CREATE POLICY "Users can read own vocabulary progress" ON vocabulary_progress
  FOR SELECT USING (auth.uid() = user_id);

-- writing_submissions: ユーザーは自分の提出のみ読取可能
CREATE POLICY "Users can read own submissions" ON writing_submissions
  FOR SELECT USING (auth.uid() = user_id);

-- (その他も同様に設定)
```

---

## 環境変数設定

### ステップ1: .env.local ファイル作成

プロジェクトルートに `.env.local` を作成:

```bash
touch .env.local
```

### ステップ2: 環境変数を記入

```bash
# Supabase
EXPO_PUBLIC_SUPABASE_URL=https://ziqskxtpypyhbqfmbmhi.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppcXNreHRweXB5aGJxZm1ibWhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNDY3MzAsImV4cCI6MjA4ODYyMjczMH0.MBHTq7DNpMQopQ0q8JHu1RZngcI2_Bx0tWxDY2bsBH0

# Claude API (オプション - demo時は不要)
EXPO_PUBLIC_CLAUDE_API_KEY=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

# Whisper API (オプション - demo時は不要)
EXPO_PUBLIC_WHISPER_API_KEY=

# Service Role (本番サーバーサイドのみ)
SUPABASE_SERVICE_ROLE_SECRET=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppcXNreHRweXB5aGJxZm1ibWhpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzA0NjczMCwiZXhwIjoyMDg4NjIyNzMwfQ.zleXrb4h81caGdbatz5O8-NBsCIV_05yb_LH9ms6Ktk
```

### ステップ3: 設定確認

```bash
# 環境変数が読み込まれているか確認（ブラウザコンソール）
console.log(process.env.EXPO_PUBLIC_SUPABASE_URL);
// 出力: https://ziqskxtpypyhbqfmbmhi.supabase.co
```

### 本番環境設定

本番環境では `.env` (GitIgnore対象) を使用:

```bash
# .env.production (本番環境)
EXPO_PUBLIC_SUPABASE_URL=https://prod-xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_SECRET=...
API_LOG_LEVEL=error
SENTRY_DSN=https://...@sentry.io/...
```

---

## 開発サーバー起動

### ステップ1: Web版で開発（推奨）

```bash
# 開発サーバー起動
npm run web

# 出力:
# › Waiting on expo://127.0.0.1:8081
# › Web is ready at http://localhost:8081
# › Press 'w' to open web

# ブラウザが自動で開きます
# http://localhost:8081
```

### ステップ2: 動作確認

```
【ログイン画面】
メール: test@example.com
パスワード: password123

↓

【ホーム画面（下部にタブ表示）】
- ホーム
- リスニング
- 単語
- ライティング
- 設定

↓

各機能が表示されれば成功！
```

### ステップ3: iOS シミュレータで開発

```bash
# iOS シミュレータ起動（macOS only）
npm run ios

# 出力:
# ✓ Built app for iOS simulator
# › Opening app on iPhone 15 Pro

# iOS シミュレータが起動し、アプリが自動で起動
```

### ステップ4: Android エミュレータで開発

```bash
# Android エミュレータが起動していることを確認
# Android Studio → Virtual Device Manager で確認

# アプリ起動
npm run android

# 出力:
# ✓ Built APK for Android emulator
# › Starting app on Android emulator
```

---

## 本番環境デプロイ

### デプロイオプション

| オプション | 対象 | 難易度 | 推奨 |
|----------|------|-------|------|
| **Expo Go** | 開発・テスト | 簡単 | △ 開発のみ |
| **EAS Build** | iOS/Android | 中程度 | ✅ 推奨 |
| **App Store** | iOS ユーザー | 高 | ✅ 本番 |
| **Google Play** | Android ユーザー | 高 | ✅ 本番 |
| **Vercel** | Web | 簡単 | △ 補足 |

### オプション1: EAS Build (iOS/Android)

#### 1-1. EAS CLI インストール

```bash
npm install -g eas-cli

# バージョン確認
eas --version
# eas/x.y.z
```

#### 1-2. Expo アカウント作成

```bash
# Expo アカウント作成（まだの場合）
# https://expo.dev/signup

# ログイン
eas login

# 出力:
# ✓ Logged in as: your-email@example.com
```

#### 1-3. EAS Build 設定

```bash
# eas.json を作成
eas build:configure

# 対話的に設定
# ✓ Select platforms: iOS, Android
# ✓ Set up production build: Yes
```

#### 1-4. iOS ビルド

```bash
# プレビュービルド（テスト用）
eas build --platform ios --profile preview

# 本番ビルド
eas build --platform ios --profile production

# 出力:
# ✓ Build finished
# › Download URL: https://eas-builds.expo.dev/...
```

#### 1-5. Android ビルド

```bash
# プレビュービルド
eas build --platform android --profile preview

# 本番ビルド
eas build --platform android --profile production

# 出力:
# ✓ Build finished
# › Download URL: https://eas-builds.expo.dev/...
```

### オプション2: App Store デプロイ

#### 2-1. Apple Developer Account 準備

```bash
# 1. Apple Developer Program に登録
#    https://developer.apple.com/programs/

# 2. Certificate, Identifier, Profile を作成
#    Xcode → Preferences → Accounts で設定

# 3. App Store Connect で新規アプリを作成
#    https://appstoreconnect.apple.com/
```

#### 2-2. TestFlight で内部テスト

```bash
# iOS ビルド（本番）
eas build --platform ios --profile production

# ビルド完了後、App Store Connect で TestFlight に追加
# 内部テスター（メール）を招待
# テスター: 48時間以内にアクセス可能
```

#### 2-3. App Store に申請

```bash
# App Store Connect で申請
# 1. ビルドを選択
# 2. アプリ情報を入力
#    - アプリ名
#    - 説明
#    - スクリーンショット（5枚）
#    - キーワード
# 3. 価格と販売地域を設定
# 4. 「申請」をクリック
# 5. Apple による審査（3～7日）
```

### オプション3: Google Play デプロイ

#### 3-1. Google Play Console 準備

```bash
# 1. Google Play Console にアクセス
#    https://play.google.com/console

# 2. 新規アプリを作成
# 3. アプリ署名用 keystore を生成
```

#### 3-2. Android ビルド

```bash
# Android ビルド（本番）
eas build --platform android --profile production

# 出力: APK/AAB ファイル
```

#### 3-3. Google Play に申請

```bash
# Google Play Console で申請
# 1. ビルドをアップロード
# 2. アプリ情報を入力
# 3. プライバシーポリシーを登録
# 4. 「内部テスト」で事前テスト
# 5. 「リリース」で本番リリース
# 6. Google による審査（通常 1～3日）
```

### デプロイ後の確認

```bash
# 本番環境の状態確認
eas build:list

# 出力:
# ┌─────────────────────────────────────────────────────────┐
# │ Build                  Platform  Status      Created     │
# ├─────────────────────────────────────────────────────────┤
# │ 1  ios       FINISHED  2 days ago
# │ 2  android   FINISHED  2 days ago
# └─────────────────────────────────────────────────────────┘
```

---

## トラブルシューティング

### 問題1: npm install でエラー

**症状**:
```
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
```

**解決方法**:
```bash
# キャッシュをクリア
npm cache clean --force

# node_modules を削除
rm -rf node_modules package-lock.json

# 再インストール
npm install

# または --legacy-peer-deps フラグを使用
npm install --legacy-peer-deps
```

### 問題2: expo start でエラー

**症状**:
```
Error: Cannot find module 'expo/build/Expo.js'
```

**解決方法**:
```bash
# node_modules を再生成
rm -rf node_modules package-lock.json
npm install

# Expo キャッシュをクリア
npx expo start --clear
```

### 問題3: TypeScript エラー

**症状**:
```
TS7006: Parameter 'X' implicitly has an 'any' type.
```

**解決方法**:
```typescript
// 型を明示的に指定
const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
  // ...
};
```

### 問題4: Supabase接続エラー

**症状**:
```
Failed to fetch: Failed to connect to Supabase
```

**解決方法**:
```bash
# 1. .env.local を確認
cat .env.local

# 2. Supabase URL と Key が正しいか確認
# 3. Supabase プロジェクトのステータスを確認
#    https://supabase.com/dashboard → Project Status

# 4. インターネット接続を確認
ping supabase.co

# 5. ファイアウォール設定を確認
```

### 問題5: ポート 8081 が既に使用中

**症状**:
```
Error: Port 8081 is already in use
```

**解決方法**:
```bash
# ポートを解放
lsof -ti:8081 | xargs kill -9

# または別のポートを指定
npx expo start --port 8082
```

### 問題6: キャッシュの問題

**症状**:
変更が反映されない、古いコードが実行されている

**解決方法**:
```bash
# 開発サーバーを再起動
npm run web

# または全キャッシュをクリア
npm run web -- --clear

# ブラウザのキャッシュもクリア
# DevTools → Application → Storage → Clear site data
```

---

## 次のステップ

セットアップが完了したら：

1. **テストを実行** → QUICK_START.md を参照
2. **機能を確認** → README_JP.md で各機能を試す
3. **サンプルデータを投入** → SQL スクリプトで初期データ追加
4. **コミット・プッシュ** → 変更を版管理に保存

---

## よくある質問

**Q: 開発中にデータベーススキーマを変更するには？**
A: Supabase Dashboard → SQL Editor で新しいマイグレーションを実行し、別ファイル（002_xxx.sql）として保存

**Q: 環境変数をオンラインで管理するには？**
A: GitHub Secrets（本番環境）や環境変数管理ツール（Doppler等）を使用

**Q: 複数の開発環境を使い分けるには？**
A: 複数の Supabase プロジェクト（dev/staging/prod）を作成し、.env.local をコンテキストで切り替え

**Q: モバイルデバイスで実機テストするには？**
A: Expo Go アプリをインストール → QR コードをスキャン → リアルタイム同期

---

**セットアップガイド完成日**: 2026-03-19
**推奨セットアップ時間**: 30～60分
