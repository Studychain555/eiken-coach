# TypeScript エラー修正計画 (詳細版)

**作成日**: 2026-03-19
**優先度**: P0 (CRITICAL - 本番前修正必須)
**推定修正時間**: 2-3時間
**対象ファイル**: 8個
**対象エラー**: 27個

---

## 概要

EigoMaster 統合テストで TypeScript コンパイルエラーが 27個検出されました。本ドキュメントは各エラーの詳細な修正方法を記載します。

---

## 修正優先度

```
🔴 P1 (1時間) - 必須: コアロジック・メイン機能
  ├─ app/(tabs)/index.tsx
  ├─ app/(tabs)/teacher.tsx
  └─ app/(auth)/_layout.tsx

🟠 P2 (1時間) - 推奨: UI コンポーネント
  ├─ app/(tabs)/vocabulary.tsx
  ├─ components/EnhancedProgressBar.tsx
  ├─ components/OptimizedButton.tsx
  ├─ src/components/ShadowingScreen.tsx
  └─ src/components/SkeletonLoader.tsx

🟡 P3 (0.5時間) - オプション: テストファイル
  └─ src/lib/__tests__/securityManager.test.ts
```

---

## 詳細修正ガイド

### 修正 1: app/(auth)/_layout.tsx

**エラー数**: 2個
**エラー内容**: `animationEnabled` プロパティが `ExtendedStackNavigationOptions` に存在しない

**ファイルパス**: `/Users/80dr/eigomaster/app/(auth)/_layout.tsx`

**エラーメッセージ**:
```
error TS2353: Object literal may only specify known properties,
and 'animationEnabled' does not exist in type 'ExtendedStackNavigationOptions'.
```

**修正手順**:

```bash
# 1. ファイルを開く
nano /Users/80dr/eigomaster/app/(auth)/_layout.tsx

# 2. 10行目と 17行目を確認
# 現在:
screenOptions={{
  animationEnabled: true,  // ❌ 不正なプロパティ
}}

# 3. 修正
# 方法A: プロパティを削除（React Navigation v6+ では不要）
screenOptions={{
  // animationEnabled: true を削除
}}

# 方法B: 新しいプロパティを使用
screenOptions={{
  // animationEnabled の代わりに:
  cardStyle: { opacity: 1 },
  // または transitionSpec を使用
}}
```

**確認コマンド**:
```bash
npx tsc --noEmit app/(auth)/_layout.tsx
```

**参考**: React Navigation ドキュメント
- https://reactnavigation.org/docs/stack-navigator#options

---

### 修正 2: app/(tabs)/index.tsx

**エラー数**: 1個
**エラー内容**: `number` 型を `string` 型の変数に代入

**ファイルパス**: `/Users/80dr/eigomaster/app/(tabs)/index.tsx`

**エラーメッセージ**:
```
error TS2345: Argument of type 'number' is not assignable to parameter of type 'string'.
```

**修正手順**:

```bash
# 1. 158行付近を確認
sed -n '155,160p' /Users/80dr/eigomaster/app/(tabs)/index.tsx

# 2. エラー行を特定
# 例:
someFunction(123)  // ❌ number を string 期待位置に

# 3. 修正
# 方法A: 数値を文字列に変換
someFunction(String(123))  // ✅

# 方法B: 関数の型定義を修正
function someFunction(value: number) { ... }  // ✅
```

**確認コマンド**:
```bash
npx tsc --noEmit app/(tabs)/index.tsx
```

---

### 修正 3: app/(tabs)/teacher.tsx

**エラー数**: 3個
**エラー内容**:
1. JSX に複数同名属性
2. View に string 型 width
3. union 型の不一致

**ファイルパス**: `/Users/80dr/eigomaster/app/(tabs)/teacher.tsx`

**エラーメッセージ**:
```
error TS17001: JSX elements cannot have multiple attributes with the same name.
error TS2769: No overload matches this call.
error TS2322: Type not assignable to type
```

