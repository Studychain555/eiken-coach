# 🚨 EigoMaster - Complete Error Report & Fix Plan

**Generated**: 2026-03-19
**Status**: 🔴 Critical Issues Found

---

## 📊 Error Summary

| Category | Count | Severity |
|----------|-------|----------|
| TypeScript Errors | 8 | 🔴 Critical |
| ESLint Warnings (Unused Vars) | 40+ | 🟡 Medium |
| ESLint Warnings (Hook Dependencies) | 10+ | 🟡 Medium |
| TODO/FIXME Comments | 2 | 🟡 Medium |
| **Total** | **60+** | - |

---

## 🔴 CRITICAL ERRORS (Must Fix)

### 1. ShadowingResultScreen.tsx - Null Check Issues

**Location**: Lines 163, 168
**Error**: TypeScript TS18047 - Property possibly null

```typescript
// ❌ WRONG (lines 163, 168)
{record.accuracyScore.toFixed(1)}
{record.rhythmScore.toFixed(1)}

// record.accuracyScore and record.rhythmScore can be null
```

**Issue**:
- `ShadowingRecord` interface defines `accuracyScore: number | null`
- But code calls `.toFixed(1)` without null check
- Will crash if scores are null

**Fix Required**: Add null check or provide default value

---

### 2. securityManager.ts - Web Environment Issues

**Location**: Lines 240, 423, 427, 451, 472, 664
**Errors**:
- TS2304: Cannot find name 'createHmac'
- TS2552: Cannot find name 'randomBytes'

```typescript
// ❌ WRONG (Web environment doesn't have these)
import { createHmac, randomBytes } from 'crypto';

createHmac('sha256', secret)  // Line 240
randomBytes(16)                // Line 664
```

**Issue**:
- These are Node.js APIs
- Web/browser doesn't support them
- Code imports them at top level, causing parse errors

**Fix Required**:
1. Remove Node.js crypto imports
2. Use Web-compatible alternatives
3. Already has `getRandomBytes()` function - use that instead

---

## 🟡 MEDIUM PRIORITY WARNINGS

### A. Unused Variable Imports (40+ instances)

**Files Affected**:
- `app/(tabs)/register.tsx` - `useLocalSearchParams`
- `app/(tabs)/_layout.tsx` - `Colors`, `colorScheme`
- `app/(tabs)/index.tsx` - `Typography`, `cardWidth`
- `app/(tabs)/listening-redesign.tsx` - `Animated`, `Colors`, `DuolingoColors`, `Typography`, `totalXP`, `xpForNextLevel`, `triggerCelebration`, `setCelebrationType`, `celebrationType`, `progress`
- `app/(tabs)/listening.tsx` - `Shadows`, `Typography`, `DuolingoColors`
- `app/(tabs)/vocabulary.tsx` - `Typography`, `DuolingoColors`, `EnhancedProgressBar`, `StepProgress`, `OptimizedButton`, `router`, `wordsPerStage`, `isCorrect`
- And more...

**Fix**: Remove unused imports and variable assignments

---

### B. React Hook Dependencies Missing (10+ instances)

**Pattern**:
```typescript
// ❌ WRONG - Missing dependencies
useEffect(() => {
  setQuestions(LISTENING_SAMPLE_DATA);
}, []);  // Missing: setQuestions, questions.length

// ❌ WRONG - Missing dependencies
useEffect(() => {
  loadAnalytics();
}, []);  // Missing: loadAnalytics
```

**Affected Files**:
- `app/(tabs)/listening-redesign.tsx` - Lines 70, 133
- `app/(tabs)/listening.tsx` - Line 76
- `app/(tabs)/vocabulary-redesign.tsx` - Line 60
- `app/(tabs)/vocabulary.tsx` - Lines 53, 260
- `app/(tabs)/teacher-integrated.tsx` - Line 70
- `app/(tabs)/teacher.tsx` - Line 70
- `app/(tabs)/writing-redesign.tsx` - Line 45
- `app/(tabs)/writing.tsx` - Line 66
- `app/_layout.tsx` - Lines 22, 35

