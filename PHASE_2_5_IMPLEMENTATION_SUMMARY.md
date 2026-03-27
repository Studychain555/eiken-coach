# フェーズ 2-5 実装報告書

## 概要
EigoMaster アプリケーションのネットワーク・リトライ・DB層の完全最適化を実装しました。フェーズ 2（ネットワーク・リトライ強化）とフェーズ 5（DB・キャッシュ層最適化）の両方が完成しました。

**実装日**: 2026-03-27
**ビルド結果**: ✅ 成功（exit code 0）

---

## フェーズ 2：ネットワーク・リトライ強化

### 2-1: 動的タイムアウト設定
**ファイル**: `/Users/80dr/eigomaster/src/lib/apiClient.ts`

**実装内容**:
- Connection API によるネットワークタイプ検出（5G/4G/3G/2G/WiFi）
- ネットワーク品質に応じた自動タイムアウト調整
  - 5G: 5秒
  - 4G: 10秒
  - 3G: 20秒
  - 2G/低速: 30秒
- リクエストインターセプターで動的タイムアウト設定
- ネットワーク変更イベントのリアルタイム監視

**コード例**:
```typescript
const client = getApiClient({ useDynamicTimeout: true });
// ネットワーク品質に応じてタイムアウトが自動調整される
const data = await client.get('/api/data');
```

---

### 2-2: スマートリトライロジック
**ファイル**: `/Users/80dr/eigomaster/src/lib/apiErrorHandler.ts`

**実装内容**:
- エラータイプ別のリトライ可能判定
- リトライ不可能なエラー（認証失敗、バリデーション失敗など）の即座判定
- 指数バックオフ計算（1秒, 2秒, 4秒, 8秒...）
- ジッター追加で、サーバー負荷を分散
- SmartRetryHandler クラスで統一的なリトライ管理

**コード例**:
```typescript
const handler = getSmartRetryHandler();
const result = await handler.executeWithRetry(
  () => fetchData(),
  3, // maxAttempts
  { url: '/api/data', method: 'GET' }
);
```

**リトライ対象エラー**:
- HTTP 500, 502, 503, 504（サーバーエラー）
- HTTP 408（タイムアウト）
- HTTP 429（レート制限）
- ネットワークエラー

**リトライ不対象エラー**:
- HTTP 400, 401, 403（クライアントエラー）
- バリデーション失敗
- 権限エラー

---

### 2-3: リクエストキューイング
**ファイル**: `/Users/80dr/eigomaster/src/lib/requestQueue.ts` (新規)

**実装内容**:
- 並行リクエスト数制限（デフォルト5件同時）
- 優先度ベースの実行順序（高/普通/低）
- リクエストキャンセル機構
- キュー統計情報（待機時間、完了率、失敗率）

**機能**:
```typescript
const queue = getRequestQueue();

// 高優先度リクエストを追加
const data = await queue.enqueue(
  () => fetchCriticalData(),
  'high',
  { url: '/api/critical', userId: 'user123' }
);

// 統計情報を取得
const stats = queue.getStats();
console.log(stats.averageWaitTime); // 平均待機時間
```

**統計情報**:
- totalRequests: 総リクエスト数
- activeRequests: 実行中のリクエスト数
- queuedRequests: キュー待機中のリクエスト数
- completedRequests: 完了したリクエスト数
- failedRequests: 失敗したリクエスト数
- averageWaitTime: 平均待機時間

---

### 2-4: ネットワーク品質検出
**ファイル**: `/Users/80dr/eigomaster/src/hooks/useNetworkQuality.ts` (新規)

**実装内容**:
- Connection API でリアルタイムネットワーク品質を監視
- データセーバーモード検出
- レイテンシ・帯域幅測定

**フック**:
```typescript
export function useNetworkQuality(): NetworkQuality {
  type: '5g' | '4g' | '3g' | '2g' | 'unknown';
  isSlowNetwork: boolean;
  bandwidth: number; // Mbps
  latency: number; // ms
  saveData: boolean;
  effectiveType: string;
}

// 使用例
const quality = useNetworkQuality();
const isSlowNetwork = useIsSlowNetwork();
const networkType = useNetworkType();
```

---

### 2-5: オフラインモード・ローカルキャッシュ
**ファイル**: `/Users/80dr/eigomaster/src/lib/offlineStore.ts` (新規)

