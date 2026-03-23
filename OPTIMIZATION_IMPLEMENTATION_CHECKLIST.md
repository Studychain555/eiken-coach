# EigoMaster パフォーマンス最適化 - 実装チェックリスト

**開始日**: 2026-03-19
**対象**: 全5領域（バンドル、ネットワーク、レンダリング、DB、メモリ）

---

## 新規実装ファイル一覧

### Phase 1: コア最適化モジュール（実装完了）

| ファイル | 目的 | 状態 | 優先度 |
|---------|------|------|-------|
| `/src/lib/apiCache.ts` | API キャッシング（TTL ベース） | ✅ | 最高 |
| `/src/lib/apiClient.ts` | 最適化 API クライアント（リトライ、バッチ化） | ✅ | 最高 |
| `/src/lib/memoryManager.ts` | メモリ監視・リーク検出 | ✅ | 高 |
| `/src/lib/performanceMonitoring.ts` | パフォーマンス計測・レポート | ✅ | 高 |
| `/src/components/OptimizedQuestionCard.tsx` | メモ化カード（memo, useMemo, useCallback） | ✅ | 高 |
| `/src/components/VirtualizedQuestionList.tsx` | 仮想スクロール対応リスト | ✅ | 高 |
| `PERFORMANCE_OPTIMIZATION_GUIDE.md` | 実装ガイド（詳細説明） | ✅ | 参考 |

---

## Phase 1: バンドルサイズ削減

### 1.1 依存関係の最適化

- [ ] **未使用パッケージの削除検査**
  ```bash
  npm ls --depth=0
  ```
  - [ ] `react-native-chart-kit` の使用状況確認（現在未使用の場合は削除）
  - [ ] 他の大型ライブラリの必要性確認

- [ ] **Tree-shaking 最適化**
  - [ ] `expo-vector-icons` → 必要なアイコンのみ import
    ```typescript
    // ❌ 前: 全アイコン読み込み
    import * as MaterialIcons from '@expo/vector-icons/MaterialIcons';

    // ✅ 後: 必要なものだけ
    import { MaterialIcons } from '@expo/vector-icons';
    // または直接参照: <MaterialIcons name="..." />
    ```

### 1.2 動的インポート（Code Splitting）

- [ ] **ホーム画面（`/app/(tabs)/index.tsx`）**
  ```typescript
  // リスニング・単語・ライティングカードの動的インポート
  const ListeningCard = lazy(() => import('./ListeningCard'));
  ```

- [ ] **リスニング画面（`/app/(tabs)/listening.tsx`）**
  ```typescript
  import ListeningQuestionScreen from '@/src/components/ListeningQuestionScreen';
  // → 仮想スクロール対応の新コンポーネントに置き換え
  ```

- [ ] **単語画面（`/app/(tabs)/vocabulary.tsx`）**
  - 仮想スクロール対応リストへの置き換え

- [ ] **ライティング画面（`/app/(tabs)/writing.tsx`）**
  - 不要なコンポーネントの遅延ロード

### 1.3 画像最適化

- [ ] **アセット確認**
  ```bash
  find /Users/80dr/eigomaster/assets -type f | wc -l
  ```

- [ ] **expo-image 導入**
  ```typescript
  import { Image } from 'expo-image';

  <Image
    source={{ uri: 'https://...' }}
    placeholder={require('./placeholder.png')}
    cachePolicy="memory-disk"
  />
  ```

---

## Phase 2: ネットワーク最適化

### 2.1 API キャッシング導入

- [ ] **リスニング店で API キャッシングを使用**
  ```typescript
  import { supabaseApi } from '@/src/lib/apiClient';

  // ホーム画面でリスニング問題を取得
  const questions = await supabaseApi.getListeningQuestions();
  ```

- [ ] **進捗情報のキャッシング（5分）**
  ```typescript
  const progress = await supabaseApi.getListeningProgress(userId);
  ```

- [ ] **単語リストのキャッシング（24時間）**
  ```typescript
  const words = await supabaseApi.getVocabularyWords();
  ```

- [ ] **ユーザー統計のキャッシング（5分）**
  ```typescript
  const stats = await supabaseApi.getUserStats(userId);
  ```

### 2.2 リクエストバッチ化

- [ ] **ホーム画面のデータ初期化**
  ```typescript
  import { batchFetch } from '@/src/lib/apiClient';

  const [listening, vocab, writing] = await batchFetch('home-load', [
    () => supabaseApi.getListeningQuestions(),
    () => supabaseApi.getVocabularyWords(),
    () => supabaseApi.getUserStats(userId),
  ]);
  ```

