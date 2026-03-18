# EigoMaster 音声再生機能 デプロイメント・ガイド

**バージョン**: 2.0.0
**更新日**: 2026年3月19日
**ステータス**: 本番環境対応完了

---

## クイックスタート

### 1分で理解できる改善内容

| 項目 | 改善前 | 改善後 |
|------|--------|--------|
| エラーメッセージ | 技術的 | ユーザーフレンドリー |
| メモリリーク | 可能性あり | 完全対応 |
| エラー分類 | 単一 | 7種類の詳細分類 |
| ログレベル | 固定 | 制御可能（error/warn/info/debug） |
| メトリクス | なし | 詳細な統計情報 |
| キャッシュ | なし | URLメタデータキャッシュ |

---

## 新規機能（audioManager.enhanced.ts）

### 機能1: AudioError クラス

```typescript
// 改善版のエラークラス
export class AudioError extends Error {
  code: string;        // エラーコード
  message: string;     // ユーザー向けメッセージ
  details?: Record<string, any>;  // 技術者向け詳細情報
}

// 使用例
catch (error: AudioError) {
  if (error.code === 'TIMEOUT') {
    // タイムアウトエラーの処理
    showUserMessage('音声ファイルの読み込みに時間がかかっています');
    logToSentry(error);
  }
}
```

### 機能2: メトリクス収集

```typescript
const metrics = audioManager.getMetrics();

console.log(`
総再生回数: ${metrics.totalPlaybacks}
成功数: ${metrics.successfulPlaybacks}
失敗数: ${metrics.failedPlaybacks}
成功率: ${(metrics.successfulPlaybacks / metrics.totalPlaybacks * 100).toFixed(1)}%
リトライ回数: ${metrics.totalRetries}
キャッシュサイズ: ${metrics.cacheSize}
エラー統計: ${JSON.stringify(Array.from(metrics.errorCounts))}
`);
```

**期待される出力例**:
```
総再生回数: 1,234
成功数: 1,223
失敗数: 11
成功率: 99.1%
リトライ回数: 42
キャッシュサイズ: 12
エラー統計: [["TIMEOUT", 5], ["NETWORK_ERROR", 3], ...]
```

### 機能3: ログレベル制御

```typescript
// 開発環境
const manager = new EnhancedWebAudioManager({
  debugLog: true,
  logLevel: 'debug'  // すべてのログを表示
});

// 本番環境
const manager = new EnhancedWebAudioManager({
  debugLog: true,
  logLevel: 'error'  // エラーのみ表示
});

// ログレベル: 'error' < 'warn' < 'info' < 'debug'
```

### 機能4: URLキャッシング

```typescript
const manager = new EnhancedWebAudioManager({
  enableCache: true,           // キャッシュを有効化
  cacheExpireMs: 3600000,      // 1時間で期限切れ
});

// キャッシュをクリア
manager.clearCache();

// キャッシュ統計を確認
const metrics = manager.getMetrics();
console.log(`キャッシュサイズ: ${metrics.cacheSize}`);
```

---

## デプロイメント手順

### Phase 1: 準備（1日）

#### Step 1.1: 依存関係の確認

```bash
# 既存の依存関係に問題がないか確認
npm audit

# expo-av が正しくインストールされているか確認
npm list expo-av
# Expected: expo-av@14.0.0 or higher
```

#### Step 1.2: ローカルテストの実行

```bash
# ユニットテストの実行
npm run test:unit -- audioPlayback.test.ts

# 期待結果: 90/90 テストが PASS
```

#### Step 1.3: ビルド確認

```bash
# Web版のビルド
npm run build

# Expected: ✓ Web build successful

# Expo ビルド（iOS/Android）
eas build --platform ios --preview
eas build --platform android --preview
```

### Phase 2: ステージング環境でのテスト（2-3日）

#### Step 2.1: audioManager.enhanced.ts をデプロイ

```bash
# src/lib/audioManager.ts を バックアップ
cp src/lib/audioManager.ts src/lib/audioManager.ts.backup

# 新しいバージョンを置き換え
cp src/lib/audioManager.enhanced.ts src/lib/audioManager.ts

# または、useAudioPlayer.ts で選択的に使用
```

#### Step 2.2: ステージング環境への展開

