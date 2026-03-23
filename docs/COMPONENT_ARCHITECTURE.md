# 🏗️ EigoMaster コンポーネント設計書

## Component Hierarchy（コンポーネント階層図）

```
App
├── AuthLayout
│   ├── LoginScreen
│   └── SignupScreen
│
├── MainLayout
│   ├── BottomTabNavigator
│   │   ├── HomeTab
│   │   ├── ListeningTab
│   │   ├── VocabularyTab
│   │   ├── WritingTab
│   │   └── ProfileTab
│   │
│   └── SharedComponents
│       ├── Header
│       ├── ProgressBar
│       ├── Card
│       ├── Button
│       ├── FeedbackCard
│       ├── CelebrationAnimation
│       └── XPRewardSystem
│
└── TutorialStack
    └── ShadowingTutorial
```

---

## 📁 File Structure（ファイル構成）

```
/Users/80dr/eigomaster/
├── app/
│   ├── (auth)/
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   └── signup.tsx
│   │
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx (HomeScreen)
│   │   ├── listening.tsx (or listening-redesign.tsx)
│   │   ├── vocabulary.tsx (or vocabulary-redesign.tsx)
│   │   ├── writing.tsx (or writing-redesign.tsx)
│   │   └── profile.tsx
│   │
│   ├── _layout.tsx (RootLayout)
│   ├── shadowing-tutorial.tsx
│   └── demo.tsx
│
├── src/
│   ├── components/
│   │   ├── CelebrationAnimation.tsx (✨ 正解時の celebration)
│   │   ├── ComboCounter.tsx (連続正解カウンター)
│   │   ├── DailyGoal.tsx (日次ゴール表示)
│   │   ├── InteractiveButton.tsx (タップアニメーション)
│   │   ├── StreakBanner.tsx (ストリーク表示)
│   │   ├── XPRewardSystem.tsx (XP・ハート・レベル表示)
│   │   ├── EnhancedProgressBar.tsx (進捗バー)
│   │   ├── OptimizedButton.tsx (複数 variant のボタン)
│   │   ├── GamificationElements/
│   │   │   ├── Badge.tsx
│   │   │   ├── StreakDisplay.tsx
│   │   │   ├── ProgressRing.tsx
│   │   │   ├── LevelBadge.tsx
│   │   │   └── AchievementCard.tsx
│   │   └── Layout/
│   │       ├── Header.tsx
│   │       ├── BottomNavigator.tsx
│   │       └── SafeAreaWrapper.tsx
│   │
│   ├── stores/
│   │   ├── listeningStore.ts (Zustand store + Supabase)
│   │   ├── vocabularyStore.ts
│   │   ├── writingStore.ts
│   │   └── authStore.ts
│   │
│   ├── lib/
│   │   ├── celebrationAnimations.ts (animation utilities)
│   │   ├── aiScoringService.ts
│   │   ├── audioManager.enhanced.ts
│   │   ├── listeningData.ts (sample data)
│   │   ├── vocabularyData.ts
│   │   ├── writingData.ts
│   │   └── errorHandler.ts
│   │
│   └── hooks/
│       ├── useListeningStore.ts
│       ├── useVocabularyStore.ts
│       ├── useWritingStore.ts
│       └── useAnimation.ts
│
├── constants/
│   └── theme.ts (🎨 全カラー・タイポグラフィ・スペーシング定義)
│
├── docs/
│   ├── DESIGN_SYSTEM_SHADOTEN.md (このファイル)
│   ├── COMPONENT_ARCHITECTURE.md (今から作成)
│   ├── IMPLEMENTATION_GUIDE.md (実装ガイド)
│   └── CHANGELOG.md (変更履歴)
│
├── package.json
├── tsconfig.json
├── tailwind.config.js (not used - React Native)
└── README.md
```

---

## 🧩 Core Components（コア コンポーネント）

### 1. Header Component

**ファイル**: `src/components/Layout/Header.tsx`

**Props**:
```typescript
interface HeaderProps {
  title: string;
  subtitle?: string;
  rightElement?: React.ReactNode;
  showBackButton?: boolean;
  onBackPress?: () => void;
}
```

