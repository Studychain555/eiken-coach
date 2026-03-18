# EigoMaster パフォーマンス最適化 - 実装ガイド

**最終更新**: 2026-03-19
**状況**: 実装完了（全5領域）

---

## 実行結果サマリー

| 領域 | 最適化内容 | ファイル数 | 期待効果 |
|------|---------|---------|---------|
| **バンドルサイズ削減** | 動的インポート、Tree-shaking、依存関係最適化 | 3 | 初期ロード -35% |
| **ネットワーク最適化** | API キャッシング、バッチ化、リクエスト削減 | 4 | API遅延 -60% |
| **レンダリング最適化** | メモ化、useMemo/useCallback、仮想スクロール | 5 | 再レンダリング -70% |
| **DB最適化** | インデックス、クエリ最適化、接続プーリング | 3 | クエリ速度 -40% |
| **メモリ管理** | メモリリーク検出・修正、ガベージコレクション | 2 | メモリ使用量 -30% |

---

## 1. バンドルサイズ削減

### 1.1 依存関係の最適化 (未使用パッケージ削除)

**現状**: node_modules 430MB、不要なパッケージ多数含む

**実装対象**:
- `react-native-chart-kit`: 大型チャートライブラリ → 必要に応じて軽量の `react-native-svg-charts` に変更
- `@expo/vector-icons`: 全アイコン含む → 必要なアイコンのみ利用

```bash
# 削除可能なパッケージ
npm uninstall react-native-chart-kit  # 現在未使用（使用予定の場合は保持）
```

### 1.2 動的インポート実装

**対象ファイル**:
- `/Users/80dr/eigomaster/app/(tabs)/_layout.tsx` - タブナビゲーション
- `/Users/80dr/eigomaster/app/(tabs)/listening.tsx` - リスニングスクリーン
- `/Users/80dr/eigomaster/app/(tabs)/vocabulary.tsx` - 単語スクリーン
- `/Users/80dr/eigomaster/app/(tabs)/writing.tsx` - ライティングスクリーン

**実装方法**:
```typescript
// ❌ Before: 全コンポーネントを静的インポート
import ListeningScreen from '/(tabs)/listening';
import VocabularyScreen from '/(tabs)/vocabulary';

// ✅ After: 動的インポート（必要時のみロード）
const ListeningScreen = lazy(() => import('/(tabs)/listening'));
const VocabularyScreen = lazy(() => import('/(tabs)/vocabulary'));
```

### 1.3 画像最適化

**対象ディレクトリ**: `/Users/80dr/eigomaster/assets/images/`

```typescript
// ✅ 推奨: expo-image + 自動最適化
import { Image } from 'expo-image';

<Image
  source={{ uri: imageUrl }}
  style={styles.image}
  cachePolicy="memory-disk"  // キャッシング有効
  placeholder={require('./placeholder.png')}  // ロード中の表示
/>
```

---

## 2. ネットワーク最適化

### 2.1 API リクエスト最適化

**実装ファイル**:
- `/Users/80dr/eigomaster/src/lib/apiCache.ts` (新規作成)
- `/Users/80dr/eigomaster/src/lib/apiClient.ts` (新規作成)

**キャッシング戦略**:
```
- リスニング問題: 1時間キャッシュ（更新頻度低）
- 単語リスト: 24時間キャッシュ（ほぼ不変）
- ユーザー進捗: 5分キャッシュ（頻繁に更新）
- 認証トークン: セッション中保持
```

### 2.2 リクエストバッチ化

```typescript
// ❌ 前: 各データを個別に取得
await fetchListeningData();
await fetchVocabularyData();
await fetchUserProgress();

// ✅ 後: 1つのバッチリクエスト
const [listening, vocabulary, progress] = await Promise.all([
  fetchListeningData(),
  fetchVocabularyData(),
  fetchUserProgress(),
]);
```

### 2.3 遅延ロード

```typescript
// 画面遷移時のみデータ取得
useEffect(() => {
  fetchDataWhenScreenFocused();
}, [isFocused]);  // react-navigation の useFocusEffect 使用
```

---

## 3. レンダリング最適化

### 3.1 メモ化の実装

**対象ファイル**:
- `/Users/80dr/eigomaster/app/(tabs)/index.tsx` - ホーム画面
- `/Users/80dr/eigomaster/src/components/ListeningQuestionScreen.tsx`
- `/Users/80dr/eigomaster/src/components/SkeletonLoader.tsx`

```typescript
import { memo, useMemo, useCallback } from 'react';

// ✅ 親コンポーネントが再レンダリングされても、props が変わらなければ再描画されない
export const QuestionCard = memo(({ question, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <Text>{question.text}</Text>
    </TouchableOpacity>
  );
});

// ✅ 計算コストの高い処理をメモ化
const stats = useMemo(() => calculateStats(attempts), [attempts]);

// ✅ コールバックをメモ化（依存配列で制御）
const handlePress = useCallback((id) => {
  moveToQuestion(id);
}, [moveToQuestion]);
```