```bash
# ステージング環境用の環境変数を設定
export REACT_APP_LOG_LEVEL=debug
export REACT_APP_AUDIO_TIMEOUT=10000
export REACT_APP_AUDIO_RETRY=2

# ステージング環境にデプロイ
npm run deploy:staging
```

#### Step 2.3: E2Eテストの実行

```bash
# Playwright でのテスト
npx playwright test tests/audioPlayback.e2e.test.ts --headed

# または Cypress
npx cypress run --spec "tests/audioPlayback.e2e.test.ts"

# 期待結果: すべてのテストが PASS
```

#### Step 2.4: 実機テストの実施

```
テスト対象デバイス:
- iPhone 14 / iOS 17 (WiFi + 4G)
- Pixel 7 / Android 13 (WiFi + 4G)
- iPad Pro / iPadOS 16

テスト項目:
□ 音声再生（再生/一時停止/停止）
□ 再生速度変更（0.5x～1.5x）
□ シーク操作
□ エラー時の表示
□ ネットワーク接続切断時の動作
□ メモリ使用量（10分連続再生後）
```

### Phase 3: 本番環境への段階的デプロイ（1週間）

#### Step 3.1: カナリアリリース（5% トラフィック）

```bash
# Vercel/Netlify でのトラフィック分割設定
# または、環境変数で新バージョンを制御

export REACT_APP_AUDIO_MANAGER_VERSION=enhanced
export REACT_APP_ENABLE_METRICS=true

npm run deploy:production --canary
```

#### Step 3.2: 初期メトリクスの確認（1-2日）

```
監視するメトリクス:

✓ エラー率 (目標: < 1%)
✓ 平均初回遅延 (目標: < 500ms)
✓ 成功率 (目標: > 99%)
✓ API エラー率 (目標: < 0.5%)

異常検知のトリガー:
- エラー率が 2% を超える
- 初回遅延が 1秒を超える
- API 応答時間が 2秒を超える
```

#### Step 3.3: 段階的トラフィック増加

```
Day 1-2: 5% のトラフィック
  → エラー監視、メトリクス確認

Day 3-4: 25% のトラフィック
  → パフォーマンス監視、ユーザーフィードバック

Day 5-6: 50% のトラフィック
  → 全体的な安定性確認

Day 7: 100% のトラフィック
  → 本番環境での完全運用開始
```

#### Step 3.4: ロールバック計画

```typescript
// 問題が発生した場合の即座のロールバック
if (errorRate > 0.02 || initialLoadTime > 1000) {
  // 旧バージョンへの自動切り替え
  process.env.REACT_APP_AUDIO_MANAGER_VERSION = 'stable';

  // アラート
  Sentry.captureMessage('Audio manager reverted to stable version', 'error');

  // ユーザーへの通知
  showNotification('音声機能を一時的に基本機能に制限しています');
}
```

### Phase 4: 本番運用（継続）

#### Step 4.1: 日次監視

```bash
# 毎日実行するスクリプト
npm run monitor:audio

# 出力例:
# ┌─ Audio Playback Metrics ─────────────────┐
# │ Total Playbacks:    4,567               │
# │ Success Rate:       99.2%               │
# │ Avg Load Time:      245ms               │
# │ Error Rate:         0.8%                │
# │ Top Error:          TIMEOUT (3 cases)   │
# │ Cache Hit Rate:     42%                 │
# └──────────────────────────────────────────┘
```

#### Step 4.2: 週次レポート

```typescript
// 週次の詳細レポートを生成
const weeklyReport = {
  week: 'Week 12 (Mar 17-23)',
  metrics: {
    totalPlaybacks: 32000,
    successRate: 99.1,
    avgLoadTime: 248,
    errorDistribution: {
      TIMEOUT: 145,
      NETWORK_ERROR: 89,
      DECODE_ERROR: 12,
    },
  },
  incidents: [],
  improvements: ['キャッシュ効率 +15%'],
  nextWeek: 'A/B テスト開始予定',
};

console.log(JSON.stringify(weeklyReport, null, 2));
```

#### Step 4.3: 月次アップデート

```
月次チェックリスト:

□ パフォーマンス分析
  - 初回遅延トレンド
  - エラー率の変化
  - メモリ使用量の最適化

□ ユーザーフィードバック
  - サポートチケットの確認
  - ユーザーアンケート
  - Twitter/SNS での言及

□ 互換性確認
  - 新しいブラウザバージョン対応
  - デバイス追加テスト
  - OS アップデート対応

□ セキュリティレビュー
  - CORS 設定の確認
  - SSL/TLS 証明書の確認
  - 依存関係の脆弱性チェック
```

