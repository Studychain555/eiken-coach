# 講師向けダッシュボード・分析機能 実装ガイド

## 概要

EigoMaster に講師向けダッシュボード・分析機能を実装しました。講師は生徒の学習進捗を一元管理し、詳細な分析・レポート機能を利用できます。

## 実装構成

### 1. ファイル構成

```
eigomaster/
├── app/(tabs)/
│   ├── _layout.tsx                    # ← teacher タブを追加
│   └── teacher.tsx                    # ← 講師ダッシュボード（新規）
├── src/
│   ├── stores/
│   │   └── teacherStore.ts            # ← 講師状態管理（新規）
│   ├── components/
│   │   └── TeacherAnalytics.tsx        # ← 分析コンポーネント（新規）
│   └── lib/
│       ├── analyticsEngine.ts          # ← 分析エンジン（新規）
│       └── supabase.ts                 # ← DB スキーマ拡張
└── supabase/
    └── teacher_schema.sql              # ← SQL スクリプト（新規）
```

### 2. 機能一覧

| 機能 | 説明 | ファイル |
|------|------|---------|
| **ダッシュボード** | クラス概要・成績優秀者・最近の課題を表示 | `teacher.tsx` |
| **生徒管理** | 担当生徒一覧・進捗率表示・個別詳細表示 | `teacher.tsx` + `teacherStore.ts` |
| **課題管理** | 課題作成・一覧表示・提出状況確認 | `teacher.tsx` + `teacherStore.ts` |
| **分析ダッシュボード** | グラフ・スコア分布・スキル比較・ランキング | `TeacherAnalytics.tsx` + `analyticsEngine.ts` |
| **リアルタイム統計** | クラス平均・参加率・学習時間 | `TeacherAnalytics.tsx` + `analyticsEngine.ts` |
| **フィードバック** | 生徒への個別フィードバック入力・送信 | `teacher.tsx` + `teacherStore.ts` |
| **CSV エクスポート** | 生徒データ・分析データのエクスポート | `teacherStore.ts` |

## セットアップ手順

### Step 1: Supabase スキーマ作成

Supabase ダッシュボードで SQL エディタを開き、以下を実行します：

```bash
# ファイル: supabase/teacher_schema.sql の内容をコピペして実行
```

**作成されるテーブル：**
- `assignments` - 課題情報
- `teacher_feedback` - フィードバック
- `learning_progress` - 学習進捗（日次）
- `assignment_submissions` - 課題提出状況

**作成されるビュー：**
- `class_statistics` - クラス統計
- `student_performance` - 生徒パフォーマンス

### Step 2: 環境変数確認

`.env.local` に以下が設定されていることを確認：

```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Step 3: 依存パッケージ確認

`package.json` に以下がインストールされていることを確認：

```json
{
  "react-native-chart-kit": "^6.12.0",
  "zustand": "^5.0.12",
  "@supabase/supabase-js": "^2.99.2"
}
```

すべてインストール済みです。

### Step 4: アプリの起動

```bash
npm start
# または
expo start
```

## ページ構成

### 講師ダッシュボード (`/(tabs)/teacher`)

4 つのタブで構成：

#### 1. 概要タブ
- **クラス概要**
  - 生徒数、平均スコア、進捗率、学習時間

- **最近の課題**
  - 期限が近い課題・完了状況を表示

- **成績優秀者**
  - トップ 3 の生徒を表示

#### 2. 生徒タブ
- **担当生徒一覧**
  - 生徒名、メール、各スキルのスコア表示
  - 進捗率バー表示
  - タップで詳細画面へ遷移

#### 3. 課題タブ
- **課題一覧**
  - タイトル、説明、タイプ（リスニング/単語/ライティング）
  - 期限、完了状況

- **課題作成ボタン**
  - モーダルで新規課題を作成

#### 4. 分析タブ
- **クラス概要** - 生徒数、平均スコアなど
- **クラス参加率** - 学習中の生徒の割合
- **週間進捗グラフ** - リスニングの進捗を折れ線グラフで表示
- **スコア分布グラフ** - 棒グラフで分布を表示
- **スキル比較** - リスニング/単語/ライティングの平均スコア
- **成績優秀者ランキング** - Top 5
- **要注視の生徒** - スコア低下・学習不足の生徒リスト
- **スコア分布詳細** - 90-100、80-89 等のセグメント分析
- **統計サマリー** - 数値統計

## API・ストア仕様

### useTeacherStore

#### 状態変数

```typescript
interface TeacherState {
  // 生徒管理
  students: StudentProgress[];
  classStats: ClassStatistics | null;
  selectedStudent: StudentDetailData | null;

