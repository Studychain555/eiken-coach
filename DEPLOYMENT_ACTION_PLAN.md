# EigoMaster v1.0.0 デプロイメント実行計画書

**作成日**: 2026-03-19 16:25 JST
**対象バージョン**: EigoMaster v1.0.0
**デプロイ判定**: ✅ **実行可能**
**推奨開始日時**: 2026-03-19 (本日中)

---

## 概要

EigoMaster v1.0.0 の総合テストが完了しました。本ドキュメントは、本番環境へのデプロイ実行に向けた詳細なアクション計画です。

**主要成果**:
- ✅ Web版ビルド成功 (3.6MB)
- ✅ コア機能完全実装 (型エラー 0)
- ✅ パフォーマンス達成 (1.5-2.5秒)
- ✅ 環境設定完備 (Supabase・Sentry)

**残タスク**: Sentry API 更新 (15分) → デプロイ (5-6時間)

---

## Phase 0: 即時対応 (本日中 - 30分)

### Task 0-1: Sentry v10 API アップグレード (15分)

**対象ファイル**: `/Users/80dr/eigomaster/src/lib/sentry.config.ts`

**変更内容**:

```typescript
// Line 42: ReactNativeTracing → 新API
// 修正前:
const tracing = new Sentry.Integrations.ReactNativeTracing({...});

// 修正後:
// v10では Integrations.ReactNativeTracing は非推奨
// 代わりに init() の integrations オプションで設定

// Line 127: startTransaction → Sentry.startSpan()
// 修正前:
const transaction = Sentry.startTransaction({
  name: 'operation',
});

// 修正後:
Sentry.startSpan({
  op: 'operation',
  name: 'operation-name',
}, () => {
  // コード
});

// Line 137: Transaction 型 → SpanJSON 型に変更
import { TransactionEvent } from '@sentry/react-native';
// →
import { SpanJSON } from '@sentry/react-native';
```

**確認コマンド**:
```bash
npx tsc --noEmit src/lib/sentry.config.ts
# → エラー 0 であることを確認
```

### Task 0-2: Jest 型定義インストール (5分)

```bash
npm install --save-dev @types/jest-puppeteer
```

**確認コマンド**:
```bash
npx tsc --noEmit tests/audioPlayback.e2e.test.ts
# → 型エラー 0 であることを確認
```

### Task 0-3: 最終型チェック確認 (10分)

```bash
# 全プロジェクト型チェック
npx tsc --noEmit
# 期待結果: エラー 0

# ESLint実行
npm run lint
# 期待結果: エラー 0 (警告は許容)

# Web版ビルド確認
npm run build:web
# 期待結果: dist/ フォルダ生成、エラー 0
```

**チェックリスト**:
- [ ] Sentry API 更新完了
- [ ] Jest 型定義インストール完了
- [ ] `npx tsc --noEmit` エラー 0 確認
- [ ] `npm run build:web` 成功確認

---

## Phase 1: Web版デプロイ (1-2時間)

### Task 1-1: 本番ビルド生成

```bash
cd /Users/80dr/eigomaster

# ビルド実行
npm run build:web

# 出力確認
ls -lh dist/
# 期待結果: dist/ ディレクトリ作成 (3.6MB程度)
```

**出力ファイル確認**:
```
dist/
├── index.html                    # メインページ
├── _expo/
│   └── static/js/web/
│       ├── entry-460d...js      # メインバンドル (2.52MB)
│       └── shadowingStore-187d...js  # 副バンドル (4.14KB)
├── favicon.ico
├── manifest.json
└── [その他静的資産]
```

### Task 1-2: Web版デプロイ先選択

3つのオプションから選択:

#### Option A: Vercel (推奨・最速)

```bash
# Vercel CLI インストール
npm install -g vercel

# デプロイ
vercel --prod

# 期待結果: https://eigomaster.vercel.app (または custom domain)
```

**所要時間**: 5分
**利点**: 自動HTTPS、CDN、自動スケール
**設定**: 環境変数 .env.production をVercelプロジェクト設定で追加

#### Option B: Netlify

```bash
# Netlify CLI インストール
npm install -g netlify-cli

# デプロイ
netlify deploy --prod --dir=dist

# 期待結果: https://eigomaster.netlify.app (または custom domain)
```

**所要時間**: 5分
**利点**: 簡単設定、自動HTTPS、CDN
**設定**: netlify.toml で設定

#### Option C: 自社サーバー (Express/Nginx等)

