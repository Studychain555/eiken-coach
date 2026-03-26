# エラーハンドリング クイックリファレンス

EigoMaster の統一的なエラーハンドリング基盤の使用方法をまとめたクイックガイドです。

---

## 📚 目次

1. [基本的な使い方](#基本的な使い方)
2. [エラータイプ一覧](#エラータイプ一覧)
3. [API呼び出しの処理](#api呼び出しの処理)
4. [パフォーマンス計測](#パフォーマンス計測)
5. [環境変数の検証](#環境変数の検証)
6. [トラブルシューティング](#トラブルシューティング)

---

## 基本的な使い方

### シンプルなエラーハンドリング

```typescript
import { globalErrorHandler } from '@/lib/globalErrorHandler';
import { handleError } from '@/lib/errorHandler';

try {
  // 何か処理を実行
  const data = await someAsyncFunction();
} catch (err) {
  // エラーを登録（自動的にユーザーに通知）
  globalErrorHandler.registerError(
    handleError(err, 'MyComponent')
  );
}
```

### リトライ付きエラーハンドリング

```typescript
try {
  const data = await fetchData();
} catch (err) {
  // リトライ可能な場合は自動リトライ
  globalErrorHandler.registerError(
    handleError(err, 'DataFetch'),
    () => fetchData() // リトライ関数を渡す
  );
}
```

### コンテキスト情報付きエラーハンドリング

```typescript
try {
  const response = await fetch(url);
} catch (err) {
  globalErrorHandler.registerError(
    handleError(err, 'NetworkRequest', {
      url,
      method: 'GET',
      timestamp: new Date().toISOString(),
    })
  );
}
```

---

## エラータイプ一覧

### ネットワーク関連

```typescript
ErrorType.NETWORK              // 一般的なネットワークエラー
ErrorType.NETWORK_OFFLINE      // オフライン
ErrorType.NETWORK_TIMEOUT      // タイムアウト
ErrorType.NETWORK_DNS_FAILED   // DNS解決失敗
ErrorType.NETWORK_CONNECTION_RESET  // 接続リセット
ErrorType.NETWORK_CORS         // CORS エラー
```

**使用例**:
```typescript
if (!navigator.onLine) {
  throw new Error(ErrorType.NETWORK_OFFLINE);
}
```

### リソース関連

```typescript
ErrorType.RESOURCE_NOT_FOUND   // リソースが見つからない
ErrorType.RESOURCE_LOAD_FAILED // リソース読み込み失敗
ErrorType.AUDIO_PLAY_FAILED    // 音声再生失敗
ErrorType.IMAGE_LOAD_FAILED    // 画像読み込み失敗
```

**使用例**:
```typescript
<img
  src={url}
  onError={() => {
    globalErrorHandler.registerError(
      handleError(new Error('Image failed to load'), 'ImageComponent')
    );
  }}
/>
```

### 認証関連

```typescript
ErrorType.AUTH_INVALID         // 認証情報が無効
ErrorType.AUTH_UNAUTHORIZED    // 認証が必要
ErrorType.AUTH_SESSION_EXPIRED // セッション期限切れ
ErrorType.AUTH_2FA_FAILED      // 2段階認証失敗
```

**使用例**:
```typescript
if (error.status === 401) {
  globalErrorHandler.registerError(
    handleError(error, 'AuthCheck', {
      action: 'session_check'
    })
  );
  // ログイン画面にリダイレクト
  window.location.href = '/login';
}
```

### DB関連

```typescript
ErrorType.DB_QUERY_FAILED      // クエリ失敗
ErrorType.DB_CONNECTION_FAILED // 接続失敗
ErrorType.DB_RLS_VIOLATION     // RLS ポリシー違反
ErrorType.DB_RATE_LIMIT        // レート制限
```

**使用例**:
```typescript
const { data, error } = await supabase
  .from('table')
  .select();

if (error) {
  if (error.message.includes('permission')) {
    const appError = handleError(error, 'SupabaseQuery');
    appError.type = ErrorType.DB_RLS_VIOLATION;
    globalErrorHandler.registerError(appError);
  }
}
```

### UI関連

```typescript
ErrorType.INVALID_ROUTE        // ルートが見つからない
ErrorType.FORM_VALIDATION_FAILED  // フォーム入力エラー
ErrorType.STATE_SYNC_FAILED    // 状態同期失敗
```

---

## API呼び出しの処理

### パフォーマンス計測付き

```typescript
import { performanceMonitor } from '@/lib/performanceMonitor';

const data = await performanceMonitor.measureAPICall(
  async () => {
    const response = await fetch('/api/data');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  },
  '/api/data',  // エンドポイント名
  false         // キャッシュ済みか
);
```

### 自動リトライ付き

```typescript
import { withRetry } from '@/lib/errorHandler';

const data = await withRetry(
  async () => {
    const response = await fetch('/api/data');
    return response.json();
  },
  {
    maxAttempts: 3,           // 最大試行回数
    delayMs: 1000,           // 初期待機時間
    backoffMultiplier: 2,    // 指数バックオフの乗数
    tag: 'DataFetch'
  }
);
```

### エラーハンドリング付き

```typescript
import { withErrorHandling } from '@/lib/errorHandler';

const { success, data, error } = await withErrorHandling(
  fetch('/api/data').then(r => r.json()),
  'DataFetch'
);

if (!success) {
  console.error('API error:', error.message);
  globalErrorHandler.registerError(error);
}
```

---

## パフォーマンス計測

### Core Web Vitals の取得

```typescript
import { performanceMonitor } from '@/lib/performanceMonitor';

// 現在のメトリクスを取得
const metrics = performanceMonitor.getMetrics();
console.log('LCP:', metrics.webVitals.LCP);
console.log('FID:', metrics.webVitals.FID);
console.log('CLS:', metrics.webVitals.CLS);
```

### ベースラインの設定と比較

```typescript
// 改善前にベースラインを設定
performanceMonitor.setBaseline();

// 改善を実施...

// 改善後と比較
const comparison = performanceMonitor.compareWithBaseline();
console.log('LCP improved:', comparison.improved.LCP);
console.log('LCP change:', comparison.changes.LCP.change);
```

### API統計の取得

```typescript
const stats = performanceMonitor.getAPIStatistics();
console.log('Total calls:', stats.totalCalls);
console.log('Success rate:', stats.successRate + '%');
console.log('Average duration:', stats.averageDuration + 'ms');
console.log('Slowest endpoints:', stats.slowestEndpoints);
```

---

## 環境変数の検証

### ビルド時チェック

```bash
# ビルド前に環境変数をチェック
npx ts-node scripts/diagnose-production-errors.ts
```

**出力例**:
```
✅ 環境変数チェック成功
✅ Supabase設定 OK
⚠️  Sentry DSN 未設定（オプション）
```

### ランタイムチェック

```typescript
import { checkEnvironmentVariablesAtRuntime } from '@/lib/envValidator';

const { valid, errors } = checkEnvironmentVariablesAtRuntime();
if (!valid) {
  console.error('Missing environment variables:', errors);
  // 機能を制限するか、ユーザーに通知
}
```

### 個別の環境変数取得

```typescript
import { getEnvVar } from '@/lib/envValidator';

const supabaseUrl = getEnvVar(
  'EXPO_PUBLIC_SUPABASE_URL',
  'http://localhost:3000', // デフォルト値
  {
    validate: (value) => value.includes('supabase.co'),
    throwOnError: true
  }
);
```

---

## エラーログの閲覧

### ストアされたログを取得

```typescript
import { errorLogger } from '@/lib/errorLogger';

// 過去1時間のすべてのエラーログ
const logs = errorLogger.getStoredLogs({
  sinceMs: 3600000 // 1時間 = 3600000ms
});

// 特定のエラータイプのみ
const networkErrors = errorLogger.getStoredLogs({
  type: ErrorType.NETWORK_TIMEOUT
});

// 特定ページのエラー
const pageErrors = errorLogger.getStoredLogs({
  page: '/listening'
});
```

### メトリクスの集計

```typescript
// 過去1時間の統計
const summary = errorLogger.getMetricsSummary({
  hours: 1
});

console.log('Total errors:', summary.totalErrors);
console.log('By type:', summary.byType);
console.log('By page:', summary.byPage);
console.log('By status code:', summary.byStatus);
```

### ログのエクスポート

```typescript
const exported = errorLogger.exportLogs();
console.log('Recent logs:', exported.logs);
console.log('Summary:', exported.summary);

// JSONとして保存
const json = JSON.stringify(exported, null, 2);
localStorage.setItem('error_logs_backup', json);
```

---

## トラブルシューティング

### Q: エラー通知が表示されない

**原因**: useAppStore が適切に初期化されていない

**解決**:
```typescript
import { useAppStore } from '@/stores/appStore';

// アプリケーションのルートで初期化
export default function App() {
  // useAppStore が自動初期化される
  return <RootNavigator />;
}
```

### Q: Sentry に送信されない

**原因**: EXPO_PUBLIC_SENTRY_DSN が設定されていない

**解決**:
```bash
# .env.production に追加
EXPO_PUBLIC_SENTRY_DSN=https://xxxxx@sentry.io/12345
```

### Q: リトライが実行されない

**原因**: エラーがリトライ不可として判定された

**確認**:
```typescript
// エラータイプを確認
console.log('Error type:', error.type);
console.log('Status code:', error.statusCode);

// 以下は自動リトライされない
// - PERMISSION, VALIDATION, NOT_FOUND エラータイプ
// - 4xx ステータスコード（400-499）
```

### Q: パフォーマンス計測が0

**原因**: ブラウザが Performance API をサポートしていない

**確認**:
```typescript
if (typeof performance === 'undefined') {
  console.warn('Performance API not supported');
}
```

---

## ベストプラクティス

### 1. エラーコンテキストを常に付与

```typescript
// ❌ 良くない
globalErrorHandler.registerError(error);

// ✅ 良い
globalErrorHandler.registerError(
  handleError(error, 'MyComponent', {
    action: 'fetch_data',
    url: '/api/data',
    userId: currentUser?.id
  })
);
```

### 2. リトライ関数は純粋に

```typescript
// ❌ 良くない
globalErrorHandler.registerError(
  error,
  async () => {
    // 外部依存がある
    const newConfig = getConfig();
    return fetchData(newConfig);
  }
);

// ✅ 良い
globalErrorHandler.registerError(
  error,
  () => fetchData(config) // 単純な再実行
);
```

### 3. 重要なエラーはログに記録

```typescript
// 重要なエラーはログを明示的に
import { errorLogger } from '@/lib/errorLogger';

try {
  // 重要な処理
} catch (error) {
  await errorLogger.logError(
    handleError(error, 'CriticalOperation'),
    {
      userId: currentUser?.id,
      action: 'critical_operation'
    },
    'critical'
  );
}
```

### 4. ユーザーにはわかりやすいメッセージ

```typescript
// エラーメッセージは自動的に日本語化される
import { getErrorMessage } from '@/constants/errorMessages';

const msg = getErrorMessage(error.type);
console.log(msg.title);        // "ネットワーク接続エラー"
console.log(msg.description);  // "インターネット接続を確認してください。"
```

---

## 関連ドキュメント

- `PHASE_0_1_SUMMARY.md` - 実装の詳細説明
- `ERROR_DIAGNOSIS_REPORT.md` - 本番環境診断結果
- `src/lib/globalErrorHandler.ts` - ソースコード（JSDoc付き）
- `src/lib/errorLogger.ts` - ログ管理のソース
- `src/lib/performanceMonitor.ts` - パフォーマンス計測のソース

---

**最終更新**: 2026年3月27日
**バージョン**: 1.0