  // 課題管理
  assignments: AssignmentItem[];

  // 分析
  weeklyProgress: WeeklyProgressData[];
  listeningAccuracyByStudent: Record<string, number>;
  vocabularyMasteryByStudent: Record<string, number>;
  writingScoreByStudent: Record<string, number>;

  // ローディング・エラー
  loading: boolean;
  error: string | null;
}
```

#### メソッド

```typescript
// 生徒を読み込む
await loadStudents(classId);

// クラス統計を読み込む
await loadClassStats(classId);

// 課題を読み込む
await loadAssignments(classId);

// 課題を作成
await createAssignment(
  classId,
  title,
  description,
  type,
  dueDate
);

// 生徒詳細を読み込む
await loadStudentDetail(studentId);

// 週間進捗を読み込む
await loadWeeklyProgress(classId, weeks);

// 分析データを読み込む
await loadAnalytics(classId);

// フィードバックを送信
await submitFeedback(studentId, feedback);

// CSV をエクスポート
const csv = await exportStudentData(classId);
const csv = await exportAnalyticsData(classId);
```

### AnalyticsEngine

統計計算エンジン。以下のメソッドを提供：

```typescript
// 基本統計
AnalyticsEngine.calculateAverage(scores);
AnalyticsEngine.calculateMedian(scores);
AnalyticsEngine.calculateStdDev(scores);

// 分析
AnalyticsEngine.getScoreDistribution(scores);
AnalyticsEngine.getPerformanceTrend(scores);
AnalyticsEngine.rankStudents(students);
AnalyticsEngine.identifySkillGaps(classAvg, studentScore, skillName);

// 特別な計算
AnalyticsEngine.calculateMasteryPercentage(mastered, total);
AnalyticsEngine.calculateLearningVelocity(scores);
AnalyticsEngine.identifyAtRiskStudents(students);
AnalyticsEngine.calculateEngagementRate(students);
```

## データフロー

```
teacher.tsx (ページ)
  ↓
useTeacherStore (状態管理)
  ↓
Supabase DB (データベース)
  ↓
TeacherAnalytics (表示) ← AnalyticsEngine (計算)
```

## 使用シナリオ

### シナリオ 1: クラスの概況確認
1. 講師ダッシュボードを開く
2. 「概要」タブで、生徒数・平均スコア・参加率を確認
3. 「分析」タブで週間進捗グラフを確認

### シナリオ 2: 課題を割り当てる
1. 「課題」タブを開く
2. 「+ 新しい課題を作成」をタップ
3. タイトル、説明、タイプ、期限を入力
4. 「課題を作成」で確定

### シナリオ 3: 生徒の詳細を確認・フィードバック
1. 「生徒」タブを開く
2. 生徒をタップして詳細画面へ遷移
3. リスニング精度、単語習熟度、ライティングスコアを確認
4. 「フィードバック」モーダルで評価・指導内容を入力
5. 「フィードバックを送信」で確定

### シナリオ 4: 分析ダッシュボードでレポート作成
1. 「分析」タブを開く
2. スコア分布、スキル比較、成績優秀者ランキングを確認
3. 要注視の生徒リストで対応が必要な生徒を特定
4. CSV エクスポートで詳細データを取得

## カスタマイズガイド

### モックデータを実データに変更

`teacherStore.ts` の `loadStudents` メソッド内：

```typescript
// 変更前（モック）
listeningScore: Math.floor(Math.random() * 100),

// 変更後（実データ）
listeningScore: await fetchListeningScore(profile.id),
```

### グラフをカスタマイズ

`TeacherAnalytics.tsx` の `chartConfig`：

```typescript
const chartConfig = {
  backgroundColor: '#ffffff',
  color: (opacity = 1) => `rgba(0, 102, 204, ${opacity})`,
  // 他のプロパティを変更
};
```

### 色スキームを変更

`TeacherAnalytics.tsx` と `teacher.tsx` の `styles`：

```typescript
const styles = StyleSheet.create({
  sectionTitle: {
    color: '#333',  // ← 変更
  },
});
```

## パフォーマンス最適化

### 1. ページング
大量の生徒データがある場合、ページング機能を追加：

```typescript
const [page, setPage] = useState(1);
const pageSize = 20;