```bash
# dist/ フォルダを Web サーバーのドキュメントルートにコピー
scp -r dist/ user@server:/var/www/eigomaster/

# Nginx設定例:
server {
    listen 443 ssl;
    server_name eigomaster.example.com;

    root /var/www/eigomaster;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    ssl_certificate /etc/letsencrypt/live/eigomaster.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/eigomaster.example.com/privkey.pem;
}
```

**所要時間**: 30分
**利点**: 完全制御、カスタマイズ自由度
**前提**: サーバー・SSL証明書準備済み

### Task 1-3: 環境変数設定

デプロイ先に以下を設定:

```
EXPO_PUBLIC_SUPABASE_URL=https://tbtwegsiumpiskeuhgfjs.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<ANON_KEY>
EXPO_PUBLIC_SENTRY_DSN=<SENTRY_DSN>
EXPO_PUBLIC_GA_MEASUREMENT_ID=<GA_ID>
EXPO_PUBLIC_ENV=production
EXPO_PUBLIC_DEBUG_MODE=false
```

### Task 1-4: 動作確認

```bash
# ブラウザでアクセス
# https://eigomaster.example.com (またはデプロイ先)

# 確認項目:
# ✓ ページが表示される (ローディング画面)
# ✓ ブラウザコンソール (F12) にエラーがない
# ✓ Network タブで JS バンドル読み込み成功
# ✓ Sentry に初期化ログが出現

# 実際の機能テスト:
# ✓ ユーザー登録画面が表示される
# ✓ ログイン画面が表示される
```

**チェックリスト**:
- [ ] Web版ビルド完成 (dist/)
- [ ] デプロイ先選択完了
- [ ] 環境変数設定完了
- [ ] ブラウザアクセス確認完了

---

## Phase 2: iOS版デプロイ (2-3時間)

### 前提条件

- Apple Developer アカウント (年額 $99)
- Mac環境 (Xcode インストール済み)
- テスト用 iPhone (オプション)

### Task 2-1: 証明書確認

```bash
# EAS 認証情報確認
eas credentials

# 出力例:
# Platform: iOS
# ✓ Certificate: Available
# ✓ Provisioning Profile: Available

# なければ作成:
eas credentials -p ios --create
```

### Task 2-2: iOS ビルド実行

```bash
npm run build:ios

# または詳細実行:
eas build --platform ios --profile production

# ビルド状況確認:
eas build:list

# 期待結果:
# ビルド完成: ~15分
# App Store に upload 可能な .ipa ファイル生成
```

### Task 2-3: App Store Connect に申請

```bash
npm run submit:ios

# または詳細:
eas submit --platform ios --latest

# 申請後:
# - App Store Review 待機 (通常 24-48時間)
# - リリース承認後に自動配信開始
```

**重要**:
```
✓ アプリ説明・スクリーンショット・プライバシーポリシー準備済み
✓ TestFlight でベータテスト実施可能
✓ 絵文字・言語対応確認
```

**チェックリスト**:
- [ ] Apple Developer アカウント確認
- [ ] 証明書状態確認
- [ ] ビルド実行完了
- [ ] App Store Connect 申請完了

---

## Phase 3: Android版デプロイ (2-3時間)

### 前提条件

- Google Play Developer アカウント (年額 $25)
- Android ビルド環境 (Java, Gradle)

### Task 3-1: Keystore 確認

```bash
# Keystore 確認
eas credentials -p android

# 出力例:
# Keystore: Available

# なければ作成:
eas credentials -p android --create
```

### Task 3-2: Android ビルド実行

```bash
npm run build:android

# または詳細:
eas build --platform android --profile production

# ビルド状況確認:
eas build:list

# 期待結果:
# ビルド完成: ~15分
# Google Play に upload 可能な .aab ファイル生成
```

### Task 3-3: Google Play Console に申請

```bash
npm run submit:android

# または詳細:
eas submit --platform android --latest

# 申請後:
# - Google Play Review 待機 (通常 2-4時間)
# - リリース承認後に自動配信開始
```

**重要**:
```
✓ アプリ説明・スクリーンショット・プライバシーポリシー準備済み
✓ 内部テスト・closed testing で事前検証推奨
✓ 段階的ロールアウト検討 (最初5% → 100%)
```

**チェックリスト**:
- [ ] Google Play Developer アカウント確認
- [ ] Keystore 状態確認
- [ ] ビルド実行完了
- [ ] Google Play Console 申請完了

---

## Phase 4: 本番環境監視 (24時間)