**修正手順**:

```bash
# 1. 複数属性エラー (327行, 362行)
# 現在:
<View style={{ width: '100%' }} />  // ❌ string

# 修正:
<View style={{ width: '100%' }} />  // ✅ % は OK
// または
<View style={{ flex: 1 }} />  // ✅ flex推奨

# 2. JSX 複数属性エラー (327行)
# 現在:
<Element prop={a} prop={b} />  // ❌ 重複

# 修正:
<Element prop={b} />  // または方法B
<Element {...{ prop: a, ...otherProps }} />

# 3. Union 型エラー (480行)
# 現在:
type: "listening"  // ❌ "listening" | "vocabulary" | "writing" 期待

# 修正:
type: questionType as 'listening'  // ✅ キャスト
// または
type: 'listening' as const
```

**確認コマンド**:
```bash
npx tsc --noEmit app/(tabs)/teacher.tsx
```

---

### 修正 4: app/(tabs)/vocabulary.tsx

**エラー数**: 2個
**エラー内容**: スタイルオブジェクトに `progressBar`, `progressFill` プロパティが定義されていない

**ファイルパス**: `/Users/80dr/eigomaster/app/(tabs)/vocabulary.tsx`

**エラーメッセージ**:
```
error TS2339: Property 'progressBar' does not exist
error TS2339: Property 'progressFill' does not exist
```

**修正手順**:

```bash
# 1. スタイルオブジェクトを検索
grep -n "const.*styles\|StyleSheet.create" /Users/80dr/eigomaster/app/(tabs)/vocabulary.tsx

# 2. スタイルオブジェクトに追加
const styles = StyleSheet.create({
  // ... 既存スタイル ...

  // ✅ 追加するスタイル:
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
    marginVertical: 8,
  },
  progressFill: {
    height: 8,
    backgroundColor: '#4caf50',
    borderRadius: 4,
  },
});

# 3. 使用箇所を確認
sed -n '270,280p' /Users/80dr/eigomaster/app/(tabs)/vocabulary.tsx

# 4. 修正確認
npx tsc --noEmit app/(tabs)/vocabulary.tsx
```

**参考**: React Native `StyleSheet`
```typescript
// 好ましいスタイル定義
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#ddd',
    marginVertical: 8,
  },
});
```

---

### 修正 5: components/EnhancedProgressBar.tsx

**エラー数**: 3個
**エラー内容**:
1. `fontWeight` プロパティに `string` ではなく `enum` 値が必要
2. `rotate` 値の型不一致
3. 複数の `fontWeight` エラー

**ファイルパス**: `/Users/80dr/eigomaster/components/EnhancedProgressBar.tsx`

**エラーメッセージ**:
```
error TS2769: Type 'string' is not assignable to type 'fontWeight type'.
error TS2322: Type '{ rotate: string }' is not assignable to type 'string'.
```

**修正手順**:

```bash
# 1. 143行付近の fontWeight エラー
# 現在:
<Text style={{ fontWeight: 'bold' }}>  // ❌ string

# 修正方法A: enum 値を使用
<Text style={{ fontWeight: '700' }}>  // ✅

# 修正方法B: 型アサーション
<Text style={{ fontWeight: 'bold' as any }}>  // ⚠️ 最終手段

# 2. 238行の rotate エラー
# 現在:
transform: [{ rotate: '45deg' }]  // ❌

# 修正:
transform: [{ rotate: '45deg' }]  // ✅ 正しい形式
// または
transform: [{ rotate: '0.785rad' }]

# 3. 266行の fontWeight エラー (再発)
# 上記と同じ修正を適用

# 4. ファイル全体を検索・置換
sed -i '' "s/fontWeight: 'bold'/fontWeight: '700'/g" \
  /Users/80dr/eigomaster/components/EnhancedProgressBar.tsx

sed -i '' "s/fontWeight: 'normal'/fontWeight: 'normal'/g" \
  /Users/80dr/eigomaster/components/EnhancedProgressBar.tsx

# 5. 確認
npx tsc --noEmit components/EnhancedProgressBar.tsx
```