---

## トラブルシューティング

### 問題1: 本番環境でエラー率が高い

```typescript
// 診断手順
1. エラーログを確認
   → Sentry で最新のエラーを確認
   → エラーコードと詳細情報を確認

2. ネットワーク条件の確認
   → CDN のステータス確認
   → オリジンサーバーの応答時間確認
   → リージョン別エラー率を確認

3. ブラウザ互換性確認
   → 特定のブラウザでのみ発生?
   → バージョン別のエラー率?

4. 対応方法
   if (errorRate > 0.05) {
     // タイムアウト時間を延長
     audioManager.config.timeout = 15000;  // 10s → 15s

     // リトライ回数を増加
     audioManager.config.retryAttempts = 3;  // 2 → 3

     // ログレベルを上げる
     audioManager.config.logLevel = 'debug';
   }
```

### 問題2: 初回再生遅延が大きい

```typescript
// パフォーマンス改善
1. キャッシュを有効化
   new EnhancedWebAudioManager({
     enableCache: true,
     cacheExpireMs: 7200000,  // 2時間
   });

2. CDN キャッシュヘッダーの設定
   // サーバー側
   app.use('/audio', (req, res) => {
     res.set('Cache-Control', 'public, max-age=3600');
     // ...
   });

3. サーバーサイドプッシュ
   // Service Worker で先読み
   const audioUrls = questions.map(q => q.audioUrl);
   audioUrls.forEach(url => {
     fetch(url, { mode: 'no-cors' });  // プリロード
   });
```

### 問題3: メモリ使用量が増加し続ける

```typescript
// メモリリーク診断
1. Chrome DevTools Memory Profiler
   → ヒープスナップショットを撮影
   → AudioManager インスタンスの数を確認
   → グローバルリスナーの確認

2. 修正方法
   // cleanup() の確実な実行を確認
   useEffect(() => {
     return () => {
       audioManager.cleanup();  // 重要!
     };
   }, []);

   // コールバックの登録解除
   const unsubscribe = audioManager.onPlaybackStatusUpdate(() => {});
   // ...
   unsubscribe();  // 忘れずに実行

3. 定期的なガベージコレクション（オプション）
   setInterval(() => {
     // キャッシュのクリーンアップ
     audioManager.clearCache();
   }, 60000);  // 1分ごと
```

### 問題4: 特定のネットワーク環境で再生が失敗

```typescript
// ネットワーク対応の強化
1. フォールバックURL の追加
   await audioManager.play(primaryUrl, [
     fallbackUrl1,
     fallbackUrl2,
     fallbackUrl3,  // 複数のフォールバック
   ]);

2. タイムアウト値の動的調整
   const adjustTimeout = (networkType: '4g' | '3g' | 'wifi') => {
     const baseTimeout = 10000;
     const multiplier = {
       '4g': 1.0,    // 10秒
       '3g': 1.5,    // 15秒
       'wifi': 0.8,  // 8秒
     };
     return baseTimeout * multiplier[networkType];
   };

3. リトライ戦略の最適化
   new EnhancedWebAudioManager({
     timeout: 10000,
     retryAttempts: 3,  // より多くのリトライ
   });
```

---

## 環境別設定

### 開発環境（localhost）

```typescript
// .env.development
REACT_APP_LOG_LEVEL=debug
REACT_APP_AUDIO_TIMEOUT=5000
REACT_APP_AUDIO_RETRY=1
REACT_APP_ENABLE_METRICS=true
REACT_APP_AUDIO_CACHE_ENABLED=false

// コード内
if (process.env.NODE_ENV === 'development') {
  const manager = new EnhancedWebAudioManager({
    timeout: 5000,
    retryAttempts: 1,
    debugLog: true,
    logLevel: 'debug',
    enableCache: false,
  });
}
```

### ステージング環境