**Fix**: Add missing dependencies or suppress warning with proper reasoning

---

### C. TODO/FIXME Comments (2 instances)

1. **ShadowingResultScreen.tsx:193**
   ```typescript
   /* TODO: show detailed feedback modal */
   ```
   - Should integrate DetailedShadowingFeedback component

2. **analyticsEngine.ts:123**
   ```typescript
   change: 0, // TODO: Calculate from previous rankings
   ```
   - Missing calculation logic

---

## 📋 Detailed Fix Plan

### Phase 1: Critical Fixes (Must do first)

#### 1.1 Fix securityManager.ts (Priority: 🔴)

**File**: `src/lib/securityManager.ts`

**Changes needed**:
- Remove Node.js crypto imports from top level
- Replace `createHmac` usage with web-compatible alternative
- Replace `randomBytes` with existing `getRandomBytes()` function
- Wrap crypto operations in try-catch for web environment

---

#### 1.2 Fix ShadowingResultScreen.tsx (Priority: 🔴)

**File**: `src/components/ShadowingResultScreen.tsx`

**Changes needed** (Lines 163, 168):
```typescript
// ✅ CORRECT
{(record.accuracyScore ?? 0).toFixed(1)}
{(record.rhythmScore ?? 0).toFixed(1)}

// OR
{record.accuracyScore ? record.accuracyScore.toFixed(1) : '0.0'}
{record.rhythmScore ? record.rhythmScore.toFixed(1) : '0.0'}
```

---

### Phase 2: Remove Unused Imports (Medium Priority)

**Files to clean**:
1. `app/(tabs)/register.tsx` - 1 import
2. `app/(tabs)/_layout.tsx` - 2 imports + 1 variable
3. `app/(tabs)/index.tsx` - 2 variables
4. `app/(tabs)/listening-redesign.tsx` - 8 imports/variables
5. `app/(tabs)/listening.tsx` - 3 imports
6. `app/(tabs)/settings.tsx` - 1 import
7. `app/(tabs)/teacher-integrated.tsx` - 3 variables
8. `app/(tabs)/teacher.tsx` - 3 variables
9. `app/(tabs)/vocabulary-redesign.tsx` - 3 imports/variables
10. `app/(tabs)/vocabulary.tsx` - 8 imports/variables
11. `app/(tabs)/writing-redesign.tsx` - 2 imports/variables
12. `app/(tabs)/writing.tsx` - 4 imports/variables
13. `app/_layout.tsx` - 0 (has dependency issues instead)
14. `app/demo.tsx` - 2 variables

**Strategy**: Remove one file at a time, test build

---

### Phase 3: Fix React Hook Dependencies (Medium Priority)

**Approach**:

**Option A - Add Dependencies**:
```typescript
// ✅ CORRECT
useEffect(() => {
  if (questions.length === 0) {
    setQuestions(LISTENING_SAMPLE_DATA);
  }
}, [questions.length, setQuestions]);
```

**Option B - Suppress with ESLint comment** (if adding dependency causes issues):
```typescript
// eslint-disable-next-line react-hooks/exhaustive-deps
useEffect(() => {
  setQuestions(LISTENING_SAMPLE_DATA);
}, []);
```

**Files to fix**:
1. `app/(tabs)/listening-redesign.tsx` - Lines 70, 133
2. `app/(tabs)/listening.tsx` - Line 76
3. `app/(tabs)/vocabulary-redesign.tsx` - Line 60
4. `app/(tabs)/vocabulary.tsx` - Lines 53, 260
5. `app/(tabs)/teacher-integrated.tsx` - Line 70
6. `app/(tabs)/teacher.tsx` - Line 70
7. `app/(tabs)/writing-redesign.tsx` - Line 45
8. `app/(tabs)/writing.tsx` - Line 66
9. `app/_layout.tsx` - Lines 22, 35

---

### Phase 4: Resolve TODO/FIXME Comments (Low Priority)

