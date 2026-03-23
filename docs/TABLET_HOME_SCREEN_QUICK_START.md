# Tablet Home Screen - Quick Start Guide

## What Was Built?

A complete tablet-optimized home screen redesign for EigoMaster that provides a Duolingo-like interface. The home screen automatically adapts:

- **Tablets (600px+):** Modern, spacious tablet layout
- **Mobile (<600px):** Original mobile layout (backward compatible)

## Key Components

| Component | Purpose | Location |
|-----------|---------|----------|
| **TabletHomeScreen** | Main orchestrator | `components/TabletHomeScreen.tsx` |
| **WelcomeHeader** | Greeting + Level badge | `components/TabletComponents/WelcomeHeader.tsx` |
| **StatusBar** | Streak, Hearts, XP display | `components/TabletComponents/StatusBar.tsx` |
| **DailyGoalsSection** | 3 daily goal cards | `components/TabletComponents/DailyGoalsSection.tsx` |
| **LearningStatsSection** | Mastery %, skill breakdown | `components/TabletComponents/LearningStatsSection.tsx` |
| **QuickActionButtons** | 6 action buttons grid | `components/TabletComponents/QuickActionButtons.tsx` |
| **LearningStatsDashboard** | Full statistics page | `components/TabletComponents/LearningStatsDashboard.tsx` |

## File Structure

```
components/
├── TabletHomeScreen.tsx ⭐ (main entry point)
└── TabletComponents/
    ├── WelcomeHeader.tsx
    ├── StatusBar.tsx
    ├── DailyGoalsSection.tsx
    ├── LearningStatsSection.tsx
    ├── QuickActionButtons.tsx
    └── LearningStatsDashboard.tsx

constants/
└── tablet-responsive.ts (responsive utilities)

app/(tabs)/
├── index.tsx (router - routes to TabletHomeScreen or legacy-home)
└── legacy-home.tsx (mobile fallback)
```

## Layout Overview

```
┌─────────────────────────────────────┐
│ Welcome Header (80px)               │
│ "おはよう、Akihiroさん！" Lv.5   │
├─────────────────────────────────────┤
│ Status Bar (40px)                   │
│ 🔥 7日 | ❤️ x3 | ⭐ 1250XP         │
├─────────────────────────────────────┤
│ Daily Goals (160px)                 │
│ [🎧 Listening] [📚 Vocab] [✏️ Writ]│
├─────────────────────────────────────┤
│ Learning Stats (300px)              │
│ 習熟度: 46.9% | Skills | Time Est. │
├─────────────────────────────────────┤
│ Quick Actions (120px)               │
│ [Stats] [Settings] [Parent] etc.    │
├─────────────────────────────────────┤
│ Total: ~700px (fits tablet screen)  │
└─────────────────────────────────────┘
```

## How It Works

### 1. Automatic Routing

**File:** `app/(tabs)/index.tsx`

```typescript
export default function HomeScreen() {
  return isTablet ? <TabletHomeScreen /> : <LegacyHomeScreen />;
}
```

- If screen width >= 600px → shows **TabletHomeScreen**
- If screen width < 600px → shows **LegacyHomeScreen** (mobile)

### 2. Data Flow

Components receive data from **Zustand stores:**

```
useLearningStore()      → streakDays, totalXP, currentLevel, hearts
useListeningStore()     → listening progress data
useVocabularyStore()    → vocabulary progress data
useWritingStore()       → writing progress data
useAuthStore()          → user name/email
```

Each component is **self-contained** and calculates its own display values.

### 3. Responsive Design

Uses constants from `theme.ts`:
- Colors: `Colors.light.*` for consistent palette
- Spacing: `Spacing.xs` through `Spacing.xxl`
- Typography: `Typography.h1` through `Typography.caption`
- Shadows: `Shadows.xs` through `Shadows.lg`

## Component Details

### WelcomeHeader

```typescript
<WelcomeHeader
  userName="Akihiro"
  level={5}
  xp={1250}
/>
```

Shows greeting + date + level badge in header.

### StatusBar

```typescript
<StatusBar
  streak={7}
  hearts={3}
  xp={1250}
/>
```

Three compact status items in one row.

### DailyGoalsSection

```typescript
<DailyGoalsSection
  listeningGoal={{ count: 1, xpReward: 10, completed: true }}
  vocabularyGoal={{ count: 50, xpReward: 50, completed: false }}
  writingGoal={{ count: 1, xpReward: 100, completed: false }}
/>
```

3 cards showing daily goals with progress dots.

### LearningStatsSection

```typescript
<LearningStatsSection
  masteryPercentage={46.9}
  stats={{
    listening: {
      name: 'リスニング',
      completed: 0,
      total: 10,
      icon: '🎧',
    },
    vocabulary: {
      name: '英単語',
      completed: 145,
      total: 250,
      icon: '📚',
    },
    writing: {
      name: 'ライティング',
      completed: 12,
      total: 20,
      icon: '✏️',
    },
  }}
  estimatedHours={5}
  todayMinutes={45}
/>
```

Shows overall mastery + skill breakdown + time estimates.

### QuickActionButtons