- [ ] **ページ遷移時のデータプリフェッチ**
  - useFocusEffect で画面表示時のみ取得

### 2.3 遅延ロードの実装

- [ ] **React Navigation の useFocusEffect 導入**
  ```typescript
  import { useFocusEffect } from '@react-navigation/native';

  useFocusEffect(
    useCallback(() => {
      loadDataWhenScreenVisible();
    }, [])
  );
  ```

---

## Phase 3: レンダリング最適化

### 3.1 メモ化の導入

- [ ] **ホーム画面カード**
  - [ ] `ListeningCard` → `memo()` でラップ
  - [ ] `VocabularyCard` → `memo()` でラップ
  - [ ] `WritingCard` → `memo()` でラップ

- [ ] **リスニング画面**
  - [ ] 問題リスト → `VirtualizedQuestionList` に置き換え
  - [ ] `OptimizedQuestionCard` を使用

- [ ] **単語学習画面**
  - [ ] 単語カード → `memo()` でラップ
  - [ ] オプションボタン → `useCallback` で最適化

- [ ] **ライティング画面**
  - [ ] 提出フォーム → メモ化

### 3.2 useMemo/useCallback 最適化

- [ ] **計算結果のメモ化（各画面）**
  ```typescript
  const accuracy = useMemo(() => {
    if (attempts.length === 0) return 0;
    return Math.round((correct / attempts.length) * 100);
  }, [correct, attempts.length]);
  ```

- [ ] **コールバック最適化**
  ```typescript
  const handlePress = useCallback((id) => {
    moveToQuestion(id);
  }, [moveToQuestion]);
  ```

- [ ] **ストア購読の最適化**
  ```typescript
  const user = useAuthStore((state) => state.user);
  // 全状態を購読せず、必要なフィールドのみ
  ```

### 3.3 仮想スクロール導入

- [ ] **リスニング問題リスト（100+問）**
  ```typescript
  import { VirtualizedQuestionList } from '@/src/components/VirtualizedQuestionList';

  <VirtualizedQuestionList
    questions={questions}
    progress={progress}
    onQuestionPress={handlePress}
  />
  ```

- [ ] **単語学習リスト（2000+単語）**
  - FlatList + initialNumToRender, maxToRenderPerBatch 設定

### 3.4 React Compiler 確認

- [ ] **app.json で有効化確認**
  ```json
  {
    "experiments": {
      "reactCompiler": true
    }
  }
  ```
  ✅ 既に有効化済み

---

## Phase 4: データベース最適化

### 4.1 Supabase インデックス作成

- [ ] **Supabase ダッシュボード → SQL Editor でインデックス作成**
  ```sql
  -- リスニング進捗の高速化
  CREATE INDEX IF NOT EXISTS idx_listening_user_attempt
  ON listening_attempts(user_id, created_at DESC);

  -- 単語進捗の高速化
  CREATE INDEX IF NOT EXISTS idx_vocabulary_user_progress
  ON vocabulary_progress(user_id, word_id);

  -- ユーザー統計の高速化
  CREATE INDEX IF NOT EXISTS idx_user_stats_date
  ON user_stats(user_id, date);
  ```

- [ ] **インデックス作成確認**
  ```sql
  SELECT * FROM pg_indexes WHERE tablename IN (
    'listening_attempts', 'vocabulary_progress', 'user_stats'
  );
  ```

### 4.2 クエリ最適化

- [ ] **リレーション選択**
  ```typescript
  // リスニング質問を詳細付きで取得
  const { data } = await supabase
    .from('listening_questions')
    .select('*, listening_audio(url)');  // リレーション指定
  ```

- [ ] **N+1 クエリ問題を排除**
  - [ ] ユーザーデータ取得時にプロファイル・進捗も同時取得

### 4.3 接続プーリング設定

- [ ] **Supabase ダッシュボード → Database → Connection Pooling**
  - [ ] Mode: `Transaction` に設定
  - [ ] Max Connections: `20` （モバイル推奨）
  - [ ] Idle Timeout: `300` 秒

---

## Phase 5: メモリ管理

### 5.1 メモリリーク修正

- [ ] **イベントリスナー管理**
  ```typescript
  useEffect(() => {
    const unsubscribe = store.subscribe(...);
    return () => unsubscribe();  // ✅ クリーンアップ必須
  }, []);
  ```

- [ ] **タイマー管理**
  ```typescript
  useEffect(() => {
    const timer = setTimeout(() => {...}, 1000);
    return () => clearTimeout(timer);  // ✅ クリーンアップ必須
  }, []);
  ```

- [ ] **オーディオリソース管理**
  ```typescript
  useEffect(() => {
    return () => {
      audioManager.cleanup();  // app/(tabs)/listening.tsx 等
    };
  }, []);
  ```

