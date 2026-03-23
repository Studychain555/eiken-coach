# Tablet Home Screen - Visual Reference Guide

## Component Layout Diagrams

### Full Screen Layout (Tablet - 768px width)

```
┌──────────────────────────────────────────────────────┐ 80px
│                    WELCOME HEADER                    │
│  おはよう、Akihiroさん！           ⭐ Lv. 5        │
│  木 (Thu) 3月 (Mar) 20日                1250XP        │
├──────────────────────────────────────────────────────┤ 40px
│               STATUS BAR                              │
│  🔥 連続学習        │ ❤️ ハート      │ ⭐ 経験値   │
│  7日              │ x3             │ 1250XP          │
├──────────────────────────────────────────────────────┤ 160px
│               DAILY GOALS SECTION                    │
│  今日の目標                                          │
│ ┌─────────────┬─────────────┬─────────────┐         │
│ │ 🎧        │ 📚         │ ✏️          │         │
│ │リスニング  │英単語      │ライティング  │         │
│ │ 1問       │ 50語       │ 1問        │         │
│ │ ○○⚪    │ ○○⚪     │ ○⚪⚪     │         │
│ │ +10XP    │ +50XP     │ +100XP     │         │
│ └─────────────┴─────────────┴─────────────┘         │
├──────────────────────────────────────────────────────┤ 300px
│            LEARNING STATS SECTION                    │
│  学習進捗                                            │
│  ┌──────────────────────────────────────────────┐   │
│  │           46.9%  (大きく表示)               │   │
│  │ ████████░░░░ (progress bar)                 │   │
│  │ 100% 完全習得 | 50% 学習中 | 0% 計画中    │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  リスニング    0/10   0%   ████░░░░░░            │
│  英単語      145/250  58%   ████████░░            │
│  ライティング  12/20  60%   ███████░░░           │
│                                                      │
│  ⏱️ 推定学習時間: 4～6時間                       │
│  📚 本日の学習: 45分                             │
├──────────────────────────────────────────────────────┤ 120px
│           QUICK ACTIONS BUTTONS                      │
│ ┌──────────┬──────────┬──────────┐                 │
│ │ 🎧      │ 📚      │ ✏️       │ (Row 1)        │
│ │リスニング│英単語    │ライティング│                │
│ ├──────────┼──────────┼──────────┤                 │
│ │ 📊      │ ⚙️      │ 👨‍👩‍👧  │ (Row 2)        │
│ │ 統計    │ 設定     │親向けDB   │                │
│ └──────────┴──────────┴──────────┘                 │
└──────────────────────────────────────────────────────┘

Total Height: ~700px (fits on 900px tablet screen)
```

### Welcome Header Detail

```
┌─────────────────────────────────────────┐
│ [Left]              [Right]              │
│ おはよう、             ┌─────┐           │
│ Akihiroさん！         │ Lv. │           │
│ 木 (Thu) 3月20日      │ 5  │           │
│                       └─────┘           │
│                       1250XP             │
└─────────────────────────────────────────┘

Height: 80px
Padding: 24px horizontal, 16px vertical
Font Sizes: 28px greeting, 14px date, 24px level
```

### Status Bar Detail

```
┌──────────────────┬──────────────────┬──────────────────┐
│ 🔥               │ ❤️               │ ⭐               │
│ 連続学習         │ ハート           │ 経験値           │
│ 7日             │ x3               │ 1250XP          │
└──────────────────┴──────────────────┴──────────────────┘

Height: 40px
3 Equal Sections with divider lines
Icons: 20px, Values: 12px caption + 14px body
Background: white cards with subtle shadows
```

### Daily Goals Cards Detail

```
┌────────────────┐
│                │
│       🎧      │  Icon: 24px in colored background
│   リスニング   │  Title: 13px, center aligned
│      1問       │  Count: 20px bold, center
│    ○ ○ ⚪     │  Progress dots: 6px, spaced 4px
│    +10XP      │  XP: 12px caption, primary color
│                │
└────────────────┘

Width: (screen - 48px padding) / 3 - gaps
Padding: 12px
Border: 2px, color-coded (blue, orange, red)
Min Height: 150px
```