const paginatedStudents = students.slice(
  (page - 1) * pageSize,
  page * pageSize
);
```

### 2. キャッシング
Zustand でキャッシュ時間を設定：

```typescript
const lastLoadTime = useRef(Date.now());

useEffect(() => {
  const now = Date.now();
  // 5 分以内なら再読込しない
  if (now - lastLoadTime.current > 5 * 60 * 1000) {
    loadStudents(classId);
    lastLoadTime.current = now;
  }
}, []);
```

### 3. 非表示コンポーネントの遅延読込
`React.memo` で不要な再レンダリングを防止：

```typescript
const TeacherAnalyticsMemo = React.memo(TeacherAnalytics);
```

## トラブルシューティング

### データが読み込まれない

1. **Supabase 接続確認**
   ```typescript
   const { data, error } = await supabase.from('assignments').select('*');
   console.log(error); // エラーメッセージを確認
   ```

2. **RLS ポリシー確認**
   - Supabase Dashboard → Authentication → RLS
   - ポリシーが正しく設定されているか確認

3. **トークン確認**
   ```typescript
   const session = await supabase.auth.getSession();
   console.log(session.data.session?.user.id);
   ```

### グラフが表示されない

1. **チャートライブラリ確認**
   ```bash
   npm list react-native-chart-kit
   ```

2. **データフォーマット確認**
   ```typescript
   console.log(weeklyProgress);  // データ構造を確認
   ```

### モーダルが閉じない

```typescript
// showAssignmentModal の初期値を確認
const [showAssignmentModal, setShowAssignmentModal] = useState(false);

// モーダルを閉じる処理
setShowAssignmentModal(false);
```

## セキュリティ考慮事項

### 1. RLS ポリシー
- 講師は自分の生徒のデータのみアクセス可能
- 生徒は自分のデータのみ閲覧可能

### 2. 認証チェック
```typescript
const { user } = useAuthStore();
if (!user || user.role !== 'teacher') {
  // 講師以外はアクセス拒否
}
```

### 3. API キー管理
- Supabase Anon Key を使用
- Service Role Key は backend のみ

## 次のステップ

### Phase 2: リアルタイム更新
```typescript
supabase
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'learning_progress'
  }, () => {
    loadAnalytics(classId);
  })
  .subscribe();
```

### Phase 3: AI による自動フィードバック
```typescript
const aiRecommendations = await generateAIFeedback({
  listeningAccuracy: student.listeningAccuracy,
  vocabularyProgress: student.vocabularyProgress,
  writingScore: student.writingScore,
});
```

### Phase 4: エクスポート機能拡張
- PDF レポート生成
- メール送信機能
- Google Classroom 連携

## API リファレンス

### クラス統計取得
```sql
SELECT * FROM class_statistics WHERE class_id = ?
```

### 学生パフォーマンス
```sql
SELECT * FROM student_performance WHERE class_id = ?
```

### 週間統計
```sql
SELECT * FROM get_weekly_stats(student_id, 4)
```

## FAQ

**Q: 何人の生徒をサポートできますか？**
A: SQL の最適化により、数千人規模までスケーラブルです。

**Q: グラフに過去データを表示できますか？**
A: はい、`loadWeeklyProgress(classId, weeks)` で期間を指定できます。

**Q: CSVエクスポートの形式をカスタマイズできますか？**
A: はい、`exportStudentData` メソッドを編集して対応可能です。

**Q: リアルタイム通知を追加できますか？**
A: はい、Supabase Realtime または Firebase Cloud Messaging で可能です。

## サポート

問題が発生した場合は、以下を確認してください：

1. コンソールログのエラーメッセージ
2. Supabase ダッシュボードのデータベース状態
3. RLS ポリシーの設定
4. 認証ユーザーのロール（teacher）

---

**Last Updated**: 2026-03-19
**Version**: 1.0.0