```typescript
<QuickActionButtons
  onNavigate={(screen) => {
    router.push(`/(tabs)/${screen}`);
  }}
/>
```

6 buttons for quick navigation (no props needed - self-contained).

### LearningStatsDashboard

```typescript
<LearningStatsDashboard
  title="2次関数の学習成況"
  masteryPercentage={46.9}
  skills={[...]}
  estimatedHours={5}
  todayMinutes={45}
  onClose={() => router.back()}
  showBackButton={true}
/>
```

Full-page detailed statistics view. Can be used as separate route or modal.

## Color Coding

| Mastery Level | Color | Usage |
|---------------|-------|-------|
| 80%+ | Green (#52C41A) | Complete/Excellent |
| 50-79% | Orange (#FAAD14) | Good/Learning |
| <50% | Red (#F5222D) | Needs Work |

## Responsive Utilities

Located in: `constants/tablet-responsive.ts`

**Usage:**

```typescript
import {
  getResponsiveValue,
  isTablet,
  isLargeTablet,
  ViewportInfo
} from '@/constants/tablet-responsive';

// Check if device is tablet
if (isTablet()) {
  // 600px+ screens
}

// Get responsive value
const fontSize = getResponsiveValue(16, 18, 20); // base, tablet, large

// Get viewport info
console.log(ViewportInfo.currentBreakpoint); // 'small' | 'medium' | 'large' | 'xlarge'
```

## Testing

### On Web

```bash
npm run dev:web
# Opens in browser, resize to test different screen sizes
```

### On iPad Simulator

```bash
npx expo start
# Select 'I' for iOS simulator
# Use hardware menu to rotate/resize
```

### Screen Sizes to Test

- iPad Mini: 600x800
- iPad: 768x1024
- iPad Pro: 1024x1366
- Mobile: 375x667 (should show legacy layout)

## Build Status

```
✅ npm run build:web (successful)
✅ 34 static routes compiled
✅ No TypeScript errors
✅ 3.18 MB bundle size
```

## Common Tasks

### Add a New Quick Action Button

Edit `QuickActionButtons.tsx`:

```typescript
const actionButtons = [
  // ... existing buttons
  {
    id: 'myfeature',
    icon: '✨',
    label: 'My Feature',
    screen: 'my-feature-screen',
    color: DuolingoColors.primary,
  },
];
```

### Change Colors

Edit `constants/theme.ts` for color definitions, or override in component styles.

### Adjust Layout Heights

In `TabletHomeScreen.tsx`, modify padding/margins on each section:

```typescript
<View style={styles.section}>
  {/* Content */}
</View>
```

### Add Animation

Wrap components with React Native Animated:

```typescript
import { Animated } from 'react-native';

const fadeAnim = new Animated.Value(0);
Animated.timing(fadeAnim, {
  toValue: 1,
  duration: 500,
  useNativeDriver: true,
}).start();

<Animated.View style={{ opacity: fadeAnim }}>
  {/* Component */}
</Animated.View>
```

### Customize for Different Breakpoints

Use `getResponsiveValue` from `tablet-responsive.ts`:

```typescript
const padding = getResponsiveValue(12, 16, 20); // mobile, tablet, large
```

## Troubleshooting

### "Cannot find module TabletHomeScreen"

Check import path:
```typescript
// ✅ Correct
import TabletHomeScreen from '@/components/TabletHomeScreen';

// ❌ Wrong
import TabletHomeScreen from './components/TabletHomeScreen';
```

### Styles not applying

Ensure all dependencies are imported:
```typescript
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';
```

### Mobile showing tablet layout

Check `app/(tabs)/index.tsx` is using correct router logic:
```typescript
const { width } = Dimensions.get('window');
const isTablet = width >= 600;
return isTablet ? <TabletHomeScreen /> : <LegacyHomeScreen />;
```

### Store data not updating

Ensure Zustand hook is at component top level (not conditional):
```typescript
const { streakDays } = useLearningStore(); // ✅ Top level
// Don't do: if (condition) { const data = useStore(); } ❌
```

## Performance Tips

1. **Memoize expensive calculations:**
   ```typescript
   const masteryPercentage = useMemo(() => {
     // heavy calculation
   }, [dependencies]);
   ```

2. **Use pull-to-refresh sparingly:**
   ```typescript
   <ScrollView
     refreshControl={
       <RefreshControl
         refreshing={refreshing}
         onRefresh={handleRefresh}
       />
     }
   />
   ```

3. **Lazy load statistics dashboard:**
   ```typescript
   import { lazy } from 'react';
   const LearningStatsDashboard = lazy(() =>
     import('@/components/TabletComponents/LearningStatsDashboard')
   );
   ```

## Documentation Links

- **Full Implementation Guide:** `docs/TABLET_HOME_SCREEN_IMPLEMENTATION.md`
- **Theme Constants:** `constants/theme.ts`
- **Responsive Utilities:** `constants/tablet-responsive.ts`

## Support

For issues or questions:
1. Check the full implementation guide
2. Review component prop types
3. Test on actual device/simulator
4. Check build output for errors

---

**Version:** 1.0
**Last Updated:** 2026-03-20
**Status:** ✅ Production Ready