**参考**: React Native `TextStyle.fontWeight` の有効値

```typescript
type FontWeight =
  | 'normal'
  | 'bold'
  | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900'
  | 'ultralight' | 'thin' | 'light' | 'regular' | 'medium' | 'semibold'
  | 'condensed' | 'condensed bold';
```

---

### 修正 6: components/OptimizedButton.tsx

**エラー数**: 1個
**エラー内容**: `border` プロパティが theme に存在しない

**ファイルパス**: `/Users/80dr/eigomaster/components/OptimizedButton.tsx`

**エラーメッセージ**:
```
error TS2339: Property 'border' does not exist on type 'colors'.
```

**修正手順**:

```bash
# 1. 115行付近を確認
sed -n '110,120p' /Users/80dr/eigomaster/components/OptimizedButton.tsx

# 2. border プロパティを使用している箇所を特定
# 現在:
const borderColor = theme.colors.border;  // ❌ 不存在

# 3. 修正
# 方法A: 既存プロパティを使用
const borderColor = theme.colors.primary;  // ✅

# 方法B: 直接値を指定
const borderColor = '#ddd';  // ✅

# 方法C: theme に border を追加
const theme = {
  colors: {
    // ... 既存
    border: '#ddd',  // ✅ 追加
  }
};

# 4. 確認
grep -n "border" /Users/80dr/eigomaster/components/OptimizedButton.tsx

# 5. 修正を適用
# (具体的な修正は theme の定義に依存)
```

---

### 修正 7: src/components/ShadowingScreen.tsx

**エラー数**: 2個
**エラー内容**: `Timeout` 型と `setState` 関数の型不一致

**ファイルパス**: `/Users/80dr/eigomaster/src/components/ShadowingScreen.tsx`

**エラーメッセージ**:
```
error TS2322: Type 'number' is not assignable to type 'Timeout'.
error TS2345: Argument of type '(prev: any) => any' is not assignable to parameter of type 'number'.
```

**修正手順**:

```bash
# 1. 68-69行を確認
sed -n '65,75p' /Users/80dr/eigomaster/src/components/ShadowingScreen.tsx

# 2. 修正前の例:
const [timeout, setTimeout] = useState<number>(0);  // ❌ 競合・型エラー

# 修正後:
const [timeoutValue, setTimeoutValue] = useState<number>(0);  // ✅ 別の変数
const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);  // ✅ ID保持

# 3. 使用箇所を修正
// 修正前:
setTimeout(prev => prev + 1);  // ❌

// 修正後:
setTimeoutValue(prev => prev + 1);  // ✅

# 4. タイマー設定
useEffect(() => {
  const id = setInterval(() => {
    setTimeoutValue(prev => prev + 1);
  }, 1000);

  return () => clearInterval(id);
}, []);

# 5. 確認
npx tsc --noEmit src/components/ShadowingScreen.tsx
```

**ベストプラクティス**:
```typescript
// React hooks で setTimeout/setInterval を使う場合
const [timeElapsed, setTimeElapsed] = useState(0);

useEffect(() => {
  const timer = setTimeout(() => {
    setTimeElapsed(prev => prev + 1);
  }, 1000);

  return () => clearTimeout(timer);  // クリーンアップ必須
}, []);
```

---

### 修正 8: src/components/SkeletonLoader.tsx

**エラー数**: 3個
**エラー内容**: スタイルオブジェクトに `overlay`, `spinner`, `spinnerDot` プロパティが定義されていない

**ファイルパス**: `/Users/80dr/eigomaster/src/components/SkeletonLoader.tsx`