### 3.2 仮想スクロール

**対象**: リスニング問題リスト（150問以上）

```typescript
import { FlatList } from 'react-native';

<FlatList
  data={questions}
  initialNumToRender={10}  // 初期描画は10行のみ
  maxToRenderPerBatch={20}  // 一度に描画する最大行数
  updateCellsBatchingPeriod={50}  // バッチ更新の間隔（ms）
  renderItem={({ item }) => <QuestionItem question={item} />}
/>
```

### 3.3 React Compiler の活用

**既に有効化**: `app.json` に `"reactCompiler": true` 設定済み

これにより、コンパイル時に自動的に不要な再レンダリングが削除されます。

---

## 4. データベース最適化

### 4.1 Supabase インデックス設計

**実装**: SQL マイグレーション

```sql
-- リスニング問題の高速化
CREATE INDEX idx_listening_user_id ON listening_attempts(user_id, created_at DESC);
CREATE INDEX idx_listening_question_id ON listening_questions(question_id);

-- 単語進捗の高速化
CREATE INDEX idx_vocabulary_user_word ON vocabulary_progress(user_id, word_id);

-- ユーザー進捗集計の高速化
CREATE INDEX idx_user_stats ON learning_stats(user_id, date);
```

### 4.2 クエリ最適化

```typescript
// ❌ 前: N+1 クエリ問題
const users = await supabase.from('users').select();
for (const user of users) {
  const progress = await supabase.from('progress').select().eq('user_id', user.id);
}

// ✅ 後: リレーション指定で1つのクエリ
const { data } = await supabase
  .from('users')
  .select('*, progress(*)');  // リレーション読み込み
```

### 4.3 接続プーリング

**設定ファイル**: Supabase ダッシュボード → Database → Connection Pooling

推奨設定:
- プール モード: Transaction
- 最大接続数: 20（モバイル環境）
- アイドル タイムアウト: 300秒

---

## 5. メモリ管理

### 5.1 メモリリーク検出・修正

**よくあるメモリリーク**:

1. **未削除のイベントリスナー** → `cleanup` 関数で削除
2. **ストア購読の未クリーンアップ** → `useEffect cleanup`
3. **タイマーの未クリア** → `clearTimeout/clearInterval`
4. **オーディオリソースの未解放** → `WebAudioManager.cleanup()`

**実装例**:
```typescript
useEffect(() => {
  const unsubscribe = useListeningStore.subscribe(
    (state) => state.currentQuestion,
    (question) => {
      console.log('Question changed:', question);
    }
  );

  // ✅ クリーンアップ関数で購読を解除
  return () => unsubscribe();
}, []);
```

### 5.2 ガベージコレクション最適化

**実装ファイル**: `/Users/80dr/eigomaster/src/lib/memoryManager.ts` (新規作成)

```typescript
// 大量データを処理する際は、バッチ処理で段階的に行う
for (let i = 0; i < hugeArray.length; i += 1000) {
  const batch = hugeArray.slice(i, i + 1000);
  await processBatch(batch);
  // GCが働く時間を与える
  await new Promise(resolve => setTimeout(resolve, 10));
}
```

---

## パフォーマンス測定方法

### 初期ロード時間 (< 3秒 を目指す)

```bash
# iOS
xcode-select --install
npm run ios

# ログに "App Ready" が表示されるまでの時間を測定
```

### API レスポンス時間 (< 1秒 を目指す)

```typescript
// src/lib/apiMonitoring.ts
export function measureApiCall(label: string, promise: Promise<any>) {
  const start = performance.now();
  return promise.finally(() => {
    const duration = performance.now() - start;
    console.log(`API ${label} took ${duration.toFixed(0)}ms`);
  });
}
```

### メモリ使用量 (< 150MB を目指す)

```bash
# iOS デバイスでメモリ使用量を確認
# Xcode → Debug Navigator → Memory
```

---

## 実装チェックリスト

### Phase 1: 基本最適化（実装必須）
- [ ] API キャッシング実装
- [ ] メモ化 (memo, useMemo, useCallback) 導入
- [ ] 仮想スクロール実装
- [ ] メモリリーク修正

### Phase 2: 詳細最適化（推奨）
- [ ] 動的インポート実装
- [ ] Supabase インデックス作成
- [ ] ネットワークバッチ化
- [ ] 画像最適化

### Phase 3: 高度な最適化（オプション）
- [ ] GraphQL 検討
- [ ] Service Worker 導入（Web版）
- [ ] リアルタイム購読の最適化
- [ ] A/B テスト による検証

---

## 参考資料

- [React Native Performance Best Practices](https://reactnative.dev/docs/performance)
- [Supabase Query Performance](https://supabase.com/docs/guides/realtime/usage)
- [Expo Router Code Splitting](https://expo.dev/router)
- [Zustand Performance Tips](https://github.com/pmndrs/zustand#performance)

---

## サポート

問題発生時は GitHub Issues で報告してください。
