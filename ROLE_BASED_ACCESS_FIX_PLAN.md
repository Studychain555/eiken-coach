# 🔐 Role-Based Access Control Implementation Plan

**Issue**: 生徒が講師管理画面を見ることができてしまう

**Solution**: ユーザーのロール（student/teacher）に基づいて表示画面を分離

---

## 📊 Current State Analysis

### Problem Points

1. **TabLayout** - すべてのユーザーに teacher タブが表示される
   - File: `app/(tabs)/_layout.tsx`
   - Current: 6 tabs always visible (home, listening, vocabulary, writing, teacher, settings)
   - Need: teacher tab only for teacher/admin roles

2. **AuthStore** - role 情報がメタデータに保存されていない
   - File: `src/stores/authStore.ts`
   - Current: role は signUp で受け取るが、Supabase に保存されない
   - Current: initializeAuth で role がハードコード 'student'（line 52）
   - Need: role を Supabase user_metadata に保存・取得

3. **Teacher Pages** - アクセス制御がない
   - Files: `app/(tabs)/teacher.tsx`, `app/(tabs)/teacher-integrated.tsx`
   - Current: 誰でもアクセス可能
   - Need: teacher/admin ロールのみアクセス可能に

---

## 🔧 Implementation Steps

### Phase 1: AuthStore 修正（優先度: 🔴）

#### Step 1.1: AuthState に role フィールド追加

**File**: `src/stores/authStore.ts`

```typescript
interface AuthState {
  user: User | null;
  session: Session | null;
  role: 'student' | 'teacher' | 'admin' | null;  // 追加
  loading: boolean;
  // ... rest
}
```

#### Step 1.2: signUp で role を metadata に保存

**File**: `src/stores/authStore.ts` - signUp メソッド

```typescript
// 現在の実装（role が保存されていない）
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: { name }  // role がない!
  }
});

// 修正版
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: {
      name,
      role  // role を追加
    }
  }
});
```

#### Step 1.3: initializeAuth で role を取得

**File**: `src/stores/authStore.ts` - initializeAuth メソッド

```typescript
// 現在（role がハードコード）
await SessionManager.createSession(
  session.user.id,
  session.user.email || '',
  'student'  // ❌ 常に student
);

// 修正版
const userRole = session.user.user_metadata?.role || 'student';
await SessionManager.createSession(
  session.user.id,
  session.user.email || '',
  userRole  // ✅ metadata から取得
);

set({
  session,
  user: session.user,
  role: userRole as 'student' | 'teacher' | 'admin',
  loading: false,
});
```

#### Step 1.4: signIn で role を取得・保存

**File**: `src/stores/authStore.ts` - signIn メソッド

```typescript
// signIn 後に role を取得
if (data.session?.user) {
  const userRole = data.session.user.user_metadata?.role || 'student';
  set({
    session: data.session,
    user: data.session.user,
    role: userRole as 'student' | 'teacher' | 'admin',
    loading: false,
  });
}
```

---

### Phase 2: TabLayout 修正（優先度: 🔴）

#### Step 2.1: useAuthStore から role を取得

**File**: `app/(tabs)/_layout.tsx`

```typescript
import { useAuthStore } from '@/src/stores/authStore';

export default function TabLayout() {
  const role = useAuthStore(state => state.role);

  // teacher/admin のみ teacher タブを表示
  const isTeacher = role === 'teacher' || role === 'admin';

  return (
    <Tabs screenOptions={{...}}>
      {/* 常に表示 */}
      <Tabs.Screen name="index" options={{...}} />
      <Tabs.Screen name="listening" options={{...}} />
      <Tabs.Screen name="vocabulary" options={{...}} />
      <Tabs.Screen name="writing" options={{...}} />

      {/* teacher/admin のみ表示 */}
      {isTeacher && (
        <Tabs.Screen name="teacher" options={{...}} />
      )}

      {/* 常に表示 */}
      <Tabs.Screen name="settings" options={{...}} />
    </Tabs>
  );
}
```

---

### Phase 3: Teacher Pages のアクセス制御（優先度: 🟡）

#### Step 3.1: TeacherScreen コンポーネント作成

**File**: `src/components/TeacherAccessGuard.tsx` (新規)

```typescript
import { useAuthStore } from '@/src/stores/authStore';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';

interface TeacherAccessGuardProps {
  children: React.ReactNode;
  requiredRole?: 'teacher' | 'admin';
}

export default function TeacherAccessGuard({
  children,
  requiredRole = 'teacher',
}: TeacherAccessGuardProps) {
  const role = useAuthStore(state => state.role);
  const router = useRouter();

  useEffect(() => {
    // ロールチェック
    if (!role || (requiredRole === 'teacher' && role === 'student')) {
      // student は teacher ページにアクセス不可
      console.warn('Access denied: insufficient role');
      router.replace('/(tabs)/');
    }
  }, [role]);

  // ロール確認中または権限がない場合
  if (!role || (requiredRole === 'teacher' && role === 'student')) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.text}>アクセス権限がありません</Text>
          <Text style={styles.subText}>講師のみがアクセス可能です</Text>
        </View>
      </SafeAreaView>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  subText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
});
```

