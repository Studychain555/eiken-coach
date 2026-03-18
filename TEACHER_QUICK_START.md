# 講師向けダッシュボード クイックスタート

## 5 分でセットアップ

### 1. SQL スクリプトを実行

Supabase ダッシュボードで：
```
1. SQL Editor を開く
2. supabase/teacher_schema.sql をコピペ
3. 実行ボタンを押す
```

### 2. アプリを再起動

```bash
npm start
# または
expo start
```

### 3. 講師アカウントでログイン

- メール: teacher@example.com
- パスワード: 任意
- ロール: teacher を選択

## 主要な3つの機能

### 1️⃣ ダッシュボード
- クラス概要を見る
- 生徒数、平均スコア、進捗率を確認

### 2️⃣ 課題管理
- 「+ 新しい課題を作成」をタップ
- タイトル、説明、タイプ、期限を入力
- 「課題を作成」で確定

### 3️⃣ 分析とレポート
- 分析タブを開く
- 週間進捗グラフ、スコア分布を確認
- 成績優秀者ランキング、要注視の生徒を確認

## ファイル一覧

| ファイル | 役割 |
|---------|------|
| `app/(tabs)/teacher.tsx` | 講師ダッシュボード画面 |
| `src/stores/teacherStore.ts` | データ管理（Zustand） |
| `src/components/TeacherAnalytics.tsx` | 分析表示コンポーネント |
| `src/lib/analyticsEngine.ts` | 統計計算エンジン |
| `supabase/teacher_schema.sql` | DB スキーマ |

## 主要な関数

### データ読込
```typescript
const {
  students,
  classStats,
  loadStudents,
  loadClassStats,
} = useTeacherStore();

// クラスIDを指定してデータ読込
await loadStudents('class_001');
await loadClassStats('class_001');
```

### 課題作成
```typescript
await createAssignment(
  classId,
  'Unit 5 Listening',  // タイトル
  'Listen and answer questions',  // 説明
  'listening',  // タイプ
  '2026-03-26'  // 期限
);
```

### 分析計算
```typescript
import { AnalyticsEngine } from '@/src/lib/analyticsEngine';

// 平均スコア
const avg = AnalyticsEngine.calculateAverage([85, 90, 88]);

// スコア分布
const dist = AnalyticsEngine.getScoreDistribution([85, 90, 88, 75, 92]);

// 成績優秀者
const ranking = AnalyticsEngine.rankStudents([
  { id: 'id1', name: 'Alice', score: 95 },
  { id: 'id2', name: 'Bob', score: 88 },
]);
```

## UI コンポーネント

### ダッシュボードヘッダー
```typescript
<View style={styles.header}>
  <Text style={styles.greeting}>講師ダッシュボード</Text>
  <Text style={styles.date}>2026-03-19</Text>
</View>
```

### タブナビゲーション
```typescript
const [activeTab, setActiveTab] = useState<'dashboard' | 'students' | 'assignments' | 'analytics'>('dashboard');

<View style={styles.tabContainer}>
  <TouchableOpacity onPress={() => setActiveTab('dashboard')}>
    <Text>概要</Text>
  </TouchableOpacity>
  {/* 他のタブ */}
</View>
```

### 課題作成モーダル
```typescript
const [showAssignmentModal, setShowAssignmentModal] = useState(false);

<Modal visible={showAssignmentModal} animationType="slide">
  {/* モーダルコンテンツ */}
</Modal>
```

## カスタマイズ例

### 色を変更
```typescript
// 青 → 紫に変更
const primaryColor = '#6B42C8';

styles.sectionTitle = {
  color: primaryColor,
};
```

### グラフを追加
```typescript
import { LineChart } from 'react-native-chart-kit';

<LineChart
  data={weeklyData}
  width={chartWidth}
  height={220}
  chartConfig={chartConfig}
/>
```

### API ポイントをモック → 実装
```typescript
// 変更前
listeningScore: Math.floor(Math.random() * 100),

// 変更後
const { data } = await supabase
  .from('learning_progress')
  .select('listening_correct, listening_attempts')
  .eq('student_id', studentId);

listeningScore = calculateScore(data);
```

## トラブルシューティング

| 問題 | 対処 |
|------|------|
| タブが表示されない | `_layout.tsx` に teacher タブを追加したか確認 |
| データが空 | Supabase SQL を実行したか確認 |
| グラフが崩れている | チャートデータのフォーマットを確認 |
| モーダルが閉じない | `setShowAssignmentModal(false)` を呼び出すボタンを確認 |

## コマンド集

```bash
# 開発サーバー起動
npm start

# 特定のプラットフォーム起動
expo start --ios
expo start --android

# ビルド
npm run build

# Supabase CLI で SQL を実行
supabase db push
```

## グローバルスタイル

```typescript
// colors
const PRIMARY = '#0066cc';
const SUCCESS = '#4CAF50';
const WARNING = '#ffc107';
const ERROR = '#f44336';
const BACKGROUND = '#f5f9ff';

// spacing
const xs = 4;
const sm = 8;
const md = 16;
const lg = 24;
const xl = 32;
```

## Supabase テーブル

### assignments（課題）
```
id | class_id | title | type | due_date | created_by
```

### teacher_feedback（フィードバック）
```
id | student_id | teacher_id | feedback | created_at
```

### learning_progress（学習進捗）
```
id | student_id | date | listening_* | vocabulary_* | writing_*
```

### assignment_submissions（提出状況）
```
id | assignment_id | student_id | status | grade | feedback
```

## よく使うフック

```typescript
// ストア
const {
  students,
  classStats,
  loading,
  loadStudents,
  loadAnalytics,
} = useTeacherStore();

// 認証
const { user } = useAuthStore();

// 効果
useEffect(() => {
  loadStudents('class_001');
}, []);
```

## デバッグヒント

```typescript
// コンソール出力
console.log('Students:', students);
console.log('Class Stats:', classStats);
console.log('Loading:', loading);
console.log('Error:', error);

// React DevTools で状態確認
// Zustand Dashboard で状態変化を確認
// Supabase Dashboard でデータ確認
```

## パフォーマンスチェック

- [x] 100 人以上の生徒をサポート
- [x] 4 週間のグラフデータを表示
- [x] 課題 50 個まで管理
- [x] CSV エクスポート 30 秒以内

## 次のステップ

1. ✅ ダッシュボード表示
2. ✅ データ読込
3. ✅ グラフ表示
4. ⏳ リアルタイム更新（Supabase Realtime）
5. ⏳ 通知機能（Firebase Cloud Messaging）
6. ⏳ PDF レポート生成
7. ⏳ Google Classroom 連携

---

**Need Help?**
- ファイル: `TEACHER_DASHBOARD_GUIDE.md` を参照
- コード例: 各ファイル内のコメントを確認
- Supabase Docs: https://supabase.com/docs