**実装内容**:
- IndexedDB によるローカルデータ保存
- TTL ベースの自動期限切れ
- オフライン時の同期キューイング
- 再接続時の自動同期

**機能**:
```typescript
const store = getOfflineStore();

// データをキャッシュに保存
await store.cacheData('questions', questionsData, 24 * 60 * 60 * 1000);

// キャッシュから取得
const cached = await store.getCachedData('questions');

// オフラインで記録したデータ
await store.recordOfflineAction('user:answers', answerData, 'create');

// 再接続時に同期
await store.syncPendingData();

// ステータス確認
console.log(store.getOnlineStatus()); // true/false
console.log(store.getPendingSyncCount()); // 未同期数
```

**ストレージ構成**:
- `cache`: 一般的なキャッシュデータ
- `questions`: 質問データ
- `userProgress`: ユーザープログレス
- `syncQueue`: 未同期データ（オフライン時の記録）

---

## フェーズ 5：DB・キャッシュ層最適化

### 5-1: Supabase エラーハンドリング強化
**ファイル**: `/Users/80dr/eigomaster/src/lib/secureSupabase.ts` (拡張)

**実装内容**:
- Supabase 固有エラーの分類
- RLS ポリシー違反（PGRST116）の検出
- エラーメッセージの自動生成
- globalErrorHandler への自動登録

**SupabaseErrorHandler クラス**:
```typescript
SupabaseErrorHandler.classifyError(error); // ErrorType を判定
SupabaseErrorHandler.getErrorMessage(error); // ユーザー向けメッセージを生成
SupabaseErrorHandler.registerError(error, retryFn, context); // globalErrorHandler に登録
```

**エラー分類**:
- PGRST116 / 403 → PERMISSION（権限エラー）
- 401 / PGRST301 → AUTH_UNAUTHORIZED（認証エラー）
- 404 / PGRST116 → NOT_FOUND（見つからない）
- 503 / Failed to fetch → NETWORK（ネットワークエラー）
- 408 / timeout → TIMEOUT（タイムアウト）
- 500+ → DB_QUERY_FAILED（データベースエラー）

---

### 5-2: キャッシュ戦略最適化
**ファイル**: `/Users/80dr/eigomaster/src/lib/apiCache.ts` (拡張)

**実装内容**:
- メモリサイズ制限（50MB）
- エントリ数制限（最大150個）
- LRU（Least Recently Used）アルゴリズムによる自動削除
- キャッシュヒット率の追跡
- 詳細なメモリ使用量計測

**キャッシュ統計**:
```typescript
const stats = useApiCache.getState().getStats();
// {
//   size: 45,                    // エントリ数
//   keys: [...],                 // キー一覧
//   memorySize: "12.45 MB",      // メモリ使用量
//   hitRate: 78.5                // ヒット率（％）
// }
```

**LRU 削除戦略**:
1. メモリが 50MB を超えた場合、最もアクセスされていないエントリを削除
2. エントリ数が 150 を超えた場合も同様に削除
3. TTL 期限切れのエントリは自動削除

---

### 5-3: スキーマバリデーション
**ファイル**: `/Users/80dr/eigomaster/src/lib/validation.ts` (新規)

**実装内容**:
- Zod を使用したスキーマ定義
- API レスポンスのバリデーション
- 予期しないデータ型の検出
- バリデーション失敗時の詳細ログ

**定義されたスキーマ**:
- `listeningQuestion` / `listeningQuestions`: リスニング問題
- `userProgress` / `userProgressList`: ユーザープログレス
- `listeningScore`: スコア情報
- `userProfile`: ユーザープロフィール
- `vocabularyWord` / `vocabularyWords`: 単語
- `writingTask`: ライティング課題

**使用例**:
```typescript
const validatedData = await validateResponse(
  apiResponse,
  schemas.listeningQuestions
);

// バリデーション失敗時は globalErrorHandler に登録される
```

---

### 5-4: トランザクションエラーハンドリング
**ファイル**: `/Users/80dr/eigomaster/src/lib/secureSupabase.ts` (拡張)

**実装内容**:
- 複数テーブルの一括更新
- 失敗時の自動ロールバック
- トランザクション失敗時のユーザー通知