#### 4.1 ShadowingResultScreen.tsx:193

**Current**:
```typescript
/* TODO: show detailed feedback modal */
onPress={() => {
  /* TODO: show detailed feedback modal */
}}
```

**Fix**:
```typescript
onPress={() => {
  // Open DetailedShadowingFeedback for this round
  // This can be done by setting a modal state or navigation
  // For now, we'll just comment it out or add a toast message
  Alert.alert('詳細分析', 'この機能はまもなく実装されます');
}}
```

Or properly implement by:
1. Adding a state for selected round details
2. Opening a modal with DetailedShadowingFeedback component

#### 4.2 analyticsEngine.ts:123

**Current**:
```typescript
change: 0, // TODO: Calculate from previous rankings
```

**Fix**:
```typescript
// Calculate change from previous ranking
const change = previousRank ? previousRank - currentRank : 0;
```

Or if not available:
```typescript
change: 0, // Placeholder - requires historical ranking data
```

---

## 🛠️ Fix Execution Order

### Step 1: Critical (Blocking Build) ✅
1. [ ] Fix securityManager.ts crypto imports
2. [ ] Fix ShadowingResultScreen.tsx null checks
3. [ ] Verify npm run build:web succeeds

### Step 2: Remove Unused Imports ⭐
1. [ ] Clean register.tsx
2. [ ] Clean _layout.tsx
3. [ ] Clean index.tsx
4. [ ] Clean listening-redesign.tsx
5. [ ] Clean listening.tsx
6. [ ] Clean settings.tsx
7. [ ] Clean teacher-integrated.tsx
8. [ ] Clean teacher.tsx
9. [ ] Clean vocabulary-redesign.tsx
10. [ ] Clean vocabulary.tsx
11. [ ] Clean writing-redesign.tsx
12. [ ] Clean writing.tsx
13. [ ] Clean demo.tsx
14. [ ] Verify npm run lint passes

### Step 3: Fix Hook Dependencies 🔄
1. [ ] Fix listening-redesign.tsx (Lines 70, 133)
2. [ ] Fix listening.tsx (Line 76)
3. [ ] Fix vocabulary-redesign.tsx (Line 60)
4. [ ] Fix vocabulary.tsx (Lines 53, 260)
5. [ ] Fix teacher-integrated.tsx (Line 70)
6. [ ] Fix teacher.tsx (Line 70)
7. [ ] Fix writing-redesign.tsx (Line 45)
8. [ ] Fix writing.tsx (Line 66)
9. [ ] Fix _layout.tsx (Lines 22, 35)
10. [ ] Verify npm run lint passes

### Step 4: Resolve TODOs 📝
1. [ ] Fix ShadowingResultScreen.tsx (Line 193)
2. [ ] Fix analyticsEngine.ts (Line 123)

### Step 5: Final Verification ✅
1. [ ] npm run build:web (no errors)
2. [ ] npm run lint (no errors/warnings)
3. [ ] npm run web (starts without console errors)
4. [ ] Manual testing

---

## 📊 Estimated Timeline

| Phase | Files | Time | Priority |
|-------|-------|------|----------|
| 1: Critical | 2 | 15min | 🔴 |
| 2: Unused Imports | 13 | 30min | 🟡 |
| 3: Hook Dependencies | 9 | 40min | 🟡 |
| 4: TODOs | 2 | 10min | 🟡 |
| 5: Verification | - | 10min | ✅ |
| **Total** | **26** | **105min** | - |

---

## ✅ Success Criteria

- [ ] `npx tsc --noEmit` returns 0 errors
- [ ] `npm run lint` returns 0 errors and 0 warnings
- [ ] `npm run build:web` completes successfully
- [ ] `npm run web` starts without console errors
- [ ] Application loads and runs without crashes
- [ ] All shadowing features work correctly

---

## 🚀 Next Steps

This report provides:
1. ✅ Complete list of all issues
2. ✅ Detailed explanations of each issue
3. ✅ Specific fix instructions
4. ✅ Execution order and timeline

**Ready to start fixing?**