#### Step 3.2: Teacher Pages にガードを追加

**Files**: `app/(tabs)/teacher.tsx`, `app/(tabs)/teacher-integrated.tsx`

```typescript
import TeacherAccessGuard from '@/src/components/TeacherAccessGuard';

export default function TeacherScreen() {
  return (
    <TeacherAccessGuard requiredRole="teacher">
      {/* 既存の teacher 画面内容 */}
    </TeacherAccessGuard>
  );
}
```

---

### Phase 4: Demo Mode での role 設定（優先度: 🟡）

#### Step 4.1: Demo ユーザーロール設定

**File**: `app/demo.tsx`

```typescript
// Demo mode setup
useEffect(() => {
  const initializeDemo = async () => {
    // Demo ユーザーロール（デフォルト: student）
    const demoRole = 'student'; // または 'teacher'

    // AuthStore に設定
    useAuthStore.setState({
      role: demoRole,
      user: { id: 'demo-user', ... },
    });
  };

  initializeDemo();
}, []);
```

---

## 📋 Detailed Implementation Checklist

### Phase 1: AuthStore Fix
- [ ] AuthState インターフェースに `role` フィールド追加
- [ ] signUp メソッドで role を user_metadata に保存
- [ ] initializeAuth メソッドで role を metadata から取得
- [ ] signIn メソッドで role を metadata から取得
- [ ] signOut メソッドで role をクリア
- [ ] TypeScript 型チェック: `npx tsc --noEmit`
- [ ] ビルド: `npm run build:web`

### Phase 2: TabLayout Fix
- [ ] TabLayout で useAuthStore から role 取得
- [ ] teacher タブを条件付きでレンダリング
- [ ] Loading 状態での表示対応
- [ ] TypeScript 型チェック
- [ ] ビルド確認

### Phase 3: Teacher Page Guard
- [ ] TeacherAccessGuard コンポーネント作成
- [ ] teacher.tsx にガードを追加
- [ ] teacher-integrated.tsx にガードを追加
- [ ] TypeScript 型チェック
- [ ] ビルド確認

### Phase 4: Demo Mode
- [ ] Demo ユーザーロール設定
- [ ] 両方のロール（student/teacher）でテスト
- [ ] ナビゲーション動作確認

### Phase 5: Testing
- [ ] Student ログイン → teacher タブ表示なし
- [ ] Teacher ログイン → teacher タブ表示あり
- [ ] Student が teacher URL にアクセス → リダイレクト
- [ ] Teacher が teacher URL にアクセス → 表示可能
- [ ] Demo mode での両ロールテスト

---

## 🎯 Expected Behavior After Implementation

### Student User
```
┌─────────────────────────────────────┐
│  ホーム | リスニング | 単語         │
│  ライティング | 設定                 │
└─────────────────────────────────────┘
- teacher タブは表示されない
- /teacher URL へのアクセスで home にリダイレクト
```

### Teacher User
```
┌────────────────────────────────────────┐
│  ホーム | リスニング | 単語            │
│  ライティング | 講師 | 設定            │
└────────────────────────────────────────┘
- teacher タブが表示される
- /teacher URL へアクセス可能
```

---

## ⚠️ Important Notes

### User Metadata Limitations
- Supabase の user_metadata は public に見える
- 機密情報は `app_metadata` に保存（現在はロール情報には不要）
- 本番環境では server-side の権限確認も必須

### Demo Mode Considerations
- Demo user の role を簡単に切り替えられるように
- 両方のロールで機能テストできるように
- ユーザー名に「(Student)」「(Teacher)」表示するオプション

### Supabase Database Design
```sql
-- users テーブルの user_metadata 構造
{
  "name": "John Doe",
  "role": "student"  -- または "teacher"
}
```

---

## 📊 Risk Assessment

| Risk | Level | Mitigation |
|------|-------|-----------|
| Role metadata not persisted | 🟡 Low | Add fallback to 'student' |
| Teacher pages accessed before role loads | 🟡 Low | Add loading states |
| Backwards compatibility | 🟡 Low | Default to 'student' if not set |

---

## 🚀 Estimated Timeline

| Phase | Files | Est. Time | Difficulty |
|-------|-------|-----------|-----------|
| 1: AuthStore | 1 | 20 min | 🔴 Medium |
| 2: TabLayout | 1 | 10 min | 🟢 Easy |
| 3: Access Guard | 3 | 20 min | 🟡 Medium |
| 4: Demo Mode | 1 | 10 min | 🟢 Easy |
| 5: Testing | - | 20 min | 🟡 Medium |
| **Total** | **6** | **80 min** | - |

---

## ✅ Success Criteria

- [ ] Students cannot see teacher tab
- [ ] Teachers can see teacher tab
- [ ] Student accessing /teacher redirects to home
- [ ] Teacher can access /teacher without issues
- [ ] Build succeeds with no errors
- [ ] ESLint passes (or acceptable warnings)
- [ ] All roles work in demo mode
- [ ] No console errors related to role checking

---

**Ready to implement?**