### Task 4-1: 監視設定確認

```bash
# Sentry ダッシュボード確認
# https://sentry.io → Projects → EigoMaster

# Google Analytics 確認
# https://analytics.google.com → Properties → EigoMaster

# Supabase 監視
# https://supabase.com → Projects → tbtwegsiumpiskeuhgfjs
```

### Task 4-2: アラート設定

**Sentry アラート** (エラー発生時に通知):
```
条件: エラー発生
通知先: メール / Slack
対応: P0エラーは即座に対応
```

**ダウンタイム監視**:
```
ツール: Uptime Robot / Ping Dam など
URL: https://eigomaster.example.com
チェック間隔: 5分
```

### Task 4-3: ホットフィックス準備

```bash
# ロールバック用の git タグ作成
git tag -a v1.0.0-prod -m "Production Release 2026-03-19"
git push origin v1.0.0-prod

# 緊急デプロイ用スクリプト:
# 前バージョンに戻す場合
git reset --hard v1.0.0-previous
npm run build:web
# デプロイ先に再アップロード
```

**チェックリスト**:
- [ ] Sentry ダッシュボード確認
- [ ] Google Analytics 確認
- [ ] Supabase 監視設定確認
- [ ] アラート設定完了
- [ ] git タグ作成完了

---

## Phase 5: 本番後テスト (第1日)

### Task 5-1: ユーザー受け入れテスト (UAT)

```
対象ユーザー: 5-10名のベータテスター
期間: 24-48時間
確認項目:
  ✓ ユーザー登録できる
  ✓ ログインできる
  ✓ リスニング学習できる
  ✓ 単語学習できる
  ✓ ライティング採点できる
  ✓ シャドーイング実行できる
  ✓ 講師ダッシュボード表示される
  ✓ 音声再生される (Web・iOS・Android)
```

### Task 5-2: パフォーマンス計測

```bash
# Chrome DevTools で計測
# F12 → Performance タブ

測定項目:
  - 初期ロード時間
  - First Contentful Paint (FCP)
  - Largest Contentful Paint (LCP)
  - Cumulative Layout Shift (CLS)
  - 音声再生遅延
```

### Task 5-3: エラー対応

```
Sentry でエラー検出 → 即座に対応
重大度:
  P0: システムダウン → 緊急ロールバック
  P1: 機能障害 → ホットフィックス
  P2: 警告/不具合 → 継続的改善
  P3: マイナー → 次リリース
```

**チェックリスト**:
- [ ] ベータテスター募集完了
- [ ] UAT 実施完了
- [ ] パフォーマンス計測完了
- [ ] 重大なエラー報告なし確認

---

## Phase 6: 完全リリース (第2-3日)

### Task 6-1: 公開アナウンス

```
対象: エンドユーザー・パートナー
方法:
  - メール
  - SNS
  - App Store / Google Play リリースノート

内容:
  - 新機能紹介 (音声再生・AI採点など)
  - 使い方ガイド
  - FAQ
```

### Task 6-2: アクティブユーザー監視

```
確認項目:
  ✓ DAU (Daily Active Users) 正常値
  ✓ エラーレート < 1%
  ✓ サーバー応答時間 < 500ms
  ✓ リソース使用率 正常範囲
```

### Task 6-3: スケーラビリティ確認

```
トラフィック増加時:
  ✓ オートスケーリング動作
  ✓ データベース接続プール
  ✓ キャッシュ機能
  ✓ CDN キャッシュ戦略
```

**チェックリスト**:
- [ ] 公開アナウンス完了
- [ ] 24時間監視完了 (エラーなし)
- [ ] アクティブユーザー統計確認
- [ ] スケーラビリティ確認完了

---

## トラブルシューティング

### 問題 1: ビルドエラー

**症状**: `npm run build:web` でエラー

**対応**:
```bash
# キャッシュクリア
rm -rf node_modules .expo dist
npm ci

# 再ビルド
npm run build:web

# 詳細ログで確認
npm run build:web -- --verbose
```

### 問題 2: Sentry エラー多発

**症状**: Sentry で大量のエラー通知

**対応**:
```
1. Sentry ダッシュボードで エラー内容確認
2. ブラウザコンソール (F12) で再現確認
3. ホットフィックスまたはロールバック検討
4. ユーザーへのアナウンス
```

### 問題 3: パフォーマンス低下

**症状**: ロード時間が 5秒以上