### Learning Stats Section Detail

#### Mastery Overview

```
┌──────────────────────────────────┐
│                                  │
│            46.9%                 │  Large percentage: 48px font
│                                  │
│  ████████░░░░░░░░░             │  Progress bar: 12px height
│                                  │
│  100% | 50% | 0% | Unstarted   │  Legend row
│  🟢   │ 🟡  │ 🔴  │ ⬜         │
└──────────────────────────────────┘

Height: 140px
Color-coded: Green (80%+), Orange (50-79%), Red (<50%)
Background: White card with shadow
```

#### Skill Breakdown Rows

```
┌─ Icon ─┬──────────────────┬─ % ─┐
│   🎧   │ リスニング        │ 0% │  Header row
│        │ 0 / 10          │    │
├────────┼──────────────────┴────┤
│ ████░░░░░░░░░░░░░░░░░░░░░░  │  Progress bar: 6px height
└────────┴──────────────────────┘

Height: Each skill row = 70px
3 skills total = 210px
Colors: Blue (listening), Orange (vocab), Red (writing)
```

#### Time Estimate Cards

```
┌─────────────────────────────────┐
│ ⏱️  推定学習時間: 4～6時間      │  Icon: 28px
│                                 │  Label: 12px caption
│ 📚  本日の学習: 45分            │  Value: 14px bold
└─────────────────────────────────┘

Height: 80px total
2 Items, each 40px + spacing
Background: White card
```

### Quick Action Buttons Grid

```
┌──────────────────┬──────────────────┬──────────────────┐
│                  │                  │                  │
│       🎧        │       📚        │       ✏️         │
│   リスニング     │     英単語       │   ライティング    │
│                  │                  │                  │
├──────────────────┼──────────────────┼──────────────────┤
│                  │                  │                  │
│       📊        │       ⚙️         │      👨‍👩‍👧      │
│      統計       │      設定        │    親向けDB       │
│                  │                  │                  │
└──────────────────┴──────────────────┴──────────────────┘

Button Dimensions:
- Width: (screen - 48px - 32px gaps) / 3
- Height: 100px
- Padding: 12px
- Border: 2px, color-coded

Touch Target: 44x44px minimum (exceeded)
```

---

## Color Reference

### Mastery Levels

```
┌──────────┬────────────┬──────────────┐
│ Mastery  │ Color      │ Usage        │
├──────────┼────────────┼──────────────┤
│  80-100% │ #52C41A 🟢 │ Mastered     │
│  50-79%  │ #FAAD14 🟡 │ Learning     │
│  0-49%   │ #F5222D 🔴 │ Needs Work   │
│ Unstarted│ #E5E7EB ⬜ │ Not Started  │
└──────────┴────────────┴──────────────┘
```

### Skill Colors

```
Listening    🎧  #2563eb (Primary Blue)
Vocabulary   📚  #FAAD14 (Warning Orange)
Writing      ✏️  #F5222D (Error Red)
Statistics   📊  #52C41A (Success Green)
Settings     ⚙️  #6B7280 (Text Secondary)
Parent       👨‍👩‍👧  #2563eb (Primary Blue)
```

### Background Colors

```
Main Background:    #F9FAFB (light gray)
Card Background:    #FFFFFF (white)
Border Color:       #E5E7EB (light gray)
Text Color:         #1F2937 (dark gray)
Text Secondary:     #6B7280 (medium gray)
```

---

## Responsive Layouts

### iPad Mini / Small Tablet (600px)

```
┌──────────────────────────┐
│ WelcomeHeader  (80px)    │
├──────────────────────────┤
│ StatusBar      (40px)    │
├──────────────────────────┤
│ DailyGoals     (160px)   │
│ [3 cards, tight spacing] │
├──────────────────────────┤
│ LearningStats  (300px)   │
│ [Compact layout]         │
├──────────────────────────┤
│ QuickActions   (120px)   │
│ [2x3 grid]              │
└──────────────────────────┘
Total: ~700px (100% fits)
```