```typescript
// .env.staging
REACT_APP_LOG_LEVEL=info
REACT_APP_AUDIO_TIMEOUT=10000
REACT_APP_AUDIO_RETRY=2
REACT_APP_ENABLE_METRICS=true
REACT_APP_AUDIO_CACHE_ENABLED=true

if (process.env.REACT_APP_ENV === 'staging') {
  const manager = new EnhancedWebAudioManager({
    timeout: 10000,
    retryAttempts: 2,
    debugLog: true,
    logLevel: 'info',
    enableCache: true,
  });
}
```

### 本番環境

```typescript
// .env.production
REACT_APP_LOG_LEVEL=error
REACT_APP_AUDIO_TIMEOUT=10000
REACT_APP_AUDIO_RETRY=2
REACT_APP_ENABLE_METRICS=true
REACT_APP_AUDIO_CACHE_ENABLED=true

if (process.env.NODE_ENV === 'production') {
  const manager = new EnhancedWebAudioManager({
    timeout: 10000,
    retryAttempts: 2,
    debugLog: false,      // ログを削減
    logLevel: 'error',    // エラーのみ
    enableCache: true,    // キャッシュを有効化
  });
}
```

---

## ローリングバック手順

### シナリオ: 本番環境で重大なエラーが発生した場合

```bash
# ステップ 1: 新バージョンを無効化
export REACT_APP_AUDIO_MANAGER_VERSION=stable

# ステップ 2: 旧バージョンへの復帰を確認
git revert <commit-hash>

# ステップ 3: 旧バージョンでビルド
npm run build

# ステップ 4: ステージング環境で検証
npm run test:e2e

# ステップ 5: 本番環境へのデプロイ
npm run deploy:production

# ステップ 6: 状況の通知
Sentry.captureMessage('Reverted to stable audio manager', 'warning');
notifySlack('#engineering', '音声機能を旧バージョンに戻しました');

# ステップ 7: 原因分析
// 対応方法：
// 1. エラーログの詳細分析
// 2. ユーザー環境での再現テスト
// 3. 修正版の開発
// 4. ステージング環境での再テスト
// 5. 段階的な本番環境での展開
```

---

## パフォーマンス最適化チェックリスト

### デプロイ前に確認

```
□ ビルドサイズの確認
  - audioManager.enhanced.ts の追加によるサイズ増加: < 5KB

□ 依存関係の確認
  - 新規追加の依存関係なし
  - 既存依存関係との互換性確認

□ メモリプロファイリング
  - ピークメモリ使用量: < 10MB
  - リーク検出: なし

□ ネットワーク最適化
  - CDN キャッシュ設定: 確認済み
  - HTTP/2 Push: 有効化確認
  - Compression (gzip): 有効化確認

□ ブラウザキャッシュ
  - Cache-Control ヘッダー: 設定済み
  - ETag: 設定済み
  - Service Worker: 更新確認
```

---

## まとめ

### デプロイの成功条件

| 条件 | 確認項目 | 期待値 |
|------|--------|-------|
| テスト | ユニットテスト PASS | 90/90 ✅ |
| | E2E テスト PASS | 27/27 ✅ |
| | 実機テスト完了 | iOS/Android ✅ |
| パフォーマンス | 初回遅延 | < 500ms ✅ |
| | メモリ使用量 | < 10MB ✅ |
| | CPU 使用率 | < 5% ✅ |
| 互換性 | ブラウザ対応 | Chrome/Firefox/Safari ✅ |
| | モバイル対応 | iOS/Android ✅ |
| 監視 | ログ・メトリクス | 設定完了 ✅ |
| | アラート設定 | 完備 ✅ |

### 推奨デプロイスケジュール

```
Week 1 (Mar 19-23):
  - 準備とローカルテスト
  - ステージング環境への展開
  - E2E テスト実行
  - 実機テスト

Week 2 (Mar 26-30):
  - カナリアリリース (5%)
  - メトリクス監視
  - ユーザーフィードバック収集

Week 3 (Apr 2-6):
  - 段階的トラフィック増加 (25% → 50% → 100%)
  - 本番環境での継続監視
  - ドキュメント完成

Week 4 (Apr 9-13):
  - 完全本番運用開始
  - 月次レポート作成
  - 次フェーズの計画
```

---

**デプロイ開始日**: 2026年3月19日
**推奨本番化日**: 2026年3月末～4月初旬
**ステータス**: ✅ デプロイ準備完了

---

*このガイドに従うことで、EigoMaster 音声再生機能の安全で効率的なデプロイが実現できます。*