**ビジュアル**:
```
┌─────────────────────────────────────┐
│ ← 🎧 リスニング        Lv.12 ❤️x3   │
├─────────────────────────────────────┤
│ 英検準1級 - 会話理解                 │
└─────────────────────────────────────┘
```

**使用例**:
```jsx
<Header
  title="🎧 リスニング"
  subtitle="英検準1級 - 会話理解"
  rightElement={<LevelBadge level={12} />}
/>
```

---

### 2. Card Component

**ファイル**: `src/components/Card.tsx` (新規作成予定)

**Props**:
```typescript
interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'good' | 'bad' | 'warning';
  leftBorder?: boolean;
  padding?: 'sm' | 'md' | 'lg';
  onPress?: () => void;
}
```

**Variants**:
- `default`: 白背景 + 左青緑ボーダー
- `good`: 青緑背景 + 白テキスト (Good Points)
- `bad`: ピンク背景 + 白テキスト (Development Points)
- `warning`: 黄色背景 + 黒テキスト

---

### 3. Button Component

**ファイル**: `src/components/OptimizedButton.tsx` (既存)

**Variants**:
```typescript
type ButtonVariant =
  | 'primary'      // 青緑背景、白テキスト
  | 'secondary'    // 白背景、青緑テキスト + ボーダー
  | 'success'      // グリーン背景、白テキスト
  | 'danger'       // ピンク背景、白テキスト
  | 'tertiary'     // グレー背景、黒テキスト
```

---

### 4. FeedbackCard Component

**ファイル**: `src/components/FeedbackCard.tsx` (新規作成予定)

**Props**:
```typescript
interface FeedbackCardProps {
  type: 'good' | 'development';
  title: string;
  description: string;
  example?: string;
  expandable?: boolean;
}
```

**ビジュアル**:
```
┌─ Good Points ──────────────────┐
│ ✅ 正解!                        │
│ 意味を正しく理解できました      │
│                                 │
│ 例: "Play" は ...              │
└─────────────────────────────────┘

┌─ Development Points ────────────┐
│ 🔥 改善が必要                    │
│ もう一度聞いて確認しましょう    │
│                                 │
│ 例: 発音に注意 ...              │
└─────────────────────────────────┘
```

---

### 5. ProgressBar Component

**ファイル**: `src/components/EnhancedProgressBar.tsx` (既存)

**Props**:
```typescript
interface ProgressBarProps {
  progress: number;        // 0-100
  variant?: 'default' | 'timebonus' | 'xp';
  height?: number;
  showLabel?: boolean;
  animated?: boolean;
}
```

---

### 6. CelebrationAnimation Component

**ファイル**: `src/components/CelebrationAnimation.tsx` (既存)

**Types**:
```typescript
type CelebrationType =
  | 'confetti'      // 🎉 パーティクル落下
  | 'heartPop'      // ❤️ ハートスケール + フェード
  | 'xpFloat'       // +XP テキスト浮上
  | 'combo'         // x5 Combo!
  | 'levelUp'       // 🌟 レベルアップ
  | 'correct'       // ✅ 正解フラッシュ
  | 'incorrect'     // ❌ 不正解フラッシュ
```

---

### 7. XPRewardSystem Component

**ファイル**: `src/components/XPRewardSystem.tsx` (既存)

**Props**:
```typescript
interface XPRewardSystemProps {
  hearts: number;        // 0-3
  level: number;
  xp: number;
  xpForNextLevel: number;
  streakDays: number;
}
```

**ビジュアル**:
```
❤️x2  ⭐ Lv.12  🔥7日
```

---

## 🎨 Design Tokens（デザイン トークン）

### Color Tokens

```typescript
// constants/theme.ts
export const ShadotenColors = {
  // Primary
  headerTeal: '#1B9BA4',
  teal: '#1B9BA4',

  // Feedback
  goodPointsTeal: '#1B9BA4',
  developmentPointsRed: '#E85D6F',

  // Interactive
  timeBonus: '#FAAD14',

  // Backgrounds
  cardWhite: '#FFFFFF',
  contentBg: '#F5F5F5',

  // Text
  textDark: '#333333',
  textLight: '#666666'
}
```