### Standard iPad (768px)

```
┌──────────────────────────────┐
│ WelcomeHeader   (80px)       │
├──────────────────────────────┤
│ StatusBar       (40px)       │
├──────────────────────────────┤
│ DailyGoals      (160px)      │
│ [3 cards, standard spacing]  │
├──────────────────────────────┤
│ LearningStats   (300px)      │
│ [Balanced layout]            │
├──────────────────────────────┤
│ QuickActions    (120px)      │
│ [2x3 grid, adequate spacing] │
└──────────────────────────────┘
Total: ~700px
Extra space: ~200px for comfortable viewing
```

### iPad Pro 11" (1024px)

```
┌─────────────────────────────────────────────┐
│ WelcomeHeader       (80px)                  │
│ [Centered, max-width: 1000px]              │
├─────────────────────────────────────────────┤
│ StatusBar           (40px)                  │
│ [Generous spacing between items]            │
├─────────────────────────────────────────────┤
│ DailyGoals          (160px)                 │
│ [Wider cards, more breathing room]         │
├─────────────────────────────────────────────┤
│ LearningStats       (300px)                 │
│ [Expanded, easier to read]                 │
├─────────────────────────────────────────────┤
│ QuickActions        (120px)                 │
│ [Larger buttons, more spacing]             │
└─────────────────────────────────────────────┘
Total: ~700px
Extra space: ~400px for spacious layout
```

### iPad Pro 12.9" (1366px)

```
┌─────────────────────────────────────────────────────┐
│ WelcomeHeader         (80px)                        │
│ [Max width: 1000px, centered with large padding]   │
├─────────────────────────────────────────────────────┤
│ StatusBar             (40px)                        │
├─────────────────────────────────────────────────────┤
│ DailyGoals            (160px)                       │
│ [Cards: ~300px wide, 150px+ height]                │
├─────────────────────────────────────────────────────┤
│ LearningStats         (300px)                       │
│ [Full breathing room, excellent readability]       │
├─────────────────────────────────────────────────────┤
│ QuickActions          (120px)                       │
│ [Largest buttons, comfortable touch]               │
└─────────────────────────────────────────────────────┘
Total: ~700px
Extra space: ~600px for premium experience
```

---

## Typography Samples

### Headers

```
┌─────────────────────────────────────────┐
│ おはよう、Akihiroさん！ (h2, 28px, 800) │
│ 今日の目標              (h5, 18px, 700) │
│ リスニング              (body, 16px, 600)│
│ 0 / 10                  (caption, 12px, 600)│
└─────────────────────────────────────────┘
```

### Text Hierarchy

```
Primary Information (headers, main values):
  - Font Size: 24-28px
  - Weight: 700-800
  - Color: #1F2937 (dark gray)

Secondary Information (labels, descriptions):
  - Font Size: 14-16px
  - Weight: 500-600
  - Color: #6B7280 (medium gray)

Tertiary Information (meta, hints):
  - Font Size: 12-13px
  - Weight: 500
  - Color: #9CA3AF (light gray)
```

---

## Component Connection Diagram