**対応**:
```bash
# バンドル分析
npx expo-metrics

# ネットワークチェック (DevTools)
# Network タブ → 低速環境シミュレート

# CDN キャッシュ確認
# dist/ の静的ファイル最適化
```

### 問題 4: モバイル版ビルドエラー

**症状**: `npm run build:ios` または `npm run build:android` でエラー

**対応**:
```bash
# EAS ビルドログ確認
eas build:view --status in-progress

# 証明書確認
eas credentials -p ios
eas credentials -p android

# 再試行
npm run build:ios
npm run build:android
```

---

## リスク管理

### 高リスク要因

| 要因 | 確率 | 影響 | 対応 |
|-----|------|------|------|
| API キー漏洩 | 低 | 重大 | 環境変数使用、定期更新 |
| DB 接続失敗 | 低 | 重大 | 接続プール、リトライロジック |
| CDN 障害 | 低 | 中 | 複数CDN併用検討 |

### 中リスク要因

| 要因 | 確率 | 影響 | 対応 |
|-----|------|------|------|
| Sentry API 変更 | 中 | 中 | 定期アップデート監視 |
| モバイルOSアップデート | 中 | 低 | 互換性テスト継続 |
| ユーザー数増加 | 高 | 中 | オートスケーリング設定 |

### 低リスク要因

| 要因 | 確率 | 影響 | 対応 |
|-----|------|------|------|
| マイナーバグ報告 | 高 | 低 | バグ追跡システム |
| UI/UX フィードバック | 高 | 低 | ユーザー調査、改善計画 |

---

## 24時間運用体制

### オンコール体制

```
時間帯: 24時間 (シフト制)
担当: エンジニア 2名 (交替)
連絡先: 緊急メール / 電話

対応時間:
  P0 (システムダウン): 15分以内対応
  P1 (機能障害): 1時間以内対応
  P2 (不具合): 4時間以内対応
```

### 日報システム

```
毎日 09:00 JST に以下を確認・報告:
  - エラー数・パターン
  - パフォーマンス指標
  - ユーザーフィードバック
  - サーバーリソース使用率
```

### エスカレーション計画

```
Level 1: オンコールエンジニア (15分)
Level 2: プロジェクトマネージャー (30分)
Level 3: CTO (1時間)
Level 4: CEO (判断要)
```

---

## チェックリスト (最終確認)

### デプロイ前

- [ ] Sentry API 更新完了
- [ ] Jest 型定義インストール完了
- [ ] TypeScript 型チェック エラー 0
- [ ] Web版ビルド成功
- [ ] 環境変数設定完了

### デプロイ実行中

- [ ] Web版デプロイ完了
- [ ] iOS版ビルド・申請完了
- [ ] Android版ビルド・申請完了
- [ ] 全環境で動作確認完了

### デプロイ後 (24時間)

- [ ] Sentry でエラー 0
- [ ] Google Analytics でアクティブユーザー確認
- [ ] ベータテスター UAT 完了
- [ ] パフォーマンス計測 OK

### 継続運用

- [ ] 24時間監視体制確立
- [ ] オンコール体制稼働
- [ ] 日報システム運用開始
- [ ] ユーザーサポート開始

---

## 予算・リソース

### 必要なツール・サービス

| ツール | 月額 | 用途 |
|-------|------|------|
| Vercel (Pro) | $20 | Web ホスティング |
| Sentry (Business) | $29 | エラートラッキング |
| Uptime Robot | $10 | ダウンタイム監視 |
| Apple Developer | $99/年 | iOS デプロイ |
| Google Play | $25/年 | Android デプロイ |
| **合計** | **$60/月** | |

### 人的リソース

| ロール | 人数 | 時間 |
|-------|------|------|
| デプロイエンジニア | 1 | 6時間 |
| QA テスター | 1 | 4時間 |
| オンコール | 2 | 24時間 |
| サポート | 1 | 4時間 |

---

## 成功指標

デプロイ24時間後に以下が達成できたら成功:

```
✓ Web版: ユーザーアクセス可能
✓ iOS版: App Store リリース
✓ Android版: Google Play リリース
✓ Sentry: エラーレート < 1%
✓ パフォーマンス: ロード時間 < 3秒
✓ DAU: > 100ユーザー (ベータテスター含む)
✓ ユーザーフィードバック: 肯定的評価 > 80%
```

---

**最終チェック**: ✅ すべてのタスク実行可能
**推奨開始日時**: 2026-03-19 17:00 JST
**予想完了日時**: 2026-03-20 12:00 JST