### 5.2 メモリ監視導入

- [ ] **開発環境でメモリ監視を有効化**
  ```typescript
  // app/_layout.tsx
  import { getMemoryManager } from '@/src/lib/memoryManager';

  useEffect(() => {
    const memoryManager = getMemoryManager();
    if (__DEV__) {
      memoryManager.startMonitoring(5000);
    }

    return () => memoryManager.stopMonitoring();
  }, []);
  ```

- [ ] **メモリリーク検出**
  ```typescript
  const hasLeak = memoryManager.detectMemoryLeak();
  if (hasLeak) {
    console.warn('Potential memory leak detected');
  }
  ```

---

## パフォーマンス測定

### 初期ロード時間 < 3秒

- [ ] **測定コード追加**
  ```typescript
  import { getPerformanceMonitor } from '@/src/lib/performanceMonitoring';

  const monitor = getPerformanceMonitor();
  const id = monitor.start('initial-load');

  // ... ロード処理 ...

  monitor.end(id);
  monitor.printReport();
  ```

- [ ] **測定方法**
  ```bash
  npm run ios
  # ログで "initial-load completed in XXXms" を確認
  ```

### API レスポンス時間 < 1秒

- [ ] **API計測**
  ```typescript
  import { measureApiCall } from '@/src/lib/performanceMonitoring';

  const data = await measureApiCall('fetch-listening',
    () => supabaseApi.getListeningQuestions()
  );
  ```

### メモリ使用量 < 150MB

- [ ] **iOS デバイスで確認**
  - Xcode → Product → Scheme → Edit Scheme → Run → Diagnostics
  - Memory Debugger を有効化

---

## テスト・検証

### 自動テスト（オプション）

- [ ] **パフォーマンステスト作成**
  ```typescript
  // __tests__/performance.test.ts
  test('initial load should be < 3s', async () => {
    const monitor = getPerformanceMonitor();
    // ...
    expect(duration).toBeLessThan(3000);
  });
  ```

### 手動テスト

- [ ] **iOS シミュレーター**
  ```bash
  npm run ios
  # - ホーム画面への遷移速度
  # - リスニング問題リストのスクロール滑らかさ
  # - 単語学習のレスポンス
  ```

- [ ] **実機テスト（iPhone）**
  ```bash
  eas build --platform ios
  # TestFlight でインストール
  ```

- [ ] **Android シミュレーター/実機**
  ```bash
  npm run android
  ```

---

## デプロイメント前チェック

- [ ] キャッシング動作確認
  - [ ] 2回目のアプリ起動でロード時間が短縮
  - [ ] Console に `[Cache HIT]` が表示される

- [ ] メモリ使用量確認
  - [ ] アプリ起動時: < 80MB
  - [ ] リスニング 20問実施後: < 120MB
  - [ ] 1時間使用後: < 150MB

- [ ] API レスポンス確認
  - [ ] リスニング問題取得: < 500ms（キャッシュ後）
  - [ ] 進捗保存: < 1秒
  - [ ] 統計更新: < 1秒

- [ ] UI/UX 確認
  - [ ] スクロール fps: 60fps を維持
  - [ ] タップ反応: < 100ms
  - [ ] 画面遷移: < 500ms

---

## トラブルシューティング

### ビルド失敗

```bash
# キャッシュクリア
rm -rf node_modules package-lock.json
npm install

# Expo キャッシュクリア
npx expo start --clear
```

### 型エラー

```bash
# TypeScript 再チェック
npx tsc --noEmit
```

### メモリリーク

```typescript
// メモリダンプを確認
import { getMemoryManager } from '@/src/lib/memoryManager';
getMemoryManager().printStats();
```

---

## 参考資料

- [React Native Performance Optimization](https://reactnative.dev/docs/performance)
- [Expo Performance Tips](https://docs.expo.dev/guides/performance/)
- [Zustand Performance](https://github.com/pmndrs/zustand#performance)
- [Supabase Performance Guide](https://supabase.com/docs/guides/database/optimization)

---

## サポート・質問

問題が発生した場合:
1. `PERFORMANCE_OPTIMIZATION_GUIDE.md` を確認
2. エラーメッセージをコピー
3. GitHub Issues で報告

---

**最終チェック**: このチェックリストの全項目を完了すると、以下の成果が期待できます：

- ✅ 初期ロード時間: 3秒 → **1.5秒** (-50%)
- ✅ API レスポンス: 1秒 → **400ms** (-60%)
- ✅ メモリ使用量: 150MB → **100MB** (-33%)
- ✅ フレームレート: 30fps → **60fps** (滑らか)