**エラーメッセージ**:
```
error TS2339: Property 'overlay' does not exist
error TS2339: Property 'spinner' does not exist
error TS2339: Property 'spinnerDot' does not exist
```

**修正手順**:

```bash
# 1. スタイルオブジェクト定義箇所を検索
grep -n "StyleSheet.create\|const styles" /Users/80dr/eigomaster/src/components/SkeletonLoader.tsx

# 2. 138-142行付近を確認
sed -n '135,145p' /Users/80dr/eigomaster/src/components/SkeletonLoader.tsx

# 3. スタイルを追加
const styles = StyleSheet.create({
  // ... 既存スタイル ...

  // ✅ 追加するスタイル:
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    zIndex: 9999,
  },
  spinner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinnerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#fff',
    marginHorizontal: 4,
  },
});

# 4. 確認
npx tsc --noEmit src/components/SkeletonLoader.tsx
```

---

### 修正 9: src/lib/__tests__/securityManager.test.ts

**エラー数**: 43個
**エラー内容**: Jest テストランナーの型定義が不足

**ファイルパス**: `/Users/80dr/eigomaster/src/lib/__tests__/securityManager.test.ts`

**エラーメッセージ**:
```
error TS2582: Cannot find name 'describe'
error TS2582: Cannot find name 'test'
error TS2304: Cannot find name 'expect'
```

**修正手順**:

```bash
# 1. Jest 関連パッケージをインストール
npm install --save-dev @types/jest jest

# 2. tsconfig.json を確認・更新
# "types" に "jest" が含まれているか確認
cat /Users/80dr/eigomaster/tsconfig.json | grep -A 5 '"types"'

# 3. 必要に応じて tsconfig.json を更新
# {
#   "compilerOptions": {
#     "types": ["jest", "react", "react-native"],  // ✅ "jest" を追加
#   }
# }

# 4. テストファイルに型インポートを追加 (オプション)
# ファイル冒頭に以下を追加:
import { describe, test, expect } from '@jest/globals';  // ✅

# 5. 確認
npx tsc --noEmit src/lib/__tests__/securityManager.test.ts

# 6. 最終確認: すべてのエラーがなくなったか確認
npm run lint
npx tsc --noEmit
```

**Jest 型定義の確認**:
```bash
# インストール状況確認
ls node_modules/@types | grep jest

# または
npm list @types/jest
```

---

## 修正実行スケジュール

### 1時間目: P1 修正 (必須)

```bash
# 1. app/(auth)/_layout.tsx
# - animationEnabled を削除または修正

# 2. app/(tabs)/index.tsx
# - number → string 型変換

# 3. app/(tabs)/teacher.tsx
# - 複数属性・width・union 型エラーを修正

# 確認
npx tsc --noEmit app/
```

### 2時間目: P2 修正 (推奨)

```bash
# 4. app/(tabs)/vocabulary.tsx
# - progressBar/progressFill スタイル追加

# 5. components/EnhancedProgressBar.tsx
# - fontWeight → enum 値に修正

# 6. components/OptimizedButton.tsx
# - border プロパティを修正

# 7. src/components/ShadowingScreen.tsx
# - Timeout 型・setState 型を修正

# 8. src/components/SkeletonLoader.tsx
# - overlay/spinner/spinnerDot スタイル追加

# 確認
npx tsc --noEmit src/
npx tsc --noEmit components/
```

### 3時間目: P3 修正＆最終確認

```bash
# 9. Jest 型定義をインストール
npm install --save-dev @types/jest

# src/lib/__tests__/securityManager.test.ts
# - 型定義エラーは自動解決

# 最終確認
npx tsc --noEmit
npm run lint
npm run web  # Web版起動確認
```

---

## 修正確認コマンド集

### 段階的な確認