### Spacing Tokens

```typescript
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32
}
```

### Border Radius Tokens

```typescript
export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999
}
```

---

## 🔄 State Management（状態管理）

### Zustand Store Structure

```
User State (authStore)
├── currentUser
├── isAuthenticated
└── login/logout methods

Listening State (listeningStore)
├── questions
├── currentIndex
├── hearts
├── level
├── xp
├── streak
├── dailyGoal
└── updateQuestion/recordXP methods

Vocabulary State (vocabularyStore)
├── words
├── currentUnit
├── hearts
├── level
└── similar methods

Writing State (writingStore)
├── prompts
├── currentPrompt
├── submissions
├── score
└── similar methods
```

---

## 🎬 Screen Flow（スクリーン フロー）

```
SplashScreen (entry)
    ↓
├─→ AuthStack (not authenticated)
│   ├── LoginScreen
│   ├── SignupScreen
│   └── ShadowingTutorial (new user)
│
└─→ MainStack (authenticated)
    ├── HomeScreen (dashboard)
    ├── ListeningScreen
    │   ├── List View (問題選択)
    │   ├── Question View (問題実施)
    │   └── Result View (スコア表示)
    │
    ├── VocabularyScreen
    │   ├── Stage Select
    │   ├── Test View
    │   └── Result View
    │
    ├── WritingScreen
    │   ├── Prompt Select
    │   ├── Editor View
    │   └── Scoring View
    │
    └── ProfileScreen
```

---

## 🧪 Testing Strategy（テスト戦略）

### Unit Tests
- `CelebrationAnimation.test.tsx` - animation triggers
- `Button.test.tsx` - button states & press handlers
- `Card.test.tsx` - variant rendering

### Integration Tests
- `ListeningFlow.test.tsx` - question → answer → result flow
- `ShadowingTutorial.test.tsx` - step progression

### E2E Tests
- `CompleteLesson.e2e.test.ts` - 1 lesson start to finish
- `UserJourney.e2e.test.ts` - signup → tutorial → first lesson

---

## 📱 Responsive Design（レスポンシブ設計）

### Mobile (0px ~ 768px)
- Single column layout
- Full-width cards
- Large touch targets (44×44px)
- Vertical spacing 16px

### Tablet (768px ~ 1024px)
- Potential 2-column layout
- Side-by-side panels
- Maintained touch targets

### Desktop (1024px ~)
- 3-column layout possible
- More spacious layout
- Optimized for mouse/keyboard

---

## ⚡ Performance Optimization（パフォーマンス）

### Code Splitting
- Route-based code splitting
- Lazy load heavy components

### Image Optimization
- Use `expo-image` for caching
- Responsive image sizing
- WebP format where possible

### Animation Performance
- Use `useNativeDriver: true` in Animated
- Memoize animation components
- Limit simultaneous animations

### Memory Management
- Clean up listeners in useEffect
- Cancel animations on unmount
- Throttle frequent updates

---

## 🔐 Accessibility（アクセシビリティ）

### WCAG 2.1 Level AA

- [ ] Color contrast 4.5:1
- [ ] Text size 14px+ on mobile
- [ ] Touch target 44×44px+
- [ ] Keyboard navigation support
- [ ] Screen reader labels
- [ ] Focus indicators

### Testing
```bash
npx react-native-accessibility-test
```

---

## 📊 Metrics & Analytics（メトリクス）

### Track
- Session duration
- Lesson completion rate
- Accuracy rate by type
- Time spent per question
- User engagement funnel

### Tools
- Sentry (error tracking)
- Analytics (user behavior)
- Firebase (optional)

---

## 📚 Related Documents

- [DESIGN_SYSTEM_SHADOTEN.md](./DESIGN_SYSTEM_SHADOTEN.md) - 色・タイポグラフィ仕様
- [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) - 実装ステップバイステップ
- [API_INTEGRATION.md](./API_INTEGRATION.md) - API統合ガイド

---

**最終更新**: 2026-03-19
**バージョン**: 1.0
**ステータス**: ✅ アーキテクチャ確定