**関数**:
```typescript
const success = await executeTransaction([
  () => updateUserProfile(userId, profile),
  () => recordUserStats(userId, stats),
  () => createUserLog(userId, 'updated'),
]);

if (!success) {
  // エラーハンドリング（自動で globalErrorHandler に登録）
}
```

---

### 5-5: RLS ポリシー違反検出
**ファイル**: `/Users/80dr/eigomaster/src/lib/authGuard.ts` (新規)

**実装内容**:
- ユーザーの権限を事前チェック
- RLS ポリシー違反を防止
- リソースアクセス権限の検証
- ロール別デフォルト権限管理

**AuthGuard クラス**:
```typescript
const guard = getAuthGuard();

// 権限をチェック
const canUpdate = await guard.checkAuthorizationBeforeQuery(
  userId,
  'assignments',
  'update'
);

// RLS ポリシー違反をチェック
const rlsValid = await guard.checkRLSPolicy(
  userId,
  'assignments',
  assignmentId,
  'update'
);

// ミドルウェア形式
const result = await withAuthCheck(
  userId,
  'assignments',
  'delete',
  () => deleteAssignment(assignmentId)
);
```

**ロール別権限**:
- **admin**: すべてのリソースに対する全権限
- **teacher**: クラス、学生、課題の読み書き
- **student**: 課題の閲覧、提出の作成・読み取り、プロフィール編集

---

## ビルド結果

```
✅ Web Build: SUCCESS
- Static routes: 22
- Total size: ~2.69 MB
- Build time: ~1.5 分

Output:
  _expo/static/js/web/entry-7234701ea28fe12944562b3a648889d8.js (2.69 MB)
  All 22 routes exported successfully
  GitHub Pages subpath修正完了
```

---

## ファイル一覧（新規作成・拡張）

### 新規作成ファイル（5個）
1. `/Users/80dr/eigomaster/src/lib/requestQueue.ts` - リクエストキューイング
2. `/Users/80dr/eigomaster/src/hooks/useNetworkQuality.ts` - ネットワーク品質検出
3. `/Users/80dr/eigomaster/src/lib/offlineStore.ts` - オフラインストア
4. `/Users/80dr/eigomaster/src/lib/validation.ts` - スキーマバリデーション
5. `/Users/80dr/eigomaster/src/lib/authGuard.ts` - RLS ポリシー違反検出

### 拡張ファイル（3個）
1. `/Users/80dr/eigomaster/src/lib/apiClient.ts` - 動的タイムアウト対応
2. `/Users/80dr/eigomaster/src/lib/apiErrorHandler.ts` - スマートリトライ追加
3. `/Users/80dr/eigomaster/src/lib/secureSupabase.ts` - エラーハンドリング・トランザクション追加
4. `/Users/80dr/eigomaster/src/lib/apiCache.ts` - メモリ最適化（LRU、メモリ制限）

---

## 主要な改善点

### パフォーマンス
- ✅ 動的タイムアウトで低速ネットワーク対応（Slow 3G で 30秒対応）
- ✅ リクエストキューイングで並行数制限（同時 5 リクエスト）
- ✅ LRU キャッシュで メモリ制限（50MB）
- ✅ オフラインモード対応（IndexedDB）

### 信頼性
- ✅ スマートリトライで失敗リクエスト自動復旧
- ✅ スキーマバリデーション で データ破損防止
- ✅ トランザクション管理で一貫性保証
- ✅ RLS ポリシー検証で権限エラー防止

### 開発者体験
- ✅ globalErrorHandler との統一的なエラー管理
- ✅ debugError による詳細なログ出力
- ✅ 統計情報取得で デバッグが容易
- ✅ TypeScript での型安全性

---

## 次のステップ

### 推奨される並行実装
- フェーズ 3: UI パーツ実装（リスニングUI, ライティング UI など）
- フェーズ 4: ページ実装（各画面での実装）

### 今後の最適化機会
1. Service Worker による フルオフライン対応
2. Compression による キャッシュ圧縮
3. Web Workers での 重処理オフロード
4. GraphQL による クエリ最適化

---

## 関連ドキュメント
- `/Users/80dr/eigomaster/CLAUDE.md` - レスポンシブ設計ガイドライン
- `/Users/80dr/eigomaster/PERFORMANCE_METRICS_BEFORE_AFTER.md` - パフォーマンス測定

---

**実装者**: Claude Code
**実装完了日**: 2026-03-27
**ステータス**: ✅ 完成