```bash
# 1. ファイルごとの確認
npx tsc --noEmit app/(auth)/_layout.tsx
npx tsc --noEmit app/(tabs)/index.tsx
npx tsc --noEmit app/(tabs)/teacher.tsx
npx tsc --noEmit app/(tabs)/vocabulary.tsx
npx tsc --noEmit components/EnhancedProgressBar.tsx
npx tsc --noEmit components/OptimizedButton.tsx
npx tsc --noEmit src/components/ShadowingScreen.tsx
npx tsc --noEmit src/components/SkeletonLoader.tsx
npx tsc --noEmit src/lib/__tests__/securityManager.test.ts

# 2. ディレクトリ別確認
npx tsc --noEmit app/
npx tsc --noEmit components/
npx tsc --noEmit src/

# 3. プロジェクト全体確認
npx tsc --noEmit

# 4. ESLint確認
npm run lint

# 5. Web版起動確認
npm run web
```

### エラー再確認

```bash
# エラーをカウント
npx tsc --noEmit 2>&1 | grep "error TS" | wc -l

# エラー詳細表示
npx tsc --noEmit 2>&1 | grep "error TS"

# 特定のエラータイプを検索
npx tsc --noEmit 2>&1 | grep "TS2339"  # プロパティ不在
npx tsc --noEmit 2>&1 | grep "TS2322"  # 型不一致
npx tsc --noEmit 2>&1 | grep "TS2353"  # オブジェクトプロパティ
```

---

## 修正完了チェックリスト

修正を完了した場合、以下をチェックしてください:

```
修正ファイル:
- [ ] app/(auth)/_layout.tsx ✅
- [ ] app/(tabs)/index.tsx ✅
- [ ] app/(tabs)/teacher.tsx ✅
- [ ] app/(tabs)/vocabulary.tsx ✅
- [ ] components/EnhancedProgressBar.tsx ✅
- [ ] components/OptimizedButton.tsx ✅
- [ ] src/components/ShadowingScreen.tsx ✅
- [ ] src/components/SkeletonLoader.tsx ✅
- [ ] src/lib/__tests__/securityManager.test.ts ✅

確認事項:
- [ ] npx tsc --noEmit でエラーが 0個になった
- [ ] npm run lint が合格
- [ ] npm run web で起動確認
- [ ] git add + git commit
- [ ] PR 作成・レビュー待ち
```

---

## 修正後のテスト実施

修正完了後は、以下のテストを実施してください:

```bash
# 1. 型チェック完全合格
npx tsc --noEmit
# 出力: なし（エラーなし）

# 2. ESLint 合格
npm run lint
# 出力: ✓ ESLint passed

# 3. Web版起動確認
npm run web
# ブラウザで http://localhost:8081 を開く
# UI が正常表示されることを確認

# 4. Phase 2 (E2E テスト) へ進行
# bash scripts/run-integration-tests.sh phase-2
```

---

## トラブルシューティング

### よくあるエラーと解決策

#### エラー: "Cannot find module '@types/jest'"

```bash
# 解決策:
npm install --save-dev @types/jest
npm install --save-dev jest
```

#### エラー: "Property does not exist" が残る

```bash
# キャッシュをクリア:
npm run lint --reset-cache
rm -rf node_modules/.cache
npx tsc --noEmit --noCache
```

#### エラー: "fontWeight: 'bold' is not assignable"

```typescript
// 確認: React Native の型定義を確認
// 有効値: "normal" | "bold" | "100"～"900"

// 修正:
fontWeight: '700'  // ✅ 正しい形式
```

---

## 参考資料

### React Navigation
- https://reactnavigation.org/docs/stack-navigator#options

### React Native Styles
- https://reactnative.dev/docs/style
- https://reactnative.dev/docs/text-style-props

### TypeScript in React Native
- https://reactnative.dev/docs/typescript

### Jest TypeScript
- https://jestjs.io/docs/getting-started#using-typescript
- https://www.npmjs.com/package/@types/jest

---

**修正担当者**: エンジニア
**修正期限**: 2026-03-19 (本日中)
**完了予定**: 2026-03-19 18:00 JST