```
┌─ TabletHomeScreen ─────────────────────────────────┐
│                                                     │
│  ┌─ WelcomeHeader ────────────────────────────┐   │
│  │ user.name, level, totalXP                  │   │
│  └────────────────────────────────────────────┘   │
│                                                     │
│  ┌─ StatusBar ────────────────────────────────┐   │
│  │ streakDays, hearts, totalXP                │   │
│  └────────────────────────────────────────────┘   │
│                                                     │
│  ┌─ DailyGoalsSection ────────────────────────┐   │
│  │ Goals: listening, vocabulary, writing      │   │
│  │ Completed: from listeningProgress, etc.    │   │
│  └────────────────────────────────────────────┘   │
│                                                     │
│  ┌─ LearningStatsSection ─────────────────────┐   │
│  │ masteryPercentage: calculated from stats   │   │
│  │ skills: listening, vocabulary, writing     │   │
│  │ estimatedHours: calculated from remaining │   │
│  └────────────────────────────────────────────┘   │
│                                                     │
│  ┌─ QuickActionButtons ───────────────────────┐   │
│  │ Navigation to: listening, vocabulary, etc. │   │
│  │ onNavigate callback to router.push()       │   │
│  └────────────────────────────────────────────┘   │
│                                                     │
│  Data from Zustand Stores:                        │
│  • useLearningStore()                             │
│  • useListeningStore()                            │
│  • useVocabularyStore()                           │
│  • useWritingStore()                              │
│  • useAuthStore()                                 │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## Animation & Interaction

### Tap Feedback

```
Before Tap:        On Tap:              After Tap:
Scale: 1.0        Scale: 0.95          Scale: 1.0
Opacity: 1.0      Opacity: 0.8         Opacity: 1.0
Duration: -         Duration: 100ms      Duration: 100ms
```

### Refresh Animation

```
Initial:    Pull Down:      Loading:         Complete:
[Screen]    [Indicator      [Spinner        [Data Updated
            Shows]          Rotating]        Snap Back]
```

### Progress Bar Animation

```
Before Update:     During Update:    After Update:
████░░░░░░░░░    ████████░░░░░░   ████████░░░░░
(0-30%)          (animating)       (matches value)
Duration: 300ms
```

---

## Accessibility Features

### Touch Targets

```
Minimum Touch Target: 44x44px

Actual Touch Targets in Design:
• Goal Cards:       ~180px × 150px ✅ Excellent
• Quick Buttons:    ~200px × 100px ✅ Excellent
• Status Items:     ~200px × 40px  ✅ Good
• Progress Bars:    ~500px × 12px  ⚠️ Min threshold
```

### Color Contrast

```
Text vs Background:
• Dark Gray (#1F2937) on White (#FFFFFF):
  Contrast Ratio: 15.3:1 ✅ AAA (excellent)

• Medium Gray (#6B7280) on White (#FFFFFF):
  Contrast Ratio: 7.5:1 ✅ AA (good)

• Primary Blue (#2563eb) on White:
  Contrast Ratio: 8.6:1 ✅ AAA (excellent)
```

---

## Performance Metrics

### Component Sizes

```
TabletHomeScreen.tsx:          280 lines
WelcomeHeader.tsx:              80 lines
StatusBar.tsx:                  60 lines
DailyGoalsSection.tsx:         150 lines
LearningStatsSection.tsx:      220 lines
QuickActionButtons.tsx:        100 lines
LearningStatsDashboard.tsx:    450 lines
─────────────────────────────
Total:                       1,340 lines
```

### Bundle Impact

```
Main bundle: 3.18 MB (all 34 routes)
Per-route avg: 94 kB
New components: ~50-100 kB additional
Gzip ratio: ~30% compression
```

---

## Responsive Testing Checklist

### Visual Testing

- [ ] Header: Greeting text not cut off
- [ ] Level badge: Visible and properly positioned
- [ ] Status bar: 3 items visible and evenly spaced
- [ ] Daily goals: 3 cards in single row
- [ ] Learning stats: All sections visible
- [ ] Progress bars: Accurate widths
- [ ] Quick buttons: 2x3 grid visible
- [ ] Text: All readable, no overlap

### Interaction Testing

- [ ] Goal cards: Tap feedback visible
- [ ] Quick buttons: Navigate correctly
- [ ] Pull-to-refresh: Works smoothly
- [ ] Scroll: Smooth, no jank
- [ ] Animations: Smooth transitions
- [ ] Data: Updates reflect store changes

### Landscape Testing

- [ ] iPad landscape (1024x768): Layout adjusts
- [ ] Buttons: Still touchable
- [ ] No horizontal scroll: All content fits
- [ ] Spacing: Looks balanced

---

## Summary

This visual guide provides:

✅ ASCII diagrams of all layouts
✅ Component dimensions and spacing
✅ Color coding reference
✅ Responsive breakpoint layouts
✅ Typography samples
✅ Component connections
✅ Accessibility metrics
✅ Testing checklist

Use this for design reviews, quality assurance, and developer onboarding.
